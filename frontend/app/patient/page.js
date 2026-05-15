"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/Button";
import { CalendarWidget } from "@/components/ui/CalendarWidget";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api, sessionFromAuthResponse } from "@/lib/api";
import { clearAuth, getAuth, isRole, saveAuth } from "@/lib/auth";
import { addDays, formatStatus, formatTime, parseDateKey, toApiTime, toDateKey } from "@/lib/format";

const initialBooking = { doctorId: "", slot: "", reason: "" };
const historyColumns = [
  { key: "doctor", label: "Doctor" },
  { key: "specialty", label: "Specialty" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" }
];

export default function PatientDashboardPage() {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingForm, setBookingForm] = useState(initialBooking);
  const [selectedDate, setSelectedDate] = useState(() => addDays(new Date(), 1));
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  const selectedDateKey = toDateKey(selectedDate);
  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === bookingForm.doctorId);

  const loadDoctors = useCallback(async () => {
    const doctorList = await api.getDoctors();
    setDoctors(doctorList);
    setBookingForm((current) => {
      if (current.doctorId || !doctorList.length) {
        return current;
      }
      return { ...current, doctorId: String(doctorList[0].id) };
    });
    return doctorList;
  }, []);

  const loadPatientData = useCallback(async (session) => {
    await loadDoctors();
    try {
      const appointmentList = await api.getAppointments(session.token);
      setAppointments(appointmentList);
    } catch (err) {
      setAppointments([]);
      setError((prev) => prev || `Appointments: ${err.message}`);
    }
  }, [loadDoctors]);

  useEffect(() => {
    const session = getAuth();
    if (session && isRole(session, "PATIENT")) {
      setAuth(session);
      loadPatientData(session).catch((err) => setError(err.message));
    }
    setReady(true);
  }, [loadPatientData]);

  useEffect(() => {
    if (!bookingForm.doctorId) {
      setAvailableDates([]);
      setSlots([]);
      return;
    }

    const from = toDateKey(new Date());
    const to = toDateKey(addDays(new Date(), 60));
    let cancelled = false;

    api
      .getAvailableDates(bookingForm.doctorId, from, to)
      .then((dates) => {
        if (cancelled) {
          return;
        }
        setAvailableDates(dates);
        if (dates.length) {
          const firstDate = parseDateKey(dates[0]);
          setSelectedDate(firstDate);
          setFeedback(`Green dates have slots. Showing ${dates[0]}.`);
        } else {
          setSlots([]);
          setFeedback("No slots yet for this doctor. Admin can generate slots.");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [bookingForm.doctorId]);

  useEffect(() => {
    if (!auth?.token || !bookingForm.doctorId) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    api
      .getSlots(bookingForm.doctorId, selectedDateKey)
      .then((result) => {
        if (!cancelled) {
          setSlots(result);
          setBookingForm((current) => ({ ...current, slot: "" }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSlots([]);
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth, bookingForm.doctorId, selectedDateKey]);

  async function handleAuthSuccess(response) {
    const session = sessionFromAuthResponse(response);
    if (session.role !== "PATIENT") {
      throw new Error("This area is for patient accounts only.");
    }
    saveAuth(session);
    setAuth(session);
    setError("");
    setFeedback("Welcome! You can book an appointment now.");
    await loadPatientData(session);
  }

  async function handleLogin(credentials) {
    setLoading(true);
    try {
      const response = await api.login(credentials);
      await handleAuthSuccess(response);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(payload) {
    setLoading(true);
    try {
      const response = await api.register(payload);
      await handleAuthSuccess(response);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setAuth(null);
    setAppointments([]);
    setDoctors([]);
    setBookingForm(initialBooking);
    setFeedback("");
  }

  function updateBooking(field, value) {
    setBookingForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "doctorId") {
        next.slot = "";
      }
      return next;
    });
  }

  function handleDateChange(date) {
    setSelectedDate(date);
    setBookingForm((current) => ({ ...current, slot: "" }));
  }

  async function submitBooking(event) {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (!bookingForm.doctorId || !bookingForm.slot || !bookingForm.reason) {
      setError("Doctor, time slot, and reason are required.");
      return;
    }

    try {
      await api.createAppointment(auth.token, {
        doctorId: Number(bookingForm.doctorId),
        date: selectedDateKey,
        time: toApiTime(bookingForm.slot),
        reason: bookingForm.reason
      });
      setBookingForm(initialBooking);
      setFeedback("Appointment booked successfully.");
      await loadPatientData(auth);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmCancellation() {
    if (!cancelTarget) {
      return;
    }
    try {
      await api.cancelAppointment(auth.token, cancelTarget.id);
      setCancelTarget(null);
      setFeedback("Appointment canceled successfully.");
      await loadPatientData(auth);
    } catch (err) {
      setError(err.message);
    }
  }

  const appointmentRows = useMemo(
    () =>
      appointments.map((appointment) => {
        const statusLabel = formatStatus(appointment.status);
        return {
          id: appointment.id,
          doctor: appointment.doctorName,
          specialty: appointment.specialty,
          date: appointment.date,
          time: formatTime(appointment.time),
          status: <StatusBadge status={statusLabel} />,
          actions:
            appointment.status === "CANCELED" ? (
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
        };
      }),
    [appointments]
  );

  if (!ready) {
    return <main className="dashboard-shell"><p className="empty-copy">Loading...</p></main>;
  }

  if (!auth) {
    return (
      <AuthPanel
        title="Sign in to book an appointment"
        description="Create a patient account or log in to access real doctors, slots, and appointments from the database."
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
      />
    );
  }

  const nextAppointment = appointments[0];

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <span className="pill pill-accent">Patient Portal</span>
          <h1>Welcome, {auth.name}</h1>
          <p>Book and manage appointments connected to PostgreSQL via the Spring Boot API.</p>
        </div>
        <div className="dashboard-header__actions">
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </section>

      {error ? <p className="form-message form-message--error">{error}</p> : null}
      {feedback ? <p className="form-message form-message--success">{feedback}</p> : null}

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading
            eyebrow="Calendar"
            title="Available appointment slots"
            description="Slots come from availability_slots in the database."
          />
          <CalendarWidget
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            availableDateKeys={availableDates}
          />
          <p className="empty-copy calendar-hint">Green highlighted days have available times.</p>
          <div className="slot-panel">
            <p className="slot-panel__heading">Available on {selectedDateKey}</p>
            <div className="slot-grid">
              {slots.length ? (
                slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={formatTime(slot) === bookingForm.slot ? "slot-pill is-active" : "slot-pill"}
                    onClick={() => updateBooking("slot", formatTime(slot))}
                  >
                    {formatTime(slot)}
                  </button>
                ))
              ) : (
                <p className="empty-copy">
                  No slots on this day.
                  {availableDates.length
                    ? ` Select a green date (e.g. ${availableDates.slice(0, 3).join(", ")}).`
                    : " Ask admin to generate slots."}
                </p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeading eyebrow="Booking" title="Reserve a consultation" description="All bookings are saved to the database." />
          <form className="stack" onSubmit={submitBooking}>
            <FormField
              as="select"
              label="Doctor"
              value={bookingForm.doctorId}
              onChange={(event) => updateBooking("doctorId", event.target.value)}
              options={[
                { label: "Select a doctor", value: "" },
                ...doctors.map((doctor) => ({
                  label: `${doctor.name} — ${doctor.specialty}`,
                  value: String(doctor.id)
                }))
              ]}
              required
            />
            <FormField
              label="Specialty"
              value={selectedDoctor?.specialty || ""}
              readOnly
              placeholder="Auto-filled after doctor selection"
            />
            <FormField
              as="textarea"
              label="Reason for visit"
              value={bookingForm.reason}
              onChange={(event) => updateBooking("reason", event.target.value)}
              placeholder="Describe symptoms or consultation purpose"
              required
            />
            <Button type="submit">Confirm Booking</Button>
          </form>
        </GlassCard>
      </section>

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading eyebrow="Summary" title="Next visit overview" description="Your latest appointment from the API." />
          <div className="summary-card">
            <span className="summary-card__label">Next appointment</span>
            <h3>{nextAppointment?.doctorName || "No appointment scheduled"}</h3>
            <p>
              {nextAppointment
                ? `${nextAppointment.date} at ${formatTime(nextAppointment.time)}`
                : "Choose a slot to book your first visit."}
            </p>
            <StatusBadge status={nextAppointment ? formatStatus(nextAppointment.status) : "Open"} />
          </div>
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="History" title="Appointment history" description="Live data from PostgreSQL." />
        <GlassCard>
          <DataTable columns={historyColumns} rows={appointmentRows} />
        </GlassCard>
      </section>

      <Modal
        open={Boolean(cancelTarget)}
        title="Cancel appointment"
        description="This updates the booking in the database and frees the slot."
        onClose={() => setCancelTarget(null)}
      >
        <p className="modal-copy">
          Cancel appointment with {cancelTarget?.doctorName} on {cancelTarget?.date} at{" "}
          {formatTime(cancelTarget?.time)}?
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
