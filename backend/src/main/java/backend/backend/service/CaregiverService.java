package backend.backend.service;

import backend.backend.model.Caregiver;
import backend.backend.repository.CaregiverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import backend.backend.model.CaregiverStatus;
@Service
public class CaregiverService {
    @Autowired
    CaregiverRepository  caregiverRepo;
    private final CaregiverRepository caregiverRepository;
    public CaregiverService(CaregiverRepository caregiverRepository){
        this.caregiverRepository=caregiverRepository;
    }
    public Caregiver saveCaregiver(Caregiver caregiver){
        Caregiver saved = caregiverRepository.save(caregiver);
        System.out.println("Saved to DB: " + saved.getId());
        return saved;
    }
    public List<Caregiver> getCaregiversByStatus(CaregiverStatus status){
        return caregiverRepository.findByStatus(status);
    }
    public List <Caregiver> getAllCaregivers(){
        return caregiverRepository.findAll();
    }

    public Caregiver getCaregiverById(String id){
        return caregiverRepository.findById(id).orElse(null);
    }
    public Caregiver getByUserId(String userId){
        return caregiverRepository.findByUserId(userId);
    }
    public List<Caregiver> getReportedCaregivers() {
        return caregiverRepo.findByReportsCountGreaterThan(0);
    }
}
