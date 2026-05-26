package backend.backend.controller;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backend.backend.model.AcceptedRequest;
import backend.backend.model.Caregiver;
import backend.backend.model.CaregiverStatus;
import backend.backend.model.InterestRequest;
import backend.backend.model.Notification;
import backend.backend.model.Users;
import backend.backend.repository.AcceptedRequestRepository;
import backend.backend.repository.InterestRequestRepository;
import backend.backend.repository.NotificationRepository;
import backend.backend.repository.UserRepo;
import backend.backend.service.CaregiverService;
import backend.backend.service.EmailService;

@RestController
@RequestMapping("/api/caregivers")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://elderease-6cuj.onrender.com"
})
public class CaregiverController {
    @Autowired
    private CaregiverService caregiverService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private InterestRequestRepository interestRequestRepository;
    @Autowired
    private AcceptedRequestRepository acceptedRequestRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    
    // Get dynamic upload directory based on current working directory
    private String getUploadDir() {
        return System.getProperty("user.dir") + File.separator + "uploads" + File.separator;
    }
    @PostMapping("/add")
    public Caregiver addCaregiver(
            @RequestParam String userId,  // <-- userId first
            @RequestParam("profilePhoto") MultipartFile profilePhoto,
            @RequestParam("citizenshipPhoto") MultipartFile citizenshipPhoto,
            @RequestParam String fullName,
            @RequestParam String address,
            @RequestParam String phoneNumber,
            @RequestParam String gender,

//            @RequestParam String email,
            @RequestParam String details,
            @RequestParam String experience,
            @RequestParam String speciality,
            @RequestParam String chargeMin,
            @RequestParam String chargeMax,
            @RequestParam(required = false) String certification,
            @RequestParam(required = false) MultipartFile certificatePhoto
    ) throws IOException {
        Caregiver existing = caregiverService.getByUserId(userId);
        if (existing != null) {
            throw new RuntimeException("User already has profile!");
        }

        System.out.println("📝 addCaregiver - gender received: '" + gender + "'");

        // Ensure upload folder exists
        String uploadDirPath = getUploadDir();
        File uploadFolder = new File(uploadDirPath);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            if (!created) {
                throw new IOException("Could not create upload directory: " + uploadDirPath);
            }
        }

        // Generate unique filenames with spaces replaced
        // --- 3. Generate unique filenames ---
        String profileFileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename().replaceAll("\\s+", "_");
        String citizenshipFileName = System.currentTimeMillis() + "_" + citizenshipPhoto.getOriginalFilename().replaceAll("\\s+", "_");

        // --- 4. Save files ---
        try {
            profilePhoto.transferTo(new File(uploadFolder, profileFileName));
            citizenshipPhoto.transferTo(new File(uploadFolder, citizenshipFileName));
        } catch (IOException e) {
            throw new IOException("Error saving uploaded files", e);
        }

        // --- 5. Build caregiver object ---
        Caregiver caregiver = new Caregiver();
        caregiver.setUserId(userId);  // <-- set userId here
        caregiver.setFullName(fullName);
        caregiver.setAddress(address);
        caregiver.setPhoneNumber(phoneNumber);
        caregiver.setGender(gender);
        System.out.println("✅ Caregiver created with gender: '" + gender + "'");
        Users user = userRepo.findById(userId).orElseThrow();
        caregiver.setEmail(user.getEmail());
//        caregiver.setEmail(email);
        caregiver.setDetails(details);
        caregiver.setExperience(experience);
        caregiver.setSpeciality(speciality);
        caregiver.setChargeMin(chargeMin);
        caregiver.setChargeMax(chargeMax);
        caregiver.setCertification(certification);
        caregiver.setProfilePhoto(profileFileName);
        caregiver.setCitizenshipPhoto(citizenshipFileName);

        if (certificatePhoto != null && !certificatePhoto.isEmpty()) {
            String certificateFileName = System.currentTimeMillis() + "_" + certificatePhoto.getOriginalFilename().replaceAll("\\s+", "_");
            certificatePhoto.transferTo(new File(uploadFolder, certificateFileName));
            caregiver.setCertificatePhoto(certificateFileName);
        }

        // --- 6. Save to MongoDB ---
        Caregiver saved = caregiverService.saveCaregiver(caregiver);
        System.out.println("Caregiver saved with ID: " + saved.getId());

        try {
            String adminSubject = "New caregiver signup awaiting approval";
            String adminBody = "A new caregiver has submitted a profile and is pending admin approval.\n\n"
                    + "Name: " + saved.getFullName() + "\n"
                    + "Email: " + saved.getEmail() + "\n"
                    + "Speciality: " + saved.getSpeciality() + "\n"
                    + "Status: " + saved.getStatus() + "\n\n"
                    + "Please review the caregiver on the admin dashboard.";
            emailService.sendAdminAlert(adminSubject, adminBody);

            Notification adminNotification = new Notification(
                    "admin",
                    saved.getUserId(),
                    saved.getFullName(),
                    "ADMIN_NEW_CAREGIVER",
                    "New caregiver pending approval",
                    "New caregiver " + saved.getFullName() + " has submitted their profile and awaits verification."
            );
            adminNotification.setActionId(saved.getId());
            notificationRepository.save(adminNotification);
        } catch (Exception e) {
            System.out.println("Failed to send admin notification for new caregiver signup: " + e.getMessage());
        }

        return saved;
    }
    @GetMapping("/verified")
    public List<Caregiver> getVerifiedCaregivers(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.VERIFIED);
    }

    @GetMapping("/all")
    public List<Caregiver> getAllCaregivers() {
        return caregiverService.getAllCaregivers();
    }
    @GetMapping("/test")
    public String testDb() {
        long count = caregiverService.getAllCaregivers().size();
        return "Caregiver collection has " + count + " documents";
    }
    @GetMapping("/{id}")
    public Caregiver getCaregiverByIdEndpoint(@PathVariable String id) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        if (caregiver == null) throw new RuntimeException("Caregiver not found");
        return caregiver;
    }
    @PostMapping("/{id}/notify")
    public Caregiver notifyCaregiver(
            @PathVariable String id,
            @RequestParam String message,
            @RequestParam String userId
    ) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if (caregiver == null) {
            throw new RuntimeException("Caregiver not found");
        }

        // Save notification
        String notificationJson = String.format("{\"userId\":\"%s\",\"type\":\"general\",\"message\":\"%s\"}", userId, message);
        caregiver.getNotifications().add(notificationJson);

        // Get USER details
        Users user = userRepo.findById(userId).orElseThrow();

        // Send EMAIL
        emailService.sendInterestEmail(
                caregiver.getEmail(),
                user.getUserName(),
                user.getEmail()
        );

        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/{id}/interest")
    public ResponseEntity<?> handleInterest(@PathVariable String id, @RequestBody Map<String, String> request) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        String interestedUserId = request.get("userId");
        Users interestedUser = userRepo.findById(interestedUserId).orElse(null);

        if (caregiver != null && interestedUser != null) {
            String name = interestedUser.getUserName();

            // Ensure the interest request is stored for the caregiver.
            List<InterestRequest> existing = interestRequestRepository.findByCaregiverIdAndUserId(id, interestedUserId);
            if (existing.isEmpty()) {
                InterestRequest newInterest = new InterestRequest(id, caregiver.getFullName(), interestedUserId, name);
                interestRequestRepository.save(newInterest);
            }

            // 1. Send the Email
            emailService.sendInterestEmail(
                    caregiver.getEmail(),
                    name,
                    interestedUser.getEmail()
            );

            // 2. Add to Caregiver's notification list
            String notificationJson = String.format("{\"userId\":\"%s\",\"type\":\"interest\",\"message\":\"New interest from %s\"}", interestedUserId, name);
            caregiver.getNotifications().add(notificationJson);
            caregiverService.saveCaregiver(caregiver);

            return ResponseEntity.ok("Interest sent successfully");
        }
        return ResponseEntity.status(404).body("Caregiver or User not found");
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<Caregiver> getByUserId(@PathVariable String userId) {
        Caregiver caregiver = caregiverService.getByUserId(userId);

        // If no profile exists, return 200 with null or 404
        if (caregiver == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(caregiver);
    }
    @PutMapping("/update/{userId}")
    public Caregiver updateCaregiver(
            @PathVariable String userId,
            @RequestParam String fullName,
            @RequestParam String address,
            @RequestParam String phoneNumber,
            @RequestParam String gender,

            @RequestParam String details,
            @RequestParam String experience,
            @RequestParam String speciality,
            @RequestParam String chargeMin,
            @RequestParam String chargeMax,
            @RequestParam(required = false) String certification,
            @RequestParam(required = false) MultipartFile profilePhoto,
            @RequestParam(required = false) MultipartFile citizenshipPhoto,
            @RequestParam(required = false) MultipartFile certificatePhoto
    ) throws IOException {

        Caregiver caregiver = caregiverService.getByUserId(userId);
        if (caregiver == null) throw new RuntimeException("Profile not found");

        System.out.println("📝 updateCaregiver - gender received: '" + gender + "' (existing: '" + caregiver.getGender() + "')");

        caregiver.setFullName(fullName);
        caregiver.setAddress(address);
        caregiver.setPhoneNumber(phoneNumber);
        caregiver.setGender(gender);
        System.out.println("✅ Gender set to: " + gender);
        Users user = userRepo.findById(userId).orElseThrow();
        caregiver.setEmail(user.getEmail());

        caregiver.setDetails(details);
        caregiver.setExperience(experience);
        caregiver.setSpeciality(speciality);
        caregiver.setChargeMin(chargeMin);
        caregiver.setChargeMax(chargeMax);
        caregiver.setCertification(certification);

        // Handle optional photos with spaces replaced
        if (profilePhoto != null) {
            String profileFileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename().replaceAll("\\s+", "_");
            profilePhoto.transferTo(new File(getUploadDir(), profileFileName));
            caregiver.setProfilePhoto(profileFileName);
        }

        if (citizenshipPhoto != null) {
            String citizenshipFileName = System.currentTimeMillis() + "_" + citizenshipPhoto.getOriginalFilename().replaceAll("\\s+", "_");
            citizenshipPhoto.transferTo(new File(getUploadDir(), citizenshipFileName));
            caregiver.setCitizenshipPhoto(citizenshipFileName);
        }

        if (certificatePhoto != null && !certificatePhoto.isEmpty()) {
            String certificateFileName = System.currentTimeMillis() + "_" + certificatePhoto.getOriginalFilename().replaceAll("\\s+", "_");
            certificatePhoto.transferTo(new File(getUploadDir(), certificateFileName));
            caregiver.setCertificatePhoto(certificateFileName);
        }

        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/{id}/comment")
    public Caregiver addComment(
            @PathVariable String id,
            @RequestParam String comment
    ) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        if (caregiver == null) {
            throw new RuntimeException("Caregiver not found");
        }

        // Add the simple string comment to the list
        caregiver.getComments().add(comment);

        // Save and return the updated document
        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/{id}/report")
    public ResponseEntity<Caregiver> reportCaregiver(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestParam String reason,
            @RequestParam(required = false) String proof,
            @RequestParam(required = false) MultipartFile proofFile
    ) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if (caregiver == null) {
            return ResponseEntity.status(404).build();
        }
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String proofValue = proof != null ? proof.trim() : null;
        if (proofFile != null && !proofFile.isEmpty()) {
            try {
                String proofFileName = System.currentTimeMillis() + "_" + proofFile.getOriginalFilename().replaceAll("\\s+", "_");
                File proofDir = new File(getUploadDir());
                if (!proofDir.exists() && !proofDir.mkdirs()) {
                    throw new IOException("Could not create upload directory: " + proofDir.getAbsolutePath());
                }
                proofFile.transferTo(new File(proofDir, proofFileName));
                proofValue = proofFileName;
            } catch (IOException e) {
                System.out.println("Failed to save report proof file: " + e.getMessage());
            }
        }

        String reportedBy = userId != null ? userId.trim() : null;
        String reportedAt = java.time.LocalDateTime.now().toString();
        Caregiver.Report report = new Caregiver.Report(reportedBy, reason.trim(), proofValue, reportedAt);
        caregiver.getReports().add(report);
        caregiver.setReportsCount(caregiver.getReports().size());
        caregiver.setReason(reason.trim());
        caregiver.setProof(proofValue);
        caregiver.setReportedByUserId(reportedBy);
        caregiver.setReportedAt(reportedAt);

        Caregiver saved = caregiverService.saveCaregiver(caregiver);

        // Create admin notification record so admin dashboard shows the report even if email fails
        Notification adminNotification = new Notification(
            "admin",
            saved.getReportedByUserId(),
            "Care Receiver",
            "ADMIN_CAREGIVER_REPORTED",
            "Caregiver reported",
            "Caregiver " + saved.getFullName() + " was reported for: " + saved.getReason()
        );
        adminNotification.setReason(saved.getReason());
        adminNotification.setActionId(saved.getId());
        notificationRepository.save(adminNotification);

        try {
            String adminSubject = "Caregiver reported by user";
            String adminBody = "A caregiver has been reported.\n\n"
                + "Caregiver: " + saved.getFullName() + "\n"
                + "Reports count: " + saved.getReportsCount() + "\n"
                + "Reported by user ID: " + (saved.getReportedByUserId() != null ? saved.getReportedByUserId() : "Unknown") + "\n"
                + "Reason: " + saved.getReason() + "\n"
                + "Proof: " + (saved.getProof() != null ? saved.getProof() : "None") + "\n\n"
                + "Please review this report in the admin dashboard.";
            emailService.sendAdminAlert(adminSubject, adminBody);
            System.out.println("Admin alert sent for caregiver report: " + saved.getId());
        } catch (Exception e) {
            System.out.println("Failed to send admin email for caregiver report: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/accept-request")
    public ResponseEntity<?> acceptRequest(@PathVariable String id, @RequestBody Map<String, String> request) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        String userId = request.get("userId");

        if (caregiver == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Caregiver not found"));
        }
        
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "User ID is required"));
        }

        // Add to caregiver's accepted users list
        if (!caregiver.getAcceptedUserIds().contains(userId)) {
            caregiver.getAcceptedUserIds().add(userId);
            caregiverService.saveCaregiver(caregiver);
        }

        // Create or retrieve AcceptedRequest record for chat
        try {
            // Update any existing interest request status so chat permission checks pass
            List<InterestRequest> matchingInterests = interestRequestRepository.findByCaregiverIdAndUserId(caregiver.getId(), userId);
            if (matchingInterests != null && !matchingInterests.isEmpty()) {
                for (InterestRequest interest : matchingInterests) {
                    interest.setStatus("ACCEPTED");
                    interest.setRespondedAt(java.time.LocalDateTime.now().toString());
                    interestRequestRepository.save(interest);
                }
            }

            // Check if AcceptedRequest already exists to prevent duplicates
            List<AcceptedRequest> existingRequests = acceptedRequestRepository.findByCaregiverIdAndUserId(caregiver.getId(), userId);
            
            if (existingRequests != null && !existingRequests.isEmpty()) {
                // Already exists, return the first one
                AcceptedRequest existingRequest = existingRequests.get(0);
                
                // If there are duplicates, delete them except the first
                if (existingRequests.size() > 1) {
                    System.out.println("⚠️ Found " + existingRequests.size() + " duplicate requests. Cleaning up...");
                    for (int i = 1; i < existingRequests.size(); i++) {
                        acceptedRequestRepository.deleteById(existingRequests.get(i).getId());
                        System.out.println("  Deleted duplicate: " + existingRequests.get(i).getId());
                    }
                }
                
                System.out.println("ℹ️ Request already accepted - returning existing record: " + existingRequest.getId());
                return ResponseEntity.ok(Map.of(
                    "message", "Request already accepted",
                    "data", existingRequest
                ));
            }
            
            Users user = userRepo.findById(userId).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }
            
            AcceptedRequest accepted = new AcceptedRequest(
                caregiver.getId(),
                caregiver.getFullName(),
                userId,
                user.getUserName()
            );
            
            AcceptedRequest savedRequest = acceptedRequestRepository.save(accepted);
            
            System.out.println("✓ AcceptedRequest saved: " + savedRequest.getId() + " | Caregiver: " + caregiver.getId() + " | User: " + userId);
            
            // Send email notification to care receiver
            try {
                emailService.sendInterestAcceptedEmail(user.getEmail(), caregiver.getFullName());
                System.out.println("✓ Interest accepted email sent to: " + user.getEmail());
            } catch (Exception emailErr) {
                System.err.println("⚠️ Failed to send interest accepted email: " + emailErr.getMessage());
            }
            
            // Create notification record for care receiver
            try {
                Notification notification = new Notification(
                    userId,
                    caregiver.getId(),
                    caregiver.getFullName(),
                    "INTEREST_ACCEPTED",
                    "Interest Accepted",
                    caregiver.getFullName() + " has accepted your interest request. You can now chat and book services!"
                );
                notification.setActionId(savedRequest.getId());
                notificationRepository.save(notification);
                System.out.println("✓ Notification created for user: " + userId);
            } catch (Exception notifErr) {
                System.err.println("⚠️ Failed to create notification: " + notifErr.getMessage());
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Request accepted successfully",
                "data", savedRequest
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process request: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/decline-request")
    public ResponseEntity<?> declineRequest(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            
            // Find caregiver details for notifications
            Caregiver caregiver = caregiverService.getCaregiverById(id);
            Users user = userRepo.findById(userId).orElse(null);
            
            // Find and delete the AcceptedRequest if it exists
            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByCaregiverIdAndUserId(id, userId);
            if (!acceptedRequests.isEmpty()) {
                acceptedRequestRepository.deleteAll(acceptedRequests);
            }

            // Mark any matching interest requests as rejected so the caregiver pending list removes them
            List<InterestRequest> interestRequests = interestRequestRepository.findByCaregiverIdAndUserId(id, userId);
            if (interestRequests != null && !interestRequests.isEmpty()) {
                for (InterestRequest interest : interestRequests) {
                    interest.setStatus("REJECTED");
                    interest.setRespondedAt(java.time.LocalDateTime.now().toString());
                    interestRequestRepository.save(interest);
                }
            }
            
            // Send email notification to care receiver
            if (user != null && caregiver != null) {
                try {
                    emailService.sendInterestDeclinedEmail(user.getEmail(), caregiver.getFullName());
                    System.out.println("✓ Interest declined email sent to: " + user.getEmail());
                } catch (Exception emailErr) {
                    System.err.println("⚠️ Failed to send interest declined email: " + emailErr.getMessage());
                }
                
                // Create notification record for care receiver
                try {
                    Notification notification = new Notification(
                        userId,
                        caregiver.getId(),
                        caregiver.getFullName(),
                        "INTEREST_DECLINED",
                        "Interest Request Declined",
                        caregiver.getFullName() + " has declined your interest request. You can explore other caregivers."
                    );
                    notificationRepository.save(notification);
                    System.out.println("✓ Notification created for user: " + userId);
                } catch (Exception notifErr) {
                    System.err.println("⚠️ Failed to create notification: " + notifErr.getMessage());
                }
            }
            
            return ResponseEntity.ok("Request declined successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Remove an accepted connection (allows both authenticated and with token) ──
    @PostMapping("/{id}/remove-connection")
    public ResponseEntity<?> removeConnection(
            @PathVariable String id, 
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "userId is required"));
            }

            if (id == null || id.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "caregiverId is required"));
            }

            System.out.println("REMOVE CONNECTION DEBUG: caregiverId=" + id + ", userId=" + userId);

            Caregiver caregiver = caregiverService.getCaregiverById(id);

            // Remove any accepted connection records
            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByCaregiverIdAndUserId(id, userId);
            System.out.println("Found " + acceptedRequests.size() + " connections to delete");
            if (!acceptedRequests.isEmpty()) {
                acceptedRequestRepository.deleteAll(acceptedRequests);
            }

            // Also remove the user from the caregiver's accepted-user list if it exists
            if (caregiver != null && caregiver.getAcceptedUserIds() != null && caregiver.getAcceptedUserIds().contains(userId)) {
                caregiver.getAcceptedUserIds().removeIf(uid -> uid.equals(userId));
                caregiverService.saveCaregiver(caregiver);
            }

            // Mark any existing interest request as rejected so the user can send interest again
            List<InterestRequest> interestRequests = interestRequestRepository.findByCaregiverIdAndUserId(id, userId);
            if (interestRequests != null && !interestRequests.isEmpty()) {
                for (InterestRequest interest : interestRequests) {
                    interest.setStatus("REJECTED");
                    interest.setRespondedAt(java.time.LocalDateTime.now().toString());
                    interestRequestRepository.save(interest);
                }
            }

            // Remove stale interest notifications from this caregiver's profile notification list
            if (caregiver != null && caregiver.getNotifications() != null) {
                caregiver.getNotifications().removeIf(raw -> {
                    if (raw == null) return false;
                    try {
                        String json = raw.toString();
                        if (!json.trim().startsWith("{")) return false;
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        Map<?, ?> notifMap = mapper.readValue(json, Map.class);
                        Object type = notifMap.get("type");
                        Object senderId = notifMap.get("senderId");
                        Object userIdValue = notifMap.get("userId");
                        return type != null && type.toString().toLowerCase().contains("interest")
                                && (userId.equals(senderId) || userId.equals(userIdValue));
                    } catch (Exception ex) {
                        return false;
                    }
                });
                caregiverService.saveCaregiver(caregiver);
            }

            // Remove stale interest notification documents for the caregiver if they are related to this old interest/user
            if (caregiver != null && caregiver.getUserId() != null) {
                List<Notification> notifications = notificationRepository.findByUserId(caregiver.getUserId());
                if (notifications != null && !notifications.isEmpty()) {
                    List<Notification> toDelete = new java.util.ArrayList<>();
                    for (Notification notification : notifications) {
                        if (notification == null) continue;
                        if (notification.getType() != null && notification.getType().toLowerCase().contains("interest")
                                && (userId.equals(notification.getSenderId()) || userId.equals(notification.getUserId()))) {
                            toDelete.add(notification);
                        }
                    }
                    if (!toDelete.isEmpty()) {
                        notificationRepository.deleteAll(toDelete);
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", "Connection removed successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }
}

