package com.clinicalappointmentsystem.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    String role,
    String email,
    String name
) {
}
