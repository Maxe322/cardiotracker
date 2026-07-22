import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Flag, HeartPulse, MapPin, Pause, Play, SkipForward, X } from "lucide-react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatTimer = seconds => {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

function makeBlocks(session) {
  const total = Math.max(60, Number(session.duration || 30) * 60);
  if (session.type === "intervals") {
    const warmup = Math.round(total * 0.2);
    const cooldown = Math.round(total * 0.15);
    const middle = total - warmup - cooldown;
    const rounds = Math.max(1, Math.round(middle / 300));
    const fast = Math.round((middle / rounds) * 0.58);
    const recovery = Math.round((middle / rounds) - fast);
    return [
      { label: "Warm-up", seconds: warmup, intensity: "Locker einlaufen" },
      ...Array.from({ length: rounds }).flatMap((_, index) => [
        { label: `Intervall ${index + 1}`, seconds: fast, intensity: "Schnell · RPE 8–9" },
        { label: `Erholung ${index + 1}`, seconds: recovery, intensity: "Sehr locker" },
      ]),
      { label: "Cool-down", seconds: cooldown, intensity: "Puls beruhigen" },
    ];
  }
  if (session.type === "tempo") {
    return [
      { label: "Warm-up", seconds: Math.round(total * 0.2), intensity: "Locker" },
      { label: "Tempo", seconds: Math.round(total * 0.62), intensity: "Schwelle · RPE 7–8" },
      { label: "Cool-down", seconds: total - Math.round(total * 0.82), intensity: "Locker auslaufen" },
    ];
  }
  return [{ label: session.title || "Training", seconds: total, intensity: session.type === "easy" ? "Recovery" : "Gleichmäßig" }];
}

export default function LiveCardio({ C, session, onFinish, onCancel }) {
  const blocks = useMemo(() => makeBlocks(session), [session]);
  const totalSeconds = blocks.reduce((sum, block) => sum + block.seconds, 0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [distance, setDistance] = useState(session.estimatedDistance || 0);
  const [heartRate, setHeartRate] = useState(session.hrAvg || 0);
  const [rpe, setRpe] = useState(6);
  const [laps, setLaps] = useState([]);
  const runningSince = useRef(Date.now());
  const baseElapsed = useRef(0);
  const lastBlock = useRef(0);

  useEffect(() => {
    if (!running || finishing) return undefined;
    const timer = setInterval(() => {
      const next = baseElapsed.current + (Date.now() - runningSince.current) / 1000;
      setElapsed(next);
      if (next >= totalSeconds) {
        baseElapsed.current = totalSeconds;
        setElapsed(totalSeconds);
        setRunning(false);
        setFinishing(true);
        try { navigator.vibrate?.([250, 120, 250]); } catch {}
      }
    }, 250);
    return () => clearInterval(timer);
  }, [running, finishing, totalSeconds]);

  const boundaries = useMemo(() => {
    let sum = 0;
    return blocks.map(block => { const start = sum; sum += block.seconds; return { ...block, start, end: sum }; });
  }, [blocks]);
  const blockIndex = Math.min(boundaries.findIndex(block => elapsed < block.end) === -1 ? boundaries.length - 1 : boundaries.findIndex(block => elapsed < block.end), boundaries.length - 1);
  const currentBlock = boundaries[blockIndex];

  useEffect(() => {
    if (blockIndex === lastBlock.current) return;
    lastBlock.current = blockIndex;
    try { navigator.vibrate?.([120, 80, 120]); } catch {}
  }, [blockIndex]);

  const toggle = () => {
    if (running) {
      baseElapsed.current = elapsed;
      setRunning(false);
    } else {
      runningSince.current = Date.now();
      baseElapsed.current = elapsed;
      setRunning(true);
    }
  };

  const skipBlock = () => {
    const next = currentBlock.end;
    baseElapsed.current = next;
    runningSince.current = Date.now();
    setElapsed(next);
  };

  const complete = () => {
    baseElapsed.current = elapsed;
    setRunning(false);
    setFinishing(true);
  };

  const cancel = () => {
    if (elapsed > 30 && !window.confirm("Live-Training wirklich abbrechen? Der Timerstand geht verloren.")) return;
    onCancel();
  };

  const progress = clamp(elapsed / totalSeconds * 100, 0, 100);
  const blockProgress = clamp((elapsed - currentBlock.start) / Math.max(1, currentBlock.seconds) * 100, 0, 100);

  return (
    <div className="live-cardio" role="dialog" aria-modal="true" aria-label={`Live-Training ${session.title}`} style={{ position:"fixed", inset:0, zIndex:500, background:C.bg, color:C.text, fontFamily:"'Manrope',sans-serif", overflowY:"auto" }}>
      <div style={{ minHeight:"100%", width:"min(100%, 720px)", margin:"0 auto", padding:"calc(18px + env(safe-area-inset-top, 0px)) 20px calc(28px + env(safe-area-inset-bottom, 0px))", display:"flex", flexDirection:"column" }}>
        <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:3, color:C.ember, fontWeight:800 }}>LIVE COCKPIT</div>
            <h1 style={{ margin:"5px 0 0", fontSize:22, lineHeight:1.15 }}>{session.title}</h1>
          </div>
          <button className="icon-button" aria-label="Live-Training schließen" onClick={cancel} style={{ width:42, height:42, borderRadius:13, display:"grid", placeItems:"center", background:C.card, border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer" }}><X size={19}/></button>
        </header>

        {!finishing ? (
          <>
            <div style={{ margin:"26px 0 16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:24, padding:"24px 20px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:"auto 0 0", height:4, background:C.card }}><div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg, ${C.ember}, ${C.sky})`, transition:"width .25s linear" }}/></div>
              <div style={{ fontSize:10, color:C.muted, letterSpacing:2, fontWeight:700 }}>GESAMTZEIT</div>
              <div aria-live="polite" style={{ fontSize:"clamp(54px, 15vw, 92px)", fontWeight:800, letterSpacing:-5, fontVariantNumeric:"tabular-nums", lineHeight:1.05, margin:"10px 0", color:running?C.text:C.gold }}>{formatTimer(elapsed)}</div>
              <div style={{ fontSize:13, color:C.dim }}>Ziel {formatTimer(totalSeconds)} · {Math.round(progress)}%</div>
            </div>

            <div style={{ background:`linear-gradient(135deg, ${C.emberBg}, ${C.surface})`, border:`1px solid ${C.ember}30`, borderRadius:20, padding:"18px 18px 16px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:10, color:C.ember, letterSpacing:2, fontWeight:800 }}>JETZT · {blockIndex + 1}/{blocks.length}</div>
                  <div style={{ fontSize:22, fontWeight:800, marginTop:4 }}>{currentBlock.label}</div>
                  <div style={{ fontSize:13, color:C.sub, marginTop:3 }}>{currentBlock.intensity}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:10, color:C.muted }}>VERBLEIBEND</div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.ember, fontVariantNumeric:"tabular-nums" }}>{formatTimer(currentBlock.end - elapsed)}</div>
                </div>
              </div>
              <div style={{ height:5, background:C.card, borderRadius:4, overflow:"hidden", marginTop:16 }}><div style={{ height:"100%", width:`${blockProgress}%`, background:C.ember, borderRadius:4, transition:"width .25s linear" }}/></div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:10, marginBottom:18 }}>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"14px 16px", display:"flex", gap:10, alignItems:"center" }}><HeartPulse size={18} color={C.ember}/><div><div style={{ fontSize:9, color:C.dim, letterSpacing:1.2 }}>HR-ZIEL</div><div style={{ fontSize:14, fontWeight:700 }}>{session.hr || "nach Gefühl"}</div></div></div>
              <button onClick={()=>setLaps(list => [...list, Math.round(elapsed)])} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"14px 16px", display:"flex", gap:10, alignItems:"center", color:C.text, cursor:"pointer", textAlign:"left" }}><Flag size={18} color={C.sky}/><div><div style={{ fontSize:9, color:C.dim, letterSpacing:1.2 }}>RUNDEN</div><div style={{ fontSize:14, fontWeight:700 }}>{laps.length} markieren</div></div></button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr 1fr", gap:10, marginTop:"auto" }}>
              <button aria-label="Aktuellen Abschnitt überspringen" onClick={skipBlock} disabled={blocks.length === 1} style={{ height:62, borderRadius:18, display:"grid", placeItems:"center", background:C.surface, border:`1px solid ${C.border}`, color:blocks.length===1?C.dim:C.sky, cursor:blocks.length===1?"default":"pointer" }}><SkipForward size={23}/></button>
              <button aria-label={running?"Training pausieren":"Training fortsetzen"} onClick={toggle} style={{ height:62, borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", gap:9, background:`linear-gradient(135deg, ${C.ember}, #a87a52)`, border:"none", color:"#0a0a0f", fontWeight:800, cursor:"pointer" }}>{running?<Pause size={23}/>:<Play size={23}/>} {running?"Pause":"Weiter"}</button>
              <button aria-label="Training abschließen" onClick={complete} style={{ height:62, borderRadius:18, display:"grid", placeItems:"center", background:C.limeBg, border:`1px solid ${C.lime}35`, color:C.lime, cursor:"pointer" }}><Check size={24}/></button>
            </div>
          </>
        ) : (
          <div style={{ margin:"34px 0 0", animation:"fadeUp .25s ease" }}>
            <div style={{ width:64, height:64, borderRadius:22, background:C.limeBg, border:`1px solid ${C.lime}35`, display:"grid", placeItems:"center", color:C.lime, marginBottom:18 }}><Check size={30}/></div>
            <h2 style={{ fontSize:32, margin:"0 0 6px" }}>Training abschließen</h2>
            <p style={{ color:C.muted, margin:"0 0 24px", lineHeight:1.5 }}>{formatTimer(elapsed)} aktiv · {laps.length} Rundenmarkierungen</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <label style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"13px 14px" }}><span style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:C.muted, marginBottom:8 }}><MapPin size={14}/> DISTANZ KM</span><input type="number" min="0" step="0.1" value={distance} onChange={event=>setDistance(event.target.value)} style={{ width:"100%", border:"none", outline:"none", background:"transparent", color:C.text, fontSize:24, fontWeight:800 }}/></label>
              <label style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"13px 14px" }}><span style={{ display:"flex", alignItems:"center", gap:6, fontSize:10, color:C.muted, marginBottom:8 }}><HeartPulse size={14}/> Ø HERZFREQUENZ</span><input type="number" min="0" max="240" value={heartRate} onChange={event=>setHeartRate(event.target.value)} style={{ width:"100%", border:"none", outline:"none", background:"transparent", color:C.text, fontSize:24, fontWeight:800 }}/></label>
            </div>
            <label style={{ display:"block", background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"14px 16px", marginTop:10 }}><span style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginBottom:10 }}><span>ANSTRENGUNG</span><strong style={{ color:C.ember }}>RPE {rpe}/10</strong></span><input aria-label="Anstrengung RPE" type="range" min="1" max="10" value={rpe} onChange={event=>setRpe(Number(event.target.value))} style={{ width:"100%" }}/></label>
            <button onClick={()=>onFinish({ duration:Math.max(1, Math.round(elapsed / 60)), distance:Number(distance)||0, hrAvg:Number(heartRate)||0, rpe, laps })} style={{ width:"100%", padding:"17px 0", borderRadius:16, border:"none", background:`linear-gradient(135deg, ${C.ember}, #a87a52)`, color:"#0a0a0f", fontWeight:800, fontSize:15, marginTop:18, cursor:"pointer" }}>Speichern & abschließen</button>
            <button onClick={()=>{setFinishing(false);runningSince.current=Date.now();baseElapsed.current=elapsed;setRunning(true)}} style={{ width:"100%", padding:"13px 0", border:"none", background:"transparent", color:C.muted, cursor:"pointer" }}>Weitertrainieren</button>
          </div>
        )}
      </div>
    </div>
  );
}

