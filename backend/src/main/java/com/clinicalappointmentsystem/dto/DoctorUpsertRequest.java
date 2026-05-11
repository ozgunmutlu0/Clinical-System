package com.clinicalappointmentsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoctorUpsertRequest(
    @NotBlank @Size(min = 3, max = 140) String name,
    @NotBlank @Size(min = 2, max = 120) String specialty,
    @NotBlank @Size(min = 5, max = 160) String workingHours,
    @NotBlank @Size(min = 5, max = 500) String availabilityRules,
    String email,
    String phone,
    String password
) {
}
