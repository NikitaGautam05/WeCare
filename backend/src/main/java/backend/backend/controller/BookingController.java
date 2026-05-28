package backend.backend.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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

import backend.backend.model.AcceptedRequest;
import backend.backend.model.Booking;
import backend.backend.model.Caregiver;
import backend.backend.model.HistoryItems;
import backend.backend.model.Notification;
import backend.backend.model.Users;
import backend.backend.repository.AcceptedRequestRepository;
import backend.backend.repository.BookingRepository;
import backend.backend.repository.CaregiverRepository;
import backend.backend.repository.NotificationRepository;
import backend.backend.repository.UserRepo;
import backend.backend.service.EmailService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://elderease-6cuj.onrender.com"
})
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private CaregiverRepository caregiverRepository;
    
    @Autowired
    private UserRepo userRepository;

    @Autowired
    private AcceptedRequestRepository acceptedRequestRepository;
    
    @Autowired
    private EmailService emailService;

    // ── Care receiver creates booking request ──
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(
            @RequestParam String caregiverId,
            @RequestParam String caregiverName,
            @RequestParam String userId,
            @RequestParam String userName,
            @RequestParam(required = false) String userPhone,
            @RequestParam String serviceType,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam Double hourlyRate,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String notes) {
        try {
            Booking booking = new Booking(caregiverId, caregiverName, userId, userName, 
                                         serviceType, startTime, endTime, hourlyRate);
            if (userPhone != null && !userPhone.isEmpty()) {
                booking.setUserPhone(userPhone);
            } else {
                Users user = userRepository.findById(userId).orElse(null);
                if (user != null && user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()) {
                    booking.setUserPhone(user.getPhoneNumber());
                }
            }
            if (location != null && !location.isEmpty()) {
                booking.setLocation(location);
            }
            if (notes != null && !notes.isEmpty()) {
                booking.setNotes(notes);
            }
            
            Booking saved = bookingRepository.save(booking);
            
            // Create notification for caregiver
            Notification notification = new Notification(
                caregiverId,
                userId,
                userName,
                "booking",
                userName + " requested a booking",
                "New booking request for " + serviceType + " on " + startTime
            );
            notification.setActionId(saved.getId());
            notificationRepository.save(notification);

            // Send email to caregiver
            try {
                Caregiver caregiver = caregiverRepository.findById(caregiverId).orElse(null);
                if (caregiver != null && caregiver.getEmail() != null && !caregiver.getEmail().isEmpty()) {
                    emailService.sendBookingRequestEmail(
                        caregiver.getEmail(),
                        userName,
                        serviceType,
                        startTime
                    );
                }
            } catch (Exception e) {
                System.err.println("Email sending failed: " + e.getMessage());
            }
            
            System.out.println("📅 Booking created: " + userName + " → " + caregiverName);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Caregiver confirms booking ──
    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable String bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
            }

            booking.setStatus("CONFIRMED");
            booking.setConfirmedAt(java.time.LocalDateTime.now().toString());
            Booking updated = bookingRepository.save(booking);

            // Create notification for care receiver
            Notification notification = new Notification(
                booking.getUserId(),
                booking.getCaregiverId(),
                booking.getCaregiverName(),
                "booking_accepted",
                booking.getCaregiverName() + " confirmed your booking!",
                "Your booking for " + booking.getServiceType() + " is confirmed"
            );
            notification.setActionId(booking.getId());
            notificationRepository.save(notification);

            // Send email to care receiver
            try {
                Users user = userRepository.findById(booking.getUserId()).orElse(null);
                if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                    emailService.sendBookingConfirmedEmail(
                        user.getEmail(),
                        booking.getCaregiverName(),
                        booking.getServiceType(),
                        booking.getStartTime()
                    );
                }
            } catch (Exception e) {
                System.err.println("Email sending failed: " + e.getMessage());
            }

            Users user = userRepository.findById(booking.getUserId()).orElse(null);
            if (user != null) {
                HistoryItems item = new HistoryItems();
                item.setCaregiverId(booking.getCaregiverId());
                item.setAction("BOOKED");
                item.setTimestamp(java.time.LocalDateTime.now().toString());
                user.getHistory().add(item);
                userRepository.save(user);
            }

            System.out.println("✅ Booking confirmed: " + booking.getId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Add daily work note for confirmed booking ──
    @PutMapping("/{bookingId}/notes")
    public ResponseEntity<?> addBookingNote(@PathVariable String bookingId, @RequestBody Map<String, String> payload) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
            }
            String status = booking.getStatus();
            if (!"CONFIRMED".equals(status)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Notes may only be added after the booking is accepted."));
            }
            String note = payload.get("note");
            if (note == null || note.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Note text is required."));
            }
            List<String> dailyNotes = booking.getDailyNotes();
            if (dailyNotes == null) {
                dailyNotes = new ArrayList<>();
            }
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            dailyNotes.add(timestamp + " — " + note.trim());
            booking.setDailyNotes(dailyNotes);
            Booking updated = bookingRepository.save(booking);

            Notification logNotification = new Notification(
                booking.getUserId(),
                booking.getCaregiverId(),
                booking.getCaregiverName(),
                "booking_log",
                booking.getCaregiverName() + " added a new care update",
                "Care log update: " + timestamp + " — " + note.trim()
            );
            logNotification.setActionId(booking.getId());
            notificationRepository.save(logNotification);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Complete booking (increment session count) ──
    @PutMapping("/{bookingId}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable String bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
            }

            booking.setStatus("COMPLETED");
            booking.setCompletedAt(java.time.LocalDateTime.now().toString());
            Booking updated = bookingRepository.save(booking);

            List<AcceptedRequest> acceptedRequests = acceptedRequestRepository.findByCaregiverIdAndUserId(
                booking.getCaregiverId(), booking.getUserId());
            if (acceptedRequests != null && !acceptedRequests.isEmpty()) {
                acceptedRequestRepository.deleteAll(acceptedRequests);
            }

            Notification completionNotification = new Notification(
                booking.getUserId(),
                booking.getCaregiverId(),
                booking.getCaregiverName(),
                "booking_completed",
                booking.getCaregiverName() + " completed your booking",
                "Your booking for " + booking.getServiceType() + " is finished"
            );
            completionNotification.setActionId(booking.getId());
            notificationRepository.save(completionNotification);

            System.out.println("✅ Booking completed: " + booking.getId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Cancel booking (Decline by caregiver) ──
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId, @RequestParam(required = false) String reason) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
            }

            booking.setStatus("CANCELLED");
            Booking updated = bookingRepository.save(booking);

            // Create notification for care receiver
            Notification notification = new Notification(
                booking.getUserId(),
                booking.getCaregiverId(),
                booking.getCaregiverName(),
                "booking_rejected",
                booking.getCaregiverName() + " declined your booking",
                "Unfortunately, your booking for " + booking.getServiceType() + " was declined"
            );
            if (reason != null && !reason.isBlank()) {
                notification.setReason(reason.trim());
            }
            notification.setActionId(booking.getId());
            notificationRepository.save(notification);

            // Send email to care receiver
            try {
                Users user = userRepository.findById(booking.getUserId()).orElse(null);
                if (user != null && user.getEmail() != null && !user.getEmail().isEmpty()) {
                    emailService.sendBookingDeclinedEmail(
                        user.getEmail(),
                        booking.getCaregiverName(),
                        booking.getServiceType()
                    );
                }
            } catch (Exception e) {
                System.err.println("Email sending failed: " + e.getMessage());
            }

            System.out.println("❌ Booking cancelled: " + booking.getId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Get bookings for caregiver ──
    @GetMapping("/caregiver/{caregiverId}")
    public ResponseEntity<List<Booking>> getCaregiverBookings(@PathVariable String caregiverId) {
        try {
            System.out.println("🔍 Fetching bookings for caregiver: " + caregiverId);
            List<Booking> bookings = bookingRepository.findByCaregiverId(caregiverId);
            System.out.println("📊 Found " + bookings.size() + " bookings for caregiver: " + caregiverId);
            for (Booking b : bookings) {
                if ((b.getUserPhone() == null || b.getUserPhone().isEmpty()) && b.getUserId() != null) {
                    Users bookingUser = userRepository.findById(b.getUserId()).orElse(null);
                    if (bookingUser != null && bookingUser.getPhoneNumber() != null && !bookingUser.getPhoneNumber().isEmpty()) {
                        b.setUserPhone(bookingUser.getPhoneNumber());
                    }
                }
                System.out.println("  - Booking " + b.getId() + ": " + b.getServiceType() + " from " + b.getUserName() + " (status: " + b.getStatus() + ")");
            }
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            System.err.println("❌ Error fetching caregiver bookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get all bookings for admin (optional status filter) ─
    @GetMapping("/admin")
    public ResponseEntity<List<Booking>> getAllBookings(@RequestParam(required = false) String status) {
        try {
            List<Booking> bookings = bookingRepository.findAll();
            if (status != null && !status.isBlank()) {
                String normalizedStatus = status.trim().toUpperCase();
                if (!"ALL".equals(normalizedStatus)) {
                    bookings.removeIf(b -> {
                        String bookingStatus = b.getStatus() == null ? "" : b.getStatus().toUpperCase();
                        if ("BOOKED".equals(normalizedStatus)) {
                            return !("PENDING".equals(bookingStatus) || "CONFIRMED".equals(bookingStatus));
                        }
                        return !normalizedStatus.equals(bookingStatus);
                    });
                }
            }
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get bookings for user ──
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable String userId) {
        try {
            List<Booking> bookings = bookingRepository.findByUserId(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get pending bookings count for caregiver ──
    @GetMapping("/caregiver/{caregiverId}/pending-count")
    public ResponseEntity<Long> getPendingCount(@PathVariable String caregiverId) {
        try {
            List<Booking> bookings = bookingRepository.findByCaregiverIdAndStatus(caregiverId, "PENDING");
            return ResponseEntity.ok((long) bookings.size());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get session count for user ──
    @GetMapping("/{userId}/session-count")
    public ResponseEntity<?> getSessionCount(@PathVariable String userId) {
        try {
            long completedSessions = bookingRepository.countByUserIdAndStatus(userId, "COMPLETED");
            return ResponseEntity.ok(Map.of(
                "completedSessions", completedSessions,
                "nextPromptAt", ((completedSessions / 10) + 1) * 10
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
