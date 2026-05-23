package backend.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.backend.model.AcceptedRequest;
import backend.backend.model.Caregiver;
import backend.backend.model.InterestRequest;
import backend.backend.model.Notification;
import backend.backend.model.Users;
import backend.backend.repository.AcceptedRequestRepository;
import backend.backend.repository.InterestRequestRepository;
import backend.backend.repository.NotificationRepository;
import backend.backend.repository.UserRepo;
import backend.backend.service.CaregiverService;

@RestController
@RequestMapping("/api/interest")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://elderease-6cuj.onrender.com"
})
public class InterestController {

    @Autowired
    private InterestRequestRepository interestRequestRepository;

    @Autowired
    private AcceptedRequestRepository acceptedRequestRepository;

    @Autowired
    private CaregiverService caregiverService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationRepository notificationRepository;

    // ── Care receiver sends interest to caregiver ──
    @PostMapping("/send")
    public ResponseEntity<?> sendInterest(
            @RequestParam String caregiverId,
            @RequestParam String caregiverName,
            @RequestParam String userId,
            @RequestParam String userName) {
        try {
            // Check if there's already an interest request from this user to this caregiver
            List<InterestRequest> existingRequests = interestRequestRepository.findByCaregiverIdAndUserId(caregiverId, userId);
            
            InterestRequest interest;
            boolean isNewRequest = true;
            
            if (!existingRequests.isEmpty()) {
                // Reuse the most recent request and reset it to PENDING
                interest = existingRequests.get(existingRequests.size() - 1);
                interest.setStatus("PENDING");
                interest.setSentAt(java.time.LocalDateTime.now().toString());
                interest.setRespondedAt(null);
                isNewRequest = false;
                System.out.println("♻️  Resetting existing interest request to PENDING");
            } else {
                // Create a new interest request record
                interest = new InterestRequest(caregiverId, caregiverName, userId, userName);
                System.out.println("✨ Creating new interest request");
            }
            
            InterestRequest saved = interestRequestRepository.save(interest);

            Caregiver caregiver = caregiverService.getCaregiverById(caregiverId);
            String recipientId = caregiver != null && caregiver.getUserId() != null ? caregiver.getUserId() : caregiverId;

            // Create notification for caregiver account
            Notification notification = new Notification(
                recipientId,
                userId,
                userName,
                "INTEREST_SENT",
                userName + " is interested in your care services",
                userName + " sent you an interest request to connect and discuss care needs"
            );
            notification.setActionId(saved.getId());
            notificationRepository.save(notification);

            // Keep the caregiver profile notification array in sync for dashboard views that still read it
            if (caregiver != null) {
                String profileNotification = String.format(
                    "{\"userId\":\"%s\",\"type\":\"interest\",\"message\":\"New interest from %s\"}",
                    userId,
                    userName
                );
                java.util.List<String> caregiverNotifications = caregiver.getNotifications();
                if (caregiverNotifications == null) {
                    caregiverNotifications = new java.util.ArrayList<>();
                    caregiver.setNotifications(caregiverNotifications);
                }
                caregiverNotifications.add(profileNotification);
                caregiverService.saveCaregiver(caregiver);
            }

            System.out.println("📨 Interest sent from " + userName + " to " + caregiverName);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get pending requests for caregiver ──
    @GetMapping("/pending-requests/{caregiverId}")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(@PathVariable String caregiverId) {
        try {
            System.out.println("🔍 Fetching pending requests for caregiver: " + caregiverId);
            
            List<InterestRequest> pendingRequests = interestRequestRepository.findByCaregiverIdAndStatus(caregiverId, "PENDING");
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (InterestRequest request : pendingRequests) {
                Users user = userRepo.findById(request.getUserId()).orElse(null);
                Map<String, Object> reqData = new HashMap<>();
                reqData.put("id", request.getId());
                reqData.put("status", request.getStatus());
                reqData.put("sentAt", request.getSentAt());
                reqData.put("caregiverId", request.getCaregiverId());
                reqData.put("caregiverName", request.getCaregiverName());
                reqData.put("userId", request.getUserId());
                reqData.put("userName", request.getUserName());

                Map<String, Object> userDetails = new HashMap<>();
                if (user != null) {
                    userDetails.put("id", user.getId());
                    userDetails.put("userName", user.getUserName());
                    userDetails.put("email", user.getEmail());
                    userDetails.put("photo", user.getPhoto());
                    userDetails.put("address", user.getAddress());
                    userDetails.put("serviceType", user.getServiceType());
                    userDetails.put("receiverType", user.getReceiverType());
                    userDetails.put("additionalInfo", user.getAdditionalInfo());
                    userDetails.put("accountType", user.getAccountType() != null ? user.getAccountType() : "INDIVIDUAL");
                } else {
                    userDetails.put("id", request.getUserId());
                    userDetails.put("userName", request.getUserName());
                    userDetails.put("email", "");
                    userDetails.put("photo", "");
                    userDetails.put("address", "");
                    userDetails.put("serviceType", "Interest request");
                    userDetails.put("receiverType", "self");
                    userDetails.put("additionalInfo", "");
                    userDetails.put("accountType", "INDIVIDUAL");
                }

                reqData.put("user", userDetails);
                response.add(reqData);
            }
            
            System.out.println("✅ Found " + response.size() + " pending requests");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Caregiver accepts interest request ──
    @PutMapping("/accept/{interestId}")
    public ResponseEntity<?> acceptInterest(@PathVariable String interestId) {
        try {
            InterestRequest interest = interestRequestRepository.findById(interestId).orElse(null);
            if (interest == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Interest request not found"));
            }

            // Update status
            interest.setStatus("ACCEPTED");
            interest.setRespondedAt(java.time.LocalDateTime.now().toString());
            InterestRequest updated = interestRequestRepository.save(interest);

            // Create AcceptedRequest record for chat
            List<AcceptedRequest> existing = acceptedRequestRepository.findByCaregiverIdAndUserId(
                interest.getCaregiverId(), 
                interest.getUserId()
            );

            if (existing.isEmpty()) {
                AcceptedRequest accepted = new AcceptedRequest(
                    interest.getCaregiverId(),
                    interest.getCaregiverName(),
                    interest.getUserId(),
                    interest.getUserName()
                );
                acceptedRequestRepository.save(accepted);
                System.out.println("✅ Chat enabled for caregiver: " + interest.getCaregiverName());
            }

            // Create notification for care receiver
            Notification notification = new Notification(
                interest.getUserId(),
                interest.getCaregiverId(),
                interest.getCaregiverName(),
                "INTEREST_ACCEPTED",
                interest.getCaregiverName() + " accepted your interest request!",
                "You can now chat and book sessions with " + interest.getCaregiverName()
            );
            notification.setActionId(interest.getId());
            notificationRepository.save(notification);

            return ResponseEntity.ok(Map.of("message", "Interest accepted", "data", updated));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Caregiver rejects interest request ──
    @PutMapping("/reject/{interestId}")
    public ResponseEntity<?> rejectInterest(@PathVariable String interestId) {
        try {
            InterestRequest interest = interestRequestRepository.findById(interestId).orElse(null);
            if (interest == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Interest request not found"));
            }

            interest.setStatus("REJECTED");
            interest.setRespondedAt(java.time.LocalDateTime.now().toString());
            InterestRequest updated = interestRequestRepository.save(interest);

            // Create notification for care receiver
            Notification notification = new Notification(
                interest.getUserId(),
                interest.getCaregiverId(),
                interest.getCaregiverName(),
                "INTEREST_REJECTED",
                interest.getCaregiverName() + " declined your interest request",
                "The caregiver is not available. Feel free to explore other caregivers."
            );
            notification.setActionId(interest.getId());
            notificationRepository.save(notification);

            System.out.println("❌ Interest rejected from: " + interest.getUserName());
            return ResponseEntity.ok(Map.of("message", "Interest rejected", "data", updated));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get all sent interests for care receiver ──
    @GetMapping("/sent-interests/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getSentInterests(@PathVariable String userId) {
        try {
            System.out.println("🔍 Fetching sent interests for user: " + userId);
            
            List<InterestRequest> interests = interestRequestRepository.findByUserId(userId);
            List<Map<String, Object>> response = new ArrayList<>();
            
            for (InterestRequest interest : interests) {
                if (interest == null) continue;
                String status = interest.getStatus();
                if (status == null || "REJECTED".equalsIgnoreCase(status)) {
                    continue;
                }

                Caregiver caregiver = caregiverService.getCaregiverById(interest.getCaregiverId());
                
                if (caregiver != null) {
                    Map<String, Object> intData = new HashMap<>();
                    intData.put("id", interest.getId());
                    intData.put("status", interest.getStatus());
                    intData.put("sentAt", interest.getSentAt());
                    intData.put("respondedAt", interest.getRespondedAt());
                    
                    Map<String, Object> caregiverDetails = new HashMap<>();
                    caregiverDetails.put("id", caregiver.getId());
                    caregiverDetails.put("userName", caregiver.getFullName());
                    caregiverDetails.put("email", caregiver.getEmail());
                    caregiverDetails.put("photo", caregiver.getProfilePhoto());
                    caregiverDetails.put("experience", caregiver.getExperience());
                    caregiverDetails.put("speciality", caregiver.getSpeciality());
                    caregiverDetails.put("chargeMin", caregiver.getChargeMin());
                    caregiverDetails.put("chargeMax", caregiver.getChargeMax());
                    
                    intData.put("caregiver", caregiverDetails);
                    response.add(intData);
                }
            }
            
            System.out.println("✅ Found " + response.size() + " sent interests");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Check if chat is allowed (interest accepted) ──
    @GetMapping("/can-chat/{caregiverId}/{userId}")
    public ResponseEntity<Boolean> canChat(@PathVariable String caregiverId, @PathVariable String userId) {
        try {
            // Check if there's an ACCEPTED interest request
            List<InterestRequest> interests = interestRequestRepository.findByCaregiverIdAndUserId(caregiverId, userId);
            
            for (InterestRequest interest : interests) {
                if ("ACCEPTED".equals(interest.getStatus())) {
                    return ResponseEntity.ok(true);
                }
            }

            // Also allow chat if an AcceptedRequest record already exists
            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByCaregiverIdAndUserId(caregiverId, userId);
            if (acceptedRequests != null && !acceptedRequests.isEmpty()) {
                return ResponseEntity.ok(true);
            }
            
            return ResponseEntity.ok(false);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
