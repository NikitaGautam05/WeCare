package backend.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import backend.backend.model.InterestRequest;

@Repository
public interface InterestRequestRepository extends MongoRepository<InterestRequest, String> {
    List<InterestRequest> findByCaregiverId(String caregiverId);
    List<InterestRequest> findByUserId(String userId);
    List<InterestRequest> findByCaregiverIdAndUserId(String caregiverId, String userId);
    List<InterestRequest> findByCaregiverIdAndStatus(String caregiverId, String status);
    List<InterestRequest> findByUserIdAndStatus(String userId, String status);
}
