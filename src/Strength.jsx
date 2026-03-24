import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import MuscleRecoveryPanel from "./MuscleBody";

const MG = [
  { id:"chest", name:"Brust", color:"#c4956a" },
  { id:"back", name:"Rücken", color:"#8ba4b8" },
  { id:"shoulders", name:"Schultern", color:"#c4956a" },
  { id:"biceps", name:"Bizeps", color:"#a8b87c" },
  { id:"triceps", name:"Trizeps", color:"#9b8fb8" },
  { id:"quads", name:"Quadrizeps", color:"#c4956a" },
  { id:"hams", name:"Beinbeuger", color:"#c4956a" },
  { id:"glutes", name:"Glutes", color:"#8ba4b8" },
  { id:"calves", name:"Waden", color:"#9b8fb8" },
  { id:"core", name:"Core", color:"#c4956a" },
  { id:"forearms", name:"Unterarme", color:"#a8b87c" },
  { id:"traps", name:"Trapez", color:"#8ba4b8" },
];

const EX = [
  {id:"bench_bb",name:"Bankdrücken (LH)",m:"chest",s:["triceps","shoulders"],inc:2.5,eq:["bb","bench"]},
  {id:"bench_db",name:"Bankdrücken (KH)",m:"chest",s:["triceps","shoulders"],inc:2,eq:["db","bench"]},
  {id:"incline_bb",name:"Schrägbankdrücken (LH)",m:"chest",s:["shoulders","triceps"],inc:2.5,eq:["bb","bench"]},
  {id:"incline_db",name:"Schrägbankdrücken (KH)",m:"chest",s:["shoulders","triceps"],inc:2,eq:["db","bench"]},
  {id:"decline_bb",name:"Decline Bench (LH)",m:"chest",s:["triceps"],inc:2.5,eq:["bb","bench"]},
  {id:"chest_press_machine",name:"Brustpresse (Maschine)",m:"chest",s:["triceps","shoulders"],inc:2.5,eq:["machine"]},
  {id:"chest_fly_db",name:"Flys (KH)",m:"chest",s:[],inc:2,eq:["db","bench"]},
  {id:"chest_fly_cable",name:"Cable Flys",m:"chest",s:[],inc:2.5,eq:["cable"]},
  {id:"chest_fly_machine",name:"Butterfly (Maschine)",m:"chest",s:[],inc:2.5,eq:["machine"]},
  {id:"pec_deck",name:"Pec Deck",m:"chest",s:[],inc:2.5,eq:["machine"]},
  {id:"dips",name:"Dips",m:"chest",s:["triceps","shoulders"],inc:5,bw:true,eq:["bw"]},
  {id:"pushup",name:"Liegestütze",m:"chest",s:["triceps"],inc:0,bw:true,eq:["bw"]},
  {id:"deadlift",name:"Kreuzheben",m:"back",s:["hams","glutes","core","traps"],inc:2.5,eq:["bb"]},
  {id:"row_bb",name:"Langhantelrudern",m:"back",s:["biceps","traps"],inc:2.5,eq:["bb"]},
  {id:"row_db",name:"KH-Rudern einarmig",m:"back",s:["biceps"],inc:2,eq:["db","bench"]},
  {id:"row_machine",name:"Rudern (Maschine eng)",m:"back",s:["biceps"],inc:2.5,eq:["machine"]},
  {id:"row_machine_single",name:"Rudern einarmig (Maschine)",m:"back",s:["biceps"],inc:2.5,eq:["machine"]},
  {id:"pullup",name:"Klimmzüge",m:"back",s:["biceps"],inc:0,bw:true,eq:["bw","pullup_bar"]},
  {id:"chinup",name:"Chin-Ups",m:"back",s:["biceps"],inc:0,bw:true,eq:["bw","pullup_bar"]},
  {id:"lat_pull_wide",name:"Latzug breit",m:"back",s:["biceps"],inc:2.5,eq:["cable"]},
  {id:"lat_pull_close",name:"Latzug eng",m:"back",s:["biceps"],inc:2.5,eq:["cable"]},
  {id:"cable_row",name:"Kabelrudern sitzend",m:"back",s:["biceps","traps"],inc:2.5,eq:["cable"]},
  {id:"tbar_row",name:"T-Bar Rudern",m:"back",s:["biceps","traps"],inc:2.5,eq:["bb"]},
  {id:"pullover",name:"Pullover",m:"back",s:["chest"],inc:2,eq:["db","bench"]},
  {id:"hyperext",name:"Hyperextensions",m:"back",s:["glutes","hams"],inc:5,bw:true,eq:["bw"]},
  {id:"ohp_smith",name:"Schulterdrücken (Smith)",m:"shoulders",s:["triceps","traps"],inc:2.5,eq:["smith"]},
  {id:"ohp_bb",name:"Schulterdrücken (LH)",m:"shoulders",s:["triceps","traps"],inc:2.5,eq:["bb"]},
  {id:"ohp_db",name:"Schulterdrücken (KH) sitzend",m:"shoulders",s:["triceps"],inc:2,eq:["db","bench"]},
  {id:"ohp_machine",name:"Schulterdrücken (Maschine)",m:"shoulders",s:["triceps"],inc:2.5,eq:["machine"]},
  {id:"lat_raise_db",name:"Seitheben (KH)",m:"shoulders",s:[],inc:1,eq:["db"]},
  {id:"lat_raise_cable",name:"Seitheben (Kabel)",m:"shoulders",s:[],inc:1,eq:["cable"]},
  {id:"lat_raise_lean",name:"Seitheben angelehnt (Bank)",m:"shoulders",s:[],inc:1,eq:["db","bench"]},
  {id:"front_raise",name:"Frontheben",m:"shoulders",s:[],inc:1,eq:["db"]},
  {id:"face_pull",name:"Face Pulls",m:"shoulders",s:["back","traps"],inc:2.5,eq:["cable"]},
  {id:"rear_delt_cable",name:"Reverse Flys (Kabel/Seil)",m:"shoulders",s:["back"],inc:1,eq:["cable"]},
  {id:"rear_delt_machine",name:"Reverse Flys (Maschine)",m:"shoulders",s:["back"],inc:2.5,eq:["machine"]},
  {id:"upright_row",name:"Aufrechtes Rudern",m:"shoulders",s:["traps"],inc:2.5,eq:["bb"]},
  {id:"arnold_press",name:"Arnold Press",m:"shoulders",s:["triceps"],inc:2,eq:["db"]},
  {id:"shrugs_db",name:"Shrugs (KH)",m:"traps",s:["shoulders"],inc:5,eq:["db"]},
  {id:"shrugs_bb",name:"Shrugs (LH)",m:"traps",s:["shoulders"],inc:5,eq:["bb"]},
  {id:"shrugs_smith",name:"Shrugs (Smith)",m:"traps",s:["shoulders"],inc:5,eq:["smith"]},
  {id:"shrugs_machine",name:"Shrugs (Maschine)",m:"traps",s:["shoulders"],inc:5,eq:["machine"]},
  {id:"neck_pull_cable",name:"Nackenziehen (Kabel)",m:"traps",s:[],inc:2.5,eq:["cable"]},
  {id:"upright_row_db",name:"Aufrechtes Rudern (KH)",m:"traps",s:["shoulders"],inc:2,eq:["db"]},
  {id:"upright_row_cable",name:"Aufrechtes Rudern (Kabel)",m:"traps",s:["shoulders"],inc:2.5,eq:["cable"]},
  {id:"upright_row_ez",name:"Aufrechtes Rudern (SZ)",m:"traps",s:["shoulders"],inc:2.5,eq:["ez"]},
  {id:"rack_pull",name:"Rack Pulls",m:"traps",s:["back","forearms"],inc:5,eq:["bb","rack"]},
  {id:"prone_y_raise",name:"Y-Raises (liegend)",m:"traps",s:["shoulders"],inc:1,eq:["db","bench"]},
  {id:"curl_bb",name:"Langhantel-Curls",m:"biceps",s:[],inc:2.5,eq:["bb"]},
  {id:"curl_db",name:"KH-Curls",m:"biceps",s:[],inc:2,eq:["db"]},
  {id:"curl_ez",name:"SZ-Curls",m:"biceps",s:[],inc:2.5,eq:["ez"]},
  {id:"hammer_curl",name:"Hammer Curls",m:"biceps",s:["forearms"],inc:2,eq:["db"]},
  {id:"preacher_curl",name:"Preacher Curls (Sitzbank)",m:"biceps",s:[],inc:2,eq:["ez","bench"]},
  {id:"preacher_machine",name:"Bizeps (Maschine/Curl-Sitz)",m:"biceps",s:[],inc:2.5,eq:["machine"]},
  {id:"incline_curl",name:"Incline Curls",m:"biceps",s:[],inc:2,eq:["db","bench"]},
  {id:"cable_curl",name:"Bizeps Curls (Kabel)",m:"biceps",s:[],inc:2.5,eq:["cable"]},
  {id:"conc_curl",name:"Concentration Curls",m:"biceps",s:[],inc:1,eq:["db"]},
  {id:"spider_curl",name:"Spider Curls",m:"biceps",s:[],inc:2,eq:["db","bench"]},
  {id:"tri_pushdown_rope",name:"Trizepsdrücken (Seil)",m:"triceps",s:[],inc:2.5,eq:["cable"]},
  {id:"tri_pushdown_bar",name:"Trizepsdrücken (Stange)",m:"triceps",s:[],inc:2.5,eq:["cable"]},
  {id:"tri_pushdown_single",name:"Trizepsdrücken einarmig (Kabel)",m:"triceps",s:[],inc:1,eq:["cable"]},
  {id:"tri_overhead_db",name:"Overhead Extension (KH)",m:"triceps",s:[],inc:2,eq:["db"]},
  {id:"tri_overhead_cable",name:"Overhead Extension (Kabel)",m:"triceps",s:[],inc:2.5,eq:["cable"]},
  {id:"skull_crush",name:"Skull Crushers",m:"triceps",s:[],inc:2,eq:["ez","bench"]},
  {id:"tri_dip",name:"Trizeps-Dips",m:"triceps",s:["chest"],inc:0,bw:true,eq:["bw"]},
  {id:"tri_kickback",name:"Kickbacks",m:"triceps",s:[],inc:1,eq:["db"]},
  {id:"close_grip_bench",name:"Enges Bankdrücken",m:"triceps",s:["chest"],inc:2.5,eq:["bb","bench"]},
  {id:"squat_bb",name:"Kniebeugen (LH)",m:"quads",s:["glutes","core"],inc:2.5,eq:["bb","rack"]},
  {id:"squat_front",name:"Front Squats",m:"quads",s:["core","glutes"],inc:2.5,eq:["bb","rack"]},
  {id:"squat_smith",name:"Kniebeugen (Smith)",m:"quads",s:["glutes"],inc:2.5,eq:["smith"]},
  {id:"leg_press",name:"Beinpresse",m:"quads",s:["glutes"],inc:5,eq:["machine"]},
  {id:"leg_ext",name:"Beinstrecker",m:"quads",s:[],inc:2.5,eq:["machine"]},
  {id:"lunge_db",name:"Ausfallschritte (KH)",m:"quads",s:["glutes","hams"],inc:2,eq:["db"]},
  {id:"bulgarian",name:"Bulgarian Split Squats",m:"quads",s:["glutes"],inc:2,eq:["db","bench"]},
  {id:"hack_squat",name:"Hack Squat",m:"quads",s:["glutes"],inc:5,eq:["machine"]},
  {id:"goblet_squat",name:"Goblet Squat",m:"quads",s:["core","glutes"],inc:2,eq:["db"]},
  {id:"rdl",name:"Rumänisches Kreuzheben",m:"hams",s:["back","glutes"],inc:2.5,eq:["bb"]},
  {id:"leg_curl_lying",name:"Beinbeuger liegend",m:"hams",s:[],inc:2.5,eq:["machine"]},
  {id:"leg_curl_seated",name:"Beinbeuger sitzend",m:"hams",s:[],inc:2.5,eq:["machine"]},
  {id:"good_morning",name:"Good Mornings",m:"hams",s:["back","glutes"],inc:2.5,eq:["bb"]},
  {id:"stiff_leg_dl",name:"Gestrecktes Kreuzheben",m:"hams",s:["back","glutes"],inc:2.5,eq:["bb"]},
  {id:"hip_thrust",name:"Hip Thrust",m:"glutes",s:["hams"],inc:5,eq:["bb","bench"]},
  {id:"glute_bridge",name:"Glute Bridge",m:"glutes",s:["hams"],inc:5,eq:["bb"]},
  {id:"cable_kickback",name:"Cable Kickbacks",m:"glutes",s:[],inc:2.5,eq:["cable"]},
  {id:"calf_raise_stand",name:"Wadenheben stehend",m:"calves",s:[],inc:5,eq:["machine"]},
  {id:"calf_raise_seated",name:"Wadenheben sitzend",m:"calves",s:[],inc:5,eq:["machine"]},
  {id:"plank",name:"Plank",m:"core",s:[],inc:0,timed:true,eq:["bw"]},
  {id:"crunch",name:"Crunches",m:"core",s:[],inc:0,bw:true,eq:["bw"]},
  {id:"crunch_machine",name:"Bauchpresse (Maschine)",m:"core",s:[],inc:2.5,eq:["machine"]},
  {id:"cable_crunch",name:"Kabel-Crunches",m:"core",s:[],inc:2.5,eq:["cable"]},
  {id:"hanging_leg",name:"Hanging Leg Raises",m:"core",s:[],inc:0,bw:true,eq:["bw","pullup_bar"]},
  {id:"ab_wheel",name:"Ab Wheel Rollout",m:"core",s:[],inc:0,bw:true,eq:["bw"]},
  {id:"russian_twist",name:"Russian Twists",m:"core",s:[],inc:2,eq:["db"]},
  {id:"woodchop",name:"Woodchops (Kabel)",m:"core",s:["shoulders"],inc:2.5,eq:["cable"]},
  {id:"situp",name:"Sit-Ups",m:"core",s:[],inc:0,bw:true,eq:["bw"]},
  {id:"decline_crunch",name:"Decline Crunches",m:"core",s:[],inc:0,bw:true,eq:["bench"]},
  {id:"wrist_curl",name:"Wrist Curls",m:"forearms",s:[],inc:1,eq:["db"]},
  {id:"reverse_curl",name:"Reverse Curls",m:"forearms",s:["biceps"],inc:2,eq:["bb"]},
  {id:"farmer_walk",name:"Farmer Walks",m:"forearms",s:["traps","core"],inc:5,eq:["db"]},
  {id:"plate_pinch",name:"Plate Pinch Hold",m:"forearms",s:[],inc:0,timed:true,eq:["bw"]},
];

const EQUIPMENT = [
  {id:"bb",name:"Langhantel",icon:"LH"},
  {id:"db",name:"Kurzhanteln",icon:"KH"},
  {id:"ez",name:"SZ-Stange",icon:"SZ"},
  {id:"cable",name:"Kabelturm",icon:"KB"},
  {id:"machine",name:"Maschinen",icon:"MA"},
  {id:"smith",name:"Smith Machine",icon:"SM"},
  {id:"bench",name:"Bank",icon:"BK"},
  {id:"rack",name:"Rack/Ständer",icon:"RK"},
  {id:"pullup_bar",name:"Klimmzugstange",icon:"KZ"},
  {id:"bw",name:"Bodyweight",icon:"BW"},
];

const SPLIT_PRESETS = {
  max:{name:"Mein Split (5+1 Tage)",days:[
    {name:"Brust + Trizeps",exercises:["chest_fly_cable","chest_fly_machine","chest_press_machine","incline_db","tri_pushdown_single","tri_pushdown_rope","tri_overhead_db"]},
    {name:"Rücken + Bizeps",exercises:["lat_pull_wide","lat_pull_close","row_machine","pullup","row_machine_single","preacher_machine","cable_curl"]},
    {name:"Schultern",exercises:["lat_raise_db","lat_raise_cable","lat_raise_lean","ohp_smith","ohp_machine","ohp_db","rear_delt_cable"]},
    {name:"Beine + Bauch",exercises:["leg_ext","leg_curl_seated","leg_press","squat_bb","crunch_machine","cable_crunch","hanging_leg"]},
    {name:"Arme + Unterarme",exercises:["curl_bb","hammer_curl","cable_curl","preacher_machine","tri_pushdown_rope","tri_overhead_db","reverse_curl","wrist_curl","farmer_walk"]},
  ]},
  ppl:{name:"Push / Pull / Legs",days:[
    {name:"Push",exercises:["bench_bb","incline_db","chest_fly_cable","ohp_db","lat_raise_db","tri_pushdown_rope","skull_crush"]},
    {name:"Pull",exercises:["deadlift","row_bb","lat_pull_wide","cable_row","face_pull","curl_bb","hammer_curl"]},
    {name:"Legs",exercises:["squat_bb","leg_press","rdl","leg_ext","leg_curl_seated","calf_raise_stand","hip_thrust"]},
  ]},
  ul:{name:"Upper / Lower",days:[
    {name:"Upper",exercises:["bench_bb","row_bb","ohp_db","lat_pull_wide","incline_db","curl_db","tri_pushdown_rope","lat_raise_db"]},
    {name:"Lower",exercises:["squat_bb","rdl","leg_press","leg_curl_seated","hip_thrust","calf_raise_stand","crunch_machine"]},
  ]},
  bro:{name:"Bro Split (5-Tage)",days:[
    {name:"Brust",exercises:["bench_bb","incline_db","chest_fly_cable","chest_press_machine","dips"]},
    {name:"Rücken",exercises:["deadlift","row_bb","lat_pull_wide","cable_row","pullup","hyperext"]},
    {name:"Schultern",exercises:["ohp_bb","lat_raise_db","lat_raise_cable","rear_delt_cable","face_pull","shrugs_db"]},
    {name:"Arme",exercises:["curl_bb","hammer_curl","preacher_machine","tri_pushdown_rope","skull_crush","tri_overhead_db"]},
    {name:"Beine",exercises:["squat_bb","leg_press","rdl","leg_ext","leg_curl_seated","calf_raise_stand","hip_thrust"]},
  ]},
  fb:{name:"Ganzkörper (3x)",days:[
    {name:"Ganzkörper A",exercises:["squat_bb","bench_bb","row_bb","ohp_db","curl_db","crunch_machine"]},
    {name:"Ganzkörper B",exercises:["deadlift","incline_db","lat_pull_wide","lat_raise_db","hammer_curl","hanging_leg"]},
    {name:"Ganzkörper C",exercises:["leg_press","chest_fly_cable","cable_row","face_pull","tri_pushdown_rope","hip_thrust"]},
  ]},
};

// Set types: W=warmup, N=normal, D=drop, F=failure
const SET_TYPES = [{id:"N",label:"Normal",color:"#F2EDE7"},{id:"W",label:"Warmup",color:"#D4A024"},{id:"D",label:"Drop",color:"#9C7BF2"},{id:"F",label:"Failure",color:"#E8553A"}];

function suggestWeight(exerciseId, prevSets, goalReps=[8,12], allLog=[], recoveryPct=100, exList=EX) {
  if (!prevSets?.length) return null;
  const ex = exList.find(e => e.id === exerciseId) || EX.find(e => e.id === exerciseId);
  if (!ex || ex.bw || ex.timed) return null;
  const workSets = prevSets.filter(s => s.type !== "W" && s.type !== "D");
  if (!workSets.length) return null;
  const lw = workSets[0]?.weight || 0;
  if (lw === 0) return null;

  // 1. RPE signal
  const rpeVals = workSets.filter(s => s.rpe > 0).map(s => s.rpe);
  const avgRpe = rpeVals.length ? rpeVals.reduce((a,b)=>a+b,0)/rpeVals.length : 0;

  // 2. Rep performance
  const allHit = workSets.every(s => s.reps >= goalReps[1]);
  const mostHit = workSets.filter(s => s.reps >= goalReps[0]).length >= workSets.length * 0.75;
  const anyBelow = workSets.some(s => s.reps < goalReps[0]);

  // 3. Volume trend (last 4 sessions of this exercise)
  const exHistory = allLog.flatMap(w => (w.exercises||[]).filter(e => e.exerciseId === exerciseId).map(e => ({
    date: w.date, vol: e.sets.filter(s=>s.type!=="W"&&s.type!=="D").reduce((a,s)=>a+s.weight*s.reps,0),
    best1rm: Math.max(0,...e.sets.filter(s=>s.type!=="W").map(s=>est1RM(s.weight,s.reps)))
  }))).slice(-4);

  const volTrend = exHistory.length >= 2 ? (exHistory[exHistory.length-1].vol - exHistory[0].vol) / Math.max(exHistory[0].vol,1) : 0;
  const e1rmTrend = exHistory.length >= 2 ? exHistory[exHistory.length-1].best1rm - exHistory[0].best1rm : 0;

  // 4. Recovery signal
  const lowRecovery = recoveryPct < 50;

  // Decision matrix
  if (lowRecovery) {
    return { weight: Math.max(lw - ex.inc, 0), reason: `Recovery ${recoveryPct}% — leichter starten, Verletzung vermeiden` };
  }
  if (allHit && avgRpe > 0 && avgRpe <= 6) {
    return { weight: lw + ex.inc * 2, reason: `RPE ${avgRpe.toFixed(0)} + alle Reps → +${ex.inc*2} kg (doppelt)` };
  }
  if (allHit && avgRpe > 0 && avgRpe <= 7) {
    return { weight: lw + ex.inc, reason: `RPE ${avgRpe.toFixed(0)} + alle Reps → +${ex.inc} kg` };
  }
  if (allHit) {
    return { weight: lw + ex.inc, reason: `Alle Sätze ${goalReps[1]}+ Reps → +${ex.inc} kg` };
  }
  if (avgRpe >= 9.5) {
    return { weight: lw, reason: `RPE ${avgRpe.toFixed(1)} — am Limit. Gewicht halten, Reps steigern` };
  }
  if (anyBelow && avgRpe >= 8.5) {
    return { weight: lw, reason: `Unter Zielbereich bei hohem RPE — Gewicht halten` };
  }
  if (mostHit && e1rmTrend > 0) {
    return { weight: lw, reason: `1RM steigt (+${e1rmTrend.toFixed(1)}kg) — Reps weiter steigern, dann Gewicht` };
  }
  if (volTrend < -0.15) {
    return { weight: lw, reason: `Volumen rückläufig (${(volTrend*100).toFixed(0)}%) — stabilisieren` };
  }
  return { weight: lw, reason: `Weiter mit ${lw} kg, Reps Richtung ${goalReps[1]} steigern` };
}

function est1RM(w, r) { return r<=0||w<=0?0:r===1?w:Math.round(w*(36/(37-Math.min(r,36)))*10)/10; }

// ═══ WARM-UP GENERATOR ═══
const WARMUP_EXERCISE_IDS = new Set([
  "bench_bb","bench_db","incline_bb","incline_db","decline_bb","chest_press_machine",
  "deadlift","row_bb","tbar_row","lat_pull_wide","lat_pull_close","cable_row",
  "ohp_bb","ohp_db","ohp_smith","ohp_machine",
  "squat_bb","squat_front","squat_smith","leg_press","hack_squat",
  "rdl","stiff_leg_dl","good_morning",
  "hip_thrust","glute_bridge",
  "close_grip_bench","skull_crush",
  "curl_bb","curl_ez",
  "row_machine","rack_pull","shrugs_bb","shrugs_smith",
]);

function isWarmupRelevant(exerciseId, exList=EX) {
  const ex = exList.find(e => e.id === exerciseId) || EX.find(e => e.id === exerciseId);
  if (!ex || ex.bw || ex.timed) return false;
  if (WARMUP_EXERCISE_IDS.has(exerciseId)) return true;
  // Also relevant if the exercise uses a barbell or smith or is a compound (has secondary muscles)
  if (ex.eq?.some(e => e === "bb" || e === "smith") && ex.s?.length > 0) return true;
  return false;
}

function roundToIncrement(weight, increment) {
  if (increment <= 0) return Math.round(weight);
  return Math.round(weight / increment) * increment;
}

function generateWarmupSets(exerciseId, targetWeight, exList=EX) {
  const ex = exList.find(e => e.id === exerciseId) || EX.find(e => e.id === exerciseId);
  if (!ex || targetWeight <= 0) return [];

  const inc = ex.inc || 2.5;
  const sets = [];

  // For very light work weights (<= 30kg), simplified warmup
  if (targetWeight <= 30) {
    const w1 = roundToIncrement(targetWeight * 0.5, inc);
    if (w1 >= inc) {
      sets.push({ weight: w1, reps: 10, done: false, type: "W", rpe: 0 });
    }
    return sets;
  }

  // Standard ramp: ~37%, ~57%, ~72%, optional ~82% for heavy
  const ramp = [
    { pct: 0.37, reps: 10 },
    { pct: 0.57, reps: 6 },
    { pct: 0.72, reps: 3 },
  ];

  // Add a heavy single for work weights > 80kg
  if (targetWeight > 80) {
    ramp.push({ pct: 0.82, reps: 1 });
  }

  for (const step of ramp) {
    const w = roundToIncrement(targetWeight * step.pct, inc);
    // Skip if weight rounds to 0 or is same as previous
    if (w < inc) continue;
    if (sets.length > 0 && w <= sets[sets.length - 1].weight) continue;
    sets.push({ weight: w, reps: step.reps, done: false, type: "W", rpe: 0 });
  }

  return sets;
}

// ═══ EXERCISE ANALYTICS HELPERS ═══
function getExerciseHistory(exerciseId, log) {
  return log.filter(w => (w.exercises||[]).some(e => e.exerciseId === exerciseId)).map(w => {
    const ex = w.exercises.find(e => e.exerciseId === exerciseId);
    const work = ex.sets.filter(s => s.type !== "W");
    const all = ex.sets;
    const vol = work.reduce((a, s) => a + s.weight * s.reps, 0);
    const totalReps = work.reduce((a, s) => a + s.reps, 0);
    const maxW = work.length ? Math.max(...work.map(s => s.weight)) : 0;
    const best1rm = work.length ? Math.max(...work.map(s => est1RM(s.weight, s.reps))) : 0;
    const bestSet = work.reduce((b, s) => (s.weight * s.reps > b.weight * b.reps ? s : b), { weight: 0, reps: 0 });
    return { date: w.date, sets: all, workSets: work, vol, totalReps, totalSets: work.length, maxW, best1rm, bestSet, sessionNote: ex.sessionNote || "" };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

function getExerciseStats(exerciseId, log, allEx) {
  const hist = getExerciseHistory(exerciseId, log);
  if (!hist.length) return null;
  const def = (allEx || EX).find(e => e.id === exerciseId) || EX.find(e => e.id === exerciseId);
  const mg = MG.find(m => m.id === def?.m);

  const totalSessions = hist.length;
  const totalSets = hist.reduce((a, h) => a + h.totalSets, 0);
  const totalReps = hist.reduce((a, h) => a + h.totalReps, 0);
  const totalVol = hist.reduce((a, h) => a + h.vol, 0);
  const best1rm = Math.max(...hist.map(h => h.best1rm));
  const maxWeight = Math.max(...hist.map(h => h.maxW));
  const bestSessionVol = Math.max(...hist.map(h => h.vol));
  const bestSet = hist.reduce((b, h) => (h.bestSet.weight * h.bestSet.reps > b.weight * b.reps ? h.bestSet : b), { weight: 0, reps: 0 });
  const lastTrained = hist[hist.length - 1].date;
  const firstLogged = hist[0].date;

  const now = new Date();
  const d14 = new Date(now); d14.setDate(d14.getDate() - 14);
  const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
  const freq14 = hist.filter(h => new Date(h.date) >= d14).length;
  const freq30 = hist.filter(h => new Date(h.date) >= d30).length;

  const first1rm = hist[0].best1rm;
  const last1rm = hist[hist.length - 1].best1rm;
  const progressSinceFirst = best1rm > 0 && first1rm > 0 ? Math.round((last1rm - first1rm) * 10) / 10 : 0;

  // Best 1RM in last 30 days
  const recent30 = hist.filter(h => new Date(h.date) >= d30);
  const best1rm30 = recent30.length ? Math.max(...recent30.map(h => h.best1rm)) : 0;

  return {
    def, mg, hist, totalSessions, totalSets, totalReps, totalVol,
    best1rm, maxWeight, bestSessionVol, bestSet, lastTrained, firstLogged,
    freq14, freq30, progressSinceFirst, best1rm30,
    avgSetsPerSession: Math.round(totalSets / totalSessions * 10) / 10,
    avgRepsPerSession: Math.round(totalReps / totalSessions),
    avgVolPerSession: Math.round(totalVol / totalSessions),
  };
}

function getExerciseTrend(hist) {
  if (hist.length < 3) return "neutral";
  const recent = hist.slice(-3);
  const older = hist.slice(-6, -3);
  if (!older.length) return "neutral";
  const recentAvg = recent.reduce((a, h) => a + h.best1rm, 0) / recent.length;
  const olderAvg = older.reduce((a, h) => a + h.best1rm, 0) / older.length;
  const pct = (recentAvg - olderAvg) / Math.max(olderAvg, 1);
  if (pct > 0.02) return "up";
  if (pct < -0.02) return "down";
  return "flat";
}

function getMilestones(hist, def) {
  const ms = [];
  if (!hist.length) return ms;
  const thresholds = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];
  const maxW = Math.max(...hist.map(h => h.maxW));
  for (const t of thresholds) {
    if (maxW >= t) {
      const first = hist.find(h => h.maxW >= t);
      ms.push({ label: `${t} kg`, date: first?.date, reached: true });
    } else {
      ms.push({ label: `${t} kg`, date: null, reached: false });
      break; // only show next unreached
    }
  }
  return ms;
}

// ═══ EXERCISE DETAIL COMPONENT ═══
function ExerciseDetail({ exerciseId, sLog, C, onClose, exerciseNotes, onEditNote, allEx }) {
  const findEx = (id) => (allEx || EX).find(e => e.id === id) || EX.find(e => e.id === id);
  const [chartType, setChartType] = useState("1rm");
  const stats = useMemo(() => getExerciseStats(exerciseId, sLog, allEx), [exerciseId, sLog, allEx]);

  if (!stats) return (
    <div style={{padding:40,textAlign:"center",color:C.dim}}>
      <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Keine Daten</div>
      <button onClick={onClose} style={{padding:"10px 24px",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Zurück</button>
    </div>
  );

  const { def, mg, hist, totalSessions, totalSets, totalReps, totalVol, best1rm, maxWeight, bestSessionVol, bestSet, lastTrained, firstLogged, freq14, freq30, progressSinceFirst, best1rm30, avgSetsPerSession, avgVolPerSession } = stats;
  const trend = getExerciseTrend(hist);
  const milestones = getMilestones(hist, def);
  const trendColor = trend === "up" ? "#8BC34A" : trend === "down" ? "#E8553A" : "#D4A024";
  const trendLabel = trend === "up" ? "Steigend" : trend === "down" ? "Fallend" : "Stabil";
  const trendIcon = trend === "up" ? "\u2197" : trend === "down" ? "\u2198" : "\u2192";

  const chartData = hist.map(h => ({
    d: new Date(h.date).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
    e1rm: Math.round(h.best1rm * 10) / 10,
    maxW: h.maxW,
    vol: Math.round(h.vol),
    sets: h.totalSets,
    reps: h.totalReps,
  })).slice(-20);

  const chartKey = { "1rm": { key: "e1rm", name: "Est. 1RM (kg)", color: C.ember }, "maxW": { key: "maxW", name: "Max Gewicht (kg)", color: C.sky }, "vol": { key: "vol", name: "Volumen (kg)", color: C.gold }, "sets": { key: "sets", name: "Sätze", color: C.violet } };
  const cc = chartKey[chartType];

  const sty = { card: { background: C.surface, borderRadius: 20, padding: "18px 14px", border: `1px solid ${C.border}`, marginBottom: 14 }, lbl: { fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, paddingLeft: 4 } };
  const ttCfg = { contentStyle: { background: C.elevated, border: `1px solid ${C.borderLight}`, borderRadius: 10, fontSize: 12, fontFamily: "'Outfit',sans-serif", color: C.text }, labelStyle: { color: C.muted } };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit'" }}>&larr;</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{def?.name}</div>
          <div style={{ fontSize: 13, color: mg?.color, fontWeight: 600 }}>{mg?.name}</div>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 10, background: `${trendColor}18`, border: `1px solid ${trendColor}30`, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 14 }}>{trendIcon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: trendColor }}>{trendLabel}</span>
        </div>
      </div>

      {/* Persistent notes */}
      {(()=>{
        const note = exerciseNotes?.[exerciseId];
        return (
          <div style={{background:`${C.sky}0a`,borderRadius:16,padding:note?"14px 16px":"10px 16px",border:`1px solid ${C.sky}18`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,cursor:"pointer"}} onClick={()=>onEditNote?.(exerciseId)}>
            {note ? (
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,color:C.sky,letterSpacing:1.5,marginBottom:4}}>CUES</div>
                <div style={{fontSize:13,color:C.sub,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{note}</div>
              </div>
            ) : (
              <div style={{fontSize:12,color:C.dim}}>Cues hinzufügen...</div>
            )}
            <div style={{fontSize:12,color:C.dim,flexShrink:0,marginTop:note?0:0}}>&#9998;</div>
          </div>
        );
      })()}

      {/* Key stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { v: `${Math.round(best1rm)}`, u: "kg", l: "Best 1RM", c: C.ember },
          { v: `${maxWeight}`, u: "kg", l: "Max Gewicht", c: C.sky },
          { v: `${totalSessions}`, u: "", l: "Sessions", c: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 16, padding: "14px 8px", border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.c, letterSpacing: -1 }}>{s.v}<span style={{ fontSize: 11, color: C.muted }}>{s.u}</span></div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { v: `${Math.round(totalVol / 1000 * 10) / 10}t`, l: "Total Volumen", c: C.gold },
          { v: `${totalSets}`, l: "Total Sätze", c: C.violet },
          { v: `${bestSet.weight}x${bestSet.reps}`, l: "Bester Satz", c: C.ember },
          { v: `${Math.round(bestSessionVol)}kg`, l: "Beste Session", c: C.sky },
          { v: `${avgSetsPerSession}`, l: "\u00d8 Sätze/Session", c: C.muted },
          { v: `${Math.round(avgVolPerSession)}kg`, l: "\u00d8 Vol/Session", c: C.muted },
        ].map((s, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 12, padding: "10px 12px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: C.dim, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div style={sty.card}>
        <div style={sty.lbl}>INSIGHTS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {progressSinceFirst !== 0 && (
            <div style={{ fontSize: 13, color: progressSinceFirst > 0 ? C.lime : C.ember, fontWeight: 600 }}>
              {progressSinceFirst > 0 ? "\u2197" : "\u2198"} {progressSinceFirst > 0 ? "+" : ""}{progressSinceFirst} kg 1RM seit erstem Log
            </div>
          )}
          {best1rm30 > 0 && <div style={{ fontSize: 13, color: C.sub }}>Best 1RM (30 Tage): <span style={{ fontWeight: 700, color: C.ember }}>{Math.round(best1rm30)} kg</span></div>}
          <div style={{ fontSize: 13, color: C.sub }}>Letztes Training: <span style={{ fontWeight: 700 }}>{new Date(lastTrained).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}</span></div>
          <div style={{ fontSize: 13, color: C.sub }}>Häufigkeit: <span style={{ fontWeight: 700 }}>{freq14}x in 14 Tagen</span> &middot; <span style={{ fontWeight: 700 }}>{freq30}x in 30 Tagen</span></div>
          {firstLogged !== lastTrained && <div style={{ fontSize: 13, color: C.dim }}>Erstes Log: {new Date(firstLogged).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "2-digit" })}</div>}
        </div>
      </div>

      {/* Chart selector */}
      <div style={sty.card}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["1rm", "1RM"], ["maxW", "Max KG"], ["vol", "Volumen"], ["sets", "Sätze"]].map(([k, l]) => (
            <button key={k} onClick={() => setChartType(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: chartType === k ? `1.5px solid ${chartKey[k].color}` : `1px solid ${C.border}`, background: chartType === k ? `${chartKey[k].color}14` : C.card, color: chartType === k ? chartKey[k].color : C.dim, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>{l}</button>
          ))}
        </div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData}>
              <defs><linearGradient id={`g_${chartType}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={cc.color} stopOpacity={0.25} /><stop offset="100%" stopColor={cc.color} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickLine={false} />
              <Tooltip {...ttCfg} />
              <Area type="monotone" dataKey={cc.key} stroke={cc.color} fill={`url(#g_${chartType})`} strokeWidth={2.5} name={cc.name} dot={{ r: 3, fill: cc.color }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: C.dim, fontSize: 13 }}>Mehr Daten nötig</div>}
      </div>

      {/* Milestones */}
      {milestones.length > 0 && !def?.bw && (
        <div style={sty.card}>
          <div style={sty.lbl}>MEILENSTEINE</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {milestones.map((m, i) => (
              <div key={i} style={{
                padding: "6px 14px", borderRadius: 10,
                background: m.reached ? `${C.gold}14` : C.card,
                border: `1px solid ${m.reached ? `${C.gold}40` : C.border}`,
                opacity: m.reached ? 1 : 0.4,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: m.reached ? C.gold : C.dim }}>{m.label}</div>
                {m.reached && m.date && <div style={{ fontSize: 9, color: C.muted }}>{new Date(m.date).toLocaleDateString("de-DE", { month: "short", year: "2-digit" })}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div style={sty.card}>
        <div style={sty.lbl}>LETZTE SESSIONS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {hist.slice(-8).reverse().map((h, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 12, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{new Date(h.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{h.totalSets} Sätze &middot; {Math.round(h.vol)}kg</span>
              </div>
              <div style={{ fontSize: 12, color: C.sub }}>
                {h.workSets.map(s => `${s.weight}x${s.reps}${s.type && s.type !== "N" ? `(${s.type})` : ""}`).join(", ")}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: C.dim }}>
                <span>Best: {h.bestSet.weight}x{h.bestSet.reps}</span>
                <span>1RM: {Math.round(h.best1rm)}kg</span>
                <span>Max: {h.maxW}kg</span>
              </div>
              {h.sessionNote && <div style={{ fontSize: 11, color: C.sky, fontStyle: "italic", marginTop: 4 }}>{h.sessionNote}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ RECOVERY MODEL ═══
function muscleRec(muscle, log, exList=EX) {
  const now = Date.now(); let lastTime = 0; let lastVolume = 0;
  for (const w of log) for (const ex of (w.exercises||[])) {
    const d = exList.find(e => e.id === ex.exerciseId) || EX.find(e => e.id === ex.exerciseId);
    if (d && (d.m === muscle || d.s?.includes(muscle))) {
      const t = new Date(w.date).getTime();
      if (t > lastTime) {
        lastTime = t;
        const isPrimary = d.m === muscle;
        lastVolume = ex.sets.filter(s=>s.type!=="W").reduce((a,s)=>a+s.weight*s.reps,0) * (isPrimary ? 1 : 0.4);
      }
    }
  }
  if (!lastTime) return 100;
  const daysSince = (now - lastTime) / (1000*60*60*24);
  // Higher volume = longer recovery needed (2-4 days scale)
  const recoveryDays = lastVolume > 5000 ? 4 : lastVolume > 2000 ? 3 : 2;
  return Math.min(100, Math.round(daysSince / recoveryDays * 100));
}

// ═══ REST TIMER DEFAULTS (seconds) ═══
const REST_DEFAULTS = { compound: 180, isolation: 90, default: 120 };
const COMPOUND_IDS = ["bench_bb","bench_db","incline_bb","incline_db","decline_bb","squat_bb","squat_front","squat_smith","deadlift","rdl","ohp_bb","ohp_smith","row_bb","hip_thrust","leg_press"];

export default function StrengthTab({ C, data, update, onBack }) {
  const [sub, setSub] = useState("log");
  const [detailEx, setDetailEx] = useState(null); // exercise detail view
  const [active, setActive] = useState(() => {
    try { const s = localStorage.getItem("cardio-activeWorkout"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [picker, setPicker] = useState(false);
  const [exFilter, setExFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [restStart, setRestStart] = useState(null);
  const [restSec, setRestSec] = useState(0);
  const [restTarget, setRestTarget] = useState(120);
  const [restAlerted, setRestAlerted] = useState(false);
  const [histEx, setHistEx] = useState(null);
  const [tmplName, setTmplName] = useState("");
  const [showTmpl, setShowTmpl] = useState(false);
  const [showSplits, setShowSplits] = useState(false);
  const [summary, setSummary] = useState(null); // workout summary after finish
  const [aiWorkout, setAiWorkout] = useState(null); // AI-generated workout preview
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCoach, setAiCoach] = useState(null); // AI post-workout coaching tips
  const [aiCoachLoading, setAiCoachLoading] = useState(false);
  const [aiCoachExpanded, setAiCoachExpanded] = useState(false);
  const [aiSwap, setAiSwap] = useState(null); // {exerciseIndex, loading, suggestions}
  const [aiWeakness, setAiWeakness] = useState(null); // weakness analysis result
  const [aiWeaknessLoading, setAiWeaknessLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // [{role:"user"|"assistant", content:"..."}]
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const timerRef = useRef(null);

  // ═══ PERSIST ACTIVE WORKOUT ═══
  useEffect(() => {
    try {
      if (active) localStorage.setItem("cardio-activeWorkout", JSON.stringify(active));
      else localStorage.removeItem("cardio-activeWorkout");
    } catch {}
  }, [active]);

  const sLog = data.strengthLog || [];
  const templates = data.strengthTemplates || [];
  const trainingDays = data.trainingDays || [];
  const userEquipment = data.userEquipment || EQUIPMENT.map(e => e.id);
  const exerciseNotes = data.exerciseNotes || {}; // { [exerciseId]: "note text" }
  const customExercises = data.customExercises || []; // user-created exercises
  const [showEqSettings, setShowEqSettings] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [showCustomExModal, setShowCustomExModal] = useState(false);
  const [editingNoteFor, setEditingNoteFor] = useState(null);
  const [noteText, setNoteText] = useState("");

  // Merge built-in + custom exercises
  const ALL_EX = useMemo(() => [...EX, ...customExercises], [customExercises]);

  const save = useCallback((log, tmpls, days, eq, notes, custEx) => {
    update(prev => ({
      ...(log !== undefined ? { strengthLog: log } : {}),
      ...(tmpls !== undefined ? { strengthTemplates: tmpls } : {}),
      ...(days !== undefined ? { trainingDays: days } : {}),
      ...(eq !== undefined ? { userEquipment: eq } : {}),
      ...(notes !== undefined ? { exerciseNotes: notes } : {}),
      ...(custEx !== undefined ? { customExercises: custEx } : {}),
    }));
  }, [update]);

  // ═══ NOTE HELPERS ═══
  const getExNote = (eid) => exerciseNotes[eid] || "";
  const setExNote = (eid, text) => {
    const next = { ...exerciseNotes, [eid]: text.trim() };
    if (!text.trim()) delete next[eid];
    save(undefined, undefined, undefined, undefined, next);
  };
  const openNoteEditor = (eid) => { setNoteText(getExNote(eid)); setEditingNoteFor(eid); };
  const saveNoteEditor = () => { if (editingNoteFor) setExNote(editingNoteFor, noteText); setEditingNoteFor(null); };
  const updateSessionNote = (ei, text) => setActive(p => ({
    ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : { ...e, sessionNote: text })
  }));

  const toggleEquipment = (eqId) => {
    const next = userEquipment.includes(eqId) ? userEquipment.filter(e => e !== eqId) : [...userEquipment, eqId];
    save(undefined, undefined, undefined, next);
  };

  // Filter exercises by user equipment
  const availableEx = useMemo(() => ALL_EX.filter(ex => ex.eq?.length ? ex.eq.some(e => userEquipment.includes(e)) : true), [userEquipment, ALL_EX]);

  // Recently used exercises
  const recentExIds = useMemo(() => {
    const seen = new Set(); const result = [];
    for (const w of [...sLog].reverse()) {
      for (const ex of (w.exercises || [])) {
        if (!seen.has(ex.exerciseId)) { seen.add(ex.exerciseId); result.push(ex.exerciseId); }
        if (result.length >= 10) return result;
      }
    }
    return result;
  }, [sLog]);

  // Timer with countdown & vibration
  useEffect(() => {
    if (restStart) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - restStart) / 1000);
        setRestSec(elapsed);
        if (elapsed >= restTarget && !restAlerted) {
          setRestAlerted(true);
          try { navigator.vibrate?.([200, 100, 200]); } catch {}
        }
      }, 250);
    } else { clearInterval(timerRef.current); setRestSec(0); setRestAlerted(false); }
    return () => clearInterval(timerRef.current);
  }, [restStart, restTarget, restAlerted]);

  const startRest = (exerciseId) => {
    const isCompound = COMPOUND_IDS.includes(exerciseId);
    setRestTarget(isCompound ? REST_DEFAULTS.compound : REST_DEFAULTS.isolation);
    setRestStart(Date.now()); setRestAlerted(false);
  };

  const getPrev = (eid) => { for (const w of [...sLog].reverse()) { const e = w.exercises?.find(x => x.exerciseId === eid); if (e) return { date: w.date, sets: e.sets }; } return null; };

  const mkSets = (eid) => {
    const prev = getPrev(eid);
    const sug = prev ? suggestWeight(eid, prev.sets, [8,12], sLog, recMap[ALL_EX.find(e=>e.id===eid)?.m]||100, ALL_EX) : null;
    const dw = sug?.weight || (prev?.sets?.[0]?.weight || 0);
    return prev ? prev.sets.map(s => ({ weight: dw, reps: s.reps, done: false, type: s.type || "N", rpe: 0 })) :
      [{weight:0,reps:10,done:false,type:"N",rpe:0},{weight:0,reps:10,done:false,type:"N",rpe:0},{weight:0,reps:10,done:false,type:"N",rpe:0}];
  };

  const startWorkout = (fromTmpl) => {
    const exercises = fromTmpl ? fromTmpl.exercises.map(e => {
      const eid = typeof e === "string" ? e : e.exerciseId;
      if (!ALL_EX.some(x => x.id === eid)) return null;
      return { exerciseId: eid, sets: mkSets(eid) };
    }).filter(Boolean) : [];
    setActive({ id: Date.now().toString(), date: new Date().toISOString().slice(0,10), start: Date.now(), exercises });
    setShowTmpl(false); setShowSplits(false);
  };

  const startFromDay = (day) => {
    startWorkout({ exercises: day.exercises.map(eid => ({ exerciseId: eid })) });
    setSub("log");
  };

  // ═══ AI WORKOUT GENERATOR (Kimi/Moonshot API — OpenAI-compatible) ═══
  const getAiKey = () => {
    try { const d = JSON.parse(localStorage.getItem("cardio-v4") || "{}"); return d.aiApiKey || ""; } catch { return ""; }
  };

  const generateAiWorkout = async () => {
    const apiKey = getAiKey();
    if (!apiKey) { alert("Kein AI API-Key hinterlegt. Gehe zu Daten → AI API-Key eingeben."); return; }

    const baseUrl = apiKey.startsWith("ak-") ? "https://api.moonshot.cn/v1" : "https://api.moonshot.ai/v1";

    setAiLoading(true);
    setAiWorkout(null);
    try {
      // Build context
      const recoveryInfo = MG.map(m => `${m.name}: ${recMap[m.id] ?? 100}%`).join(", ");

      const recentWorkouts = sLog.slice(0, 5).map(w => {
        const muscles = [...new Set((w.exercises || []).map(e => ALL_EX.find(x => x.id === e.exerciseId)?.m).filter(Boolean))];
        const mgNames = muscles.map(mid => MG.find(m => m.id === mid)?.name || mid);
        return `${w.date}: ${mgNames.join(", ")} (${w.exercises?.length || 0} Übungen, ${w.duration || "?"}min)`;
      }).join("\n");

      const exList = availableEx.map(e => {
        const mg = MG.find(m => m.id === e.m);
        return `${e.id} | ${e.name} | ${mg?.name || e.m}`;
      }).join("\n");

      const splitInfo = trainingDays.length > 0
        ? trainingDays.map(d => `${d.name}: ${d.exercises.map(eid => ALL_EX.find(e => e.id === eid)?.name || eid).join(", ")}`).join("\n")
        : "Kein fester Split definiert.";

      const prompt = `Du bist ein Krafttraining-Coach. Generiere ein optimales Workout für heute.

RECOVERY-STATUS (100% = voll erholt, 0% = erschöpft):
${recoveryInfo}

LETZTE WORKOUTS:
${recentWorkouts || "Keine bisherigen Workouts."}

MEIN SPLIT-MUSTER:
${splitInfo}

REGELN:
- Wähle Muskeln die gut erholt sind (>60%). Vermeide Muskeln <40%.
- Trainiere NICHT dieselben Muskelgruppen wie im letzten Workout.
- Wähle 5-7 Übungen die zusammenpassen (z.B. Push-Tag, Pull-Tag, Beine-Tag, etc.).
- Nutze NUR exercise IDs aus der folgenden Liste.
- Gib dem Workout einen kurzen deutschen Namen (z.B. "Push Day", "Rücken & Bizeps", "Beine & Core").

VERFÜGBARE ÜBUNGEN:
${exList}

Antworte NUR mit einem JSON-Objekt, kein anderer Text:
{"name": "Workout-Name", "exercises": ["exercise_id_1", "exercise_id_2", ...], "reason": "Kurze Begründung auf Deutsch warum diese Auswahl"}`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          temperature: 0.7,
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API ${response.status} @ ${baseUrl}\nKey: ${apiKey.slice(0,6)}...\n${err.slice(0, 150)}`);
      }

      const resData = await response.json();
      const text = resData.choices?.[0]?.message?.content || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Keine gültige Antwort");

      const result = JSON.parse(jsonMatch[0]);
      const validExercises = (result.exercises || []).filter(eid => ALL_EX.some(e => e.id === eid));

      if (!validExercises.length) throw new Error("Keine gültigen Übungen generiert");

      setAiWorkout({
        name: result.name || "AI Workout",
        exercises: validExercises,
        reason: result.reason || "",
      });
    } catch (err) {
      alert("AI Workout fehlgeschlagen: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const startAiWorkout = () => {
    if (!aiWorkout) return;
    startWorkout({ exercises: aiWorkout.exercises.map(eid => ({ exerciseId: eid })) });
    setAiWorkout(null);
    setSub("log");
  };

  // ═══ AI COACH — POST-WORKOUT ANALYSIS ═══
  const generateAiCoach = async (completedWorkout, summaryInfo) => {
    const apiKey = getAiKey();
    if (!apiKey) return; // silently skip if no key

    const baseUrl = apiKey.startsWith("ak-") ? "https://api.moonshot.cn/v1" : "https://api.moonshot.ai/v1";

    setAiCoachLoading(true);
    setAiCoach(null);
    setAiCoachExpanded(false);
    try {
      // Build per-exercise analysis data
      const exerciseAnalysis = completedWorkout.exercises.map(ex => {
        const def = ALL_EX.find(e => e.id === ex.exerciseId);
        const name = def?.name || ex.exerciseId;
        const mg = def ? (MG.find(m => m.id === def.m)?.name || def.m) : "?";
        const workSets = ex.sets.filter(s => s.type !== "W");
        const setsStr = workSets.map(s => `${s.weight}kg×${s.reps}${s.rpe ? ` RPE${s.rpe}` : ""}${s.type !== "N" ? ` [${s.type}]` : ""}`).join(", ");

        // History: last 6 sessions for this exercise
        const history = sLog
          .filter(w => w.exercises?.some(e => e.exerciseId === ex.exerciseId))
          .slice(0, 6)
          .map(w => {
            const prev = w.exercises.find(e => e.exerciseId === ex.exerciseId);
            const pSets = (prev?.sets || []).filter(s => s.type !== "W");
            const maxW = Math.max(0, ...pSets.map(s => s.weight || 0));
            const best1rm = Math.max(0, ...pSets.map(s => est1RM(s.weight, s.reps)));
            const vol = pSets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
            return `${w.date}: max ${maxW}kg, est1RM ${best1rm}kg, vol ${Math.round(vol)}kg`;
          }).join(" | ");

        return `• ${name} (${mg}): ${setsStr}\n  Historie: ${history || "Keine vorherigen Daten"}`;
      }).join("\n");

      const prompt = `Du bist ein erfahrener Krafttraining-Coach. Analysiere dieses gerade abgeschlossene Workout und gib konkrete, personalisierte Tipps.

HEUTIGES WORKOUT (${summaryInfo.date}):
Dauer: ${summaryInfo.duration} Min | Sätze: ${summaryInfo.totalSets} | Volumen: ${Math.round(summaryInfo.totalVol/1000*10)/10}t
${summaryInfo.prs.length ? `Neue PRs: ${summaryInfo.prs.map(p => `${p.name}: ${p.value}`).join(", ")}` : "Keine neuen PRs."}

ÜBUNGEN MIT HISTORIE:
${exerciseAnalysis}

ANALYSE-AUFTRAG:
1. Erkenne Stagnation: Wenn Gewicht/1RM bei einer Übung seit 3+ Sessions nicht gestiegen ist, schlage konkrete Techniken vor (Pause Reps, Cluster Sets, Griffvariation, Tempo-Änderung, etc.)
2. RPE-Feedback: Wenn RPE durchgehend >8.5, empfehle ggf. leichtere Gewichte mit mehr Wiederholungen. Wenn RPE sehr niedrig (<6), empfehle Gewichtssteigerung.
3. Volumen-Check: Bewerte ob das Volumen pro Muskelgruppe angemessen ist.
4. Konkrete Progression: Sage genau, welches Gewicht nächstes Mal versucht werden sollte (basierend auf den Inkrementen).
5. Technik-Tipps: 1-2 spezifische Cues für die Hauptübungen.

FORMAT — Antworte NUR mit JSON, kein anderer Text:
{
  "headline": "Kurze Bewertung in 3-5 Worten (z.B. 'Solides Push-Training!' oder 'Stagnation bei Bench!')",
  "tips": [
    {"exercise": "Übungsname", "type": "stagnation|progression|technik|volumen|rpe", "tip": "Konkreter Tipp auf Deutsch, max 2 Sätze."}
  ],
  "overall": "1-2 Sätze Gesamtbewertung mit dem wichtigsten Takeaway für nächstes Mal."
}

Maximal 5 Tips. Nur relevante Tipps, kein Füllmaterial. Sei direkt und spezifisch.`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          temperature: 0.5,
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const resData = await response.json();
      const text = resData.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");

      const result = JSON.parse(jsonMatch[0]);
      setAiCoach(result);
      setAiCoachExpanded(true);
    } catch (err) {
      console.error("AI Coach error:", err);
      // silently fail — the summary still shows without AI tips
    } finally {
      setAiCoachLoading(false);
    }
  };

  // ═══ AI EXERCISE SWAP ═══
  const generateAiSwap = async (exerciseIndex) => {
    const apiKey = getAiKey();
    if (!apiKey) { alert("Kein AI API-Key hinterlegt. Gehe zu Daten → AI API-Key eingeben."); return; }
    if (!active) return;

    const baseUrl = apiKey.startsWith("ak-") ? "https://api.moonshot.cn/v1" : "https://api.moonshot.ai/v1";
    const ex = active.exercises[exerciseIndex];
    const def = ALL_EX.find(e => e.id === ex.exerciseId);
    if (!def) return;

    setAiSwap({ exerciseIndex, loading: true, suggestions: null });
    try {
      const mgName = MG.find(m => m.id === def.m)?.name || def.m;
      const secMuscles = (def.s || []).map(sid => MG.find(m => m.id === sid)?.name || sid).join(", ");
      const currentExIds = active.exercises.map(e => e.exerciseId);

      const availAlts = availableEx
        .filter(e => e.m === def.m && e.id !== def.id && !currentExIds.includes(e.id))
        .map(e => `${e.id} | ${e.name} | Eq: ${e.eq.join(",")}`).join("\n");

      const prompt = `Du bist ein Krafttraining-Coach. Der Athlet braucht eine Alternative für eine Übung (Gerät besetzt/Variation gewünscht).

AKTUELLE ÜBUNG: ${def.name}
- Hauptmuskel: ${mgName}
- Sekundär: ${secMuscles || "keine"}
- Equipment: ${def.eq.join(", ")}

VERFÜGBARE ALTERNATIVEN (gleiche Muskelgruppe, verfügbares Equipment):
${availAlts || "Keine direkte Alternative im gleichen Muskel."}

AKTUELLES WORKOUT (diese Übungen sind bereits drin, NICHT nochmal vorschlagen):
${currentExIds.map(id => ALL_EX.find(e => e.id === id)?.name || id).join(", ")}

Schlage 2-3 Alternativen vor. Priorisiere:
1. Gleiche Bewegungsebene und Muskelaktivierung
2. Ähnliche Sekundärmuskeln
3. Verfügbares Equipment des Athleten

Antworte NUR mit JSON:
{
  "alternatives": [
    {"id": "exercise_id", "reason": "Kurze Begründung auf Deutsch, max 1 Satz"}
  ]
}`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "moonshot-v1-8k", temperature: 0.4, max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);
      const resData = await response.json();
      const text = resData.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");

      const result = JSON.parse(jsonMatch[0]);
      const valid = (result.alternatives || []).filter(a => ALL_EX.some(e => e.id === a.id));
      if (!valid.length) throw new Error("Keine gültigen Alternativen");

      setAiSwap({ exerciseIndex, loading: false, suggestions: valid });
    } catch (err) {
      alert("AI Swap fehlgeschlagen: " + err.message);
      setAiSwap(null);
    }
  };

  const applySwap = (exerciseIndex, newExId) => {
    if (!active) return;
    setActive(p => ({
      ...p,
      exercises: p.exercises.map((e, i) => i !== exerciseIndex ? e : { exerciseId: newExId, sets: mkSets(newExId) })
    }));
    setAiSwap(null);
  };

  // ═══ AI WEAKNESS ANALYSIS ═══
  const generateWeaknessAnalysis = async () => {
    const apiKey = getAiKey();
    if (!apiKey) { alert("Kein AI API-Key hinterlegt. Gehe zu Daten → AI API-Key eingeben."); return; }

    const baseUrl = apiKey.startsWith("ak-") ? "https://api.moonshot.cn/v1" : "https://api.moonshot.ai/v1";

    setAiWeaknessLoading(true);
    setAiWeakness(null);
    try {
      // Aggregate volume per muscle over last 4 weeks
      const fourWeeksAgo = new Date(); fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const recentLogs = sLog.filter(w => w.date >= fourWeeksAgo.toISOString().slice(0, 10));

      const muscleVol = {};
      const muscleSets = {};
      const muscleFreq = {}; // unique workout days per muscle
      MG.forEach(m => { muscleVol[m.id] = 0; muscleSets[m.id] = 0; muscleFreq[m.id] = new Set(); });

      recentLogs.forEach(w => {
        (w.exercises || []).forEach(ex => {
          const def = ALL_EX.find(e => e.id === ex.exerciseId);
          if (!def) return;
          const workSets = (ex.sets || []).filter(s => s.type !== "W");
          const vol = workSets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
          const sets = workSets.length;
          // Primary
          muscleVol[def.m] = (muscleVol[def.m] || 0) + vol;
          muscleSets[def.m] = (muscleSets[def.m] || 0) + sets;
          muscleFreq[def.m]?.add(w.date);
          // Secondary (half credit)
          (def.s || []).forEach(sm => {
            muscleVol[sm] = (muscleVol[sm] || 0) + vol * 0.3;
            muscleSets[sm] = (muscleSets[sm] || 0) + sets * 0.5;
            muscleFreq[sm]?.add(w.date);
          });
        });
      });

      const muscleStats = MG.map(m => `${m.name}: ${Math.round(muscleVol[m.id]/1000*10)/10}t Volumen, ${Math.round(muscleSets[m.id])} Sätze, ${muscleFreq[m.id]?.size || 0}x trainiert`).join("\n");

      const splitInfo = trainingDays.length > 0
        ? trainingDays.map(d => `${d.name}: ${d.exercises.map(eid => ALL_EX.find(e => e.id === eid)?.name || eid).join(", ")}`).join("\n")
        : "Kein fester Split.";

      const prompt = `Du bist ein erfahrener Krafttraining-Coach. Analysiere das Trainingsvolumen der letzten 4 Wochen und identifiziere Schwachstellen.

VOLUMEN PRO MUSKELGRUPPE (letzte 4 Wochen):
${muscleStats}

SPLIT-MUSTER:
${splitInfo}

ANZAHL WORKOUTS (4 Wochen): ${recentLogs.length}

ANALYSE-AUFTRAG:
1. Identifiziere 2-4 untertrainierte Muskelgruppen (zu wenig Volumen/Frequenz im Verhältnis)
2. Identifiziere ggf. übertrainierte Muskelgruppen
3. Bewerte die Balance (z.B. Push vs Pull, Vorder- vs Rückseite, Ober- vs Unterkörper)
4. Gib konkrete Empfehlungen: welche Übungen hinzufügen, Sätze pro Woche anpassen, Split-Änderungen

Antworte NUR mit JSON:
{
  "headline": "Kurze Zusammenfassung (3-6 Worte, z.B. 'Rücken und Beine vernachlässigt')",
  "weaknesses": [
    {"muscle": "Muskelgruppe", "severity": "low|medium|high", "issue": "Was genau fehlt", "fix": "Konkrete Empfehlung mit Übungen und Sätzen"}
  ],
  "imbalances": [
    {"pair": "z.B. Push vs Pull", "ratio": "z.B. 2:1", "recommendation": "Empfehlung"}
  ],
  "overall": "2-3 Sätze Gesamtbewertung mit den wichtigsten Änderungen."
}

Maximal 4 Schwachstellen, 2 Imbalances. Sei konkret und spezifisch.`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "moonshot-v1-8k", temperature: 0.4, max_tokens: 1200, messages: [{ role: "user", content: prompt }] }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);
      const resData = await response.json();
      const text = resData.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");

      setAiWeakness(JSON.parse(jsonMatch[0]));
    } catch (err) {
      alert("Schwachstellen-Analyse fehlgeschlagen: " + err.message);
    } finally {
      setAiWeaknessLoading(false);
    }
  };

  // ═══ AI COACH CHAT ═══
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const buildCoachSystemPrompt = () => {
    // Recovery status
    const recoveryInfo = MG.map(m => `${m.name}: ${recMap[m.id] ?? 100}%`).join(", ");

    // Last 8 workouts summary
    const recentWorkouts = sLog.slice(0, 8).map(w => {
      const exs = (w.exercises || []).map(ex => {
        const def = ALL_EX.find(e => e.id === ex.exerciseId);
        const workSets = (ex.sets || []).filter(s => s.type !== "W");
        const maxW = Math.max(0, ...workSets.map(s => s.weight || 0));
        const best1rm = Math.max(0, ...workSets.map(s => est1RM(s.weight, s.reps)));
        const vol = workSets.reduce((a, s) => a + (s.weight || 0) * (s.reps || 0), 0);
        const setsStr = workSets.map(s => `${s.weight}×${s.reps}${s.rpe ? ` @RPE${s.rpe}` : ""}`).join(", ");
        return `  • ${def?.name || ex.exerciseId}: ${setsStr} | Max: ${maxW}kg, est1RM: ${best1rm}kg, Vol: ${Math.round(vol)}kg`;
      }).join("\n");
      const muscles = [...new Set((w.exercises || []).map(e => ALL_EX.find(x => x.id === e.exerciseId)?.m).filter(Boolean))];
      const mgNames = muscles.map(mid => MG.find(m => m.id === mid)?.name || mid);
      return `📅 ${w.date} (${w.duration || "?"}min) — ${mgNames.join(", ")}:\n${exs}`;
    }).join("\n\n");

    // Split/Training days
    const splitInfo = trainingDays.length > 0
      ? trainingDays.map(d => `${d.name}: ${d.exercises.map(eid => ALL_EX.find(e => e.id === eid)?.name || eid).join(", ")}`).join("\n")
      : "Kein fester Split definiert.";

    // Weekly volume per muscle
    const weekVolInfo = MG.filter(m => weekVol[m.id] > 0).map(m => `${m.name}: ${Math.round(weekVol[m.id] / 1000 * 10) / 10}t`).join(", ");

    // PR data — best 1RM per exercise across all history
    const prData = {};
    sLog.forEach(w => (w.exercises || []).forEach(ex => {
      const best = Math.max(0, ...(ex.sets || []).filter(s => s.type !== "W").map(s => est1RM(s.weight, s.reps)));
      if (best > (prData[ex.exerciseId] || 0)) prData[ex.exerciseId] = best;
    }));
    const topPRs = Object.entries(prData)
      .map(([id, val]) => ({ name: ALL_EX.find(e => e.id === id)?.name || id, val }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 15)
      .map(p => `${p.name}: ${p.val}kg`).join(", ");

    // Stagnation detection per exercise (last 4 sessions)
    const stagnationInfo = [];
    const exerciseIds = [...new Set(sLog.slice(0, 20).flatMap(w => (w.exercises || []).map(e => e.exerciseId)))];
    exerciseIds.forEach(eid => {
      const sessions = sLog
        .filter(w => w.exercises?.some(e => e.exerciseId === eid))
        .slice(0, 4)
        .map(w => {
          const ex = w.exercises.find(e => e.exerciseId === eid);
          return Math.max(0, ...(ex?.sets || []).filter(s => s.type !== "W").map(s => est1RM(s.weight, s.reps)));
        });
      if (sessions.length >= 3) {
        const allSame = sessions.every(v => Math.abs(v - sessions[0]) < 1);
        const declining = sessions.length >= 3 && sessions[0] < sessions[sessions.length - 1];
        if (allSame) stagnationInfo.push(`${ALL_EX.find(e => e.id === eid)?.name || eid}: Stagnation (${sessions[0]}kg 1RM seit ${sessions.length} Sessions)`);
        if (declining) stagnationInfo.push(`${ALL_EX.find(e => e.id === eid)?.name || eid}: Rückgang (${sessions[sessions.length-1]}→${sessions[0]}kg)`);
      }
    });

    // Gamification
    const totalWorkouts = sLog.length;
    const totalVolumeAll = sLog.reduce((a, w) => a + (w.exercises || []).reduce((b, ex) => b + (ex.sets || []).filter(s => s.type !== "W").reduce((c, s) => c + (s.weight || 0) * (s.reps || 0), 0), 0), 0);

    // Deload signals
    const deloadInfo = deloadAdvice ? `Deload-Warnung aktiv: Severity ${deloadAdvice.severity}, Gründe: ${deloadAdvice.reasons?.join(", ")}` : "Kein Deload nötig.";

    // Available exercises summary
    const eqNames = userEquipment.map(id => EQUIPMENT.find(e => e.id === id)?.name || id).join(", ");

    return `Du bist ein erfahrener, deutschsprachiger Krafttraining-Coach namens "Coach". Du sprichst den Athleten direkt und motivierend an — wie ein kompetenter Trainingspartner, nicht wie ein Roboter.

DEINE PERSÖNLICHKEIT:
- Direkt, ehrlich, kompetent — kein Geschwafel
- Motivierend aber realistisch
- Du duzt den Athleten
- Antworte auf Deutsch, nutze Fachbegriffe wo angebracht
- Halte Antworten prägnant (max 150 Wörter), außer der Athlet fragt explizit nach Details
- Nutze gelegentlich Emojis für Übersichtlichkeit (💪🔥📈⚠️), aber nicht übertreiben

ATHLETEN-PROFIL:
- Name: Maximilian, 22 Jahre
- Trainiert 5-6x pro Woche (Kraft + gelegentlich Cardio)
- Gesamt-Workouts im Log: ${totalWorkouts}
- Gesamtvolumen: ${Math.round(totalVolumeAll / 1000)}t (Tonnen)
- Equipment: ${eqNames}

AKTUELLER RECOVERY-STATUS (100% = voll erholt):
${recoveryInfo}

VOLUMEN LETZTE 7 TAGE:
${weekVolInfo || "Keine Daten."}

AKTUELLE BEST-PRs (est. 1RM):
${topPRs || "Keine Daten."}

${stagnationInfo.length ? `⚠️ STAGNATION/RÜCKGANG ERKANNT:\n${stagnationInfo.join("\n")}` : "Keine Stagnation erkannt."}

${deloadInfo}

SPLIT-MUSTER:
${splitInfo}

LETZTE WORKOUTS (neueste zuerst):
${recentWorkouts || "Keine bisherigen Workouts."}

REGELN FÜR DEINE ANTWORTEN:
1. Nutze IMMER die echten Daten oben. Erfinde keine Zahlen.
2. Wenn du eine Übung empfiehlst, nutze Übungen aus dem System des Athleten.
3. Bei Fragen zu Stagnation: Analysiere die 1RM-Trends in den Daten und schlage spezifische Techniken vor (Pause Reps, Drop Sets, Cluster Sets, Tempo-Variationen, Griffwechsel etc.)
4. Bei Fragen zu Recovery: Schau auf die Recovery-% und empfehle entsprechend.
5. Bei Fragen zu Volumen/Split: Nutze die Wochenvolumen-Daten und Split-Info.
6. Bei Ernährungsfragen: Gib allgemeine, evidenzbasierte Empfehlungen. Du bist kein Ernährungsberater — sage das bei medizinischen Fragen.
7. Wenn der Athlet fragt was er heute trainieren soll: Analysiere Recovery + letzte Workouts + Split-Muster und schlage einen konkreten Plan vor.
8. Bei Plateau-Fragen: Sei spezifisch — nenne die Übung, den aktuellen 1RM, wie lange es stagniert, und 2-3 konkrete Interventionen.
9. Du kannst auch mal humorvoll sein oder den Athleten challengen ("Die Beine kommen zu kurz — keine Ausreden 🦵").`;
  };

  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const apiKey = getAiKey();
    if (!apiKey) { alert("Kein AI API-Key hinterlegt. Gehe zu Daten → AI API-Key eingeben."); return; }
    const baseUrl = apiKey.startsWith("ak-") ? "https://api.moonshot.cn/v1" : "https://api.moonshot.ai/v1";

    const newMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      // Build API messages: system + last 10 messages for context window
      const systemPrompt = buildCoachSystemPrompt();
      const contextMessages = newMessages.slice(-10);
      const apiMessages = [
        { role: "system", content: systemPrompt },
        ...contextMessages,
      ];

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          temperature: 0.6,
          max_tokens: 800,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API ${response.status}: ${err.slice(0, 100)}`);
      }

      const resData = await response.json();
      const reply = resData.choices?.[0]?.message?.content || "Keine Antwort erhalten.";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: `⚠️ Fehler: ${err.message}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  };

  const addEx = (eid) => {
    if (!active) return;
    setActive(p => ({ ...p, exercises: [...p.exercises, { exerciseId: eid, sets: mkSets(eid) }] }));
    setPicker(false); setSearchQ("");
  };

  const upSet = (ei, si, k, v) => setActive(p => ({
    ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : {
      ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, [k]: k === "done" ? !s.done : k === "type" ? v : v })
    })
  }));
  const addSet = (ei) => setActive(p => { const ls = p.exercises[ei].sets.slice(-1)[0] || {weight:0,reps:10,type:"N",rpe:0}; return {...p,exercises:p.exercises.map((e,i)=>i!==ei?e:{...e,sets:[...e.sets,{weight:ls.weight,reps:ls.reps,done:false,type:"N",rpe:0}]})}; });
  const rmSet = (ei, si) => setActive(p => ({...p,exercises:p.exercises.map((e,i)=>i!==ei?e:{...e,sets:e.sets.filter((_,j)=>j!==si)})}));
  const rmEx = (ei) => setActive(p => ({...p,exercises:p.exercises.filter((_,i)=>i!==ei)}));

  const applyWarmup = (ei) => {
    setActive(p => {
      const ex = p.exercises[ei];
      if (!ex) return p;
      // Find first non-warmup set as target weight
      const firstWork = ex.sets.find(s => s.type !== "W");
      if (!firstWork || firstWork.weight <= 0) return p;
      const warmups = generateWarmupSets(ex.exerciseId, firstWork.weight);
      if (!warmups.length) return p;
      // Remove existing warmup sets, then prepend new ones
      const workSets = ex.sets.filter(s => s.type !== "W");
      return { ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : { ...e, sets: [...warmups, ...workSets] }) };
    });
  };

  const removeWarmup = (ei) => {
    setActive(p => {
      const ex = p.exercises[ei];
      if (!ex) return p;
      return { ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.filter(s => s.type !== "W") }) };
    });
  };

  // ═══ FINISH WITH SUMMARY ═══
  const finish = () => {
    if (!active?.exercises?.length) { setActive(null); return; }
    const duration = Math.round((Date.now() - active.start) / 60000);
    const cleaned = {
      ...active, duration,
      exercises: active.exercises.map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter(s => s.done).map(s => ({ weight: +s.weight||0, reps: +s.reps||0, type: s.type || "N", rpe: +s.rpe || 0 })),
        ...(e.sessionNote?.trim() ? { sessionNote: e.sessionNote.trim() } : {}),
      })).filter(e => e.sets.length > 0),
    };
    if (!cleaned.exercises.length) { setActive(null); return; }

    // Calculate summary stats
    let totalVol = 0, totalSets = 0, totalReps = 0, prs = [], muscles = new Set();
    cleaned.exercises.forEach(ex => {
      const def = ALL_EX.find(e => e.id === ex.exerciseId);
      if (def) { muscles.add(def.m); def.s?.forEach(m => muscles.add(m)); }
      const workSets = ex.sets.filter(s => s.type !== "W");
      workSets.forEach(s => { totalVol += s.weight * s.reps; totalSets++; totalReps += s.reps; });
      // Check PRs: best estimated 1RM
      const best1rm = Math.max(...ex.sets.map(s => est1RM(s.weight, s.reps)));
      const prevBest = sLog.flatMap(w => (w.exercises||[]).filter(e => e.exerciseId === ex.exerciseId).flatMap(e => e.sets.map(s => est1RM(s.weight, s.reps))));
      const prevMax = prevBest.length ? Math.max(...prevBest) : 0;
      if (best1rm > prevMax && prevMax > 0) prs.push({ name: def?.name || ex.exerciseId, value: `${best1rm} kg (Est. 1RM)` });
    });

    const summaryData = { duration, totalVol: Math.round(totalVol), totalSets, totalReps, exercises: cleaned.exercises.length, muscles: muscles.size, prs, date: cleaned.date };

    save([...sLog, cleaned].sort((a, b) => b.date.localeCompare(a.date)), undefined, undefined);
    setActive(null); setRestStart(null);
    setSummary(summaryData);
    // Fire AI Coach analysis in background
    generateAiCoach(cleaned, summaryData);
  };

  const saveTmpl = () => { if (!active || !tmplName.trim()) return; save(undefined, [...templates, { id: Date.now().toString(), name: tmplName.trim(), exercises: active.exercises.map(e => ({ exerciseId: e.exerciseId, sets: e.sets.map(s => ({weight:+s.weight||0,reps:+s.reps||0,type:s.type||"N"})) })) }], undefined); setTmplName(""); };
  const delTmpl = (id) => save(undefined, templates.filter(t => t.id !== id), undefined);
  const applySplit = (key) => { const p = SPLIT_PRESETS[key]; if (!p) return; save(undefined, undefined, p.days.map(d => ({id:Date.now().toString()+Math.random(),name:d.name,exercises:[...d.exercises]}))); setShowSplits(false); };
  const addDay = () => save(undefined, undefined, [...trainingDays, {id:Date.now().toString(),name:"Neuer Tag",exercises:[]}]);
  const updateDayName = (id, name) => save(undefined, undefined, trainingDays.map(d => d.id===id?{...d,name}:d));
  const removeDay = (id) => save(undefined, undefined, trainingDays.filter(d => d.id!==id));
  const addExToDay = (dayId, exId) => save(undefined, undefined, trainingDays.map(d => d.id===dayId?{...d,exercises:[...d.exercises,exId]}:d));
  const removeExFromDay = (dayId, exIdx) => save(undefined, undefined, trainingDays.map(d => d.id===dayId?{...d,exercises:d.exercises.filter((_,i)=>i!==exIdx)}:d));

  const weekVol = useMemo(() => {
    const cut = new Date(); cut.setDate(cut.getDate()-7); const cd = cut.toISOString().slice(0,10);
    const vol = {}; MG.forEach(m => { vol[m.id] = 0; });
    sLog.filter(w => w.date >= cd).forEach(w => (w.exercises||[]).forEach(ex => {
      const d = ALL_EX.find(e => e.id === ex.exerciseId); if (!d) return;
      const v = ex.sets.filter(s => s.type !== "W").reduce((s, set) => s + (set.weight * set.reps), 0);
      vol[d.m] = (vol[d.m]||0) + v;
      d.s?.forEach(m => { vol[m] = (vol[m]||0) + v * 0.4; });
    }));
    return vol;
  }, [sLog]);

  const recMap = useMemo(() => { const r = {}; MG.forEach(m => { r[m.id] = muscleRec(m.id, sLog, ALL_EX); }); return r; }, [sLog, ALL_EX]);

  // ═══ DELOAD / PERIODIZATION DETECTION ═══
  const deloadAdvice = useMemo(() => {
    if (sLog.length < 8) return null; // need enough data

    // Group workouts by week (ISO week start = Monday)
    const getWeekKey = (dateStr) => {
      const d = new Date(dateStr);
      const day = d.getDay(); // 0=Sun
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((day + 6) % 7)); // shift to Monday
      return mon.toISOString().slice(0, 10);
    };

    const weekMap = {};
    sLog.forEach(w => {
      const wk = getWeekKey(w.date);
      if (!weekMap[wk]) weekMap[wk] = { vol: 0, sessions: 0, rpes: [], best1rms: {} };
      weekMap[wk].sessions++;
      (w.exercises || []).forEach(ex => {
        const work = ex.sets.filter(s => s.type !== "W");
        work.forEach(s => {
          weekMap[wk].vol += (+s.weight || 0) * (+s.reps || 0);
          if (+s.rpe > 0) weekMap[wk].rpes.push(+s.rpe);
          const rm = est1RM(+s.weight || 0, +s.reps || 0);
          if (rm > (weekMap[wk].best1rms[ex.exerciseId] || 0)) weekMap[wk].best1rms[ex.exerciseId] = rm;
        });
      });
    });

    // Sort weeks chronologically, take last 6
    const weeks = Object.entries(weekMap).sort((a, b) => a[0].localeCompare(b[0]));
    if (weeks.length < 4) return null;
    const recent = weeks.slice(-6);

    // Signal 1: Volume consistently rising for 4+ weeks
    let risingWeeks = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i][1].vol > recent[i - 1][1].vol * 0.95) risingWeeks++;
    }
    const volumeRising = risingWeeks >= 3;

    // Signal 2: Average RPE trending high (>8) in last 2 weeks
    const recentRpes = recent.slice(-2).flatMap(([, d]) => d.rpes);
    const avgRpe = recentRpes.length ? recentRpes.reduce((a, b) => a + b, 0) / recentRpes.length : 0;
    const rpeHigh = avgRpe >= 8;

    // Signal 3: 1RM stagnation — find main compounds and check if best 1RM hasn't improved
    const compoundIds = ["bench_bb", "squat_bb", "deadlift", "ohp_bb", "row_bb"];
    let stagnatedLifts = 0;
    let checkedLifts = 0;
    compoundIds.forEach(eid => {
      const hist = getExerciseHistory(eid, sLog);
      if (hist.length < 4) return;
      checkedLifts++;
      const last3 = hist.slice(-3).map(h => h.best1rm);
      const older = hist.slice(-6, -3).map(h => h.best1rm);
      if (!older.length) return;
      const recentMax = Math.max(...last3);
      const olderMax = Math.max(...older);
      if (recentMax <= olderMax * 1.01) stagnatedLifts++; // less than 1% improvement = stagnation
    });
    const liftsStagnating = checkedLifts > 0 && stagnatedLifts >= Math.ceil(checkedLifts * 0.5);

    // Signal 4: Consecutive weeks without a rest week (>4 weeks of 3+ sessions)
    const consecutiveHeavy = recent.filter(([, d]) => d.sessions >= 3).length;
    const longStreak = consecutiveHeavy >= 4;

    // Decision: need at least 2 signals
    const signals = [volumeRising, rpeHigh, liftsStagnating, longStreak].filter(Boolean);
    if (signals.length < 2) return null;

    // Build reasons
    const reasons = [];
    if (volumeRising) reasons.push(`Volumen steigt seit ${risingWeeks + 1} Wochen`);
    if (rpeHigh) reasons.push(`Ø RPE der letzten 2 Wochen: ${avgRpe.toFixed(1)}`);
    if (liftsStagnating) reasons.push(`${stagnatedLifts} Grundübung${stagnatedLifts > 1 ? "en" : ""} stagniert`);
    if (longStreak) reasons.push(`${consecutiveHeavy} Wochen ohne Entlastung`);

    // Calculate deload volume suggestion
    const lastWeekVol = recent[recent.length - 1]?.[1]?.vol || 0;
    const deloadVol = Math.round(lastWeekVol * 0.6);

    return {
      signals: signals.length,
      reasons,
      lastWeekVol: Math.round(lastWeekVol),
      deloadVol,
      severity: signals.length >= 3 ? "high" : "medium",
    };
  }, [sLog]);

  // ═══ TRAINING STREAKS & GAMIFICATION ═══
  const gamification = useMemo(() => {
    if (!sLog.length) return { weekStreak: 0, totalWorkouts: 0, xp: 0, level: 1, levelName: "Anfänger", nextLevelXp: 100, badges: [] };

    const getWeekKey = (dateStr) => {
      const d = new Date(dateStr);
      const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return mon.toISOString().slice(0, 10);
    };
    const weekSet = new Set(sLog.map(w => getWeekKey(w.date)));
    let weekStreak = 0;
    const now = new Date();
    for (let i = 0; i < 52; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i * 7);
      if (weekSet.has(getWeekKey(d.toISOString().slice(0, 10)))) weekStreak++;
      else break;
    }

    const totalWorkouts = sLog.length;
    let xp = 0;
    sLog.forEach(w => {
      xp += 50;
      xp += (w.exercises || []).length * 10;
      const vol = (w.exercises || []).reduce((a, ex) => a + ex.sets.filter(s => s.type !== "W").reduce((b, s) => b + (+s.weight||0) * (+s.reps||0), 0), 0);
      xp += Math.floor(vol / 100);
    });
    xp += weekStreak * 30;

    const LEVELS = [
      { xp: 0, name: "Anfänger" }, { xp: 100, name: "Einsteiger" }, { xp: 300, name: "Regular" },
      { xp: 600, name: "Dedicated" }, { xp: 1000, name: "Athlete" }, { xp: 1500, name: "Advanced" },
      { xp: 2500, name: "Elite" }, { xp: 4000, name: "Champion" }, { xp: 6000, name: "Legend" },
      { xp: 10000, name: "Titan" }, { xp: 15000, name: "Mythic" },
    ];
    let level = 1, levelName = "Anfänger", nextLevelXp = 100;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].xp) { level = i + 1; levelName = LEVELS[i].name; nextLevelXp = LEVELS[i + 1]?.xp || LEVELS[i].xp * 2; break; }
    }

    const badges = [];
    if (totalWorkouts >= 1) badges.push({ icon: "🏋️", label: "Erster Schritt" });
    if (totalWorkouts >= 10) badges.push({ icon: "💪", label: "Zweistellig" });
    if (totalWorkouts >= 25) badges.push({ icon: "⚡", label: "Quarter" });
    if (totalWorkouts >= 50) badges.push({ icon: "🔥", label: "Halbhundert" });
    if (totalWorkouts >= 100) badges.push({ icon: "👑", label: "Centurion" });
    if (weekStreak >= 4) badges.push({ icon: "📅", label: `${weekStreak}W Streak` });
    if (weekStreak >= 12) badges.push({ icon: "🏆", label: "12W Streak" });
    const totalVol = sLog.reduce((a, w) => a + (w.exercises || []).reduce((b, ex) => b + ex.sets.filter(s => s.type !== "W").reduce((c, s) => c + (+s.weight||0) * (+s.reps||0), 0), 0), 0);
    if (totalVol >= 100000) badges.push({ icon: "🏗️", label: "100t Club" });
    if (totalVol >= 500000) badges.push({ icon: "🌋", label: "500t Club" });

    return { weekStreak, totalWorkouts, xp, level, levelName, nextLevelXp, badges, totalVol };
  }, [sLog]);

  // ═══ REST-DAY RECOMMENDATION ═══
  const restDayAdvice = useMemo(() => {
    if (!sLog.length) return null;

    const fatigued = MG.filter(m => (recMap[m.id] || 100) < 50).map(m => ({ ...m, rec: recMap[m.id] || 0 }));
    const ready = MG.filter(m => (recMap[m.id] || 100) >= 75).map(m => ({ ...m, rec: recMap[m.id] || 0 }));

    const lastDate = sLog[0]?.date;
    if (!lastDate) return null;
    const daysSinceLast = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));

    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
    const thisWeekSessions = sLog.filter(w => w.date >= weekStart.toISOString().slice(0, 10)).length;

    if (daysSinceLast === 0 && thisWeekSessions >= 5) {
      return { type: "rest", message: "Ruhetag empfohlen — 5+ Sessions diese Woche.", detail: "Regeneration ist genauso wichtig wie Training." };
    }
    if (fatigued.length >= 6) {
      return { type: "rest", message: "Ruhetag empfohlen — viele Muskeln erschöpft.", detail: fatigued.slice(0, 4).map(m => m.name).join(", ") + " brauchen Erholung." };
    }
    if (fatigued.length > 0 && ready.length > 0) {
      const suggestGroups = ready.slice(0, 3).map(m => m.name).join(", ");
      return { type: "train", message: `Heute empfohlen: ${suggestGroups}`, detail: fatigued.map(m => m.name).join(", ") + (fatigued.length > 1 ? " brauchen" : " braucht") + " noch Erholung." };
    }
    if (daysSinceLast >= 3) {
      return { type: "train", message: "Zeit für ein Workout!", detail: `Letztes Training vor ${daysSinceLast} Tagen. Alle Muskeln sind erholt.` };
    }
    return null;
  }, [sLog, recMap]);

  // Filtered exercises for picker
  const filteredEx = useMemo(() => {
    let list = availableEx;
    if (exFilter !== "all") list = list.filter(e => e.m === exFilter);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || MG.find(m=>m.id===e.m)?.name.toLowerCase().includes(q));
    }
    return list;
  }, [exFilter, searchQ, availableEx]);

  const inp = {width:"100%",padding:"11px 14px",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:14,fontFamily:"'Manrope',sans-serif",outline:"none",boxSizing:"border-box",textAlign:"center"};
  const sty = {card:{background:C.surface,borderRadius:16,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:14,backdropFilter:"blur(20px)"},lbl:{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:3.5,textTransform:"uppercase",marginBottom:14,paddingLeft:4,fontFamily:"'Manrope',sans-serif"}};
  const fmtT = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{background:"transparent",minHeight:"100vh",color:C.text,fontFamily:"'Manrope',sans-serif"}}>
      <div style={{position:"sticky",top:0,zIndex:50,borderBottom:`1px solid ${C.border}`,background:"rgba(10,10,15,0.8)",backdropFilter:"blur(30px)",WebkitBackdropFilter:"blur(30px)"}}>
        <div style={{padding:"20px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            {onBack && <button onClick={onBack} style={{fontSize:11,color:C.ember,background:"none",border:"none",cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontWeight:600,padding:0,marginBottom:4,letterSpacing:3,textTransform:"uppercase"}}>&larr; ZURÜCK</button>}
            <div style={{fontSize:32,fontWeight:300,letterSpacing:8,fontFamily:"'Cormorant Garamond',serif",textTransform:"uppercase",lineHeight:1}}>KRAFT</div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:4}}>
            <button onClick={()=>setShowDataPanel(true)} style={{padding:"8px 12px",borderRadius:24,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"'Manrope',sans-serif",letterSpacing:2,textTransform:"uppercase",backdropFilter:"blur(10px)"}}>Daten</button>
            <button onClick={()=>setShowEqSettings(true)} style={{padding:"8px 12px",borderRadius:24,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,color:C.muted,fontSize:10,fontWeight:500,cursor:"pointer",fontFamily:"'Manrope',sans-serif",letterSpacing:2,textTransform:"uppercase",backdropFilter:"blur(10px)"}}>Equipment</button>
          </div>
        </div>
      </div>

      {/* Equipment Settings */}
      {showEqSettings && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowEqSettings(false)}}>
          <div style={{background:C.elevated,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",animation:"slideUp 0.25s ease-out"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.borderLight,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>Mein Equipment</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16,lineHeight:1.4}}>Nur Übungen für dein verfügbares Equipment werden angezeigt.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {EQUIPMENT.map(eq => {
                const on = userEquipment.includes(eq.id);
                return (
                  <button key={eq.id} onClick={()=>toggleEquipment(eq.id)} style={{
                    padding:"14px 12px",borderRadius:14,textAlign:"left",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",
                    background: on ? `${C.lime}14` : C.card, border: on ? `1px solid ${C.lime}33` : `1px solid ${C.border}`,
                  }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:on?C.text:C.dim}}>{eq.name}</div>
                        <div style={{fontSize:10,color:on?C.lime:C.dim,fontWeight:600,letterSpacing:1}}>{eq.icon}</div>
                      </div>
                      <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${on?C.lime:C.border}`,background:on?C.lime:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0a0f",fontSize:12,fontWeight:900}}>{on?"\u2713":""}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11,color:C.dim,marginBottom:12,letterSpacing:1}}>{availableEx.length} von {EX.length} Übungen verfügbar</div>
            <button onClick={()=>setShowEqSettings(false)} style={{width:"100%",padding:"14px 0",background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,color:"#0a0a0f",border:"none",borderRadius:14,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,textTransform:"uppercase"}}>Fertig</button>
          </div>
        </div>
      )}

      {/* ═══ DATA EXPORT/IMPORT PANEL ═══ */}
      {showDataPanel && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowDataPanel(false)}}>
          <div style={{background:C.elevated,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",animation:"slideUp 0.25s ease-out",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.borderLight,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>Daten Export / Import</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16,lineHeight:1.5}}>Übertrage deine Daten zwischen Browsern oder Geräten.</div>

            {/* Export */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:8}}>Export</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8,lineHeight:1.4}}>Kopiert alle Daten (Workouts, Templates, Splits, Equipment, Notizen) in die Zwischenablage.</div>
              <button onClick={()=>{
                try {
                  const raw = localStorage.getItem("cardio-v4");
                  if (!raw) { alert("Keine Daten gefunden."); return; }
                  navigator.clipboard.writeText(raw).then(()=>alert("Daten kopiert! Füge sie im anderen Browser ein.")).catch(()=>{
                    // Fallback: show in prompt
                    prompt("Kopiere diesen Text:", raw);
                  });
                } catch(e) { alert("Fehler: " + e.message); }
              }} style={{width:"100%",padding:"14px 0",background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,color:"#0a0a0f",border:"none",borderRadius:14,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,textTransform:"uppercase"}}>
                Daten in Zwischenablage kopieren
              </button>
            </div>

            {/* Import */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:8}}>Import</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8,lineHeight:1.4}}>Füge die exportierten Daten hier ein. Wähle dann ob du zusammenführen oder ersetzen willst.</div>
              <textarea id="data-import-field" placeholder="JSON-Daten hier einfügen..." style={{
                width:"100%",minHeight:100,borderRadius:12,padding:12,fontFamily:"'Manrope',monospace",fontSize:11,
                background:C.card,border:`1px solid ${C.border}`,color:C.text,resize:"vertical",outline:"none",
              }}/>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>{
                  try {
                    const raw = document.getElementById("data-import-field").value.trim();
                    if (!raw) { alert("Kein Text eingefügt."); return; }
                    const imported = JSON.parse(raw);
                    if (!confirm("Daten ZUSAMMENFÜHREN? Workouts werden kombiniert, neuere Einstellungen überschreiben ältere.")) return;
                    // Merge: combine logs, keep latest templates/days/equipment/notes
                    const current = JSON.parse(localStorage.getItem("cardio-v4") || "{}");
                    const mergeLog = (a=[], b=[]) => {
                      const ids = new Set(a.map(w => w.id));
                      return [...a, ...b.filter(w => !ids.has(w.id))].sort((x,y) => y.date?.localeCompare(x.date));
                    };
                    const merged = {
                      workouts: mergeLog(current.workouts, imported.workouts),
                      startDate: current.startDate || imported.startDate,
                      strengthLog: mergeLog(current.strengthLog, imported.strengthLog),
                      strengthTemplates: imported.strengthTemplates || current.strengthTemplates || [],
                      trainingDays: current.trainingDays?.length ? current.trainingDays : (imported.trainingDays || []),
                      userEquipment: current.userEquipment || imported.userEquipment,
                      exerciseNotes: { ...(imported.exerciseNotes||{}), ...(current.exerciseNotes||{}) },
                      aiApiKey: current.aiApiKey || imported.aiApiKey || "",
                    };
                    localStorage.setItem("cardio-v4", JSON.stringify(merged));
                    localStorage.removeItem("cardio-activeWorkout");
                    alert("Daten zusammengeführt! App wird neu geladen.");
                    window.location.reload();
                  } catch(e) { alert("Fehler beim Import: " + e.message); }
                }} style={{flex:1,padding:"12px 0",background:C.card,color:C.lime,border:`1px solid ${C.lime}33`,borderRadius:12,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:1.5,textTransform:"uppercase"}}>
                  Zusammenführen
                </button>
                <button onClick={()=>{
                  try {
                    const raw = document.getElementById("data-import-field").value.trim();
                    if (!raw) { alert("Kein Text eingefügt."); return; }
                    const imported = JSON.parse(raw);
                    if (!confirm("ACHTUNG: Alle aktuellen Daten werden ÜBERSCHRIEBEN. Fortfahren?")) return;
                    localStorage.setItem("cardio-v4", JSON.stringify(imported));
                    localStorage.removeItem("cardio-activeWorkout");
                    alert("Daten ersetzt! App wird neu geladen.");
                    window.location.reload();
                  } catch(e) { alert("Fehler beim Import: " + e.message); }
                }} style={{flex:1,padding:"12px 0",background:C.card,color:"#c46a6a",border:"1px solid rgba(196,106,106,0.3)",borderRadius:12,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:1.5,textTransform:"uppercase"}}>
                  Ersetzen
                </button>
              </div>
            </div>

            {/* AI API Key */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:8}}>AI API-Key (Kimi/Moonshot)</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8,lineHeight:1.4}}>Für den AI Workout Generator. Key wird lokal gespeichert und bei Export/Import mit übertragen.</div>
              <div style={{display:"flex",gap:8}}>
                <input id="ai-key-field" type="password" placeholder="sk-..." defaultValue={(() => { try { return JSON.parse(localStorage.getItem("cardio-v4") || "{}").aiApiKey || ""; } catch { return ""; } })()} style={{
                  flex:1,padding:"12px 14px",borderRadius:12,fontFamily:"'Manrope',monospace",fontSize:12,
                  background:C.card,border:`1px solid ${C.border}`,color:C.text,outline:"none",
                }}/>
                <button onClick={()=>{
                  const key = document.getElementById("ai-key-field").value.trim();
                  try {
                    const d = JSON.parse(localStorage.getItem("cardio-v4") || "{}");
                    d.aiApiKey = key;
                    localStorage.setItem("cardio-v4", JSON.stringify(d));
                    alert(key ? "API-Key gespeichert!" : "API-Key entfernt.");
                  } catch(e) { alert("Fehler: " + e.message); }
                }} style={{padding:"12px 18px",background:C.card,color:C.sky,border:`1px solid ${C.sky}33`,borderRadius:12,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>Speichern</button>
              </div>
            </div>

            <button onClick={()=>setShowDataPanel(false)} style={{width:"100%",padding:"14px 0",background:"rgba(255,255,255,0.04)",color:C.muted,border:`1px solid ${C.border}`,borderRadius:14,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,textTransform:"uppercase"}}>Schließen</button>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM EXERCISE CREATOR ═══ */}
      {showCustomExModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowCustomExModal(false)}}>
          <div style={{background:C.elevated,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",animation:"slideUp 0.25s ease-out",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.borderLight,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:700,marginBottom:16}}>Eigene Übung erstellen</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>Name</div>
                <input id="cex-name" placeholder="z.B. Cable Lateral Raise" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>Muskelgruppe</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {MG.map(m => (
                    <button key={m.id} id={`cex-mg-${m.id}`} onClick={e => {
                      document.querySelectorAll("[id^=cex-mg-]").forEach(el => { el.style.border = `1px solid ${C.border}`; el.style.background = C.card; el.dataset.selected = ""; });
                      e.currentTarget.style.border = `1.5px solid ${m.color}`; e.currentTarget.style.background = `${m.color}14`; e.currentTarget.dataset.selected = m.id;
                    }} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.sub,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.name}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>Increment (kg)</div>
                  <input id="cex-inc" type="number" defaultValue="2.5" step="0.5" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"}}/>
                </div>
                <div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>Equipment</div>
                  <select id="cex-eq" style={{width:"100%",padding:"12px 14px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"inherit",outline:"none"}}>
                    {EQUIPMENT.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => {
              const name = document.getElementById("cex-name")?.value?.trim();
              const mgEl = document.querySelector("[id^=cex-mg-][data-selected]:not([data-selected=''])");
              const mg = mgEl?.dataset?.selected;
              const inc = parseFloat(document.getElementById("cex-inc")?.value) || 2.5;
              const eq = document.getElementById("cex-eq")?.value || "bw";
              if (!name) { alert("Name eingeben"); return; }
              if (!mg) { alert("Muskelgruppe wählen"); return; }
              const id = "custom_" + Date.now();
              const newEx = { id, name, m: mg, s: [], inc, eq: [eq] };
              save(undefined, undefined, undefined, undefined, undefined, [...customExercises, newEx]);
              setShowCustomExModal(false);
            }} style={{width:"100%",padding:"14px 0",background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,color:"#0a0a0f",border:"none",borderRadius:14,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,textTransform:"uppercase",marginTop:16}}>Erstellen</button>
            {/* List existing custom exercises */}
            {customExercises.length > 0 && (
              <div style={{marginTop:16}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Eigene Übungen ({customExercises.length})</div>
                {customExercises.map(ex => (
                  <div key={ex.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`,marginBottom:4}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ex.name}</div>
                      <div style={{fontSize:10,color:MG.find(m=>m.id===ex.m)?.color||C.dim}}>{MG.find(m=>m.id===ex.m)?.name}</div>
                    </div>
                    <button onClick={() => { if (confirm(`"${ex.name}" löschen?`)) save(undefined, undefined, undefined, undefined, undefined, customExercises.filter(e => e.id !== ex.id)); }} style={{width:28,height:28,borderRadius:8,background:C.emberBg,border:`1px solid ${C.ember}30`,color:C.ember,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={()=>setShowCustomExModal(false)} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.muted,border:"none",fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>Schließen</button>
          </div>
        </div>
      )}

      {/* ═══ NOTE EDITOR MODAL ═══ */}
      {editingNoteFor && (()=>{
        const def = ALL_EX.find(e=>e.id===editingNoteFor);
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget){saveNoteEditor()}}}>
            <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",animation:"slideUp 0.25s ease-out"}}>
              <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 16px"}}/>
              <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>Cues & Notizen</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:16}}>{def?.name}</div>
              <div style={{fontSize:11,color:C.dim,marginBottom:8,fontWeight:600}}>Permanente Hinweise für diese Übung (z.B. "Ellbogen eng", "Maschine #7", "Handgelenk-Bandagen ab 80kg")</div>
              <textarea
                value={noteText}
                onChange={e=>setNoteText(e.target.value)}
                placeholder="Cues eingeben..."
                rows={4}
                style={{width:"100%",padding:"14px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:14,color:C.text,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",resize:"vertical",lineHeight:1.5}}
              />
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button onClick={saveNoteEditor} style={{flex:1,padding:"14px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
                <button onClick={()=>setEditingNoteFor(null)} style={{padding:"14px 22px",background:C.card,color:C.muted,border:`1px solid ${C.border}`,borderRadius:14,fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Abb.</button>
              </div>
              {noteText.trim() && (
                <button onClick={()=>{setNoteText("");}} style={{width:"100%",padding:"10px 0",background:"transparent",color:C.ember,border:"none",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginTop:8,fontWeight:600}}>Notiz löschen</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══ WORKOUT SUMMARY ═══ */}
      {summary && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setSummary(null)}>
          <div style={{background:C.surface,borderRadius:24,padding:"28px 24px",border:`1px solid ${summary.prs.length?C.gold:C.border}`,maxWidth:380,width:"100%",textAlign:"center",animation:"pop 0.3s ease",boxShadow:summary.prs.length?`0 0 40px ${C.gold}33`:undefined,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:42,marginBottom:8}}>{summary.prs.length ? "\u{1F3C6}" : "\u{1F4AA}"}</div>
            <div style={{fontSize:24,fontWeight:900,marginBottom:4}}>Workout fertig!</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>{summary.date}</div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
              <div style={{background:C.card,borderRadius:14,padding:"12px 8px"}}><div style={{fontSize:20,fontWeight:900,color:C.ember}}>{summary.duration}m</div><div style={{fontSize:10,color:C.muted}}>Dauer</div></div>
              <div style={{background:C.card,borderRadius:14,padding:"12px 8px"}}><div style={{fontSize:20,fontWeight:900,color:C.sky}}>{summary.totalSets}</div><div style={{fontSize:10,color:C.muted}}>Sätze</div></div>
              <div style={{background:C.card,borderRadius:14,padding:"12px 8px"}}><div style={{fontSize:20,fontWeight:900,color:C.lime}}>{Math.round(summary.totalVol/1000*10)/10}t</div><div style={{fontSize:10,color:C.muted}}>Volumen</div></div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              <div style={{background:C.card,borderRadius:14,padding:"12px 8px"}}><div style={{fontSize:20,fontWeight:900,color:C.gold}}>{summary.exercises}</div><div style={{fontSize:10,color:C.muted}}>Übungen</div></div>
              <div style={{background:C.card,borderRadius:14,padding:"12px 8px"}}><div style={{fontSize:20,fontWeight:900,color:C.violet}}>{summary.muscles}</div><div style={{fontSize:10,color:C.muted}}>Muskeln</div></div>
            </div>

            {summary.prs.length > 0 && (
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:C.gold,letterSpacing:1.5,marginBottom:8}}>NEUE PRs!</div>
                {summary.prs.map((pr,i) => (
                  <div key={i} style={{background:C.goldBg,borderRadius:12,padding:"10px 14px",marginBottom:6,border:`1px solid ${C.gold}30`}}>
                    <div style={{fontSize:12,color:C.muted}}>{pr.name}</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.gold}}>{pr.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══ AI COACH ANALYSIS ═══ */}
            {(aiCoachLoading || aiCoach) && (
              <div style={{marginBottom:16,textAlign:"left"}}>
                <div
                  onClick={() => aiCoach && setAiCoachExpanded(p => !p)}
                  style={{display:"flex",alignItems:"center",gap:8,cursor:aiCoach?"pointer":"default",padding:"10px 14px",background:aiCoach ? "rgba(196,149,106,0.08)" : C.card,borderRadius:14,border:`1px solid ${aiCoach ? C.accentBorder : C.border}`,transition:"all 0.3s ease"}}
                >
                  <span style={{fontSize:18}}>{aiCoachLoading ? "⏳" : "🧠"}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.ember,marginBottom:2}}>AI COACH</div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>
                      {aiCoachLoading ? "Analysiere dein Workout..." : (aiCoach?.headline || "Analyse fertig")}
                    </div>
                  </div>
                  {aiCoach && <span style={{fontSize:14,color:C.muted,transform:aiCoachExpanded?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>▼</span>}
                </div>

                {aiCoach && aiCoachExpanded && (
                  <div style={{marginTop:8,animation:"slideDown 0.2s ease"}}>
                    {/* Tips */}
                    {(aiCoach.tips || []).map((tip, i) => {
                      const typeColors = {stagnation: C.gold, progression: C.lime, technik: C.sky, volumen: C.violet, rpe: C.ember};
                      const typeLabels = {stagnation: "STAGNATION", progression: "PROGRESSION", technik: "TECHNIK", volumen: "VOLUMEN", rpe: "RPE"};
                      const col = typeColors[tip.type] || C.muted;
                      return (
                        <div key={i} style={{background:C.card,borderRadius:12,padding:"10px 14px",marginBottom:6,borderLeft:`3px solid ${col}`}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                            <span style={{fontSize:9,fontWeight:800,letterSpacing:1.5,color:col,textTransform:"uppercase"}}>{typeLabels[tip.type] || tip.type}</span>
                            <span style={{fontSize:11,color:C.sub,fontWeight:600}}>— {tip.exercise}</span>
                          </div>
                          <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{tip.tip}</div>
                        </div>
                      );
                    })}

                    {/* Overall */}
                    {aiCoach.overall && (
                      <div style={{background:"rgba(196,149,106,0.06)",borderRadius:12,padding:"10px 14px",marginTop:4,border:`1px solid ${C.accentBorder}`}}>
                        <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:C.ember,marginBottom:4}}>FAZIT</div>
                        <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{aiCoach.overall}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <button onClick={()=>{setSummary(null);setAiCoach(null);setAiCoachExpanded(false);}} style={{width:"100%",padding:"14px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Weiter</button>
          </div>
        </div>
      )}

      {/* ═══ EXERCISE PICKER with Search + Recent ═══ */}
      {picker && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget){setPicker(false);setSearchQ("");delete window._addToDay;}}}>
          <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",maxHeight:"80vh",overflowY:"auto",animation:"slideUp 0.25s ease-out"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:800,marginBottom:12}}>Übung wählen</div>

            {/* Search bar */}
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Suche..." style={{...inp,textAlign:"left",marginBottom:12,fontSize:15,padding:"12px 16px"}} />

            {/* Muscle filter pills */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              <button onClick={()=>setExFilter("all")} style={{padding:"6px 12px",borderRadius:8,border:exFilter==="all"?`1.5px solid ${C.ember}`:`1px solid ${C.border}`,background:exFilter==="all"?C.emberBg:C.card,color:exFilter==="all"?C.ember:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Alle</button>
              {MG.map(m=>(<button key={m.id} onClick={()=>setExFilter(m.id)} style={{padding:"6px 12px",borderRadius:8,border:exFilter===m.id?`1.5px solid ${m.color}`:`1px solid ${C.border}`,background:exFilter===m.id?`${m.color}14`:C.card,color:exFilter===m.id?m.color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.name}</button>))}
            </div>

            {/* Recently used (only if no search and filter is "all") */}
            {!searchQ && exFilter === "all" && recentExIds.length > 0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:8}}>ZULETZT VERWENDET</div>
                {recentExIds.slice(0,6).map(eid => {
                  const ex = ALL_EX.find(e=>e.id===eid); if(!ex) return null;
                  const mg = MG.find(m=>m.id===ex.m); const prev = getPrev(eid);
                  return (
                    <div key={eid} onClick={()=>{if(window._addToDay){addExToDay(window._addToDay,eid);setPicker(false);delete window._addToDay;}else addEx(eid)}} style={{padding:"10px 16px",borderRadius:12,background:C.card,border:`1px solid ${C.borderLight}`,marginBottom:4,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:14,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div></div>
                      {prev && <div style={{fontSize:10,color:C.dim,textAlign:"right"}}>{prev.sets[0]?.weight}kg x{prev.sets[0]?.reps}</div>}
                    </div>
                  );
                })}
                <div style={{height:1,background:C.border,margin:"12px 0"}} />
              </div>
            )}

            {/* All exercises */}
            {filteredEx.map(ex => {
              const mg = MG.find(m=>m.id===ex.m); const prev = getPrev(ex.id);
              return (
                <div key={ex.id} onClick={()=>{if(window._addToDay){addExToDay(window._addToDay,ex.id);setPicker(false);delete window._addToDay;}else addEx(ex.id)}} style={{padding:"10px 16px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,marginBottom:4,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:14,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div></div>
                  {prev && <div style={{fontSize:10,color:C.dim,textAlign:"right"}}>{prev.sets[0]?.weight}kg<br/>x{prev.sets[0]?.reps}</div>}
                </div>
              );
            })}
            {filteredEx.length === 0 && <div style={{textAlign:"center",padding:20,color:C.dim}}>Keine Übungen gefunden</div>}
            {/* Create custom exercise button */}
            <button onClick={()=>{setPicker(false);setShowCustomExModal(true)}} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.sky,border:`1px dashed ${C.sky}30`,borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:8,letterSpacing:1}}>+ Eigene Übung erstellen</button>
          </div>
        </div>
      )}

    <div style={{padding:"22px 20px 100px",animation:"fadeIn 0.35s ease"}}>

      {/* ═══ FIXED BOTTOM NAV ═══ */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:60,background:"rgba(10,10,15,0.92)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderTop:`1px solid ${C.border}`,paddingBottom:"env(safe-area-inset-bottom, 0px)"}}>
        <div style={{display:"flex",maxWidth:480,margin:"0 auto"}}>
          {[
            ["log","Workout","◎"],
            ["days","Tage","▤"],
            ["history","Verlauf","◔"],
            ["muscles","Muskeln","⬡"],
            ["coach","Coach","✦"],
          ].map(([k,l,icon])=>{
            const active2 = sub===k;
            return (
              <button key={k} onClick={()=>setSub(k)} style={{
                flex:1,padding:"10px 0 8px",background:"transparent",border:"none",
                color:active2?C.ember:C.dim,cursor:"pointer",fontFamily:"'Manrope',sans-serif",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                transition:"all 0.2s",position:"relative",
              }}>
                {active2 && <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:20,height:2,background:C.ember,borderRadius:1}} />}
                <span style={{fontSize:18,lineHeight:1,filter:active2?`drop-shadow(0 0 6px ${C.ember}66)`:"none",transition:"filter 0.2s"}}>{icon}</span>
                <span style={{fontSize:9,fontWeight:active2?700:500,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ WORKOUT LOG ═══ */}
      {sub==="log" && !active && (
        <div>
          {/* ═══ GAMIFICATION CARD ═══ */}
          {gamification.totalWorkouts > 0 && (
            <div className="card3d" style={{marginBottom:12}}
              onTouchStart={e=>{const el=e.currentTarget.querySelector('.card3d-inner');if(el){el.style.transform='rotateX(2deg) rotateY(-1deg) scale(1.01)';el.style.boxShadow=`0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${C.ember}10`}}}
              onTouchEnd={e=>{const el=e.currentTarget.querySelector('.card3d-inner');if(el){el.style.transform='';el.style.boxShadow=''}}}
            >
              <div className="card3d-inner" style={{background:`linear-gradient(145deg, ${C.surface}, rgba(20,20,30,0.95))`,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.accentBorder}`,position:"relative",overflow:"hidden"}}>
                {/* Subtle accent glow */}
                <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:`radial-gradient(circle, ${C.ember}0a, transparent 70%)`,pointerEvents:"none"}} />
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,position:"relative"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg, ${C.ember}25, ${C.gold}15)`,border:`1px solid ${C.ember}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 12px ${C.ember}15`}}>🔥</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:800,color:C.text,letterSpacing:0.3}}>Level {gamification.level}</div>
                      <div style={{fontSize:11,color:C.ember,fontWeight:600}}>{gamification.levelName}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:300,color:C.ember,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{gamification.totalWorkouts}</div>
                    <div style={{fontSize:9,color:C.dim,letterSpacing:1}}>WORKOUTS</div>
                  </div>
                </div>
                {/* XP progress bar */}
                <div style={{height:5,background:"rgba(255,255,255,0.04)",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${Math.min((gamification.xp / gamification.nextLevelXp) * 100, 100)}%`,background:`linear-gradient(90deg, ${C.ember}88, ${C.ember}, ${C.gold})`,borderRadius:3,transition:"width 1s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 8px ${C.ember}44`}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.dim,marginBottom:gamification.badges.length?10:0}}>
                  <span>{gamification.xp} / {gamification.nextLevelXp} XP</span>
                  <span>{gamification.weekStreak > 0 ? `${gamification.weekStreak}W Streak 🔥` : "Nächstes Level"}</span>
                </div>
                {/* Badges row */}
                {gamification.badges.length > 0 && (
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {gamification.badges.map((b, i) => (
                      <div key={i} style={{padding:"4px 10px",borderRadius:8,background:`${C.ember}08`,border:`1px solid ${C.ember}18`,fontSize:10,fontWeight:600,color:C.sub,display:"flex",alignItems:"center",gap:4}}>
                        <span>{b.icon}</span>{b.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ REST-DAY / TRAINING RECOMMENDATION ═══ */}
          {restDayAdvice && (
            <div style={{
              background: restDayAdvice.type === "rest"
                ? "linear-gradient(135deg, rgba(139,164,184,0.08), rgba(139,164,184,0.03))"
                : "linear-gradient(135deg, rgba(168,184,124,0.08), rgba(168,184,124,0.03))",
              borderRadius:14,padding:"14px 16px",marginBottom:12,
              border:`1px solid ${restDayAdvice.type === "rest" ? "rgba(139,164,184,0.2)" : "rgba(168,184,124,0.2)"}`,
              display:"flex",alignItems:"flex-start",gap:12,
            }}>
              <div style={{fontSize:18,marginTop:1}}>{restDayAdvice.type === "rest" ? "😴" : "💪"}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:restDayAdvice.type==="rest"?C.sky:C.lime,marginBottom:2}}>{restDayAdvice.message}</div>
                <div style={{fontSize:10,color:C.muted,lineHeight:1.4}}>{restDayAdvice.detail}</div>
              </div>
            </div>
          )}

          {/* AI Workout Generator */}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <div style={{marginBottom:18}}>
            <button onClick={generateAiWorkout} disabled={aiLoading} style={{
              width:"100%",padding:"18px 20px",borderRadius:16,border:`1px solid rgba(139,164,184,0.25)`,
              background:"linear-gradient(135deg, rgba(139,164,184,0.08), rgba(155,143,184,0.06))",
              cursor:aiLoading?"wait":"pointer",fontFamily:"inherit",textAlign:"left",
              display:"flex",alignItems:"center",gap:14,transition:"all 0.2s",
              opacity:aiLoading?0.7:1,
            }}>
              <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg, rgba(139,164,184,0.15), rgba(155,143,184,0.12))",border:`1px solid rgba(139,164,184,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                {aiLoading ? <div style={{width:16,height:16,border:`2px solid ${C.sky}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> : "✦"}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:0.5}}>{aiLoading ? "Generiere..." : "AI Workout"}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:1}}>Optimales Training basierend auf Recovery & Split</div>
              </div>
            </button>
          </div>

          {/* AI Workout Preview */}
          {aiWorkout && (
            <div style={{background:C.surface,borderRadius:16,padding:"18px 18px 14px",border:`1px solid rgba(139,164,184,0.2)`,marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:C.sky,letterSpacing:2.5,textTransform:"uppercase",marginBottom:4}}>AI VORSCHLAG</div>
                  <div style={{fontSize:18,fontWeight:800,color:C.text}}>{aiWorkout.name}</div>
                </div>
                <button onClick={()=>setAiWorkout(null)} style={{width:28,height:28,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
              </div>
              {aiWorkout.reason && <div style={{fontSize:11,color:C.muted,marginBottom:14,lineHeight:1.5,padding:"8px 12px",background:C.card,borderRadius:10,border:`1px solid ${C.border}`}}>{aiWorkout.reason}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:14}}>
                {aiWorkout.exercises.map((eid, i) => {
                  const def = ALL_EX.find(e => e.id === eid);
                  const mg = MG.find(m => m.id === def?.m);
                  const prev = getPrev(eid);
                  return (
                    <div key={eid} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
                      <div style={{width:22,height:22,borderRadius:6,background:`${mg?.color || C.dim}18`,border:`1px solid ${mg?.color || C.dim}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:mg?.color || C.dim,flexShrink:0}}>{i+1}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{def?.name || eid}</div>
                        <div style={{fontSize:10,color:mg?.color || C.dim,fontWeight:600}}>{mg?.name}</div>
                      </div>
                      {prev && <div style={{fontSize:10,color:C.dim,textAlign:"right",flexShrink:0}}>{prev.sets[0]?.weight}kg × {prev.sets[0]?.reps}</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={startAiWorkout} style={{flex:1,padding:"14px 0",background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,color:"#0a0a0f",border:"none",borderRadius:12,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:2,textTransform:"uppercase"}}>Starten</button>
                <button onClick={generateAiWorkout} disabled={aiLoading} style={{padding:"14px 18px",background:C.card,color:C.sub,border:`1px solid ${C.border}`,borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>↻ Neu</button>
              </div>
            </div>
          )}

          {/* Deload / Periodization Alert */}
          {deloadAdvice && (
            <div style={{
              marginBottom:18,borderRadius:16,overflow:"hidden",
              border:`1px solid ${deloadAdvice.severity === "high" ? "rgba(196,106,106,0.3)" : "rgba(212,162,78,0.25)"}`,
              background: deloadAdvice.severity === "high"
                ? "linear-gradient(135deg, rgba(196,106,106,0.08), rgba(196,106,106,0.03))"
                : "linear-gradient(135deg, rgba(212,162,78,0.08), rgba(212,162,78,0.03))",
            }}>
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:deloadAdvice.severity==="high"?"rgba(196,106,106,0.12)":"rgba(212,162,78,0.12)",border:`1px solid ${deloadAdvice.severity==="high"?"rgba(196,106,106,0.25)":"rgba(212,162,78,0.2)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>⚡</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:deloadAdvice.severity==="high"?"#c46a6a":"#d4a24e"}}>Deload empfohlen</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:1}}>{deloadAdvice.signals} Signale erkannt</div>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:12}}>
                  {deloadAdvice.reasons.map((r, i) => (
                    <div key={i} style={{fontSize:11,color:C.sub,display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:4,height:4,borderRadius:2,background:deloadAdvice.severity==="high"?"#c46a6a":"#d4a24e",flexShrink:0}}/>
                      {r}
                    </div>
                  ))}
                </div>
                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:9,color:C.dim,letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>Empfehlung</div>
                    <div style={{fontSize:12,color:C.text,fontWeight:600,marginTop:2}}>Diese Woche: ~{Math.round(deloadAdvice.deloadVol/1000)}t Volumen (−40%)</div>
                  </div>
                  <div style={{fontSize:10,color:C.dim,textAlign:"right"}}>
                    <div>Letzte Woche</div>
                    <div style={{fontWeight:700,color:C.sub}}>{Math.round(deloadAdvice.lastWeekVol/1000)}t</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {trainingDays.length > 0 && (
            <div style={{marginBottom:18}}>
              <div style={{fontSize:13,fontWeight:700,color:C.sub,marginBottom:10}}>Trainingstage</div>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
                {trainingDays.map(d => (
                  <button key={d.id} onClick={()=>startFromDay(d)} style={{padding:"14px 20px",borderRadius:16,background:C.surface,border:`1.5px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",minWidth:120,flexShrink:0,textAlign:"left"}}>
                    <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:2}}>{d.name}</div>
                    <div style={{fontSize:11,color:C.muted}}>{d.exercises.length} Übungen</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={()=>startWorkout(null)} style={{width:"100%",padding:"18px 0",background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,color:"#0a0a0f",border:"none",borderRadius:16,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:3,textTransform:"uppercase",boxShadow:`0 8px 32px rgba(196,149,106,0.2)`,marginBottom:10}}>Leeres Workout starten</button>
          {templates.length > 0 && (
            <>
              <button onClick={()=>setShowTmpl(p=>!p)} style={{width:"100%",padding:"14px 0",background:C.card,color:C.sub,border:`1px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit",marginBottom:8}}>Aus Vorlage ({templates.length})</button>
              {showTmpl && templates.map(t => (
                <div key={t.id} style={{background:C.surface,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                  <div style={{flex:1,cursor:"pointer"}} onClick={()=>startWorkout(t)}><div style={{fontSize:15,fontWeight:700}}>{t.name}</div><div style={{fontSize:12,color:C.muted}}>{t.exercises.length} Übungen</div></div>
                  <button onClick={()=>delTmpl(t.id)} style={{width:32,height:32,borderRadius:8,background:C.emberBg,border:`1px solid ${C.ember}30`,color:C.ember,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {sub==="log" && active && (
        <div>
          {/* REST TIMER with countdown */}
          {restStart && (
            <div onClick={()=>setRestStart(null)} style={{background:restSec>=restTarget?C.limeBg:C.emberBg,borderRadius:14,padding:"12px 18px",border:`1px solid ${restSec>=restTarget?C.lime:C.ember}30`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",transition:"background 0.3s"}}>
              <div>
                <div style={{fontSize:13,color:C.sub,fontWeight:600}}>Pause</div>
                <div style={{fontSize:10,color:C.dim}}>Ziel: {fmtT(restTarget)}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:28,fontWeight:900,color:restSec>=restTarget?C.lime:C.ember,fontVariantNumeric:"tabular-nums"}}>{fmtT(restSec)}</div>
                {restSec < restTarget && <div style={{height:3,background:C.card,borderRadius:2,width:120,marginTop:4}}><div style={{height:"100%",background:C.ember,borderRadius:2,width:`${Math.min(restSec/restTarget*100,100)}%`,transition:"width 0.3s"}}/></div>}
              </div>
              <span style={{fontSize:11,color:C.muted,width:50,textAlign:"right"}}>{restSec>=restTarget?"Fertig!":"Stoppen"}</span>
            </div>
          )}

          {/* Exercises */}
          {active.exercises.map((ex, ei) => {
            const def = ALL_EX.find(e => e.id === ex.exerciseId);
            const mg = MG.find(m => m.id === def?.m);
            const prev = getPrev(ex.exerciseId);
            const sug = prev ? suggestWeight(ex.exerciseId, prev.sets, [8,12], sLog, recMap[ALL_EX.find(e=>e.id===ex.exerciseId)?.m]||100, ALL_EX) : null;
            return (
              <div key={ei} style={{background:C.surface,borderRadius:16,padding:"16px 16px 12px",border:`1px solid ${C.border}`,marginBottom:10,borderLeft:`4px solid ${mg?.color||C.muted}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div onClick={()=>{setSub("history");setDetailEx(ex.exerciseId)}} style={{cursor:"pointer"}}><div style={{fontSize:16,fontWeight:800}}>{def?.name||"?"}</div><div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div></div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <button onClick={()=>generateAiSwap(ei)} title="AI Alternative" style={{width:30,height:30,borderRadius:8,background:aiSwap?.exerciseIndex===ei?C.emberBg:C.card,border:`1px solid ${aiSwap?.exerciseIndex===ei?C.accentBorder:C.border}`,color:aiSwap?.exerciseIndex===ei?C.ember:C.muted,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>⟳</button>
                    <button onClick={()=>rmEx(ei)} style={{width:30,height:30,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                  </div>
                </div>
                {/* ═══ AI SWAP SUGGESTIONS ═══ */}
                {aiSwap?.exerciseIndex === ei && (
                  <div style={{background:C.emberBg,borderRadius:12,padding:"10px 14px",marginBottom:8,border:`1px solid ${C.accentBorder}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:aiSwap.loading?0:8}}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.ember}}>
                        {aiSwap.loading ? "⏳ Suche Alternativen..." : "AI ALTERNATIVEN"}
                      </div>
                      {!aiSwap.loading && <button onClick={()=>setAiSwap(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12,padding:2}}>✕</button>}
                    </div>
                    {aiSwap.suggestions && aiSwap.suggestions.map((alt, ai) => {
                      const altDef = ALL_EX.find(e => e.id === alt.id);
                      const altMg = altDef ? MG.find(m => m.id === altDef.m) : null;
                      return (
                        <div key={ai} onClick={()=>applySwap(ei, alt.id)} style={{background:C.card,borderRadius:10,padding:"10px 12px",marginBottom:4,cursor:"pointer",border:`1px solid ${C.border}`,transition:"all 0.15s"}}
                          onMouseEnter={e=>e.currentTarget.style.borderColor=C.ember}
                          onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div>
                              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{altDef?.name || alt.id}</div>
                              <div style={{fontSize:10,color:altMg?.color||C.muted,fontWeight:600}}>{altMg?.name||""}</div>
                            </div>
                            <span style={{fontSize:11,color:C.ember,fontWeight:700}}>Wählen</span>
                          </div>
                          <div style={{fontSize:11,color:C.sub,marginTop:4,lineHeight:1.4}}>{alt.reason}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {sug && <div style={{background:C.goldBg,borderRadius:10,padding:"8px 12px",marginBottom:8,border:`1px solid ${C.gold}20`,fontSize:12,color:C.gold,fontWeight:600}}>{sug.reason}</div>}
                {prev && <div style={{fontSize:11,color:C.dim,marginBottom:6}}>Letztes Mal ({new Date(prev.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}): {prev.sets.map(s=>`${s.weight}x${s.reps}${s.type&&s.type!=="N"?` (${s.type})`:""}${s.rpe?` @${s.rpe}`:""}`).join(" / ")}</div>}

                {/* ═══ NOTES AREA ═══ */}
                {(()=>{
                  const pNote = getExNote(ex.exerciseId);
                  return (
                    <div style={{marginBottom:8}}>
                      {/* Persistent cues */}
                      {pNote && (
                        <div onClick={()=>openNoteEditor(ex.exerciseId)} style={{background:`${C.sky}0a`,borderRadius:10,padding:"8px 12px",marginBottom:6,border:`1px solid ${C.sky}18`,cursor:"pointer"}}>
                          <div style={{fontSize:9,fontWeight:700,color:C.sky,letterSpacing:1.5,marginBottom:3}}>CUES</div>
                          <div style={{fontSize:12,color:C.sub,lineHeight:1.4,whiteSpace:"pre-wrap"}}>{pNote}</div>
                        </div>
                      )}
                      {/* Session note input */}
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input
                          value={ex.sessionNote||""}
                          onChange={e=>updateSessionNote(ei,e.target.value)}
                          placeholder="Session-Notiz..."
                          style={{flex:1,padding:"7px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:12,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box"}}
                        />
                        {!pNote && (
                          <button onClick={()=>openNoteEditor(ex.exerciseId)} style={{padding:"7px 10px",borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Cues</button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Warm-up actions */}
                {isWarmupRelevant(ex.exerciseId) && (()=>{
                  const hasWarmup = ex.sets.some(s => s.type === "W");
                  const firstWork = ex.sets.find(s => s.type !== "W");
                  const canGenerate = firstWork && firstWork.weight > 0;
                  return (
                    <div style={{display:"flex",gap:6,marginBottom:8}}>
                      {!hasWarmup && canGenerate && (
                        <button onClick={()=>applyWarmup(ei)} style={{padding:"5px 12px",borderRadius:8,background:`${C.gold}14`,border:`1px solid ${C.gold}30`,color:C.gold,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Warm-up</button>
                      )}
                      {hasWarmup && (
                        <>
                          <button onClick={()=>applyWarmup(ei)} style={{padding:"5px 12px",borderRadius:8,background:`${C.gold}14`,border:`1px solid ${C.gold}30`,color:C.gold,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Neu berechnen</button>
                          <button onClick={()=>removeWarmup(ei)} style={{padding:"5px 12px",borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Entfernen</button>
                        </>
                      )}
                      {!canGenerate && !hasWarmup && (
                        <div style={{fontSize:11,color:C.dim,fontStyle:"italic"}}>Gewicht eintragen für Warm-up</div>
                      )}
                    </div>
                  );
                })()}

                {/* Header */}
                <div style={{display:"grid",gridTemplateColumns:"28px 42px 1fr 1fr 36px 40px 32px",gap:3,marginBottom:4}}>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>#</div>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>TYP</div>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>{def?.bw?"BW":def?.timed?"SEK":"KG"}</div>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>{def?.timed?"":"REPS"}</div>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>RPE</div>
                  <div/><div/>
                </div>

                {/* Sets */}
                {ex.sets.map((set, si) => {
                  const st = SET_TYPES.find(t => t.id === set.type) || SET_TYPES[0];
                  return (
                    <div key={si} style={{display:"grid",gridTemplateColumns:"28px 42px 1fr 1fr 36px 40px 32px",gap:3,marginBottom:4,alignItems:"center"}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.dim,textAlign:"center"}}>{si+1}</div>
                      <button onClick={()=>{const types=["N","W","D","F"];const ci=types.indexOf(set.type||"N");upSet(ei,si,"type",types[(ci+1)%4])}} style={{padding:"4px 2px",borderRadius:6,border:`1px solid ${st.color}40`,background:`${st.color}14`,color:st.color,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>{st.label}</button>
                      <input type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" value={set.weight} onChange={e=>{const v=e.target.value;if(v===""||/^\d*\.?\d*$/.test(v))upSet(ei,si,"weight",v)}} onBlur={e=>{const n=parseFloat(e.target.value);upSet(ei,si,"weight",isNaN(n)?0:n)}} style={{...inp,padding:"8px 4px",fontSize:14,fontWeight:700,background:set.done?`${C.lime}10`:C.card}}/>
                      {!def?.timed && <input type="text" inputMode="numeric" pattern="[0-9]*" value={set.reps} onChange={e=>{const v=e.target.value;if(v===""||/^\d+$/.test(v))upSet(ei,si,"reps",v)}} onBlur={e=>{const n=parseInt(e.target.value,10);upSet(ei,si,"reps",isNaN(n)?0:n)}} style={{...inp,padding:"8px 4px",fontSize:14,fontWeight:700,background:set.done?`${C.lime}10`:C.card}}/>}
                      {def?.timed && <div/>}
                      <input type="text" inputMode="numeric" pattern="[0-9]*" value={set.rpe||""} onChange={e=>{const v=e.target.value;if(v===""||/^\d+$/.test(v)){const n=parseInt(v,10);if(v===""||n<=10)upSet(ei,si,"rpe",v)}}} onBlur={e=>{const n=parseInt(e.target.value,10);upSet(ei,si,"rpe",isNaN(n)?0:Math.min(10,n))}} placeholder="-" style={{...inp,padding:"8px 2px",fontSize:12,fontWeight:600,color:C.muted}}/>
                      <button onClick={()=>{upSet(ei,si,"done");if(!set.done)startRest(ex.exerciseId)}} style={{width:40,height:36,borderRadius:10,border:`1px solid ${set.done?C.lime+"40":C.border}`,cursor:"pointer",fontSize:16,background:set.done?C.limeBg:C.card,color:set.done?C.lime:C.dim,display:"flex",alignItems:"center",justifyContent:"center"}}>{set.done?"\u2713":""}</button>
                      <button onClick={()=>rmSet(ei,si)} style={{width:32,height:36,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                    </div>
                  );
                })}
                <button onClick={()=>addSet(ei)} style={{width:"100%",padding:"7px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ Satz</button>
              </div>
            );
          })}

          <button onClick={()=>setPicker(true)} style={{width:"100%",padding:"14px 0",background:C.surface,border:`1.5px dashed ${C.border}`,borderRadius:14,color:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>+ Übung</button>
          <button onClick={finish} style={{width:"100%",padding:"16px 0",background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,color:"#0a0a0f",border:"none",borderRadius:14,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",letterSpacing:3,textTransform:"uppercase",boxShadow:`0 8px 32px rgba(196,149,106,0.2)`,marginBottom:8}}>Workout beenden</button>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input value={tmplName} onChange={e=>setTmplName(e.target.value)} placeholder="Als Vorlage speichern..." style={{...inp,textAlign:"left",flex:1,borderRadius:14}}/>
            <button onClick={saveTmpl} disabled={!tmplName.trim()} style={{padding:"0 18px",background:tmplName.trim()?C.card:C.bg,border:`1px solid ${C.border}`,borderRadius:14,color:tmplName.trim()?C.sub:C.dim,fontSize:13,fontWeight:600,cursor:tmplName.trim()?"pointer":"default",fontFamily:"inherit"}}>Save</button>
          </div>
          <button onClick={()=>{if(confirm("Abbrechen?"))setActive(null)}} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.dim,border:"none",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
        </div>
      )}

      {/* ═══ TRAINING DAYS ═══ */}
      {sub==="days" && (
        <div>
          {trainingDays.length===0 && !showSplits && (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>Trainingstage einrichten</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.5}}>Wähle einen Split oder erstelle eigene Tage.</div>
              <button onClick={()=>setShowSplits(true)} style={{width:"100%",padding:"15px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>Split wählen</button>
              <button onClick={addDay} style={{width:"100%",padding:"14px 0",background:C.card,color:C.sub,border:`1px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Manuell erstellen</button>
            </div>
          )}
          {showSplits && (
            <div style={{marginBottom:18}}>
              <div style={{fontSize:16,fontWeight:800,marginBottom:12}}>Split auswählen</div>
              {Object.entries(SPLIT_PRESETS).map(([k,v])=>(
                <div key={k} onClick={()=>applySplit(k)} style={{background:C.surface,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.border}`,marginBottom:8,cursor:"pointer"}}>
                  <div style={{fontSize:16,fontWeight:800,marginBottom:4}}>{v.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{v.days.map(d=>d.name).join(" \u2192 ")}</div>
                </div>
              ))}
              <button onClick={()=>setShowSplits(false)} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.muted,border:"none",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
            </div>
          )}
          {trainingDays.length > 0 && (
            <>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:800}}>Trainingstage</div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>setShowSplits(true)} style={{padding:"6px 14px",borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Split ändern</button>
                  <button onClick={addDay} style={{padding:"6px 14px",borderRadius:8,background:C.emberBg,border:`1px solid ${C.ember}30`,color:C.ember,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Tag</button>
                </div>
              </div>
              {trainingDays.map(day=>(
                <div key={day.id} style={{background:C.surface,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.border}`,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <input value={day.name} onChange={e=>updateDayName(day.id,e.target.value)} style={{...inp,textAlign:"left",fontSize:16,fontWeight:800,background:"transparent",border:"none",padding:0,width:"auto"}}/>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>startFromDay(day)} style={{padding:"6px 14px",borderRadius:8,background:C.ember,border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Start</button>
                      <button onClick={()=>removeDay(day.id)} style={{width:30,height:30,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                    </div>
                  </div>
                  {day.exercises.map((eid,i)=>{const def=ALL_EX.find(e=>e.id===eid);const mg=MG.find(m=>m.id===def?.m);
                    return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<day.exercises.length-1?`1px solid ${C.border}`:"none"}}>
                      <div><span style={{fontSize:13,fontWeight:600}}>{def?.name||eid}</span><span style={{fontSize:11,color:mg?.color,marginLeft:8}}>{mg?.name}</span></div>
                      <button onClick={()=>removeExFromDay(day.id,i)} style={{width:24,height:24,borderRadius:6,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                    </div>);
                  })}
                  <button onClick={()=>{setExFilter("all");setSearchQ("");setPicker(true);window._addToDay=day.id}} style={{width:"100%",padding:"8px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>+ Übung</button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ═══ HISTORY ═══ */}
      {sub==="history" && (
        <div>
          {/* Exercise Detail View */}
          {detailEx ? (
            <ExerciseDetail exerciseId={detailEx} sLog={sLog} C={C} onClose={()=>setDetailEx(null)} exerciseNotes={exerciseNotes} onEditNote={openNoteEditor} allEx={ALL_EX} />
          ) : sLog.length===0 ? (
            <div style={{textAlign:"center",padding:"60px 20px",color:C.dim,fontSize:14}}>Noch keine Kraft-Workouts</div>
          ) : (
            <>
              {/* ═══ TRAINING CALENDAR — GitHub Contributions Style ═══ */}
              <div style={sty.card}>
                <div style={sty.lbl}>TRAININGSKALENDER</div>
                {(() => {
                  // Build 13 weeks (91 days) of data ending today
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const WEEKS = 13;
                  // Find the Monday of the earliest week
                  const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon
                  const endMon = new Date(today);
                  endMon.setDate(today.getDate() - dayOfWeek);
                  const startMon = new Date(endMon);
                  startMon.setDate(endMon.getDate() - (WEEKS - 1) * 7);

                  // Build lookup: date string → workout info
                  const dayMap = {};
                  sLog.forEach(w => {
                    const d = w.date;
                    if (!dayMap[d]) dayMap[d] = { muscles: new Set(), vol: 0, sessions: 0, exercises: 0 };
                    dayMap[d].sessions++;
                    (w.exercises || []).forEach(ex => {
                      dayMap[d].exercises++;
                      const def = ALL_EX.find(e => e.id === ex.exerciseId);
                      if (def) { dayMap[d].muscles.add(def.m); }
                      dayMap[d].vol += ex.sets.filter(s => s.type !== "W").reduce((a, s) => a + (+s.weight||0) * (+s.reps||0), 0);
                    });
                  });

                  // Build grid: columns = weeks, rows = days (Mon-Sun)
                  const weeks = [];
                  for (let w = 0; w < WEEKS; w++) {
                    const week = [];
                    for (let d = 0; d < 7; d++) {
                      const date = new Date(startMon);
                      date.setDate(startMon.getDate() + w * 7 + d);
                      const ds = date.toISOString().slice(0, 10);
                      const isFuture = date > today;
                      const info = dayMap[ds];
                      week.push({ date: ds, day: date, info, isFuture });
                    }
                    weeks.push(week);
                  }

                  // Color for a day cell
                  const cellColor = (info) => {
                    if (!info) return "rgba(255,255,255,0.03)";
                    const muscles = [...info.muscles];
                    if (muscles.length === 0) return "rgba(255,255,255,0.03)";
                    // Use the dominant muscle group's color
                    const primary = muscles[0];
                    const mg = MG.find(m => m.id === primary);
                    const base = mg?.color || C.ember;
                    // Intensity based on volume
                    const opacity = info.vol > 8000 ? 0.7 : info.vol > 4000 ? 0.5 : info.vol > 1000 ? 0.35 : 0.2;
                    return `${base}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
                  };

                  const dayLabels = ["Mo","","Mi","","Fr","","So"];
                  const SZ = 12; // cell size
                  const GAP = 3;

                  return (
                    <div>
                      <div style={{display:"flex",gap:2}}>
                        {/* Day labels column */}
                        <div style={{display:"flex",flexDirection:"column",gap:GAP,paddingTop:18}}>
                          {dayLabels.map((l, i) => (
                            <div key={i} style={{height:SZ,fontSize:8,color:C.dim,display:"flex",alignItems:"center",width:18,fontWeight:600}}>{l}</div>
                          ))}
                        </div>
                        {/* Week columns */}
                        <div style={{display:"flex",gap:GAP,flex:1,overflowX:"auto"}}>
                          {weeks.map((week, wi) => (
                            <div key={wi} style={{display:"flex",flexDirection:"column",gap:GAP}}>
                              {/* Month label on first Monday of a month */}
                              <div style={{height:14,fontSize:8,color:C.dim,fontWeight:600,display:"flex",alignItems:"flex-end"}}>
                                {week[0].day.getDate() <= 7 ? new Date(week[0].date).toLocaleDateString("de-DE", {month:"short"}) : ""}
                              </div>
                              {week.map((cell, di) => {
                                const isToday = cell.date === new Date().toISOString().slice(0,10);
                                return (
                                  <div key={di} title={cell.info ? `${cell.date}: ${cell.info.exercises} Üb., ${Math.round(cell.info.vol)}kg` : cell.date} style={{
                                    width:SZ,height:SZ,borderRadius:2.5,
                                    background: cell.isFuture ? "transparent" : cellColor(cell.info),
                                    border: isToday ? `1.5px solid ${C.ember}` : cell.isFuture ? "none" : "1px solid rgba(255,255,255,0.02)",
                                    cursor: cell.info ? "pointer" : "default",
                                    transition: "background 0.3s",
                                  }}/>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Legend */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                        <div style={{fontSize:9,color:C.dim}}>{sLog.length} Workouts gesamt</div>
                        <div style={{display:"flex",alignItems:"center",gap:3}}>
                          <span style={{fontSize:8,color:C.dim,marginRight:4}}>Wenig</span>
                          {[0.08, 0.2, 0.35, 0.5, 0.7].map((op, i) => (
                            <div key={i} style={{width:SZ,height:SZ,borderRadius:2.5,background:`${C.ember}${Math.round(op * 255).toString(16).padStart(2,"0")}`}}/>
                          ))}
                          <span style={{fontSize:8,color:C.dim,marginLeft:4}}>Viel</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Exercise selector with tap-to-detail */}
              <div style={sty.card}>
                <div style={sty.lbl}>ÜBUNGSFORTSCHRITT</div>
                <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>
                  {[...new Set(sLog.flatMap(w=>(w.exercises||[]).map(e=>e.exerciseId)))].map(id => {
                    const def = ALL_EX.find(e=>e.id===id);
                    const mg = MG.find(m=>m.id===def?.m);
                    const sessions = sLog.filter(w=>(w.exercises||[]).some(e=>e.exerciseId===id)).length;
                    const allSets = sLog.flatMap(w=>(w.exercises||[]).filter(e=>e.exerciseId===id).flatMap(e=>e.sets.filter(s=>s.type!=="W")));
                    const best = allSets.length ? Math.round(Math.max(...allSets.map(s=>est1RM(s.weight,s.reps)))) : 0;
                    return (
                      <div key={id} onClick={()=>setDetailEx(id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,cursor:"pointer"}}>
                        <div style={{width:6,height:32,borderRadius:3,background:mg?.color||C.dim,flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700}}>{def?.name||id}</div>
                          <div style={{fontSize:11,color:C.muted}}>{sessions}x trainiert</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          {best > 0 && <div style={{fontSize:15,fontWeight:800,color:mg?.color||C.ember}}>{best}<span style={{fontSize:10,color:C.dim}}> 1RM</span></div>}
                        </div>
                        <div style={{color:C.dim,fontSize:14}}>&rsaquo;</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent workouts */}
              <div style={sty.lbl}>LETZTE WORKOUTS</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sLog.slice(0, 15).map((w,i)=>(<div key={w.id||i} style={{background:C.surface,borderRadius:16,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:15,fontWeight:700}}>{new Date(w.date).toLocaleDateString("de-DE",{day:"2-digit",month:"short",year:"2-digit"})}</div>
                    <div style={{fontSize:12,color:C.muted}}>{w.duration||"?"} min &middot; {(w.exercises||[]).length} Üb.</div>
                  </div>
                  {(w.exercises||[]).map((ex,ei)=>{
                    const def=ALL_EX.find(e=>e.id===ex.exerciseId);
                    const vol=ex.sets.filter(s=>s.type!=="W").reduce((s,set)=>s+set.weight*set.reps,0);
                    return (
                      <div key={ei} onClick={()=>setDetailEx(ex.exerciseId)} style={{fontSize:12,color:C.sub,marginBottom:2,cursor:"pointer",padding:"2px 0"}}>
                        <span style={{fontWeight:600}}>{def?.name||ex.exerciseId}</span>
                        <span style={{color:C.muted}}> — {ex.sets.filter(s=>s.type!=="W").map(s=>`${s.weight}x${s.reps}`).join(", ")}</span>
                        <span style={{color:C.dim}}> ({Math.round(vol)}kg)</span>
                        {ex.sessionNote && <div style={{fontSize:11,color:C.sky,fontStyle:"italic",marginTop:1}}>{ex.sessionNote}</div>}
                      </div>
                    );
                  })}
                </div>))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ MUSCLES ═══ */}
      {sub==="muscles" && (
        <div>
          {/* Premium Recovery Panel */}
          <div style={{padding:"14px 0 0"}}>
            <div style={sty.lbl}>MUSKEL-RECOVERY</div>
            <MuscleRecoveryPanel C={C} recMap={recMap} />
          </div>

          {/* Recovery bars — detail view */}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:16}}>
            {MG.map(m=>{const r=recMap[m.id]||0;const col=r>=80?"#5db86a":r>=50?"#d4a24e":"#c9524a";
              return(<div key={m.id} style={{background:C.surface,borderRadius:14,padding:"12px 16px",border:`1px solid ${C.border}`,backdropFilter:"blur(20px)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase"}}>{m.name}</span>
                  <span style={{fontSize:13,fontWeight:700,color:col,fontVariantNumeric:"tabular-nums"}}>{r}%</span>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${r}%`,background:`linear-gradient(90deg, ${col}88, ${col})`,borderRadius:2,transition:"width 1s ease",boxShadow:`0 0 8px ${col}33`}}/></div>
              </div>);
            })}
          </div>

          <div style={{...sty.card,marginTop:16}}>
            <div style={sty.lbl}>VOLUMEN LETZTE 7 TAGE</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MG.filter(m=>weekVol[m.id]>0).map(m=>({name:m.name,vol:Math.round(weekVol[m.id]),fill:m.color}))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
                <XAxis type="number" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:C.sub}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.borderLight}`,borderRadius:10,fontSize:12,fontFamily:"'Manrope',sans-serif",color:C.text}} labelStyle={{color:C.muted}}/>
                <Bar dataKey="vol" name="Volumen (kg)" radius={[0,5,5,0]}>{MG.filter(m=>weekVol[m.id]>0).map((m,i)=><Cell key={i} fill={m.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ═══ AI WEAKNESS ANALYSIS ═══ */}
          <div style={{marginTop:16}}>
            <button onClick={generateWeaknessAnalysis} disabled={aiWeaknessLoading}
              style={{width:"100%",padding:"14px 0",background:aiWeaknessLoading?"transparent":`linear-gradient(135deg, ${C.ember}18, ${C.violet}18)`,border:`1px solid ${C.accentBorder}`,borderRadius:14,cursor:aiWeaknessLoading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <span style={{fontSize:16}}>{aiWeaknessLoading ? "⏳" : "🧠"}</span>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:C.ember}}>{aiWeaknessLoading ? "Analysiere..." : "AI Schwachstellen-Analyse"}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>Letzte 4 Wochen · Volumen · Balance</div>
              </div>
            </button>

            {aiWeakness && (
              <div style={{marginTop:12}}>
                {/* Headline */}
                <div style={{background:C.emberBg,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.accentBorder}`,marginBottom:12}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:C.ember,marginBottom:4}}>ERGEBNIS</div>
                  <div style={{fontSize:16,fontWeight:800,color:C.text}}>{aiWeakness.headline}</div>
                </div>

                {/* Weaknesses */}
                {(aiWeakness.weaknesses || []).map((w, i) => {
                  const sevColors = {high: "#c9524a", medium: C.gold, low: C.sky};
                  const sevLabels = {high: "HOCH", medium: "MITTEL", low: "GERING"};
                  const col = sevColors[w.severity] || C.muted;
                  return (
                    <div key={i} style={{background:C.surface,borderRadius:14,padding:"12px 16px",marginBottom:8,border:`1px solid ${C.border}`,borderLeft:`4px solid ${col}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontSize:14,fontWeight:800,color:C.text}}>{w.muscle}</span>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:col,background:`${col}15`,padding:"3px 8px",borderRadius:6}}>{sevLabels[w.severity] || w.severity}</span>
                      </div>
                      <div style={{fontSize:12,color:C.sub,lineHeight:1.5,marginBottom:6}}>{w.issue}</div>
                      <div style={{fontSize:12,color:C.lime,lineHeight:1.5,background:C.limeBg,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.lime}20`}}>
                        <span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,display:"block",marginBottom:3}}>EMPFEHLUNG</span>
                        {w.fix}
                      </div>
                    </div>
                  );
                })}

                {/* Imbalances */}
                {(aiWeakness.imbalances || []).length > 0 && (
                  <div style={{marginTop:8}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:C.violet,marginBottom:8,paddingLeft:4}}>DYSBALANCEN</div>
                    {aiWeakness.imbalances.map((imb, i) => (
                      <div key={i} style={{background:C.surface,borderRadius:14,padding:"12px 16px",marginBottom:8,border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.violet}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:13,fontWeight:700,color:C.text}}>{imb.pair}</span>
                          <span style={{fontSize:12,fontWeight:800,color:C.violet,fontVariantNumeric:"tabular-nums"}}>{imb.ratio}</span>
                        </div>
                        <div style={{fontSize:12,color:C.sub,lineHeight:1.5}}>{imb.recommendation}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Overall */}
                {aiWeakness.overall && (
                  <div style={{background:"rgba(196,149,106,0.06)",borderRadius:14,padding:"14px 16px",marginTop:8,border:`1px solid ${C.accentBorder}`}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:C.ember,marginBottom:4}}>FAZIT</div>
                    <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{aiWeakness.overall}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ AI COACH CHAT ═══ */}
      {sub==="coach" && (
        <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 260px)",maxHeight:"calc(100vh - 260px)"}}>
          {/* Chat header */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px 16px",background:C.emberBg,borderRadius:16,border:`1px solid ${C.accentBorder}`}}>
            <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg, ${C.ember}, #a87a52)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🧠</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:C.text,fontFamily:"'Cormorant Garamond',serif",letterSpacing:1,textTransform:"uppercase"}}>AI Coach</div>
              <div style={{fontSize:11,color:C.sub}}>Dein persönlicher Trainingsberater</div>
            </div>
            {chatMessages.length > 0 && (
              <button onClick={()=>setChatMessages([])} style={{padding:"6px 12px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:10,fontWeight:600,cursor:"pointer",letterSpacing:1,textTransform:"uppercase"}}>Reset</button>
            )}
          </div>

          {/* Chat messages area */}
          <div style={{flex:1,overflowY:"auto",marginBottom:12,padding:"0 2px",WebkitOverflowScrolling:"touch"}}>
            {chatMessages.length === 0 && !chatLoading && (
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{fontSize:42,marginBottom:12}}>💬</div>
                <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>Frag deinen Coach!</div>
                <div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:24}}>
                  Der Coach kennt dein komplettes Trainingslog, Recovery-Status,{"\n"}Split und PRs — frag ihn alles rund ums Training.
                </div>
                {/* Quick prompts */}
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    "Was soll ich heute trainieren?",
                    "Wie breche ich mein Bench-Plateau?",
                    "Wie sieht mein Volumen diese Woche aus?",
                    "Welche Muskeln vernachlässige ich?",
                  ].map((q, i) => (
                    <button key={i} onClick={()=>{setChatInput(q);setTimeout(()=>{const el=chatInputRef.current;if(el)el.focus();},50)}}
                      style={{padding:"10px 16px",background:C.card,border:`1px solid ${C.borderLight}`,borderRadius:12,color:C.sub,fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ember;e.currentTarget.style.color=C.text}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.borderLight;e.currentTarget.style.color=C.sub}}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
                <div style={{
                  maxWidth:"85%",
                  padding:"10px 14px",
                  borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  background:msg.role==="user"?`linear-gradient(135deg, ${C.ember}, #a87a52)`:C.surface,
                  color:msg.role==="user"?"#0a0a0f":C.text,
                  border:msg.role==="user"?"none":`1px solid ${C.border}`,
                  fontSize:13,
                  lineHeight:1.6,
                  whiteSpace:"pre-wrap",
                  wordBreak:"break-word",
                  fontWeight:msg.role==="user"?600:400,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={{display:"flex",justifyContent:"flex-start",marginBottom:10}}>
                <div style={{padding:"12px 18px",borderRadius:"16px 16px 16px 4px",background:C.surface,border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{width:7,height:7,borderRadius:"50%",background:C.ember,opacity:0.5,animation:`pulse 1.2s ease-in-out ${d*0.2}s infinite`}} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div style={{display:"flex",gap:8,alignItems:"flex-end",padding:"8px 0 4px",borderTop:`1px solid ${C.border}`}}>
            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={e=>{setChatInput(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"}}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChatMessage()}}}
              placeholder="Frag deinen Coach..."
              rows={1}
              style={{
                flex:1,padding:"12px 16px",background:C.card,border:`1px solid ${C.borderLight}`,borderRadius:14,
                color:C.text,fontSize:14,fontFamily:"'Manrope',sans-serif",resize:"none",outline:"none",
                lineHeight:1.5,maxHeight:120,
              }}
              onFocus={e=>e.target.style.borderColor=C.ember}
              onBlur={e=>e.target.style.borderColor=C.borderLight}
            />
            <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
              style={{
                width:44,height:44,borderRadius:12,border:"none",cursor:chatLoading||!chatInput.trim()?"default":"pointer",
                background:chatInput.trim()&&!chatLoading?`linear-gradient(135deg, ${C.ember}, #a87a52)`:C.card,
                color:chatInput.trim()&&!chatLoading?"#0a0a0f":C.dim,
                fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                transition:"all 0.2s",
              }}>↑</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export { EX, MG, est1RM };
