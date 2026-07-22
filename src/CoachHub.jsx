import { useMemo, useState } from "react";
import {
  ArrowLeft, BrainCircuit, CalendarRange, ChevronRight, CloudDownload, Database,
  Dumbbell, Gauge, HeartPulse, Link2, Play, Share2, ShieldCheck,
  Sparkles, TrendingUp, Upload, Zap,
} from "lucide-react";
import { EXERCISES } from "./exercises";
import { toDateInput } from "./dateUtils";
import {
  DEFAULT_CHECKIN, calculateReadiness, generateWeeklyReport,
  getAdaptiveRecommendation, getProgressionSuggestions,
} from "./coachEngine";
import { mergeImportedData, parseHealthExport, SOURCE_NAMES } from "./healthImport";

const NAV = [
  { id:"today", label:"Heute", Icon:Gauge },
  { id:"progress", label:"Progression", Icon:TrendingUp },
  { id:"report", label:"Report", Icon:CalendarRange },
  { id:"connect", label:"Connect", Icon:Link2 },
];

const SOURCES = [
  { id:"apple", label:"Apple Health", formats:"export.xml", note:"Workouts, Schlaf, Schritte und Ruhepuls" },
  { id:"healthconnect", label:"Health Connect", formats:"JSON oder CSV", note:"Android-Gesundheitsdaten und Aktivitäten" },
  { id:"garmin", label:"Garmin", formats:"Activities CSV/JSON", note:"Läufe, Radfahrten und Herzfrequenz" },
  { id:"strava", label:"Strava", formats:"activities.csv", note:"Aktivitäten, Distanz und Belastung" },
];

const exerciseLabels = Object.fromEntries(EXERCISES.map(exercise => [exercise.id, exercise.name]));

function SectionLabel({ children, color }) {
  return <div style={{ fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color, fontWeight:800, marginBottom:10 }}>{children}</div>;
}

function ReadinessDial({ result }) {
  return (
    <div aria-label={`Readiness ${result.score} von 100`} style={{ width:148, height:148, borderRadius:"50%", padding:8, background:`conic-gradient(${result.color} ${result.score * 3.6}deg, rgba(255,255,255,.055) 0)`, boxShadow:`0 0 54px ${result.color}18` }}>
      <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#111119", display:"grid", placeItems:"center", textAlign:"center", border:"1px solid rgba(255,255,255,.05)" }}>
        <div><div style={{ fontSize:44, fontWeight:850, lineHeight:1, color:result.color }}>{result.score}</div><div style={{ fontSize:10, letterSpacing:2, color:result.color, fontWeight:800, marginTop:6 }}>{result.label.toUpperCase()}</div></div>
      </div>
    </div>
  );
}

export default function CoachHub({ C, data, update, plannedSession, onBack, onStartLive, onOpenStrength }) {
  const today = toDateInput();
  const [tab, setTab] = useState("today");
  const savedCheckin = (data.readinessCheckIns || []).find(entry => entry.date === today);
  const todayMetric = (data.healthMetrics || []).find(entry => entry.date === today);
  const [checkin, setCheckin] = useState(() => ({
    ...DEFAULT_CHECKIN,
    ...(todayMetric?.sleepHours ? { sleepHours:todayMetric.sleepHours } : {}),
    ...(todayMetric?.restingHr ? { restingHr:todayMetric.restingHr } : {}),
    ...(savedCheckin || {}),
  }));
  const [notice, setNotice] = useState("");
  const [importing, setImporting] = useState("");

  const readiness = useMemo(() => calculateReadiness(checkin, data), [checkin, data]);
  const recommendation = useMemo(() => getAdaptiveRecommendation({ data, checkin, plannedSession }), [data, checkin, plannedSession]);
  const progressions = useMemo(() => getProgressionSuggestions(data.strengthLog || [], exerciseLabels), [data.strengthLog]);
  const report = useMemo(() => generateWeeklyReport(data), [data]);

  const card = { background:C.surface, border:`1px solid ${C.border}`, borderRadius:22, padding:"18px 18px", marginBottom:14 };
  const button = { border:"none", borderRadius:14, padding:"13px 16px", fontFamily:"inherit", fontWeight:750, cursor:"pointer" };

  const saveCheckin = () => {
    const entry = { ...checkin, date:today, savedAt:new Date().toISOString() };
    update(previous => ({ readinessCheckIns:[entry, ...(previous.readinessCheckIns || []).filter(item => item.date !== today)].slice(0, 120) }));
    setNotice("Check-in gespeichert. Dein Coach hat die heutige Empfehlung aktualisiert.");
  };

  const startRecommendation = () => {
    if (recommendation.type === "strength") { onOpenStrength("log"); return; }
    onStartLive({
      ...recommendation,
      title:recommendation.title,
      estimatedDistance:["zone2","easy","tempo","intervals"].includes(recommendation.type) ? Math.round(recommendation.duration / 6.5 * 10) / 10 : 0,
      planRef:plannedSession?.planRef || null,
      note:`Coach 2.0 · ${recommendation.reason}`,
    });
  };

  const importFile = async (source, file) => {
    if (!file) return;
    setImporting(source); setNotice("");
    try {
      const parsed = parseHealthExport(await file.text(), source, file.name);
      const merged = mergeImportedData(data, parsed);
      update(() => ({ workouts:merged.workouts, healthMetrics:merged.healthMetrics, integrationSources:merged.integrationSources }));
      setNotice(`${SOURCE_NAMES[source]}: ${merged.importedCounts.workouts} neue Workouts und ${merged.importedCounts.metrics} Gesundheitswerte importiert.`);
    } catch (error) {
      setNotice(`${SOURCE_NAMES[source]} konnte nicht importiert werden: ${error.message}`);
    } finally { setImporting(""); }
  };

  const shareReport = async () => {
    try {
      if (navigator.share) await navigator.share({ title:"CardioTracker Wochenreport", text:report.shareText });
      else { await navigator.clipboard.writeText(report.shareText); setNotice("Wochenreport kopiert."); }
    } catch (error) {
      if (error?.name !== "AbortError") setNotice("Teilen wurde vom Browser blockiert.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at 50% 10%, ${C.violet}0f, transparent 48%), ${C.bg}`, color:C.text, fontFamily:"'Manrope',sans-serif" }}>
      <header style={{ position:"sticky", top:0, zIndex:40, background:"rgba(10,10,15,.94)", borderBottom:`1px solid ${C.border}`, backdropFilter:"blur(20px)" }}>
        <div className="coach-shell" style={{ padding:"15px 18px 0", margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div>
              <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", padding:0, color:C.violet, fontSize:10, letterSpacing:2, fontWeight:750, cursor:"pointer" }}><ArrowLeft size={14}/> MODI</button>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginTop:5 }}><BrainCircuit size={22} color={C.violet}/><h1 style={{ fontSize:25, margin:0, fontFamily:"'Cormorant Garamond',serif", letterSpacing:4, fontWeight:400 }}>COACH 2.0</h1></div>
            </div>
            <div style={{ padding:"7px 10px", borderRadius:10, background:`${readiness.color}14`, border:`1px solid ${readiness.color}30`, color:readiness.color, fontSize:11, fontWeight:800 }}>{readiness.score} READY</div>
          </div>
          <nav aria-label="Coach-Bereiche" style={{ display:"flex", overflowX:"auto", marginTop:13 }}>
            {NAV.map(item => <button key={item.id} onClick={()=>setTab(item.id)} aria-current={tab===item.id?"page":undefined} style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 13px 12px", border:"none", borderBottom:tab===item.id?`2px solid ${C.violet}`:"2px solid transparent", background:"transparent", color:tab===item.id?C.text:C.muted, fontSize:11, fontWeight:tab===item.id?750:500, cursor:"pointer", whiteSpace:"nowrap" }}><item.Icon size={15}/>{item.label}</button>)}
          </nav>
        </div>
      </header>

      <main className="coach-shell" style={{ margin:"0 auto", padding:"20px 18px 56px" }}>
        {notice && <div role="status" style={{ marginBottom:14, padding:"11px 13px", borderRadius:12, background:C.violetBg, border:`1px solid ${C.violet}28`, color:C.sub, fontSize:12, lineHeight:1.45 }}>{notice}</div>}

        {tab === "today" && <>
          <section style={{ ...card, background:`linear-gradient(145deg, ${readiness.color}10, ${C.surface})`, borderColor:`${readiness.color}24` }}>
            <div className="readiness-layout" style={{ display:"grid", gridTemplateColumns:"170px minmax(0,1fr)", gap:20, alignItems:"center" }}>
              <ReadinessDial result={readiness}/>
              <div>
                <SectionLabel color={readiness.color}>Tägliche Readiness</SectionLabel>
                <h2 style={{ margin:"0 0 7px", fontSize:25 }}>Dein Körper gibt heute {readiness.label === "Peak" ? "grünes Licht" : readiness.label === "Recovery" ? "ein Recovery-Signal" : "ein kontrolliertes Signal"}.</h2>
                <p style={{ margin:0, color:C.sub, fontSize:13, lineHeight:1.55 }}>{readiness.load.message}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>{readiness.factors.map(factor => <span key={factor.label} style={{ padding:"5px 8px", borderRadius:8, background:factor.positive?C.limeBg:C.emberBg, color:factor.positive?C.lime:C.ember, fontSize:10, fontWeight:700 }}>{factor.label} {factor.value}</span>)}</div>
              </div>
            </div>
          </section>

          <section style={card}>
            <SectionLabel color={C.violet}>60-Sekunden Check-in</SectionLabel>
            <div className="coach-form-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:10 }}>
              <label className="coach-field"><span>Schlaf</span><div><input aria-label="Schlafstunden" type="number" min="0" max="12" step="0.5" value={checkin.sleepHours} onChange={event=>setCheckin(value=>({ ...value, sleepHours:event.target.value }))}/><strong>h</strong></div></label>
              <label className="coach-field"><span>Ruhepuls optional</span><div><input aria-label="Ruhepuls" type="number" min="30" max="220" value={checkin.restingHr} onChange={event=>setCheckin(value=>({ ...value, restingHr:event.target.value }))}/><strong>bpm</strong></div></label>
              {[{ key:"energy", label:"Energie", good:"hoch" }, { key:"soreness", label:"Muskelkater", good:"niedrig" }, { key:"stress", label:"Stress", good:"niedrig" }].map(field => <label key={field.key} className="coach-range"><span>{field.label}<strong>{checkin[field.key]}/5</strong></span><input type="range" min="1" max="5" value={checkin[field.key]} onChange={event=>setCheckin(value=>({ ...value, [field.key]:Number(event.target.value) }))}/></label>)}
            </div>
            <button onClick={saveCheckin} style={{ ...button, width:"100%", marginTop:12, background:C.violet, color:"#0a0a0f" }}>Check-in speichern</button>
          </section>

          <section style={{ ...card, borderColor:`${C.ember}30`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-50, right:-40, width:150, height:150, borderRadius:"50%", background:`${C.ember}0b`, filter:"blur(15px)" }}/>
            <SectionLabel color={C.ember}>Adaptive Empfehlung</SectionLabel>
            <div style={{ display:"flex", justifyContent:"space-between", gap:16, position:"relative" }}>
              <div><h2 style={{ margin:"0 0 6px", fontSize:26 }}>{recommendation.title}</h2><div style={{ fontSize:12, color:C.ember, fontWeight:750 }}>{recommendation.duration} Min · {recommendation.hr} · {recommendation.intensity}</div></div>
              <Zap size={26} color={C.ember}/>
            </div>
            <p style={{ color:C.sub, fontSize:13, lineHeight:1.6, margin:"14px 0" }}>{recommendation.reason}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:14 }}>{recommendation.changes.map(change => <span key={change} style={{ padding:"6px 9px", borderRadius:9, background:C.card, border:`1px solid ${C.border}`, color:C.muted, fontSize:10, fontWeight:700 }}>{change}</span>)}</div>
            <button onClick={startRecommendation} style={{ ...button, width:"100%", background:`linear-gradient(135deg, ${C.ember}, #a87a52)`, color:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Play size={17} fill="currentColor"/> {recommendation.type === "strength" ? "Krafttraining öffnen" : "Live-Cockpit starten"}</button>
          </section>

          <section style={card}>
            <SectionLabel color={C.sky}>Belastungssteuerung</SectionLabel>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[{ label:"7 Tage", value:readiness.load.acute }, { label:"4-Wochen Ø", value:readiness.load.chronic }, { label:"Load Ratio", value:readiness.load.ratio || "–" }].map(metric => <div key={metric.label} style={{ background:C.card, borderRadius:14, padding:"13px 9px", textAlign:"center", border:`1px solid ${C.border}` }}><div style={{ fontSize:20, fontWeight:850, color:C.sky }}>{metric.value}</div><div style={{ fontSize:9, color:C.dim, marginTop:3 }}>{metric.label}</div></div>)}
            </div>
          </section>
        </>}

        {tab === "progress" && <>
          <section style={card}>
            <SectionLabel color={C.lime}>Automatische Progression</SectionLabel>
            <h2 style={{ margin:"0 0 5px", fontSize:24 }}>Nächster sinnvoller Schritt</h2>
            <p style={{ color:C.muted, fontSize:12, lineHeight:1.55, margin:"0 0 16px" }}>Gewicht, Wiederholungen und RPE deiner letzten Einheiten werden gemeinsam bewertet.</p>
            {!progressions.length ? <div style={{ padding:"28px 10px", textAlign:"center", color:C.dim, fontSize:13 }}>Nach zwei protokollierten Kraftsessions erscheinen hier belastbare Vorschläge.</div> : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{progressions.map(item => {
              const color = item.action === "steigern" ? C.lime : item.action === "deload" ? C.ember : item.action === "reps" ? C.sky : C.gold;
              return <div key={item.exerciseId} style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${color}`, borderRadius:14, padding:"12px 13px" }}><div style={{ display:"flex", justifyContent:"space-between", gap:12 }}><div><div style={{ fontSize:14, fontWeight:800 }}>{item.name}</div><div style={{ fontSize:11, color:C.muted, marginTop:3, lineHeight:1.4 }}>{item.reason}</div></div><div style={{ textAlign:"right", flexShrink:0 }}><div style={{ fontSize:9, color, fontWeight:800, letterSpacing:1 }}>{item.action.toUpperCase()}</div><div style={{ fontSize:16, fontWeight:850, marginTop:3 }}>{item.targetWeight} kg</div></div></div></div>;
            })}</div>}
          </section>
          <button onClick={()=>onOpenStrength("log")} style={{ ...button, width:"100%", background:C.skyBg, border:`1px solid ${C.sky}30`, color:C.sky, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Dumbbell size={17}/> Ghost Workout starten <ChevronRight size={16}/></button>
          <button onClick={()=>onOpenStrength("muscles")} style={{ ...button, width:"100%", marginTop:9, background:C.limeBg, border:`1px solid ${C.lime}28`, color:C.lime, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><HeartPulse size={17}/> Recovery-Heatmap öffnen <ChevronRight size={16}/></button>
        </>}

        {tab === "report" && <>
          <section style={{ ...card, background:`linear-gradient(145deg, ${C.violet}0c, ${C.surface})` }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}><div><SectionLabel color={C.violet}>Smart Wochenreport · lokal</SectionLabel><h2 style={{ margin:0, fontSize:27 }}>{report.period}</h2></div><Sparkles size={25} color={C.violet}/></div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8, margin:"18px 0" }}>
              {[{ label:"Sessions", value:report.sessions }, { label:"Minuten", value:report.minutes }, { label:"Distanz", value:`${report.distance} km` }, { label:"Kraftvolumen", value:`${Math.round(report.strengthVolume/100)/10} t` }].map(metric => <div key={metric.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"13px 14px" }}><div style={{ fontSize:21, fontWeight:850, color:C.violet }}>{metric.value}</div><div style={{ fontSize:9, color:C.dim, marginTop:3 }}>{metric.label}</div></div>)}
            </div>
            <SectionLabel color={C.sky}>Coach-Auswertung</SectionLabel>
            {report.highlights.map((highlight, index) => <div key={index} style={{ display:"flex", gap:9, color:C.sub, fontSize:13, lineHeight:1.5, marginBottom:8 }}><ShieldCheck size={16} color={C.sky} style={{ flexShrink:0, marginTop:2 }}/>{highlight}</div>)}
            <SectionLabel color={C.lime}>Nächste Woche</SectionLabel>
            {report.actions.map((action, index) => <div key={index} style={{ display:"flex", gap:9, color:C.text, fontSize:13, lineHeight:1.5, marginBottom:8 }}><ChevronRight size={16} color={C.lime} style={{ flexShrink:0, marginTop:2 }}/>{action}</div>)}
          </section>
          <section style={{ ...card, borderColor:`${C.gold}24`, color:C.sub, fontSize:12, lineHeight:1.55 }}><SectionLabel color={C.gold}>Optionale Cloud-AI</SectionLabel>Eine externe AI-Vertiefung bleibt deaktiviert, bis die Übertragung aggregierter Trainingsdaten an einen konkreten Anbieter ausdrücklich freigegeben wurde. Der lokale Report funktioniert vollständig ohne Cloud.</section>
          <button onClick={shareReport} style={{ ...button, width:"100%", background:C.card, color:C.sky, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}><Share2 size={16}/> Report teilen</button>
        </>}

        {tab === "connect" && <>
          <section style={card}>
            <SectionLabel color={C.sky}>Health Integrationen</SectionLabel>
            <h2 style={{ margin:"0 0 6px", fontSize:24 }}>Deine Daten, ein Coach</h2>
            <p style={{ color:C.muted, fontSize:12, lineHeight:1.55, margin:"0 0 16px" }}>Import läuft ausschließlich auf deinem Gerät. Dateien werden weder hochgeladen noch dauerhaft außerhalb des Browsers gespeichert.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>{SOURCES.map(source => {
              const state = data.integrationSources?.[source.id];
              return <div key={source.id} style={{ background:C.card, border:`1px solid ${state?.connected?C.lime+"30":C.border}`, borderRadius:15, padding:"13px 13px", display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:40, height:40, borderRadius:12, display:"grid", placeItems:"center", background:state?.connected?C.limeBg:C.skyBg, color:state?.connected?C.lime:C.sky, flexShrink:0 }}>{state?.connected?<Database size={19}/>:<CloudDownload size={19}/>}</div>
                <div style={{ flex:1, minWidth:0 }}><div style={{ display:"flex", alignItems:"center", gap:7 }}><strong style={{ fontSize:14 }}>{source.label}</strong>{state?.connected&&<span style={{ fontSize:8, color:C.lime, fontWeight:800 }}>VERBUNDEN</span>}</div><div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{source.note}</div><div style={{ fontSize:9, color:C.dim, marginTop:3 }}>{source.formats}{state?.importedAt?` · zuletzt ${new Date(state.importedAt).toLocaleDateString("de-DE")}`:""}</div></div>
                <label style={{ ...button, padding:"10px 11px", background:C.surface, border:`1px solid ${C.border}`, color:importing===source.id?C.dim:C.sky, display:"grid", placeItems:"center" }} title={`${source.label} Export importieren`}><Upload size={17}/><input type="file" accept=".json,.csv,.xml,text/csv,application/json,application/xml" disabled={importing===source.id} onChange={event=>{importFile(source.id,event.target.files?.[0]);event.target.value=""}} style={{ display:"none" }}/></label>
              </div>;
            })}</div>
          </section>
          <section style={{ ...card, borderColor:`${C.gold}24` }}><SectionLabel color={C.gold}>Automatischer Sync</SectionLabel><p style={{ margin:0, color:C.sub, fontSize:12, lineHeight:1.6 }}>Direkter Hintergrund-Sync benötigt OAuth-Zugangsdaten von Strava/Garmin beziehungsweise eine native iOS-/Android-App für Apple Health und Health Connect. Der lokale Import ist bereits vollständig nutzbar und duplikatsicher.</p></section>
        </>}
      </main>
    </div>
  );
}
