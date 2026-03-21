package backend.backend.repository;

import backend.backend.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminRepo extends MongoRepository<Admin, String> {
    Admin findByEmail(String email);
}
