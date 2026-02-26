package backend.backend.controller;

import backend.backend.model.Caregiver;
import backend.backend.service.CaregiverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/caregivers")
@CrossOrigin(origins = "http://localhost:5173")
public class CaregiverController {
    @Autowired
    private CaregiverService caregiverService;
    private final String uploadDir = "D:/fyp demo/backend/uploads/";

    @PostMapping("/add")
    public Caregiver addCaregiver(
            @RequestParam("profilePhoto") MultipartFile profilePhoto,
            @RequestParam("citizenshipPhoto") MultipartFile citizenshipPhoto,
            @RequestParam String fullName,
            @RequestParam String address,
            @RequestParam String phoneNumber,
            @RequestParam String email,
            @RequestParam String details,
            @RequestParam String experience,
            @RequestParam String speciality,
            @RequestParam String chargeMin,
            @RequestParam String chargeMax
    ) throws IOException {

        // Ensure upload folder exists
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            if (!created) {
                throw new IOException("Could not create upload directory: " + uploadDir);
            }
        }

        // Generate unique filenames
        String profileFileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename();
        String citizenshipFileName = System.currentTimeMillis() + "_" + citizenshipPhoto.getOriginalFilename();

        // Save files
        try {
            File profileDest = new File(uploadFolder, profileFileName);
            File citizenDest = new File(uploadFolder, citizenshipFileName);

            profilePhoto.transferTo(profileDest);
            citizenshipPhoto.transferTo(citizenDest);
        } catch (IOException e) {
            e.printStackTrace();
            throw new IOException("Error saving uploaded files", e);
        }

        // Build caregiver object
        Caregiver caregiver = new Caregiver();
        caregiver.setFullName(fullName);
        caregiver.setAddress(address);
        caregiver.setPhoneNumber(phoneNumber);
        caregiver.setEmail(email);
        caregiver.setDetails(details);
        caregiver.setExperience(experience);
        caregiver.setSpeciality(speciality);
        caregiver.setChargeMin(chargeMin);
        caregiver.setChargeMax(chargeMax);
        caregiver.setProfilePhoto(profileFileName);
        caregiver.setCitizenshipPhoto(citizenshipFileName);

        // Save to MongoDB
        Caregiver saved = caregiverService.saveCaregiver(caregiver);
        System.out.println("Caregiver saved with ID: " + saved.getId());

        return saved;
    }
    @GetMapping("/all")
    public List<Caregiver> getAllCaregivers() {
        return caregiverService.getAllCaregivers();
    }
    @GetMapping("/test")
    public String testDb() {
        long count = caregiverService.getAllCaregivers().size();
        return "Caregiver collection has " + count + " documents";
    }
    @PostMapping("/{id}/notify")
    public Caregiver notifyCaregiver(
            @PathVariable String id,
            @RequestParam String message
    ){
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        if (caregiver == null){
            throw new RuntimeException("Caregiver not found");
        }
        caregiver.getNotifications().add(message);
        return caregiverService.saveCaregiver(caregiver);
    }
}