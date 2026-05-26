package backend.backend.controller;

import java.io.File;
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
import jakarta.servlet.http.HttpServletRequest;
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins={"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "https://elderease-6cuj.onrender.com"})
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

        // 1. Validate Password format
        if(user.getPassword() == null || user.getPassword().length() < 8
                || !user.getPassword().matches(".*[!@#$%^&*].*")) {
            resp.put("error", "Password must be at least 8 characters and include special characters");
            return ResponseEntity.badRequest().body(resp);
        }

        // 2. Validate Email presence
        if(user.getEmail() == null || user.getEmail().isEmpty()){
            resp.put("error", "Email is required");
            return ResponseEntity.badRequest().body(resp);
        }

        // 3. SAFE Username check (Prevents NPE)
        // Using the repository directly is faster and handles nulls in the DB safely
        if (userRepository.existsByUserName(user.getUserName())) {
            resp.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(resp);
        }

        // 4. SAFE Email check (Fixes your NullPointerException)
        // This replaces the .stream().anyMatch() logic that was crashing
        if (userRepository.existsByEmail(user.getEmail())) {
            resp.put("error", "Email already registered");
            return ResponseEntity.badRequest().body(resp);
        }

        // 5. Set default role and clean whitespace
        String role = (user.getRole() == null) ? "USER" : user.getRole().toUpperCase().replaceAll("\\s","");
        user.setRole(role);

        // 6. Secure Password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 7. Save to Database
        userService.saveUser(user);

        // 8. Send Notification (Wrapped in try-catch so registration doesn't fail if email server is down)
        try {
            emailService.signupNotification(user.getEmail(), user.getUserName());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        resp.put("message", "Registration complete");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/complete-google-profile")
    public ResponseEntity<Map<String, String>> completeGoogleProfile(@RequestBody Map<String, String> payload) {
        Map<String, String> resp = new HashMap<>();

        String userId = payload.get("userId");
        String userName = payload.get("userName");
        String password = payload.get("password");

        if (userName == null || userName.trim().isEmpty()) {
            resp.put("error", "Username is required");
            return ResponseEntity.badRequest().body(resp);
        }

        if (password == null || password.length() < 8 || !password.matches(".*[!@#$%^&*].*")) {
            resp.put("error", "Password must be at least 8 characters and include special characters");
            return ResponseEntity.badRequest().body(resp);
        }

        Users user = userService.getUserById(userId);
        if (user == null) {
            resp.put("error", "User session not found");
            return ResponseEntity.badRequest().body(resp);
        }

        boolean exists = userService.getAllUsers()
                .stream()
                .anyMatch(u -> userName.equals(u.getUserName()) && !u.getId().equals(userId));
        if (exists) {
            resp.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(resp);
        }

        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password));
        userService.saveUser(user);

        try {
            emailService.signupNotification(user.getEmail(), user.getUserName());
        } catch (Exception e) {
            System.err.println("Email failed: " + e.getMessage());
        }

        resp.put("message", "Profile completed");
        resp.put("userId", user.getId());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/change-photo")
    public ResponseEntity<Map<String, String>> changePhoto(
            @RequestParam("userId") String userId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        Map<String, String> resp = new HashMap<>();

        try {
            Users user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                resp.put("error", "User not found");
                return ResponseEntity.badRequest().body(resp);
            }

            // 1. Define the upload directory dynamically
            String uploadDirPath = System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
            Path uploadPath = Paths.get(uploadDirPath);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Save the file with a unique name
            String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // 3. Build base URL dynamically from request
            String baseUrl = request.getScheme() + "://" + request.getServerName();
            if ((request.getScheme().equals("http") && request.getServerPort() != 80) ||
                (request.getScheme().equals("https") && request.getServerPort() != 443)) {
                baseUrl += ":" + request.getServerPort();
            }

            // 4. Update User object with the URL
            String photoUrl = baseUrl + "/uploads/" + filename;
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
                .filter(u -> u.getUserName() != null && u.getUserName().equals(loginRequest.getUserName()))
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
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "serviceType", required = false) String serviceType,
            @RequestParam(value = "additionalInfo", required = false) String additionalInfo,
            @RequestParam(value = "receiverType", required = false) String receiverType,
            @RequestParam(value = "accountType", required = false) String accountType,
            @RequestParam(value = "recipientRelation", required = false) String recipientRelation,
            @RequestParam(value = "recipientAge", required = false) String recipientAge,
            @RequestParam(value = "recipientPhone", required = false) String recipientPhone,
            // Organization fields
            @RequestParam(value = "organizationName", required = false) String organizationName,
            @RequestParam(value = "foundationDate", required = false) String foundationDate,
            @RequestParam(value = "capacity", required = false) String capacity,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "website", required = false) String website,
            @RequestParam(value = "aboutOrganization", required = false) String aboutOrganization,
            @RequestParam(value = "licenseNumber", required = false) String licenseNumber,
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber,
            @RequestParam(value = "contactPersonName", required = false) String contactPersonName,
            @RequestParam(value = "contactPersonTitle", required = false) String contactPersonTitle,
            @RequestParam(value = "contactPersonPhone", required = false) String contactPersonPhone,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            Users user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("📤 POST /profile Request - userId: " + userId);
            System.out.println("📋 Received fields: address=" + address + ", serviceType=" + serviceType + ", additionalInfo=" + additionalInfo);

            // Individual profile fields
            if (address != null && !address.isEmpty()) user.setAddress(address);
            if (serviceType != null && !serviceType.isEmpty()) user.setServiceType(serviceType);
            if (additionalInfo != null && !additionalInfo.isEmpty()) user.setAdditionalInfo(additionalInfo);
            if (receiverType != null && !receiverType.isEmpty()) user.setReceiverType(receiverType);
            if (accountType != null && !accountType.isEmpty()) user.setAccountType(accountType);
            if (recipientRelation != null && !recipientRelation.isEmpty()) user.setRecipientRelation(recipientRelation);
            if (recipientAge != null && !recipientAge.isEmpty()) user.setRecipientAge(recipientAge);
            if (recipientPhone != null && !recipientPhone.isEmpty()) user.setRecipientPhone(recipientPhone);
            
            // Organization fields
            if (organizationName != null && !organizationName.isEmpty()) user.setOrganizationName(organizationName);
            if (foundationDate != null && !foundationDate.isEmpty()) user.setFoundationDate(foundationDate);
            if (capacity != null && !capacity.isEmpty()) user.setCapacity(capacity);
            if (city != null && !city.isEmpty()) user.setCity(city);
            if (phoneNumber != null && !phoneNumber.isEmpty()) user.setPhoneNumber(phoneNumber);
            if (website != null && !website.isEmpty()) user.setWebsite(website);
            if (aboutOrganization != null && !aboutOrganization.isEmpty()) user.setAboutOrganization(aboutOrganization);
            if (licenseNumber != null && !licenseNumber.isEmpty()) user.setLicenseNumber(licenseNumber);
            if (registrationNumber != null && !registrationNumber.isEmpty()) user.setRegistrationNumber(registrationNumber);
            if (contactPersonName != null && !contactPersonName.isEmpty()) user.setContactPersonName(contactPersonName);
            if (contactPersonTitle != null && !contactPersonTitle.isEmpty()) user.setContactPersonTitle(contactPersonTitle);
            if (contactPersonPhone != null && !contactPersonPhone.isEmpty()) user.setContactPersonPhone(contactPersonPhone);

            System.out.println("✅ POST /profile - After setting fields: serviceType=" + user.getServiceType() + ", additionalInfo=" + user.getAdditionalInfo());

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
            @RequestParam(value = "recipientRelation", required = false) String recipientRelation,
            @RequestParam(value = "recipientAge", required = false) String recipientAge,
            @RequestParam(value = "recipientPhone", required = false) String recipientPhone,
            @RequestParam(required = false) String accountType,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(required = false) String organizationName,
            @RequestParam(required = false) String foundationDate,
            @RequestParam(required = false) String capacity,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String website,
            @RequestParam(required = false) String aboutOrganization,
            @RequestParam(required = false) String licenseNumber,
            @RequestParam(required = false) String registrationNumber,
            @RequestParam(required = false) String contactPersonName,
            @RequestParam(required = false) String contactPersonTitle,
            @RequestParam(required = false) String contactPersonPhone) {

        try {
            Users user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().build();
            }

            System.out.println("📝 Update Request - userId: " + userId);
            System.out.println("📋 Fields: address=" + address + ", serviceType=" + serviceType + ", additionalInfo=" + additionalInfo);

            if (address != null && !address.isEmpty()) user.setAddress(address);
            if (serviceType != null && !serviceType.isEmpty()) user.setServiceType(serviceType);
            if (additionalInfo != null && !additionalInfo.isEmpty()) user.setAdditionalInfo(additionalInfo);
            if (receiverType != null && !receiverType.isEmpty()) user.setReceiverType(receiverType);
            if (recipientRelation != null && !recipientRelation.isEmpty()) user.setRecipientRelation(recipientRelation);
            if (recipientAge != null && !recipientAge.isEmpty()) user.setRecipientAge(recipientAge);
            if (recipientPhone != null && !recipientPhone.isEmpty()) user.setRecipientPhone(recipientPhone);
            
            if (accountType != null && !accountType.isEmpty()) {
                user.setAccountType(accountType);
            }

            // Set organization fields if provided
            if (organizationName != null && !organizationName.isEmpty()) user.setOrganizationName(organizationName);
            if (foundationDate != null && !foundationDate.isEmpty()) user.setFoundationDate(foundationDate);
            if (capacity != null && !capacity.isEmpty()) user.setCapacity(capacity);
            if (city != null && !city.isEmpty()) user.setCity(city);
            if (phoneNumber != null && !phoneNumber.isEmpty()) user.setPhoneNumber(phoneNumber);
            if (website != null && !website.isEmpty()) user.setWebsite(website);
            if (aboutOrganization != null && !aboutOrganization.isEmpty()) user.setAboutOrganization(aboutOrganization);
            if (licenseNumber != null && !licenseNumber.isEmpty()) user.setLicenseNumber(licenseNumber);
            if (registrationNumber != null && !registrationNumber.isEmpty()) user.setRegistrationNumber(registrationNumber);
            if (contactPersonName != null && !contactPersonName.isEmpty()) user.setContactPersonName(contactPersonName);
            if (contactPersonTitle != null && !contactPersonTitle.isEmpty()) user.setContactPersonTitle(contactPersonTitle);
            if (contactPersonPhone != null && !contactPersonPhone.isEmpty()) user.setContactPersonPhone(contactPersonPhone);

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

