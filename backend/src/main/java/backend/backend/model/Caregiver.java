package backend.backend.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Caregiver {
    private String profilephoto;
    private String citizenShipPhoto;
    private String fullName;
    private  String address;
    private int phoneNumber;
    private String email;
    private String details;
    private String experinece;
    private String speciality;

    public Caregiver(String profilephoto, String citizenShipPhoto, String fullName, String address, int phoneNumber, String email, String details, String experinece, String speciality) {
        this.profilephoto = profilephoto;
        this.citizenShipPhoto = citizenShipPhoto;
        this.fullName = fullName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.details = details;
        this.experinece = experinece;
        this.speciality = speciality;
    }

    public String getProfilephoto() {
        return profilephoto;
    }

    public void setProfilephoto(String profilephoto) {
        this.profilephoto = profilephoto;
    }

    public String getCitizenShipPhoto() {
        return citizenShipPhoto;
    }

    public void setCitizenShipPhoto(String citizenShipPhoto) {
        this.citizenShipPhoto = citizenShipPhoto;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public int getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(int phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getExperinece() {
        return experinece;
    }

    public void setExperinece(String experinece) {
        this.experinece = experinece;
    }

    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }
}
