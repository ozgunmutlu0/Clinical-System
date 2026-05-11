"use client";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const days = [];

  for (let index = 0; index < startOffset; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export function CalendarWidget({ selectedDate, onDateChange }) {
  const monthDays = buildMonthDays(selectedDate);
  const monthLabel = selectedDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  function changeMonth(direction) {
    onDateChange(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1)
    );
  }

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" className="calendar__nav" onClick={() => changeMonth(-1)}>
          Prev
        </button>
        <strong>{monthLabel}</strong>
        <button type="button" className="calendar__nav" onClick={() => changeMonth(1)}>
          Next
        </button>
      </div>
      <div className="calendar__grid calendar__grid--labels">
        {dayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar__grid">
        {monthDays.map((date, index) =>
          date ? (
            <button
              key={date.toISOString()}
              type="button"
              className={
                date.toDateString() === selectedDate.toDateString()
                  ? "calendar__day is-selected"
                  : "calendar__day"
              }
              onClick={() => onDateChange(date)}
            >
              {date.getDate()}
            </button>
          ) : (
            <span key={`empty-${index}`} className="calendar__day calendar__day--empty" />
          )
        )}
      </div>
    </div>
  );
}
