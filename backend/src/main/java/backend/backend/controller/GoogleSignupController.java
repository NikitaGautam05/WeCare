//package backend.backend.controller;
//
//import java.util.Collections;
//import java.util.HashMap;
//import java.util.Map;
//
//import backend.backend.service.EmailService;
//import backend.backend.service.JwtService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//import backend.backend.model.Users;
//import backend.backend.service.MyUserDetailService;
//
//import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
//import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
//import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
//import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
//import com.google.api.client.json.jackson2.JacksonFactory;
//
//@RestController
//@CrossOrigin(origins = "http://localhost:5173")
//@RequestMapping("/api")
//public class GoogleSignupController {
//
//    @Autowired
//    private MyUserDetailService userService;
//    @Autowired
//    private JwtService jwtService;
//    @Autowired
//    EmailService emailService;
//
//
//    private static final String GOOGLE_CLIENT_ID = "666312206626-bp4glho27euf5tr9041vq247fr707fi5.apps.googleusercontent.com";
//
//    @PostMapping("/google-signup")
//    public Map<String, String> googleSignup(@RequestBody Map<String, String> payload) {
//
//        Map<String, String> response = new HashMap<>();
//        String token = payload.get("token");
//        String roleFromFrontend = payload.getOrDefault("role", "USER");
//
//        try {
//            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
//                    GoogleNetHttpTransport.newTrustedTransport(),
//                    JacksonFactory.getDefaultInstance()
//            ).setAudience(Collections.singletonList(GOOGLE_CLIENT_ID)).build();
//
//            GoogleIdToken idToken = verifier.verify(token);
//            if (idToken == null) {
//                response.put("error", "Invalid Google token");
//                return response;
//            }
//
//            Payload payloadData = idToken.getPayload();
//            String email = payloadData.getEmail();
//            String name = (String) payloadData.get("name");
//
//            Users user = userService.getAllUsers()
//                    .stream()
//                    .filter(u -> email.equals(u.getEmail()))
//                    .findFirst()
//                    .orElse(null);
//
//            if (user == null) { // New signup
//                user = new Users();
//                user.setEmail(email);
//                user.setUserName(name);
//                user.setPassword("");
//                user.setRole(roleFromFrontend.toUpperCase().replaceAll("\\s","")); // CAREGIVER or USER
//                userService.saveUser(user);
//            }
//
//            String jwt = jwtService.generateToken(user);
//            String needsSetup = (user.getPassword() == null || user.getPassword().isEmpty()) ? "true" : "false";
//            response.put("token", jwt);
//            response.put("role", user.getRole());
//            response.put("needsSetup", needsSetup);
//        } catch (Exception e) {
//            e.printStackTrace();
//            response.put("error", "Google authentication failed");
//        }
//
//        return response;
//    }
//
//    @PostMapping("/users/complete-google-profile")
//    public Map<String, String> completeGoogleProfile(@RequestBody Map<String, String> payload,
//                                                     @RequestHeader("Authorization") String authHeader) {
//        String token = authHeader.replace("Bearer ", "");
//        String userName = payload.get("userName");
//        String password = payload.get("password");
//
//        // Extract username/email from token
//        String email = jwtService.extractUsername(token);
//        if (email == null) {
//            return Collections.singletonMap("error", "Invalid token");
//        }
//
//        // Find user by email
//        Users user = userService.getAllUsers()
//                .stream()
//                .filter(u -> email.equals(u.getEmail()))
//                .findFirst()
//                .orElse(null);
//
//        if (user == null) {
//            return Collections.singletonMap("error", "User not found");
//        }
//
//        // Update user info
//        user.setUserName(userName);
//        user.setPassword(password); // ideally hash with BCrypt
//        userService.saveUser(user);
//
//        return Collections.singletonMap("message", "Profile completed");
//    }
//}
package backend.backend.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import backend.backend.service.EmailService;
import backend.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import backend.backend.model.Users;
import backend.backend.service.MyUserDetailService;
import org.springframework.web.multipart.MultipartFile;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api")
public class GoogleSignupController {

    @Autowired
    private MyUserDetailService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    EmailService emailService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String GOOGLE_CLIENT_ID = "666312206626-bp4glho27euf5tr9041vq247fr707fi5.apps.googleusercontent.com";

//    @PostMapping("/google-signup")
//    public Map<String, String> googleSignup(@RequestBody Map<String, String> payload) {
//
//        Map<String, String> response = new HashMap<>();
//        String token = payload.get("token");
//        String roleFromFrontend = payload.getOrDefault("role", "USER");
//
//        try {
//            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
//                    GoogleNetHttpTransport.newTrustedTransport(),
//                    JacksonFactory.getDefaultInstance()
//            ).setAudience(Collections.singletonList(GOOGLE_CLIENT_ID)).build();
//
//            GoogleIdToken idToken = verifier.verify(token);
//            if (idToken == null) {
//                response.put("error", "Invalid Google token");
//                return response;
//            }
//
//            Payload payloadData = idToken.getPayload();
//            String email = payloadData.getEmail();
//            String name = (String) payloadData.get("name");
//
//            Users user = userService.getAllUsers()
//                    .stream()
//                    .filter(u -> email.equals(u.getEmail()))
//                    .findFirst()
//                    .orElse(null);
//
//            boolean needsSetup = false;
//
//            if (user == null) { // New signup
//                user = new Users();
//                user.setEmail(email);
//                user.setUserName(""); // Will be set in quick setup
//                user.setPassword(""); // Will be set in quick setup
//                user.setRole(roleFromFrontend.toUpperCase().replaceAll("\\s","")); // CAREGIVER or USER
//                userService.saveUser(user);
//                needsSetup = true; // Show modal
//            } else if (user.getPassword() == null || user.getPassword().isEmpty()) {
//                needsSetup = true; // Existing Google user but hasn't completed profile
//            }
//
//            String jwt = jwtService.generateToken(user);
//            response.put("token", jwt);
//            response.put("role", user.getRole());
//            response.put("needsSetup", String.valueOf(needsSetup));
//            response.put("userName", user.getUserName());
//            response.put("userId", user.getId());
//        } catch (Exception e) {
//            e.printStackTrace();
//            response.put("error", "Google authentication failed");
//        }
//
//        return response;
//    }
@PostMapping("/google-signup")
public Map<String, String> googleSignup(@RequestBody Map<String, String> payload) {
    Map<String, String> response = new HashMap<>();
    String token = payload.get("token");
    String roleFromFrontend = payload.getOrDefault("role", "USER").toUpperCase().replaceAll("\\s","");
    String mode = payload.getOrDefault("mode", "SIGNUP");

    try {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance()
        ).setAudience(Collections.singletonList(GOOGLE_CLIENT_ID)).build();

        GoogleIdToken idToken = verifier.verify(token);
        if (idToken == null) {
            response.put("error", "Invalid Google token");
            return response;
        }

        Payload payloadData = idToken.getPayload();
        String email = payloadData.getEmail();

        // 1. Find existing user
        Users user = userService.getAllUsers()
                .stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst()
                .orElse(null);

        // 2. UPDATED LOGIC: If user exists, log them in using their STORED role
        if (user != null) {
            // We ignore roleFromFrontend here. If they are a CAREGIVER in the DB,
            // we log them in as a CAREGIVER even if they clicked 'User' by mistake.
            String actualRole = user.getRole();

            String jwt = jwtService.generateToken(user);
            response.put("token", jwt);
            response.put("role", actualRole); // Send back the CORRECT role from DB
            response.put("needsSetup", String.valueOf(user.getPassword() == null || user.getPassword().isEmpty()));
            response.put("userName", user.getUserName());
            response.put("userId", user.getId());
            return response;
        }

        // 3. LOGIN PROTECTION: Non-existent users can't login
        if (user == null && "LOGIN".equals(mode)) {
            response.put("error", "No account found for this email. Please Sign Up first.");
            return response;
        }

        // 4. SIGNUP: Create new user (only runs if user == null)
        user = new Users();
        user.setEmail(email);
        user.setUserName("");
        user.setPassword("");
        user.setRole(roleFromFrontend);
        userService.saveUser(user);

        String jwt = jwtService.generateToken(user);
        response.put("token", jwt);
        response.put("role", user.getRole());
        response.put("needsSetup", "true");
        response.put("userName", user.getUserName());
        response.put("userId", user.getId());

    } catch (Exception e) {
        e.printStackTrace();
        response.put("error", "Google authentication failed");
    }

    return response;
}

    // Complete profile after Google signup
//    @PostMapping("/users/complete-google-profile")
//    public ResponseEntity<?> completeGoogleProfile(
//            @RequestBody Map<String, String> payload,
//            @RequestHeader("Authorization") String authHeader) {
//
//        try {
//            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Missing Authorization Header"));
//            }
//
//            String token = authHeader.replace("Bearer ", "");
//            String email = jwtService.extractUsername(token);
//
//            if (email == null) {
//                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid or Expired Token"));
//            }
//
//            Optional<Users> userOpt = userService.getAllUsers()
//                    .stream()
//                    .filter(u -> email.equals(u.getEmail()))
//                    .findFirst();
//
//            if (userOpt.isEmpty()) {
//                return ResponseEntity.status(404).body(Collections.singletonMap("error", "User not found"));
//            }
//
//            Users user = userOpt.get();
//            String newUserName = payload.get("userName");
//            String newPassword = payload.get("password");
//
//            if (newUserName == null || newUserName.isEmpty()) {
//                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Username is required"));
//            }
//
//            // 2. FIX THIS: Encode the password before saving
//            user.setUserName(newUserName);
//            user.setPassword(passwordEncoder.encode(newPassword));
//            userService.saveUser(user);
//
//            Map<String, String> response = new HashMap<>();
//            response.put("message", "Profile setup complete!");
//            // Optional: Include userId so frontend can store it
//            response.put("userId", user.getId());
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Internal error: " + e.getMessage()));
//        }
//    }
    @PostMapping("/users/complete-google-profile")
    public ResponseEntity<Map<String, String>> completeGoogleProfile(@RequestBody Map<String, String> payload) {
        Map<String, String> resp = new HashMap<>();

        String userId = payload.get("userId");
        String userName = payload.get("userName");
        String password = payload.get("password");

        // 1. Apply the same password restrictions as the /register endpoint
        if (password == null || password.length() < 8 || !password.matches(".*[!@#$%^&*].*")) {
            resp.put("error", "Password must be at least 8 characters and include special characters");
            return ResponseEntity.badRequest().body(resp);
        }

        // 2. Find the existing user created during the initial Google sign-in
        Users user = userService.getUserById(userId);
        if (user == null) {
            resp.put("error", "User session not found");
            return ResponseEntity.badRequest().body(resp);
        }

        // 3. Check if the chosen username is already taken by another user
        boolean exists = userService.getAllUsers()
                .stream()
                .anyMatch(u -> u.getUserName().equals(userName) && !u.getId().equals(userId));
        if (exists) {
            resp.put("error", "Username already exists");
            return ResponseEntity.badRequest().body(resp);
        }

        // 4. Update and save
        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password)); // Ensure it is hashed
        userService.saveUser(user);

        // 5. Send welcome email now that the profile is officially "complete"
        try {
            emailService.signupNotification(user.getEmail(), user.getUserName());
        } catch (Exception e) {
            System.err.println("Email failed: " + e.getMessage());
        }

        resp.put("message", "Profile completed");
        resp.put("userId", user.getId());
        return ResponseEntity.ok(resp);
    }
}
