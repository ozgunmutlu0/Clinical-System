"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api, sessionFromAuthResponse } from "@/lib/api";
import { clearAuth, getAuth, isRole, saveAuth } from "@/lib/auth";
import { formatStatus, formatTime, toApiStatus } from "@/lib/format";

const statusOptions = ["Scheduled", "Completed", "No-show", "Canceled"];
const scheduleColumns = [
  { key: "patient", label: "Patient" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status" }
];

export default function DoctorDashboardPage() {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async (session) => {
    const data = await api.getAppointments(session.token);
    setAppointments(data);
  }, []);

  useEffect(() => {
    const session = getAuth();
    if (session && isRole(session, "DOCTOR")) {
      setAuth(session);
      loadAppointments(session).catch((err) => setError(err.message));
    }
    setReady(true);
  }, [loadAppointments]);

  async function handleLogin(credentials) {
    setLoading(true);
    setError("");
    try {
      const response = await api.login(credentials);
      const session = sessionFromAuthResponse(response);
      if (session.role !== "DOCTOR") {
        throw new Error("Doctor account required. Use doctor@clinic.local / password");
      }
      saveAuth(session);
      setAuth(session);
      await loadAppointments(session);
      setMessage("Doctor schedule loaded from database.");
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearAuth();
    setAuth(null);
    setAppointments([]);
  }

  async function updateStatus(appointment, label) {
    try {
      await api.updateAppointmentStatus(auth.token, appointment.id, toApiStatus(label));
      setMessage(`Appointment #${appointment.id} updated.`);
      await loadAppointments(auth);
    } catch (err) {
      setError(err.message);
    }
  }

  const rows = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.id,
        patient: appointment.patientName,
        date: appointment.date,
        time: formatTime(appointment.time),
        reason: appointment.reason,
        status: (
          <div className="inline-status-editor">
            <StatusBadge status={formatStatus(appointment.status)} />
            <select
              aria-label={`Update status for ${appointment.patientName}`}
              value={formatStatus(appointment.status)}
              onChange={(event) => updateStatus(appointment, event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )
      })),
    [appointments, auth]
  );

  if (!ready) {
    return <main className="dashboard-shell"><p className="empty-copy">Loading...</p></main>;
  }

  if (!auth) {
    return (
      <AuthPanel
        title="Doctor sign in"
        description="Log in with your doctor account to manage appointments from the database."
        allowRegister={false}
        onLogin={handleLogin}
        onRegister={async () => {}}
        loading={loading}
      />
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((item) => item.date === today).length;

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <span className="pill pill-accent">Doctor Workspace</span>
          <h1>{auth.name}</h1>
          <p>Daily schedule and status updates synced with PostgreSQL.</p>
        </div>
        <div className="dashboard-header__actions">
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </section>

      {error ? <p className="form-message form-message--error">{error}</p> : null}
      {message ? <p className="form-message form-message--success">{message}</p> : null}

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading eyebrow="Today" title="Current summary" description="Live appointment counts." />
          <div className="summary-grid">
            <div className="summary-tile">
              <span>Total appointments</span>
              <strong>{appointments.length}</strong>
            </div>
            <div className="summary-tile">
              <span>Today</span>
              <strong>{todayCount}</strong>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Schedule" title="Appointment board" description="Status changes persist to the API." />
        <GlassCard>
          <DataTable columns={scheduleColumns} rows={rows} />
        </GlassCard>
      </section>
    </main>
  );
}
