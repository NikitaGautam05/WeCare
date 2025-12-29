package backend.backend.repository;

import backend.backend.model.Users;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.core.userdetails.User;

public interface UserRepo extends MongoRepository<Users, String> {
    Users findByUserName(String username);

}
