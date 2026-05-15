import Link from "next/link";
import { HomeDoctors } from "@/components/home/HomeDoctors";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeroIllustration } from "@/components/site/HeroIllustration";
import { demoHighlights, demoMetrics, demoTestimonials } from "@/data/mockData";

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

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__copy">
          <span className="pill pill-accent">Enterprise Health Solutions</span>
          <h1>Clinical Appointment System</h1>
          <p>
            Book real appointments with live doctors and slots from PostgreSQL. Sign in or create
            a patient account to get started.
          </p>
          <div className="hero__actions">
            <Link href="/patient" className="button-link button-link--primary">
              Book Appointment
            </Link>
            <Link href="/patient" className="button-link button-link--secondary">
              Login / Register
            </Link>
          </div>
          <div className="hero__chips">
            <span>Patients</span>
            <span>Doctors</span>
            <span>Administrators</span>
            <span>Live API</span>
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
          description="Patient booking connects to the Spring Boot API and PostgreSQL database."
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
          title="Doctors available for booking"
          description="Loaded from GET /api/doctors — real database records."
        />
        <HomeDoctors />
      </section>

      <section className="content-section two-column">
        <GlassCard className="story-card">
          <SectionHeading
            eyebrow="Demo accounts"
            title="Try the live system"
            description="Use these accounts on the Book Appointment page."
          />
          <ul className="check-list">
            <li>Patient: patient@clinic.local / password</li>
            <li>Doctor: doctor@clinic.local / password</li>
            <li>Admin: admin@clinic.local / password</li>
          </ul>
        </GlassCard>

        <GlassCard className="story-card">
          <SectionHeading
            eyebrow="User Feedback"
            title="Designed to communicate clearly"
            description="Validation, errors, and success states on every workflow."
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
