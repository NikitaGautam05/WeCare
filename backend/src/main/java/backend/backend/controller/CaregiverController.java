package backend.backend.controller;

import backend.backend.model.Caregiver;
import backend.backend.service.CaregiverService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/api/caregivers")

public class CaregiverController {
    private final CaregiverService caregiverService;
    public CaregiverController (CaregiverService caregiverService){
        this.caregiverService=caregiverService;
    }
@PostMapping("/add")
    public Caregiver addCaregiver(@RequestBody Caregiver caregiver){
        return  caregiverService.saveCaregiver(caregiver);
}
@GetMapping("/all")
    public List <Caregiver> getAllCaregivers(){
        return caregiverService.getAllCaregivers();
}
}
