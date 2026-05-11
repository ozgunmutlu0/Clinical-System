package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.domain.Doctor;
import com.clinicalappointmentsystem.domain.Role;
import com.clinicalappointmentsystem.domain.User;
import com.clinicalappointmentsystem.exception.ConflictException;
import com.clinicalappointmentsystem.dto.DoctorResponse;
import com.clinicalappointmentsystem.dto.DoctorUpsertRequest;
import com.clinicalappointmentsystem.exception.NotFoundException;
import com.clinicalappointmentsystem.repository.AvailabilitySlotRepository;
import com.clinicalappointmentsystem.repository.DoctorRepository;
import com.clinicalappointmentsystem.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
        DoctorRepository doctorRepository,
        AvailabilitySlotRepository availabilitySlotRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.doctorRepository = doctorRepository;
        this.availabilitySlotRepository = availabilitySlotRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<DoctorResponse> findAllActive() {
        return doctorRepository.findByActiveTrueOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    public List<DoctorResponse> findAll() {
        return doctorRepository.findAllByOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    public Doctor findEntity(Long doctorId) {
        return doctorRepository.findById(doctorId)
            .orElseThrow(() -> new NotFoundException("Doctor not found"));
    }

    public Doctor findEntityByUser(User user) {
        return doctorRepository.findByUser_Id(user.getId())
            .orElseThrow(() -> new NotFoundException("Doctor profile not linked to this account"));
    }

    public DoctorResponse findById(Long doctorId) {
        return toResponse(findEntity(doctorId));
    }

    @Transactional
    public DoctorResponse create(DoctorUpsertRequest request) {
        Doctor doctor = new Doctor();
        apply(doctor, request);
        return toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponse update(Long doctorId, DoctorUpsertRequest request) {
        Doctor doctor = findEntity(doctorId);
        apply(doctor, request);
        return toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponse setActive(Long doctorId, boolean active) {
        Doctor doctor = findEntity(doctorId);
        doctor.setActive(active);
        return toResponse(doctorRepository.save(doctor));
    }

    public List<String> findAvailableSlots(Long doctorId, LocalDate date) {
        return availabilitySlotRepository.findByDoctor_IdAndDateAndBookedFalseOrderByTimeAsc(doctorId, date)
            .stream()
            .map(slot -> slot.getTime().toString())
            .toList();
    }

    private void apply(Doctor doctor, DoctorUpsertRequest request) {
        doctor.setUser(resolveLinkedUser(doctor.getUser(), request));
        doctor.setName(request.name());
        doctor.setSpecialty(request.specialty());
        doctor.setWorkingHours(request.workingHours());
        doctor.setAvailabilityRules(request.availabilityRules());
        if (doctor.getId() == null) {
            doctor.setActive(true);
        }
    }

    private User resolveLinkedUser(User existingUser, DoctorUpsertRequest request) {
        if (!hasText(request.email())) {
            return existingUser;
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        User user = existingUser;
        if (user == null) {
            user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
            if (user != null && user.getRole() != Role.DOCTOR) {
                throw new ConflictException("Email address already belongs to another account");
            }
            if (user == null) {
                user = new User();
                user.setRole(Role.DOCTOR);
                user.setEnabled(true);
            }
        } else if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
            && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Email address is already registered");
        }

        if (!hasText(request.phone())) {
            throw new ConflictException("Doctor phone is required when a login account is linked");
        }
        if (user.getId() == null && !hasText(request.password())) {
            throw new ConflictException("Doctor password is required when creating a linked login account");
        }

        user.setName(request.name());
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());
        user.setRole(Role.DOCTOR);

        if (hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password().trim()));
        }

        return userRepository.save(user);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private DoctorResponse toResponse(Doctor doctor) {
        return new DoctorResponse(
            doctor.getId(),
            doctor.getName(),
            doctor.getSpecialty(),
            doctor.getWorkingHours(),
            doctor.getAvailabilityRules(),
            doctor.isActive(),
            doctor.getUser() != null ? doctor.getUser().getId() : null,
            doctor.getUser() != null ? doctor.getUser().getEmail() : null
        );
    }
}
