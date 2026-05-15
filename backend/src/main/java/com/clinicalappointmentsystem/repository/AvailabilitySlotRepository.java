package com.clinicalappointmentsystem.repository;

import com.clinicalappointmentsystem.domain.AvailabilitySlot;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Long> {

    List<AvailabilitySlot> findByDoctor_IdAndDateAndBookedFalseOrderByTimeAsc(Long doctorId, LocalDate date);

    Optional<AvailabilitySlot> findByDoctor_IdAndDateAndTime(Long doctorId, LocalDate date, LocalTime time);

    boolean existsByDoctor_IdAndDateAndTime(Long doctorId, LocalDate date, LocalTime time);

    void deleteByDateBefore(LocalDate date);

    @Query("""
        SELECT DISTINCT s.date FROM AvailabilitySlot s
        WHERE s.doctor.id = :doctorId
          AND s.booked = false
          AND s.date >= :fromDate
          AND s.date <= :toDate
        ORDER BY s.date ASC
        """)
    List<LocalDate> findAvailableDates(
        @Param("doctorId") Long doctorId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );
}
