package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.domain.Role;
import com.clinicalappointmentsystem.domain.User;
import com.clinicalappointmentsystem.dto.AuthResponse;
import com.clinicalappointmentsystem.dto.LoginRequest;
import com.clinicalappointmentsystem.dto.RegisterRequest;
import com.clinicalappointmentsystem.exception.ConflictException;
import com.clinicalappointmentsystem.exception.UnauthorizedException;
import com.clinicalappointmentsystem.repository.UserRepository;
import com.clinicalappointmentsystem.security.BruteForceProtectionService;
import com.clinicalappointmentsystem.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BruteForceProtectionService bruteForceProtectionService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        BruteForceProtectionService bruteForceProtectionService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.bruteForceProtectionService = bruteForceProtectionService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Email address is already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.PATIENT);
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds(), user.getRole().name(), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        String key = request.email().toLowerCase();
        if (bruteForceProtectionService.isBlocked(key)) {
            throw new UnauthorizedException("Too many failed login attempts. Try again later.");
        }

        User user = userRepository.findByEmailIgnoreCase(key)
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            bruteForceProtectionService.recordFailure(key);
            throw new UnauthorizedException("Invalid credentials");
        }

        bruteForceProtectionService.clear(key);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", jwtService.getExpirationSeconds(), user.getRole().name(), user.getEmail(), user.getName());
    }
}
