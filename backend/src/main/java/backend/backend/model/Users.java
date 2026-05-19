package backend.backend.model;


import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="login")
public class Users {
    @Id
    private String id;
    private String userName;
    private String password;
    private String photo;
    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    private String confirmPassword;
//    private String photo;
    private String email;
    private String role;


    public List<String> getFavourites() {
        return favourites;
    }

    public void setFavourites(List<String> favourites) {
        this.favourites = favourites;
    }

    public List<HistoryItems> getHistory() {
        return history;
    }

    public void setHistory(List<HistoryItems> history) {
        this.history = history;
    }

    private List<String > favourites =new ArrayList<>();
    private List<HistoryItems> history = new ArrayList<>();
    private String address;
    private String serviceType;
    private String additionalInfo;
    private String receiverType; // "self" or "other"
    private String recipientRelation;
    private String recipientAge;
    private String recipientPhone;
    
    // Organization fields
    private String accountType; // "INDIVIDUAL" or "ORGANIZATION"
    private String organizationName;
    private String foundationDate;
    private String capacity;
    private String city;
    private String phoneNumber;
    private String website;
    private String aboutOrganization;
    private String licenseNumber;
    private String registrationNumber;
    private String logo;
    private String bannerImage;
    private String contactPersonName;
    private String contactPersonTitle;
    private String contactPersonPhone;

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public String getReceiverType() {
        return receiverType;
    }

    public void setReceiverType(String receiverType) {
        this.receiverType = receiverType;
    }

    public String getRecipientRelation() {
        return recipientRelation;
    }

    public void setRecipientRelation(String recipientRelation) {
        this.recipientRelation = recipientRelation;
    }

    public String getRecipientAge() {
        return recipientAge;
    }

    public void setRecipientAge(String recipientAge) {
        this.recipientAge = recipientAge;
    }

    public String getRecipientPhone() {
        return recipientPhone;
    }

    public void setRecipientPhone(String recipientPhone) {
        this.recipientPhone = recipientPhone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // Organization fields getters and setters
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getFoundationDate() { return foundationDate; }
    public void setFoundationDate(String foundationDate) { this.foundationDate = foundationDate; }

    public String getCapacity() { return capacity; }
    public void setCapacity(String capacity) { this.capacity = capacity; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getAboutOrganization() { return aboutOrganization; }
    public void setAboutOrganization(String aboutOrganization) { this.aboutOrganization = aboutOrganization; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getContactPersonName() { return contactPersonName; }
    public void setContactPersonName(String contactPersonName) { this.contactPersonName = contactPersonName; }

    public String getContactPersonTitle() { return contactPersonTitle; }
    public void setContactPersonTitle(String contactPersonTitle) { this.contactPersonTitle = contactPersonTitle; }

    public String getContactPersonPhone() { return contactPersonPhone; }
    public void setContactPersonPhone(String contactPersonPhone) { this.contactPersonPhone = contactPersonPhone; }

}

