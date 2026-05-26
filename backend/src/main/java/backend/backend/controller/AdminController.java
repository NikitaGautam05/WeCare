package backend.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.backend.model.Admin;
import backend.backend.model.Caregiver;
import backend.backend.model.CaregiverStatus;
import backend.backend.model.Notification;
import backend.backend.repository.AdminRepo;
import backend.backend.repository.NotificationRepository;
import backend.backend.repository.UserRepo;
import backend.backend.service.CaregiverService;
import backend.backend.service.EmailService;
import backend.backend.service.JwtService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://elderease-6cuj.onrender.com"
})
public class AdminController {

    @Autowired private AdminRepo adminRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private EmailService emailService;
    @Autowired private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private CaregiverService caregiverService;

    // Temporary in-memory OTP store (same pattern as ForgetPasswordController)
    private final Map<String, String> otpStorage = new HashMap<>();

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest req) {
        Map<String, String> resp = new HashMap<>();

        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) {
            resp.put("error", "Admin not found");
            return ResponseEntity.status(401).body(resp);
        }
        boolean passwordMatches = passwordEncoder.matches(req.getPassword(), admin.getPassword());
        if (!passwordMatches && req.getPassword().equals(admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(req.getPassword()));
            adminRepo.save(admin);
            passwordMatches = true;
        }
        if (!passwordMatches) {
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

    @PostMapping("/forgetPassword")
    public ResponseEntity<String> forgetPassword(@RequestBody EmailRequest req) {
        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) {
            return ResponseEntity.status(404).body("Admin email not found!");
        }

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        try {
            emailService.sendOtp(admin.getEmail(), otp);   // ← reuse EmailService.sendOtp
            otpStorage.put(admin.getEmail(), otp);
            System.out.println("[Admin OTP] email=" + admin.getEmail() + " otp=" + otp);
            return ResponseEntity.ok("OTP sent to registered email!");
        } catch (Exception e) {
            System.err.println("Failed to send admin OTP email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to send OTP email. Please check server logs and email configuration.");
        }
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody OtpRequest req) {
        String stored = otpStorage.get(req.getEmail());
        if (stored != null && stored.equals(req.getOtp())) {
            otpStorage.remove(req.getEmail());
            return "OTP verified!";
        }
        return "Invalid OTP!";
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required.");
        }
        if (req.getNewPassword() == null || req.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body("New password is required.");
        }

        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) {
            return ResponseEntity.status(404).body("Admin not found");
        }

        try {
            admin.setPassword(passwordEncoder.encode(req.getNewPassword()));
            adminRepo.save(admin);
            return ResponseEntity.ok("Password reset successful!");
        } catch (Exception e) {
            System.err.println("Failed to reset admin password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Unable to reset password right now. Please try again later.");
        }
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
    @PutMapping("/caregivers/{id}/verify")
    public Caregiver verifyCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if(caregiver == null){
            throw new RuntimeException("Caregiver not found");
        }

        caregiver.setStatus(CaregiverStatus.VERIFIED);
        Caregiver saved = caregiverService.saveCaregiver(caregiver);

        try {
            emailService.sendCaregiverVerifiedEmail(
                    saved.getEmail(),
                    saved.getFullName()
            );

            Notification notification = new Notification(
                    saved.getUserId(),
                    "admin",
                    "Admin",
                    "CAREGIVER_VERIFIED",
                    "Caregiver profile approved",
                    "Your caregiver profile has been approved and is now live on ElderEase."
            );
            notification.setActionId(saved.getId());
            notificationRepository.save(notification);

            String notificationJson = String.format(
                    "{\"userId\":\"%s\",\"type\":\"verified\",\"message\":\"Your caregiver profile is now verified and live on ElderEase.\"}",
                    saved.getUserId()
            );
            saved.getNotifications().add(notificationJson);
            saved = caregiverService.saveCaregiver(saved);
        } catch (Exception e) {
            System.err.println("Failed to send verification email/notification for caregiver: " + e.getMessage());
        }

        return saved;
    }
    @PutMapping("/caregivers/{id}/block")
    public Caregiver blockCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        caregiver.setStatus(CaregiverStatus.BLOCKED);

        return caregiverService.saveCaregiver(caregiver);
    }
    @PutMapping("/caregivers/{id}/unblock")
    public Caregiver unblockCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        caregiver.setStatus(CaregiverStatus.VERIFIED);

        return caregiverService.saveCaregiver(caregiver);
    }
    @GetMapping("/reported")
    public List<Caregiver> getReportedCaregivers() {
        return caregiverService.getReportedCaregivers();
    }

    @GetMapping("/pending")
    public List<Caregiver> getPending(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.PENDING);
    }
    @GetMapping("/verified")
    public List<Caregiver> getVerified(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.VERIFIED);
    }
    @GetMapping("/blocked")
    public List<Caregiver> getBlocked(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.BLOCKED);
    }
}