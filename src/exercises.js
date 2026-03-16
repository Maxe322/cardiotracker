// ═══ MUSCLE GROUPS ═══
export const MUSCLE_GROUPS = [
  { id:"chest", name:"Brust", color:"#E8553A" },
  { id:"back", name:"Rücken", color:"#4AABDD" },
  { id:"shoulders", name:"Schultern", color:"#D4A024" },
  { id:"biceps", name:"Bizeps", color:"#8BC34A" },
  { id:"triceps", name:"Trizeps", color:"#9C7BF2" },
  { id:"quads", name:"Quadrizeps", color:"#E05880" },
  { id:"hamstrings", name:"Beinbeuger", color:"#FF9F0A" },
  { id:"glutes", name:"Glutes", color:"#64D2FF" },
  { id:"calves", name:"Waden", color:"#BF5AF2" },
  { id:"core", name:"Core", color:"#FF6B35" },
  { id:"forearms", name:"Unterarme", color:"#98D4BB" },
  { id:"traps", name:"Trapez", color:"#C7A87C" },
];

// ═══ 70+ EXERCISES ═══
export const EXERCISES = [
  // CHEST
  { id:"bench_bb", name:"Bankdrücken (LH)", muscle:"chest", secondary:["triceps","shoulders"], increment:2.5 },
  { id:"bench_db", name:"Bankdrücken (KH)", muscle:"chest", secondary:["triceps","shoulders"], increment:2.5 },
  { id:"incline_bb", name:"Schrägbank (LH)", muscle:"chest", secondary:["shoulders","triceps"], increment:2.5 },
  { id:"incline_db", name:"Schrägbank (KH)", muscle:"chest", secondary:["shoulders","triceps"], increment:2.5 },
  { id:"decline_bench", name:"Negativ-Bankdrücken", muscle:"chest", secondary:["triceps"], increment:2.5 },
  { id:"chest_fly_db", name:"Flys (KH)", muscle:"chest", secondary:[], increment:2.5 },
  { id:"chest_fly_cable", name:"Cable Flys", muscle:"chest", secondary:[], increment:2.5 },
  { id:"chest_press_machine", name:"Brustpresse (Maschine)", muscle:"chest", secondary:["triceps"], increment:5 },
  { id:"dips", name:"Dips", muscle:"chest", secondary:["triceps","shoulders"], increment:5 },
  { id:"pushup", name:"Liegestütze", muscle:"chest", secondary:["triceps","core"], increment:0, bw:true },

  // BACK
  { id:"deadlift", name:"Kreuzheben", muscle:"back", secondary:["hamstrings","glutes","core","traps"], increment:2.5 },
  { id:"row_bb", name:"Langhantelrudern", muscle:"back", secondary:["biceps","traps"], increment:2.5 },
  { id:"row_db", name:"Kurzhantelrudern", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"pullup", name:"Klimmzüge", muscle:"back", secondary:["biceps","forearms"], increment:0, bw:true },
  { id:"chinup", name:"Chinups", muscle:"back", secondary:["biceps"], increment:0, bw:true },
  { id:"lat_pull", name:"Latzug", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"lat_pull_close", name:"Latzug eng", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"cable_row", name:"Kabelrudern", muscle:"back", secondary:["biceps","traps"], increment:2.5 },
  { id:"t_bar_row", name:"T-Bar Rudern", muscle:"back", secondary:["biceps","traps"], increment:2.5 },
  { id:"chest_supported_row", name:"Chest-Supported Row", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"pullover", name:"Pullover", muscle:"back", secondary:["chest"], increment:2.5 },

  // SHOULDERS
  { id:"ohp_bb", name:"Schulterdrücken (LH)", muscle:"shoulders", secondary:["triceps","traps"], increment:2.5 },
  { id:"ohp_db", name:"Schulterdrücken (KH)", muscle:"shoulders", secondary:["triceps"], increment:2.5 },
  { id:"arnold_press", name:"Arnold Press", muscle:"shoulders", secondary:["triceps"], increment:2.5 },
  { id:"lat_raise_db", name:"Seitheben (KH)", muscle:"shoulders", secondary:[], increment:1 },
  { id:"lat_raise_cable", name:"Seitheben (Kabel)", muscle:"shoulders", secondary:[], increment:1 },
  { id:"front_raise", name:"Frontheben", muscle:"shoulders", secondary:[], increment:1 },
  { id:"face_pull", name:"Face Pulls", muscle:"shoulders", secondary:["traps","back"], increment:2.5 },
  { id:"rear_delt_fly", name:"Reverse Flys", muscle:"shoulders", secondary:["traps"], increment:1 },
  { id:"upright_row", name:"Aufrechtes Rudern", muscle:"shoulders", secondary:["traps","biceps"], increment:2.5 },
  { id:"shrugs", name:"Shrugs", muscle:"traps", secondary:["shoulders"], increment:5 },

  // BICEPS
  { id:"curl_bb", name:"Bizeps Curls (LH)", muscle:"biceps", secondary:["forearms"], increment:2.5 },
  { id:"curl_db", name:"Bizeps Curls (KH)", muscle:"biceps", secondary:[], increment:2.5 },
  { id:"hammer_curl", name:"Hammer Curls", muscle:"biceps", secondary:["forearms"], increment:2.5 },
  { id:"incline_curl", name:"Incline Curls", muscle:"biceps", secondary:[], increment:2.5 },
  { id:"preacher_curl", name:"Preacher Curls", muscle:"biceps", secondary:[], increment:2.5 },
  { id:"cable_curl", name:"Kabel Curls", muscle:"biceps", secondary:[], increment:2.5 },
  { id:"concentration_curl", name:"Konzentrations-Curls", muscle:"biceps", secondary:[], increment:1 },

  // TRICEPS
  { id:"tricep_pushdown", name:"Trizepsdrücken (Kabel)", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"skull_crush", name:"Skull Crushers", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"overhead_ext_db", name:"Overhead Extension (KH)", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"overhead_ext_cable", name:"Overhead Extension (Kabel)", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"close_grip_bench", name:"Enges Bankdrücken", muscle:"triceps", secondary:["chest"], increment:2.5 },
  { id:"kickback", name:"Kickbacks", muscle:"triceps", secondary:[], increment:1 },
  { id:"dip_tricep", name:"Trizeps Dips", muscle:"triceps", secondary:["chest"], increment:0, bw:true },

  // QUADS
  { id:"squat_bb", name:"Kniebeugen (LH)", muscle:"quads", secondary:["glutes","core"], increment:2.5 },
  { id:"front_squat", name:"Frontkniebeugen", muscle:"quads", secondary:["core","glutes"], increment:2.5 },
  { id:"leg_press", name:"Beinpresse", muscle:"quads", secondary:["glutes"], increment:5 },
  { id:"hack_squat", name:"Hack Squat", muscle:"quads", secondary:["glutes"], increment:5 },
  { id:"leg_ext", name:"Beinstrecker", muscle:"quads", secondary:[], increment:2.5 },
  { id:"goblet_squat", name:"Goblet Squat", muscle:"quads", secondary:["glutes","core"], increment:2.5 },
  { id:"lunge_db", name:"Ausfallschritte (KH)", muscle:"quads", secondary:["glutes","hamstrings"], increment:2.5 },
  { id:"bulgarian_split", name:"Bulgarian Split Squat", muscle:"quads", secondary:["glutes"], increment:2.5 },
  { id:"step_up", name:"Step-Ups", muscle:"quads", secondary:["glutes"], increment:2.5 },

  // HAMSTRINGS
  { id:"rdl", name:"Rumänisches Kreuzheben", muscle:"hamstrings", secondary:["glutes","back"], increment:2.5 },
  { id:"leg_curl_lying", name:"Beinbeuger (liegend)", muscle:"hamstrings", secondary:[], increment:2.5 },
  { id:"leg_curl_seated", name:"Beinbeuger (sitzend)", muscle:"hamstrings", secondary:[], increment:2.5 },
  { id:"good_morning", name:"Good Mornings", muscle:"hamstrings", secondary:["back","glutes"], increment:2.5 },
  { id:"nordic_curl", name:"Nordic Curls", muscle:"hamstrings", secondary:[], increment:0, bw:true },

  // GLUTES
  { id:"hip_thrust_bb", name:"Hip Thrust (LH)", muscle:"glutes", secondary:["hamstrings"], increment:5 },
  { id:"hip_thrust_machine", name:"Hip Thrust (Maschine)", muscle:"glutes", secondary:["hamstrings"], increment:5 },
  { id:"cable_kickback", name:"Cable Kickbacks", muscle:"glutes", secondary:[], increment:2.5 },
  { id:"glute_bridge", name:"Glute Bridge", muscle:"glutes", secondary:["hamstrings"], increment:5 },

  // CALVES
  { id:"calf_raise_standing", name:"Wadenheben (stehend)", muscle:"calves", secondary:[], increment:5 },
  { id:"calf_raise_seated", name:"Wadenheben (sitzend)", muscle:"calves", secondary:[], increment:5 },

  // CORE
  { id:"plank", name:"Plank", muscle:"core", secondary:[], increment:0, timed:true },
  { id:"crunch", name:"Crunches", muscle:"core", secondary:[], increment:0, bw:true },
  { id:"cable_crunch", name:"Kabel-Crunches", muscle:"core", secondary:[], increment:2.5 },
  { id:"hanging_leg_raise", name:"Hanging Leg Raise", muscle:"core", secondary:[], increment:0, bw:true },
  { id:"ab_wheel", name:"Ab Wheel Rollout", muscle:"core", secondary:[], increment:0, bw:true },
  { id:"russian_twist", name:"Russian Twist", muscle:"core", secondary:[], increment:2.5 },
  { id:"woodchop", name:"Woodchops (Kabel)", muscle:"core", secondary:[], increment:2.5 },
  { id:"dead_bug", name:"Dead Bug", muscle:"core", secondary:[], increment:0, bw:true },

  // FOREARMS
  { id:"wrist_curl", name:"Handgelenk-Curls", muscle:"forearms", secondary:[], increment:1 },
  { id:"reverse_curl", name:"Reverse Curls", muscle:"forearms", secondary:["biceps"], increment:2.5 },
  { id:"farmers_walk", name:"Farmer's Walk", muscle:"forearms", secondary:["traps","core"], increment:5 },
];

// ═══ SPLIT TEMPLATES ═══
export const SPLIT_TEMPLATES = [
  {
    id: "ppl", name: "Push / Pull / Legs", desc: "Klassischer 3er-Split. 3-6x pro Woche.",
    days: [
      { name: "Push", exercises: ["bench_bb","incline_db","chest_fly_cable","ohp_db","lat_raise_db","tricep_pushdown","overhead_ext_cable"] },
      { name: "Pull", exercises: ["deadlift","row_bb","lat_pull","cable_row","face_pull","curl_bb","hammer_curl"] },
      { name: "Legs", exercises: ["squat_bb","leg_press","rdl","leg_ext","leg_curl_lying","calf_raise_standing","cable_crunch"] },
    ]
  },
  {
    id: "upper_lower", name: "Oberkörper / Unterkörper", desc: "4er-Split. Ideal für 4x pro Woche.",
    days: [
      { name: "Oberkörper A", exercises: ["bench_bb","row_bb","ohp_db","lat_pull","chest_fly_cable","curl_db","tricep_pushdown"] },
      { name: "Unterkörper A", exercises: ["squat_bb","rdl","leg_press","leg_curl_lying","calf_raise_standing","cable_crunch"] },
      { name: "Oberkörper B", exercises: ["incline_db","cable_row","arnold_press","pullup","rear_delt_fly","hammer_curl","skull_crush"] },
      { name: "Unterkörper B", exercises: ["front_squat","hip_thrust_bb","bulgarian_split","leg_ext","leg_curl_seated","calf_raise_seated","hanging_leg_raise"] },
    ]
  },
  {
    id: "bro", name: "Bro-Split (5-Tage)", desc: "Jede Muskelgruppe 1x pro Woche, hohes Volumen.",
    days: [
      { name: "Brust", exercises: ["bench_bb","incline_db","chest_fly_cable","dips","chest_press_machine"] },
      { name: "Rücken", exercises: ["deadlift","row_bb","lat_pull","cable_row","pullover","face_pull"] },
      { name: "Schultern", exercises: ["ohp_bb","lat_raise_db","front_raise","rear_delt_fly","shrugs","upright_row"] },
      { name: "Beine", exercises: ["squat_bb","leg_press","rdl","leg_ext","leg_curl_lying","calf_raise_standing"] },
      { name: "Arme", exercises: ["curl_bb","hammer_curl","preacher_curl","tricep_pushdown","skull_crush","overhead_ext_db"] },
    ]
  },
  {
    id: "full", name: "Ganzkörper", desc: "3x pro Woche. Ideal für Anfänger.",
    days: [
      { name: "Ganzkörper A", exercises: ["squat_bb","bench_bb","row_bb","ohp_db","curl_db","tricep_pushdown","plank"] },
      { name: "Ganzkörper B", exercises: ["deadlift","incline_db","lat_pull","leg_press","lat_raise_db","hammer_curl","cable_crunch"] },
      { name: "Ganzkörper C", exercises: ["front_squat","bench_db","cable_row","hip_thrust_bb","face_pull","curl_bb","skull_crush"] },
    ]
  },
];

// ═══ HELPER FUNCTIONS ═══
export function suggestWeight(exerciseId, prevSets, goalReps = [8, 12]) {
  if (!prevSets?.length) return null;
  const ex = EXERCISES.find(e => e.id === exerciseId);
  if (!ex || ex.bw || ex.timed) return null;
  const lastWeight = prevSets[0]?.weight || 0;
  if (lastWeight === 0) return null;
  const allHitUpper = prevSets.every(s => s.reps >= goalReps[1]);
  const anyBelowLower = prevSets.some(s => s.reps < goalReps[0]);
  if (allHitUpper) return { weight: lastWeight + ex.increment, reason: `Alle Sätze ${goalReps[1]}+ Reps → +${ex.increment} kg` };
  if (anyBelowLower) return { weight: lastWeight, reason: `Noch nicht im Zielbereich → Gewicht halten` };
  return { weight: lastWeight, reason: `Weiter mit ${lastWeight} kg, Reps steigern` };
}

export function est1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)) * 10) / 10;
}

export function muscleRecovery(muscle, workoutLog) {
  const now = Date.now();
  let lastTrained = 0;
  for (const w of workoutLog) {
    for (const ex of w.exercises) {
      const exDef = EXERCISES.find(e => e.id === ex.exerciseId);
      if (exDef && (exDef.muscle === muscle || exDef.secondary?.includes(muscle))) {
        const d = new Date(w.date).getTime();
        if (d > lastTrained) lastTrained = d;
      }
    }
  }
  if (!lastTrained) return 100;
  const daysSince = (now - lastTrained) / (1000 * 60 * 60 * 24);
  return Math.min(100, Math.round(daysSince / 3 * 100));
}
