package com.clinicalappointmentsystem.dto;

import com.clinicalappointmentsystem.domain.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public record AppointmentStatusUpdateRequest(
    @NotNull AppointmentStatus status
) {
}
