import { toDateInput } from "./dateUtils.js";

const SOURCE_NAMES = {
  apple: "Apple Health",
  healthconnect: "Health Connect",
  garmin: "Garmin",
  strava: "Strava",
};

const normalizeKey = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const numeric = value => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? "").trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

function parseDuration(value, key = "") {
  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":").map(Number);
    if (parts.every(Number.isFinite)) {
      const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
      return Math.max(1, Math.round(seconds / 60));
    }
  }
  const amount = numeric(value);
  if (/second|elapsedtime|movingtime|durationsec/.test(key)) return Math.max(1, Math.round(amount / 60));
  if (/millisecond/.test(key)) return Math.max(1, Math.round(amount / 60000));
  return Math.max(1, Math.round(amount));
}

function parseDistance(value, key = "", source = "", unit = "") {
  const amount = numeric(value);
  const normalizedUnit = String(unit || "").toLowerCase();
  if (/mile|mi\b/.test(normalizedUnit) || /mile/.test(key)) return Math.round(amount * 1.60934 * 10) / 10;
  if (/kilometer|\bkm\b/.test(normalizedUnit) || /kilometer|km/.test(key)) return Math.round(amount * 10) / 10;
  if (/meter|\bm\b/.test(normalizedUnit) || /meter|distance_m/.test(key) || (source === "strava" && key === "distance")) return Math.round(amount / 100) / 10;
  return Math.round(amount * 10) / 10;
}

function parseDate(value) {
  if (!value) return "";
  const simple = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (simple) return simple;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : toDateInput(parsed);
}

function mapActivityType(value) {
  const type = String(value || "").toLowerCase();
  if (/ride|cycling|bike|radfahr/.test(type)) return "cycling";
  if (/interval|hiit/.test(type)) return "intervals";
  if (/tempo|threshold/.test(type)) return "tempo";
  if (/walk|hike|recovery|easy/.test(type)) return "easy";
  if (/run|running|jog/.test(type)) return "zone2";
  return "other";
}

function valueFor(record, candidates) {
  const entries = Object.entries(record || {});
  for (const candidate of candidates) {
    const found = entries.find(([key]) => normalizeKey(key) === candidate || normalizeKey(key).includes(candidate));
    if (found && found[1] !== "") return { value: found[1], key: normalizeKey(found[0]) };
  }
  return { value: "", key: "" };
}

function normalizeWorkout(record, source, index) {
  const date = valueFor(record, ["startdate", "activitydate", "starttime", "date", "start"]);
  const duration = valueFor(record, ["elapsedtime", "movingtime", "durationseconds", "duration", "time"]);
  const distance = valueFor(record, ["distancekm", "totaldistance", "distance", "kilometers", "miles"]);
  const distanceUnit = valueFor(record, ["totaldistanceunit", "distanceunit", "unit"]);
  const heartRate = valueFor(record, ["averageheartrate", "avgheartrate", "heartrateavg", "avghr"]);
  const activity = valueFor(record, ["activitytype", "workoutactivitytype", "sporttype", "activityname", "type", "name"]);
  const id = valueFor(record, ["activityid", "workoutid", "externalid", "id"]);
  const parsedDate = parseDate(date.value);
  const parsedDuration = parseDuration(duration.value, duration.key);
  if (!parsedDate || !duration.value || parsedDuration <= 0) return null;
  const type = mapActivityType(activity.value);
  return {
    id: `import-${source}-${String(id.value || `${parsedDate}-${index}`).replace(/[^a-zA-Z0-9-]/g, "-")}`,
    type,
    duration: parsedDuration,
    distance: distance.value ? parseDistance(distance.value, distance.key, source, distanceUnit.value) : 0,
    hrAvg: Math.round(numeric(heartRate.value)),
    date: parsedDate,
    note: `${SOURCE_NAMES[source] || source}${activity.value ? ` · ${activity.value}` : ""}`,
    rpe: 5,
    planRef: null,
    source,
  };
}

function normalizeMetric(record, source, index) {
  const dateValue = valueFor(record, ["startdate", "date", "day", "timestamp"]);
  const date = parseDate(dateValue.value);
  if (!date) return null;
  const sleep = valueFor(record, ["sleephours", "sleepduration", "totalsleep"]);
  const restingHr = valueFor(record, ["restingheartrate", "restinghr", "ruhepuls"]);
  const steps = valueFor(record, ["steps", "stepcount"]);
  if (!sleep.value && !restingHr.value && !steps.value) return null;
  let sleepHours = numeric(sleep.value);
  if (/second/.test(sleep.key)) sleepHours /= 3600;
  if (/minute/.test(sleep.key)) sleepHours /= 60;
  return {
    id: `metric-${source}-${date}-${index}`,
    date,
    sleepHours: sleep.value ? Math.round(sleepHours * 10) / 10 : undefined,
    restingHr: restingHr.value ? Math.round(numeric(restingHr.value)) : undefined,
    steps: steps.value ? Math.round(numeric(steps.value)) : undefined,
    source,
  };
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { current += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if ((char === "," || char === ";" || char === "\t") && !quoted) { values.push(current.trim()); current = ""; }
    else current += char;
  }
  values.push(current.trim());
  return values;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function flattenJsonRecords(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const likelyKeys = ["workouts", "activities", "sessions", "records", "data", "metrics"];
  for (const key of likelyKeys) {
    if (Array.isArray(value[key])) return value[key];
    if (value[key] && typeof value[key] === "object") {
      const nested = flattenJsonRecords(value[key]);
      if (nested.length) return nested;
    }
  }
  return [value];
}

function parseAppleXml(text) {
  if (typeof DOMParser === "undefined") throw new Error("XML-Import wird in diesem Browser nicht unterstützt.");
  const xml = new DOMParser().parseFromString(text, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("Die Apple-Health-XML-Datei ist beschädigt.");
  const workouts = [...xml.querySelectorAll("Workout")].map(node => Object.fromEntries([...node.attributes].map(attribute => [attribute.name, attribute.value])));
  const recordsByDate = new Map();
  [...xml.querySelectorAll("Record")].forEach(node => {
    const type = node.getAttribute("type") || "";
    if (!/RestingHeartRate|StepCount|SleepAnalysis/.test(type)) return;
    const date = parseDate(node.getAttribute("startDate"));
    if (!date) return;
    const record = recordsByDate.get(date) || { date };
    const value = numeric(node.getAttribute("value"));
    if (/RestingHeartRate/.test(type)) record.restingHr = value;
    if (/StepCount/.test(type)) record.steps = numeric(record.steps) + value;
    if (/SleepAnalysis/.test(type)) {
      const start = new Date(node.getAttribute("startDate"));
      const end = new Date(node.getAttribute("endDate"));
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) record.sleepHours = numeric(record.sleepHours) + (end - start) / 3600000;
    }
    recordsByDate.set(date, record);
  });
  return { workouts, metrics: [...recordsByDate.values()] };
}

export function parseHealthExport(text, source, filename = "") {
  const trimmed = String(text || "").trim();
  if (!trimmed) throw new Error("Die gewählte Datei ist leer.");
  let workoutRecords = [];
  let metricRecords = [];

  if (filename.toLowerCase().endsWith(".xml") || trimmed.startsWith("<?xml") || trimmed.startsWith("<HealthData")) {
    if (source !== "apple") throw new Error("XML wird aktuell nur für Apple-Health-Exporte unterstützt.");
    const parsed = parseAppleXml(trimmed);
    workoutRecords = parsed.workouts;
    metricRecords = parsed.metrics;
  } else if (filename.toLowerCase().endsWith(".json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    workoutRecords = flattenJsonRecords(parsed.workouts || parsed.activities || parsed.sessions || parsed.data || parsed);
    metricRecords = flattenJsonRecords(parsed.metrics || parsed.healthMetrics || parsed.daily || []);
  } else {
    const records = parseCsv(trimmed);
    workoutRecords = records;
    metricRecords = records;
  }

  const workouts = workoutRecords.map((record, index) => normalizeWorkout(record, source, index)).filter(Boolean);
  const healthMetrics = metricRecords.map((record, index) => normalizeMetric(record, source, index)).filter(Boolean);
  if (!workouts.length && !healthMetrics.length) {
    throw new Error("Keine unterstützten Workouts oder Gesundheitswerte gefunden. Prüfe Format und Spaltennamen.");
  }
  return { workouts, healthMetrics, source, sourceName: SOURCE_NAMES[source] || source };
}

export function mergeImportedData(data, imported) {
  const existingWorkouts = data.workouts || [];
  const workoutKeys = new Set(existingWorkouts.map(workout => `${workout.source || "local"}:${workout.id}`));
  const signatureKeys = new Set(existingWorkouts.map(workout => `${workout.date}:${workout.type}:${workout.duration}:${workout.distance || 0}`));
  const newWorkouts = imported.workouts.filter(workout => {
    const key = `${workout.source}:${workout.id}`;
    const signature = `${workout.date}:${workout.type}:${workout.duration}:${workout.distance || 0}`;
    if (workoutKeys.has(key) || signatureKeys.has(signature)) return false;
    workoutKeys.add(key); signatureKeys.add(signature); return true;
  });

  const existingMetrics = data.healthMetrics || [];
  const metricKeys = new Set(existingMetrics.map(metric => `${metric.source || "local"}:${metric.date}`));
  const newMetrics = imported.healthMetrics.filter(metric => {
    const key = `${metric.source}:${metric.date}`;
    if (metricKeys.has(key)) return false;
    metricKeys.add(key); return true;
  });
  const importedAt = new Date().toISOString();
  return {
    workouts: [...newWorkouts, ...existingWorkouts].sort((a, b) => b.date.localeCompare(a.date)),
    healthMetrics: [...newMetrics, ...existingMetrics].sort((a, b) => b.date.localeCompare(a.date)),
    integrationSources: {
      ...(data.integrationSources || {}),
      [imported.source]: { connected: true, importedAt, workoutCount: newWorkouts.length, metricCount: newMetrics.length },
    },
    importedCounts: { workouts: newWorkouts.length, metrics: newMetrics.length },
  };
}

export { SOURCE_NAMES };
