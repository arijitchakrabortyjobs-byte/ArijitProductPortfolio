import { useState, useEffect, useRef } from "react";

const TRIAL_PATIENTS = [
  { id: 1, name: "Sarah M.", age: 34, condition: "Type 2 Diabetes", enrolled: "Mar 12", phase: "Week 18", visits: 9, missed: 0, risk: "low", engagement: 94, lastCheckin: "2 days ago", nextVisit: "Jun 8" },
  { id: 2, name: "James R.", age: 58, condition: "Hypertension", enrolled: "Feb 28", phase: "Week 20", visits: 10, missed: 3, risk: "high", engagement: 31, lastCheckin: "18 days ago", nextVisit: "Jun 2" },
  { id: 3, name: "Maria L.", age: 45, condition: "Type 2 Diabetes", enrolled: "Apr 3", phase: "Week 15", visits: 7, missed: 1, risk: "medium", engagement: 62, lastCheckin: "6 days ago", nextVisit: "Jun 12" },
  { id: 4, name: "David K.", age: 67, condition: "Hypertension", enrolled: "Jan 15", phase: "Week 26", visits: 13, missed: 0, risk: "low", engagement: 91, lastCheckin: "1 day ago", nextVisit: "Jun 5" },
  { id: 5, name: "Aisha P.", age: 29, condition: "Type 2 Diabetes", enrolled: "Mar 22", phase: "Week 16", visits: 8, missed: 2, risk: "high", engagement: 38, lastCheckin: "14 days ago", nextVisit: "Overdue" },
  { id: 6, name: "Robert C.", age: 52, condition: "Hypertension", enrolled: "Apr 18", phase: "Week 12", visits: 6, missed: 0, risk: "low", engagement: 87, lastCheckin: "3 days ago", nextVisit: "Jun 15" },
  { id: 7, name: "Linda W.", age: 41, condition: "Type 2 Diabetes", enrolled: "Feb 10", phase: "Week 22", visits: 11, missed: 4, risk: "critical", engagement: 15, lastCheckin: "32 days ago", nextVisit: "Overdue" },
  { id: 8, name: "Chen Y.", age: 36, condition: "Type 2 Diabetes", enrolled: "Mar 30", phase: "Week 15", visits: 7, missed: 1, risk: "medium", engagement: 58, lastCheckin: "8 days ago", nextVisit: "Jun 10" },
  { id: 9, name: "Patricia D.", age: 61, condition: "Hypertension", enrolled: "Jan 28", phase: "Week 24", visits: 12, missed: 0, risk: "low", engagement: 96, lastCheckin: "Today", nextVisit: "Jun 18" },
  { id: 10, name: "Michael T.", age: 48, condition: "Type 2 Diabetes", enrolled: "Apr 8", phase: "Week 14", visits: 7, missed: 2, risk: "high", engagement: 42, lastCheckin: "11 days ago", nextVisit: "Jun 4" },
];

const TRIAL_STATS = {
  enrolled: 248,
  active: 214,
  dropped: 34,
  dropoutRate: 13.7,
  avgEngagement: 64,
  atRisk: 52,
  overdueVisits: 18,
  avgTravelMiles: 34,
};

const DROPOUT_REASONS = [
  { reason: "Travel burden", pct: 31, count: 11, color: "#ef4444" },
  { reason: "Visit length", pct: 22, count: 7, color: "#f59e0b" },
  { reason: "Poor communication", pct: 19, count: 6, color: "#8b5cf6" },
  { reason: "Side effects", pct: 14, count: 5, color: "#3b82f6" },
  { reason: "Lost motivation", pct: 9, count: 3, color: "#ec4899" },
  { reason: "Life events", pct: 5, count: 2, color: "#6b7280" },
];

const BURDEN_TIMELINE = [
  { week: "W1", burden: 8.2, engagement: 95 },
  { week: "W4", burden: 7.5, engagement: 88 },
  { week: "W8", burden: 7.8, engagement: 74 },
  { week: "W12", burden: 8.1, engagement: 62 },
  { week: "W16", burden: 8.4, engagement: 51 },
  { week: "W20", burden: 8.9, engagement: 43 },
  { week: "W24", burden: 9.2, engagement: 38 },
];

function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1200, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

function DropoutRing({ rate, size = 130, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const timer = setTimeout(() => setOffset(circ - (rate / 100) * circ), 300);
    return () => clearTimeout(timer);
  }, [rate, circ]);
  const color = rate > 30 ? "#ef4444" : rate > 15 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: "#1e1b4b", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
          <AnimatedNumber value={rate} duration={1500} decimals={1} suffix="%" />
        </span>
        <span style={{ fontSize: 10, color: "#7c3aed", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4, fontWeight: 600 }}>Dropout</span>
      </div>
    </div>
  );
}

function BurdenBar({ pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ flex: 1, height: 22, borderRadius: 6, background: "rgba(124,58,237,0.06)", overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 6, background: color,
        width: `${width}%`, transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", alignItems: "center", justifyContent: "flex-end",
        paddingRight: width > 12 ? 6 : 0,
      }}>
        {width > 12 && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{pct}%</span>}
      </div>
    </div>
  );
}

function AsIsView({ visible }) {
  const rawEntries = [
    { pid: "PT-0248-A", event: "Scheduled Visit V9", date: "May 28", status: "pending", notes: "" },
    { pid: "PT-0112-C", event: "Lab Draw — Fasting", date: "May 25", status: "no-show", notes: "2nd missed" },
    { pid: "PT-0089-B", event: "Phone Check-in", date: "May 24", status: "complete", notes: "" },
    { pid: "PT-0201-A", event: "Scheduled Visit V11", date: "May 22", status: "rescheduled", notes: "travel" },
    { pid: "PT-0167-D", event: "eCOA Submission", date: "May 21", status: "overdue", notes: "5d late" },
    { pid: "PT-0034-A", event: "Adverse Event Follow-up", date: "May 20", status: "pending", notes: "" },
    { pid: "PT-0299-B", event: "Informed Consent Renewal", date: "May 19", status: "complete", notes: "" },
    { pid: "PT-0145-C", event: "Scheduled Visit V7", date: "May 18", status: "no-show", notes: "unreachable" },
    { pid: "PT-0078-A", event: "Randomization Check", date: "May 17", status: "complete", notes: "" },
    { pid: "PT-0223-D", event: "Scheduled Visit V13", date: "May 16", status: "withdrawn", notes: "burden cited" },
    { pid: "PT-0156-B", event: "Lab Results Review", date: "May 15", status: "pending", notes: "" },
    { pid: "PT-0091-A", event: "eCOA Submission", date: "May 14", status: "overdue", notes: "12d late" },
  ];

  const statusColors = {
    "pending": "#6b7280",
    "complete": "#22c55e",
    "no-show": "#ef4444",
    "rescheduled": "#f59e0b",
    "overdue": "#ef4444",
    "withdrawn": "#991b1b",
  };

  return (
    <div style={{
      background: "#f8f7f4", borderRadius: 28, width: 320, minHeight: 620,
      overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(0,0,0,0.06)",
    }}>
      <div style={{ background: "#fff", padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>
      <div style={{ background: "#fff", padding: "8px 20px 16px" }}>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Trial Manager</h3>
        <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>Study DM-2026-042 · Event Log</p>
      </div>
      <div style={{ padding: "0 12px 20px", maxHeight: 480, overflowY: "auto" }}>
        {rawEntries.map((entry, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 12px", background: "#fff", borderRadius: 10,
            marginBottom: 2, borderBottom: "1px solid #f0f0f0",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1a1a", fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.3 }}>{entry.pid}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{entry.event}</div>
              <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{entry.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                color: statusColors[entry.status] || "#666",
                background: `${statusColors[entry.status]}12`,
                padding: "2px 8px", borderRadius: 4, display: "inline-block",
              }}>{entry.status}</div>
              {entry.notes && <div style={{ fontSize: 9, color: "#bbb", marginTop: 3 }}>{entry.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToBeView({ visible }) {
  const riskColors = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444", critical: "#991b1b" };
  const [expandedPatient, setExpandedPatient] = useState(null);

  return (
    <div style={{
      background: "#faf8ff", borderRadius: 28, width: 360, minHeight: 620,
      overflow: "hidden", boxShadow: "0 8px 60px rgba(124,58,237,0.12), 0 0 0 1px rgba(124,58,237,0.08)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
    }}>
      {/* Status bar */}
      <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1e1b4b", borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", right: 1.5, top: 1.5, bottom: 1.5, left: 1.5, background: "#7c3aed", borderRadius: 0.5 }} />
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)", fontSize: 14,
          }}>💊</div>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", letterSpacing: 2, textTransform: "uppercase" }}>Patient Journey Intelligence</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: "0 0 4px" }}>Cohort Health</h3>
        <p style={{ fontSize: 11, color: "#8b8b9e", margin: "0 0 12px" }}>Study DM-2026-042 · Diabetes Phase III</p>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 16px 12px", display: "flex", gap: 6 }}>
        {[
          { label: "Active", value: "214", sub: "of 248 enrolled", color: "#22c55e" },
          { label: "At Risk", value: "52", sub: "need intervention", color: "#f59e0b" },
          { label: "Dropout", value: "13.7%", sub: "vs 30% industry", color: "#7c3aed" },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: "#fff", borderRadius: 12,
            padding: "10px 8px", border: "1px solid rgba(124,58,237,0.06)",
            textAlign: "center", boxShadow: "0 1px 3px rgba(124,58,237,0.04)",
          }}>
            <div style={{ fontSize: 9, color: "#8b8b9e", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 8, color: "#b0b0c0", marginTop: 3 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Risk distribution */}
      <div style={{ padding: "0 16px 10px" }}>
        <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 2 }}>
          <div style={{ width: "45%", background: "#22c55e", borderRadius: 3 }} />
          <div style={{ width: "25%", background: "#f59e0b", borderRadius: 3 }} />
          <div style={{ width: "20%", background: "#ef4444", borderRadius: 3 }} />
          <div style={{ width: "10%", background: "#991b1b", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          {[
            { label: "Low", color: "#22c55e" },
            { label: "Medium", color: "#f59e0b" },
            { label: "High", color: "#ef4444" },
            { label: "Critical", color: "#991b1b" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: r.color }} />
              <span style={{ fontSize: 8, color: "#8b8b9e" }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Patient list */}
      <div style={{ padding: "4px 10px 20px", maxHeight: 340, overflowY: "auto" }}>
        {TRIAL_PATIENTS.map((pt, i) => (
          <div key={pt.id}
            onClick={() => setExpandedPatient(expandedPatient === pt.id ? null : pt.id)}
            style={{
              padding: "10px 10px", borderRadius: 12, cursor: "pointer",
              background: pt.risk === "critical" ? "rgba(153,27,27,0.04)" : pt.risk === "high" ? "rgba(239,68,68,0.03)" : "#fff",
              borderBottom: "1px solid rgba(124,58,237,0.04)",
              marginBottom: 2,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(20px)",
              transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.05}s`,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Risk indicator */}
              <div style={{
                width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: `${riskColors[pt.risk]}10`, border: `1.5px solid ${riskColors[pt.risk]}30`,
                fontSize: 14, flexShrink: 0,
              }}>
                {pt.risk === "critical" ? "🚨" : pt.risk === "high" ? "⚠️" : pt.risk === "medium" ? "📊" : "✅"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>{pt.name}</span>
                  <span style={{
                    fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                    color: riskColors[pt.risk], background: `${riskColors[pt.risk]}12`,
                    padding: "1px 6px", borderRadius: 4,
                  }}>{pt.risk}</span>
                </div>
                <div style={{ fontSize: 10, color: "#8b8b9e", marginTop: 2 }}>
                  {pt.condition} · {pt.phase} · Last: {pt.lastCheckin}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: 16, fontWeight: 800,
                  color: pt.engagement > 70 ? "#22c55e" : pt.engagement > 40 ? "#f59e0b" : "#ef4444",
                }}>{pt.engagement}%</div>
                <div style={{ fontSize: 8, color: "#b0b0c0" }}>engage</div>
              </div>
            </div>
            {expandedPatient === pt.id && (
              <div style={{
                marginTop: 8, padding: "8px 10px", borderRadius: 8,
                background: "rgba(124,58,237,0.03)", border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div><span style={{ fontSize: 9, color: "#8b8b9e" }}>Visits</span><div style={{ fontSize: 12, fontWeight: 600, color: "#1e1b4b" }}>{pt.visits} completed</div></div>
                  <div><span style={{ fontSize: 9, color: "#8b8b9e" }}>Missed</span><div style={{ fontSize: 12, fontWeight: 600, color: pt.missed > 0 ? "#ef4444" : "#22c55e" }}>{pt.missed}</div></div>
                  <div><span style={{ fontSize: 9, color: "#8b8b9e" }}>Next Visit</span><div style={{ fontSize: 12, fontWeight: 600, color: pt.nextVisit === "Overdue" ? "#ef4444" : "#1e1b4b" }}>{pt.nextVisit}</div></div>
                  <div><span style={{ fontSize: 9, color: "#8b8b9e" }}>Enrolled</span><div style={{ fontSize: 12, fontWeight: 600, color: "#1e1b4b" }}>{pt.enrolled}</div></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


export default function Sprint1PatientJourney() {
  const [visible, setVisible] = useState(false);
  const [activeView, setActiveView] = useState("split");

  useEffect(() => { setVisible(true); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #f5f0ff 0%, #faf8ff 30%, #ffffff 100%)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Background texture */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.5, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(168,85,247,0.04) 0%, transparent 60%)",
      }} />

      {/* Header */}
      <div style={{
        padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Sprint badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(124,58,237,0.06)", borderRadius: 8,
            padding: "6px 14px", border: "1px solid rgba(124,58,237,0.1)",
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6,
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "#fff", fontWeight: 800,
            }}>M</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#7c3aed", letterSpacing: 1.5, textTransform: "uppercase" }}>Medable</span>
          </div>
          <div style={{
            background: "rgba(124,58,237,0.06)", color: "#7c3aed",
            padding: "6px 14px", borderRadius: 8, fontSize: 11,
            fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
            border: "1px solid rgba(124,58,237,0.1)",
          }}>
            Sprint 1 — Empathize + Define
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px", lineHeight: 1.2 }}>
          Patient Journey Intelligence
        </h1>
        <p style={{ fontSize: 16, color: "#6b6b80", margin: "0 0 24px", maxWidth: 620, lineHeight: 1.6 }}>
          From opaque event logs to intelligent patient journeys — see the dropout crisis, then see the solution.
        </p>

        {/* Key problem stats */}
        <div style={{
          display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap",
        }}>
          {[
            { stat: "30-40%", label: "avg trial dropout rate", color: "#ef4444" },
            { stat: "$19B+", label: "wasted on failed trials/yr", color: "#f59e0b" },
            { stat: "44%", label: "cite travel as burden", color: "#8b5cf6" },
            { stat: "0", label: "systems own patient journey", color: "#1e1b4b" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "10px 18px", borderRadius: 10,
              background: "#fff", border: "1px solid rgba(124,58,237,0.08)",
              boxShadow: "0 1px 4px rgba(124,58,237,0.04)",
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color, marginRight: 6 }}>{s.stat}</span>
              <span style={{ fontSize: 11, color: "#8b8b9e" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, background: "rgba(124,58,237,0.04)", borderRadius: 10, padding: 3, width: "fit-content", marginBottom: 32, border: "1px solid rgba(124,58,237,0.06)" }}>
          {[
            { key: "split", label: "Split View" },
            { key: "asis", label: "AS-IS (Current)" },
            { key: "tobe", label: "TO-BE (Proposed)" },
          ].map(v => (
            <button key={v.key} onClick={() => setActiveView(v.key)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: activeView === v.key ? "#7c3aed" : "transparent",
              color: activeView === v.key ? "#fff" : "#8b8b9e",
              transition: "all 0.2s",
            }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main comparison */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 60, flexWrap: "wrap" }}>
          {/* AS-IS */}
          {(activeView === "split" || activeView === "asis") && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.3s" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8b8b9e", letterSpacing: 1.5, textTransform: "uppercase" }}>Current Experience</span>
              </div>
              <AsIsView visible={visible} />
              <div style={{ maxWidth: 320, opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.6s" }}>
                {[
                  "Event logs show IDs, not people — no context on who's struggling",
                  "No risk prediction — dropouts discovered only after they happen",
                  "Engagement invisible — no signal between scheduled visits",
                  "Site coordinators juggle 15+ systems with no unified patient view",
                ].map((pain, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid rgba(124,58,237,0.06)" }}>
                    <span style={{ color: "#ef4444", fontSize: 14, lineHeight: 1.4 }}>✕</span>
                    <span style={{ fontSize: 12, color: "#6b6b80", lineHeight: 1.5 }}>{pain}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arrow */}
          {activeView === "split" && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              alignSelf: "center", gap: 8, opacity: visible ? 1 : 0,
              transition: "opacity 0.8s 0.5s", paddingTop: 40,
            }}>
              <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.15), transparent)" }} />
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#7c3aed",
              }}>→</div>
              <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.15), transparent)" }} />
            </div>
          )}

          {/* TO-BE */}
          {(activeView === "split" || activeView === "tobe") && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.4s" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#8b8b9e", letterSpacing: 1.5, textTransform: "uppercase" }}>Proposed Experience</span>
              </div>
              <ToBeView visible={visible} />
              <div style={{ maxWidth: 360, opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.7s" }}>
                {[
                  "Patient-first view — names, conditions, engagement scores at a glance",
                  "AI risk scoring predicts dropout before it happens (low → critical)",
                  "Continuous engagement tracking between visits with proactive alerts",
                  "Unified journey view replaces 15 siloed systems for site coordinators",
                ].map((val, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid rgba(124,58,237,0.06)" }}>
                    <span style={{ color: "#22c55e", fontSize: 14, lineHeight: 1.4 }}>✓</span>
                    <span style={{ fontSize: 12, color: "#6b6b80", lineHeight: 1.5 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom insight bar */}
        <div style={{
          marginTop: 48, padding: "24px 32px", borderRadius: 16,
          background: "#fff", border: "1px solid rgba(124,58,237,0.08)",
          boxShadow: "0 2px 12px rgba(124,58,237,0.04)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24,
          opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "#8b8b9e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Data-Backed Insight</div>
            <div style={{ fontSize: 14, color: "#4a4a5e", lineHeight: 1.6, maxWidth: 500 }}>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>40%</span> of clinical trials fail to meet retention targets.{" "}
              <span style={{ color: "#7c3aed", fontWeight: 600 }}>44%</span> of patients cite travel as their top burden.{" "}
              <span style={{ color: "#22c55e", fontWeight: 600 }}>AI-powered tools</span> can improve retention by up to 65%.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Dropout ↓", value: "52%", color: "#22c55e" },
              { label: "Engagement ↑", value: "2.8×", color: "#7c3aed" },
              { label: "Time Saved", value: "34%", color: "#f59e0b" },
            ].map((m, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "8px 16px",
                background: "rgba(124,58,237,0.03)", borderRadius: 10,
                border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 9, color: "#8b8b9e", letterSpacing: 0.5, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
