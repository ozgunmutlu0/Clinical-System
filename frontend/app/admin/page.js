"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { FormField } from "@/components/ui/FormField";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  adminAppointments,
  adminAppointmentsColumns,
  adminDoctors,
  adminDoctorColumns
} from "@/data/mockData";

const initialDoctorForm = {
  name: "",
  specialty: "",
  workingHours: "",
  availabilityRule: ""
};

export default function AdminPanelPage() {
  const [doctors, setDoctors] = useState(adminDoctors);
  const [appointments, setAppointments] = useState(adminAppointments);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const doctorRows = useMemo(
    () =>
      doctors.map((doctor) => ({
        ...doctor,
        active: <StatusBadge status={doctor.active ? "Active" : "Inactive"} />,
        actions: (
          <button
            type="button"
            className="table-action"
            onClick={() => {
              setDoctors((current) =>
                current.map((item) =>
                  item.id === doctor.id ? { ...item, active: !item.active } : item
                )
              );
              setFeedback(`Doctor ${doctor.name} updated.`);
            }}
          >
            {doctor.active ? "Deactivate" : "Activate"}
          </button>
        )
      })),
    [doctors]
  );

  const appointmentRows = useMemo(
    () =>
      appointments
        .filter((appointment) =>
          [appointment.doctor, appointment.patient, appointment.status]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
        .map((appointment) => ({
          ...appointment,
          status: <StatusBadge status={appointment.status} />
        })),
    [appointments, searchTerm]
  );

  function updateDoctorForm(field, value) {
    setDoctorForm((current) => ({ ...current, [field]: value }));
  }

  function submitDoctor(event) {
    event.preventDefault();
    setError("");
    setFeedback("");
    if (
      !doctorForm.name ||
      !doctorForm.specialty ||
      !doctorForm.workingHours ||
      !doctorForm.availabilityRule
    ) {
      setError("Complete all doctor management fields.");
      return;
    }

    setDoctors((current) => [
      {
        id: "DOC-" + (current.length + 1).toString().padStart(3, "0"),
        name: doctorForm.name,
        specialty: doctorForm.specialty,
        workingHours: doctorForm.workingHours,
        availabilityRule: doctorForm.availabilityRule,
        active: true
      },
      ...current
    ]);
    setDoctorForm(initialDoctorForm);
    setFeedback("Doctor created successfully.");
  }

  function bulkGenerateSlots() {
    setFeedback("Bulk slot generation queued for the next 30 days.");
    setModalOpen(false);
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <span className="pill pill-accent">Admin Panel</span>
          <h1>Doctor management and appointment control</h1>
          <p>
            Create or deactivate doctors, define availability rules, generate slots in bulk, and
            filter appointment activity from one administrative workspace.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Generate Slots
          </Button>
          <Button>Review Reports</Button>
        </div>
      </section>

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading
            eyebrow="Doctors"
            title="Create / update / deactivate"
            description="Availability rules and working hours are managed here."
          />
          <form className="stack" onSubmit={submitDoctor}>
            <FormField
              label="Doctor name"
              value={doctorForm.name}
              onChange={(event) => updateDoctorForm("name", event.target.value)}
              placeholder="Dr. Selin Demir"
              required
            />
            <FormField
              label="Specialty"
              value={doctorForm.specialty}
              onChange={(event) => updateDoctorForm("specialty", event.target.value)}
              placeholder="Neurology"
              required
            />
            <FormField
              label="Working hours"
              value={doctorForm.workingHours}
              onChange={(event) => updateDoctorForm("workingHours", event.target.value)}
              placeholder="Mon-Fri 09:00 - 17:00"
              required
            />
            <FormField
              label="Availability rule"
              value={doctorForm.availabilityRule}
              onChange={(event) => updateDoctorForm("availabilityRule", event.target.value)}
              placeholder="30-minute slots, lunch blocked 12:30-13:30"
              required
            />
            <Button type="submit">Save Doctor</Button>
          </form>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {feedback ? <p className="form-message form-message--success">{feedback}</p> : null}
        </GlassCard>

        <GlassCard>
          <SectionHeading
            eyebrow="Filters"
            title="Search appointments"
            description="Quick filtering by doctor, patient, or status."
          />
          <FormField
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by doctor, patient, or status"
          />
          <div className="summary-grid">
            <div className="summary-tile">
              <span>Doctors</span>
              <strong>{doctors.length}</strong>
            </div>
            <div className="summary-tile">
              <span>Appointments</span>
              <strong>{appointments.length}</strong>
            </div>
            <div className="summary-tile">
              <span>Active rules</span>
              <strong>12</strong>
            </div>
            <div className="summary-tile">
              <span>Pending review</span>
              <strong>4</strong>
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Doctor Directory"
          title="Managed doctor roster"
          description="Admins can activate or deactivate clinicians directly in the table."
        />
        <GlassCard>
          <DataTable columns={adminDoctorColumns} rows={doctorRows} />
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Appointments"
          title="Filtered appointment board"
          description="Search and review appointment records across the system."
        />
        <GlassCard>
          <DataTable columns={adminAppointmentsColumns} rows={appointmentRows} />
        </GlassCard>
      </section>

      <Modal
        open={modalOpen}
        title="Bulk slot generation"
        description="Generate appointment availability for the next scheduling period."
        onClose={() => setModalOpen(false)}
      >
        <div className="stack">
          <p className="modal-copy">
            This action simulates the admin endpoint that creates future availability slots in
            bulk according to the working-hour rules defined for each doctor.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={bulkGenerateSlots}>Generate Slots</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
