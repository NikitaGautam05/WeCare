package backend.backend.repository;

import backend.backend.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.User;

public interface UserRepo extends JpaRepository<Users, Integer> {
    Users findByUserName(String username);

}
