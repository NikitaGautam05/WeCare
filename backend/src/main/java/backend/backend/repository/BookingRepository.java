package backend.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import backend.backend.model.Booking;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByCaregiverId(String caregiverId);
    List<Booking> findByUserId(String userId);
    List<Booking> findByCaregiverIdAndUserId(String caregiverId, String userId);
    List<Booking> findByCaregiverIdAndStatus(String caregiverId, String status);
    List<Booking> findByUserIdAndStatus(String userId, String status);
    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);
    long countByUserIdAndStatus(String userId, String status);
}
