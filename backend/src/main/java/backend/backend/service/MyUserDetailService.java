package backend.backend.service;

import backend.backend.model.UserPrincipal;
import backend.backend.model.Users;
import backend.backend.repository.UserRepo;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailService implements UserDetailsService { //userDetails is a inbuilt interface which is made for user authetication so when i implement it,it will know that username and password are not random variable but a things user for user authetication
    @Autowired
    private UserRepo repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
       Users user=repo.findByUserName(username);
        if (user==null) {
            System.out.println("no users found");
            throw new UsernameNotFoundException("user not found");
        }
        return new UserPrincipal(user);
    }
}
