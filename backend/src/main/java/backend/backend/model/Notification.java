package backend.backend.model;

public class Notification {
    private String id;
    private String message;
    private String userId; // the user who sent the interest
    private String type; // e.g., "interest"
    private boolean read = false;

    public Notification() {}

    public Notification(String message, String userId, String type) {
        this.message = message;
        this.userId = userId;
        this.type = type;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}