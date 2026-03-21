package backend.backend.controller;

import backend.backend.model.Admin;
import backend.backend.repository.AdminRepo;
import backend.backend.service.EmailService;
import backend.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired private AdminRepo adminRepo;
    @Autowired private EmailService emailService;  // ← reuse, no duplication
    @Autowired private JwtService jwtService;      // ← reuse, no duplication

    // Temporary in-memory OTP store (same pattern as ForgetPasswordController)
    private final Map<String, String> otpStorage = new HashMap<>();

    // ── POST /api/admin/login ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req) {
        Map<String, String> resp = new HashMap<>();

        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) {
            resp.put("error", "Admin not found");
            return ResponseEntity.status(401).body(resp);
        }
        if (!admin.getPassword().equals(req.getPassword())) {
            resp.put("error", "Wrong password");
            return ResponseEntity.status(401).body(resp);
        }

        // Build a temporary Users-like object just for token generation
        backend.backend.model.Users tempUser = new backend.backend.model.Users();
        tempUser.setUserName(admin.getEmail());
        tempUser.setRole("ADMIN");

        String token = jwtService.generateToken(tempUser);
        resp.put("token", token);
        resp.put("role", "ADMIN");
        return ResponseEntity.ok(resp);
    }

    // ── POST /api/admin/forgetPassword ────────────────────────────────────
    // Frontend sends: { "email": "admin@example.com" }
    @PostMapping("/forgetPassword")
    public String forgetPassword(@RequestBody EmailRequest req) {
        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) return "Admin email not found!";

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        emailService.sendOtp(admin.getEmail(), otp);   // ← reuse EmailService.sendOtp
        otpStorage.put(admin.getEmail(), otp);

        return "OTP sent to registered email!";
    }

    // ── POST /api/admin/verify-otp ────────────────────────────────────────
    // Frontend sends: { "email": "admin@example.com", "otp": "123456" }
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody OtpRequest req) {
        String stored = otpStorage.get(req.getEmail());
        if (stored != null && stored.equals(req.getOtp())) {
            otpStorage.remove(req.getEmail());
            return "OTP verified!";
        }
        return "Invalid OTP!";
    }

    // ── POST /api/admin/reset-password ────────────────────────────────────
    // Frontend sends: { "email": "admin@example.com", "newPassword": "..." }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetRequest req) {
        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) return ResponseEntity.status(404).body("Admin not found");

        admin.setPassword(req.getNewPassword());
        adminRepo.save(admin);
        return ResponseEntity.ok("Password reset successful!");
    }

    // ── DTOs ──────────────────────────────────────────────────────────────
    public static class LoginRequest {
        private String email, password;
        public String getEmail()              { return email; }
        public void setEmail(String e)        { this.email = e; }
        public String getPassword()           { return password; }
        public void setPassword(String p)     { this.password = p; }
    }

    public static class EmailRequest {
        private String email;
        public String getEmail()              { return email; }
        public void setEmail(String e)        { this.email = e; }
    }

    public static class OtpRequest {
        private String email, otp;
        public String getEmail()              { return email; }
        public void setEmail(String e)        { this.email = e; }
        public String getOtp()                { return otp; }
        public void setOtp(String o)          { this.otp = o; }
    }

    public static class ResetRequest {
        private String email, newPassword;
        public String getEmail()              { return email; }
        public void setEmail(String e)        { this.email = e; }
        public String getNewPassword()        { return newPassword; }
        public void setNewPassword(String p)  { this.newPassword = p; }
    }
}