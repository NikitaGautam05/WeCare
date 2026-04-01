package backend.backend.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

import backend.backend.model.HistoryItems;
import backend.backend.model.Users;
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

    //    @PostMapping("/change-photo")
//    public ResponseEntity<Map<String, String>> changePhoto(
//            @RequestParam String userId,
//            @RequestParam("file") MultipartFile file) {
//
//        Map<String, String> resp = new HashMap<>();
//
//        try {
//            Users user = userRepository.findById(userId).orElse(null);
//            if (user == null) {
//                resp.put("error", "User not found");
//                return ResponseEntity.badRequest().body(resp);
//            }
//
//            // Save file locally (you can change path as needed)
//            String folder = "./uploads/";
//            Path folderPath = Paths.get(folder);
//            if (!Files.exists(folderPath)) {
//                Files.createDirectories(folderPath);
//            }
//
//            String filename = userId + "_" + file.getOriginalFilename();
//            Path filePath = folderPath.resolve(filename);
//            Files.write(filePath, file.getBytes());
//
//            // Save the file path/URL in user document
////            user.setPhoto("/uploads/" + filename); // or your public URL if hosted
////            userRepository.save(user);
//
////            resp.put("message", "Photo updated successfully");
////            resp.put("photoUrl", user.getPhoto());
////            return ResponseEntity.ok(resp);
//
//        } catch (Exception e) {
//            resp.put("error", "Failed to upload photo: " + e.getMessage());
//            return ResponseEntity.status(500).body(resp);
//        }
//    }
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
        userService.saveUser(user);

        try {
            emailService.signupNotification(user.getEmail(), user.getUserName());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        resp.put("message", "Registration complete");
        return ResponseEntity.ok(resp);
    }

//    @PostMapping("/register-with-photo")
//    public ResponseEntity<Map<String, String>> registerWithPhoto(
//            @RequestParam String email,
//            @RequestParam String userName,
//            @RequestParam String password,
//            @RequestParam String role,
//            @RequestParam("photo") MultipartFile photo) {
//
//        Map<String, String> resp = new HashMap<>();
//
//        // Validate password
//        if (password == null || password.length() < 8 || !password.matches(".*[!@#$%^&*].*")) {
//            resp.put("error", "Password must be at least 8 characters and include special characters");
//            return ResponseEntity.badRequest().body(resp);
//        }
//
//        // Validate email
//        if (email == null || email.isEmpty()) {
//            resp.put("error", "Email is required");
//            return ResponseEntity.badRequest().body(resp);
//        }
//
//        // Check if username exists
//        boolean exists = userService.getAllUsers()
//                .stream()
//                .anyMatch(u -> u.getUserName().equals(userName));
//        if (exists) {
//            resp.put("error", "Username already exists");
//            return ResponseEntity.badRequest().body(resp);
//        }
//
//        // Check if email exists
//        boolean emailExists = userService.getAllUsers()
//                .stream()
//                .anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
//        if (emailExists) {
//            resp.put("error", "Email already registered");
//            return ResponseEntity.badRequest().body(resp);
//        }
//
//        // Create user
//        Users user = new Users();
//        user.setEmail(email);
//        user.setUserName(userName);
//        user.setPassword(password);
//        user.setRole(role == null ? "USER" : role.toUpperCase().replaceAll("\\s", ""));
//
//        // Save user first to get ID
//        Users savedUser = userService.saveUser(user);
//
//        // Handle photo upload
//        try {
//            String folder = "./uploads/";
//            Path folderPath = Paths.get(folder);
//            if (!Files.exists(folderPath)) {
//                Files.createDirectories(folderPath);
//            }
//
//            String filename = savedUser.getId() + "_" + photo.getOriginalFilename();
//            Path filePath = folderPath.resolve(filename);
//            Files.write(filePath, photo.getBytes());
//
//            // Set photo path
//            savedUser.setPhoto("/uploads/" + filename);
//            userRepository.save(savedUser);
//
//        } catch (Exception e) {
//            // If photo upload fails, delete the user?
//            userService.deleteUsers(savedUser);
//            resp.put("error", "Failed to upload photo: " + e.getMessage());
//            return ResponseEntity.status(500).body(resp);
//        }
//
//        // Send email
//        try {
//            emailService.signupNotification(user.getEmail(), user.getUserName());
//        } catch (Exception e) {
//            System.err.println("Failed to send welcome email: " + e.getMessage());
//        }
//
//        resp.put("message", "Registration complete");
//        return ResponseEntity.ok(resp);
//    }


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

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            response.put("error", "Wrong password");
            return response;
        }

        String token = jwtService.generateToken(user);
        response.put("token", token);
        response.put("role", user.getRole()); // CAREGIVER or USER
        response.put("userId",user.getId());
        response.put("userName",user.getUserName());
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
        if (!user.getPassword().equals(currentPassword)) {
            resp.put("error", "Current password is incorrect");
            return ResponseEntity.badRequest().body(resp);
        }

        // Update password
        user.setPassword(newPassword);
        userService.updateUser(user);

        resp.put("message", "Password updated successfully");
        return ResponseEntity.ok(resp);
    }
    // Update email for a specific username
    @PutMapping("/api/update-email")
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
}
