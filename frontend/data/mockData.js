export const demoMetrics = [
  { label: "Doctors", value: "24" },
  { label: "Open Slots", value: "128" },
  { label: "Patient Satisfaction", value: "98%" },
  { label: "Avg. Booking Time", value: "2 min" }
];

export const demoHighlights = [
  {
    icon: "🗓",
    title: "Smart slot booking",
    description: "Patients can reserve appointments through a calendar-driven slot picker."
  },
  {
    icon: "🩺",
    title: "Doctor scheduling",
    description: "Doctors review daily and weekly schedules and update consultation outcomes."
  },
  {
    icon: "🛡",
    title: "Admin controls",
    description: "Admins manage doctors, working hours, availability rules, and reporting views."
  }
];

export const demoDoctors = [
  {
    id: "DOC-001",
    initials: "EY",
    name: "Dr. Elif Yilmaz",
    specialty: "Cardiology",
    department: "Heart Health",
    workingHours: "Mon-Fri 09:00 - 17:00",
    bio: "Focuses on preventive cardiology, diagnostics, and long-term patient monitoring."
  },
  {
    id: "DOC-002",
    initials: "SD",
    name: "Dr. Selin Demir",
    specialty: "Neurology",
    department: "Neuro Clinic",
    workingHours: "Mon-Thu 10:00 - 18:00",
    bio: "Handles chronic neurological follow-up and comprehensive evaluations."
  },
  {
    id: "DOC-003",
    initials: "MK",
    name: "Dr. Mert Kaya",
    specialty: "Dermatology",
    department: "Skin Care",
    workingHours: "Tue-Sat 08:30 - 16:30",
    bio: "Supports dermatology consultations, treatment planning, and periodic review."
  }
];

export const demoTestimonials = [
  {
    quote: "The dashboard reduces booking confusion and makes patient communication clearer.",
    author: "Clinic Manager"
  },
  {
    quote: "Doctors get a schedule view that is easy to scan and update during busy hours.",
    author: "Medical Operations Lead"
  }
];

export const patientSlotMap = {
  "2026-05-08": ["09:00", "09:30", "11:00", "13:30", "15:30"],
  "2026-05-09": ["10:00", "10:30", "14:00"],
  "2026-05-10": ["09:00", "12:00", "16:00"],
  "2026-05-11": ["08:30", "09:30", "11:30", "14:30"]
};

export const demoAppointments = [
  {
    id: "APT-101",
    doctor: "Dr. Elif Yilmaz",
    department: "Heart Health",
    date: "2026-05-11",
    time: "09:30",
    status: "Scheduled",
    reason: "Routine heart check-up"
  },
  {
    id: "APT-099",
    doctor: "Dr. Selin Demir",
    department: "Neuro Clinic",
    date: "2026-05-05",
    time: "14:00",
    status: "Completed",
    reason: "Migraine review"
  },
  {
    id: "APT-087",
    doctor: "Dr. Mert Kaya",
    department: "Skin Care",
    date: "2026-05-03",
    time: "11:00",
    status: "Canceled",
    reason: "Skin rash consultation"
  }
];

export const patientHistoryColumns = [
  { key: "id", label: "Appointment ID" },
  { key: "doctor", label: "Doctor" },
  { key: "department", label: "Department" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" }
];

export const doctorWeeklySchedule = [
  {
    id: "DOCSCH-001",
    patient: "Ayse Yilmaz",
    date: "2026-05-08",
    time: "09:00",
    complaint: "Follow-up consultation",
    status: "Scheduled"
  },
  {
    id: "DOCSCH-002",
    patient: "Mehmet Arslan",
    date: "2026-05-08",
    time: "10:30",
    complaint: "Routine review",
    status: "Completed"
  },
  {
    id: "DOCSCH-003",
    patient: "Zeynep Kara",
    date: "2026-05-09",
    time: "13:00",
    complaint: "Headache and dizziness",
    status: "No-show"
  }
];

export const doctorScheduleColumns = [
  { key: "id", label: "Visit ID" },
  { key: "patient", label: "Patient" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "complaint", label: "Complaint" },
  { key: "status", label: "Status" }
];

export const adminDoctors = [
  {
    id: "DOC-001",
    name: "Dr. Elif Yilmaz",
    specialty: "Cardiology",
    workingHours: "Mon-Fri 09:00 - 17:00",
    availabilityRule: "30-minute slots",
    active: true
  },
  {
    id: "DOC-002",
    name: "Dr. Selin Demir",
    specialty: "Neurology",
    workingHours: "Mon-Thu 10:00 - 18:00",
    availabilityRule: "45-minute slots",
    active: true
  }
];

export const adminDoctorColumns = [
  { key: "id", label: "Doctor ID" },
  { key: "name", label: "Doctor" },
  { key: "specialty", label: "Specialty" },
  { key: "workingHours", label: "Working Hours" },
  { key: "availabilityRule", label: "Availability Rule" },
  { key: "active", label: "Status" },
  { key: "actions", label: "Actions" }
];

export const adminAppointments = [
  {
    id: "APT-101",
    patient: "Ayse Yilmaz",
    doctor: "Dr. Elif Yilmaz",
    date: "2026-05-11",
    time: "09:30",
    status: "Scheduled"
  },
  {
    id: "APT-102",
    patient: "Merve Kara",
    doctor: "Dr. Selin Demir",
    date: "2026-05-11",
    time: "12:00",
    status: "Completed"
  },
  {
    id: "APT-103",
    patient: "Can Yildiz",
    doctor: "Dr. Elif Yilmaz",
    date: "2026-05-12",
    time: "14:00",
    status: "Canceled"
  }
];

export const adminAppointmentsColumns = [
  { key: "id", label: "Appointment ID" },
  { key: "patient", label: "Patient" },
  { key: "doctor", label: "Doctor" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "status", label: "Status" }
];
