package backend.backend.repository;

import backend.backend.model.Caregiver;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import backend.backend.model.CaregiverStatus;
import java.util.List;

@Repository
public interface CaregiverRepository extends MongoRepository<Caregiver,String> {
    List<Caregiver> findByStatus(CaregiverStatus status);
    Caregiver findByUserId(String userId);

}
