"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";

function DoctorPreview({ doctor }) {
  return (
    <GlassCard className="doctor-preview">
      <div className="doctor-preview__header">
        <div>
          <span className="badge badge-soft">{doctor.specialty}</span>
          <h3>{doctor.name}</h3>
        </div>
        <div className="avatar">{initials(doctor.name)}</div>
      </div>
      <p>{doctor.availabilityRules}</p>
      <div className="doctor-preview__meta">
        <span>{doctor.specialty}</span>
        <span>{doctor.workingHours}</span>
      </div>
    </GlassCard>
  );
}

export function HomeDoctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  if (!doctors.length) {
    return <p className="empty-copy">Loading doctors from database...</p>;
  }

  return (
    <div className="card-grid card-grid--triple">
      {doctors.slice(0, 3).map((doctor) => (
        <DoctorPreview key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}
