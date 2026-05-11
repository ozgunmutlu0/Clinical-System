"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { doctorScheduleColumns, doctorWeeklySchedule } from "@/data/mockData";

const statusOptions = ["Completed", "No-show", "Canceled", "Scheduled"];

export default function DoctorDashboardPage() {
  const [schedule, setSchedule] = useState(doctorWeeklySchedule);
  const [message, setMessage] = useState("");

  const rows = useMemo(
    () =>
      schedule.map((appointment) => ({
        ...appointment,
        status: (
          <div className="inline-status-editor">
            <StatusBadge status={appointment.status} />
            <select
              aria-label={`Update status for ${appointment.patient}`}
              value={appointment.status}
              onChange={(event) => {
                setSchedule((current) =>
                  current.map((item) =>
                    item.id === appointment.id
                      ? { ...item, status: event.target.value }
                      : item
                  )
                );
                setMessage(`Appointment ${appointment.id} updated successfully.`);
              }}
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
    [schedule]
  );

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <div>
          <span className="pill pill-accent">Doctor Workspace</span>
          <h1>Daily and weekly schedule management</h1>
          <p>
            Doctors can review appointments, update completion states, and keep their availability
            consistent with the generated slot rules.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <Button variant="secondary">Export Schedule</Button>
          <Button>Sync Availability</Button>
        </div>
      </section>

      <section className="content-section two-column">
        <GlassCard>
          <SectionHeading
            eyebrow="Today"
            title="Current doctor summary"
            description="Daily queue and operational shortcuts live in one block."
          />
          <div className="summary-grid">
            <div className="summary-tile">
              <span>Appointments today</span>
              <strong>8</strong>
            </div>
            <div className="summary-tile">
              <span>Pending updates</span>
              <strong>3</strong>
            </div>
            <div className="summary-tile">
              <span>Clinic room</span>
              <strong>B-204</strong>
            </div>
            <div className="summary-tile">
              <span>Working hours</span>
              <strong>09:00 - 17:00</strong>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeading
            eyebrow="Queue"
            title="Weekly focus areas"
            description="Doctors stay aligned on clinical throughput and patient follow-up."
          />
          <ul className="check-list">
            <li>Review no-show and canceled visits before closing the day</li>
            <li>Mark completed consultations to keep reporting accurate</li>
            <li>Escalate special cases back to the admin board when rescheduling is required</li>
          </ul>
          {message ? <p className="form-message form-message--success">{message}</p> : null}
        </GlassCard>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Schedule"
          title="Daily / weekly appointment board"
          description="Status updates are inline and keyboard-navigable."
        />
        <GlassCard>
          <DataTable columns={doctorScheduleColumns} rows={rows} />
        </GlassCard>
      </section>
    </main>
  );
}
