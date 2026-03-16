import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, AreaChart, Area, LineChart, Line
} from "recharts";
import StrengthTab from "./Strength";

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

// ═══ BADGES DEFINITION ═══
const BADGE_DEFS = [
  { id:"first", name:"Erster Schritt", desc:"Erstes Workout eingetragen", icon:"1", color:C.lime, check: w => w.length >= 1 },
  { id:"w5", name:"High Five", desc:"5 Workouts geschafft", icon:"5", color:C.sky, check: w => w.length >= 5 },
  { id:"w10", name:"Zweistellig", desc:"10 Workouts geschafft", icon:"10", color:C.gold, check: w => w.length >= 10 },
  { id:"w25", name:"Quarter", desc:"25 Workouts geschafft", icon:"25", color:C.ember, check: w => w.length >= 25 },
  { id:"w50", name:"Halbhundert", desc:"50 Workouts absolviert", icon:"50", color:C.violet, check: w => w.length >= 50 },
  { id:"km10", name:"10 km Club", desc:"10 km Gesamtdistanz", icon:"10k", color:C.sky, check: w => w.reduce((s,x)=>s+(x.distance||0),0) >= 10 },
  { id:"km50", name:"Ultraläufer", desc:"50 km Gesamtdistanz", icon:"50k", color:C.gold, check: w => w.reduce((s,x)=>s+(x.distance||0),0) >= 50 },
  { id:"km100", name:"Centurion", desc:"100 km gelaufen", icon:"100", color:C.ember, check: w => w.reduce((s,x)=>s+(x.distance||0),0) >= 100 },
  { id:"dur60", name:"Stundenlauf", desc:"Ein 60+ Min Workout", icon:"60m", color:C.lime, check: w => w.some(x => x.duration >= 60) },
  { id:"streak3", name:"Dreier-Streak", desc:"3 Wochen in Folge trainiert", icon:"3W", color:C.sky, check: (w,s) => s >= 3 },
  { id:"streak6", name:"Sechser-Streak", desc:"6 Wochen in Folge trainiert", icon:"6W", color:C.gold, check: (w,s) => s >= 6 },
  { id:"streak10", name:"Unstoppable", desc:"10 Wochen in Folge trainiert", icon:"10W", color:C.ember, check: (w,s) => s >= 10 },
  { id:"plan", name:"Programm komplett", desc:"Alle 10 Wochen abgeschlossen", icon:"FIN", color:C.gold,
    check: (w,s,sd) => { if(!sd) return false; return PLAN.every(p => p.sessions.every(se => w.some(x=>x.planRef===`w${p.week}-${se.day}-${sd}`))); }
  },
  { id:"alltype", name:"Allrounder", desc:"Jeden Workout-Typ gemacht", icon:"ALL", color:C.violet,
    check: w => ["zone2","intervals","tempo","easy","cycling"].every(t => w.some(x => x.type === t))
  },
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
  const [data, setData] = useState({ workouts:[], startDate:null, strengthLog:[], strengthTemplates:[] });
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
  const [showBadgeDetail, setShowBadgeDetail] = useState(null);
  const [newPR, setNewPR] = useState(null);
  const pillRef = useRef(null);

  const openSheet = (week, session) => { setSRpe(5); setSDist(estDist(session.type, session.duration)); setSheet({ week, session }); };

  const [f, setF] = useState({type:"zone2",dur:45,dist:5,hr:138,date:new Date().toISOString().slice(0,10),note:"",rpe:5});
  const up = (k,v)=>setF(p=>({...p,[k]:v}));

  const workouts = data.workouts;
  const startDate = data.startDate;

  useEffect(()=>{
    try{ const r=localStorage.getItem(KEY); if(r) setData(JSON.parse(r)); }catch{}
    setLoaded(true);
  },[]);

  const persist = useCallback(d=>{try{localStorage.setItem(KEY,JSON.stringify(d))}catch{}},[]);
  const update = useCallback((fn)=>{
    setData(prev=>{const next={...prev,...fn(prev)};persist(next);return next;});
  },[persist]);

  const setStartDate = (d)=> update(()=>({startDate:d}));

  const currentPlanWeek = startDate ? (()=>{
    const start = getMon(new Date(startDate));
    const now = getMon(new Date());
    const diff = Math.floor((now-start)/(7*864e5))+1;
    return Math.max(1,Math.min(10,diff));
  })() : null;

  useEffect(()=>{ if(currentPlanWeek && planWeek !== currentPlanWeek) setPlanWeek(currentPlanWeek); },[currentPlanWeek]);

  const todayDayName = ["So","Mo","Di","Mi","Do","Fr","Sa"][new Date().getDay()];
  const todaySessions = currentPlanWeek ? (PLAN.find(p=>p.week===currentPlanWeek)?.sessions.filter(s=>s.day===todayDayName)||[]) : [];

  // ═══ PR DETECTION ═══
  const checkPRs = useCallback((newWorkout, allWorkouts) => {
    const prev = allWorkouts.filter(w => w.id !== newWorkout.id);
    const prs = [];
    // Longest duration
    if (newWorkout.duration > 0 && (!prev.length || newWorkout.duration > Math.max(...prev.map(w=>w.duration))))
      prs.push({ type: "Längster Lauf", value: `${newWorkout.duration} min` });
    // Fastest pace (running types only, lower is better)
    if (newWorkout.distance > 0 && ["zone2","intervals","tempo","easy"].includes(newWorkout.type)) {
      const pace = newWorkout.duration / newWorkout.distance;
      const prevPaces = prev.filter(w=>w.distance>0&&["zone2","intervals","tempo","easy"].includes(w.type)).map(w=>w.duration/w.distance);
      if (!prevPaces.length || pace < Math.min(...prevPaces))
        prs.push({ type: "Schnellste Pace", value: `${(pace).toFixed(1)} min/km` });
    }
    // Highest weekly volume
    const wkId = getWk(newWorkout.date);
    const wkTotal = allWorkouts.filter(w=>getWk(w.date)===wkId).reduce((s,w)=>s+w.duration,0);
    const otherWeeks = {};
    prev.forEach(w => { const k=getWk(w.date); otherWeeks[k]=(otherWeeks[k]||0)+w.duration; });
    const maxPrev = Math.max(0, ...Object.values(otherWeeks));
    if (wkTotal > maxPrev && maxPrev > 0)
      prs.push({ type: "Höchstes Wochenvolumen", value: `${wkTotal} min` });
    // Lowest resting HR during zone2
    if (newWorkout.type === "zone2" && newWorkout.hrAvg > 0) {
      const prevZ2Hr = prev.filter(w=>w.type==="zone2"&&w.hrAvg>0).map(w=>w.hrAvg);
      if (prevZ2Hr.length && newWorkout.hrAvg < Math.min(...prevZ2Hr))
        prs.push({ type: "Niedrigster Zone-2 HR", value: `${newWorkout.hrAvg} bpm` });
    }
    return prs;
  }, []);

  const doSave = ()=>{
    const w={id:editId||Date.now().toString(),type:f.type,duration:+f.dur,distance:+f.dist,hrAvg:+f.hr,date:f.date,note:f.note,rpe:+f.rpe,planRef:f.planRef||null};
    update(prev=>{
      let next=editId?prev.workouts.map(x=>x.id===editId?w:x):[...prev.workouts,w];
      next.sort((a,b)=>b.date.localeCompare(a.date));
      if (!editId) { const prs = checkPRs(w, next); if (prs.length) setNewPR(prs); }
      return{workouts:next};
    });
    closeModal();
  };

  const quickComplete = (session,week,rpe,dist)=>{
    const w={id:Date.now().toString(),type:session.type,duration:session.duration,distance:dist,hrAvg:parseHrMid(session.hr),date:new Date().toISOString().slice(0,10),note:`W${week} ${session.title}`,rpe,planRef:`w${week}-${session.day}-${startDate||'x'}`};
    update(prev=>{
      const next = [...prev.workouts,w].sort((a,b)=>b.date.localeCompare(a.date));
      const prs = checkPRs(w, next); if (prs.length) setNewPR(prs);
      return {workouts:next};
    });
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
  const restoreUndo = ()=>{ if(!undo)return; update(prev=>({workouts:[...prev.workouts,undo].sort((a,b)=>b.date.localeCompare(a.date))})); setUndo(null); };

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

  // ═══ STREAK CALCULATION ═══
  const weekStreak = useMemo(() => {
    if (!workouts.length) return 0;
    let streak = 0;
    const cur = getMon(new Date());
    for (let i = 0; i < 52; i++) {
      const wk = new Date(cur); wk.setDate(cur.getDate() - i * 7);
      const id = getWk(wk.toISOString().slice(0,10));
      const hasWorkout = workouts.some(w => getWk(w.date) === id);
      if (hasWorkout) streak++; else break;
    }
    return streak;
  }, [workouts]);

  // ═══ PR RECORDS ═══
  const prs = useMemo(() => {
    if (!workouts.length) return {};
    const runs = workouts.filter(w => w.distance > 0 && ["zone2","intervals","tempo","easy"].includes(w.type));
    const bestPace = runs.length ? runs.reduce((b, w) => { const p = w.duration / w.distance; return p < b.pace ? { pace: p, date: w.date } : b; }, { pace: Infinity, date: "" }) : null;
    const longestRun = workouts.reduce((b, w) => w.duration > b.dur ? { dur: w.duration, date: w.date } : b, { dur: 0, date: "" });
    const mostDist = workouts.reduce((b, w) => (w.distance||0) > b.dist ? { dist: w.distance, date: w.date } : b, { dist: 0, date: "" });
    const weekVols = {};
    workouts.forEach(w => { const k = getWk(w.date); weekVols[k] = (weekVols[k]||0) + w.duration; });
    const bestWeek = Object.entries(weekVols).reduce((b, [k, v]) => v > b.vol ? { vol: v, wk: k } : b, { vol: 0, wk: "" });
    return { bestPace, longestRun, mostDist, bestWeek };
  }, [workouts]);

  // ═══ BADGES ═══
  const earnedBadges = useMemo(() => BADGE_DEFS.filter(b => b.check(workouts, weekStreak, startDate)), [workouts, weekStreak, startDate]);

  // ═══ WEEKLY REPORT ═══
  const lastWeekReport = useMemo(() => {
    const lw = new Date(); lw.setDate(lw.getDate() - 7);
    const lwId = getWk(lw.toISOString().slice(0,10));
    const lwWorkouts = workouts.filter(w => getWk(w.date) === lwId);
    if (!lwWorkouts.length) return null;
    const min = lwWorkouts.reduce((s,w) => s+w.duration, 0);
    const dist = lwWorkouts.reduce((s,w) => s+(w.distance||0), 0);
    const avgHr = Math.round(lwWorkouts.reduce((s,w) => s+w.hrAvg, 0) / lwWorkouts.length);
    // Compare to week before
    const bw = new Date(); bw.setDate(bw.getDate() - 14);
    const bwId = getWk(bw.toISOString().slice(0,10));
    const bwMin = workouts.filter(w => getWk(w.date) === bwId).reduce((s,w) => s+w.duration, 0);
    const diff = bwMin > 0 ? Math.round((min - bwMin) / bwMin * 100) : 0;
    return { sessions: lwWorkouts.length, min, dist: Math.round(dist*10)/10, avgHr, diff };
  }, [workouts]);

  if(!loaded)return(<div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:24,height:24,border:`3px solid ${C.ember}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  const inp={width:"100%",padding:"13px 16px",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box"};
  const sty = { card: {background:C.surface,borderRadius:20,padding:"18px 14px",border:`1px solid ${C.border}`,marginBottom:14}, label: {fontSize:11,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:14,paddingLeft:4} };

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Outfit',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pop{0%{transform:scale(.95);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px ${C.gold}44}50%{box-shadow:0 0 24px ${C.gold}88}}
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
          {[["dash","Übersicht"],["plan","Programm"],["strength","Kraft"],["history","Verlauf"],["badges","Erfolge"]].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:"8px 14px 12px",background:"transparent",border:"none",borderBottom:view===k?`2.5px solid ${C.ember}`:"2.5px solid transparent",color:view===k?C.text:C.muted,fontSize:13,fontWeight:view===k?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* PR CELEBRATION */}
      {newPR && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"}} onClick={()=>setNewPR(null)}>
          <div style={{background:C.surface,borderRadius:24,padding:"32px 28px",border:`2px solid ${C.gold}`,maxWidth:340,textAlign:"center",animation:"pop 0.3s ease",boxShadow:`0 0 40px ${C.gold}33`}}>
            <div style={{fontSize:48,marginBottom:12}}>&#127942;</div>
            <div style={{fontSize:22,fontWeight:900,color:C.gold,marginBottom:6}}>Neuer PR!</div>
            {newPR.map((pr,i) => (
              <div key={i} style={{background:C.goldBg,borderRadius:12,padding:"10px 16px",marginBottom:8,border:`1px solid ${C.gold}30`}}>
                <div style={{fontSize:12,color:C.muted,fontWeight:600}}>{pr.type}</div>
                <div style={{fontSize:20,fontWeight:800,color:C.gold}}>{pr.value}</div>
              </div>
            ))}
            <div style={{fontSize:13,color:C.muted,marginTop:12}}>Tippe zum Schließen</div>
          </div>
        </div>
      )}

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
            {!startDate&&(
              <div style={{background:`linear-gradient(135deg, ${C.emberBg}, ${C.surface})`,borderRadius:20,padding:"22px 20px",border:`1px solid ${C.ember}30`,marginBottom:18}}>
                <div style={{fontSize:16,fontWeight:800,marginBottom:6}}>Plan starten</div>
                <div style={{fontSize:13,color:C.sub,marginBottom:14,lineHeight:1.5}}>Wähle den Montag, an dem dein 10-Wochen-Plan beginnt.</div>
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
                  <div style={{fontSize:11,fontWeight:700,color:done?C.lime:C.ember,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{done?"HEUTE ERLEDIGT":"HEUTE"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <TI type={s.type} size={46}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:18,fontWeight:800}}>{s.title}</div>
                      <div style={{fontSize:13,color:C.muted}}>W{currentPlanWeek} &middot; {s.duration} min &middot; {s.hr} bpm</div>
                    </div>
                    {done?(<div style={{width:40,height:40,borderRadius:20,background:C.limeBg,border:`1.5px solid ${C.lime}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.lime}}>&#10003;</div>):(<div style={{padding:"10px 18px",background:C.ember,borderRadius:12,color:"#fff",fontSize:13,fontWeight:700}}>Los</div>)}
                  </div>
                </div>
              );
            })()}

            {/* Streak + Rings row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:18}}>
              <div style={{background:C.surface,borderRadius:18,padding:"16px 8px",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{fontSize:28,fontWeight:900,color:weekStreak>=3?C.gold:C.dim,letterSpacing:-1}}>{weekStreak}</div>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase",textAlign:"center"}}>WOCHEN STREAK</div>
              </div>
              {[{label:"Sessions",val:wkSess,target:3,color:C.ember,fmt:`${wkSess}/3`},{label:"Minuten",val:wkMin,target:150,color:C.sky,fmt:`${wkMin}`},{label:"Zone 2",val:z2Pct,target:80,color:C.lime,fmt:`${z2Pct}%`}].map((g,i)=>(
                <div key={i} style={{background:C.surface,borderRadius:18,padding:"14px 6px 12px",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <Ring pct={g.val/g.target*100} color={g.color} size={52} sw={5}><span style={{fontSize:13,fontWeight:800,color:g.color}}>{g.fmt}</span></Ring>
                  <div style={{fontSize:9,color:C.muted,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{g.label}</div>
                </div>
              ))}
            </div>

            {/* Weekly Report */}
            {lastWeekReport && (
              <div style={{...sty.card,marginBottom:14}}>
                <div style={{...sty.label}}>LETZTE WOCHE</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.ember}}>{lastWeekReport.sessions}</div><div style={{fontSize:9,color:C.dim}}>Sessions</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.sky}}>{lastWeekReport.min}m</div><div style={{fontSize:9,color:C.dim}}>Minuten</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:C.gold}}>{lastWeekReport.dist}km</div><div style={{fontSize:9,color:C.dim}}>Distanz</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:lastWeekReport.diff>=0?C.lime:C.ember}}>{lastWeekReport.diff>=0?"+":""}{lastWeekReport.diff}%</div><div style={{fontSize:9,color:C.dim}}>vs Vorwoche</div></div>
                </div>
              </div>
            )}

            {/* Week strip */}
            <div style={sty.card}>
              <div style={sty.label}>DIESE WOCHE</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5}}>
                {weekDays.map((d,i)=>{
                  const dn=d.done.length>0,t=dn?TYPES.find(x=>x.id===d.done[0].type):null;
                  const planned=currentPlanWeek?PLAN.find(p=>p.week===currentPlanWeek)?.sessions.find(s=>s.day===d.day):null;
                  const pt=planned?TYPES.find(x=>x.id===planned.type):null;
                  return(
                    <div key={i} style={{borderRadius:14,padding:"10px 2px",textAlign:"center",background:d.isToday?C.elevated:"transparent",border:d.isToday?`1.5px solid ${C.ember}30`:"1.5px solid transparent"}}>
                      <div style={{fontSize:11,fontWeight:700,color:d.isToday?C.text:C.dim,marginBottom:8}}>{d.day}</div>
                      {dn?(<><TI type={d.done[0].type} size={30}/><div style={{fontSize:10,color:t?.color,fontWeight:700,marginTop:5}}>{d.done[0].duration}m</div></>):planned?(<div style={{width:30,height:30,borderRadius:10,border:`1.5px dashed ${pt?.color||C.border}`,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:pt?.color||C.dim,opacity:0.5}}>{pt?.icon}</div>):(<div style={{width:30,height:30,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,margin:"0 auto"}}/>)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts */}
            <div style={sty.card}>
              <div style={sty.label}>WÖCHENTLICHES VOLUMEN</div>
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

            <div style={sty.card}>
              <div style={sty.label}>HERZFREQUENZ-TREND</div>
              {hrTrend.length>1?(<ResponsiveContainer width="100%" height={140}><AreaChart data={hrTrend}><defs><linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.ember} stopOpacity={0.25}/><stop offset="100%" stopColor={C.ember} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="d" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false} interval={Math.max(0,Math.floor(hrTrend.length/5))}/><YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false} domain={["dataMin-10","dataMax+10"]}/><Tooltip {...tt}/><Area type="monotone" dataKey="hr" stroke={C.ember} fill="url(#gH)" strokeWidth={2.5} name="bpm"/></AreaChart></ResponsiveContainer>):(<div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",color:C.dim,fontSize:13}}>Trage Workouts ein</div>)}
            </div>

            {/* Stats toggle */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
              <div style={{display:"flex",background:C.card,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                {[["month","Monat"],["all","Gesamt"]].map(([k,l])=>(<button key={k} onClick={()=>setStatRange(k)} style={{padding:"5px 14px",background:statRange===k?C.elevated:"transparent",color:statRange===k?C.text:C.dim,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{v:totalSess,l:"SESSIONS",c:C.ember},{v:`${Math.round(totalMin/60*10)/10}h`,l:"LAUFZEIT",c:C.sky},{v:`${Math.round(totalKm*10)/10}km`,l:"DISTANZ",c:C.gold}].map((s,i)=>(<div key={i} style={{background:C.surface,borderRadius:16,padding:"18px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}><div style={{fontSize:24,fontWeight:900,color:s.c,letterSpacing:-1}}>{s.v}</div><div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1.5,marginTop:4}}>{s.l}</div></div>))}
            </div>
          </div>
        )}

        {/* ═══ PLAN ═══ */}
        {view==="plan"&&(
          <div style={{animation:"fadeIn 0.35s ease"}}>
            <div style={{position:"relative",marginBottom:16}}>
              <div ref={pillRef} style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
                {PLAN.map(p=>{const d=doneCount(p.week),tot=p.sessions.length,isCur=currentPlanWeek===p.week;
                  return(<button key={p.week} onClick={()=>setPlanWeek(p.week)} style={{padding:"8px 14px",borderRadius:12,position:"relative",border:planWeek===p.week?`2px solid ${p.pc}`:`1.5px solid ${isCur?`${C.ember}40`:C.border}`,background:planWeek===p.week?`${p.pc}14`:C.surface,color:planWeek===p.week?p.pc:C.dim,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.15s",minWidth:48,textAlign:"center"}}>W{p.week}{d>0&&(<div style={{position:"absolute",top:-5,right:-5,width:17,height:17,borderRadius:9,background:d===tot?C.lime:C.gold,color:"#000",fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.bg}`}}>{d}</div>)}</button>);
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
                        <div style={{flex:1,height:20,background:C.card,borderRadius:6,overflow:"hidden",position:"relative",border:`1px solid ${C.border}`}}><div style={{height:"100%",width:`${Math.min(vol/160*100,100)}%`,background:`linear-gradient(90deg, ${p.pc}66, ${p.pc})`,borderRadius:5,transition:"width 0.5s ease"}}/><span style={{position:"absolute",right:8,top:2,fontSize:10,fontWeight:700,color:C.sub}}>{vol}m</span></div>
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
              <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:16,paddingBottom:4}}>
                {[{id:"all",label:"Alle",color:C.text},...TYPES.slice(0,5)].map(t=>(<button key={t.id} onClick={()=>setFilter(t.id)} style={{padding:"7px 14px",borderRadius:10,border:filter===t.id?`1.5px solid ${t.color}`:`1.5px solid ${C.border}`,background:filter===t.id?`${t.color||C.text}14`:C.surface,color:filter===t.id?t.color:C.dim,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,whiteSpace:"nowrap",flexShrink:0}}>{t.label||t.id} ({t.id==="all"?workouts.length:workouts.filter(w=>w.type===t.id).length})</button>))}
              </div>
              {(()=>{
                const runs=filtered.filter(w=>["zone2","intervals","tempo","easy"].includes(w.type)&&w.distance>0).slice().reverse().slice(-15);
                if(runs.length<2)return null;
                const pd=runs.map(w=>({d:fS(w.date),pace:Math.round(w.duration/w.distance*10)/10}));
                return(<div style={sty.card}><div style={sty.label}>PACE-ENTWICKLUNG</div><ResponsiveContainer width="100%" height={130}><LineChart data={pd}><CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/><XAxis dataKey="d" tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:C.dim}} axisLine={false} tickLine={false} reversed domain={["dataMin-0.5","dataMax+0.5"]}/><Tooltip {...tt}/><Line type="monotone" dataKey="pace" stroke={C.sky} strokeWidth={2.5} dot={{r:3,fill:C.sky}} name="min/km"/></LineChart></ResponsiveContainer></div>);
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

        {/* ═══ STRENGTH ═══ */}
        {view==="strength"&&(
          <StrengthTab C={C} data={data} update={update} />
        )}

        {/* ═══ BADGES / ERFOLGE ═══ */}
        {view==="badges"&&(
          <div style={{animation:"fadeIn 0.35s ease"}}>
            {/* PRs */}
            <div style={{...sty.card,marginBottom:18}}>
              <div style={sty.label}>PERSONAL RECORDS</div>
              {workouts.length === 0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:C.dim,fontSize:13}}>Trage Workouts ein um PRs zu sehen</div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {prs.bestPace && prs.bestPace.pace < Infinity && (
                    <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>SCHNELLSTE PACE</div>
                      <div style={{fontSize:22,fontWeight:900,color:C.sky}}>{prs.bestPace.pace.toFixed(1)}<span style={{fontSize:12,color:C.muted}}> min/km</span></div>
                      <div style={{fontSize:10,color:C.dim,marginTop:2}}>{fL(prs.bestPace.date)}</div>
                    </div>
                  )}
                  {prs.longestRun.dur > 0 && (
                    <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>LÄNGSTER LAUF</div>
                      <div style={{fontSize:22,fontWeight:900,color:C.ember}}>{prs.longestRun.dur}<span style={{fontSize:12,color:C.muted}}> min</span></div>
                      <div style={{fontSize:10,color:C.dim,marginTop:2}}>{fL(prs.longestRun.date)}</div>
                    </div>
                  )}
                  {prs.mostDist.dist > 0 && (
                    <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>WEITESTE DISTANZ</div>
                      <div style={{fontSize:22,fontWeight:900,color:C.gold}}>{prs.mostDist.dist}<span style={{fontSize:12,color:C.muted}}> km</span></div>
                      <div style={{fontSize:10,color:C.dim,marginTop:2}}>{fL(prs.mostDist.date)}</div>
                    </div>
                  )}
                  {prs.bestWeek.vol > 0 && (
                    <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>BESTE WOCHE</div>
                      <div style={{fontSize:22,fontWeight:900,color:C.violet}}>{prs.bestWeek.vol}<span style={{fontSize:12,color:C.muted}}> min</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Streak */}
            <div style={{...sty.card,marginBottom:18,textAlign:"center"}}>
              <div style={{fontSize:48,fontWeight:900,color:weekStreak>=3?C.gold:C.dim,letterSpacing:-2}}>{weekStreak}</div>
              <div style={{fontSize:14,fontWeight:700,color:C.sub,marginBottom:4}}>Wochen-Streak</div>
              <div style={{fontSize:12,color:C.muted}}>{weekStreak>=3?"Weiter so!":weekStreak>0?"Fast ein 3er-Streak!":"Trainiere diese Woche um deinen Streak zu starten"}</div>
              <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:12}}>
                {Array.from({length:10}).map((_,i) => (
                  <div key={i} style={{width:20,height:6,borderRadius:3,background:i<weekStreak?C.gold:`${C.gold}22`,transition:"background 0.3s"}}/>
                ))}
              </div>
            </div>

            {/* Badges Grid */}
            <div style={sty.card}>
              <div style={sty.label}>BADGES ({earnedBadges.length}/{BADGE_DEFS.length})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(90px, 1fr))",gap:10}}>
                {BADGE_DEFS.map(b => {
                  const earned = earnedBadges.some(e => e.id === b.id);
                  return (
                    <div key={b.id} onClick={() => setShowBadgeDetail(b)} style={{
                      background: earned ? `${b.color}14` : C.card,
                      borderRadius: 16, padding: "16px 8px", textAlign: "center", cursor: "pointer",
                      border: earned ? `1.5px solid ${b.color}40` : `1px solid ${C.border}`,
                      opacity: earned ? 1 : 0.4, transition: "all 0.2s",
                    }}>
                      <div style={{fontSize:18,fontWeight:900,color:earned?b.color:C.dim,marginBottom:6}}>{b.icon}</div>
                      <div style={{fontSize:10,fontWeight:700,color:earned?C.sub:C.dim,lineHeight:1.3}}>{b.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badge detail popup */}
            {showBadgeDetail && (
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowBadgeDetail(null)}>
                <div style={{background:C.surface,borderRadius:24,padding:"28px 24px",border:`1px solid ${showBadgeDetail.color}30`,maxWidth:300,textAlign:"center",animation:"pop 0.2s ease"}}>
                  <div style={{width:64,height:64,borderRadius:20,background:`${showBadgeDetail.color}18`,border:`2px solid ${showBadgeDetail.color}40`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:24,fontWeight:900,color:showBadgeDetail.color}}>{showBadgeDetail.icon}</div>
                  <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>{showBadgeDetail.name}</div>
                  <div style={{fontSize:13,color:C.muted,marginBottom:12}}>{showBadgeDetail.desc}</div>
                  <div style={{fontSize:14,fontWeight:700,color:earnedBadges.some(e=>e.id===showBadgeDetail.id)?showBadgeDetail.color:C.dim}}>
                    {earnedBadges.some(e=>e.id===showBadgeDetail.id) ? "Freigeschaltet!" : "Noch nicht freigeschaltet"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
