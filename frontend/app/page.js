import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeroIllustration } from "@/components/site/HeroIllustration";
import { demoDoctors, demoMetrics, demoHighlights, demoTestimonials } from "@/data/mockData";

function MetricCard({ item }) {
  return (
    <GlassCard className="metric-card">
      <span className="metric-value">{item.value}</span>
      <span className="metric-label">{item.label}</span>
    </GlassCard>
  );
}

function HighlightCard({ item }) {
  return (
    <GlassCard className="highlight-card">
      <div className="highlight-icon">{item.icon}</div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </GlassCard>
  );
}

function DoctorPreview({ doctor }) {
  return (
    <GlassCard className="doctor-preview">
      <div className="doctor-preview__header">
        <div>
          <span className="badge badge-soft">{doctor.specialty}</span>
          <h3>{doctor.name}</h3>
        </div>
        <div className="avatar">{doctor.initials}</div>
      </div>
      <p>{doctor.bio}</p>
      <div className="doctor-preview__meta">
        <span>{doctor.department}</span>
        <span>{doctor.workingHours}</span>
      </div>
    </GlassCard>
  );
}

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__copy">
          <span className="pill pill-accent">Enterprise Health Solutions</span>
          <h1>Clinical Appointment System</h1>
          <p>
            Book appointments, manage doctor schedules, control availability rules, and keep
            every clinic interaction visible from one responsive platform designed around the
            mint and teal visual language of your Canva reference.
          </p>
          <div className="hero__actions">
            <Link href="/patient" className="button-link button-link--primary">
              Book Appointment
            </Link>
            <Link href="/admin" className="button-link button-link--secondary">
              Admin Panel
            </Link>
          </div>
          <div className="hero__chips">
            <span>Patients</span>
            <span>Doctors</span>
            <span>Administrators</span>
            <span>JWT Security</span>
          </div>
        </div>
        <HeroIllustration />
      </section>

      <section className="metrics-grid">
        {demoMetrics.map((item) => (
          <MetricCard key={item.label} item={item} />
        ))}
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Core Experience"
          title="Everything your clinic team needs"
          description="Reusable interface blocks keep the product coherent across patient, doctor, and admin workflows."
        />
        <div className="card-grid card-grid--triple">
          {demoHighlights.map((item) => (
            <HighlightCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Featured Specialists"
          title="Doctors available for appointment booking"
          description="Hero styling and glassmorphism cards follow the visual cues from the Canva site while staying application-focused."
        />
        <div className="card-grid card-grid--triple">
          {demoDoctors.slice(0, 3).map((doctor) => (
            <DoctorPreview key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      <section className="content-section two-column">
        <GlassCard className="story-card">
          <SectionHeading
            eyebrow="Why This Stack"
            title="Built for scale and clean separation"
            description="Next.js handles responsive UI and route structure while Spring Boot provides RBAC, slot generation, and secure REST APIs."
          />
          <ul className="check-list">
            <li>Responsive pages for desktop, tablet, and mobile</li>
            <li>Accessible forms, keyboard-friendly modals, hover and focus states</li>
            <li>Bulk slot generation, overlap prevention, and role-based authorization</li>
            <li>Docker, Nginx, PostgreSQL, CI/CD, and monitoring support</li>
          </ul>
        </GlassCard>

        <GlassCard className="story-card">
          <SectionHeading
            eyebrow="User Feedback"
            title="Designed to communicate clearly"
            description="Every dashboard includes loading, validation, error, and success states, so users always know what is happening."
          />
          <div className="testimonial-stack">
            {demoTestimonials.map((item) => (
              <div key={item.author} className="testimonial">
                <p>{item.quote}</p>
                <span>{item.author}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </main>
  );
}
