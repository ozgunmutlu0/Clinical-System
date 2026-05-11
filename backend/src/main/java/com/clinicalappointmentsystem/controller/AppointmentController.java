package com.clinicalappointmentsystem.controller;

import com.clinicalappointmentsystem.domain.AppointmentStatus;
import com.clinicalappointmentsystem.dto.AppointmentRequest;
import com.clinicalappointmentsystem.dto.AppointmentResponse;
import com.clinicalappointmentsystem.dto.AppointmentStatusUpdateRequest;
import com.clinicalappointmentsystem.service.AppointmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<AppointmentResponse> listAppointments() {
        return appointmentService.listForCurrentUser();
    }

    @GetMapping("/{appointmentId}")
    public AppointmentResponse getAppointment(@PathVariable Long appointmentId) {
        return appointmentService.findById(appointmentId);
    }

    @GetMapping("/search")
    public List<AppointmentResponse> searchAppointments(@RequestParam(required = false) String q) {
        return appointmentService.search(q);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public AppointmentResponse createAppointment(@Valid @RequestBody AppointmentRequest request) {
        return appointmentService.create(request);
    }

    @PutMapping("/{appointmentId}/status")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public AppointmentResponse updateStatus(
        @PathVariable Long appointmentId,
        @Valid @RequestBody AppointmentStatusUpdateRequest request
    ) {
        return appointmentService.updateStatus(appointmentId, request.status());
    }

    @PutMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public AppointmentResponse cancel(@PathVariable Long appointmentId) {
        return appointmentService.updateStatus(appointmentId, AppointmentStatus.CANCELED);
    }

    @DeleteMapping("/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long appointmentId) {
        appointmentService.delete(appointmentId);
        return ResponseEntity.noContent().build();
    }
}
