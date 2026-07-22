import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateReadiness, generateWeeklyReport, getAdaptiveRecommendation,
  getProgressionSuggestions,
} from "../src/coachEngine.js";
import { mergeImportedData, parseHealthExport } from "../src/healthImport.js";

const today = new Date("2026-07-22T12:00:00");
const data = {
  workouts:[{ id:"w1", date:"2026-07-21", type:"zone2", duration:40, distance:6, rpe:5, hrAvg:138 }],
  strengthLog:[
    { id:"s1", date:"2026-07-15", duration:50, exercises:[{ exerciseId:"bench_bb", sets:[{ weight:60, reps:10, rpe:7, type:"N" }] }] },
    { id:"s2", date:"2026-07-20", duration:52, exercises:[{ exerciseId:"bench_bb", sets:[{ weight:60, reps:12, rpe:7, type:"N" }] }] },
  ],
  healthMetrics:[{ date:"2026-07-20", restingHr:55 }],
};

test("readiness combines recovery and load signals", () => {
  const result = calculateReadiness({ sleepHours:8, energy:5, soreness:1, stress:1, restingHr:55 }, data, today);
  assert.ok(result.score >= 80);
  assert.equal(result.level, "peak");
});

test("adaptive coach replaces hard training on a recovery day", () => {
  const result = getAdaptiveRecommendation({
    data,
    checkin:{ sleepHours:4, energy:1, soreness:5, stress:5 },
    plannedSession:{ title:"Intervalle", type:"intervals", duration:35, hr:"160-175" },
    today,
  });
  assert.equal(result.type, "easy");
  assert.equal(result.kind, "recovery");
});

test("progression engine recommends the next load", () => {
  const [result] = getProgressionSuggestions(data.strengthLog, { bench_bb:"Bankdrücken" });
  assert.equal(result.action, "steigern");
  assert.equal(result.targetWeight, 62.5);
});

test("weekly report uses a rolling seven-day window", () => {
  const report = generateWeeklyReport(data, today);
  assert.equal(report.sessions, 2);
  assert.equal(report.distance, 6);
  assert.ok(report.highlights.length > 0);
});

test("Strava CSV is normalized and de-duplicated", () => {
  const csv = "Activity ID,Activity Type,Activity Date,Moving Time,Distance,Average Heart Rate\n42,Run,2026-07-22,1800,5000,145";
  const imported = parseHealthExport(csv, "strava", "activities.csv");
  assert.equal(imported.workouts[0].duration, 30);
  assert.equal(imported.workouts[0].distance, 5);
  const once = mergeImportedData({ workouts:[], healthMetrics:[] }, imported);
  const twice = mergeImportedData(once, imported);
  assert.equal(once.importedCounts.workouts, 1);
  assert.equal(twice.importedCounts.workouts, 0);
});

