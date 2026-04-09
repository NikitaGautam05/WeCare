package backend.backend.service;

import java.util.List;

import backend.backend.repository.CaregiverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import backend.backend.model.Admin;
import backend.backend.model.UserPrincipal;
import backend.backend.model.Users;
import backend.backend.repository.AdminRepo;
import backend.backend.repository.UserRepo;

@Service
public class MyUserDetailService implements UserDetailsService { //userDetails is a inbuilt interface which is made for user authetication so when i implement it,it will know that username and password are not random variable but a things user for user authetication
    @Autowired
    private UserRepo repo;
    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private CaregiverRepository caregiverRepo;

    @Override
    public UserDetails loadUserByUsername(String subject) throws UsernameNotFoundException {

        // 1. Try finding a standard User (Username or Email)
        Users user = repo.findByUserName(subject);
        if (user == null) {
            // Optimized: Instead of .stream(), use a findByEmail method in UserRepo
            user = repo.findAll().stream()
                    .filter(u -> subject.equals(u.getEmail()))
                    .findFirst().orElse(null);
        }

        if (user != null) {
            return new UserPrincipal(user);
        }

        // 2. NEW: Try finding a Caregiver (Crucial for Gmail Login)
        var caregiver = caregiverRepo.findByEmail(subject);
        if (caregiver != null) {
            Users tempUser = new Users();
            tempUser.setId(caregiver.getUserId());
            tempUser.setUserName(caregiver.getFullName());
            tempUser.setEmail(caregiver.getEmail());
            tempUser.setPassword("OAUTH_USER"); // Dummy password for Google users
            tempUser.setRole("CAREGIVER");
            return new UserPrincipal(tempUser);
        }

        // 3. Try finding an Admin
        Admin admin = adminRepo.findByEmail(subject);
        if (admin != null) {
            Users tempUser = new Users();
            tempUser.setUserName(admin.getEmail());
            tempUser.setPassword(admin.getPassword());
            tempUser.setRole("ADMIN");
            return new UserPrincipal(tempUser);
        }

        throw new UsernameNotFoundException("User not found: " + subject);
    }
    public Users saveUser(Users user){
        user=repo.save(user);
        return user;
    }
    public Users updateUser(Users user){
        user=repo.save(user);
        return user;
    }

    public Boolean deleteUsers(Users user){
        repo.deleteById(user.getId());
        return true;
    }
    public List<Users> getAllUsers(){
       return repo.findAll();
    }
    // Add this inside MyUserDetailService class
    public Users getUserById(String id) {
        return repo.findById(id).orElse(null);
    }
}

