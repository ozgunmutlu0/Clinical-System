package com.clinicalappointmentsystem.repository;

import com.clinicalappointmentsystem.domain.AvailabilitySlot;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByDoctor_IdAndDateAndBookedFalseOrderByTimeAsc(Long doctorId, LocalDate date);

    Optional<AvailabilitySlot> findByDoctor_IdAndDateAndTime(Long doctorId, LocalDate date, LocalTime time);

    boolean existsByDoctor_IdAndDateAndTime(Long doctorId, LocalDate date, LocalTime time);

    void deleteByDateBefore(LocalDate date);
}
