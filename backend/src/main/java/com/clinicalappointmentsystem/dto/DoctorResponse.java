package com.clinicalappointmentsystem.dto;

public record DoctorResponse(
    Long id,
    String name,
    String specialty,
    String workingHours,
    String availabilityRules,
    boolean active,
    Long linkedUserId,
    String linkedUserEmail
) {
}
