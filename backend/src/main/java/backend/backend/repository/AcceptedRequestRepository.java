package backend.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import backend.backend.model.AcceptedRequest;

@Repository
public interface AcceptedRequestRepository extends MongoRepository<AcceptedRequest, String> {
    List<AcceptedRequest> findByCaregiverId(String caregiverId);
    List<AcceptedRequest> findByUserId(String userId);
    AcceptedRequest findByConversationId(String conversationId);
    List<AcceptedRequest> findByCaregiverIdAndUserId(String caregiverId, String userId);
}
