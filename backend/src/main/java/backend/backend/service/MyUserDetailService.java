package backend.backend.service;

import backend.backend.model.Users;
import backend.backend.repository.UserRepo;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailService implements UserDetailsService {
    @Autowired
    private UserRepo repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
       Users user=repo.findByUserName(username);
        if (user==null) {
            System.out.println("no users found");
            throw new UsernameNotFoundException("user not found");
        }
        return null;
    }
}
