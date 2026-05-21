package backend.backend.controller;

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

import backend.backend.model.Notification;
import backend.backend.repository.NotificationRepository;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://elderease-6cuj.onrender.com"
})
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // ── Get all notifications for user (sorted by newest first) ──
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            System.out.println("📬 Found " + notifications.size() + " notifications for user: " + userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Get unread count ──
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        try {
            long count = notificationRepository.countByUserIdAndRead(userId, false);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Mark notification as read ──
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String notificationId) {
        try {
            Notification notification = notificationRepository.findById(notificationId).orElse(null);
            if (notification == null) {
                return ResponseEntity.status(404).build();
            }
            notification.setRead(true);
            Notification updated = notificationRepository.save(notification);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Mark all notifications as read ──
    @PutMapping("/{userId}/read-all")
    public ResponseEntity<?> markAllAsRead(@PathVariable String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserId(userId);
            for (Notification notif : notifications) {
                if (!notif.getRead()) {
                    notif.setRead(true);
                    notificationRepository.save(notif);
                }
            }
            System.out.println("✅ Marked all notifications as read for user: " + userId);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // ── Create notification (used internally by other services) ──
    @PostMapping("/create")
    public ResponseEntity<Notification> createNotification(
            @RequestParam String userId,
            @RequestParam String senderId,
            @RequestParam String senderName,
            @RequestParam String type,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(required = false) String actionId) {
        try {
            Notification notification = new Notification(userId, senderId, senderName, type, title, message);
            if (actionId != null) {
                notification.setActionId(actionId);
            }
            Notification saved = notificationRepository.save(notification);
            System.out.println("🔔 Notification created: " + type + " for user: " + userId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
