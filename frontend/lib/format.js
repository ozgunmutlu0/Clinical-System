const STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
  CANCELED: "Canceled"
};

export function formatStatus(status) {
  return STATUS_LABELS[status] || status;
}

export function toApiStatus(label) {
  const map = {
    Scheduled: "SCHEDULED",
    Completed: "COMPLETED",
    "No-show": "NO_SHOW",
    Canceled: "CANCELED"
  };
  return map[label] || label;
}

export function formatTime(time) {
  if (!time) {
    return "";
  }
  return String(time).slice(0, 5);
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toApiTime(slot) {
  return slot.length === 5 ? `${slot}:00` : slot;
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
