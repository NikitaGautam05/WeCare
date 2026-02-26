package backend.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import backend.backend.service.EmailService;
import backend.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import backend.backend.model.Users;
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

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody Users user) {
        Map<String, String> resp = new HashMap<>();

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
        return response;
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
}
