package com.clinicalappointmentsystem.dto;

import com.clinicalappointmentsystem.domain.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentResponse(
    Long id,
    String patientName,
    String patientEmail,
    String doctorName,
    String specialty,
    LocalDate date,
    LocalTime time,
    AppointmentStatus status,
    String reason
) {
}
