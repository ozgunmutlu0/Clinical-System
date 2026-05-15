"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { api, sessionFromAuthResponse } from "@/lib/api";
import { clearAuth, getAuth, isRole, saveAuth } from "@/lib/auth";
import { formatStatus, formatTime, toDateKey } from "@/lib/format";

const initialDoctorForm = {
  name: "",
  specialty: "",
  workingHours: "",
  availabilityRules: ""
};

const doctorColumns = [
  { key: "name", label: "Doctor" },
  { key: "specialty", label: "Specialty" },
  { key: "workingHours", label: "Hours" },
  { key: "active", label: "Status" },
  { key: "actions", label: "Actions" }
];

const appointmentColumns = [
  { key: "patient", label: "Patient" },
  { key: "doctor", label: "Doctor" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "status", label: "Status" }
];

export default function AdminPanelPage() {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [slotDoctorId, setSlotDoctorId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadAdminData = useCallback(async (session, query = "") => {
    const [doctorList, appointmentList] = await Promise.all([
      api.getAdminDoctors(session.token),
      api.searchAppointments(session.token, query)
    ]);
    setDoctors(doctorList);
    setAppointments(appointmentList);
  }, []);

  useEffect(() => {
    const session = getAuth();
    if (session && isRole(session, "ADMIN")) {
      setAuth(session);
      loadAdminData(session).catch((err) => setError(err.message));
    }
    setReady(true);
  }, [loadAdminData]);

  useEffect(() => {
    if (!auth) {
      return;
    }
    const timer = setTimeout(() => {
      loadAdminData(auth, searchTerm).catch((err) => setError(err.message));
    }, 300);
    return () => clearTimeout(timer);
  }, [auth, searchTerm, loadAdminData]);

  async function handleLogin(credentials) {
    setLoading(true);
    setError("");
    try {
      const response = await api.login(credentials);
      const session = sessionFromAuthResponse(response);
      if (session.role !== "ADMIN") {
        throw new Error("Admin account required. Use admin@clinic.local / password");
      }
      saveAuth(session);
      setAuth(session);
      await loadAdminData(session);
      setFeedback("Admin panel connected to database.");
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
    setDoctors([]);
    setAppointments([]);
  }

  function updateDoctorForm(field, value) {
    setDoctorForm((current) => ({ ...current, [field]: value }));
  }

  async function submitDoctor(event) {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (!doctorForm.name || !doctorForm.specialty || !doctorForm.workingHours || !doctorForm.availabilityRules) {
      setError("Complete all doctor fields.");
      return;
    }
    try {
      await api.createDoctor(auth.token, doctorForm);
      setDoctorForm(initialDoctorForm);
      setFeedback("Doctor created in database.");
      await loadAdminData(auth, searchTerm);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleDoctor(doctor) {
    try {
      if (doctor.active) {
        await api.deactivateDoctor(auth.token, doctor.id);
      } else {
        await api.activateDoctor(auth.token, doctor.id);
      }
      setFeedback(`Doctor ${doctor.name} updated.`);
      await loadAdminData(auth, searchTerm);
    } catch (err) {
      setError(err.message);
    }
  }

  async function bulkGenerateSlots() {
    if (!slotDoctorId) {
      setError("Select a doctor for slot generation.");
      return;
    }
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);
    try {
      const result = await api.generateSlots(auth.token, {
        doctorId: Number(slotDoctorId),
        startDate: toDateKey(start),
        endDate: toDateKey(end),
        slotDurationMinutes: 30
      });
      setModalOpen(false);
      setFeedback(`Generated ${result.createdSlots} slots.`);
    } catch (err) {
      setError(err.message);
    }
  }

  const doctorRows = useMemo(
    () =>
      doctors.map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        workingHours: doctor.workingHours,
        active: <StatusBadge status={doctor.active ? "Active" : "Inactive"} />,
        actions: (
          <button type="button" className="table-action" onClick={() => toggleDoctor(doctor)}>
            {doctor.active ? "Deactivate" : "Activate"}
          </button>
        )
      })),
    [doctors, auth, searchTerm]
  );

  const appointmentRows = useMemo(
    () =>
      appointments.map((appointment) => ({
        id: appointment.id,
        patient: appointment.patientName,
        doctor: appointment.doctorName,
        date: appointment.date,
        time: formatTime(appointment.time),
        status: <StatusBadge status={formatStatus(appointment.status)} />
      })),
    [appointments]
  );

  if (!ready) {
    return <main className="dashboard-shell"><p className="empty-copy">Loading...</p></main>;
  }

  if (!auth) {
    return (
      <AuthPanel
        title="Admin sign in"
        description="Manage doctors, slots, and appointments from the live database."
        allowRegister={false}
        onLogin={handleLogin}
        onRegister={async () => {}}
        loading={loading}
      />
    );
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <span className="pill pill-accent">Admin Panel</span>
          <h1>Clinic administration</h1>
          <p>Doctors, slots, and appointments — all backed by PostgreSQL.</p>
        </div>
        <div className="dashboard-header__actions">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Generate Slots
          </Button>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </section>

      {error ? <p className="form-message form-message--error">{error}</p> : null}
      {feedback ? <p className="form-message form-message--success">{feedback}</p> : null}

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading eyebrow="Doctors" title="Create doctor" description="Saved via POST /api/admin/doctors" />
          <form className="stack" onSubmit={submitDoctor}>
            <FormField label="Doctor name" value={doctorForm.name} onChange={(e) => updateDoctorForm("name", e.target.value)} required />
            <FormField label="Specialty" value={doctorForm.specialty} onChange={(e) => updateDoctorForm("specialty", e.target.value)} required />
            <FormField label="Working hours" value={doctorForm.workingHours} onChange={(e) => updateDoctorForm("workingHours", e.target.value)} required />
            <FormField label="Availability rules" value={doctorForm.availabilityRules} onChange={(e) => updateDoctorForm("availabilityRules", e.target.value)} required />
            <Button type="submit">Save Doctor</Button>
          </form>
        </GlassCard>

        <GlassCard>
          <SectionHeading eyebrow="Filters" title="Search appointments" description="Live search against the API." />
          <FormField label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Doctor, patient, status..." />
          <div className="summary-grid">
            <div className="summary-tile"><span>Doctors</span><strong>{doctors.length}</strong></div>
            <div className="summary-tile"><span>Appointments</span><strong>{appointments.length}</strong></div>
          </div>
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Doctor Directory" title="Managed doctors" description="Activate or deactivate clinicians." />
        <GlassCard><DataTable columns={doctorColumns} rows={doctorRows} /></GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading eyebrow="Appointments" title="Appointment board" description="Filtered from the database." />
        <GlassCard><DataTable columns={appointmentColumns} rows={appointmentRows} /></GlassCard>
      </section>

      <Modal open={modalOpen} title="Bulk slot generation" description="Creates availability_slots for the next 30 days." onClose={() => setModalOpen(false)}>
        <div className="stack">
          <FormField
            as="select"
            label="Doctor"
            value={slotDoctorId}
            onChange={(e) => setSlotDoctorId(e.target.value)}
            options={[
              { label: "Select doctor", value: "" },
              ...doctors.map((d) => ({ label: d.name, value: String(d.id) }))
            ]}
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={bulkGenerateSlots}>Generate Slots</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
