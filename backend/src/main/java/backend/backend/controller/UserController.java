package backend.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import backend.backend.model.Users;
import backend.backend.service.MyUserDetailService;

@RestController
@CrossOrigin(origins="http://localhost:5173")
public class UserController {
    @Autowired
    MyUserDetailService userService;

    @GetMapping("/users")
    public List<Users> getAllUser() {
        return userService.getAllUsers();
    }
    @PostMapping("/save")
    public Users saveUser(@RequestBody Users user) {
        return userService.saveUser(user);
    }

    @PutMapping("/update")
    public Users updateUser(@RequestBody Users user) {
        return userService.updateUser(user);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable String id) {
        Users user = new Users();
        user.setId(id);
        userService.deleteUsers(user);
        return "User deleted successfully";
    }

    @GetMapping("/{username}")
    public Users getUserByUsername(@PathVariable String username) {
        return userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(username))
                .findFirst()
                .orElse(null);
    }
@PostMapping("/api/register")
public String register(@RequestBody Users user){
        boolean exists=userService.getAllUsers().stream().anyMatch(u->u.getUserName().equals(user.getUserName()));
        if (exists){
            return "Username already exists";

        }
        userService.saveUser(user);
        return "Registration complete";

}
    @PostMapping("/api/login")
    public String login(@RequestBody Users loginRequest) {

        Users user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(loginRequest.getUserName()))
                .findFirst()
                .orElse(null);

        if (user == null) return "User not found";

        if (!user.getPassword().equals(loginRequest.getPassword()))
            return "Wrong password";

        return "Login Success";
    }

}
