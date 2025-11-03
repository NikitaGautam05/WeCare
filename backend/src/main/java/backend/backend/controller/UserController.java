package backend.backend.controller;

import backend.backend.model.Users;
import backend.backend.service.MyUserDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {
    @Autowired
    MyUserDetailService userService;

    @GetMapping("/users")
    public List<Users> getAllUser(){
        return userService.getAllUsers();

}
    @PostMapping("/save")
    public Users saveUser(@RequestBody Users user){
         return userService.saveUser(user);
    }
    // ✅ 3. Update an existing user
    @PutMapping("/update")
    public Users updateUser(@RequestBody Users user) {
        return userService.updateUser(user);
    }

    // ✅ 4. Delete a user
    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable int id) {
        Users user = new Users();
        user.setId(id);
        userService.deleteUsers(user);
        return "User deleted successfully";
    }

    // ✅ 5. Find a user by username (optional but useful)
    @GetMapping("/{username}")
    public Users getUserByUsername(@PathVariable String username) {
        return userService.getAllUsers()
                .stream()
                .filter(u -> u.getUserName().equals(username))
                .findFirst()
                .orElse(null);
    }
}
