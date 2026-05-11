const STORAGE_KEY = "clinical-preview-state-v1";
const app = document.getElementById("app");
const routeLinks = Array.from(document.querySelectorAll(".route-link"));
const toastContainer = document.getElementById("toast-container");

const baseDoctors = [
  {
    id: "DOC-001",
    initials: "EY",
    name: "Dr. Elif Yilmaz",
    specialty: "Cardiology",
    department: "Heart Health",
    workingHours: "Mon-Fri 09:00 - 17:00",
    availabilityRule: "30-minute slots, lunch blocked 12:30-13:30",
    active: true,
    bio: "Preventive cardiology, diagnostics, and long-term patient monitoring."
  },
  {
    id: "DOC-002",
    initials: "SD",
    name: "Dr. Selin Demir",
    specialty: "Neurology",
    department: "Neuro Clinic",
    workingHours: "Mon-Thu 10:00 - 18:00",
    availabilityRule: "45-minute slots, afternoon priority for follow-ups",
    active: true,
    bio: "Chronic neurological follow-up and comprehensive evaluations."
  },
  {
    id: "DOC-003",
    initials: "MK",
    name: "Dr. Mert Kaya",
    specialty: "Dermatology",
    department: "Skin Care",
    workingHours: "Tue-Sat 08:30 - 16:30",
    availabilityRule: "20-minute slots, no new patients after 15:30",
    active: true,
    bio: "Dermatology consultations, treatment planning, and periodic review."
  }
];

const baseAppointments = [
  {
    id: "APT-101",
    patient: "Ayse Yilmaz",
    patientEmail: "ayse@example.com",
    doctorId: "DOC-001",
    doctor: "Dr. Elif Yilmaz",
    department: "Heart Health",
    date: "2026-05-11",
    time: "09:30",
    status: "Scheduled",
    reason: "Routine heart check-up"
  },
  {
    id: "APT-102",
    patient: "Mehmet Arslan",
    patientEmail: "mehmet@example.com",
    doctorId: "DOC-002",
    doctor: "Dr. Selin Demir",
    department: "Neuro Clinic",
    date: "2026-05-10",
    time: "14:00",
    status: "Completed",
    reason: "Migraine review"
  },
  {
    id: "APT-103",
    patient: "Zeynep Kaya",
    patientEmail: "zeynep@example.com",
    doctorId: "DOC-003",
    doctor: "Dr. Mert Kaya",
    department: "Skin Care",
    date: "2026-05-12",
    time: "11:00",
    status: "No-show",
    reason: "Skin irritation consultation"
  }
];

const basePatients = [
  { name: "Ayse Yilmaz", email: "ayse@example.com", phone: "+90 555 000 0001" },
  { name: "Mehmet Arslan", email: "mehmet@example.com", phone: "+90 555 000 0002" },
  { name: "Zeynep Kaya", email: "zeynep@example.com", phone: "+90 555 000 0003" }
];

const slotMap = {
  "2026-05-08": ["09:00", "09:30", "11:00", "13:30", "15:30"],
  "2026-05-09": ["10:00", "10:30", "14:00"],
  "2026-05-10": ["09:00", "12:00", "16:00"],
  "2026-05-11": ["08:30", "09:30", "11:30", "14:30"],
  "2026-05-12": ["09:30", "10:00", "14:00", "15:00"]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultState() {
  return {
    doctors: clone(baseDoctors),
    appointments: clone(baseAppointments),
    patients: clone(basePatients),
    booking: {
      selectedDate: "2026-05-08",
      selectedSlot: "",
      selectedDoctorId: "",
      reason: ""
    }
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const state = defaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const state = defaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notify(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function getRoute() {
  const hash = window.location.hash.replace("#", "");
  return hash || "/";
}

function setActiveRoute(route) {
  routeLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.route === route);
  });
}

function getDoctor(state, doctorId) {
  return state.doctors.find((doctor) => doctor.id === doctorId);
}

function statusBadge(status) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="status status-${normalized}">${status}</span>`;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(dateString + "T00:00:00"));
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function button(label, action, kind = "button") {
  return `<button type="button" class="${kind}" data-action="${action}">${label}</button>`;
}

function renderHome(state) {
  const activeAppointments = state.appointments.filter((item) => item.status === "Scheduled").length;

  app.innerHTML = `
    <section class="hero-grid">
      <article class="hero-card hero-copy">
        <span class="chip">Trusted Digital Care Journey</span>
        <h2>Seamless appointments, confident care, connected clinical operations.</h2>
        <p>
          Clinical Appointment System delivers a modern patient-first experience for booking visits,
          coordinating doctor availability, and managing healthcare workflows with speed, clarity,
          and reliability across every touchpoint.
        </p>
        <div class="hero-actions">
          <a href="#/patient" class="button">Book Appointment</a>
          <a href="#/doctor" class="ghost-button">Doctor Dashboard</a>
          <a href="#/admin" class="soft-button">Admin Panel</a>
        </div>
        <div class="hero-chips">
          <span class="chip">Secure Access</span>
          <span class="chip">Smart Scheduling</span>
          <span class="chip">Care Coordination</span>
          <span class="chip">Operational Visibility</span>
        </div>
      </article>

      <article class="hero-card hero-visual" aria-hidden="true">
        <img class="hero-image" src="./hero-image.png" alt="Doctor presenting appointment scheduling to a patient" />
        <div class="hero-image-overlay"></div>
      </article>
    </section>

    <section class="hero-insight-grid">
      ${heroInsightCard("Live Appointment Calendar", "Real-time slot selection and visit planning")}
      ${heroInsightCard("Doctor Availability", "Smart clinic scheduling and queue visibility")}
      ${heroInsightCard("Clinical Insights", "Performance tracking across daily operations")}
    </section>

    <section class="metrics-grid">
      ${metricCard(state.doctors.length, "Doctors")}
      ${metricCard(activeAppointments, "Scheduled Visits")}
      ${metricCard(state.patients.length, "Patients")}
      ${metricCard(Object.keys(slotMap).length, "Calendar Days")}
    </section>

    <section class="glass-card stack">
      <div class="section-title">
        <p class="eyebrow">Core Modules</p>
        <h3>Integrated services for every stage of care delivery</h3>
        <p>Purpose-built workflows support patients, physicians, and administrators in one connected platform.</p>
      </div>
      <div class="card-grid">
        ${featureCard("🗓", "Patient Booking", "Register, login, select a date, pick a slot, and confirm an appointment.")}
        ${featureCard("🩺", "Doctor Workflow", "Review weekly schedule and update visit statuses like Completed or No-show.")}
        ${featureCard("🛡", "Admin Control", "Add doctors, deactivate doctors, generate slots, and filter system activity.")}
      </div>
    </section>

    <section class="two-column">
      <article class="glass-card stack">
        <div class="section-title">
          <p class="eyebrow">Care Experience</p>
          <h3>How the platform supports a complete scheduling journey</h3>
        </div>
        <div class="timeline">
          ${timelineStep("01", "Patient Access", "Patients sign in securely, review specialists, and reserve the most suitable appointment slot.")}
          ${timelineStep("02", "Doctor Coordination", "Doctors monitor daily schedules, update visit outcomes, and keep care delivery on track.")}
          ${timelineStep("03", "Administrative Oversight", "Administrators manage providers, define availability rules, and maintain operational continuity.")}
          ${timelineStep("04", "Unified Visibility", "Every department benefits from clearer scheduling, reduced friction, and stronger clinical organization.")}
        </div>
      </article>

      <article class="glass-card stack">
        <div class="section-title">
          <p class="eyebrow">Doctors On Duty</p>
          <h3>Featured specialists currently serving patients</h3>
        </div>
        <div class="doctor-list">
          ${state.doctors.map((doctor) => doctorSummaryCard(doctor)).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderPatient(state) {
  const selectedDoctor = getDoctor(state, state.booking.selectedDoctorId);
  const slots = slotMap[state.booking.selectedDate] || [];
  const patientAppointments = state.appointments.filter((appointment) => appointment.patient === "Ayse Yilmaz");
  const nextAppointment = patientAppointments.find((item) => item.status === "Scheduled");
  const liveSelectionReady = state.booking.selectedDoctorId || state.booking.selectedSlot || state.booking.reason;
  const selectedTimeLabel = state.booking.selectedSlot || "Not selected yet";

  app.innerHTML = `
    <section class="stack">
      <article class="dashboard-banner">
        <p class="eyebrow" style="color: rgba(255,255,255,.72)">Patient Dashboard</p>
        <h2>Book, manage, and cancel appointments</h2>
        <p>Patients can register, sign in, choose their preferred specialist, and manage upcoming visits with confidence.</p>
      </article>

      <section class="summary-grid">
        ${miniStat("Upcoming", patientAppointments.filter((item) => item.status === "Scheduled").length)}
        ${miniStat("Completed", patientAppointments.filter((item) => item.status === "Completed").length)}
        ${miniStat("Canceled", patientAppointments.filter((item) => item.status === "Canceled").length)}
        ${miniStat("Doctors", state.doctors.filter((item) => item.active).length)}
      </section>

      <section class="two-column">
        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Access</p>
            <h3>Register / Login</h3>
            <p>Secure account access supports a smooth and reliable start to every care journey.</p>
          </div>
          <div class="auth-panels">
            <form class="login-card stack" data-form="patient-login">
              <h4>Login</h4>
              <div class="field">
                <label for="patient-login-email">Email</label>
                <input id="patient-login-email" name="email" type="email" placeholder="patient@example.com" required />
              </div>
              <div class="field">
                <label for="patient-login-password">Password</label>
                <input id="patient-login-password" name="password" type="password" placeholder="••••••••" required />
              </div>
              <button class="button" type="submit">Login</button>
            </form>

            <form class="login-card stack" data-form="patient-register">
              <h4>Register</h4>
              <div class="field">
                <label for="patient-register-name">Full Name</label>
                <input id="patient-register-name" name="name" placeholder="Ayse Yilmaz" required />
              </div>
              <div class="field">
                <label for="patient-register-email">Email</label>
                <input id="patient-register-email" name="email" type="email" placeholder="ayse@example.com" required />
              </div>
              <div class="field">
                <label for="patient-register-phone">Phone</label>
                <input id="patient-register-phone" name="phone" placeholder="+90 555 000 0000" required />
              </div>
              <div class="field">
                <label for="patient-register-password">Password</label>
                <input id="patient-register-password" name="password" type="password" placeholder="Create a secure password" required />
              </div>
              <button class="soft-button" type="submit">Create Account</button>
            </form>
          </div>
        </article>

        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Calendar</p>
            <h3>Available slots</h3>
            <p>Choose a preferred date, then review time slots generated according to provider availability.</p>
          </div>
          ${renderCalendar(state.booking.selectedDate)}
          <div class="stack">
            <div class="table-meta">
              <strong>Slots for ${formatDate(state.booking.selectedDate)}</strong>
              <span class="table-muted">${slots.length ? "Select one below" : "No generated slots"}</span>
            </div>
            <div class="slot-grid">
              ${slots.length ? slots.map((slot) => slotButton(state, slot)).join("") : '<div class="empty-state">No slots available on this date yet.</div>'}
            </div>
          </div>
        </article>
      </section>

      <section class="two-column">
        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Booking</p>
            <h3>Reserve a consultation</h3>
            <p>Consultation requests are captured clearly so patients always know what has been scheduled.</p>
          </div>
          <form class="form-grid" data-form="book-appointment">
            <div class="field">
              <label for="doctor-select">Doctor</label>
              <select id="doctor-select" name="doctorId" required>
                <option value="">Select a doctor</option>
                ${state.doctors
                  .filter((doctor) => doctor.active)
                  .map((doctor) => `<option value="${doctor.id}" ${doctor.id === state.booking.selectedDoctorId ? "selected" : ""}>${doctor.name} — ${doctor.specialty}</option>`)
                  .join("")}
              </select>
            </div>
            <div class="field">
              <label for="doctor-department">Department</label>
              <input id="doctor-department" value="${selectedDoctor ? selectedDoctor.department : ""}" placeholder="Auto-filled after doctor selection" readonly />
            </div>
            <div class="field full">
              <label for="visit-reason">Reason for Visit</label>
              <textarea id="visit-reason" name="reason" placeholder="Describe the complaint or consultation reason" required>${state.booking.reason || ""}</textarea>
            </div>
            <div class="field full">
              <button class="button" type="submit">Confirm Appointment</button>
            </div>
          </form>
          <div id="patient-feedback"></div>
        </article>

        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Next Visit</p>
            <h3>Current patient summary</h3>
          </div>
          ${
            liveSelectionReady
              ? `
                <div class="summary-card summary-card--live">
                  <span>Current Selection</span>
                  <h4>${selectedDoctor ? selectedDoctor.name : "Doctor not selected yet"}</h4>
                  <p><strong>Date:</strong> ${formatDate(state.booking.selectedDate)}</p>
                  <p><strong>Time:</strong> ${selectedTimeLabel}</p>
                  <p><strong>Description:</strong> ${state.booking.reason || "Not entered yet"}</p>
                </div>
              `
              : ""
          }
          ${
            nextAppointment
              ? `
                <div class="summary-card">
                  <span>Upcoming Appointment</span>
                  <h4>${nextAppointment.doctor}</h4>
                  <p>${formatDate(nextAppointment.date)} at ${nextAppointment.time}</p>
                  ${statusBadge(nextAppointment.status)}
                </div>
              `
              : '<div class="empty-state">No scheduled appointment found for the preview patient.</div>'
          }
          <div class="notice">
            Patients always have a clear view of upcoming visits, selected specialists, and current appointment status.
          </div>
        </article>
      </section>

      <article class="glass-card stack">
        <div class="section-title">
          <p class="eyebrow">History</p>
          <h3>Appointment history table</h3>
          <p>Cancellation is available directly from the table actions.</p>
        </div>
        ${appointmentTable(patientAppointments, true)}
      </article>
    </section>
  `;
}

function renderDoctor(state) {
  const doctorAppointments = state.appointments.filter((appointment) => appointment.doctorId === "DOC-002");

  app.innerHTML = `
    <section class="stack">
      <article class="dashboard-banner">
        <p class="eyebrow" style="color: rgba(255,255,255,.72)">Doctor Dashboard</p>
        <h2>Daily and weekly schedule management</h2>
        <p>Doctors can review appointment flow, update visit outcomes, and maintain accurate daily schedules.</p>
      </article>

      <section class="summary-grid">
        ${miniStat("Today", doctorAppointments.filter((item) => item.date === "2026-05-10").length)}
        ${miniStat("Scheduled", doctorAppointments.filter((item) => item.status === "Scheduled").length)}
        ${miniStat("Completed", doctorAppointments.filter((item) => item.status === "Completed").length)}
        ${miniStat("No-show", doctorAppointments.filter((item) => item.status === "No-show").length)}
      </section>

      <section class="two-column">
        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Profile</p>
            <h3>Dr. Selin Demir</h3>
            <p>Neurology service dashboard built for visibility, coordination, and precise patient follow-up.</p>
          </div>
          <div class="mini-list">
            <div class="summary-card"><strong>Department</strong><small>Neuro Clinic</small></div>
            <div class="summary-card"><strong>Working Hours</strong><small>Mon-Thu 10:00 - 18:00</small></div>
            <div class="summary-card"><strong>Availability Rule</strong><small>45-minute slots, afternoon priority for follow-ups</small></div>
          </div>
        </article>

        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Clinical Workflow</p>
            <h3>How physicians stay in control of their schedule</h3>
          </div>
          <div class="timeline">
            ${timelineStep("01", "Daily Planning", "Each doctor begins the day with a focused view of appointments, timings, and patient needs.")}
            ${timelineStep("02", "Visit Outcome Updates", "Statuses can be updated quickly to reflect completed visits, no-shows, or cancellations.")}
            ${timelineStep("03", "Coordinated Visibility", "Accurate doctor-side updates improve scheduling quality across the wider clinic operation.")}
          </div>
        </article>
      </section>

      <article class="glass-card stack">
        <div class="section-title">
          <p class="eyebrow">Weekly Schedule</p>
          <h3>Doctor queue</h3>
          <p>Status changes below are interactive and saved locally.</p>
        </div>
        ${doctorTable(doctorAppointments)}
      </article>
    </section>
  `;
}

function renderAdmin(state) {
  app.innerHTML = `
    <section class="stack">
      <article class="dashboard-banner">
        <p class="eyebrow" style="color: rgba(255,255,255,.72)">Admin Panel</p>
        <h2>Doctor management and slot operations</h2>
        <p>Administrative teams can maintain provider capacity, configure rules, and monitor appointment activity across the clinic.</p>
      </article>

      <section class="summary-grid">
        ${miniStat("Doctors", state.doctors.length)}
        ${miniStat("Active", state.doctors.filter((doctor) => doctor.active).length)}
        ${miniStat("Appointments", state.appointments.length)}
        ${miniStat("Patients", state.patients.length)}
      </section>

      <section class="two-column">
        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Doctor Management</p>
            <h3>Create or update specialists</h3>
            <p>Operational teams can onboard specialists and keep staffing information aligned with clinical demand.</p>
          </div>
          <form class="form-grid" data-form="admin-add-doctor">
            <div class="field">
              <label for="doctor-name">Doctor Name</label>
              <input id="doctor-name" name="name" placeholder="Dr. Kerem Acar" required />
            </div>
            <div class="field">
              <label for="doctor-specialty">Specialty</label>
              <input id="doctor-specialty" name="specialty" placeholder="Orthopedics" required />
            </div>
            <div class="field">
              <label for="doctor-department-field">Department</label>
              <input id="doctor-department-field" name="department" placeholder="Mobility Center" required />
            </div>
            <div class="field">
              <label for="doctor-hours">Working Hours</label>
              <input id="doctor-hours" name="workingHours" placeholder="Mon-Fri 09:00 - 17:00" required />
            </div>
            <div class="field full">
              <label for="doctor-rule">Availability Rule</label>
              <input id="doctor-rule" name="availabilityRule" placeholder="30-minute slots, lunch blocked 12:30-13:30" required />
            </div>
            <div class="field full">
              <label for="doctor-bio">Bio</label>
              <textarea id="doctor-bio" name="bio" placeholder="Short clinical summary" required></textarea>
            </div>
            <div class="field full">
              <button class="button" type="submit">Save Doctor</button>
            </div>
          </form>
          <div id="admin-feedback"></div>
        </article>

        <article class="glass-card stack">
          <div class="section-title">
            <p class="eyebrow">Operations</p>
            <h3>Bulk slot generation and filters</h3>
            <p>Availability management tools help maintain service continuity and support efficient appointment planning.</p>
          </div>
          <div class="action-row">
            ${button("Generate 30-Day Slots", "generate-slots", "soft-button")}
            ${button("Filter Scheduled Only", "filter-scheduled", "ghost-button")}
            ${button("Show All Appointments", "filter-all", "ghost-button")}
          </div>
          <div class="notice">
            Centralized controls improve clinic readiness by aligning doctor schedules, patient demand, and administrative oversight.
          </div>
          <div class="doctor-list">
            ${state.doctors.map((doctor) => adminDoctorCard(doctor)).join("")}
          </div>
        </article>
      </section>

      <article class="glass-card stack">
        <div class="section-title">
          <p class="eyebrow">Appointment Board</p>
          <h3>Filter and search-ready overview</h3>
          <p>Current preview includes live status visibility and doctor activity overview.</p>
        </div>
        ${appointmentTable(state.appointments, false, "admin")}
      </article>
    </section>
  `;
}

function metricCard(value, label) {
  return `<article class="metric-card"><strong>${value}</strong><span>${label}</span></article>`;
}

function featureCard(icon, title, text) {
  return `
    <article class="feature-card">
      <div class="feature-icon">${icon}</div>
      <h4>${title}</h4>
      <p>${text}</p>
    </article>
  `;
}

function heroInsightCard(title, text) {
  return `
    <article class="panel-card hero-insight-card">
      <span class="hero-insight-line"></span>
      <strong>${title}</strong>
      <p>${text}</p>
    </article>
  `;
}

function timelineStep(index, title, text) {
  return `
    <div class="timeline-step">
      <div class="timeline-index">${index}</div>
      <div>
        <strong>${title}</strong>
        <p>${text}</p>
      </div>
    </div>
  `;
}

function doctorSummaryCard(doctor) {
  return `
    <article class="doctor-card">
      <div class="doctor-card-header">
        <div class="doctor-meta">
          <span class="chip">${doctor.specialty}</span>
          <h4>${doctor.name}</h4>
          <small>${doctor.department}</small>
        </div>
        <div class="doctor-avatar">${doctor.initials}</div>
      </div>
      <p>${doctor.bio}</p>
      <div class="table-meta">
        <span>${doctor.workingHours}</span>
        ${statusBadge(doctor.active ? "Active" : "Inactive")}
      </div>
    </article>
  `;
}

function miniStat(label, value) {
  return `<article class="mini-stat"><strong>${value}</strong><span>${label}</span></article>`;
}

function renderCalendar(selectedDate) {
  const current = new Date(selectedDate + "T00:00:00");
  const month = current.getMonth();
  const year = current.getFullYear();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push('<span class="calendar-day empty"></span>');
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const iso = formatDateKey(date);
    const className = iso === selectedDate ? "calendar-day selected" : "calendar-day";
    cells.push(`<button type="button" class="${className}" data-action="select-date:${iso}">${day}</button>`);
  }

  return `
    <div class="calendar">
      <div class="calendar-header">
        <button type="button" class="nav-arrow" data-action="shift-month:-1">Prev</button>
        <strong>${current.toLocaleString("en-US", { month: "long", year: "numeric" })}</strong>
        <button type="button" class="nav-arrow" data-action="shift-month:1">Next</button>
      </div>
      <div class="calendar-grid labels">${labels.map((label) => `<span>${label}</span>`).join("")}</div>
      <div class="calendar-grid days">${cells.join("")}</div>
    </div>
  `;
}

function slotButton(state, slot) {
  const active = state.booking.selectedSlot === slot ? "active is-selected" : "";
  return `<button type="button" aria-pressed="${state.booking.selectedSlot === slot ? "true" : "false"}" class="slot-pill ${active}" data-action="select-slot:${slot}">${slot}</button>`;
}

function appointmentTable(appointments, allowCancel, scope = "patient") {
  if (!appointments.length) {
    return '<div class="empty-state">No appointments to display.</div>';
  }

  return `
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Reason</th>
            ${allowCancel ? "<th>Action</th>" : scope === "admin" ? "<th>Patient</th>" : ""}
          </tr>
        </thead>
        <tbody>
          ${appointments
            .map((appointment) => {
              return `
                <tr>
                  <td>${appointment.id}</td>
                  <td>${appointment.doctor}</td>
                  <td>${formatDate(appointment.date)}</td>
                  <td>${appointment.time}</td>
                  <td>${statusBadge(appointment.status)}</td>
                  <td>${appointment.reason}</td>
                  ${
                    allowCancel
                      ? `<td>${
                          appointment.status === "Scheduled"
                            ? `<button type="button" class="table-button" data-action="cancel-appointment:${appointment.id}">Cancel</button>`
                            : '<span class="table-muted">Closed</span>'
                        }</td>`
                      : scope === "admin"
                        ? `<td>${appointment.patient}</td>`
                        : ""
                  }
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function doctorTable(appointments) {
  if (!appointments.length) {
    return '<div class="empty-state">No doctor appointments in the preview dataset.</div>';
  }

  return `
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          ${appointments
            .map((appointment) => {
              return `
                <tr>
                  <td>${appointment.id}</td>
                  <td>${appointment.patient}</td>
                  <td>${formatDate(appointment.date)}</td>
                  <td>${appointment.time}</td>
                  <td>${appointment.reason}</td>
                  <td>${statusBadge(appointment.status)}</td>
                  <td>
                    <select data-action="doctor-status:${appointment.id}">
                      ${["Scheduled", "Completed", "No-show", "Canceled"]
                        .map(
                          (status) =>
                            `<option value="${status}" ${status === appointment.status ? "selected" : ""}>${status}</option>`
                        )
                        .join("")}
                    </select>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminDoctorCard(doctor) {
  return `
    <article class="doctor-card">
      <div class="doctor-card-header">
        <div class="doctor-meta">
          <h4>${doctor.name}</h4>
          <small>${doctor.specialty} · ${doctor.department}</small>
        </div>
        ${statusBadge(doctor.active ? "Active" : "Inactive")}
      </div>
      <p>${doctor.availabilityRule}</p>
      <div class="table-meta">
        <span>${doctor.workingHours}</span>
        <button type="button" class="table-button" data-action="toggle-doctor:${doctor.id}">
          ${doctor.active ? "Deactivate" : "Activate"}
        </button>
      </div>
    </article>
  `;
}

function showFeedback(containerId, message, type) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.innerHTML = `<div class="notice ${type}">${message}</div>`;
}

function shiftMonth(state, direction) {
  const current = new Date(state.booking.selectedDate + "T00:00:00");
  const next = new Date(current.getFullYear(), current.getMonth() + Number(direction), 1);
  state.booking.selectedDate = formatDateKey(next);
  state.booking.selectedSlot = "";
}

function handleAction(action) {
  const state = loadState();
  const separatorIndex = action.indexOf(":");
  const name = separatorIndex === -1 ? action : action.slice(0, separatorIndex);
  const value = separatorIndex === -1 ? "" : action.slice(separatorIndex + 1);

  if (name === "reset-demo") {
    localStorage.removeItem(STORAGE_KEY);
    notify("Demo data reset successfully.");
    render();
    return;
  }

  if (name === "select-date") {
    state.booking.selectedDate = value;
    state.booking.selectedSlot = "";
    saveState(state);
    render();
    return;
  }

  if (name === "shift-month") {
    shiftMonth(state, value);
    saveState(state);
    render();
    return;
  }

  if (name === "select-slot") {
    state.booking.selectedSlot = value;
    saveState(state);
    render();
    return;
  }

  if (name === "cancel-appointment") {
    state.appointments = state.appointments.map((appointment) =>
      appointment.id === value ? { ...appointment, status: "Canceled" } : appointment
    );
    saveState(state);
    notify("Appointment canceled successfully.");
    render();
    return;
  }

  if (name === "toggle-doctor") {
    state.doctors = state.doctors.map((doctor) =>
      doctor.id === value ? { ...doctor, active: !doctor.active } : doctor
    );
    saveState(state);
    notify("Doctor activity updated.");
    render();
    return;
  }

  if (name === "generate-slots") {
    notify("Bulk slot generation simulated for the next 30 days.");
    return;
  }

  if (name === "filter-scheduled") {
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      row.style.display = row.textContent.includes("Scheduled") ? "" : "none";
    });
    notify("Scheduled appointment filter applied.");
    return;
  }

  if (name === "filter-all") {
    document.querySelectorAll("tbody tr").forEach((row) => {
      row.style.display = "";
    });
    notify("All appointments are visible again.");
  }
}

function handleFormSubmit(event) {
  const formName = event.target.dataset.form;
  if (!formName) {
    return;
  }
  event.preventDefault();
  const state = loadState();
  const formData = new FormData(event.target);

  if (formName === "patient-login") {
    if (!formData.get("email") || !formData.get("password")) {
      showFeedback("patient-feedback", "Login form requires email and password.", "error");
      return;
    }
    notify("Patient login simulated successfully.");
    return;
  }

  if (formName === "patient-register") {
    if (!formData.get("name") || !formData.get("email") || !formData.get("phone") || !formData.get("password")) {
      showFeedback("patient-feedback", "All registration fields are required.", "error");
      return;
    }
    notify("Patient registration simulated successfully.");
    event.target.reset();
    return;
  }

  if (formName === "book-appointment") {
    const doctorId = formData.get("doctorId");
    const reason = formData.get("reason");
    const doctor = getDoctor(state, doctorId);

    if (!doctorId || !reason || !state.booking.selectedSlot) {
      showFeedback("patient-feedback", "Choose doctor, date, slot, and reason before booking.", "error");
      return;
    }

    state.appointments.unshift({
      id: "APT-" + String(state.appointments.length + 101),
      patient: "Ayse Yilmaz",
      patientEmail: "ayse@example.com",
      doctorId: doctor.id,
      doctor: doctor.name,
      department: doctor.department,
      date: state.booking.selectedDate,
      time: state.booking.selectedSlot,
      status: "Scheduled",
      reason: reason
    });
    state.booking.selectedDoctorId = doctorId;
    state.booking.selectedSlot = "";
    state.booking.reason = "";
    saveState(state);
    notify("Appointment booked successfully.");
    render();
    showFeedback("patient-feedback", "Appointment booked and added to history.", "success");
    return;
  }

  if (formName === "admin-add-doctor") {
    const name = formData.get("name");
    const specialty = formData.get("specialty");
    const department = formData.get("department");
    const workingHours = formData.get("workingHours");
    const availabilityRule = formData.get("availabilityRule");
    const bio = formData.get("bio");

    if (!name || !specialty || !department || !workingHours || !availabilityRule || !bio) {
      showFeedback("admin-feedback", "Complete all doctor form fields.", "error");
      return;
    }

    const parts = String(name).split(" ").filter(Boolean).slice(0, 2);
    const initials = parts.map((part) => part[0].toUpperCase()).join("") || "DR";

    state.doctors.unshift({
      id: "DOC-" + String(state.doctors.length + 1).padStart(3, "0"),
      initials: initials,
      name: String(name),
      specialty: String(specialty),
      department: String(department),
      workingHours: String(workingHours),
      availabilityRule: String(availabilityRule),
      active: true,
      bio: String(bio)
    });
    saveState(state);
    notify("Doctor created successfully.");
    render();
    showFeedback("admin-feedback", "Doctor added successfully to the local preview dataset.", "success");
  }
}

function handleInputChange(event) {
  const state = loadState();

  if (event.target.id === "doctor-select") {
    state.booking.selectedDoctorId = event.target.value;
    saveState(state);
    render();
    return;
  }

  if (event.target.id === "visit-reason") {
    state.booking.reason = event.target.value;
    saveState(state);
    return;
  }

  if (event.target.dataset.action && event.target.dataset.action.startsWith("doctor-status:")) {
    const appointmentId = event.target.dataset.action.split(":")[1];
    state.appointments = state.appointments.map((appointment) =>
      appointment.id === appointmentId ? { ...appointment, status: event.target.value } : appointment
    );
    saveState(state);
    notify("Doctor updated appointment status.");
    render();
  }
}

function render() {
  const state = loadState();
  const route = getRoute();
  setActiveRoute(route);

  if (route === "/patient") {
    renderPatient(state);
    return;
  }

  if (route === "/doctor") {
    renderDoctor(state);
    return;
  }

  if (route === "/admin") {
    renderAdmin(state);
    return;
  }

  renderHome(state);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (target) {
    handleAction(target.dataset.action);
  }
});

document.addEventListener("submit", handleFormSubmit);
document.addEventListener("change", handleInputChange);
document.addEventListener("input", handleInputChange);
window.addEventListener("hashchange", render);

render();
