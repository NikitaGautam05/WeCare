package backend.backend.controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import backend.backend.service.EmailService;
import backend.backend.service.JwtService;
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
    @Autowired
    private JwtService jwtService;
    @Autowired
    EmailService emailService;


    private static final String GOOGLE_CLIENT_ID = "666312206626-bp4glho27euf5tr9041vq247fr707fi5.apps.googleusercontent.com";

    @PostMapping("/google-signup")
    public Map<String, String> googleSignup(@RequestBody Map<String, String> payload) {

        Map<String, String> response = new HashMap<>();
        String token = payload.get("token");
        String roleFromFrontend = payload.getOrDefault("role", "USER");

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
            String name = (String) payloadData.get("name");

            Users user = userService.getAllUsers()
                    .stream()
                    .filter(u -> email.equals(u.getEmail()))
                    .findFirst()
                    .orElse(null);

            if (user == null) { // New signup
                user = new Users();
                user.setEmail(email);
                user.setUserName(name);
                user.setPassword("");
                user.setRole(roleFromFrontend.toUpperCase().replaceAll("\\s","")); // CAREGIVER or USER
                userService.saveUser(user);
            }

            String jwt = jwtService.generateToken(user);
            response.put("token", jwt);
            response.put("role", user.getRole());

        } catch (Exception e) {
            e.printStackTrace();
            response.put("error", "Google authentication failed");
        }

        return response;
    }



}
