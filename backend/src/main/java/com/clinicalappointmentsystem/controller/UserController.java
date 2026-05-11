package com.clinicalappointmentsystem.controller;

import com.clinicalappointmentsystem.dto.UserResponse;
import com.clinicalappointmentsystem.service.UserService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.currentUser();
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public List<UserResponse> listPatients() {
        return userService.listPatients();
    }
}
