package backend.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "accepted_requests")
public class AcceptedRequest {
    @Id
    private String id;
    private String caregiverId;
    private String caregiverName;
    private String userId;
    private String userName;
    private String conversationId;
    private String acceptedAt;
    private boolean active;

    public AcceptedRequest() {}

    public AcceptedRequest(String caregiverId, String caregiverName, String userId, String userName) {
        this.caregiverId = caregiverId;
        this.caregiverName = caregiverName;
        this.userId = userId;
        this.userName = userName;
        this.conversationId = caregiverId + "_" + userId;
        this.acceptedAt = java.time.LocalDateTime.now().toString();
        this.active = true;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCaregiverId() {
        return caregiverId;
    }

    public void setCaregiverId(String caregiverId) {
        this.caregiverId = caregiverId;
    }

    public String getCaregiverName() {
        return caregiverName;
    }

    public void setCaregiverName(String caregiverName) {
        this.caregiverName = caregiverName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(String acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
