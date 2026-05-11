const statusMap = {
  Scheduled: "status status--scheduled",
  Completed: "status status--completed",
  "No-show": "status status--noshow",
  Canceled: "status status--canceled",
  Active: "status status--active",
  Inactive: "status status--inactive",
  Open: "status status--open"
};

export function StatusBadge({ status }) {
  return <span className={statusMap[status] || "status"}>{status}</span>;
}
