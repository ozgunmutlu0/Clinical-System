package com.clinicalappointmentsystem.repository;

import com.clinicalappointmentsystem.domain.Doctor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByActiveTrueOrderByNameAsc();

    List<Doctor> findAllByOrderByNameAsc();

    java.util.Optional<Doctor> findByUser_Id(Long userId);
}
