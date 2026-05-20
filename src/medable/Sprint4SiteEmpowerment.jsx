import { useState } from "react";

const SITE_PATIENTS = [
  { name: "Linda W.", risk: "critical", score: 94, action: "Call now — 32 days no contact", actionType: "urgent", engagement: 15, nextVisit: "Overdue", visits: "7/11" },
  { name: "Aisha P.", risk: "high", score: 82, action: "Re-engage within 48h", actionType: "priority", engagement: 38, nextVisit: "Overdue", visits: "6/8" },
  { name: "James R.", risk: "high", score: 78, action: "Schedule travel assistance", actionType: "priority", engagement: 31, nextVisit: "Jun 2", visits: "7/10" },
  { name: "Michael T.", risk: "high", score: 67, action: "Send progress update", actionType: "standard", engagement: 42, nextVisit: "Jun 4", visits: "5/7" },
  { name: "Chen Y.", risk: "medium", score: 45, action: "Automated nudge sent", actionType: "auto", engagement: 58, nextVisit: "Jun 10", visits: "6/7" },
  { name: "Maria L.", risk: "medium", score: 38, action: "Weekly monitor", actionType: "auto", engagement: 62, nextVisit: "Jun 12", visits: "6/7" },
  { name: "Sarah M.", risk: "low", score: 8, action: "On track — no action needed", actionType: "none", engagement: 94, nextVisit: "Jun 8", visits: "9/9" },
  { name: "David K.", risk: "low", score: 5, action: "On track — no action needed", actionType: "none", engagement: 91, nextVisit: "Jun 5", visits: "13/13" },
];

const WORKLOAD_METRICS = {
  before: { patientsPerCoord: 42, avgActionsPerDay: 67, manualFollowUps: 28, timeOnAdmin: "62%", missedEscalations: 8, burnoutRisk: "High" },
  after: { patientsPerCoord: 42, avgActionsPerDay: 18, manualFollowUps: 6, timeOnAdmin: "22%", missedEscalations: 0, burnoutRisk: "Low" },
};

const DASHBOARD_VIEWS = [
  { name: "Priority Queue", icon: "🎯" },
  { name: "Trial Health", icon: "📊" },
  { name: "Coordinator", icon: "👩‍⚕️" },
];

const TRIAL_HEALTH = {
  enrolled: 248, active: 214, dropped: 34, atRisk: 52,
  retentionTarget: 85, retentionActual: 89,
  sites: [
    { name: "Metro General", patients: 62, retention: 92, atRisk: 8 },
    { name: "University Med", patients: 54, retention: 87, atRisk: 12 },
    { name: "Riverside Clinic", patients: 48, retention: 91, atRisk: 7 },
    { name: "Downtown Health", patients: 44, retention: 84, atRisk: 14 },
    { name: "Suburban Care", patients: 40, retention: 88, atRisk: 11 },
  ],
};

export default function Sprint4SiteEmpowerment() {
  const [view, setView] = useState(0);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [showWorkload, setShowWorkload] = useState(false);

  const riskColor = (r) => r === "critical" ? "#ef4444" : r === "high" ? "#f59e0b" : r === "medium" ? "#8b5cf6" : "#22c55e";
  const actionColor = (t) => t === "urgent" ? "#ef4444" : t === "priority" ? "#f59e0b" : t === "standard" ? "#7c3aed" : t === "auto" ? "#22c55e" : "#d1d5db";

  return (
    <div style={{
      background: "linear-gradient(180deg, #f5f0ff 0%, #faf8ff 40%, #ffffff 100%)",
      borderRadius: 28, width: 340, minHeight: 620, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(124,58,237,0.12)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(124,58,237,0.1)",
      margin: "0 auto",
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>
      <div style={{ padding: "4px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>M</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", margin: 0 }}>Site Coordinator Dashboard</h3>
            <p style={{ fontSize: 10, color: "#7c3aed", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 4 — Test + Iterate</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "0 16px 12px" }}>
        {DASHBOARD_VIEWS.map((v, i) => (
          <div key={i} onClick={() => setView(i)} style={{
            flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer", textAlign: "center",
            background: view === i ? "#7c3aed" : "#fff",
            color: view === i ? "#fff" : "#7c3aed",
            fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
            border: view === i ? "1px solid #7c3aed" : "1px solid rgba(124,58,237,0.1)",
            transition: "all 0.2s",
          }}>{v.icon} {v.name}</div>
        ))}
      </div>

      <div style={{ padding: "0 16px 16px", maxHeight: 430, overflowY: "auto" }}>
        {view === 0 && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { label: "Urgent", value: "1", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
                { label: "Priority", value: "3", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
                { label: "Auto", value: "2", color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
                { label: "OK", value: "2", color: "#9ca3af", bg: "rgba(0,0,0,0.02)" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: s.bg, borderRadius: 8, padding: "8px 6px", textAlign: "center", border: `1px solid ${s.color}15` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {SITE_PATIENTS.map((p, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div onClick={() => setExpandedPatient(expandedPatient === i ? null : i)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 10px",
                  background: "#fff", borderRadius: 10, cursor: "pointer",
                  borderLeft: `3px solid ${riskColor(p.risk)}`,
                  border: `1px solid rgba(0,0,0,0.04)`,
                  borderLeftWidth: 3, borderLeftColor: riskColor(p.risk),
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>{p.name}</span>
                      <span style={{
                        fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                        background: `${actionColor(p.actionType)}15`, color: actionColor(p.actionType),
                        letterSpacing: 0.3, textTransform: "uppercase",
                      }}>{p.actionType === "none" ? "ON TRACK" : p.actionType}</span>
                    </div>
                    <div style={{ fontSize: 10, color: actionColor(p.actionType), fontWeight: 600, marginTop: 2 }}>{p.action}</div>
                    <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>Risk: {p.score} · Next: {p.nextVisit} · Visits: {p.visits}</div>
                  </div>
                </div>
                {expandedPatient === i && (
                  <div style={{ background: "#faf5ff", borderRadius: "0 0 10px 10px", padding: "10px 12px", marginTop: -2, border: "1px solid rgba(124,58,237,0.08)", borderTop: "none" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1, textAlign: "center", background: "#fff", borderRadius: 6, padding: "6px 4px" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: riskColor(p.risk) }}>{p.score}</div>
                        <div style={{ fontSize: 8, color: "#9ca3af" }}>Risk Score</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center", background: "#fff", borderRadius: 6, padding: "6px 4px" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>{p.engagement}%</div>
                        <div style={{ fontSize: 8, color: "#9ca3af" }}>Engagement</div>
                      </div>
                    </div>
                    {p.actionType !== "none" && p.actionType !== "auto" && (
                      <div style={{
                        display: "flex", gap: 6,
                      }}>
                        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#7c3aed", textAlign: "center", cursor: "pointer" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>📞 Call</span>
                        </div>
                        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#ede9fe", textAlign: "center", cursor: "pointer" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed" }}>💬 Message</span>
                        </div>
                        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "#ede9fe", textAlign: "center", cursor: "pointer" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed" }}>📋 Note</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === 1 && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, border: "1px solid rgba(124,58,237,0.06)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 0.5 }}>STUDY DM-2026-042 OVERVIEW</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[
                  { label: "Enrolled", value: TRIAL_HEALTH.enrolled, color: "#1e1b4b" },
                  { label: "Active", value: TRIAL_HEALTH.active, color: "#7c3aed" },
                  { label: "Dropped", value: TRIAL_HEALTH.dropped, color: "#ef4444" },
                  { label: "At Risk", value: TRIAL_HEALTH.atRisk, color: "#f59e0b" },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: "center", background: "rgba(124,58,237,0.03)", borderRadius: 8, padding: "8px 6px" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>RETENTION vs TARGET</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(124,58,237,0.06)", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: `${TRIAL_HEALTH.retentionActual}%`, height: "100%", borderRadius: 5, background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }} />
                  <div style={{ position: "absolute", left: `${TRIAL_HEALTH.retentionTarget}%`, top: 0, bottom: 0, width: 2, background: "#ef4444" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#22c55e" }}>{TRIAL_HEALTH.retentionActual}%</span>
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>Target: {TRIAL_HEALTH.retentionTarget}% · <span style={{ color: "#22c55e", fontWeight: 600 }}>+4pp above target</span></div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>SITE PERFORMANCE</div>
            {TRIAL_HEALTH.sites.map((s, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 4,
                border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b" }}>{s.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: s.retention >= 90 ? "#22c55e" : s.retention >= 85 ? "#7c3aed" : "#f59e0b" }}>{s.retention}%</span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 9, color: "#9ca3af" }}>
                  <span>{s.patients} patients</span>
                  <span style={{ color: s.atRisk > 10 ? "#f59e0b" : "#9ca3af" }}>{s.atRisk} at risk</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 2 && (
          <div>
            <div onClick={() => setShowWorkload(!showWorkload)} style={{
              background: "#fff", borderRadius: 12, padding: 12, marginBottom: 14,
              border: "1px solid rgba(124,58,237,0.08)", cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", letterSpacing: 0.5 }}>WORKLOAD IMPACT</div>
                <span style={{ fontSize: 10, color: "#9ca3af" }}>{showWorkload ? "▾" : "▸"}</span>
              </div>
              {!showWorkload && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Tap to see before/after coordinator workload comparison</div>
              )}
            </div>
            {showWorkload && (
              <div style={{ marginBottom: 14 }}>
                {[
                  { label: "Actions/Day", before: WORKLOAD_METRICS.before.avgActionsPerDay, after: WORKLOAD_METRICS.after.avgActionsPerDay, unit: "", delta: "-73%" },
                  { label: "Manual Follow-ups", before: WORKLOAD_METRICS.before.manualFollowUps, after: WORKLOAD_METRICS.after.manualFollowUps, unit: "/day", delta: "-79%" },
                  { label: "Time on Admin", before: WORKLOAD_METRICS.before.timeOnAdmin, after: WORKLOAD_METRICS.after.timeOnAdmin, unit: "", delta: "-65%" },
                  { label: "Missed Escalations", before: WORKLOAD_METRICS.before.missedEscalations, after: WORKLOAD_METRICS.after.missedEscalations, unit: "/mo", delta: "-100%" },
                  { label: "Burnout Risk", before: WORKLOAD_METRICS.before.burnoutRisk, after: WORKLOAD_METRICS.after.burnoutRisk, unit: "", delta: "" },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 12px", marginBottom: 4,
                    border: "1px solid rgba(124,58,237,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#1e1b4b", flex: 1 }}>{m.label}</span>
                    <span style={{ fontSize: 10, color: "#9ca3af", textDecoration: "line-through", marginRight: 8 }}>{m.before}{m.unit}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#22c55e" }}>{m.after}{m.unit}</span>
                    {m.delta && <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, marginLeft: 4 }}>{m.delta}</span>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 0.5 }}>COORDINATOR'S DAY — REDESIGNED</div>
            {[
              { time: "8:00 AM", task: "Review AI-prioritized queue", detail: "6 patients need attention (vs. 42 manual reviews before)", duration: "10 min", icon: "🎯" },
              { time: "8:15 AM", task: "Call Linda W. (critical risk)", detail: "AI prepared context: 32d no contact, 4 missed visits, suggested talking points", duration: "15 min", icon: "📞" },
              { time: "8:45 AM", task: "Review auto-interventions", detail: "12 automated nudges sent overnight — 8 opened, 5 acted on", duration: "5 min", icon: "🤖" },
              { time: "9:00 AM", task: "Video check-in with Aisha P.", detail: "AI flagged burden concern — discuss schedule simplification", duration: "20 min", icon: "📹" },
              { time: "9:30 AM", task: "Update PI on trial health", detail: "Dashboard auto-generated — retention 89%, 4pp above target", duration: "10 min", icon: "📊" },
              { time: "10:00 AM", task: "Patient-facing time begins", detail: "Admin reduced from 62% → 22% — more time for meaningful care", duration: "Rest of day", icon: "💜" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, marginBottom: 6, padding: "8px 10px",
                background: "#fff", borderRadius: 10, border: "1px solid rgba(124,58,237,0.04)",
              }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <div style={{ fontSize: 8, color: "#c4b5fd", fontWeight: 600, marginTop: 2 }}>{item.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b" }}>{item.task}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{item.detail}</div>
                  <div style={{ fontSize: 9, color: "#c4b5fd", marginTop: 2 }}>{item.duration}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-around", padding: "10px 16px",
        background: "rgba(124,58,237,0.03)", borderTop: "1px solid rgba(124,58,237,0.06)",
      }}>
        {[
          { label: "Actions", value: "-73%" },
          { label: "Admin", value: "22%" },
          { label: "Missed", value: "0" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>{s.value}</div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
