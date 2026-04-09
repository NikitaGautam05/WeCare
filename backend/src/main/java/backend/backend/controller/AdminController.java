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
import backend.backend.repository.AdminRepo;
import backend.backend.service.CaregiverService;
import backend.backend.service.EmailService;
import backend.backend.service.JwtService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired private AdminRepo adminRepo;
    @Autowired private EmailService emailService;  // ← reuse, no duplication
    @Autowired private JwtService jwtService;      // ← reuse, no duplication
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
    public String forgetPassword(@RequestBody EmailRequest req) {
        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) return "Admin email not found!";

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);
        emailService.sendOtp(admin.getEmail(), otp);   // ← reuse EmailService.sendOtp
        otpStorage.put(admin.getEmail(), otp);

        return "OTP sent to registered email!";
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
        Admin admin = adminRepo.findByEmail(req.getEmail());
        if (admin == null) return ResponseEntity.status(404).body("Admin not found");

        admin.setPassword(passwordEncoder.encode(req.getNewPassword()));
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
    @PutMapping("/caregivers/{id}/verify")
    public Caregiver verifyCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if(caregiver == null){
            throw new RuntimeException("Caregiver not found");
        }

        caregiver.setStatus(CaregiverStatus.VERIFIED);

        return caregiverService.saveCaregiver(caregiver);
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