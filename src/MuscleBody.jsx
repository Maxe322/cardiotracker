import { useState, useCallback, useMemo } from "react";
import Model from "react-body-highlighter";

// ═══════════════════════════════════════════════════════════════
//  MUSCLE RECOVERY PANEL
//  Premium side-by-side anatomy using react-body-highlighter
//  Recovery colors: green (ready) / gold (moderate) / red (fatigued)
// ═══════════════════════════════════════════════════════════════

// ─── Mapping: our muscle IDs → react-body-highlighter muscle slugs ───
// Some of our muscles map to multiple highlighter regions
const MUSCLE_MAP = {
  chest:     ["chest"],
  back:      ["upper-back", "lower-back"],
  shoulders: ["front-deltoids", "back-deltoids"],
  biceps:    ["biceps"],
  triceps:   ["triceps"],
  quads:     ["quadriceps"],
  hams:      ["hamstring"],
  glutes:    ["gluteal"],
  calves:    ["calves"],
  core:      ["abs", "obliques"],
  forearms:  ["forearm"],
  traps:     ["trapezius"],
};

// Reverse map: highlighter slug → our muscle ID
const REVERSE_MAP = {};
Object.entries(MUSCLE_MAP).forEach(([ourId, slugs]) => {
  slugs.forEach(slug => { REVERSE_MAP[slug] = ourId; });
});

// German names
const NAMES = {
  chest: "Brust", back: "Rücken", shoulders: "Schultern",
  biceps: "Bizeps", triceps: "Trizeps", quads: "Quadrizeps",
  hams: "Beinbeuger", glutes: "Glutes", calves: "Waden",
  core: "Core", forearms: "Unterarme", traps: "Trapez",
};

// Recovery → color + label
const recColor = (pct) => {
  if (pct >= 80) return "#4eba6f";
  if (pct >= 50) return "#d4a24e";
  return "#d45050";
};
const recLabel = (pct) => {
  if (pct >= 80) return "READY";
  if (pct >= 50) return "MODERATE";
  return "FATIGUED";
};

// Recovery → frequency bucket for highlightedColors array
// 1 = fatigued (red), 2 = moderate (gold), 3 = ready (green)
const recFreq = (pct) => {
  if (pct >= 80) return 3;
  if (pct >= 50) return 2;
  return 1;
};

// ═══ COMPONENT ═══
export default function MuscleRecoveryPanel({ C, recMap }) {
  const [selected, setSelected] = useState(null); // our muscle ID

  // Build exercise data for the highlighter
  // Each muscle group becomes an "exercise" entry with frequency based on recovery
  const modelData = useMemo(() => {
    const entries = [];
    Object.entries(MUSCLE_MAP).forEach(([ourId, slugs]) => {
      const pct = recMap[ourId];
      if (pct === undefined || pct === null) return;
      entries.push({
        name: ourId,
        muscles: slugs,
        frequency: recFreq(pct),
      });
    });
    return entries;
  }, [recMap]);

  const handleClick = useCallback(({ muscle }) => {
    const ourId = REVERSE_MAP[muscle];
    if (ourId) setSelected(prev => prev === ourId ? null : ourId);
  }, []);

  const dismiss = () => setSelected(null);

  // Colors array: index 0=red(fatigued), 1=gold(moderate), 2=green(ready)
  const COLORS = ["#d45050", "#d4a24e", "#4eba6f"];

  const modelStyle = { width: "100%", padding: "0", margin: "0" };

  return (
    <div onClick={dismiss} style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      background: "rgba(16,16,22,0.80)",
      border: "1px solid rgba(255,255,255,0.05)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
      padding: "16px 6px 12px",
    }}>
      {/* Faint grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.02,
        backgroundImage: "linear-gradient(rgba(180,180,200,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(180,180,200,0.6) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}/>

      {/* Radial ambient glow */}
      <div style={{
        position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)",
        width: "80%", height: "50%",
        background: "radial-gradient(ellipse, rgba(90,100,110,0.07) 0%, transparent 70%)",
        filter: "blur(40px)", pointerEvents: "none",
      }}/>

      {/* FRONT | BACK labels */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 8, marginBottom: 2, position: "relative", zIndex: 1,
        fontSize: 9, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase",
        color: "rgba(232,228,223,0.22)", fontFamily: "'Manrope',sans-serif",
      }}>
        <span>FRONT</span>
        <span style={{ color: "rgba(232,228,223,0.10)" }}>│</span>
        <span>BACK</span>
      </div>

      {/* Side-by-side body models */}
      <div style={{ display: "flex", gap: 0, position: "relative", zIndex: 1, alignItems: "flex-start" }}>
        {/* Front */}
        <div style={{ flex: 1, minWidth: 0 }} onClick={e => e.stopPropagation()}>
          <Model
            data={modelData}
            style={modelStyle}
            highlightedColors={COLORS}
            bodyColor="rgba(50,50,58,0.6)"
            type="anterior"
            onClick={handleClick}
          />
        </div>
        {/* Back */}
        <div style={{ flex: 1, minWidth: 0 }} onClick={e => e.stopPropagation()}>
          <Model
            data={modelData}
            style={modelStyle}
            highlightedColors={COLORS}
            bodyColor="rgba(50,50,58,0.6)"
            type="posterior"
            onClick={handleClick}
          />
        </div>
      </div>

      {/* Tooltip */}
      {selected && (() => {
        const pct = recMap[selected] ?? 0;
        const col = recColor(pct);
        const lab = recLabel(pct);
        return (
          <div style={{
            margin: "4px auto 0", padding: "9px 18px", borderRadius: 10, maxWidth: 280,
            background: "rgba(22,22,30,0.94)", border: `1px solid ${col}28`,
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            animation: "mrFU 0.2s ease-out", position: "relative", zIndex: 2,
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 14px ${col}0c`,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: col, boxShadow: `0 0 6px ${col}60`, flexShrink: 0 }}/>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase",
              color: "rgba(232,228,223,0.85)", fontFamily: "'Manrope',sans-serif",
            }}>
              {NAMES[selected]} · {lab} · {pct}%
            </span>
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 14, marginTop: 8,
        position: "relative", zIndex: 1, flexWrap: "wrap",
      }}>
        {[
          { color: "#4eba6f", label: "Ready", range: "80–100%" },
          { color: "#d4a24e", label: "Moderate", range: "50–79%" },
          { color: "#d45050", label: "Fatigued", range: "0–49%" },
        ].map(({ color, label, range }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 2, background: color, boxShadow: `0 0 4px ${color}40` }}/>
            <span style={{
              fontSize: 8, color: "rgba(232,228,223,0.35)", letterSpacing: 1, fontWeight: 600,
              fontFamily: "'Manrope',sans-serif",
            }}>
              {label} ({range})
            </span>
          </div>
        ))}
      </div>

      {/* CSS for the body highlighter SVGs — make them premium dark */}
      <style>{`
        @keyframes mrFU{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}
        /* Base body color override — dark metallic */
        .rbh polygon, .rbh path, .rbh polyline {
          stroke: rgba(80,80,90,0.15) !important;
          stroke-width: 0.3px !important;
          transition: fill 0.4s ease, opacity 0.3s ease !important;
        }
        /* Hover glow effect */
        .rbh polygon:hover, .rbh path:hover, .rbh polyline:hover {
          filter: brightness(1.3) drop-shadow(0 0 6px rgba(255,255,255,0.15)) !important;
          stroke: rgba(255,255,255,0.12) !important;
          stroke-width: 0.5px !important;
        }
        /* SVG container sizing */
        .rbh {
          max-width: 100% !important;
        }
        .rbh svg {
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
}
