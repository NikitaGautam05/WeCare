package backend.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId; // Who receives the notification
    private String senderId; // Who triggered the notification
    private String senderName;
    private String type; // INTEREST_SENT, INTEREST_ACCEPTED, INTEREST_REJECTED, BOOKING_REQUEST, BOOKING_CONFIRMED
    private String title;
    private String message;
    private String reason;
    private Boolean read;
    private String createdAt;
    private String actionId; // Links to interest/booking ID

    public Notification() {}

    public Notification(String message, String userId, String type) {
        this.message = message;
        this.userId = userId;
        this.type = type;
        this.read = false;
        this.createdAt = java.time.LocalDateTime.now().toString();
    }

    public Notification(String userId, String senderId, String senderName, String type, String title, String message) {
        this.userId = userId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.type = type;
        this.title = title;
        this.message = message;
        this.read = false;
        this.createdAt = java.time.LocalDateTime.now().toString();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getActionId() {
        return actionId;
    }

    public void setActionId(String actionId) {
        this.actionId = actionId;
    }
}