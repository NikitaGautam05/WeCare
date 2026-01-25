package backend.backend.repository;

import backend.backend.model.Caregiver;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CaregiverRepository extends MongoRepository<Caregiver,String> {

}
