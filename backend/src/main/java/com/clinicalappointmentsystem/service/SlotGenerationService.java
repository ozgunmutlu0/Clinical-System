package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.domain.AvailabilitySlot;
import com.clinicalappointmentsystem.domain.Doctor;
import com.clinicalappointmentsystem.dto.SlotGenerationRequest;
import com.clinicalappointmentsystem.repository.AvailabilitySlotRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SlotGenerationService {

    private final DoctorService doctorService;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    public SlotGenerationService(DoctorService doctorService, AvailabilitySlotRepository availabilitySlotRepository) {
        this.doctorService = doctorService;
        this.availabilitySlotRepository = availabilitySlotRepository;
    }

    @Transactional
    public int generateSlots(SlotGenerationRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
        Doctor doctor = doctorService.findEntity(request.doctorId());
        if (!doctor.isActive()) {
            throw new IllegalArgumentException("Slots can only be generated for active doctors");
        }
        List<AvailabilitySlot> slots = new ArrayList<>();

        for (LocalDate date = request.startDate(); !date.isAfter(request.endDate()); date = date.plusDays(1)) {
            if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            LocalTime start = LocalTime.of(9, 0);
            LocalTime end = LocalTime.of(17, 0);
            for (LocalTime time = start; time.isBefore(end); time = time.plusMinutes(request.slotDurationMinutes())) {
                if (availabilitySlotRepository.existsByDoctor_IdAndDateAndTime(doctor.getId(), date, time)) {
                    continue;
                }
                AvailabilitySlot slot = new AvailabilitySlot();
                slot.setDoctor(doctor);
                slot.setDate(date);
                slot.setTime(time);
                slot.setBooked(false);
                slots.add(slot);
            }
        }

        availabilitySlotRepository.saveAll(slots);
        return slots.size();
    }

    @Transactional
    public void cleanupPastSlots(LocalDate olderThan) {
        availabilitySlotRepository.deleteByDateBefore(olderThan);
    }
}
