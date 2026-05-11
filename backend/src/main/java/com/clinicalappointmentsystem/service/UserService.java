package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.dto.UserResponse;
import com.clinicalappointmentsystem.exception.NotFoundException;
import com.clinicalappointmentsystem.repository.UserRepository;
import com.clinicalappointmentsystem.security.SecurityUtils;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse currentUser() {
        return userRepository.findByEmailIgnoreCase(SecurityUtils.currentUsername())
            .map(user -> new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isEnabled()))
            .orElseThrow(() -> new NotFoundException("Current user not found"));
    }

    public List<UserResponse> listPatients() {
        return userRepository.findByRole(com.clinicalappointmentsystem.domain.Role.PATIENT)
            .stream()
            .map(user -> new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isEnabled()))
            .toList();
    }
}
