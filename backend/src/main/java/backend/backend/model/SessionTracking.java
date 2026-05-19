package backend.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "session_tracking")
public class SessionTracking {
    @Id
    private String id;
    private String userId;
    private long totalSessions;
    private long lastPromptedAt; // Session number at which user was last prompted
    private Boolean profileUpdateNeeded;
    private String createdAt;
    private String updatedAt;

    public SessionTracking() {}

    public SessionTracking(String userId) {
        this.userId = userId;
        this.totalSessions = 0;
        this.lastPromptedAt = 0;
        this.profileUpdateNeeded = false;
        this.createdAt = java.time.LocalDateTime.now().toString();
        this.updatedAt = java.time.LocalDateTime.now().toString();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public long getLastPromptedAt() { return lastPromptedAt; }
    public void setLastPromptedAt(long lastPromptedAt) { this.lastPromptedAt = lastPromptedAt; }

    public Boolean getProfileUpdateNeeded() { return profileUpdateNeeded; }
    public void setProfileUpdateNeeded(Boolean profileUpdateNeeded) { this.profileUpdateNeeded = profileUpdateNeeded; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
