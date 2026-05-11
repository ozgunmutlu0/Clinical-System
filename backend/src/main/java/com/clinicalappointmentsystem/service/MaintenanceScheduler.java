package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.dto.SlotGenerationRequest;
import com.clinicalappointmentsystem.repository.DoctorRepository;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceScheduler.class);
    private final DoctorRepository doctorRepository;
    private final SlotGenerationService slotGenerationService;

    public MaintenanceScheduler(DoctorRepository doctorRepository, SlotGenerationService slotGenerationService) {
        this.doctorRepository = doctorRepository;
        this.slotGenerationService = slotGenerationService;
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void generateSlotsForActiveDoctors() {
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = start.plusDays(14);
        doctorRepository.findByActiveTrueOrderByNameAsc().forEach(doctor -> {
            int generated = slotGenerationService.generateSlots(new SlotGenerationRequest(doctor.getId(), start, end, 30));
            log.info("Generated {} slots for doctor {}", generated, doctor.getId());
        });
    }

    @Scheduled(cron = "0 30 2 * * *")
    public void cleanupHistoricalSlots() {
        slotGenerationService.cleanupPastSlots(LocalDate.now().minusDays(30));
    }
}
