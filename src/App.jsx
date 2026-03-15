import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, AreaChart, Area, LineChart, Line
} from "recharts";

const C = {
  bg: "#0A0A08", surface: "#141412", card: "#1C1C19", elevated: "#242420",
  border: "#2A2A26", borderLight: "#363630",
  text: "#F2EDE7", sub: "rgba(242,237,231,0.72)", muted: "rgba(242,237,231,0.44)", dim: "rgba(242,237,231,0.2)",
  ember: "#E8553A", emberBg: "rgba(232,85,58,0.12)",
  sky: "#4AABDD", skyBg: "rgba(74,171,221,0.12)",
  gold: "#D4A024", goldBg: "rgba(212,160,36,0.12)",
  lime: "#8BC34A", limeBg: "rgba(139,195,74,0.12)",
  violet: "#9C7BF2", violetBg: "rgba(156,123,242,0.12)",
};

const TYPES = [
  { id: "zone2", label: "Zone 2", icon: "Z2", color: C.sky, bg: C.skyBg, desc: "Aerobe Basis", estPace: 7.0 },
  { id: "intervals", label: "Intervalle", icon: "HI", color: C.ember, bg: C.emberBg, desc: "VO2max Boost", estPace: 5.5 },
  { id: "tempo", label: "Tempo", icon: "TH", color: C.gold, bg: C.goldBg, desc: "Schwelle", estPace: 5.8 },
  { id: "easy", label: "Easy", icon: "EZ", color: C.lime, bg: C.limeBg, desc: "Recovery", estPace: 7.5 },
  { id: "cycling", label: "Rad", icon: "RD", color: C.violet, bg: C.violetBg, desc: "Cross-Training", estPace: 0 },
  { id: "other", label: "Andere", icon: "XX", color: C.muted, bg: C.dim, desc: "", estPace: 0 },
];

const PLAN = [
  { week:1, phase:"AUFBAU", pc:C.sky, focus:"Locker starten. Körper gewöhnt sich an Cardio neben Kraft.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:30, hr:"130-140", notes:"Ganz locker. Du solltest dich unterhalten können. Draußen laufen für Tageslicht!" },
    { day:"Mi", type:"intervals", title:"Kurze Intervalle", duration:25, hr:"160-170", notes:"4x2 Min schnell, 2 Min locker. Vorher 8 Min Aufwärmen." },
    { day:"Fr", type:"easy", title:"Easy Run", duration:20, hr:"110-130", notes:"Wirklich langsam. Aktive Erholung neben dem Krafttraining." },
  ]},
  { week:2, phase:"AUFBAU", pc:C.sky, focus:"Leichte Steigerung der Dauer. Tempo bleibt gleich.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:35, hr:"130-140", notes:"+5 Min gegenüber letzter Woche. Gleiches lockeres Tempo." },
    { day:"Mi", type:"intervals", title:"Intervalle", duration:28, hr:"160-170", notes:"4x3 Min schnell, 2 Min Pause. Intervall-Länge steigt." },
    { day:"Fr", type:"easy", title:"Easy Run", duration:25, hr:"110-130", notes:"Lockerer Dauerlauf. Fokus auf Laufgefühl und Atmung." },
  ]},
  { week:3, phase:"AUFBAU", pc:C.sky, focus:"Letzte Aufbau-Woche. Körper adaptiert sich.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:40, hr:"130-145", notes:"40 Min Zone 2. Tempo darf leicht anziehen." },
    { day:"Mi", type:"intervals", title:"Intervalle", duration:30, hr:"160-175", notes:"5x3 Min schnell, 2 Min Pause." },
    { day:"Sa", type:"easy", title:"Easy Run", duration:25, hr:"110-130", notes:"Samstag statt Freitag — mehr Erholung vor Woche 4." },
  ]},
  { week:4, phase:"STEIGERUNG", pc:C.lime, focus:"Jetzt wird ernst. Volumen und Intensität steigen.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:45, hr:"130-145", notes:"45 Min durchlaufen in Zone 2." },
    { day:"Mi", type:"intervals", title:"Intervalle", duration:32, hr:"160-175", notes:"5x4 Min schnell, 3 Min Pause. Das Kernstück." },
    { day:"Fr", type:"easy", title:"Easy Recovery", duration:25, hr:"110-130", notes:"Regeneration. Auch als Walking möglich." },
  ]},
  { week:5, phase:"STEIGERUNG", pc:C.lime, focus:"Tempo Run kommt dazu. Dreifacher Reiz.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:50, hr:"130-145", notes:"50 Min — längster Lauf bisher." },
    { day:"Mi", type:"tempo", title:"Tempo Run", duration:30, hr:"150-160", notes:"10 Min Warmup, 15 Min Tempo, 5 Min Cool Down." },
    { day:"Sa", type:"easy", title:"Easy Run", duration:30, hr:"110-130", notes:"Lockerer 30er. Draußen für Tageslicht!" },
  ]},
  { week:6, phase:"STEIGERUNG", pc:C.lime, focus:"Höchste Steigerungswoche. Auf Recovery achten.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:50, hr:"130-145", notes:"Volumen halten. Gleichmäßige HR." },
    { day:"Mi", type:"intervals", title:"Intervalle", duration:35, hr:"160-175", notes:"6x4 Min schnell, 3 Min Pause. Volle Power." },
    { day:"Fr", type:"tempo", title:"Tempo Run", duration:30, hr:"150-165", notes:"10 Min warm, 15 Min Schwelle, 5 Min cool down." },
  ]},
  { week:7, phase:"PEAK", pc:C.ember, focus:"Peak-Woche 1. Höchstes Volumen. Gut essen und schlafen!", sessions:[
    { day:"Mo", type:"zone2", title:"Langer Zone 2", duration:55, hr:"130-145", notes:"Peak-Woche. Höchstes Volumen." },
    { day:"Mi", type:"intervals", title:"Intervalle", duration:38, hr:"165-175", notes:"6x4 Min bei 90-95% Max-HR." },
    { day:"Fr", type:"easy", title:"Easy Recovery", duration:25, hr:"110-125", notes:"Nicht pushen nach harten Sessions." },
    { day:"So", type:"cycling", title:"Rad (optional)", duration:40, hr:"120-140", notes:"Bonus ohne Lauf-Impact auf Gelenke." },
  ]},
  { week:8, phase:"PEAK", pc:C.ember, focus:"Peak-Woche 2. Dein höchster Einzellauf.", sessions:[
    { day:"Mo", type:"zone2", title:"Langer Zone 2", duration:60, hr:"130-145", notes:"60 Min! Längster Lauf des Plans." },
    { day:"Mi", type:"tempo", title:"Tempo Run", duration:35, hr:"150-165", notes:"10 Min warm, 20 Min Schwelle, 5 Min cool." },
    { day:"Fr", type:"intervals", title:"Intervalle", duration:35, hr:"165-175", notes:"5x4 Min hart. Letzte harte Woche." },
  ]},
  { week:9, phase:"TAPER", pc:C.violet, focus:"Volumen runter, Intensität halten. Körper adaptiert.", sessions:[
    { day:"Mo", type:"zone2", title:"Zone 2 Lauf", duration:45, hr:"130-145", notes:"Supercompensation läuft." },
    { day:"Mi", type:"intervals", title:"Kurze Intervalle", duration:28, hr:"160-175", notes:"4x3 Min. Volumen reduziert." },
    { day:"Fr", type:"easy", title:"Easy Run", duration:25, hr:"110-130", notes:"Schlaf und Ernährung priorisieren." },
  ]},
  { week:10, phase:"TEST", pc:C.gold, focus:"Abschluss-Woche. Zeig was du aufgebaut hast.", sessions:[
    { day:"Mo", type:"easy", title:"Easy Shakeout", duration:20, hr:"110-130", notes:"Kurz und locker vor dem Test." },
    { day:"Mi", type:"tempo", title:"VO2max Testlauf", duration:35, hr:"All-Out", notes:"12 Min Warmup, dann 20 Min All-Out!" },
    { day:"Fr", type:"easy", title:"Cool-Down Run", duration:20, hr:"110-125", notes:"Geschafft! Programm abgeschlossen." },
  ]},
];

const KEY = "cardio-v4";
const getMon = d => { const t=new Date(d),dy=t.getDay(); t.setDate(t.getDate()-dy+(dy===0?-6:1)); return t; };
const getWk = d => { const t=new Date(d),j=new Date(t.getFullYear(),0,1),dy=Math.floor((t-j)/864e5); return `${t.getFullYear()}-W${String(Math.ceil((dy+j.getDay()+1)/7)).padStart(2,"0")}`; };
const fS = d => new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"});
const fL = d => new Date(d).toLocaleDateString("de-DE",{day:"2-digit",month:"short"});
const parseHrMid = s => { const m=s.match(/(\d+)\s*-\s*(\d+)/); return m ? Math.round((+m[1]+ +m[2])/2) : parseInt(s)||140; };
const estDist = (type, dur) => { const t=TYPES.find(x=>x.id===type); return t?.estPace>0 ? Math.round(dur/t.estPace*10)/10 : 0; };

const tt = { contentStyle:{ background:C.elevated, border:`1px solid ${C.borderLight}`, borderRadius:10, fontSize:12, fontFamily:"'Outfit',sans-serif", color:C.text }, labelStyle:{color:C.muted} };

function Ring({pct,color,size=64,sw=6,children}){
  const r=(size-sw)/2,c=2*Math.PI*r,o=c-(Math.min(Math.max(pct,0),100)/100)*c;
  return(<div style={{position:"relative",width:size,height:size}}>
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth={sw}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 4px ${color}44)`}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>
  </div>);
}
function TI({type,size=36}){
  const t=TYPES.find(x=>x.id===type)||TYPES[5];
  return(<div style={{width:size,height:size,borderRadius:size*0.32,background:t.bg,border:`1.5px solid ${t.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:800,color:t.color,letterSpacing:-0.5,fontFamily:"'Outfit',sans-serif",flexShrink:0}}>{t.icon}</div>);
}

export default function App(){
  const [data, setData] = useState({ workouts:[], startDate:null });
  const [view, setView] = useState("dash");
  const [modal, setModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [planWeek, setPlanWeek] = useState(1);
  const [editId, setEditId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [undo, setUndo] = useState(null);
  const [filter, setFilter] = useState("all");
  const [statRange, setStatRange] = useState("month");
  const [showPlanOverview, setShowPlanOverview] = useState(false);
  const [sRpe, setSRpe] = useState(5);
  const [sDist, setSDist] = useState(0);
  const pillRef = useRef(null);

  const openSheet = (week, session) => {
    setSRpe(5);
    setSDist(estDist(session.type, session.duration));
    setSheet({ week, session });
  };

  const [f, setF] = useState({type:"zone2",dur:45,dist:5,hr:138,date:new Date().toISOString().slice(0,10),note:"",rpe:5});
  const up = (k,v)=>setF(p=>({...p,[k]:v}));

  const workouts = data.workouts;
  const startDate = data.startDate;

  useEffect(()=>{
    (async()=>{
      try{ const r=localStorage.getItem(KEY); if(r) setData(JSON.parse(r)); }catch{}
      setLoaded(true);
    })();
  },[]);

  const persist = useCallback(d=>{try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}},[]);
  const update = useCallback((fn)=>{
    setData(prev=>{const next={...prev,...fn(prev)};persist(next);return next;});
  },[persist]);

  const setStartDate = (d)=> update(()=>({startDate:d}));

  // Auto-detect current plan week
  const currentPlanWeek = startDate ? (()=>{
    const start = getMon(new Date(startDate));
    const now = getMon(new Date());
    const diff = Math.floor((now-start)/(7*864e5))+1;
    return Math.max(1,Math.min(10,diff));
  })() : null;

  useEffect(()=>{ if(currentPlanWeek && planWeek !== currentPlanWeek) setPlanWeek(currentPlanWeek); },[currentPlanWeek]);

  // Today's planned session
  const todayDayName = ["So","Mo","Di","Mi","Do","Fr","Sa"][new Date().getDay()];
  const todaySessions = currentPlanWeek ? (PLAN.find(p=>p.week===currentPlanWeek)?.sessions.filter(s=>s.day===todayDayName)||[]) : [];

  const doSave = ()=>{
    const w={id:editId||Date.now().toString(),type:f.type,duration:+f.dur,distance:+f.dist,hrAvg:+f.hr,date:f.date,note:f.note,rpe:+f.rpe,planRef:f.planRef||null};
    update(prev=>{
      let next=editId?prev.workouts.map(x=>x.id===editId?w:x):[...prev.workouts,w];
      next.sort((a,b)=>b.date.localeCompare(a.date));
      return{workouts:next};
    });
    closeModal();
  };

  const quickComplete = (session,week,rpe,dist)=>{
    const w={id:Date.now().toString(),type:session.type,duration:session.duration,distance:dist,hrAvg:parseHrMid(session.hr),date:new Date().toISOString().slice(0,10),note:`W${week} ${session.title}`,rpe,planRef:`w${week}-${session.day}-${startDate||'x'}`};
    update(prev=>({workouts:[...prev.workouts,w].sort((a,b)=>b.date.localeCompare(a.date))}));
    setSheet(null);
  };

  const openPrefilled = (session,week)=>{
    const d=estDist(session.type,session.duration);
    setEditId(null);
    setF({type:session.type,dur:session.duration,dist:d,hr:parseHrMid(session.hr),date:new Date().toISOString().slice(0,10),note:`W${week} ${session.title}`,rpe:5,planRef:`w${week}-${session.day}-${startDate||'x'}`});
    setModal(true); setSheet(null);
  };

  const remove = id=>{
    const removed=workouts.find(w=>w.id===id);
    update(prev=>({workouts:prev.workouts.filter(w=>w.id!==id)}));
    if(removed){setUndo(removed);setTimeout(()=>setUndo(u=>u?.id===removed.id?null:u),6000);}
  };
  const restoreUndo = ()=>{
    if(!undo)return;
    update(prev=>({workouts:[...prev.workouts,undo].sort((a,b)=>b.date.localeCompare(a.date))}));
    setUndo(null);
  };

  const startEdit = w=>{setEditId(w.id);setF({type:w.type,dur:w.duration,dist:w.distance,hr:w.hrAvg,date:w.date,note:w.note||"",rpe:w.rpe||5,planRef:w.planRef});setModal(true);};
  const closeModal = ()=>{setModal(false);setEditId(null);setF({type:"zone2",dur:45,dist:5,hr:138,date:new Date().toISOString().slice(0,10),note:"",rpe:5});};

  const isDone = (week,day)=>workouts.some(w=>w.planRef===`w${week}-${day}-${startDate||'x'}`);
  const doneCount = week=>PLAN.find(p=>p.week===week)?.sessions.filter(s=>isDone(week,s.day)).length||0;

  const today = new Date().toISOString().slice(0,10);
  const wkId = getWk(today);
  const wk = workouts.filter(w=>getWk(w.date)===wkId);
  const wkMin = wk.reduce((s,w)=>s+w.duration,0);
  const wkSess = wk.length;
  const z2Min = wk.filter(w=>w.type==="zone2"||w.type==="easy").reduce((s,w)=>s+w.duration,0);
  const z2Pct = wkMin>0?Math.round(z2Min/wkMin*100):0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(),now.getMonth(),1).toISOString().slice(0,10);
  const monthWo = workouts.filter(w=>w.date>=monthStart);
  const totalKm = (statRange==="month"?monthWo:workouts).reduce((s,w)=>s+(w.distance||0),0);
  const totalMin = (statRange==="month"?monthWo:workouts).reduce((s,w)=>s+w.duration,0);
  const totalSess = (statRange==="month"?monthWo:workouts).length;

  const weeklyHist=[];
  for(let i=11;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i*7);const id=getWk(d.toISOString().slice(0,10));const m=getMon(new Date(d));weeklyHist.push({w:`${m.getDate()}.${m.getMonth()+1}`,min:workouts.filter(w=>getWk(w.date)===id).reduce((s,w)=>s+w.duration,0)});}
  const hrTrend=workouts.slice().reverse().slice(-20).map(w=>({d:fS(w.date),hr:w.hrAvg}));

  const weekDays=[];
  const mon=getMon(new Date());
  for(let i=0;i<7;i++){const dd=new Date(mon);dd.setDate(mon.getDate()+i);const ds=dd.toISOString().slice(0,10);weekDays.push({day:["Mo","Di","Mi","Do","Fr","Sa","So"][i],date:ds,done:workouts.filter(w=>w.date===ds),isToday:ds===today});}

  const curPlan=PLAN.find(p=>p.week===planWeek);
  const filtered=filter==="all"?workouts:workouts.filter(w=>w.type===filter);

  if(!loaded)return(<div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:24,height:24,border:`3px solid ${C.ember}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  const inp={width:"100%",padding:"13px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box"};

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Outfit',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pop{0%{transform:scale(.95);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input[type=range]{accent-color:${C.ember}}::-webkit-scrollbar{width:0;height:0}
      `}</style>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,borderBottom:`1px solid ${C.border}`,background:"rgba(10,10,8,0.88)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)"}}>
        <div style={{padding:"16px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.ember,letterSpacing:2.5,textTransform:"uppercase",marginBottom:2}}>CARDIO TRACKER</div>
            <div style={{fontSize:26,fontWeight:800,letterSpacing:-1}}>10-Wochen-Plan</div>
          </div>
          <button onClick={()=>{closeModal();setModal(true)}} style={{width:44,height:44,borderRadius:14,background:C.ember,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:"#fff",fontWeight:300,lineHeight:1,boxShadow:`0 4px 20px ${C.ember}44`}}>+</button>
        </div>
        <div style={{display:"flex",gap:0,padding:"14px 20px 0"}}>
          {[["dash","Übersicht"],["plan","Programm"],["history","Verlauf"]].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:"8px 18px 12px",background:"transparent",border:"none",borderBottom:view===k?`2.5px solid ${C.ember}`:"2.5px solid transparent",color:view===k?C.text:C.muted,fontSize:14,fontWeight:view===k?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* UNDO TOAST */}
      {undo&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:200,background:C.elevated,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",animation:"fadeUp 0.25s ease",fontFamily:"'Outfit',sans-serif"}}>
          <span style={{fontSize:14,color:C.sub}}>Workout gelöscht</span>
          <button onClick={restoreUndo} style={{padding:"6px 16px",background:C.ember,color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Rückgängig</button>
        </div>
      )}

      {/* COMPLETE SHEET */}
      {sheet&&(()=>{
        const s=sheet.session,t=TYPES.find(x=>x.id===s.type)||TYPES[5],done=isDone(sheet.week,s.day);
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setSheet(null)}}>
            <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",animation:"slideUp 0.25s ease-out"}}>
              <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 20px"}}/>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                <TI type={s.type} size={48}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:20,fontWeight:800}}>{s.title}</div>
                  <div style={{fontSize:13,color:C.muted}}>Woche {sheet.week} &middot; {s.day} &middot; {s.duration} min</div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{background:C.card,borderRadius:14,padding:"14px 18px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>HR-Ziel</div>
                  <div style={{fontSize:15,color:t.color,fontWeight:700}}>{s.hr} bpm</div>
                </div>
                <div style={{background:C.card,borderRadius:14,padding:"14px 18px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:600}}>{t.desc}</div>
                  <div style={{fontSize:15,color:C.sub,fontWeight:700}}>{s.duration} min</div>
                </div>
              </div>

              <div style={{background:C.card,borderRadius:14,padding:"14px 18px",marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,color:C.sub,lineHeight:1.5}}>{s.notes}</div>
              </div>

              {done?(
                <div style={{padding:"15px 0",background:C.limeBg,border:`1px solid ${C.lime}30`,borderRadius:14,textAlign:"center",color:C.lime,fontSize:16,fontWeight:700}}>Bereits abgeschlossen &#10003;</div>
              ):(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                    <div>
                      <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>Distanz (km)</div>
                      <input type="number" value={sDist} onChange={e=>setSDist(+e.target.value)} step={0.1} min={0} style={inp}/>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:600}}>RPE <span style={{color:C.ember,fontWeight:800}}>{sRpe}</span>/10</div>
                      <div style={{padding:"10px 0"}}><input type="range" min={1} max={10} value={sRpe} onChange={e=>setSRpe(+e.target.value)} style={{width:"100%"}}/></div>
                    </div>
                  </div>
                  <button onClick={()=>quickComplete(s,sheet.week,sRpe,sDist)} style={{width:"100%",padding:"15px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${C.ember}44`,marginBottom:8}}>Abgeschlossen</button>
                  <button onClick={()=>openPrefilled(s,sheet.week)} style={{width:"100%",padding:"13px 0",background:C.card,color:C.sub,border:`1px solid ${C.border}`,borderRadius:14,fontSize:14,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Alle Details bearbeiten</button>
                </>
              )}
              <button onClick={()=>setSheet(null)} style={{width:"100%",padding:"12px 0",background:"transparent",color:C.muted,border:"none",fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>Schließen</button>
            </div>
          </div>
        );
      })()}

      {/* MODAL */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div style={{background:C.surface,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,padding:"16px 22px 36px",maxHeight:"88vh",overflowY:"auto",animation:"slideUp 0.25s ease-out"}}>
            <div style={{width:40,height:5,borderRadius:3,background:C.border,margin:"0 auto 20px"}}/>
            <div style={{fontSize:22,fontWeight:800,marginBottom:22,letterSpacing:-0.5}}>{editId?"Bearbeiten":"Neues Workout"}</div>
            <div style={{marginBottom:18}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:8,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>Typ</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {TYPES.map(t=>(<button key={t.id} onClick={()=>up("type",t.id)} style={{padding:"14px 6px 10px",background:f.type===t.id?t.bg:C.card,border:f.type===t.id?`2px solid ${t.color}`:`1.5px solid ${C.border}`,borderRadius:14,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:f.type===t.id?t.color:C.dim,marginBottom:4}}>{t.icon}</div><div style={{fontSize:12,fontWeight:600,color:f.type===t.id?t.color:C.muted}}>{t.label}</div></button>))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {[["date","Datum","date",f.date],["dur","Dauer (Min)","number",f.dur],["dist","Distanz (km)","number",f.dist],["hr","Avg. HR","number",f.hr]].map(([k,label,type,val])=>(<div key={k}><div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>{label}</div><input type={type} value={val} onChange={e=>up(k,e.target.value)} step={k==="dist"?0.1:1} style={inp}/></div>))}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:600}}>RPE <span style={{color:C.ember,fontWeight:800}}>{f.rpe}</span>/10</div>
              <input type="range" min={1} max={10} value={f.rpe} onChange={e=>up("rpe",e.target.value)} style={{width:"100%"}}/>
            </div>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:600}}>Notiz</div>
              <input value={f.note} onChange={e=>up("note",e.target.value)} placeholder="Optional..." style={inp}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={doSave} style={{flex:1,padding:"15px 0",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 16px ${C.ember}44`}}>{editId?"Speichern":"Eintragen"}</button>
              <button onClick={closeModal} style={{padding:"15px 22px",background:C.card,color:C.muted,border:`1px solid ${C.border}`,borderRadius:14,fontSize:15,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Abb.</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div style={{padding:"22px 20px 48px"}}>

        {/* ═══ DASHBOARD ═══ */}
        {view==="dash"&&(
          <div style={{animation:"fadeIn 0.35s ease"}}>

            {/* Start date setup */}
            {!startDate&&(
              <div style={{background:`linear-gradient(135deg, ${C.emberBg}, ${C.surface})`,borderRadius:20,padding:"22px 20px",border:`1px solid ${C.ember}30`,marginBottom:18,animation:"fadeUp 0.3s ease"}}>
                <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>Plan starten</div>
                <div style={{fontSize:13,color:C.sub,marginBottom:14,lineHeight:1.5}}>Wähle den Montag, an dem dein 10-Wochen-Plan beginnt. Die App erkennt dann automatisch deine aktuelle Woche.</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <input type="date" defaultValue={getMon(new Date()).toISOString().slice(0,10)} id="sd" style={{...inp,flex:1}}/>
                  <button onClick={()=>{const v=document.getElementById("sd").value;if(v)setStartDate(v)}} style={{padding:"13px 22px",background:C.ember,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>Starten</button>
                </div>
              </div>
            )}

            {/* Today's session */}
            {startDate && todaySessions.length>0 && (()=>{
              const s=todaySessions[0],t=TYPES.find(x=>x.id===s.type),done=isDone(currentPlanWeek,s.day);
              return(
                <div onClick={()=>!done&&openSheet(currentPlanWeek,s)} style={{background:done?`${C.lime}08`:C.surface,borderRadius:20,padding:"20px 20px",border:done?`1px solid ${C.lime}30`:`1px solid ${C.ember}30`,marginBottom:18,cursor:done?"default":"pointer",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:0,left:0,bottom:0,width:4,background:done?C.lime:t?.color}}/>
                  <div style={{fontSize:11,fontWeight:700,color:done?C.lime:C.ember,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>
                    {done?"HEUTE ERLEDIGT":"HEUTE"}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <TI type={s.type} size={46}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:18,fontWeight:800}}>{s.title}</div>
                      <div style={{fontSize:13,color:C.muted}}>W{currentPlanWeek} &middot; {s.duration} min &middot; {s.hr} bpm</div>
                    </div>
                    {done?(
                      <div style={{width:40,height:40,borderRadius:20,background:C.limeBg,border:`1.5px solid ${C.lime}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.lime}}>&#10003;</div>
                    ):(
                      <div style={{padding:"10px 18px",background:C.ember,borderRadius:12,color:"#fff",fontSize:13,fontWeight:700}}>Los</div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Rings */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:22}}>
              {[{label:"Sessions",val:wkSess,target:3,color:C.ember,fmt:`${wkSess}/3`},{label:"Minuten",val:wkMin,target:150,color:C.sky,fmt:`${wkMin}`},{label:"Zone 2 %",val:z2Pct,target:80,color:C.lime,fmt:`${z2Pct}%`}].map((g,i)=>(
                <div key={i} style={{background:C.surface,borderRadius:20,padding:"22px 10px 16px",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                  <Ring pct={g.val/g.target*100} color={g.color} size={70} sw={7}><span style={{fontSize:16,fontWeight:800,color:g.color,letterSpacing:-0.5}}>{g.fmt}</span></Ring>
                  <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{g.label}</div>
                </div>
              ))}
            </div>

            {/* Week strip */}
            <div style={{background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4}}>DIESE WOCHE</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5}}>
                {weekDays.map((d,i)=>{
                  const dn=d.done.length>0,t=dn?TYPES.find(x=>x.id===d.done[0].type):null;
                  const planned=currentPlanWeek?PLAN.find(p=>p.week===currentPlanWeek)?.sessions.find(s=>s.day===d.day):null;
                  const pt=planned?TYPES.find(x=>x.id===planned.type):null;
                  return(
                    <div key={i} style={{borderRadius:14,padding:"10px 2px",textAlign:"center",background:d.isToday?C.elevated:"transparent",border:d.isToday?`1.5px solid ${C.ember}30`:"1.5px solid transparent"}}>
                      <div style={{fontSize:11,fontWeight:700,color:d.isToday?C.text:C.dim,marginBottom:8}}>{d.day}</div>
                      {dn?(
                        <><TI type={d.done[0].type} size={30}/><div style={{fontSize:10,color:t?.color,fontWeight:700,marginTop:5}}>{d.done[0].duration}m</div></>
                      ):planned?(
                        <div style={{width:30,height:30,borderRadius:10,border:`1.5px dashed ${pt?.color||C.border}`,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:pt?.color||C.dim,opacity:0.5}}>{pt?.icon}</div>
                      ):(
                        <div style={{width:30,height:30,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,margin:"0 auto"}}/>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Volume chart */}
            <div style={{background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4}}>WÖCHENTLICHES VOLUMEN</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyHist} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="w" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/>
                  <Tooltip {...tt}/>
                  <Bar dataKey="min" radius={[5,5,0,0]} name="Min">{weeklyHist.map((e,i)=><Cell key={i} fill={e.min>=150?C.lime:e.min>=75?C.gold:e.min>0?C.ember:C.border}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* HR trend */}
            <div style={{background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4}}>HERZFREQUENZ-TREND</div>
              {hrTrend.length>1?(
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={hrTrend}>
                    <defs><linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.ember} stopOpacity={0.25}/><stop offset="100%" stopColor={C.ember} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="d" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false} interval={Math.max(0,Math.floor(hrTrend.length/5))}/><YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false} domain={["dataMin-10","dataMax+10"]}/><Tooltip {...tt}/><Area type="monotone" dataKey="hr" stroke={C.ember} fill="url(#gH)" strokeWidth={2.5} name="bpm"/>
                  </AreaChart>
                </ResponsiveContainer>
              ):<div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",color:C.dim,fontSize:13}}>Trage Workouts ein</div>}
            </div>

            {/* Stats with toggle */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
              <div style={{display:"flex",background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                {[["month","Monat"],["all","Gesamt"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setStatRange(k)} style={{padding:"5px 14px",background:statRange===k?C.elevated:"transparent",color:statRange===k?C.text:C.dim,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{v:totalSess,l:"SESSIONS",c:C.ember},{v:`${Math.round(totalMin/60*10)/10}h`,l:"LAUFZEIT",c:C.sky},{v:`${Math.round(totalKm*10)/10}km`,l:"DISTANZ",c:C.gold}].map((s,i)=>(
                <div key={i} style={{background:C.surface,borderRadius:16,padding:"18px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                  <div style={{fontSize:24,fontWeight:900,color:s.c,letterSpacing:-1}}>{s.v}</div>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1.5,marginTop:4}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PLAN ═══ */}
        {view==="plan"&&(
          <div style={{animation:"fadeIn 0.35s ease"}}>
            {/* Week pills with scroll fade hint */}
            <div style={{position:"relative",marginBottom:16}}>
              <div ref={pillRef} style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
                {PLAN.map(p=>{const d=doneCount(p.week),tot=p.sessions.length,isCur=currentPlanWeek===p.week;
                  return(<button key={p.week} onClick={()=>setPlanWeek(p.week)} style={{padding:"8px 14px",borderRadius:12,position:"relative",border:planWeek===p.week?`2px solid ${p.pc}`:`1.5px solid ${isCur?`${C.ember}40`:C.border}`,background:planWeek===p.week?`${p.pc}14`:C.surface,color:planWeek===p.week?p.pc:C.dim,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s",minWidth:48,textAlign:"center"}}>
                    W{p.week}
                    {d>0&&(<div style={{position:"absolute",top:-5,right:-5,width:17,height:17,borderRadius:9,background:d===tot?C.lime:C.gold,color:"#000",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.bg}`}}>{d}</div>)}
                  </button>);
                })}
              </div>
              <div style={{position:"absolute",right:0,top:0,bottom:10,width:32,background:`linear-gradient(90deg, transparent, ${C.bg})`,pointerEvents:"none"}}/>
            </div>

            {curPlan&&(<>
              <div style={{borderRadius:22,padding:"22px 22px 18px",marginBottom:16,background:`linear-gradient(135deg, ${curPlan.pc}10, ${C.surface})`,border:`1px solid ${curPlan.pc}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:32,fontWeight:900,letterSpacing:-1.5}}>Woche {curPlan.week}</div>
                  <span style={{fontSize:11,fontWeight:800,color:curPlan.pc,letterSpacing:2,background:`${curPlan.pc}18`,padding:"5px 14px",borderRadius:8,border:`1px solid ${curPlan.pc}30`}}>{curPlan.phase}</span>
                </div>
                <div style={{fontSize:14,color:C.sub,lineHeight:1.5,marginBottom:8}}>{curPlan.focus}</div>
                <div style={{fontSize:12,color:C.muted,fontWeight:600}}>{doneCount(curPlan.week)}/{curPlan.sessions.length} erledigt &middot; {curPlan.sessions.reduce((s,x)=>s+x.duration,0)} min gesamt</div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                {curPlan.sessions.map((s,i)=>{
                  const t=TYPES.find(x=>x.id===s.type),done=isDone(curPlan.week,s.day);
                  return(
                    <div key={i} onClick={()=>openSheet(curPlan.week,s)} style={{background:done?`${C.lime}08`:C.surface,borderRadius:18,padding:"20px 20px 16px",border:done?`1px solid ${C.lime}30`:`1px solid ${C.border}`,borderLeft:`4px solid ${done?C.lime:t?.color||C.muted}`,cursor:"pointer",transition:"all 0.15s",position:"relative",animation:`fadeUp 0.3s ease ${i*0.06}s both`}}>
                      {done&&(<div style={{position:"absolute",top:12,right:14,width:28,height:28,borderRadius:14,background:C.limeBg,border:`1.5px solid ${C.lime}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.lime,fontWeight:900}}>&#10003;</div>)}
                      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
                        <TI type={s.type} size={40}/>
                        <div style={{flex:1}}><div style={{fontSize:17,fontWeight:800,letterSpacing:-0.3,opacity:done?0.6:1}}>{s.title}</div><div style={{fontSize:12,color:C.muted,fontWeight:500}}>{s.day}</div></div>
                        <div style={{textAlign:"right",marginRight:done?36:0}}><span style={{fontSize:28,fontWeight:900,color:done?C.lime:t?.color,letterSpacing:-1}}>{s.duration}</span><span style={{fontSize:13,color:C.muted,fontWeight:500}}> min</span></div>
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:C.sub,background:C.card,padding:"4px 12px",borderRadius:8,fontWeight:500,border:`1px solid ${C.border}`}}>HR {s.hr} bpm</span>
                        <span style={{fontSize:11,color:t?.color,background:t?.bg,padding:"4px 12px",borderRadius:8,fontWeight:600,border:`1px solid ${t?.color}20`}}>{t?.desc}</span>
                      </div>
                      <div style={{fontSize:13,color:C.sub,lineHeight:1.6,opacity:done?0.6:1}}>{s.notes}</div>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible overview */}
              <button onClick={()=>setShowPlanOverview(p=>!p)} style={{width:"100%",background:C.surface,borderRadius:showPlanOverview?"20px 20px 0 0":20,padding:"16px 20px",border:`1px solid ${C.border}`,borderBottom:showPlanOverview?"none":`1px solid ${C.border}`,cursor:"pointer",fontFamily:"inherit",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase"}}>GESAMTPLAN</span>
                <span style={{fontSize:14,color:C.dim,transform:showPlanOverview?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s"}}>&#9660;</span>
              </button>
              {showPlanOverview&&(
                <div style={{background:C.surface,borderRadius:"0 0 20px 20px",padding:"4px 20px 20px",border:`1px solid ${C.border}`,borderTop:"none"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {PLAN.map(p=>{const vol=p.sessions.reduce((s,x)=>s+x.duration,0),sel=planWeek===p.week,d=doneCount(p.week),tot=p.sessions.length;
                      return(<div key={p.week} onClick={()=>setPlanWeek(p.week)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"7px 10px",borderRadius:10,background:sel?C.elevated:"transparent",transition:"all 0.15s"}}>
                        <div style={{width:28,fontSize:12,fontWeight:700,color:sel?C.text:C.dim,flexShrink:0}}>W{p.week}</div>
                        <div style={{flex:1,height:20,background:C.card,borderRadius:6,overflow:"hidden",position:"relative",border:`1px solid ${C.border}`}}>
                          <div style={{height:"100%",width:`${Math.min(vol/160*100,100)}%`,background:`linear-gradient(90deg, ${p.pc}66, ${p.pc})`,borderRadius:5,transition:"width 0.5s ease"}}/>
                          <span style={{position:"absolute",right:8,top:2,fontSize:10,fontWeight:700,color:C.sub}}>{vol}m</span>
                        </div>
                        <div style={{fontSize:10,fontWeight:700,color:d===tot&&tot>0?C.lime:d>0?C.gold:C.dim,width:26,textAlign:"center",flexShrink:0}}>{d}/{tot}</div>
                        <div style={{fontSize:10,color:p.pc,fontWeight:800,width:72,textAlign:"right",flexShrink:0,letterSpacing:1}}>{p.phase}</div>
                      </div>);
                    })}
                  </div>
                </div>
              )}
            </>)}
          </div>
        )}

        {/* ═══ HISTORY ═══ */}
        {view==="history"&&(
          <div style={{animation:"fadeIn 0.35s ease"}}>
            {workouts.length===0?(
              <div style={{textAlign:"center",padding:"80px 20px"}}>
                <div style={{width:80,height:80,borderRadius:24,background:C.emberBg,border:`1px solid ${C.ember}30`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:32,fontWeight:900,color:C.ember}}>GO</div>
                <div style={{fontSize:20,fontWeight:800,marginBottom:6}}>Noch keine Workouts</div>
                <div style={{fontSize:14,color:C.muted,marginBottom:24}}>Starte mit Woche 1!</div>
                <button onClick={()=>setModal(true)} style={{padding:"14px 32px",background:C.ember,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Erstes Workout</button>
              </div>
            ):(<>
              {/* Filter pills */}
              <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
                {[{id:"all",label:"Alle",color:C.text},...TYPES.slice(0,5)].map(t=>(
                  <button key={t.id} onClick={()=>setFilter(t.id)} style={{padding:"7px 14px",borderRadius:10,border:filter===t.id?`1.5px solid ${t.color}`:`1.5px solid ${C.border}`,background:filter===t.id?`${t.color||C.text}14`:C.surface,color:filter===t.id?t.color:C.dim,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s"}}>{t.label||t.id} ({t.id==="all"?workouts.length:workouts.filter(w=>w.type===t.id).length})</button>
                ))}
              </div>

              {/* Pace chart */}
              {(()=>{
                const runs=filtered.filter(w=>["zone2","intervals","tempo","easy"].includes(w.type)&&w.distance>0).slice().reverse().slice(-15);
                if(runs.length<2)return null;
                const data=runs.map(w=>({d:fS(w.date),pace:Math.round(w.duration/w.distance*10)/10}));
                return(
                  <div style={{background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:18}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4}}>PACE-ENTWICKLUNG</div>
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="d" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false} reversed domain={["dataMin-0.5","dataMax+0.5"]}/><Tooltip {...tt}/><Line type="monotone" dataKey="pace" stroke={C.sky} strokeWidth={2.5} dot={{r:3,fill:C.sky}} name="min/km"/></LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}

              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filtered.map((w,idx)=>{
                  const t=TYPES.find(x=>x.id===w.type)||TYPES[5];
                  const pace=w.distance>0?Math.round(w.duration/w.distance*10)/10:null;
                  return(
                    <div key={w.id} style={{background:C.surface,borderRadius:16,padding:"14px 14px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.3s ease ${Math.min(idx*0.04,0.4)}s both`}}>
                      <TI type={w.type} size={42}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontSize:15,fontWeight:700}}>{t.label}</span>
                          <span style={{fontSize:12,color:C.dim}}>{fL(w.date)}</span>
                          {w.rpe&&<span style={{fontSize:10,color:C.muted,background:C.card,padding:"2px 6px",borderRadius:4}}>RPE {w.rpe}</span>}
                        </div>
                        <div style={{display:"flex",gap:8,fontSize:12,color:C.muted,flexWrap:"wrap"}}>
                          <span style={{fontWeight:600}}>{w.duration} min</span>
                          {w.distance>0&&<span>{w.distance} km</span>}
                          <span>HR {w.hrAvg}</span>
                          {pace&&<span>{pace} min/km</span>}
                        </div>
                        {w.note&&<div style={{fontSize:12,color:C.dim,marginTop:3}}>{w.note}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                        <button onClick={()=>startEdit(w)} style={{width:44,height:36,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,color:C.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",fontWeight:600}}>Edit</button>
                        <button onClick={()=>remove(w.id)} style={{width:44,height:36,borderRadius:10,background:C.emberBg,border:`1px solid ${C.ember}30`,color:C.ember,cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>&times;</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}
