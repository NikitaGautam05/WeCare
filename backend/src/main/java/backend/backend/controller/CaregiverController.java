package backend.backend.controller;
import backend.backend.model.Caregiver;
import backend.backend.service.CaregiverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;
import backend.backend.model.CaregiverStatus;
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
    @GetMapping("/verified")
    public List<Caregiver> getVerifiedCaregivers(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.VERIFIED);
    }
    @PostMapping("/admin/{id}/verify")
    public Caregiver verifyCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if(caregiver == null){
            throw new RuntimeException("Caregiver not found");
        }

        caregiver.setStatus(CaregiverStatus.VERIFIED);

        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/admin/{id}/block")
    public Caregiver blockCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        caregiver.setStatus(CaregiverStatus.BLOCKED);

        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/admin/{id}/unblock")
    public Caregiver unblockCaregiver(@PathVariable String id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        caregiver.setStatus(CaregiverStatus.VERIFIED);

        return caregiverService.saveCaregiver(caregiver);
    }
    @GetMapping("/admin/pending")
    public List<Caregiver> getPending(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.PENDING);
    }
    @GetMapping("/admin/verified")
    public List<Caregiver> getVerified(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.VERIFIED);
    }
    @GetMapping("/admin/blocked")
    public List<Caregiver> getBlocked(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.BLOCKED);
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
    @GetMapping("/{id}")
    public Caregiver getCaregiverByIdEndpoint(@PathVariable String id) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        if (caregiver == null) throw new RuntimeException("Caregiver not found");
        return caregiver;
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
