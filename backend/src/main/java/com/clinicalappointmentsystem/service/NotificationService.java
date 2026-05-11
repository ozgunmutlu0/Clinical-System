package com.clinicalappointmentsystem.service;

import com.clinicalappointmentsystem.domain.Appointment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final JavaMailSender mailSender;

    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendAppointmentConfirmation(Appointment appointment) {
        sendMail(appointment, "Appointment Confirmation");
        log.info("Simulated SMS confirmation for appointment {}", appointment.getId());
    }

    @Async
    public void sendAppointmentCancellation(Appointment appointment) {
        sendMail(appointment, "Appointment Cancellation");
        log.info("Simulated SMS cancellation for appointment {}", appointment.getId());
    }

    private void sendMail(Appointment appointment, String subject) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(appointment.getPatient().getEmail());
            message.setSubject(subject);
            message.setText("Appointment with " + appointment.getDoctor().getName() + " on " + appointment.getDate() + " at " + appointment.getTime());
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Mail sending skipped: {}", exception.getMessage());
        }
    }
}
