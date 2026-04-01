package backend.backend.controller;

import backend.backend.repository.UserRepo;
import backend.backend.model.Users;
import backend.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class ForgetPasswordController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepo userRepo;

    // Temporary in-memory OTP storage (use DB/Redis in production)
    private Map<String, String> otpStorage = new HashMap<>();
    private Map<String, Boolean> verifiedUsers = new HashMap<>();
    @PostMapping("/forgetPassword")
    public String forgetPassword(@RequestBody UsernameRequest request) {
        Users user = userRepo.findByUserName(request.getUsername());
        if (user == null) {
            return "Username not found!";
        }

        // Generate OTP
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        // Send OTP email
        emailService.sendOtp(user.getEmail(), otp);

        // Store OTP temporarily
        otpStorage.put(user.getUserName(), otp);

        return "OTP sent to registered email!";
    }


    // DTO for username input
    public static class UsernameRequest {
        private String username;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    // Endpoint to verify OTP
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody VerifyOtpRequest request) {
        String storedOtp = otpStorage.get(request.getUsername());
        verifiedUsers.put(request.getUsername(), true);
        if (storedOtp != null && storedOtp.equals(request.getOtp())) {
            otpStorage.remove(request.getUsername()); // remove OTP after verification
            return "OTP verified!";
        }
        return "Invalid OTP!";
    }
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetRequest request) {
        // 1. Security Check: Did they actually verify the OTP?
        if (!verifiedUsers.getOrDefault(request.getUsername(), false)) {
            return "Please verify OTP first!";
        }

        // 2. Find the user
        Users user = userRepo.findByUserName(request.getUsername());
        if (user == null) return "User no longer exists!";

        // 3. Update ONLY the password
        user.setPassword(request.getNewPassword()); // Use passwordEncoder.encode() here!

        // 4. Save to DB
        userRepo.save(user);

        // 5. Cleanup
        verifiedUsers.remove(request.getUsername());
        return "Password updated successfully!";
    }

    // DTO for OTP verification
    public static class VerifyOtpRequest {
        private String username;
        private String otp;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }
    public static class ResetRequest {
        private String username;
        private String newPassword;
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
