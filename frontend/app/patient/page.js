"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CalendarWidget } from "@/components/ui/CalendarWidget";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  demoAppointments,
  demoDoctors,
  patientHistoryColumns,
  patientSlotMap
} from "@/data/mockData";

const initialLogin = { email: "", password: "" };
const initialRegister = { name: "", email: "", password: "", phone: "" };
const initialBooking = { doctorId: "", slot: "", reason: "" };

export default function PatientDashboardPage() {
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [bookingForm, setBookingForm] = useState(initialBooking);
  const [appointments, setAppointments] = useState(demoAppointments);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  const selectedDateKey = selectedDate.toISOString().slice(0, 10);
  const availableSlots = patientSlotMap[selectedDateKey] || [];
  const selectedDoctor = demoDoctors.find((doctor) => doctor.id === bookingForm.doctorId);

  const appointmentRows = useMemo(
    () =>
      appointments.map((appointment) => ({
        ...appointment,
        status: <StatusBadge status={appointment.status} />,
        doctor: appointment.doctor,
        actions:
          appointment.status === "Canceled" ? (
            <span className="table-action table-action--muted">Closed</span>
          ) : (
            <button
              type="button"
              className="table-action"
              onClick={() => setCancelTarget(appointment)}
            >
              Cancel
            </button>
          )
      })),
    [appointments]
  );

  function updateField(setter, field, value) {
    setter((current) => ({ ...current, [field]: value }));
  }

  function submitLogin(event) {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (!loginForm.email || !loginForm.password) {
      setError("Email and password are required.");
      return;
    }
    setFeedback("Patient login successful. Your dashboard is ready.");
  }

  function submitRegister(event) {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone) {
      setError("Please complete all registration fields.");
      return;
    }
    setFeedback("Patient account created successfully.");
    setRegisterForm(initialRegister);
  }

  function submitBooking(event) {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (!bookingForm.doctorId || !bookingForm.slot || !bookingForm.reason) {
      setError("Doctor, time slot, and reason are required.");
      return;
    }

    setAppointments((current) => [
      {
        id: "APT-" + (current.length + 1).toString().padStart(3, "0"),
        doctor: selectedDoctor?.name || "Doctor",
        department: selectedDoctor?.department || "Clinic",
        date: selectedDateKey,
        time: bookingForm.slot,
        status: "Scheduled",
        reason: bookingForm.reason
      },
      ...current
    ]);

    setBookingForm(initialBooking);
    setFeedback("Appointment booked successfully.");
  }

  function confirmCancellation() {
    if (!cancelTarget) {
      return;
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === cancelTarget.id
          ? { ...appointment, status: "Canceled" }
          : appointment
      )
    );
    setCancelTarget(null);
    setFeedback("Appointment canceled successfully.");
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <span className="pill pill-accent">Patient Portal</span>
          <h1>Book, manage, and track appointments</h1>
          <p>
            Patients can register, sign in, browse availability, reserve slots, and review
            appointment history from a single responsive dashboard.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <Button variant="secondary">Download Summary</Button>
          <Button>Book Appointment</Button>
        </div>
      </section>

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading
            eyebrow="Access"
            title="Register / Login"
            description="Both forms are validated and keyboard-accessible."
          />
          <div className="auth-grid">
            <form className="stack" onSubmit={submitLogin}>
              <h3>Login</h3>
              <FormField
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={(event) => updateField(setLoginForm, "email", event.target.value)}
                placeholder="patient@example.com"
                required
              />
              <FormField
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(event) => updateField(setLoginForm, "password", event.target.value)}
                placeholder="••••••••"
                required
              />
              <Button type="submit">Login</Button>
            </form>

            <form className="stack" onSubmit={submitRegister}>
              <h3>Create account</h3>
              <FormField
                label="Full name"
                value={registerForm.name}
                onChange={(event) => updateField(setRegisterForm, "name", event.target.value)}
                placeholder="Ayse Yilmaz"
                required
              />
              <FormField
                label="Email"
                type="email"
                value={registerForm.email}
                onChange={(event) => updateField(setRegisterForm, "email", event.target.value)}
                placeholder="ayse@example.com"
                required
              />
              <FormField
                label="Phone"
                value={registerForm.phone}
                onChange={(event) => updateField(setRegisterForm, "phone", event.target.value)}
                placeholder="+90 555 000 0000"
                required
              />
              <FormField
                label="Password"
                type="password"
                value={registerForm.password}
                onChange={(event) => updateField(setRegisterForm, "password", event.target.value)}
                placeholder="Create a secure password"
                required
              />
              <Button type="submit" variant="secondary">
                Register
              </Button>
            </form>
          </div>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {feedback ? <p className="form-message form-message--success">{feedback}</p> : null}
        </GlassCard>

        <GlassCard>
          <SectionHeading
            eyebrow="Calendar"
            title="Available appointment slots"
            description="Calendar view and slot grid react to date selection."
          />
          <CalendarWidget selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <div className="slot-panel">
            <p className="slot-panel__heading">Available on {selectedDateKey}</p>
            <div className="slot-grid">
              {availableSlots.length ? (
                availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={slot === bookingForm.slot ? "slot-pill is-active" : "slot-pill"}
                    onClick={() => updateField(setBookingForm, "slot", slot)}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <p className="empty-copy">No slots generated for this day yet.</p>
              )}
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading
            eyebrow="Booking"
            title="Reserve a consultation"
            description="Validation, success messaging, and accessible labels are included."
          />
          <form className="stack" onSubmit={submitBooking}>
            <FormField
              as="select"
              label="Doctor"
              value={bookingForm.doctorId}
              onChange={(event) => updateField(setBookingForm, "doctorId", event.target.value)}
              options={[
                { label: "Select a doctor", value: "" },
                ...demoDoctors.map((doctor) => ({
                  label: `${doctor.name} — ${doctor.specialty}`,
                  value: doctor.id
                }))
              ]}
              required
            />
            <FormField
              label="Department"
              value={selectedDoctor?.department || ""}
              readOnly
              placeholder="Auto-filled after doctor selection"
            />
            <FormField
              as="textarea"
              label="Reason for visit"
              value={bookingForm.reason}
              onChange={(event) => updateField(setBookingForm, "reason", event.target.value)}
              placeholder="Describe symptoms or consultation purpose"
              required
            />
            <Button type="submit">Confirm Booking</Button>
          </form>
        </GlassCard>

        <GlassCard>
          <SectionHeading
            eyebrow="Summary"
            title="Next visit overview"
            description="Patients always see the next reservation and current dashboard state."
          />
          <div className="summary-card">
            <span className="summary-card__label">Next appointment</span>
            <h3>{appointments[0]?.doctor || "No appointment scheduled"}</h3>
            <p>
              {appointments[0]
                ? `${appointments[0].date} at ${appointments[0].time}`
                : "Choose a slot to book your first visit."}
            </p>
            <StatusBadge status={appointments[0]?.status || "Open"} />
          </div>
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="History"
          title="Appointment history"
          description="Patients can review and cancel appointments from the table below."
        />
        <GlassCard>
          <DataTable columns={patientHistoryColumns} rows={appointmentRows} />
        </GlassCard>
      </section>

      <Modal
        open={Boolean(cancelTarget)}
        title="Cancel appointment"
        description="This action will update the booking status and release the slot."
        onClose={() => setCancelTarget(null)}
      >
        <p className="modal-copy">
          Are you sure you want to cancel the appointment with {cancelTarget?.doctor} on{" "}
          {cancelTarget?.date} at {cancelTarget?.time}?
        </p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setCancelTarget(null)}>
            Keep Appointment
          </Button>
          <Button onClick={confirmCancellation}>Confirm Cancellation</Button>
        </div>
      </Modal>
    </main>
  );
}
