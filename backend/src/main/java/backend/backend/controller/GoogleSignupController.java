
package backend.backend.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

import backend.backend.model.Caregiver;
import backend.backend.model.Users;
import backend.backend.repository.CaregiverRepository;
import backend.backend.service.JwtService;
import backend.backend.service.MyUserDetailService;

@RestController
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "https://elderease-6cuj.onrender.com"
})
@RequestMapping("/api")
public class GoogleSignupController {

    @Autowired
    private MyUserDetailService userService;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private CaregiverRepository caregiverRepository;

    private static final String GOOGLE_CLIENT_ID = "666312206626-bp4glho27euf5tr9041vq247fr707fi5.apps.googleusercontent.com";


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
            response.put("email", email);
            
            // If user is a CAREGIVER, also return the caregiverId
            if ("CAREGIVER".equalsIgnoreCase(actualRole)) {
                System.out.println("🔍 Google User is CAREGIVER. Looking for caregiver profile...");
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
        response.put("email", email);

    } catch (Exception e) {
        System.err.println("Google authentication failed: " + e.getMessage());
        response.put("error", "Google authentication failed");
    }

    return response;
}


}
