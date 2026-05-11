package com.clinicalappointmentsystem.repository;

import com.clinicalappointmentsystem.domain.Appointment;
import com.clinicalappointmentsystem.domain.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_IdOrderByDateDescTimeDesc(Long patientId);

    List<Appointment> findByDoctor_IdOrderByDateAscTimeAsc(Long doctorId);

    boolean existsByDoctor_IdAndDateAndTimeAndStatusNot(Long doctorId, LocalDate date, LocalTime time, AppointmentStatus status);

    List<Appointment> findByDateBefore(LocalDate date);

    @Query("""
        select a from Appointment a
        where lower(a.doctor.name) like lower(concat('%', :query, '%'))
           or lower(a.patient.name) like lower(concat('%', :query, '%'))
        order by a.date asc, a.time asc
        """)
    List<Appointment> searchByDoctorOrPatient(@Param("query") String query);
}
