import { parseDateInput, toDateInput } from "./dateUtils.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_CHECKIN = {
  sleepHours: 7.5,
  energy: 3,
  soreness: 2,
  stress: 2,
  restingHr: "",
  note: "",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const numeric = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function dayDistance(value, today = new Date()) {
  const date = parseDateInput(value);
  const end = parseDateInput(today);
  date.setHours(12, 0, 0, 0);
  end.setHours(12, 0, 0, 0);
  return Math.floor((end - date) / DAY_MS);
}

function cardioLoad(workout) {
  return numeric(workout.duration) * clamp(numeric(workout.rpe, 5), 1, 10);
}

function strengthLoad(workout) {
  const sets = (workout.exercises || []).flatMap(exercise => exercise.sets || []).filter(set => set.type !== "W");
  if (!sets.length) return numeric(workout.duration, 30) * 5;
  const averageRpe = sets.filter(set => numeric(set.rpe) > 0).reduce((sum, set, _, arr) => sum + numeric(set.rpe) / arr.length, 0) || 7;
  return numeric(workout.duration, sets.length * 2.5) * averageRpe;
}

export function calculateTrainingLoad(data, today = new Date()) {
  const entries = [
    ...(data.workouts || []).map(workout => ({ date: workout.date, load: cardioLoad(workout), kind: "cardio" })),
    ...(data.strengthLog || []).map(workout => ({ date: workout.date, load: strengthLoad(workout), kind: "strength" })),
  ].filter(entry => dayDistance(entry.date, today) >= 0 && dayDistance(entry.date, today) < 28);

  const acute = Math.round(entries.filter(entry => dayDistance(entry.date, today) < 7).reduce((sum, entry) => sum + entry.load, 0));
  const chronic = Math.round(entries.reduce((sum, entry) => sum + entry.load, 0) / 4);
  const ratio = chronic > 0 ? Math.round((acute / chronic) * 100) / 100 : acute > 0 ? 1 : 0;
  const status = ratio > 1.5 ? "hoch" : ratio > 1.25 ? "steigend" : ratio < 0.65 && chronic > 0 ? "niedrig" : "stabil";
  const message = status === "hoch"
    ? "Deine 7-Tage-Belastung liegt deutlich über deinem 4-Wochen-Niveau. Heute besser kontrolliert trainieren."
    : status === "steigend"
      ? "Die Belastung steigt. Eine gute Einheit ist möglich, aber ohne zusätzliche Maximalreize."
      : status === "niedrig"
        ? "Die Trainingslast ist zuletzt gesunken. Du kannst strukturiert wieder aufbauen."
        : "Akute und gewohnte Belastung sind gut ausbalanciert.";

  return { acute, chronic, ratio, status, message, entries };
}

function recentRestingHrBaseline(metrics, today) {
  const values = (metrics || [])
    .filter(metric => dayDistance(metric.date, today) >= 1 && dayDistance(metric.date, today) <= 28)
    .map(metric => numeric(metric.restingHr))
    .filter(Boolean);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function calculateReadiness(checkin = {}, data = {}, today = new Date()) {
  const input = { ...DEFAULT_CHECKIN, ...checkin };
  const load = calculateTrainingLoad(data, today);
  const sleep = clamp(numeric(input.sleepHours, 7.5), 0, 12);
  const energy = clamp(numeric(input.energy, 3), 1, 5);
  const soreness = clamp(numeric(input.soreness, 2), 1, 5);
  const stress = clamp(numeric(input.stress, 2), 1, 5);

  let score = 0;
  score += clamp(sleep / 8, 0, 1) * 32;
  score += (energy / 5) * 26;
  score += ((6 - soreness) / 5) * 20;
  score += ((6 - stress) / 5) * 16;
  score += load.ratio > 1.5 ? 0 : load.ratio > 1.25 ? 3 : 6;

  const currentHr = numeric(input.restingHr);
  const baselineHr = recentRestingHrBaseline(data.healthMetrics, today);
  if (currentHr && baselineHr) {
    const delta = currentHr - baselineHr;
    if (delta >= 8) score -= 12;
    else if (delta >= 5) score -= 7;
    else if (delta <= -3) score += 3;
  }

  score = Math.round(clamp(score, 0, 100));
  const level = score >= 80 ? "peak" : score >= 65 ? "ready" : score >= 45 ? "moderate" : "recover";
  const label = { peak: "Peak", ready: "Bereit", moderate: "Kontrolliert", recover: "Recovery" }[level];
  const color = { peak: "#a8b87c", ready: "#8ba4b8", moderate: "#c4956a", recover: "#c96f62" }[level];

  const factors = [
    { label: "Schlaf", value: `${sleep.toFixed(1)} h`, positive: sleep >= 7 },
    { label: "Energie", value: `${energy}/5`, positive: energy >= 3 },
    { label: "Muskelkater", value: `${soreness}/5`, positive: soreness <= 2 },
    { label: "Stress", value: `${stress}/5`, positive: stress <= 2 },
  ];
  if (currentHr && baselineHr) factors.push({ label: "Ruhepuls", value: `${currentHr} bpm`, positive: currentHr <= baselineHr + 4 });

  return { score, level, label, color, factors, load, baselineHr: Math.round(baselineHr || 0) };
}

export function getAdaptiveRecommendation({ data = {}, checkin = {}, plannedSession = null, today = new Date() }) {
  const readiness = calculateReadiness(checkin, data, today);
  const planned = plannedSession || null;
  const highIntensity = planned && ["intervals", "tempo"].includes(planned.type);

  if (readiness.level === "recover") {
    return {
      kind: "recovery",
      title: "Recovery Reset",
      type: "easy",
      duration: 25,
      hr: "110-130",
      intensity: "Sehr locker",
      reason: "Readiness und Belastung sprechen heute für aktive Erholung statt eines harten Trainingsreizes.",
      changes: planned ? [`${planned.title} wird verschoben`, "Volumen auf 25 Minuten reduziert"] : ["Aktive Erholung", "Mobilität und lockere Bewegung"],
    };
  }

  if (readiness.level === "moderate" && highIntensity) {
    return {
      kind: "adjusted",
      title: `${planned.title} · kontrolliert`,
      type: planned.type === "intervals" ? "tempo" : "zone2",
      duration: Math.max(20, Math.round(planned.duration * 0.75)),
      hr: planned.type === "intervals" ? "145-160" : "130-145",
      intensity: "RPE 6–7",
      reason: "Die geplante Qualitätseinheit bleibt erhalten, wird aber verkürzt und kontrollierter ausgeführt.",
      changes: ["25 % weniger Umfang", "Keine All-out-Intervalle"],
    };
  }

  if (planned) {
    const bonus = readiness.level === "peak" && planned.type === "zone2" ? 5 : 0;
    return {
      kind: bonus ? "progressed" : "planned",
      title: planned.title,
      type: planned.type,
      duration: planned.duration + bonus,
      hr: planned.hr,
      intensity: readiness.level === "peak" ? "RPE 7–8" : "Nach Plan",
      reason: bonus
        ? "Sehr hohe Readiness: Die lockere Einheit kann sicher um fünf Minuten erweitert werden."
        : "Readiness und Trainingslast passen zur geplanten Einheit.",
      changes: bonus ? ["+5 Minuten lockeres Volumen"] : ["Plan unverändert"],
    };
  }

  const recentStrength = (data.strengthLog || [])[0];
  const daysSinceStrength = recentStrength ? dayDistance(recentStrength.date, today) : 99;
  if (readiness.score >= 65 && daysSinceStrength >= 2) {
    return {
      kind: "strength",
      title: "Progressive Kraft-Session",
      type: "strength",
      duration: 55,
      hr: "—",
      intensity: readiness.level === "peak" ? "Progression erlaubt" : "RPE 7–8",
      reason: "Du bist ausreichend erholt und hattest zuletzt keinen direkten Kraftreiz.",
      changes: ["Gewichtsvorschläge aktiv", "Ghost-Vergleich zum letzten Training"],
    };
  }

  return {
    kind: "base",
    title: "Zone 2 Basis",
    type: "zone2",
    duration: 35,
    hr: "130-145",
    intensity: "Gesprächstempo",
    reason: "Eine kontrollierte Basiseinheit verbessert die Ausdauer, ohne die Gesamtbelastung unnötig zu erhöhen.",
    changes: ["35 Minuten Zone 2", "Gleichmäßiger Puls"],
  };
}

function estimatedOneRepMax(weight, reps) {
  if (weight <= 0 || reps <= 0) return 0;
  return reps === 1 ? weight : weight * (36 / (37 - Math.min(reps, 36)));
}

export function getProgressionSuggestions(strengthLog = [], exerciseLabels = {}) {
  const sessionsByExercise = new Map();
  [...strengthLog].sort((a, b) => a.date.localeCompare(b.date)).forEach(workout => {
    (workout.exercises || []).forEach(exercise => {
      const workSets = (exercise.sets || []).filter(set => set.type !== "W" && numeric(set.weight) > 0 && numeric(set.reps) > 0);
      if (!workSets.length) return;
      const list = sessionsByExercise.get(exercise.exerciseId) || [];
      list.push({ date: workout.date, sets: workSets });
      sessionsByExercise.set(exercise.exerciseId, list);
    });
  });

  return [...sessionsByExercise.entries()].map(([exerciseId, sessions]) => {
    const latest = sessions.at(-1);
    const previous = sessions.at(-2);
    const maxWeight = Math.max(...latest.sets.map(set => numeric(set.weight)));
    const bestE1rm = Math.max(...latest.sets.map(set => estimatedOneRepMax(numeric(set.weight), numeric(set.reps))));
    const previousE1rm = previous ? Math.max(...previous.sets.map(set => estimatedOneRepMax(numeric(set.weight), numeric(set.reps)))) : 0;
    const averageRpe = latest.sets.filter(set => numeric(set.rpe) > 0).reduce((sum, set, _, arr) => sum + numeric(set.rpe) / arr.length, 0);
    const allHighReps = latest.sets.every(set => numeric(set.reps) >= 10);
    let action = "halten";
    let delta = 0;
    let reason = "Leistung stabilisieren und saubere Wiederholungen sammeln.";
    if (averageRpe >= 9.5) {
      action = "deload";
      delta = -Math.max(2.5, Math.round(maxWeight * 0.05 / 2.5) * 2.5);
      reason = "Sehr hoher RPE: Last leicht reduzieren und Technik priorisieren.";
    } else if (allHighReps && (!averageRpe || averageRpe <= 8)) {
      action = "steigern";
      delta = maxWeight >= 80 ? 5 : 2.5;
      reason = "Alle Arbeitssätze erreichen den oberen Wiederholungsbereich.";
    } else if (previousE1rm && bestE1rm > previousE1rm * 1.02) {
      action = "reps";
      reason = "Die geschätzte Kraft steigt: Erst Wiederholungen festigen, dann Gewicht erhöhen.";
    }
    return {
      exerciseId,
      name: exerciseLabels[exerciseId] || exerciseId.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase()),
      action,
      currentWeight: maxWeight,
      targetWeight: Math.max(0, maxWeight + delta),
      reason,
      trend: previousE1rm ? Math.round(((bestE1rm - previousE1rm) / previousE1rm) * 100) : 0,
      lastDate: latest.date,
    };
  }).sort((a, b) => {
    const priority = { steigern: 0, reps: 1, deload: 2, halten: 3 };
    return priority[a.action] - priority[b.action] || b.lastDate.localeCompare(a.lastDate);
  }).slice(0, 8);
}

export function generateWeeklyReport(data = {}, today = new Date()) {
  const end = parseDateInput(today);
  const inRange = (date, from, to) => {
    const days = dayDistance(date, end);
    return days >= from && days < to;
  };
  const cardio = data.workouts || [];
  const strength = data.strengthLog || [];
  const currentCardio = cardio.filter(workout => inRange(workout.date, 0, 7));
  const previousCardio = cardio.filter(workout => inRange(workout.date, 7, 14));
  const currentStrength = strength.filter(workout => inRange(workout.date, 0, 7));
  const previousStrength = strength.filter(workout => inRange(workout.date, 7, 14));
  const minutes = currentCardio.reduce((sum, workout) => sum + numeric(workout.duration), 0)
    + currentStrength.reduce((sum, workout) => sum + numeric(workout.duration), 0);
  const previousMinutes = previousCardio.reduce((sum, workout) => sum + numeric(workout.duration), 0)
    + previousStrength.reduce((sum, workout) => sum + numeric(workout.duration), 0);
  const distance = currentCardio.reduce((sum, workout) => sum + numeric(workout.distance), 0);
  const strengthVolume = currentStrength.reduce((total, workout) => total + (workout.exercises || []).reduce((exerciseTotal, exercise) => exerciseTotal + (exercise.sets || []).filter(set => set.type !== "W").reduce((setTotal, set) => setTotal + numeric(set.weight) * numeric(set.reps), 0), 0), 0);
  const sessions = currentCardio.length + currentStrength.length;
  const previousSessions = previousCardio.length + previousStrength.length;
  const change = previousMinutes > 0 ? Math.round(((minutes - previousMinutes) / previousMinutes) * 100) : minutes > 0 ? 100 : 0;
  const averageRpeValues = currentCardio.map(workout => numeric(workout.rpe)).filter(Boolean);
  currentStrength.forEach(workout => (workout.exercises || []).forEach(exercise => (exercise.sets || []).forEach(set => {
    if (numeric(set.rpe)) averageRpeValues.push(numeric(set.rpe));
  })));
  const averageRpe = averageRpeValues.length ? Math.round(averageRpeValues.reduce((sum, value) => sum + value, 0) / averageRpeValues.length * 10) / 10 : 0;

  const highlights = [];
  if (sessions === 0) highlights.push("Diese Woche ist noch leer – ein kurzer Wiedereinstieg reicht, um Momentum aufzubauen.");
  else highlights.push(`${sessions} Sessions und ${minutes} Trainingsminuten bilden deine aktuelle Wochenbasis.`);
  if (distance > 0) highlights.push(`${Math.round(distance * 10) / 10} km Cardio zeigen deinen Ausdaueranteil.`);
  if (strengthVolume > 0) highlights.push(`${Math.round(strengthVolume / 100) / 10} t Kraftvolumen wurden bewegt.`);
  if (change > 25) highlights.push(`Das Volumen liegt ${change}% über der Vorperiode – Recovery aktiv beobachten.`);
  else if (change < -25 && previousMinutes > 0) highlights.push(`Das Volumen liegt ${Math.abs(change)}% niedriger – bewusst erholen oder wieder sanft steigern.`);

  const actions = [];
  if (sessions < 3) actions.push("Plane mindestens eine kurze, leicht startbare Einheit fest ein.");
  if (averageRpe >= 8.5) actions.push("Halte die nächste Einheit unter RPE 8 oder reduziere das Volumen.");
  if (!currentCardio.some(workout => ["zone2", "easy"].includes(workout.type))) actions.push("Ergänze 25–40 Minuten lockere Zone 2.");
  if (!currentStrength.length) actions.push("Ein Ganzkörperreiz hält die Kraftprogression stabil.");
  if (!actions.length) actions.push("Belastung beibehalten und bei guter Readiness nur einen Parameter steigern.");

  return {
    period: `${toDateInput(new Date(end.getTime() - 6 * DAY_MS))} – ${toDateInput(end)}`,
    sessions,
    previousSessions,
    minutes,
    distance: Math.round(distance * 10) / 10,
    strengthVolume: Math.round(strengthVolume),
    averageRpe,
    change,
    highlights,
    actions,
    shareText: `CardioTracker Wochenreport\n${sessions} Sessions · ${minutes} Min · ${Math.round(distance * 10) / 10} km · ${Math.round(strengthVolume / 100) / 10} t Kraftvolumen\n${highlights.join(" ")}\nNächste Woche: ${actions[0]}`,
  };
}
