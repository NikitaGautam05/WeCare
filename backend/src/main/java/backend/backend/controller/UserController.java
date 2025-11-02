package backend.backend.controller;

import backend.backend.model.Users;
import backend.backend.service.MyUserDetailService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {
    MyUserDetailService userService;

    @GetMapping("/users")
    public List<Users> getAllUser(){
        return userService.getAllUsers();

}
    @PostMapping("/save")
    public Users saveUser(@RequestBody Users user){
         return userService.saveUser(user);
    }
}
