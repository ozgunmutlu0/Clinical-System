package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.domain.Appointment;
import com.clinicalappointmentsystem.domain.AppointmentStatus;
import com.clinicalappointmentsystem.domain.Role;
import com.clinicalappointmentsystem.domain.User;
import com.clinicalappointmentsystem.dto.AppointmentRequest;
import com.clinicalappointmentsystem.dto.AppointmentResponse;
import com.clinicalappointmentsystem.exception.ConflictException;
import com.clinicalappointmentsystem.exception.NotFoundException;
import com.clinicalappointmentsystem.exception.UnauthorizedException;
import com.clinicalappointmentsystem.repository.AppointmentRepository;
import com.clinicalappointmentsystem.repository.AvailabilitySlotRepository;
import com.clinicalappointmentsystem.repository.UserRepository;
import com.clinicalappointmentsystem.security.SecurityUtils;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    private final UserRepository userRepository;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        AvailabilitySlotRepository availabilitySlotRepository,
        UserRepository userRepository,
        DoctorService doctorService,
        NotificationService notificationService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.availabilitySlotRepository = availabilitySlotRepository;
        this.userRepository = userRepository;
        this.doctorService = doctorService;
        this.notificationService = notificationService;
    }

    public List<AppointmentResponse> listForCurrentUser() {
        User currentUser = currentUser();
        if (currentUser.getRole().name().equals("PATIENT")) {
            return appointmentRepository.findByPatient_IdOrderByDateDescTimeDesc(currentUser.getId()).stream().map(this::toResponse).toList();
        }
        if (currentUser.getRole().name().equals("DOCTOR")) {
            return appointmentRepository.findByDoctor_IdOrderByDateAscTimeAsc(resolveDoctorIdForUser(currentUser)).stream().map(this::toResponse).toList();
        }
        return appointmentRepository.findAllWithDetails().stream().map(this::toResponse).toList();
    }

    public AppointmentResponse findById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(appointmentId)
            .orElseThrow(() -> new NotFoundException("Appointment not found"));
        validateAccessToAppointment(appointment, currentUser());
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse create(AppointmentRequest request) {
        User actor = currentUser();
        if (actor.getRole() != Role.PATIENT && actor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only patients or administrators can create appointments");
        }
        User patient = resolvePatientForBooking(actor, request.patientId());
        var doctor = doctorService.findEntity(request.doctorId());
        if (!doctor.isActive()) {
            throw new ConflictException("Requested doctor is currently inactive");
        }

        if (appointmentRepository.existsByDoctor_IdAndDateAndTimeAndStatusNot(doctor.getId(), request.date(), request.time(), AppointmentStatus.CANCELED)) {
            throw new ConflictException("Requested slot overlaps with another appointment");
        }

        var slot = availabilitySlotRepository.findByDoctor_IdAndDateAndTime(doctor.getId(), request.date(), request.time())
            .orElseThrow(() -> new ConflictException("Requested slot is not available"));

        if (slot.isBooked()) {
            throw new ConflictException("Requested slot is already booked");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDate(request.date());
        appointment.setTime(request.time());
        appointment.setReason(request.reason());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        slot.setBooked(true);

        Appointment saved = appointmentRepository.save(appointment);
        availabilitySlotRepository.save(slot);
        notificationService.sendAppointmentConfirmation(saved);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(appointmentId)
            .orElseThrow(() -> new NotFoundException("Appointment not found"));
        User currentUser = currentUser();
        validateStatusChange(appointment, currentUser, status);

        appointment.setStatus(status);
        if (status == AppointmentStatus.CANCELED) {
            availabilitySlotRepository.findByDoctor_IdAndDateAndTime(
                appointment.getDoctor().getId(),
                appointment.getDate(),
                appointment.getTime()
            ).ifPresent(slot -> {
                slot.setBooked(false);
                availabilitySlotRepository.save(slot);
            });
            notificationService.sendAppointmentCancellation(appointment);
        }

        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> search(String query) {
        User currentUser = currentUser();
        if (currentUser.getRole() == Role.ADMIN) {
            if (query == null || query.isBlank()) {
                return appointmentRepository.findAllWithDetails().stream().map(this::toResponse).toList();
            }
            return appointmentRepository
                .searchByDoctorOrPatient(query)
                .stream()
                .map(this::toResponse)
                .toList();
        }

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return listForCurrentUser()
            .stream()
            .filter(appointment -> matchesQuery(appointment, normalizedQuery))
            .toList();
    }

    @Transactional
    public void delete(Long appointmentId) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(appointmentId)
            .orElseThrow(() -> new NotFoundException("Appointment not found"));
        User currentUser = currentUser();
        validateAccessToAppointment(appointment, currentUser);

        availabilitySlotRepository.findByDoctor_IdAndDateAndTime(
            appointment.getDoctor().getId(),
            appointment.getDate(),
            appointment.getTime()
        ).ifPresent(slot -> {
            slot.setBooked(false);
            availabilitySlotRepository.save(slot);
        });

        appointmentRepository.delete(appointment);
    }

    private User currentUser() {
        return userRepository.findByEmailIgnoreCase(SecurityUtils.currentUsername())
            .orElseThrow(() -> new UnauthorizedException("Authenticated user could not be resolved"));
    }

    private Long resolveDoctorIdForUser(User currentUser) {
        return doctorService.findEntityByUser(currentUser).getId();
    }

    private User resolvePatientForBooking(User actor, Long requestedPatientId) {
        if (actor.getRole() == Role.PATIENT) {
            return actor;
        }
        if (requestedPatientId == null) {
            throw new ConflictException("Patient id is required when an administrator creates an appointment");
        }
        User patient = userRepository.findById(requestedPatientId)
            .orElseThrow(() -> new NotFoundException("Patient account not found"));
        if (patient.getRole() != Role.PATIENT) {
            throw new ConflictException("Selected user is not a patient account");
        }
        return patient;
    }

    private boolean matchesQuery(AppointmentResponse appointment, String query) {
        if (query.isBlank()) {
            return true;
        }
        return appointment.doctorName().toLowerCase(Locale.ROOT).contains(query)
            || appointment.patientName().toLowerCase(Locale.ROOT).contains(query)
            || appointment.status().name().toLowerCase(Locale.ROOT).contains(query)
            || appointment.specialty().toLowerCase(Locale.ROOT).contains(query);
    }

    private void validateAccessToAppointment(Appointment appointment, User currentUser) {
        if (currentUser.getRole().name().equals("ADMIN")) {
            return;
        }
        if (currentUser.getRole().name().equals("PATIENT") && appointment.getPatient().getId().equals(currentUser.getId())) {
            return;
        }
        if (currentUser.getRole().name().equals("DOCTOR") && appointment.getDoctor().getId().equals(resolveDoctorIdForUser(currentUser))) {
            return;
        }
        throw new UnauthorizedException("You are not allowed to access this appointment");
    }

    private void validateStatusChange(Appointment appointment, User currentUser, AppointmentStatus status) {
        if (currentUser.getRole().name().equals("ADMIN")) {
            return;
        }
        if (currentUser.getRole().name().equals("PATIENT")) {
            if (!appointment.getPatient().getId().equals(currentUser.getId()) || status != AppointmentStatus.CANCELED) {
                throw new UnauthorizedException("Patients can only cancel their own appointments");
            }
            return;
        }
        if (currentUser.getRole().name().equals("DOCTOR")) {
            Long doctorId = resolveDoctorIdForUser(currentUser);
            if (!appointment.getDoctor().getId().equals(doctorId)) {
                throw new UnauthorizedException("Doctors can only update their own appointments");
            }
            return;
        }
        throw new UnauthorizedException("Status change is not permitted");
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
            appointment.getId(),
            appointment.getPatient().getName(),
            appointment.getPatient().getEmail(),
            appointment.getDoctor().getName(),
            appointment.getDoctor().getSpecialty(),
            appointment.getDate(),
            appointment.getTime(),
            appointment.getStatus(),
            appointment.getReason()
        );
    }
}
