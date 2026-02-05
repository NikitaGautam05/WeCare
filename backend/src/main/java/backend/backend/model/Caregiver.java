package backend.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "caregivers")
public class Caregiver {

    @Id
    private String id;

    private String fullName;
    private String address;
    private String phoneNumber;
    private String email;
    private String details;
    private String experience;
    private String speciality;
    private String chargeMin;
    private String chargeMax;

    private String profilePhoto;       // store filename or URL
    private String citizenshipPhoto;   // store filename or URL

    public List<String> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<String> notifications) {
        this.notifications = notifications;
    }

    private List<String> notifications = new ArrayList<>();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getSpeciality() { return speciality; }
    public void setSpeciality(String speciality) { this.speciality = speciality; }
    public String getChargeMin() { return chargeMin; }
    public void setChargeMin(String chargeMin) { this.chargeMin = chargeMin; }
    public String getChargeMax() { return chargeMax; }
    public void setChargeMax(String chargeMax) { this.chargeMax = chargeMax; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public String getCitizenshipPhoto() { return citizenshipPhoto; }
    public void setCitizenshipPhoto(String citizenshipPhoto) { this.citizenshipPhoto = citizenshipPhoto; }
}
