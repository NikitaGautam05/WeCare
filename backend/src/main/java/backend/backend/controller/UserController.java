package backend.backend.controller;

import backend.backend.service.MyUserDetailService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class UserController {
    MyUserDetailService userService;

    @GetMapping("/details")
        userService.getAllUser();



}
