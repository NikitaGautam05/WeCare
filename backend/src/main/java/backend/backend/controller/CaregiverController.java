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
import backend.backend.model.Users;
import backend.backend.repository.AcceptedRequestRepository;
import backend.backend.repository.InterestRequestRepository;
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
    private final String uploadDir = "D:/fyp demo/backend/uploads/";
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private InterestRequestRepository interestRequestRepository;
    @Autowired
    private AcceptedRequestRepository acceptedRequestRepository;
    @PostMapping("/add")
    public Caregiver addCaregiver(
            @RequestParam String userId,  // <-- userId first
            @RequestParam("profilePhoto") MultipartFile profilePhoto,
            @RequestParam("citizenshipPhoto") MultipartFile citizenshipPhoto,
            @RequestParam String fullName,
            @RequestParam String address,
            @RequestParam String phoneNumber,

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


        // Ensure upload folder exists
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            if (!created) {
                throw new IOException("Could not create upload directory: " + uploadDir);
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

        caregiver.setFullName(fullName);
        caregiver.setAddress(address);
        caregiver.setPhoneNumber(phoneNumber);
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
            profilePhoto.transferTo(new File(uploadDir, profileFileName));
            caregiver.setProfilePhoto(profileFileName);
        }

        if (citizenshipPhoto != null) {
            String citizenshipFileName = System.currentTimeMillis() + "_" + citizenshipPhoto.getOriginalFilename().replaceAll("\\s+", "_");
            citizenshipPhoto.transferTo(new File(uploadDir, citizenshipFileName));
            caregiver.setCitizenshipPhoto(citizenshipFileName);
        }

        if (certificatePhoto != null && !certificatePhoto.isEmpty()) {
            String certificateFileName = System.currentTimeMillis() + "_" + certificatePhoto.getOriginalFilename().replaceAll("\\s+", "_");
            certificatePhoto.transferTo(new File(uploadDir, certificateFileName));
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
    public Caregiver reportCaregiver(@PathVariable String id) {

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if (caregiver == null) {
            throw new RuntimeException("Caregiver not found");
        }

        // increment report count
        caregiver.setReportsCount(caregiver.getReportsCount() + 1);

        return caregiverService.saveCaregiver(caregiver);
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
            
            // Find and delete the AcceptedRequest
            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByCaregiverIdAndUserId(id, userId);
            System.out.println("Found " + acceptedRequests.size() + " connections to delete");
            
            if (!acceptedRequests.isEmpty()) {
                acceptedRequestRepository.deleteAll(acceptedRequests);

                // Also remove the user from the caregiver's accepted-user list if it exists
                Caregiver caregiver = caregiverService.getCaregiverById(id);
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

                return ResponseEntity.ok(Map.of("message", "Connection removed successfully"));
            }
            
            return ResponseEntity.badRequest().body(Map.of("message", "Connection not found"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }

//    @GetMapping("/admin/reported")
//    public List<Caregiver> getReportedCaregivers() {
//        return caregiverService.getReportedCaregivers();
//    }

}

