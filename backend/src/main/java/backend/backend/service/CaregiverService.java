package backend.backend.service;

import backend.backend.model.Caregiver;
import backend.backend.repository.CaregiverRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CaregiverService {
    private final CaregiverRepository caregiverRepository;
    public CaregiverService(CaregiverRepository caregiverRepository){
        this.caregiverRepository=caregiverRepository;
    }
    public Caregiver saveCaregiver(Caregiver caregiver){
        Caregiver saved = caregiverRepository.save(caregiver);
        System.out.println("Saved to DB: " + saved.getId());
        return saved;
    }

    public List <Caregiver> getAllCaregivers(){
        return caregiverRepository.findAll();
    }

    public Caregiver getCaregiverById(String id){
        return caregiverRepository.findById(id).orElse(null);
    }

}
