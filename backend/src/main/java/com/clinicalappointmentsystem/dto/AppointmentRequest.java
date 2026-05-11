package com.clinicalappointmentsystem.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentRequest(
    Long patientId,
    @NotNull Long doctorId,
    @NotNull @FutureOrPresent LocalDate date,
    @NotNull LocalTime time,
    @NotBlank @Size(min = 5, max = 400) String reason
) {
}
