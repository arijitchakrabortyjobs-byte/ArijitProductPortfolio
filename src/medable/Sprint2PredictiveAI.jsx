import { useState, useEffect, useRef } from "react";

const RISK_PATIENTS = [
  { name: "Linda W.", age: 41, condition: "T2D", week: 22, engagement: 15, risk: 94, riskLevel: "critical", lastCheckin: "32d ago", signals: { visitMissed: 4, engagementDecay: -79, burdenScore: 9.1, travelMiles: 48, sideEffects: 2, communicationGap: 28 } },
  { name: "Aisha P.", age: 29, condition: "T2D", week: 16, engagement: 38, risk: 82, riskLevel: "high", lastCheckin: "14d ago", signals: { visitMissed: 2, engagementDecay: -57, burdenScore: 7.8, travelMiles: 52, sideEffects: 1, communicationGap: 14 } },
  { name: "James R.", age: 58, condition: "HTN", week: 20, engagement: 31, risk: 78, riskLevel: "high", lastCheckin: "18d ago", signals: { visitMissed: 3, engagementDecay: -64, burdenScore: 8.4, travelMiles: 41, sideEffects: 0, communicationGap: 18 } },
  { name: "Michael T.", age: 48, condition: "T2D", week: 14, engagement: 42, risk: 67, riskLevel: "high", lastCheckin: "11d ago", signals: { visitMissed: 2, engagementDecay: -53, burdenScore: 7.2, travelMiles: 38, sideEffects: 1, communicationGap: 11 } },
  { name: "Chen Y.", age: 36, condition: "T2D", week: 15, engagement: 58, risk: 45, riskLevel: "medium", lastCheckin: "8d ago", signals: { visitMissed: 1, engagementDecay: -37, burdenScore: 6.1, travelMiles: 22, sideEffects: 0, communicationGap: 8 } },
  { name: "Maria L.", age: 45, condition: "T2D", week: 15, engagement: 62, risk: 38, riskLevel: "medium", lastCheckin: "6d ago", signals: { visitMissed: 1, engagementDecay: -33, burdenScore: 5.8, travelMiles: 18, sideEffects: 0, communicationGap: 6 } },
  { name: "Robert C.", age: 52, condition: "HTN", week: 12, engagement: 87, risk: 12, riskLevel: "low", lastCheckin: "3d ago", signals: { visitMissed: 0, engagementDecay: -8, burdenScore: 3.2, travelMiles: 8, sideEffects: 0, communicationGap: 3 } },
  { name: "Patricia D.", age: 61, condition: "HTN", week: 24, engagement: 96, risk: 5, riskLevel: "low", lastCheckin: "Today", signals: { visitMissed: 0, engagementDecay: -1, burdenScore: 2.1, travelMiles: 5, sideEffects: 0, communicationGap: 0 } },
];

const MODEL_FEATURES = [
  { name: "Visit Adherence", weight: 0.22, desc: "Missed visits in rolling 8-week window", icon: "📅" },
  { name: "Engagement Decay", weight: 0.20, desc: "Rate of engagement score decline over time", icon: "📉" },
  { name: "Burden Score", weight: 0.18, desc: "Composite of travel, visit length, procedure complexity", icon: "⚖️" },
  { name: "Communication Gap", weight: 0.15, desc: "Days since last meaningful site-patient interaction", icon: "💬" },
  { name: "Side Effect Reports", weight: 0.12, desc: "Frequency and severity of adverse event reports", icon: "⚠️" },
  { name: "Travel Distance", weight: 0.08, desc: "Miles to nearest trial site (one-way)", icon: "🚗" },
  { name: "Demographic Factors", weight: 0.05, desc: "Age, socioeconomic indicators, prior trial history", icon: "👤" },
];

const INTERVENTIONS = [
  { risk: "critical", label: "Critical (>80)", color: "#ef4444", bgColor: "rgba(239,68,68,0.08)", actions: ["Immediate coordinator outreach call", "Offer home-visit option", "Schedule burden reduction review", "Escalate to PI for retention decision"] },
  { risk: "high", label: "High (60-80)", color: "#f59e0b", bgColor: "rgba(245,158,11,0.08)", actions: ["Priority re-engagement within 48h", "Send personalized check-in", "Review and simplify visit schedule", "Assign dedicated support contact"] },
  { risk: "medium", label: "Medium (30-60)", color: "#8b5cf6", bgColor: "rgba(139,92,246,0.08)", actions: ["Automated engagement nudge", "Offer schedule flexibility", "Share trial progress update", "Monitor weekly"] },
  { risk: "low", label: "Low (<30)", color: "#22c55e", bgColor: "rgba(34,197,94,0.08)", actions: ["Continue standard cadence", "Positive reinforcement messaging", "Quarterly satisfaction check"] },
];

function RiskGauge({ score, size = 60 }) {
  const color = score > 80 ? "#ef4444" : score > 60 ? "#f59e0b" : score > 30 ? "#8b5cf6" : "#22c55e";
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 200);
    return () => clearTimeout(t);
  }, [score, circ]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(124,58,237,0.06)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color }}>{score}</span>
      </div>
    </div>
  );
}

export default function Sprint2PredictiveAI() {
  const [tab, setTab] = useState("predictions");
  const [expandedPatient, setExpandedPatient] = useState(0);

  const riskColor = (level) => level === "critical" ? "#ef4444" : level === "high" ? "#f59e0b" : level === "medium" ? "#8b5cf6" : "#22c55e";

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
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", margin: 0 }}>Dropout Prediction Engine</h3>
            <p style={{ fontSize: 10, color: "#7c3aed", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 2 — Ideate + Prototype</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(124,58,237,0.08)" }}>
        {[
          { key: "predictions", label: "Risk Predictions" },
          { key: "model", label: "Model Features" },
          { key: "interventions", label: "Interventions" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#7c3aed" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #7c3aed" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", maxHeight: 440, overflowY: "auto" }}>
        {tab === "predictions" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[
                { label: "At Risk", value: "52", sub: "of 248", color: "#ef4444" },
                { label: "Accuracy", value: "91%", sub: "AUC 0.94", color: "#7c3aed" },
                { label: "Prevented", value: "23", sub: "this month", color: "#22c55e" },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "10px 10px", border: "1px solid rgba(124,58,237,0.06)", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{m.label}</div>
                  <div style={{ fontSize: 9, color: "#c4b5fd" }}>{m.sub}</div>
                </div>
              ))}
            </div>
            {RISK_PATIENTS.map((p, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div onClick={() => setExpandedPatient(expandedPatient === i ? null : i)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: "#fff", borderRadius: 12, cursor: "pointer",
                  border: expandedPatient === i ? "1px solid rgba(124,58,237,0.2)" : "1px solid rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                }}>
                  <RiskGauge score={p.risk} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>{p.name}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${riskColor(p.riskLevel)}15`, color: riskColor(p.riskLevel), textTransform: "uppercase", letterSpacing: 0.5 }}>{p.riskLevel}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>{p.condition} · Week {p.week} · {p.lastCheckin}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 600 }}>Engagement</div>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(124,58,237,0.06)" }}>
                        <div style={{ width: `${p.engagement}%`, height: "100%", borderRadius: 2, background: riskColor(p.riskLevel), transition: "width 0.8s ease" }} />
                      </div>
                      <span style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>{p.engagement}%</span>
                    </div>
                  </div>
                </div>
                {expandedPatient === i && (
                  <div style={{ background: "#faf5ff", borderRadius: "0 0 12px 12px", padding: "10px 12px", marginTop: -4, border: "1px solid rgba(124,58,237,0.1)", borderTop: "none" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Signal Breakdown</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      {[
                        { label: "Missed Visits", value: p.signals.visitMissed, unit: "" },
                        { label: "Engagement Δ", value: p.signals.engagementDecay, unit: "%" },
                        { label: "Burden Score", value: p.signals.burdenScore, unit: "/10" },
                        { label: "Travel", value: p.signals.travelMiles, unit: " mi" },
                        { label: "Side Effects", value: p.signals.sideEffects, unit: "" },
                        { label: "Comm Gap", value: p.signals.communicationGap, unit: "d" },
                      ].map((s, j) => (
                        <div key={j} style={{ background: "#fff", borderRadius: 6, padding: "6px 8px", border: "1px solid rgba(124,58,237,0.06)" }}>
                          <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{s.value}{s.unit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "model" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid rgba(124,58,237,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>MODEL PERFORMANCE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "AUC-ROC", value: "0.94" },
                  { label: "Precision", value: "0.89" },
                  { label: "Recall", value: "0.93" },
                  { label: "F1 Score", value: "0.91" },
                  { label: "Lead Time", value: "18d" },
                  { label: "Accuracy", value: "91%" },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b" }}>{m.value}</div>
                    <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 0.5 }}>FEATURE WEIGHTS</div>
            {MODEL_FEATURES.map((f, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>{f.icon} {f.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed" }}>{(f.weight * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(124,58,237,0.06)", marginBottom: 4 }}>
                  <div style={{ width: `${f.weight * 100 / 0.22 * 100}%`, maxWidth: "100%", height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }} />
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "interventions" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 14, border: "1px solid rgba(124,58,237,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>AUTOMATED INTERVENTION ENGINE</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                Risk scores trigger tier-appropriate interventions automatically — escalating from nudges to coordinator outreach as dropout probability increases.
              </div>
            </div>
            {INTERVENTIONS.map((tier, i) => (
              <div key={i} style={{
                background: tier.bgColor, borderRadius: 12, padding: 14, marginBottom: 8,
                border: `1px solid ${tier.color}20`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: tier.color }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: tier.color }}>{tier.label}</span>
                </div>
                {tier.actions.map((a, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: tier.color, marginTop: 1 }}>▸</span>
                    <span style={{ fontSize: 11, color: "#374151", lineHeight: 1.4 }}>{a}</span>
                  </div>
                ))}
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
          { label: "At Risk", value: "52" },
          { label: "AUC", value: "0.94" },
          { label: "Lead Time", value: "18d" },
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
