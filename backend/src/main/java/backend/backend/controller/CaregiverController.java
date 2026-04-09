package backend.backend.controller;
import backend.backend.model.Caregiver;
import backend.backend.model.Users;
import backend.backend.repository.UserRepo;
import backend.backend.service.CaregiverService;
import backend.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;
import backend.backend.model.CaregiverStatus;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/caregivers")
@CrossOrigin(origins = "http://localhost:5173")
public class CaregiverController {
    @Autowired
    private CaregiverService caregiverService;
    private final String uploadDir = "D:/fyp demo/backend/uploads/";
@Autowired
private EmailService emailService;

@Autowired
private UserRepo userRepo;
    @PostMapping("/add")
    public Caregiver addCaregiver(
            @RequestParam String userId,  // <-- userId first
            @RequestParam("profilePhoto") MultipartFile profilePhoto,
            @RequestParam("citizenshipPhoto") MultipartFile citizenshipPhoto,
            @RequestParam String fullName,
            @RequestParam String address,
            @RequestParam String phoneNumber,

//            @RequestParam String email,
            @RequestParam String details,
            @RequestParam String experience,
            @RequestParam String speciality,
            @RequestParam String chargeMin,
            @RequestParam String chargeMax
    ) throws IOException {
        Caregiver existing = caregiverService.getByUserId(userId);
        if (existing != null) {
            throw new RuntimeException("User already has profile!");
        }


        // Ensure upload folder exists
        File uploadFolder = new File(uploadDir);
        if (!uploadFolder.exists()) {
            boolean created = uploadFolder.mkdirs();
            if (!created) {
                throw new IOException("Could not create upload directory: " + uploadDir);
            }
        }

        // Generate unique filenames
        // --- 3. Generate unique filenames ---
        String profileFileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename();
        String citizenshipFileName = System.currentTimeMillis() + "_" + citizenshipPhoto.getOriginalFilename();

        // --- 4. Save files ---
        try {
            profilePhoto.transferTo(new File(uploadFolder, profileFileName));
            citizenshipPhoto.transferTo(new File(uploadFolder, citizenshipFileName));
        } catch (IOException e) {
            throw new IOException("Error saving uploaded files", e);
        }

        // --- 5. Build caregiver object ---
        Caregiver caregiver = new Caregiver();
        caregiver.setUserId(userId);  // <-- set userId here
        caregiver.setFullName(fullName);
        caregiver.setAddress(address);
        caregiver.setPhoneNumber(phoneNumber);
        Users user = userRepo.findById(userId).orElseThrow();
        caregiver.setEmail(user.getEmail());
//        caregiver.setEmail(email);
        caregiver.setDetails(details);
        caregiver.setExperience(experience);
        caregiver.setSpeciality(speciality);
        caregiver.setChargeMin(chargeMin);
        caregiver.setChargeMax(chargeMax);
        caregiver.setProfilePhoto(profileFileName);
        caregiver.setCitizenshipPhoto(citizenshipFileName);

        // --- 6. Save to MongoDB ---
        Caregiver saved = caregiverService.saveCaregiver(caregiver);
        System.out.println("Caregiver saved with ID: " + saved.getId());

        return saved;
    }
    @GetMapping("/verified")
    public List<Caregiver> getVerifiedCaregivers(){
        return caregiverService.getCaregiversByStatus(CaregiverStatus.VERIFIED);
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
            @RequestParam String message,
            @RequestParam String userId
    ) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if (caregiver == null) {
            throw new RuntimeException("Caregiver not found");
        }

        // Save notification
        caregiver.getNotifications().add(message);

        // Get USER details
        Users user = userRepo.findById(userId).orElseThrow();

        // Send EMAIL
        emailService.sendInterestEmail(
                caregiver.getEmail(),
                user.getUserName(),
                user.getEmail()
        );

        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/{id}/interest")
    public ResponseEntity<?> handleInterest(@PathVariable String id, @RequestBody Map<String, String> request) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        String interestedUserId = request.get("userId");
        Users interestedUser = userRepo.findById(interestedUserId).orElse(null);

        if (caregiver != null && interestedUser != null) {
            // Use getUserName() if getFullName() is missing in your Users model
            String name = interestedUser.getUserName();

            // 1. Send the Email
            emailService.sendInterestEmail(
                    caregiver.getEmail(),
                    name,
                    interestedUser.getEmail()
            );

            // 2. Add to Caregiver's notification list
            caregiver.getNotifications().add("New interest from " + name + ". Check your email for futher details.");
            caregiverService.saveCaregiver(caregiver);

            return ResponseEntity.ok("Interest sent successfully");
        }
        return ResponseEntity.status(404).body("Caregiver or User not found");
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<Caregiver> getByUserId(@PathVariable String userId) {
        Caregiver caregiver = caregiverService.getByUserId(userId);

        // If no profile exists, return 200 with null or 404
        if (caregiver == null) {
            return ResponseEntity.ok(null);
        }

        return ResponseEntity.ok(caregiver);
    }
    @PutMapping("/update/{userId}")
    public Caregiver updateCaregiver(
            @PathVariable String userId,
            @RequestParam String fullName,
            @RequestParam String address,
            @RequestParam String phoneNumber,

            @RequestParam String details,
            @RequestParam String experience,
            @RequestParam String speciality,
            @RequestParam String chargeMin,
            @RequestParam String chargeMax,
            @RequestParam(required = false) MultipartFile profilePhoto,
            @RequestParam(required = false) MultipartFile citizenshipPhoto
    ) throws IOException {

        Caregiver caregiver = caregiverService.getByUserId(userId);
        if (caregiver == null) throw new RuntimeException("Profile not found");

        caregiver.setFullName(fullName);
        caregiver.setAddress(address);
        caregiver.setPhoneNumber(phoneNumber);
        Users user = userRepo.findById(userId).orElseThrow();
        caregiver.setEmail(user.getEmail());

        caregiver.setDetails(details);
        caregiver.setExperience(experience);
        caregiver.setSpeciality(speciality);
        caregiver.setChargeMin(chargeMin);
        caregiver.setChargeMax(chargeMax);

        // Handle optional photos
        if (profilePhoto != null) {
            String profileFileName = System.currentTimeMillis() + "_" + profilePhoto.getOriginalFilename();
            profilePhoto.transferTo(new File(uploadDir, profileFileName));
            caregiver.setProfilePhoto(profileFileName);
        }

        if (citizenshipPhoto != null) {
            String citizenshipFileName = System.currentTimeMillis() + "_" + citizenshipPhoto.getOriginalFilename();
            citizenshipPhoto.transferTo(new File(uploadDir, citizenshipFileName));
            caregiver.setCitizenshipPhoto(citizenshipFileName);
        }

        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/{id}/comment")
    public Caregiver addComment(
            @PathVariable String id,
            @RequestParam String comment
    ) {
        Caregiver caregiver = caregiverService.getCaregiverById(id);
        if (caregiver == null) {
            throw new RuntimeException("Caregiver not found");
        }

        // Add the simple string comment to the list
        caregiver.getComments().add(comment);

        // Save and return the updated document
        return caregiverService.saveCaregiver(caregiver);
    }
    @PostMapping("/{id}/report")
    public Caregiver reportCaregiver(@PathVariable String id) {

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if (caregiver == null) {
            throw new RuntimeException("Caregiver not found");
        }

        // increment report count
        caregiver.setReportsCount(caregiver.getReportsCount() + 1);

        return caregiverService.saveCaregiver(caregiver);
    }
//    @GetMapping("/admin/reported")
//    public List<Caregiver> getReportedCaregivers() {
//        return caregiverService.getReportedCaregivers();
//    }

}

