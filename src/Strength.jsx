import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

// ═══ EXERCISE DATABASE ═══
const MUSCLE_GROUPS = [
  { id:"chest", name:"Brust", color:"#E8553A" },
  { id:"back", name:"Rücken", color:"#4AABDD" },
  { id:"shoulders", name:"Schultern", color:"#D4A024" },
  { id:"biceps", name:"Bizeps", color:"#8BC34A" },
  { id:"triceps", name:"Trizeps", color:"#9C7BF2" },
  { id:"legs", name:"Beine", color:"#E05880" },
  { id:"core", name:"Core", color:"#FF9F0A" },
  { id:"glutes", name:"Glutes", color:"#64D2FF" },
];

const EXERCISES = [
  { id:"bench", name:"Bankdrücken", muscle:"chest", secondary:["triceps","shoulders"], increment:2.5 },
  { id:"incline_bench", name:"Schrägbankdrücken", muscle:"chest", secondary:["shoulders","triceps"], increment:2.5 },
  { id:"chest_fly", name:"Flys (Kabel/KH)", muscle:"chest", secondary:[], increment:2.5 },
  { id:"dips", name:"Dips", muscle:"chest", secondary:["triceps","shoulders"], increment:5 },
  { id:"pushup", name:"Liegestütze", muscle:"chest", secondary:["triceps"], increment:0, bw:true },
  { id:"squat", name:"Kniebeugen", muscle:"legs", secondary:["glutes","core"], increment:2.5 },
  { id:"leg_press", name:"Beinpresse", muscle:"legs", secondary:["glutes"], increment:5 },
  { id:"rdl", name:"Rumänisches Kreuzheben", muscle:"legs", secondary:["back","glutes"], increment:2.5 },
  { id:"leg_curl", name:"Beinbeuger", muscle:"legs", secondary:[], increment:2.5 },
  { id:"leg_ext", name:"Beinstrecker", muscle:"legs", secondary:[], increment:2.5 },
  { id:"lunge", name:"Ausfallschritte", muscle:"legs", secondary:["glutes"], increment:2.5 },
  { id:"calf_raise", name:"Wadenheben", muscle:"legs", secondary:[], increment:5 },
  { id:"deadlift", name:"Kreuzheben", muscle:"back", secondary:["legs","glutes","core"], increment:2.5 },
  { id:"row", name:"Langhantelrudern", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"pullup", name:"Klimmzüge", muscle:"back", secondary:["biceps"], increment:0, bw:true },
  { id:"lat_pull", name:"Latzug", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"cable_row", name:"Kabelrudern", muscle:"back", secondary:["biceps"], increment:2.5 },
  { id:"ohp", name:"Schulterdrücken", muscle:"shoulders", secondary:["triceps"], increment:2.5 },
  { id:"lat_raise", name:"Seitheben", muscle:"shoulders", secondary:[], increment:1 },
  { id:"face_pull", name:"Face Pulls", muscle:"shoulders", secondary:["back"], increment:2.5 },
  { id:"rear_delt", name:"Reverse Flys", muscle:"shoulders", secondary:["back"], increment:1 },
  { id:"curl", name:"Bizeps Curls", muscle:"biceps", secondary:[], increment:2.5 },
  { id:"hammer_curl", name:"Hammer Curls", muscle:"biceps", secondary:[], increment:2.5 },
  { id:"tricep_push", name:"Trizepsdrücken", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"skull_crush", name:"Skull Crushers", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"overhead_ext", name:"Overhead Extension", muscle:"triceps", secondary:[], increment:2.5 },
  { id:"plank", name:"Plank", muscle:"core", secondary:[], increment:0, timed:true },
  { id:"crunch", name:"Crunches", muscle:"core", secondary:[], increment:0, bw:true },
  { id:"cable_crunch", name:"Kabel-Crunches", muscle:"core", secondary:[], increment:2.5 },
  { id:"hip_thrust", name:"Hip Thrust", muscle:"glutes", secondary:["legs"], increment:5 },
];

// Progressive overload logic
// If all sets hit upper rep range → suggest +increment kg
// If couldn't hit lower rep range → suggest -increment or same
function suggestWeight(exercise, prevSets, goalReps=[8,12]) {
  if (!prevSets || !prevSets.length) return null;
  const ex = EXERCISES.find(e => e.id === exercise);
  if (!ex || ex.bw || ex.timed) return null;

  const lastWeight = prevSets[0]?.weight || 0;
  if (lastWeight === 0) return null;

  const allHitUpper = prevSets.every(s => s.reps >= goalReps[1]);
  const anyBelowLower = prevSets.some(s => s.reps < goalReps[0]);

  if (allHitUpper) {
    return { weight: lastWeight + ex.increment, reason: `Alle Sätze ${goalReps[1]}+ Reps → +${ex.increment} kg` };
  } else if (anyBelowLower) {
    return { weight: lastWeight, reason: `Noch nicht alle Sätze im Zielbereich → Gewicht halten` };
  } else {
    return { weight: lastWeight, reason: `Weiter mit ${lastWeight} kg, Reps steigern` };
  }
}

// Brzycki 1RM estimation
function est1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)) * 10) / 10;
}

// Recovery estimation (days since last trained)
function muscleRecovery(muscle, workoutLog) {
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
  return Math.min(100, Math.round(daysSince / 3 * 100)); // Full recovery ~3 days
}

export default function StrengthTab({ C, data, update }) {
  const [subView, setSubView] = useState("log"); // log | history | exercises
  const [activeWorkout, setActiveWorkout] = useState(null); // current workout being logged
  const [showExPicker, setShowExPicker] = useState(false);
  const [exFilter, setExFilter] = useState("all");
  const [restTimer, setRestTimer] = useState(null);
  const [restSeconds, setRestSeconds] = useState(0);
  const [historyEx, setHistoryEx] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  const sLog = data.strengthLog || [];
  const templates = data.strengthTemplates || [];

  const persistStrength = useCallback((log, tmpls) => {
    update(prev => ({
      strengthLog: log !== undefined ? log : prev.strengthLog,
      strengthTemplates: tmpls !== undefined ? tmpls : prev.strengthTemplates,
    }));
  }, [update]);

  // Rest timer
  useState(() => {
    const interval = setInterval(() => {
      if (restTimer) {
        const elapsed = Math.floor((Date.now() - restTimer) / 1000);
        setRestSeconds(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  const startRest = () => { setRestTimer(Date.now()); setRestSeconds(0); };
  const stopRest = () => { setRestTimer(null); setRestSeconds(0); };

  // Get previous performance for an exercise
  const getPrevious = (exerciseId) => {
    for (const w of [...sLog].reverse()) {
      const ex = w.exercises?.find(e => e.exerciseId === exerciseId);
      if (ex) return { date: w.date, sets: ex.sets };
    }
    return null;
  };

  // Start new workout
  const startWorkout = (fromTemplate) => {
    const exercises = fromTemplate ? fromTemplate.exercises.map(e => ({
      exerciseId: e.exerciseId,
      sets: e.sets.map(s => ({ weight: s.weight, reps: s.reps, done: false })),
    })) : [];
    setActiveWorkout({
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0,10),
      startTime: Date.now(),
      exercises,
    });
    setShowTemplates(false);
  };

  // Add exercise to active workout
  const addExercise = (exId) => {
    if (!activeWorkout) return;
    const prev = getPrevious(exId);
    const exDef = EXERCISES.find(e => e.id === exId);
    const suggestion = prev ? suggestWeight(exId, prev.sets) : null;
    const defaultWeight = suggestion?.weight || (prev?.sets?.[0]?.weight || 0);
    const defaultSets = prev ? prev.sets.map(s => ({ weight: defaultWeight, reps: s.reps, done: false })) :
      [{ weight: 0, reps: 10, done: false }, { weight: 0, reps: 10, done: false }, { weight: 0, reps: 10, done: false }];

    setActiveWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { exerciseId: exId, sets: defaultSets }],
    }));
    setShowExPicker(false);
  };

  // Update a set
  const updateSet = (exIdx, setIdx, field, value) => {
    setActiveWorkout(prev => {
      const next = { ...prev, exercises: prev.exercises.map((e, ei) => ei !== exIdx ? e : {
        ...e, sets: e.sets.map((s, si) => si !== setIdx ? s : { ...s, [field]: field === "done" ? !s.done : +value })
      })};
      return next;
    });
  };

  // Add set to exercise
  const addSet = (exIdx) => {
    setActiveWorkout(prev => {
      const ex = prev.exercises[exIdx];
      const lastSet = ex.sets[ex.sets.length - 1] || { weight: 0, reps: 10 };
      return { ...prev, exercises: prev.exercises.map((e, i) => i !== exIdx ? e : {
        ...e, sets: [...e.sets, { weight: lastSet.weight, reps: lastSet.reps, done: false }]
      })};
    });
  };

  // Remove set
  const removeSet = (exIdx, setIdx) => {
    setActiveWorkout(prev => ({
      ...prev, exercises: prev.exercises.map((e, i) => i !== exIdx ? e : {
        ...e, sets: e.sets.filter((_, si) => si !== setIdx)
      })
    }));
  };

  // Remove exercise from workout
  const removeExercise = (exIdx) => {
    setActiveWorkout(prev => ({
      ...prev, exercises: prev.exercises.filter((_, i) => i !== exIdx)
    }));
  };

  // Finish workout
  const finishWorkout = () => {
    if (!activeWorkout || !activeWorkout.exercises.length) return;
    const cleaned = {
      ...activeWorkout,
      duration: Math.round((Date.now() - activeWorkout.startTime) / 60000),
      exercises: activeWorkout.exercises.map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets.filter(s => s.done).map(s => ({ weight: s.weight, reps: s.reps })),
      })).filter(e => e.sets.length > 0),
    };
    if (cleaned.exercises.length === 0) { setActiveWorkout(null); return; }
    const newLog = [...sLog, cleaned].sort((a, b) => b.date.localeCompare(a.date));
    persistStrength(newLog, undefined);
    setActiveWorkout(null);
    stopRest();
  };

  // Save as template
  const saveTemplate = () => {
    if (!activeWorkout || !templateName.trim()) return;
    const tmpl = {
      id: Date.now().toString(),
      name: templateName.trim(),
      exercises: activeWorkout.exercises.map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets.map(s => ({ weight: s.weight, reps: s.reps })),
      })),
    };
    persistStrength(undefined, [...templates, tmpl]);
    setTemplateName("");
  };

  // Delete template
  const deleteTemplate = (id) => {
    persistStrength(undefined, templates.filter(t => t.id !== id));
  };

  // Volume per muscle group (last 7 days)
  const weeklyVolume = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    const cd = cutoff.toISOString().slice(0,10);
    const vol = {};
    MUSCLE_GROUPS.forEach(m => { vol[m.id] = 0; });
    sLog.filter(w => w.date >= cd).forEach(w => {
      w.exercises.forEach(ex => {
        const def = EXERCISES.find(e => e.id === ex.exerciseId);
        if (!def) return;
        const v = ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0);
        vol[def.muscle] = (vol[def.muscle] || 0) + v;
        def.secondary?.forEach(m => { vol[m] = (vol[m] || 0) + v * 0.5; });
      });
    });
    return vol;
  }, [sLog]);

  const recoveryMap = useMemo(() => {
    const rec = {};
    MUSCLE_GROUPS.forEach(m => { rec[m.id] = muscleRecovery(m.id, sLog); });
    return rec;
  }, [sLog]);

  const inp = { width:"100%", padding:"11px 14px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:14, fontFamily:"'Outfit',sans-serif", outline:"none", boxSizing:"border-box", textAlign:"center" };
  const sty = { card:{background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:14}, label:{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4} };

  const fmtTimer = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div style={{animation:"fadeIn 0.35s ease"}}>
      {/* Sub-navigation */}
      <div style={{display:"flex",gap:6,marginBottom:18}}>
        {[["log","Workout"],["history","Verlauf"],["exercises","Muskeln"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSubView(k)} style={{flex:1,padding:"10px 0",borderRadius:12,border:subView===k?`1.5px solid ${C.ember}`:`1.5px solid ${C.border}`,background:subView===k?C.emberBg:C.surface,color:subView===k?C.ember:C.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>

      {/* ═══ ACTIVE WORKOUT ═══ */}
      {subView==="log" && !activeWorkout && (
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:20,fontWeight:800,marginBottom:8}}>Krafttraining</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:24,lineHeight:1.5}}>Starte ein leeres Workout oder wähle eine Vorlage</div>
          <button onClick={()=>startWorkout(null)} style={{width:"100%",padding:"16px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${C.ember}44`,marginBottom:10}}>Leeres Workout starten</button>
          {templates.length > 0 && (
            <>
              <button onClick={()=>setShowTemplates(p=>!p)} style={{width:"100%",padding:"14px 0",background:C.card,color:C.sub,border:`1px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Aus Vorlage starten</button>
              {showTemplates && (
                <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
                  {templates.map(t => (
                    <div key={t.id} style={{background:C.surface,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
                      <div style={{flex:1,textAlign:"left"}} onClick={()=>startWorkout(t)}>
                        <div style={{fontSize:15,fontWeight:700,cursor:"pointer"}}>{t.name}</div>
                        <div style={{fontSize:12,color:C.muted}}>{t.exercises.length} Übungen</div>
                      </div>
                      <button onClick={()=>deleteTemplate(t.id)} style={{width:32,height:32,borderRadius:8,background:C.emberBg,border:`1px solid ${C.ember}30`,color:C.ember,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {subView==="log" && activeWorkout && (
        <div>
          {/* Rest timer bar */}
          {restTimer && (
            <div onClick={stopRest} style={{background:C.emberBg,borderRadius:14,padding:"12px 18px",border:`1px solid ${C.ember}30`,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <span style={{fontSize:13,color:C.sub,fontWeight:600}}>Pause</span>
              <span style={{fontSize:24,fontWeight:900,color:C.ember,fontVariantNumeric:"tabular-nums"}}>{fmtTimer(restSeconds)}</span>
              <span style={{fontSize:11,color:C.muted}}>Tippe zum Stoppen</span>
            </div>
          )}

          {/* Exercises */}
          {activeWorkout.exercises.map((ex, exIdx) => {
            const def = EXERCISES.find(e => e.id === ex.exerciseId);
            const mg = MUSCLE_GROUPS.find(m => m.id === def?.muscle);
            const prev = getPrevious(ex.exerciseId);
            const suggestion = prev ? suggestWeight(ex.exerciseId, prev.sets) : null;

            return (
              <div key={exIdx} style={{background:C.surface,borderRadius:18,padding:"16px 16px 12px",border:`1px solid ${C.border}`,marginBottom:10,borderLeft:`4px solid ${mg?.color || C.muted}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:800}}>{def?.name}</div>
                    <div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}</div>
                  </div>
                  <button onClick={()=>removeExercise(exIdx)} style={{width:30,height:30,borderRadius:8,background:C.card,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                </div>

                {/* Suggestion */}
                {suggestion && (
                  <div style={{background:C.goldBg,borderRadius:10,padding:"8px 12px",marginBottom:10,border:`1px solid ${C.gold}20`,fontSize:12,color:C.gold,fontWeight:600}}>
                    {suggestion.reason}
                  </div>
                )}

                {/* Previous */}
                {prev && (
                  <div style={{fontSize:11,color:C.dim,marginBottom:8}}>
                    Letztes Mal ({new Date(prev.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}): {prev.sets.map(s=>`${s.weight}kg x${s.reps}`).join(" / ")}
                  </div>
                )}

                {/* Header */}
                <div style={{display:"grid",gridTemplateColumns:"32px 1fr 1fr 44px 44px",gap:6,marginBottom:6}}>
                  <div style={{fontSize:10,color:C.dim,fontWeight:600,textAlign:"center"}}>SET</div>
                  <div style={{fontSize:10,color:C.dim,fontWeight:600,textAlign:"center"}}>{def?.bw?"REPS":def?.timed?"SEK":"KG"}</div>
                  <div style={{fontSize:10,color:C.dim,fontWeight:600,textAlign:"center"}}>{def?.timed?"":"REPS"}</div>
                  <div></div>
                  <div></div>
                </div>

                {/* Sets */}
                {ex.sets.map((set, si) => (
                  <div key={si} style={{display:"grid",gridTemplateColumns:"32px 1fr 1fr 44px 44px",gap:6,marginBottom:6,alignItems:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.dim,textAlign:"center"}}>{si+1}</div>
                    <input type="number" value={set.weight} onChange={e=>updateSet(exIdx,si,"weight",e.target.value)} style={{...inp,padding:"9px 8px",fontSize:15,fontWeight:700,background:set.done?`${C.lime}10`:C.card}} />
                    {!def?.timed && (
                      <input type="number" value={set.reps} onChange={e=>updateSet(exIdx,si,"reps",e.target.value)} style={{...inp,padding:"9px 8px",fontSize:15,fontWeight:700,background:set.done?`${C.lime}10`:C.card}} />
                    )}
                    {def?.timed && <div/>}
                    <button onClick={()=>{updateSet(exIdx,si,"done");if(!set.done)startRest();}} style={{
                      width:44,height:40,borderRadius:10,border:"none",cursor:"pointer",fontSize:16,fontWeight:700,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      background:set.done?C.limeBg:C.card,color:set.done?C.lime:C.dim,
                      borderWidth:1,borderStyle:"solid",borderColor:set.done?`${C.lime}40`:C.border,
                    }}>{set.done ? "\u2713" : ""}</button>
                    <button onClick={()=>removeSet(exIdx,si)} style={{width:44,height:40,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.dim,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                  </div>
                ))}

                <button onClick={()=>addSet(exIdx)} style={{width:"100%",padding:"8px 0",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>+ Satz</button>
              </div>
            );
          })}

          {/* Add exercise button */}
          <button onClick={()=>setShowExPicker(true)} style={{width:"100%",padding:"14px 0",background:C.surface,border:`1.5px dashed ${C.border}`,borderRadius:14,color:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>+ Übung hinzufügen</button>

          {/* Save & Finish */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={finishWorkout} style={{flex:1,padding:"15px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${C.ember}44`}}>Workout beenden</button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={templateName} onChange={e=>setTemplateName(e.target.value)} placeholder="Vorlage-Name..." style={{...inp,textAlign:"left",flex:1,borderRadius:14}} />
            <button onClick={saveTemplate} disabled={!templateName.trim()} style={{padding:"0 20px",background:templateName.trim()?C.card:C.bg,border:`1px solid ${C.border}`,borderRadius:14,color:templateName.trim()?C.sub:C.dim,fontSize:13,fontWeight:600,cursor:templateName.trim()?"pointer":"default",fontFamily:"inherit"}}>Speichern</button>
          </div>
          <button onClick={()=>{if(confirm("Workout abbrechen?"))setActiveWorkout(null)}} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.dim,border:"none",fontSize:13,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>Workout abbrechen</button>
        </div>
      )}

      {/* ═══ EXERCISE PICKER ═══ */}
      {showExPicker && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowExPicker(false)}}>
          <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",maxHeight:"80vh",overflowY:"auto",animation:"slideUp 0.25s ease-out"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:18,fontWeight:800,marginBottom:16}}>Übung wählen</div>

            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              <button onClick={()=>setExFilter("all")} style={{padding:"6px 12px",borderRadius:8,border:exFilter==="all"?`1.5px solid ${C.ember}`:`1px solid ${C.border}`,background:exFilter==="all"?C.emberBg:C.card,color:exFilter==="all"?C.ember:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Alle</button>
              {MUSCLE_GROUPS.map(m=>(
                <button key={m.id} onClick={()=>setExFilter(m.id)} style={{padding:"6px 12px",borderRadius:8,border:exFilter===m.id?`1.5px solid ${m.color}`:`1px solid ${C.border}`,background:exFilter===m.id?`${m.color}14`:C.card,color:exFilter===m.id?m.color:C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{m.name}</button>
              ))}
            </div>

            {EXERCISES.filter(e => exFilter==="all" || e.muscle===exFilter).map(ex => {
              const mg = MUSCLE_GROUPS.find(m => m.id === ex.muscle);
              const prev = getPrevious(ex.id);
              return (
                <div key={ex.id} onClick={()=>addExercise(ex.id)} style={{padding:"14px 16px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,marginBottom:6,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700}}>{ex.name}</div>
                    <div style={{fontSize:11,color:mg?.color,fontWeight:600}}>{mg?.name}{ex.secondary?.length ? ` + ${ex.secondary.map(s=>MUSCLE_GROUPS.find(m=>m.id===s)?.name).filter(Boolean).join(", ")}` : ""}</div>
                  </div>
                  {prev && <div style={{fontSize:10,color:C.dim,textAlign:"right"}}>{prev.sets[0]?.weight}kg<br/>x{prev.sets[0]?.reps}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ HISTORY ═══ */}
      {subView==="history" && (
        <div>
          {sLog.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 20px",color:C.dim,fontSize:14}}>Noch keine Kraft-Workouts eingetragen</div>
          ) : (
            <>
              {/* Exercise history selector */}
              <div style={sty.card}>
                <div style={sty.label}>ÜBUNGSFORTSCHRITT</div>
                <select value={historyEx||""} onChange={e=>setHistoryEx(e.target.value||null)} style={{...inp,textAlign:"left",marginBottom:12}}>
                  <option value="">Übung wählen...</option>
                  {[...new Set(sLog.flatMap(w=>w.exercises.map(e=>e.exerciseId)))].map(id=>{
                    const def=EXERCISES.find(e=>e.id===id);
                    return <option key={id} value={id}>{def?.name||id}</option>;
                  })}
                </select>
                {historyEx && (()=>{
                  const entries = sLog.filter(w=>w.exercises.some(e=>e.exerciseId===historyEx)).map(w=>{
                    const ex=w.exercises.find(e=>e.exerciseId===historyEx);
                    const maxW=Math.max(...ex.sets.map(s=>s.weight));
                    const vol=ex.sets.reduce((s,set)=>s+set.weight*set.reps,0);
                    const e1rm=Math.max(...ex.sets.map(s=>est1RM(s.weight,s.reps)));
                    return{d:new Date(w.date).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}),maxW,vol,e1rm};
                  }).reverse().slice(-12);
                  return entries.length > 0 ? (
                    <>
                      <div style={{fontSize:12,color:C.muted,marginBottom:8,fontWeight:600}}>Est. 1RM Verlauf</div>
                      <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={entries}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                          <XAxis dataKey="d" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                          <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.borderLight}`,borderRadius:10,fontSize:12,fontFamily:"'Outfit',sans-serif",color:C.text}} labelStyle={{color:C.muted}}/>
                          <Bar dataKey="e1rm" name="Est. 1RM" radius={[5,5,0,0]} fill={C.ember}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  ) : null;
                })()}
              </div>

              {/* Workout list */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sLog.map((w,i) => (
                  <div key={w.id||i} style={{background:C.surface,borderRadius:16,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{fontSize:15,fontWeight:700}}>{new Date(w.date).toLocaleDateString("de-DE",{day:"2-digit",month:"short",year:"2-digit"})}</div>
                      <div style={{fontSize:12,color:C.muted}}>{w.duration||"?"} min &middot; {w.exercises.length} Übungen</div>
                    </div>
                    {w.exercises.map((ex,ei) => {
                      const def = EXERCISES.find(e=>e.id===ex.exerciseId);
                      const vol = ex.sets.reduce((s,set)=>s+set.weight*set.reps,0);
                      return (
                        <div key={ei} style={{fontSize:12,color:C.sub,marginBottom:2}}>
                          <span style={{fontWeight:600}}>{def?.name||ex.exerciseId}</span>
                          <span style={{color:C.muted}}> — {ex.sets.map(s=>`${s.weight}kg x${s.reps}`).join(", ")}</span>
                          <span style={{color:C.dim}}> ({Math.round(vol)} vol)</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ MUSCLE MAP ═══ */}
      {subView==="exercises" && (
        <div>
          {/* Recovery map */}
          <div style={sty.card}>
            <div style={sty.label}>MUSKEL-RECOVERY</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {MUSCLE_GROUPS.map(m => {
                const rec = recoveryMap[m.id] || 0;
                const col = rec >= 80 ? C.lime : rec >= 50 ? C.gold : C.ember;
                return (
                  <div key={m.id} style={{background:C.card,borderRadius:14,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:700}}>{m.name}</span>
                      <span style={{fontSize:13,fontWeight:800,color:col}}>{rec}%</span>
                    </div>
                    <div style={{height:6,background:C.bg,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${rec}%`,background:col,borderRadius:3,transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly volume */}
          <div style={sty.card}>
            <div style={sty.label}>VOLUMEN LETZTE 7 TAGE (KG)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MUSCLE_GROUPS.map(m=>({name:m.name,vol:Math.round(weeklyVolume[m.id]||0),fill:m.color}))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
                <XAxis type="number" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.sub}} axisLine={false} tickLine={false} width={70}/>
                <Tooltip contentStyle={{background:C.elevated,border:`1px solid ${C.borderLight}`,borderRadius:10,fontSize:12,fontFamily:"'Outfit',sans-serif",color:C.text}} labelStyle={{color:C.muted}}/>
                <Bar dataKey="vol" name="Volumen (kg)" radius={[0,5,5,0]}>
                  {MUSCLE_GROUPS.map((m,i)=><Cell key={i} fill={m.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export { EXERCISES, MUSCLE_GROUPS, est1RM };
