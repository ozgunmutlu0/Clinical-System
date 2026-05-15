package com.clinicalappointmentsystem.config;

import com.clinicalappointmentsystem.domain.Doctor;
import com.clinicalappointmentsystem.dto.SlotGenerationRequest;
import com.clinicalappointmentsystem.repository.DoctorRepository;
import com.clinicalappointmentsystem.service.SlotGenerationService;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class SlotStartupRunner {

    private static final Logger log = LoggerFactory.getLogger(SlotStartupRunner.class);

    private final DoctorRepository doctorRepository;
    private final SlotGenerationService slotGenerationService;

    public SlotStartupRunner(DoctorRepository doctorRepository, SlotGenerationService slotGenerationService) {
        this.doctorRepository = doctorRepository;
        this.slotGenerationService = slotGenerationService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureUpcomingSlots() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(30);
        for (Doctor doctor : doctorRepository.findByActiveTrueOrderByNameAsc()) {
            int created = slotGenerationService.generateSlots(
                new SlotGenerationRequest(doctor.getId(), start, end, 30)
            );
            if (created > 0) {
                log.info("Startup: created {} slots for doctor {}", created, doctor.getName());
            }
        }
    }
}
