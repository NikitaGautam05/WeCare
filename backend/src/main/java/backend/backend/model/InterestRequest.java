package backend.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "interest_requests")
public class InterestRequest {
    @Id
    private String id;
    private String caregiverId;
    private String caregiverName;
    private String userId;
    private String userName;
    private String status; // PENDING, ACCEPTED, REJECTED
    private String sentAt;
    private String respondedAt;

    public InterestRequest() {}

    public InterestRequest(String caregiverId, String caregiverName, String userId, String userName) {
        this.caregiverId = caregiverId;
        this.caregiverName = caregiverName;
        this.userId = userId;
        this.userName = userName;
        this.status = "PENDING";
        this.sentAt = java.time.LocalDateTime.now().toString();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCaregiverId() { return caregiverId; }
    public void setCaregiverId(String caregiverId) { this.caregiverId = caregiverId; }

    public String getCaregiverName() { return caregiverName; }
    public void setCaregiverName(String caregiverName) { this.caregiverName = caregiverName; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSentAt() { return sentAt; }
    public void setSentAt(String sentAt) { this.sentAt = sentAt; }

    public String getRespondedAt() { return respondedAt; }
    public void setRespondedAt(String respondedAt) { this.respondedAt = respondedAt; }
}
