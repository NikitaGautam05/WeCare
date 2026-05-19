package backend.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.backend.model.SessionTracking;
import backend.backend.repository.BookingRepository;
import backend.backend.repository.SessionTrackingRepository;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:5173")
public class SessionTrackingController {

    @Autowired
    private SessionTrackingRepository sessionTrackingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // ── Get session tracking info for user ──
    @GetMapping("/{userId}")
    public ResponseEntity<?> getSessionTracking(@PathVariable String userId) {
        try {
            Optional<SessionTracking> tracking = sessionTrackingRepository.findByUserId(userId);
            
            if (!tracking.isPresent()) {
                // Create new tracking if doesn't exist
                SessionTracking newTracking = new SessionTracking(userId);
                sessionTrackingRepository.save(newTracking);
                return ResponseEntity.ok(newTracking);
            }
            
            SessionTracking current = tracking.get();
            
            // Get actual completed sessions count from bookings
            long completedBookings = bookingRepository.countByUserIdAndStatus(userId, "COMPLETED");
            current.setTotalSessions(completedBookings);
            
            // Check if profile update needed (every 10 sessions)
            if (completedBookings > 0 && completedBookings % 10 == 0 && completedBookings > current.getLastPromptedAt()) {
                current.setProfileUpdateNeeded(true);
                current.setLastPromptedAt(completedBookings);
                sessionTrackingRepository.save(current);
            }
            
            return ResponseEntity.ok(current);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Check if profile update prompt needed ──
    @GetMapping("/{userId}/check-prompt")
    public ResponseEntity<?> checkProfileUpdatePrompt(@PathVariable String userId) {
        try {
            Optional<SessionTracking> tracking = sessionTrackingRepository.findByUserId(userId);
            
            if (!tracking.isPresent()) {
                SessionTracking newTracking = new SessionTracking(userId);
                sessionTrackingRepository.save(newTracking);
                return ResponseEntity.ok(Map.of(
                    "needsPrompt", false,
                    "completedSessions", 0,
                    "nextPromptAt", 10
                ));
            }
            
            SessionTracking current = tracking.get();
            long completedBookings = bookingRepository.countByUserIdAndStatus(userId, "COMPLETED");
            
            boolean needsPrompt = false;
            if (completedBookings > 0 && completedBookings % 10 == 0 && completedBookings > current.getLastPromptedAt()) {
                needsPrompt = true;
                current.setLastPromptedAt(completedBookings);
                sessionTrackingRepository.save(current);
                System.out.println("📋 Profile update needed for user: " + userId + " at session: " + completedBookings);
            }
            
            return ResponseEntity.ok(Map.of(
                "needsPrompt", needsPrompt,
                "completedSessions", completedBookings,
                "nextPromptAt", ((completedBookings / 10) + 1) * 10
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Mark profile update as completed ──
    @PutMapping("/{userId}/mark-prompted")
    public ResponseEntity<?> markAsPrompted(@PathVariable String userId) {
        try {
            Optional<SessionTracking> tracking = sessionTrackingRepository.findByUserId(userId);
            
            if (!tracking.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("error", "Session tracking not found"));
            }
            
            SessionTracking current = tracking.get();
            current.setProfileUpdateNeeded(false);
            current.setUpdatedAt(java.time.LocalDateTime.now().toString());
            
            SessionTracking updated = sessionTrackingRepository.save(current);
            System.out.println("✅ Profile update marked as prompted for user: " + userId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
