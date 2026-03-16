import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const MG = [
  { id:"chest", name:"Brust", color:"#E8553A" },
  { id:"back", name:"Rücken", color:"#4AABDD" },
  { id:"shoulders", name:"Schultern", color:"#D4A024" },
  { id:"biceps", name:"Bizeps", color:"#8BC34A" },
  { id:"triceps", name:"Trizeps", color:"#9C7BF2" },
  { id:"quads", name:"Quadrizeps", color:"#E05880" },
  { id:"hams", name:"Beinbeuger", color:"#FF9F0A" },
  { id:"glutes", name:"Glutes", color:"#64D2FF" },
  { id:"calves", name:"Waden", color:"#BF5AF2" },
  { id:"core", name:"Core", color:"#FF375F" },
  { id:"forearms", name:"Unterarme", color:"#AC8E68" },
  { id:"traps", name:"Trapez", color:"#30D158" },
];

const EX = [
  // ═══ CHEST ═══
  { id:"bench_bb", name:"Bankdrücken (LH)", m:"chest", s:["triceps","shoulders"], inc:2.5 },
  { id:"bench_db", name:"Bankdrücken (KH)", m:"chest", s:["triceps","shoulders"], inc:2 },
  { id:"incline_bb", name:"Schrägbankdrücken (LH)", m:"chest", s:["shoulders","triceps"], inc:2.5 },
  { id:"incline_db", name:"Schrägbankdrücken (KH)", m:"chest", s:["shoulders","triceps"], inc:2 },
  { id:"decline_bb", name:"Decline Bench (LH)", m:"chest", s:["triceps"], inc:2.5 },
  { id:"chest_press_machine", name:"Brustpresse (Maschine)", m:"chest", s:["triceps","shoulders"], inc:2.5 },
  { id:"chest_fly_db", name:"Flys (KH)", m:"chest", s:[], inc:2 },
  { id:"chest_fly_cable", name:"Cable Flys", m:"chest", s:[], inc:2.5 },
  { id:"chest_fly_machine", name:"Butterfly (Maschine)", m:"chest", s:[], inc:2.5 },
  { id:"pec_deck", name:"Pec Deck", m:"chest", s:[], inc:2.5 },
  { id:"dips", name:"Dips", m:"chest", s:["triceps","shoulders"], inc:5, bw:true },
  { id:"pushup", name:"Liegestütze", m:"chest", s:["triceps"], inc:0, bw:true },
  // ═══ BACK ═══
  { id:"deadlift", name:"Kreuzheben", m:"back", s:["hams","glutes","core","traps"], inc:2.5 },
  { id:"row_bb", name:"Langhantelrudern", m:"back", s:["biceps","traps"], inc:2.5 },
  { id:"row_db", name:"KH-Rudern einarmig", m:"back", s:["biceps"], inc:2 },
  { id:"row_machine", name:"Rudern (Maschine eng)", m:"back", s:["biceps"], inc:2.5 },
  { id:"row_machine_single", name:"Rudern einarmig (Maschine)", m:"back", s:["biceps"], inc:2.5 },
  { id:"pullup", name:"Klimmzüge", m:"back", s:["biceps"], inc:0, bw:true },
  { id:"chinup", name:"Chin-Ups", m:"back", s:["biceps"], inc:0, bw:true },
  { id:"lat_pull_wide", name:"Latzug breit", m:"back", s:["biceps"], inc:2.5 },
  { id:"lat_pull_close", name:"Latzug eng", m:"back", s:["biceps"], inc:2.5 },
  { id:"cable_row", name:"Kabelrudern sitzend", m:"back", s:["biceps","traps"], inc:2.5 },
  { id:"tbar_row", name:"T-Bar Rudern", m:"back", s:["biceps","traps"], inc:2.5 },
  { id:"pullover", name:"Pullover", m:"back", s:["chest"], inc:2 },
  { id:"hyperext", name:"Hyperextensions", m:"back", s:["glutes","hams"], inc:5, bw:true },
  // ═══ SHOULDERS ═══
  { id:"ohp_smith", name:"Schulterdrücken (Smith Machine)", m:"shoulders", s:["triceps","traps"], inc:2.5 },
  { id:"ohp_bb", name:"Schulterdrücken (LH)", m:"shoulders", s:["triceps","traps"], inc:2.5 },
  { id:"ohp_db", name:"Schulterdrücken (KH) sitzend", m:"shoulders", s:["triceps"], inc:2 },
  { id:"ohp_machine", name:"Schulterdrücken (Maschine)", m:"shoulders", s:["triceps"], inc:2.5 },
  { id:"lat_raise_db", name:"Seitheben (KH)", m:"shoulders", s:[], inc:1 },
  { id:"lat_raise_cable", name:"Seitheben (Kabel)", m:"shoulders", s:[], inc:1 },
  { id:"lat_raise_lean", name:"Seitheben angelehnt (Bank)", m:"shoulders", s:[], inc:1 },
  { id:"front_raise", name:"Frontheben", m:"shoulders", s:[], inc:1 },
  { id:"face_pull", name:"Face Pulls", m:"shoulders", s:["back","traps"], inc:2.5 },
  { id:"rear_delt_cable", name:"Reverse Flys (Kabel/Seil)", m:"shoulders", s:["back"], inc:1 },
  { id:"rear_delt_machine", name:"Reverse Flys (Maschine)", m:"shoulders", s:["back"], inc:2.5 },
  { id:"upright_row", name:"Aufrechtes Rudern", m:"shoulders", s:["traps"], inc:2.5 },
  { id:"arnold_press", name:"Arnold Press", m:"shoulders", s:["triceps"], inc:2 },
  { id:"shrugs_db", name:"Shrugs (KH)", m:"traps", s:["shoulders"], inc:5 },
  { id:"shrugs_bb", name:"Shrugs (LH)", m:"traps", s:["shoulders"], inc:5 },
  // ═══ BICEPS ═══
  { id:"curl_bb", name:"Langhantel-Curls", m:"biceps", s:[], inc:2.5 },
  { id:"curl_db", name:"KH-Curls", m:"biceps", s:[], inc:2 },
  { id:"curl_ez", name:"SZ-Curls", m:"biceps", s:[], inc:2.5 },
  { id:"hammer_curl", name:"Hammer Curls", m:"biceps", s:["forearms"], inc:2 },
  { id:"preacher_curl", name:"Preacher Curls (Sitzbank)", m:"biceps", s:[], inc:2 },
  { id:"preacher_machine", name:"Bizeps (Maschine/Curl-Sitz)", m:"biceps", s:[], inc:2.5 },
  { id:"incline_curl", name:"Incline Curls", m:"biceps", s:[], inc:2 },
  { id:"cable_curl", name:"Bizeps Curls (Kabel)", m:"biceps", s:[], inc:2.5 },
  { id:"conc_curl", name:"Concentration Curls", m:"biceps", s:[], inc:1 },
  { id:"spider_curl", name:"Spider Curls", m:"biceps", s:[], inc:2 },
  // ═══ TRICEPS ═══
  { id:"tri_pushdown_rope", name:"Trizepsdrücken (Seil)", m:"triceps", s:[], inc:2.5 },
  { id:"tri_pushdown_bar", name:"Trizepsdrücken (Stange)", m:"triceps", s:[], inc:2.5 },
  { id:"tri_pushdown_single", name:"Trizepsdrücken einarmig (Kabel)", m:"triceps", s:[], inc:1 },
  { id:"tri_overhead_db", name:"Overhead Extension (KH)", m:"triceps", s:[], inc:2 },
  { id:"tri_overhead_cable", name:"Overhead Extension (Kabel)", m:"triceps", s:[], inc:2.5 },
  { id:"skull_crush", name:"Skull Crushers", m:"triceps", s:[], inc:2 },
  { id:"tri_dip", name:"Trizeps-Dips", m:"triceps", s:["chest"], inc:0, bw:true },
  { id:"tri_kickback", name:"Kickbacks", m:"triceps", s:[], inc:1 },
  { id:"close_grip_bench", name:"Enges Bankdrücken", m:"triceps", s:["chest"], inc:2.5 },
  // ═══ QUADS ═══
  { id:"squat_bb", name:"Kniebeugen (LH)", m:"quads", s:["glutes","core"], inc:2.5 },
  { id:"squat_front", name:"Front Squats", m:"quads", s:["core","glutes"], inc:2.5 },
  { id:"squat_smith", name:"Kniebeugen (Smith Machine)", m:"quads", s:["glutes"], inc:2.5 },
  { id:"leg_press", name:"Beinpresse", m:"quads", s:["glutes"], inc:5 },
  { id:"leg_ext", name:"Beinstrecker", m:"quads", s:[], inc:2.5 },
  { id:"lunge_db", name:"Ausfallschritte (KH)", m:"quads", s:["glutes","hams"], inc:2 },
  { id:"bulgarian", name:"Bulgarian Split Squats", m:"quads", s:["glutes"], inc:2 },
  { id:"hack_squat", name:"Hack Squat", m:"quads", s:["glutes"], inc:5 },
  { id:"goblet_squat", name:"Goblet Squat", m:"quads", s:["core","glutes"], inc:2 },
  // ═══ HAMSTRINGS ═══
  { id:"rdl", name:"Rumänisches Kreuzheben", m:"hams", s:["back","glutes"], inc:2.5 },
  { id:"leg_curl_lying", name:"Beinbeuger liegend", m:"hams", s:[], inc:2.5 },
  { id:"leg_curl_seated", name:"Beinbeuger sitzend", m:"hams", s:[], inc:2.5 },
  { id:"good_morning", name:"Good Mornings", m:"hams", s:["back","glutes"], inc:2.5 },
  { id:"stiff_leg_dl", name:"Gestrecktes Kreuzheben", m:"hams", s:["back","glutes"], inc:2.5 },
  // ═══ GLUTES ═══
  { id:"hip_thrust", name:"Hip Thrust", m:"glutes", s:["hams"], inc:5 },
  { id:"glute_bridge", name:"Glute Bridge", m:"glutes", s:["hams"], inc:5 },
  { id:"cable_kickback", name:"Cable Kickbacks", m:"glutes", s:[], inc:2.5 },
  // ═══ CALVES ═══
  { id:"calf_raise_stand", name:"Wadenheben stehend", m:"calves", s:[], inc:5 },
  { id:"calf_raise_seated", name:"Wadenheben sitzend", m:"calves", s:[], inc:5 },
  // ═══ CORE ═══
  { id:"plank", name:"Plank", m:"core", s:[], inc:0, timed:true },
  { id:"crunch", name:"Crunches", m:"core", s:[], inc:0, bw:true },
  { id:"crunch_machine", name:"Bauchpresse (Maschine)", m:"core", s:[], inc:2.5 },
  { id:"cable_crunch", name:"Kabel-Crunches", m:"core", s:[], inc:2.5 },
  { id:"hanging_leg", name:"Hanging Leg Raises", m:"core", s:[], inc:0, bw:true },
  { id:"ab_wheel", name:"Ab Wheel Rollout", m:"core", s:[], inc:0, bw:true },
  { id:"russian_twist", name:"Russian Twists", m:"core", s:[], inc:2 },
  { id:"woodchop", name:"Woodchops (Kabel)", m:"core", s:["shoulders"], inc:2.5 },
  { id:"situp", name:"Sit-Ups", m:"core", s:[], inc:0, bw:true },
  { id:"decline_crunch", name:"Decline Crunches", m:"core", s:[], inc:0, bw:true },
  // ═══ FOREARMS ═══
  { id:"wrist_curl", name:"Wrist Curls", m:"forearms", s:[], inc:1 },
  { id:"reverse_curl", name:"Reverse Curls", m:"forearms", s:["biceps"], inc:2 },
  { id:"farmer_walk", name:"Farmer Walks", m:"forearms", s:["traps","core"], inc:5 },
  { id:"plate_pinch", name:"Plate Pinch Hold", m:"forearms", s:[], inc:0, timed:true },
];

// Preset training day templates
const SPLIT_PRESETS = {
  max: { name: "Mein Split (5+1 Tage)", days: [
    { name:"Brust + Trizeps", exercises:["chest_fly_cable","chest_fly_machine","chest_press_machine","incline_db","tri_pushdown_single","tri_pushdown_rope","tri_overhead_db"] },
    { name:"Rücken + Bizeps", exercises:["lat_pull_wide","lat_pull_close","row_machine","pullup","row_machine_single","preacher_machine","cable_curl"] },
    { name:"Schultern", exercises:["lat_raise_db","lat_raise_cable","lat_raise_lean","ohp_smith","ohp_machine","ohp_db","rear_delt_cable"] },
    { name:"Beine + Bauch", exercises:["leg_ext","leg_curl_seated","leg_press","squat_bb","crunch_machine","cable_crunch","hanging_leg"] },
    { name:"Arme + Unterarme", exercises:["curl_bb","hammer_curl","cable_curl","preacher_machine","tri_pushdown_rope","tri_overhead_db","reverse_curl","wrist_curl","farmer_walk"] },
  ]},
  ppl: { name: "Push / Pull / Legs", days: [
    { name:"Push", exercises:["bench_bb","incline_db","chest_fly_cable","ohp_db","lat_raise_db","tri_pushdown_rope","skull_crush"] },
    { name:"Pull", exercises:["deadlift","row_bb","lat_pull_wide","cable_row","face_pull","curl_bb","hammer_curl"] },
    { name:"Legs", exercises:["squat_bb","leg_press","rdl","leg_ext","leg_curl_seated","calf_raise_stand","hip_thrust"] },
  ]},
  ul: { name: "Upper / Lower", days: [
    { name:"Upper", exercises:["bench_bb","row_bb","ohp_db","lat_pull_wide","incline_db","curl_db","tri_pushdown_rope","lat_raise_db"] },
    { name:"Lower", exercises:["squat_bb","rdl","leg_press","leg_curl_seated","hip_thrust","calf_raise_stand","crunch_machine"] },
  ]},
  bro: { name: "Bro Split (5-Tage)", days: [
    { name:"Brust", exercises:["bench_bb","incline_db","chest_fly_cable","chest_press_machine","dips"] },
    { name:"Rücken", exercises:["deadlift","row_bb","lat_pull_wide","cable_row","pullup","hyperext"] },
    { name:"Schultern", exercises:["ohp_bb","lat_raise_db","lat_raise_cable","rear_delt_cable","face_pull","shrugs_db"] },
    { name:"Arme", exercises:["curl_bb","hammer_curl","preacher_machine","tri_pushdown_rope","skull_crush","tri_overhead_db"] },
    { name:"Beine", exercises:["squat_bb","leg_press","rdl","leg_ext","leg_curl_seated","calf_raise_stand","hip_thrust"] },
  ]},
  fb: { name: "Ganzkörper (3x)", days: [
    { name:"Ganzkörper A", exercises:["squat_bb","bench_bb","row_bb","ohp_db","curl_db","crunch_machine"] },
    { name:"Ganzkörper B", exercises:["deadlift","incline_db","lat_pull_wide","lat_raise_db","hammer_curl","hanging_leg"] },
    { name:"Ganzkörper C", exercises:["leg_press","chest_fly_cable","cable_row","face_pull","tri_pushdown_rope","hip_thrust"] },
  ]},
};

function suggestWeight(exerciseId, prevSets, goalReps=[8,12]) {
  if (!prevSets?.length) return null;
  const ex = EX.find(e => e.id === exerciseId);
  if (!ex || ex.bw || ex.timed) return null;
  const lw = prevSets[0]?.weight || 0;
  if (lw === 0) return null;
  const allHit = prevSets.every(s => s.reps >= goalReps[1]);
  const anyBelow = prevSets.some(s => s.reps < goalReps[0]);
  if (allHit) return { weight: lw + ex.inc, reason: `Alle Sätze ${goalReps[1]}+ Reps \u2192 +${ex.inc} kg` };
  if (anyBelow) return { weight: lw, reason: `Noch nicht im Zielbereich \u2192 Gewicht halten` };
  return { weight: lw, reason: `Weiter mit ${lw} kg, Reps steigern` };
}

function est1RM(w, r) { return r <= 0 || w <= 0 ? 0 : r === 1 ? w : Math.round(w * (36 / (37 - Math.min(r, 36))) * 10) / 10; }

function muscleRec(muscle, log) {
  const now = Date.now();
  let last = 0;
  for (const w of log) for (const ex of (w.exercises||[])) {
    const d = EX.find(e => e.id === ex.exerciseId);
    if (d && (d.m === muscle || d.s?.includes(muscle))) { const t = new Date(w.date).getTime(); if (t > last) last = t; }
  }
  if (!last) return 100;
  return Math.min(100, Math.round((now - last) / (1000*60*60*24) / 3 * 100));
}

export default function StrengthTab({ C, data, update, onBack }) {
  const [sub, setSub] = useState("log");
  const [active, setActive] = useState(null);
  const [picker, setPicker] = useState(false);
  const [exFilter, setExFilter] = useState("all");
  const [restStart, setRestStart] = useState(null);
  const [restSec, setRestSec] = useState(0);
  const [histEx, setHistEx] = useState(null);
  const [tmplName, setTmplName] = useState("");
  const [showTmpl, setShowTmpl] = useState(false);
  const [showSplits, setShowSplits] = useState(false);
  const [editDays, setEditDays] = useState(false);
  const timerRef = useRef(null);

  const sLog = data.strengthLog || [];
  const templates = data.strengthTemplates || [];
  const trainingDays = data.trainingDays || [];

  const save = useCallback((log, tmpls, days) => {
    update(prev => ({
      ...(log !== undefined ? { strengthLog: log } : {}),
      ...(tmpls !== undefined ? { strengthTemplates: tmpls } : {}),
      ...(days !== undefined ? { trainingDays: days } : {}),
    }));
  }, [update]);

  // Timer
  useEffect(() => {
    if (restStart) {
      timerRef.current = setInterval(() => setRestSec(Math.floor((Date.now() - restStart) / 1000)), 250);
    } else { clearInterval(timerRef.current); setRestSec(0); }
    return () => clearInterval(timerRef.current);
  }, [restStart]);

  const getPrev = (eid) => { for (const w of [...sLog].reverse()) { const e = w.exercises?.find(x => x.exerciseId === eid); if (e) return { date: w.date, sets: e.sets }; } return null; };

  const startWorkout = (fromTmpl) => {
    const exercises = fromTmpl ? fromTmpl.exercises.map(e => {
      const eid = typeof e === "string" ? e : e.exerciseId;
      const prev = getPrev(eid);
      const sug = prev ? suggestWeight(eid, prev.sets) : null;
      const dw = sug?.weight || (prev?.sets?.[0]?.weight || 0);
      const sets = prev ? prev.sets.map(s => ({ weight: dw, reps: s.reps, done: false })) :
        [{ weight: 0, reps: 10, done: false },{ weight: 0, reps: 10, done: false },{ weight: 0, reps: 10, done: false }];
      return { exerciseId: eid, sets };
    }).filter(e => EX.some(x => x.id === e.exerciseId)) : [];
    setActive({ id: Date.now().toString(), date: new Date().toISOString().slice(0,10), start: Date.now(), exercises });
    setShowTmpl(false); setShowSplits(false);
  };

  const startFromDay = (day) => {
    startWorkout({ exercises: day.exercises.map(eid => ({ exerciseId: eid })) });
  };

  const addEx = (eid) => {
    if (!active) return;
    const prev = getPrev(eid);
    const sug = prev ? suggestWeight(eid, prev.sets) : null;
    const dw = sug?.weight || prev?.sets?.[0]?.weight || 0;
    const sets = prev ? prev.sets.map(s => ({ weight: dw, reps: s.reps, done: false })) :
      [{ weight: 0, reps: 10, done: false },{ weight: 0, reps: 10, done: false },{ weight: 0, reps: 10, done: false }];
    setActive(p => ({ ...p, exercises: [...p.exercises, { exerciseId: eid, sets }] }));
    setPicker(false);
  };

  const upSet = (ei, si, k, v) => setActive(p => ({ ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, [k]: k === "done" ? !s.done : +v }) }) }));
  const addSet = (ei) => setActive(p => { const ls = p.exercises[ei].sets.slice(-1)[0] || { weight: 0, reps: 10 }; return { ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : { ...e, sets: [...e.sets, { weight: ls.weight, reps: ls.reps, done: false }] }) }; });
  const rmSet = (ei, si) => setActive(p => ({ ...p, exercises: p.exercises.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) }) }));
  const rmEx = (ei) => setActive(p => ({ ...p, exercises: p.exercises.filter((_, i) => i !== ei) }));

  const finish = () => {
    if (!active?.exercises?.length) { setActive(null); return; }
    const cleaned = { ...active, duration: Math.round((Date.now() - active.start) / 60000), exercises: active.exercises.map(e => ({ exerciseId: e.exerciseId, sets: e.sets.filter(s => s.done).map(s => ({ weight: s.weight, reps: s.reps })) })).filter(e => e.sets.length > 0) };
    if (!cleaned.exercises.length) { setActive(null); return; }
    save([...sLog, cleaned].sort((a, b) => b.date.localeCompare(a.date)), undefined, undefined);
    setActive(null); setRestStart(null);
  };

  const saveTmpl = () => { if (!active || !tmplName.trim()) return; save(undefined, [...templates, { id: Date.now().toString(), name: tmplName.trim(), exercises: active.exercises.map(e => ({ exerciseId: e.exerciseId, sets: e.sets.map(s => ({ weight: s.weight, reps: s.reps })) })) }], undefined); setTmplName(""); };
  const delTmpl = (id) => save(undefined, templates.filter(t => t.id !== id), undefined);

  // Apply a preset split
  const applySplit = (key) => {
    const preset = SPLIT_PRESETS[key];
    if (!preset) return;
    const days = preset.days.map(d => ({
      id: Date.now().toString() + Math.random(),
      name: d.name,
      exercises: d.exercises.map(e => e.includes(":") ? e.split(":")[1] : e),
    }));
    save(undefined, undefined, days);
    setShowSplits(false);
  };

  // Edit training days
  const addDay = () => save(undefined, undefined, [...trainingDays, { id: Date.now().toString(), name: "Neuer Tag", exercises: [] }]);
  const updateDayName = (id, name) => save(undefined, undefined, trainingDays.map(d => d.id === id ? { ...d, name } : d));
  const removeDay = (id) => save(undefined, undefined, trainingDays.filter(d => d.id !== id));
  const addExToDay = (dayId, exId) => save(undefined, undefined, trainingDays.map(d => d.id === dayId ? { ...d, exercises: [...d.exercises, exId] } : d));
  const removeExFromDay = (dayId, exIdx) => save(undefined, undefined, trainingDays.map(d => d.id === dayId ? { ...d, exercises: d.exercises.filter((_, i) => i !== exIdx) } : d));

  const weekVol = useMemo(() => {
    const cut = new Date(); cut.setDate(cut.getDate() - 7);
    const cd = cut.toISOString().slice(0,10);
    const vol = {};
    MG.forEach(m => { vol[m.id] = 0; });
    sLog.filter(w => w.date >= cd).forEach(w => w.exercises?.forEach(ex => {
      const d = EX.find(e => e.id === ex.exerciseId); if (!d) return;
      const v = ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0);
      vol[d.m] = (vol[d.m] || 0) + v;
      d.s?.forEach(m => { vol[m] = (vol[m] || 0) + v * 0.4; });
    }));
    return vol;
  }, [sLog]);

  const recMap = useMemo(() => { const r = {}; MG.forEach(m => { r[m.id] = muscleRec(m.id, sLog); }); return r; }, [sLog]);

  const inp = { width:"100%", padding:"11px 14px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box", textAlign:"center" };
  const sty = { card:{background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:14}, lbl:{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4} };
  const fmtT = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Outfit',sans-serif"}}>
      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,borderBottom:`1px solid ${C.border}`,background:"rgba(10,10,8,0.88)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}>
        <div style={{padding:"16px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            {onBack && <button onClick={onBack} style={{fontSize:13,color:C.sky,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600,padding:0,marginBottom:2,letterSpacing:1}}>&larr; ZURÜCK</button>}
            <div style={{fontSize:26,fontWeight:800,letterSpacing:-1}}>Krafttraining</div>
          </div>
        </div>
      </div>

    <div style={{padding:"22px 20px 48px",animation:"fadeIn 0.35s ease"}}>
      <div style={{display:"flex",gap:6,marginBottom:18}}>
        {[["log","Workout"],["days","Tage"],["history","Verlauf"],["muscles","Muskeln"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSub(k)} style={{flex:1,padding:"10px 0",borderRadius:12,border:sub===k?`1.5px solid ${C.ember}`:`1.5px solid ${C.border}`,background:sub===k?C.emberBg:C.surface,color:sub===k?C.ember:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>

      {/* ═══ WORKOUT LOG ═══ */}
      {sub==="log" && !active && (
        <div>
          {/* Training days quick start */}
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

          <button onClick={()=>startWorkout(null)} style={{width:"100%",padding:"16px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${C.ember}44`,marginBottom:10}}>Leeres Workout starten</button>

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
          {restStart && (
            <div onClick={()=>setRestStart(null)} style={{background:C.emberBg,borderRadius:14,padding:"12px 18px",border:`1px solid ${C.ember}30`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <span style={{fontSize:13,color:C.sub,fontWeight:600}}>Pause</span>
              <span style={{fontSize:24,fontWeight:900,color:C.ember,fontVariantNumeric:"tabular-nums"}}>{fmtT(restSec)}</span>
              <span style={{fontSize:11,color:C.muted}}>Stoppen</span>
            </div>
          )}

          {active.exercises.map((ex, ei) => {
            const def = EX.find(e => e.id === ex.exerciseId);
            const mg = MG.find(m => m.id === def?.m);
            const prev = getPrev(ex.exerciseId);
            const sug = prev ? suggestWeight(ex.exerciseId, prev.sets) : null;
            return (
              <div key={ei} style={{background:C.surface,borderRadius:18,padding:"16px 16px 12px",border:`1px solid ${C.border}`,marginBottom:10,borderLeft:`4px solid ${mg?.color||C.muted}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div><div style={{fontSize:16,fontWeight:800}}>{def?.name||"?"}</div><div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div></div>
                  <button onClick={()=>rmEx(ei)} style={{width:30,height:30,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                </div>
                {sug && <div style={{background:C.goldBg,borderRadius:10,padding:"8px 12px",marginBottom:8,border:`1px solid ${C.gold}20`,fontSize:12,color:C.gold,fontWeight:600}}>{sug.reason}</div>}
                {prev && <div style={{fontSize:11,color:C.dim,marginBottom:6}}>Letztes Mal ({new Date(prev.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}): {prev.sets.map(s=>`${s.weight}x${s.reps}`).join(" / ")}</div>}
                <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 40px 32px",gap:4,marginBottom:4}}>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>#</div>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>{def?.bw?"BW":def?.timed?"SEK":"KG"}</div>
                  <div style={{fontSize:9,color:C.dim,fontWeight:600,textAlign:"center"}}>{def?.timed?"":"REPS"}</div>
                  <div/><div/>
                </div>
                {ex.sets.map((set, si) => (
                  <div key={si} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 40px 32px",gap:4,marginBottom:4,alignItems:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.dim,textAlign:"center"}}>{si+1}</div>
                    <input type="number" value={set.weight} onChange={e=>upSet(ei,si,"weight",e.target.value)} style={{...inp,padding:"9px 6px",fontSize:15,fontWeight:700,background:set.done?`${C.lime}10`:C.card}}/>
                    {!def?.timed && <input type="number" value={set.reps} onChange={e=>upSet(ei,si,"reps",e.target.value)} style={{...inp,padding:"9px 6px",fontSize:15,fontWeight:700,background:set.done?`${C.lime}10`:C.card}}/>}
                    {def?.timed && <div/>}
                    <button onClick={()=>{upSet(ei,si,"done");if(!set.done)setRestStart(Date.now())}} style={{width:40,height:38,borderRadius:10,border:`1px solid ${set.done?C.lime+"40":C.border}`,cursor:"pointer",fontSize:16,background:set.done?C.limeBg:C.card,color:set.done?C.lime:C.dim,display:"flex",alignItems:"center",justifyContent:"center"}}>{set.done?"\u2713":""}</button>
                    <button onClick={()=>rmSet(ei,si)} style={{width:32,height:38,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                  </div>
                ))}
                <button onClick={()=>addSet(ei)} style={{width:"100%",padding:"7px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ Satz</button>
              </div>
            );
          })}

          <button onClick={()=>setPicker(true)} style={{width:"100%",padding:"14px 0",background:C.surface,border:`1.5px dashed ${C.border}`,borderRadius:14,color:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>+ Übung</button>
          <button onClick={finish} style={{width:"100%",padding:"15px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${C.ember}44`,marginBottom:8}}>Workout beenden</button>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input value={tmplName} onChange={e=>setTmplName(e.target.value)} placeholder="Als Vorlage speichern..." style={{...inp,textAlign:"left",flex:1,borderRadius:14}}/>
            <button onClick={saveTmpl} disabled={!tmplName.trim()} style={{padding:"0 18px",background:tmplName.trim()?C.card:C.bg,border:`1px solid ${C.border}`,borderRadius:14,color:tmplName.trim()?C.sub:C.dim,fontSize:13,fontWeight:600,cursor:tmplName.trim()?"pointer":"default",fontFamily:"inherit"}}>Save</button>
          </div>
          <button onClick={()=>{if(confirm("Abbrechen?"))setActive(null)}} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.dim,border:"none",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Abbrechen</button>
        </div>
      )}

      {/* ═══ EXERCISE PICKER ═══ */}
      {picker && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setPicker(false)}}>
          <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",maxHeight:"80vh",overflowY:"auto",animation:"slideUp 0.25s ease-out"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:800,marginBottom:16}}>Übung wählen</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              <button onClick={()=>setExFilter("all")} style={{padding:"6px 12px",borderRadius:8,border:exFilter==="all"?`1.5px solid ${C.ember}`:`1px solid ${C.border}`,background:exFilter==="all"?C.emberBg:C.card,color:exFilter==="all"?C.ember:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Alle</button>
              {MG.map(m=>(<button key={m.id} onClick={()=>setExFilter(m.id)} style={{padding:"6px 12px",borderRadius:8,border:exFilter===m.id?`1.5px solid ${m.color}`:`1px solid ${C.border}`,background:exFilter===m.id?`${m.color}14`:C.card,color:exFilter===m.id?m.color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.name}</button>))}
            </div>
            {EX.filter(e=>exFilter==="all"||e.m===exFilter).map(ex=>{
              const mg=MG.find(m=>m.id===ex.m);const prev=getPrev(ex.id);
              return(<div key={ex.id} onClick={()=>addEx(ex.id)} style={{padding:"12px 16px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div></div>
                {prev&&<div style={{fontSize:10,color:C.dim,textAlign:"right"}}>{prev.sets[0]?.weight}kg<br/>x{prev.sets[0]?.reps}</div>}
              </div>);
            })}
          </div>
        </div>
      )}

      {/* ═══ TRAINING DAYS ═══ */}
      {sub==="days" && (
        <div>
          {trainingDays.length === 0 && !showSplits && (
            <div style={{textAlign:"center",padding:"40px 20px"}}>
              <div style={{fontSize:18,fontWeight:800,marginBottom:8}}>Trainingstage einrichten</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20,lineHeight:1.5}}>Wähle einen vorgefertigten Split oder erstelle eigene Trainingstage.</div>
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
                  <div style={{fontSize:11,color:C.dim,marginTop:4}}>{v.days.reduce((s,d)=>s+d.exercises.length,0)} Übungen total</div>
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
                <div key={day.id} style={{background:C.surface,borderRadius:18,padding:"16px 18px",border:`1px solid ${C.border}`,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <input value={day.name} onChange={e=>updateDayName(day.id,e.target.value)} style={{...inp,textAlign:"left",fontSize:16,fontWeight:800,background:"transparent",border:"none",padding:0,width:"auto"}}/>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>startFromDay(day)} style={{padding:"6px 14px",borderRadius:8,background:C.ember,border:"none",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Start</button>
                      <button onClick={()=>removeDay(day.id)} style={{width:30,height:30,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                    </div>
                  </div>
                  {day.exercises.map((eid,i)=>{
                    const def=EX.find(e=>e.id===eid);const mg=MG.find(m=>m.id===def?.m);
                    return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<day.exercises.length-1?`1px solid ${C.border}`:"none"}}>
                      <div><span style={{fontSize:13,fontWeight:600}}>{def?.name||eid}</span><span style={{fontSize:11,color:mg?.color,marginLeft:8}}>{mg?.name}</span></div>
                      <button onClick={()=>removeExFromDay(day.id,i)} style={{width:24,height:24,borderRadius:6,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                    </div>);
                  })}
                  <button onClick={()=>{setExFilter("all");setPicker(true);
                    // Hack: store dayId for adding
                    window._addToDay = day.id;
                  }} style={{width:"100%",padding:"8px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>+ Übung</button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Override picker for day editing */}
      {picker && sub==="days" && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget){setPicker(false);delete window._addToDay;}}}>
          <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",maxHeight:"80vh",overflowY:"auto",animation:"slideUp 0.25s ease-out"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:800,marginBottom:16}}>Übung hinzufügen</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              <button onClick={()=>setExFilter("all")} style={{padding:"6px 12px",borderRadius:8,border:exFilter==="all"?`1.5px solid ${C.ember}`:`1px solid ${C.border}`,background:exFilter==="all"?C.emberBg:C.card,color:exFilter==="all"?C.ember:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Alle</button>
              {MG.map(m=>(<button key={m.id} onClick={()=>setExFilter(m.id)} style={{padding:"6px 12px",borderRadius:8,border:exFilter===m.id?`1.5px solid ${m.color}`:`1px solid ${C.border}`,background:exFilter===m.id?`${m.color}14`:C.card,color:exFilter===m.id?m.color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.name}</button>))}
            </div>
            {EX.filter(e=>exFilter==="all"||e.m===exFilter).map(ex=>{
              const mg=MG.find(m=>m.id===ex.m);
              return(<div key={ex.id} onClick={()=>{
                if(window._addToDay){addExToDay(window._addToDay,ex.id);setPicker(false);delete window._addToDay;}
                else addEx(ex.id);
              }} style={{padding:"12px 16px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:14,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div></div>
              </div>);
            })}
          </div>
        </div>
      )}

      {/* ═══ HISTORY ═══ */}
      {sub==="history" && (
        <div>
          {sLog.length===0?(<div style={{textAlign:"center",padding:"60px 20px",color:C.dim,fontSize:14}}>Noch keine Kraft-Workouts</div>):(
            <>
              <div style={sty.card}>
                <div style={sty.lbl}>ÜBUNGSFORTSCHRITT</div>
                <select value={histEx||""} onChange={e=>setHistEx(e.target.value||null)} style={{...inp,textAlign:"left",marginBottom:12}}>
                  <option value="">Übung wählen...</option>
                  {[...new Set(sLog.flatMap(w=>(w.exercises||[]).map(e=>e.exerciseId)))].map(id=>{const def=EX.find(e=>e.id===id);return<option key={id} value={id}>{def?.name||id}</option>;})}
                </select>
                {histEx&&(()=>{
                  const entries=sLog.filter(w=>(w.exercises||[]).some(e=>e.exerciseId===histEx)).map(w=>{
                    const ex=w.exercises.find(e=>e.exerciseId===histEx);
                    const e1=Math.max(...ex.sets.map(s=>est1RM(s.weight,s.reps)));
                    return{d:new Date(w.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}),e1rm:Math.round(e1)};
                  }).reverse().slice(-12);
                  return entries.length>0?(<ResponsiveContainer width="100%" height={140}><BarChart data={entries}><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="d" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.borderLight}`,borderRadius:10,fontSize:12,color:C.text}} labelStyle={{color:C.muted}}/><Bar dataKey="e1rm" name="Est. 1RM (kg)" radius={[5,5,0,0]} fill={C.ember}/></BarChart></ResponsiveContainer>):null;
                })()}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sLog.map((w,i)=>(<div key={w.id||i} style={{background:C.surface,borderRadius:16,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontSize:15,fontWeight:700}}>{new Date(w.date).toLocaleDateString("de-DE",{day:"2-digit",month:"short",year:"2-digit"})}</div>
                    <div style={{fontSize:12,color:C.muted}}>{w.duration||"?"} min &middot; {(w.exercises||[]).length} Übungen</div>
                  </div>
                  {(w.exercises||[]).map((ex,ei)=>{const def=EX.find(e=>e.id===ex.exerciseId);return(<div key={ei} style={{fontSize:12,color:C.sub,marginBottom:2}}><span style={{fontWeight:600}}>{def?.name||ex.exerciseId}</span><span style={{color:C.muted}}> — {ex.sets.map(s=>`${s.weight}x${s.reps}`).join(", ")}</span></div>);})}
                </div>))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ MUSCLES ═══ */}
      {sub==="muscles" && (
        <div>
          <div style={sty.card}>
            <div style={sty.lbl}>MUSKEL-RECOVERY</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {MG.map(m=>{const r=recMap[m.id]||0;const col=r>=80?C.lime:r>=50?C.gold:C.ember;
                return(<div key={m.id} style={{background:C.card,borderRadius:14,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:700}}>{m.name}</span><span style={{fontSize:13,fontWeight:800,color:col}}>{r}%</span></div>
                  <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${r}%`,background:col,borderRadius:3,transition:"width 0.5s ease"}}/></div>
                </div>);
              })}
            </div>
          </div>
          <div style={sty.card}>
            <div style={sty.lbl}>VOLUMEN LETZTE 7 TAGE</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MG.filter(m=>weekVol[m.id]>0).map(m=>({name:m.name,vol:Math.round(weekVol[m.id]),fill:m.color}))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
                <XAxis type="number" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.sub}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.borderLight}`,borderRadius:10,fontSize:12,color:C.text}} labelStyle={{color:C.muted}}/>
                <Bar dataKey="vol" name="Volumen (kg)" radius={[0,5,5,0]}>{MG.filter(m=>weekVol[m.id]>0).map((m,i)=><Cell key={i} fill={m.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export { EX, MG, est1RM };
