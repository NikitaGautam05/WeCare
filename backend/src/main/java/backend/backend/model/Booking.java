package backend.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String caregiverId;
    private String caregiverName;
    private String userId;
    private String userName;
    private String userPhone;
    private String serviceType;
    private String startTime;
    private String endTime;
    private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED
    private Double hourlyRate;
    private String location;
    private String notes;
    private String createdAt;
    private String confirmedAt;
    private String completedAt;

    public Booking() {}

    public Booking(String caregiverId, String caregiverName, String userId, String userName, 
                   String serviceType, String startTime, String endTime, Double hourlyRate) {
        this.caregiverId = caregiverId;
        this.caregiverName = caregiverName;
        this.userId = userId;
        this.userName = userName;
        this.serviceType = serviceType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.hourlyRate = hourlyRate;
        this.status = "PENDING";
        this.createdAt = java.time.LocalDateTime.now().toString();
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

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(Double hourlyRate) { this.hourlyRate = hourlyRate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(String confirmedAt) { this.confirmedAt = confirmedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
}
