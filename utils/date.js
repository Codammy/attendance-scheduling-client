export function formatDateTime(isoString) {
  if (!isoString) return "Unknown";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function isFuture(isoString) {
  if (!isoString) return false;
  const date = new Date(isoString);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}

// Combines separate "YYYY-MM-DD" + "HH:MM" form inputs into a Date, parsed
// as local time (per the ECMAScript spec for a date-time string with no
// timezone designator) then sent as UTC via .toISOString(). Returns null if
// either input is missing/malformed.
export function parseDateTimeInputs(date, time) {
  if (!date?.trim() || !time?.trim()) return null;
  const parsed = new Date(`${date.trim()}T${time.trim()}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// The inverse — splits an ISO string back into the two form-input strings,
// for prefilling an edit form. Empty strings if the input is missing/invalid.
export function toDateTimeInputParts(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}
