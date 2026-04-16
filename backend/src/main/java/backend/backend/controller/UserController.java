package backend.backend.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backend.backend.model.Caregiver;
import backend.backend.model.HistoryItems;
import backend.backend.model.Users;
import backend.backend.repository.CaregiverRepository;
import backend.backend.repository.UserRepo;
import backend.backend.service.EmailService;
import backend.backend.service.JwtService;
import backend.backend.service.MyUserDetailService;
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins="http://localhost:5173")
public class UserController {

    @Autowired
    MyUserDetailService userService;

    @Autowired
    private JwtService jwtService;
    @Autowired
    EmailService emailService;
    @Autowired
    UserRepo userRepository;
    @Autowired
    private CaregiverRepository caregiverRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public List<Users> getAllUser() {
        return userService.getAllUsers();
    }

    @PostMapping("/save")
    public Users saveUser(@RequestBody Users user) {
        return userService.saveUser(user);
    }

    @PutMapping("/update")
    public Users updateUser(@RequestBody Users user) {
        return userService.updateUser(user);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable String id) {
        Users user = new Users();
        user.setId(id);
        userService.deleteUsers(user);
        return "User deleted successfully";
    }

    @GetMapping("/user/{username}")
    public Users getUserByUsername(@PathVariable String username) {
        return userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(username))
                .findFirst()
                .orElse(null);
    }

    @GetMapping("/{id}")
    public Users getUserById(@PathVariable String id) {
        return userRepository.findById(id).orElse(null);
    }


    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Users user) {
        Map<String, String> resp = new HashMap<>();
        if(user.getPassword() == null || user.getPassword().length() < 8
                || !user.getPassword().matches(".*[!@#$%^&*].*")) {
            resp.put("error", "Password must be at least 8 characters and include special characters");
            return ResponseEntity.badRequest().body(resp);
        }
        if(user.getEmail() == null || user.getEmail().isEmpty()){
            resp.put("error", "Email is required");
            return ResponseEntity.badRequest().body(resp);
        }

        boolean exists = userService.getAllUsers()
                .stream()
                .anyMatch(u -> u.getUserName().equals(user.getUserName()));
        if (exists) {
            resp.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(resp);
        }
        boolean emailExists=userService.getAllUsers().stream().anyMatch(u->u.getEmail().equalsIgnoreCase(user.getEmail()));
        if (emailExists){
            resp.put("error","email already regsitered");
            return ResponseEntity.badRequest().body(resp);
        }

        user.setRole(user.getRole() == null ? "USER" : user.getRole().toUpperCase().replaceAll("\\s",""));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userService.saveUser(user);

        try {
            emailService.signupNotification(user.getEmail(), user.getUserName());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        resp.put("message", "Registration complete");
        return ResponseEntity.ok(resp);
    }
    @PostMapping("/change-photo")
    public ResponseEntity<Map<String, String>> changePhoto(
            @RequestParam("userId") String userId,
            @RequestParam("file") MultipartFile file) {

        Map<String, String> resp = new HashMap<>();

        try {
            Users user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                resp.put("error", "User not found");
                return ResponseEntity.badRequest().body(resp);
            }

            // 1. Define the upload directory
            String uploadDir = "uploads/";
            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Save the file with a unique name
            String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // 3. Update User object with the URL
            // This URL matches the Resource Handler we will create in step 2
            String photoUrl = "http://localhost:8080/uploads/" + filename;
            user.setPhoto(photoUrl);
            userRepository.save(user);

            resp.put("message", "Photo updated successfully");
            resp.put("photoUrl", photoUrl);
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            resp.put("error", "Failed to upload photo: " + e.getMessage());
            return ResponseEntity.status(500).body(resp);
        }
    }


    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Users loginRequest) {
        Users user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(loginRequest.getUserName()))
                .findFirst()
                .orElse(null);

        Map<String, String> response = new HashMap<>();

        if (user == null) {
            response.put("error", "User not found");
            return response;
        }

        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (!passwordMatches && loginRequest.getPassword().equals(user.getPassword())) {
            // Upgrade legacy plain-text password to bcrypt without forcing a reset
            user.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
            userRepository.save(user);
            passwordMatches = true;
        }

        if (!passwordMatches) {
            response.put("error", "Wrong password");
            return response;
        }

        String token = jwtService.generateToken(user);
        response.put("token", token);
        response.put("role", user.getRole()); // CAREGIVER or USER
        response.put("userId", user.getId());
        response.put("userName", user.getUserName());
        response.put("email", user.getEmail() != null ? user.getEmail() : "");
        
        // If user is a CAREGIVER, also return the caregiverId
        if ("CAREGIVER".equalsIgnoreCase(user.getRole())) {
            System.out.println("🔍 User is CAREGIVER. Looking for caregiver profile...");
            System.out.println("📝 UserId: " + user.getId());
            Caregiver caregiver = caregiverRepository.findByUserId(user.getId());
            System.out.println("🔎 Caregiver found: " + (caregiver != null ? caregiver.getId() : "NULL"));
            if (caregiver != null) {
                System.out.println("✅ Adding caregiverId to response: " + caregiver.getId());
                response.put("caregiverId", caregiver.getId());
            } else {
                System.out.println("❌ No caregiver profile found for userId: " + user.getId());
            }
        }
        
        return response;
    }
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestParam String username,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {

        Map<String, String> resp = new HashMap<>();

        // Find the user
        Users user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(username))
                .findFirst()
                .orElse(null);

        if (user == null) {
            resp.put("error", "User not found");
            return ResponseEntity.badRequest().body(resp);
        }

        // Check current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            resp.put("error", "Current password is incorrect");
            return ResponseEntity.badRequest().body(resp);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.updateUser(user);

        resp.put("message", "Password updated successfully");
        return ResponseEntity.ok(resp);
    }
    // Update email for a specific username
    @PutMapping("/update-email")
    public String updateEmail(@RequestParam String username, @RequestParam String email) {
        Users user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(username))
                .findFirst()
                .orElse(null);

        if (user == null) return "User not found";

        user.setEmail(email);
        userService.updateUser(user); // saves updated email
        return "Email updated successfully for " + username;
    }
    @PostMapping("/add-favorite")
    public Users addFavorite(@RequestParam String userId,
                             @RequestParam String caregiverId) {

        Users user = userRepository.findById(userId).orElseThrow();

        // Trim and avoid duplicates
        String trimmedId = caregiverId.trim();
        if (!user.getFavourites().contains(trimmedId)) {
            user.getFavourites().add(trimmedId);
        }

        return userRepository.save(user);
    }
    @PostMapping("/add-history")
    public Users addHistory(@RequestParam String userId,
                            @RequestParam String caregiverId,
                            @RequestParam String action) {

        Users user = userRepository.findById(userId).orElseThrow();

        HistoryItems item = new HistoryItems();
        item.setCaregiverId(caregiverId);
        item.setAction(action);
        item.setTimestamp(java.time.LocalDateTime.now().toString());

        user.getHistory().add(item);

        return userRepository.save(user);
    }
    @GetMapping("/favorites/{userId}")
    public List<String> getFavorites(@PathVariable String userId) {
        Users user = userRepository.findById(userId).orElseThrow();
        return user.getFavourites();
    }
    @PostMapping("/remove-favorite")
    public Users removeFavorite(@RequestParam String userId,
                                @RequestParam String caregiverId) {

        Users user = userRepository.findById(userId).orElseThrow();

        // Trim before removing
        user.getFavourites().removeIf(favId -> favId.equals(caregiverId.trim()));

        return userRepository.save(user);
    }
    // @GetMapping("/{id}")
    // public ResponseEntity<Users> getUserById(@PathVariable String id) {
    //     return userRepository.findById(id)
    //             .map(ResponseEntity::ok)
    //             .orElse(ResponseEntity.notFound().build());
    // }

    // ── User Care Profile Endpoints ──
    @PostMapping("/profile")
    public ResponseEntity<Users> createUserProfile(
            @RequestParam("userId") String userId,
            @RequestParam("address") String address,
            @RequestParam("serviceType") String serviceType,
            @RequestParam("additionalInfo") String additionalInfo,
            @RequestParam("receiverType") String receiverType,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            Users user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            user.setAddress(address);
            user.setServiceType(serviceType);
            user.setAdditionalInfo(additionalInfo);
            user.setReceiverType(receiverType);

            // Handle photo upload if provided
            if (photo != null && !photo.isEmpty()) {
                String uploadDir = "uploads/";
                Path uploadPath = Paths.get(uploadDir);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String filename = userId + "_profile_" + System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(photo.getInputStream(), filePath);
                user.setPhoto(filename);
            }

            Users savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/update/{userId}")
    public ResponseEntity<Users> updateUserProfile(
            @PathVariable String userId,
            @RequestParam("address") String address,
            @RequestParam("serviceType") String serviceType,
            @RequestParam("additionalInfo") String additionalInfo,
            @RequestParam("receiverType") String receiverType,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            Users user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            user.setAddress(address);
            user.setServiceType(serviceType);
            user.setAdditionalInfo(additionalInfo);
            user.setReceiverType(receiverType);

            // Handle photo upload if provided
            if (photo != null && !photo.isEmpty()) {
                String uploadDir = "uploads/";
                Path uploadPath = Paths.get(uploadDir);

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String filename = userId + "_profile_" + System.currentTimeMillis() + "_" + photo.getOriginalFilename();
                Path filePath = uploadPath.resolve(filename);
                Files.copy(photo.getInputStream(), filePath);
                user.setPhoto(filename);
            }

            Users savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}

