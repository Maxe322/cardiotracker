const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDateInput(value) {
  if (value instanceof Date) return new Date(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`);
  }
  return new Date(value ?? Date.now());
}

export function toDateInput(value = new Date()) {
  const date = parseDateInput(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonday(value = new Date()) {
  const date = parseDateInput(value);
  date.setHours(12, 0, 0, 0);
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return date;
}

export function getISOWeekKey(value = new Date()) {
  const date = parseDateInput(value);
  if (Number.isNaN(date.getTime())) return "invalid-week";
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const isoYear = date.getFullYear();
  const yearStart = new Date(isoYear, 0, 1, 12, 0, 0, 0);
  const week = Math.ceil((((date - yearStart) / DAY_MS) + 1) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

export function formatDate(value, options) {
  const date = parseDateInput(value);
  if (Number.isNaN(date.getTime())) return "–";
  return date.toLocaleDateString("de-DE", options);
}
