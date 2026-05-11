package com.clinicalappointmentsystem.controller;

import com.clinicalappointmentsystem.dto.DoctorResponse;
import com.clinicalappointmentsystem.dto.DoctorUpsertRequest;
import com.clinicalappointmentsystem.dto.SlotGenerationRequest;
import com.clinicalappointmentsystem.service.DoctorService;
import com.clinicalappointmentsystem.service.SlotGenerationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DoctorService doctorService;
    private final SlotGenerationService slotGenerationService;

    public AdminController(DoctorService doctorService, SlotGenerationService slotGenerationService) {
        this.doctorService = doctorService;
        this.slotGenerationService = slotGenerationService;
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> listDoctors() {
        return doctorService.findAll();
    }

    @PostMapping("/doctors")
    @ResponseStatus(HttpStatus.CREATED)
    public DoctorResponse createDoctor(@Valid @RequestBody DoctorUpsertRequest request) {
        return doctorService.create(request);
    }

    @PutMapping("/doctors/{doctorId}")
    public DoctorResponse updateDoctor(@PathVariable Long doctorId, @Valid @RequestBody DoctorUpsertRequest request) {
        return doctorService.update(doctorId, request);
    }

    @PutMapping("/doctors/{doctorId}/deactivate")
    public DoctorResponse deactivateDoctor(@PathVariable Long doctorId) {
        return doctorService.setActive(doctorId, false);
    }

    @PutMapping("/doctors/{doctorId}/activate")
    public DoctorResponse activateDoctor(@PathVariable Long doctorId) {
        return doctorService.setActive(doctorId, true);
    }

    @PostMapping("/slots/generate")
    public Map<String, Object> generateSlots(@Valid @RequestBody SlotGenerationRequest request) {
        int created = slotGenerationService.generateSlots(request);
        return Map.of("createdSlots", created);
    }
}
