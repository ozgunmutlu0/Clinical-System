package com.clinicalappointmentsystem.repository;

import com.clinicalappointmentsystem.domain.Appointment;
import com.clinicalappointmentsystem.domain.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.doctor
        WHERE a.patient.id = :patientId
        ORDER BY a.date DESC, a.time DESC
        """)
    List<Appointment> findByPatient_IdOrderByDateDescTimeDesc(@Param("patientId") Long patientId);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.doctor
        WHERE a.doctor.id = :doctorId
        ORDER BY a.date ASC, a.time ASC
        """)
    List<Appointment> findByDoctor_IdOrderByDateAscTimeAsc(@Param("doctorId") Long doctorId);

    boolean existsByDoctor_IdAndDateAndTimeAndStatusNot(Long doctorId, LocalDate date, LocalTime time, AppointmentStatus status);

    List<Appointment> findByDateBefore(LocalDate date);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.doctor
        WHERE lower(a.doctor.name) LIKE lower(concat('%', :query, '%'))
           OR lower(a.patient.name) LIKE lower(concat('%', :query, '%'))
        ORDER BY a.date ASC, a.time ASC
        """)
    List<Appointment> searchByDoctorOrPatient(@Param("query") String query);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.doctor
        ORDER BY a.date DESC, a.time DESC
        """)
    List<Appointment> findAllWithDetails();

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.patient
        JOIN FETCH a.doctor
        WHERE a.id = :id
        """)
    Optional<Appointment> findByIdWithDetails(@Param("id") Long id);
}
