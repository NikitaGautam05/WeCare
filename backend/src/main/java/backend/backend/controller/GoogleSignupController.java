package backend.backend.controller;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import backend.backend.model.Users;
import backend.backend.service.MyUserDetailService;

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

    private static final String GOOGLE_CLIENT_ID = "666312206626-sh7vgk5h08df0l9tu3ckbm9hfg0h7slb.apps.googleusercontent.com";

    @PostMapping("/google-signup")
    public String googleSignup(@RequestBody String token) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    JacksonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken != null) {
                Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Check if user already exists
                Users user = userService.getAllUsers()
                        .stream()
                        .filter(u -> u.getEmail().equals(email))
                        .findFirst()
                        .orElse(null);

                if (user == null) {
                    // Create new user
                    Users newUser = new Users();
                    newUser.setEmail(email);
                    newUser.setUserName(name);
                    newUser.setPassword(""); // optional, Google users may not need a password
                    userService.saveUser(newUser);
                    return "User registered successfully via Google!";
                } else {
                    return "User already exists, login instead.";
                }
            } else {
                return "Invalid Google token";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Google signup failed";
        }
    }
}
