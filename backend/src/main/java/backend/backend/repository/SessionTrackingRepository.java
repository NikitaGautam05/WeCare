package backend.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import backend.backend.model.SessionTracking;

@Repository
public interface SessionTrackingRepository extends MongoRepository<SessionTracking, String> {
    Optional<SessionTracking> findByUserId(String userId);
}
