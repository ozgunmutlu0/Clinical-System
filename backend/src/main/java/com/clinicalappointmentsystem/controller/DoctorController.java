package com.clinicalappointmentsystem.controller;

import com.clinicalappointmentsystem.dto.DoctorResponse;
import com.clinicalappointmentsystem.service.DoctorService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public List<DoctorResponse> listDoctors() {
        return doctorService.findAllActive();
    }

    @GetMapping("/{doctorId}")
    public DoctorResponse getDoctor(@PathVariable Long doctorId) {
        return doctorService.findById(doctorId);
    }

    @GetMapping("/{doctorId}/slots")
    public List<String> getAvailableSlots(
        @PathVariable Long doctorId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return doctorService.findAvailableSlots(doctorId, date);
    }
}
