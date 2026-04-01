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
    String mode = payload.getOrDefault("mode", "SIGNUP"); // Get the mode from React

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

        // 1. Find the existing user
        Users user = userService.getAllUsers()
                .stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst()
                .orElse(null);

        // 2. ROLE LOCK: If user exists, check if their stored role matches what they picked now
        if (user != null) {
            if (!user.getRole().equalsIgnoreCase(roleFromFrontend)) {
                response.put("error", "This email is already registered as a " + user.getRole() +
                        ". You cannot use it for a " + roleFromFrontend + " account.");
                return response;
            }
        }

        // 3. LOGIN PROTECTION: If user doesn't exist and they are on the LOGIN page, don't create them
        if (user == null && "LOGIN".equals(mode)) {
            response.put("error", "No account found for this email. Please Sign Up first.");
            return response;
        }

        // 4. SIGNUP: Create new user if they don't exist
        boolean needsSetup = false;
        if (user == null) {
            user = new Users();
            user.setEmail(email);
            user.setUserName("");
            user.setPassword("");
            user.setRole(roleFromFrontend);
            userService.saveUser(user);
            needsSetup = true;
        } else if (user.getPassword() == null || user.getPassword().isEmpty()) {
            needsSetup = true;
        }

        String jwt = jwtService.generateToken(user);
        response.put("token", jwt);
        response.put("role", user.getRole());
        response.put("needsSetup", String.valueOf(needsSetup));
        response.put("userName", user.getUserName());
        response.put("userId", user.getId());

    } catch (Exception e) {
        e.printStackTrace();
        response.put("error", "Google authentication failed");
    }

    return response;
}

    // Complete profile after Google signup
    @PostMapping("/users/complete-google-profile")
    public ResponseEntity<?> completeGoogleProfile(
            @RequestBody Map<String, String> payload,
            @RequestHeader("Authorization") String authHeader) {

        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Unauthorized"));
            }

            String token = authHeader.replace("Bearer ", "");
            String email = jwtService.extractUsername(token);

            if (email == null) {
                return ResponseEntity.status(401).body(Collections.singletonMap("error", "Invalid token payload"));
            }

            Optional<Users> userOpt = userService.getAllUsers()
                    .stream()
                    .filter(u -> email.equals(u.getEmail()))
                    .findFirst();

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Collections.singletonMap("error", "User not found"));
            }

            Users user = userOpt.get();
            String newUserName = payload.get("userName");
            String newPassword = payload.get("password");

            if (newUserName == null || newUserName.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Username is required"));
            }

            user.setUserName(newUserName);
            user.setPassword(newPassword); // Hint: use passwordEncoder.encode(newPassword) if using Security
            userService.saveUser(user);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile setup complete!");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Internal error: " + e.getMessage()));
        }
    }
}
