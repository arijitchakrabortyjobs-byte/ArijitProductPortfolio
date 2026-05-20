import { useState } from "react";

const STAGES = [
  { id: "behavior", icon: "👤", label: "Patient Behavior", short: "Behavior" },
  { id: "features", icon: "⚙️", label: "Feature Pipeline", short: "Features" },
  { id: "model", icon: "🧠", label: "Self-Tuning Model", short: "Model" },
  { id: "guardrails", icon: "🛡️", label: "Guardrails & Evals", short: "Safety" },
  { id: "tokens", icon: "📊", label: "Token I/O", short: "Tokens" },
];

const BEHAVIOR_SIGNALS = [
  { name: "Visit Adherence", source: "EDC System", freq: "Per visit", latency: "Real-time", fields: ["visit_completed", "days_since_last", "reschedule_count", "no_show_streak", "visit_duration_min"] },
  { name: "eCOA Submissions", source: "Patient App", freq: "Daily/Weekly", latency: "Real-time", fields: ["completion_rate", "time_to_complete", "skip_patterns", "response_consistency", "late_submission_count"] },
  { name: "App Engagement", source: "Mobile SDK", freq: "Continuous", latency: "5min batch", fields: ["session_count_7d", "screen_time_avg", "feature_usage", "notification_response", "login_frequency"] },
  { name: "Communication", source: "Messaging", freq: "Per interaction", latency: "Real-time", fields: ["response_time_hours", "initiator_ratio", "sentiment_score", "message_length_trend", "unread_count"] },
  { name: "Travel & Burden", source: "Logistics", freq: "Per visit", latency: "Daily", fields: ["distance_miles", "transport_mode", "travel_time_min", "reschedule_reason", "site_preference_changes"] },
  { name: "Clinical Indicators", source: "Lab + AE", freq: "Per protocol", latency: "48h", fields: ["ae_severity_trend", "lab_compliance", "protocol_deviation_count", "concomitant_med_changes", "vitals_trend"] },
];

const FEATURES_DATA = [
  { raw: "visit_completed + no_show_streak + reschedule_count", computed: "visit_adherence_score", weight: "0.22", method: "Weighted rolling window (8 weeks) with recency decay" },
  { raw: "session_count_7d + completion_rate + notification_response", computed: "engagement_decay_rate", weight: "0.20", method: "Exponential moving average with slope detection" },
  { raw: "distance_miles + travel_time + reschedule_reason", computed: "burden_composite", weight: "0.18", method: "Multi-factor composite with site-adjusted normalization" },
  { raw: "response_time_hours + initiator_ratio + unread_count", computed: "communication_gap_score", weight: "0.15", method: "Time-decay weighted communication frequency index" },
  { raw: "ae_severity_trend + concomitant_med_changes", computed: "clinical_risk_factor", weight: "0.12", method: "Severity-graded adverse event trending with MedDRA mapping" },
  { raw: "session_count_7d + login_frequency + screen_time_avg", computed: "digital_engagement_index", weight: "0.08", method: "Normalized engagement funnel with platform-adjusted benchmarks" },
  { raw: "age_group + prior_trial_history + socioeconomic_proxy", computed: "demographic_risk_adjustment", weight: "0.05", method: "Baseline risk adjustment from historical trial cohort analysis" },
];

const MODEL_VERSIONS = [
  { version: "v2.4.0", date: "May 2026", auc: 0.943, precision: 0.891, recall: 0.932, f1: 0.911, leadTime: "18d", status: "production", changes: "Added communication gap features, improved lead time by 3 days" },
  { version: "v2.3.1", date: "Apr 2026", auc: 0.928, precision: 0.874, recall: 0.918, f1: 0.896, leadTime: "15d", status: "shadow", changes: "Integrated eCOA completion patterns into feature set" },
  { version: "v2.2.0", date: "Mar 2026", auc: 0.912, precision: 0.856, recall: 0.901, f1: 0.878, leadTime: "12d", status: "retired", changes: "Baseline gradient boosted model with visit + engagement features" },
];

const FEEDBACK_LOOPS = [
  { trigger: "Patient confirmed dropout", action: "True positive label → immediate model update", impact: "Strengthens signal weights for matching risk patterns", freq: "~34/month" },
  { trigger: "At-risk patient retained (intervention worked)", action: "Intervention success label → reinforce pathway", impact: "Tunes intervention engine for effective engagement strategy", freq: "~23/month" },
  { trigger: "False alarm (low-risk patient dropped)", action: "False negative investigation → feature gap analysis", impact: "Identifies missing signals, triggers feature engineering review", freq: "~4/month" },
  { trigger: "Engagement score drift detected", action: "Auto-recalibrate engagement baselines per cohort", impact: "Prevents model staleness as trial progresses through phases", freq: "Continuous" },
];

const GUARDRAILS = [
  { name: "Clinical Safety Override", metric: "AE-related flags reviewed by human", threshold: "100%", current: "100%", status: "pass" },
  { name: "Demographic Fairness", metric: "Risk score disparity across age/ethnicity", threshold: "< 5%", current: "2.8%", status: "pass" },
  { name: "Consent Compliance", metric: "Actions align with IRB-approved protocol", threshold: "100%", current: "100%", status: "pass" },
  { name: "Intervention Rate Cap", metric: "Max automated outreach per patient/week", threshold: "≤ 3", current: "2.1 avg", status: "pass" },
  { name: "Model Calibration", metric: "Expected calibration error", threshold: "< 0.05", current: "0.028", status: "pass" },
  { name: "PHI Protection", metric: "No PHI in model features or logs", threshold: "0 violations", current: "0", status: "pass" },
  { name: "Lead Time Accuracy", metric: "Predicted vs actual dropout window", threshold: "±5 days", current: "±3.2d", status: "pass" },
  { name: "Feature Staleness", metric: "Max age of any input feature", threshold: "< 48h", current: "12h", status: "pass" },
];

const EVAL_SUITES = [
  { name: "Retrospective Validation (5 prior trials)", pass: 38, fail: 1, skip: 1, lastRun: "4h ago", duration: "12m 30s" },
  { name: "Prospective Shadow (current trial)", pass: 89, fail: 3, skip: 2, lastRun: "1h ago", duration: "28m 15s" },
  { name: "Fairness Audit (6 demographic slices)", pass: 18, fail: 0, skip: 0, lastRun: "8h ago", duration: "9m 45s" },
  { name: "PHI Leakage Scan (feature + output audit)", pass: 42, fail: 0, skip: 0, lastRun: "2h ago", duration: "6m 20s" },
];

const TOKEN_DATA = {
  input: {
    avg: 612,
    breakdown: [
      { field: "Patient journey context (30d)", tokens: 218, pct: 35.6 },
      { field: "Visit + engagement features", tokens: 164, pct: 26.8 },
      { field: "Clinical indicators", tokens: 98, pct: 16.0 },
      { field: "Communication history", tokens: 78, pct: 12.7 },
      { field: "System prompt + safety rules", tokens: 54, pct: 8.8 },
    ],
  },
  output: {
    avg: 96,
    breakdown: [
      { field: "Risk score + tier classification", tokens: 14, pct: 14.6 },
      { field: "Signal decomposition (7 factors)", tokens: 28, pct: 29.2 },
      { field: "Intervention recommendation", tokens: 32, pct: 33.3 },
      { field: "Coordinator talking points", tokens: 22, pct: 22.9 },
    ],
  },
  cost: {
    perPatient: "$0.0042/day",
    monthly: "$26,208",
    perRetained: "$412",
    savedPerDropout: "$48,000",
    roi: "116×",
  },
};

export default function MedableAIMLArchitecture() {
  const [activeStage, setActiveStage] = useState("behavior");
  const [expanded, setExpanded] = useState(null);

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
      <div style={{ padding: "4px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>M</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>AI/ML Architecture</div>
            <div style={{ fontSize: 10, color: "#7c3aed", fontWeight: 600 }}>Dropout Prediction Pipeline</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {STAGES.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div onClick={() => setActiveStage(s.id)} style={{
                padding: "8px 10px", borderRadius: 8, cursor: "pointer", textAlign: "center", minWidth: 48,
                background: activeStage === s.id ? "#7c3aed" : "rgba(124,58,237,0.04)",
                border: activeStage === s.id ? "1px solid #7c3aed" : "1px solid rgba(124,58,237,0.08)",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 14, marginBottom: 1 }}>{s.icon}</div>
                <div style={{ fontSize: 7, fontWeight: 700, color: activeStage === s.id ? "#fff" : "#9ca3af", letterSpacing: 0.3, textTransform: "uppercase" }}>{s.short}</div>
              </div>
              {i < STAGES.length - 1 && (
                <div style={{ padding: "0 2px", display: "flex", alignItems: "center" }}>
                  <div style={{ width: 10, height: 2, background: "#c4b5fd", borderRadius: 1 }} />
                  <span style={{ fontSize: 8, color: "#c4b5fd" }}>▸</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px 16px", maxHeight: 400, overflowY: "auto" }}>
        {activeStage === "behavior" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 2 }}>Patient Behavior Signals</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>6 signal families capture the full patient experience — 30 raw fields per patient per day</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { label: "PATIENTS", value: "248", color: "#7c3aed" },
                { label: "FIELDS", value: "30", color: "#7c3aed" },
                { label: "REFRESH", value: "5min", color: "#7c3aed" },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, background: "rgba(124,58,237,0.04)", borderRadius: 8, padding: "8px 6px", textAlign: "center", border: "1px solid rgba(124,58,237,0.06)" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>{m.value}</div>
                  <div style={{ fontSize: 7, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.5 }}>{m.label}</div>
                </div>
              ))}
            </div>
            {BEHAVIOR_SIGNALS.map((sig, i) => (
              <div key={i} onClick={() => setExpanded(expanded === `b${i}` ? null : `b${i}`)} style={{
                background: expanded === `b${i}` ? "rgba(124,58,237,0.04)" : "#fff",
                border: expanded === `b${i}` ? "1px solid rgba(124,58,237,0.15)" : "1px solid rgba(124,58,237,0.06)",
                borderRadius: 10, padding: "10px 12px", marginBottom: 4, cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b" }}>{sig.name}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#7c3aed" }}>{sig.latency}</span>
                    <span style={{ fontSize: 9, color: "#c4b5fd" }}>{sig.freq}</span>
                    <span style={{ fontSize: 9, color: "#9ca3af" }}>{expanded === `b${i}` ? "▾" : "▸"}</span>
                  </div>
                </div>
                {expanded === `b${i}` && (
                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 8, color: "#9ca3af", width: "100%", marginBottom: 2 }}>Source: {sig.source}</div>
                    {sig.fields.map((f, j) => (
                      <span key={j} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontFamily: "monospace" }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeStage === "features" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 2 }}>Feature Engineering</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>30 raw fields → 7 computed features — normalized and weighted for ensemble risk scoring</div>
            <div style={{ background: "rgba(124,58,237,0.04)", borderRadius: 10, padding: 10, marginBottom: 12, border: "1px solid rgba(124,58,237,0.08)" }}>
              <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>DROPOUT RISK FORMULA</div>
              <div style={{ fontSize: 10, color: "#1e1b4b", fontFamily: "monospace", lineHeight: 1.6 }}>
                risk = 100 × Σ(wᵢ × featureᵢ)<br />
                <span style={{ color: "#9ca3af" }}>where</span> Σwᵢ = 1.0, <span style={{ color: "#9ca3af" }}>each</span> featureᵢ ∈ [0, 1]
              </div>
            </div>
            {FEATURES_DATA.map((f, i) => (
              <div key={i} onClick={() => setExpanded(expanded === `f${i}` ? null : `f${i}`)} style={{
                background: expanded === `f${i}` ? "rgba(124,58,237,0.04)" : "#fff",
                border: expanded === `f${i}` ? "1px solid rgba(124,58,237,0.15)" : "1px solid rgba(124,58,237,0.06)",
                borderRadius: 10, padding: "10px 12px", marginBottom: 4, cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", fontFamily: "monospace" }}>{f.computed}</span>
                  <span style={{ fontSize: 10, color: "#1e1b4b", fontWeight: 800 }}>{(parseFloat(f.weight) * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(124,58,237,0.06)", marginTop: 4 }}>
                  <div style={{ width: `${parseFloat(f.weight) / 0.22 * 100}%`, height: "100%", borderRadius: 2, background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }} />
                </div>
                {expanded === `f${i}` && (
                  <div style={{ marginTop: 6, fontSize: 9, color: "#64748b" }}>
                    <div style={{ marginBottom: 2 }}><span style={{ color: "#9ca3af" }}>Raw:</span> <span style={{ fontFamily: "monospace", fontSize: 8 }}>{f.raw}</span></div>
                    <div><span style={{ color: "#9ca3af" }}>Method:</span> {f.method}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeStage === "model" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 2 }}>Self-Tuning Model</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>Continuous learning from patient outcomes — predicts dropout 18 days in advance</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>MODEL VERSIONS</div>
            {MODEL_VERSIONS.map((m, i) => (
              <div key={i} style={{
                background: m.status === "production" ? "rgba(124,58,237,0.04)" : "#fff",
                border: m.status === "production" ? "1px solid rgba(124,58,237,0.15)" : "1px solid rgba(124,58,237,0.06)",
                borderRadius: 10, padding: 12, marginBottom: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", fontFamily: "monospace" }}>{m.version}</span>
                    <span style={{
                      fontSize: 7, fontWeight: 700, padding: "2px 5px", borderRadius: 3, letterSpacing: 0.3, textTransform: "uppercase",
                      background: m.status === "production" ? "rgba(34,197,94,0.1)" : m.status === "shadow" ? "rgba(245,158,11,0.1)" : "rgba(0,0,0,0.04)",
                      color: m.status === "production" ? "#22c55e" : m.status === "shadow" ? "#f59e0b" : "#9ca3af",
                    }}>{m.status}</span>
                  </div>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>{m.date}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  {[
                    { label: "AUC", value: m.auc },
                    { label: "Prec", value: m.precision },
                    { label: "Recall", value: m.recall },
                    { label: "F1", value: m.f1 },
                    { label: "Lead", value: m.leadTime },
                  ].map((metric, j) => (
                    <div key={j}>
                      <div style={{ fontSize: 7, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{metric.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", fontFamily: "monospace" }}>{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: "#64748b" }}>{m.changes}</div>
              </div>
            ))}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, marginTop: 12, letterSpacing: 0.5 }}>FEEDBACK LOOPS</div>
            {FEEDBACK_LOOPS.map((f, i) => (
              <div key={i} style={{
                display: "flex", gap: 8, padding: "8px 10px", marginBottom: 4,
                background: "#fff", borderRadius: 8, border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#7c3aed", flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1e1b4b", marginBottom: 1 }}>{f.trigger}</div>
                  <div style={{ fontSize: 9, color: "#7c3aed" }}>{f.action}</div>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 1 }}>{f.impact} · <span style={{ color: "#c4b5fd" }}>{f.freq}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeStage === "guardrails" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 2 }}>Guardrails & Evaluation</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>Clinical-grade safety — PHI protection, IRB compliance, and fairness audits enforced at every layer</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>SAFETY GUARDRAILS</div>
            {GUARDRAILS.map((g, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 10px", borderRadius: 8, marginBottom: 3,
                background: "#fff", border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1e1b4b" }}>{g.name}</div>
                  <div style={{ fontSize: 8, color: "#9ca3af" }}>{g.metric}</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", fontFamily: "monospace" }}>{g.current}</div>
                    <div style={{ fontSize: 7, color: "#9ca3af" }}>{g.threshold}</div>
                  </div>
                  <div style={{ fontSize: 7, fontWeight: 700, padding: "2px 4px", borderRadius: 3, background: "rgba(34,197,94,0.1)", color: "#22c55e", letterSpacing: 0.3 }}>PASS</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, marginTop: 12, letterSpacing: 0.5 }}>EVAL SUITES</div>
            {EVAL_SUITES.map((s, i) => (
              <div key={i} style={{
                padding: "8px 10px", borderRadius: 8, marginBottom: 4,
                background: "#fff", border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#1e1b4b" }}>{s.name}</span>
                  <span style={{ fontSize: 8, color: "#9ca3af" }}>{s.lastRun}</span>
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(124,58,237,0.04)", overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${(s.pass / (s.pass + s.fail + s.skip)) * 100}%`, height: "100%", background: "#22c55e" }} />
                    <div style={{ width: `${(s.fail / (s.pass + s.fail + s.skip)) * 100}%`, height: "100%", background: "#ef4444" }} />
                    <div style={{ width: `${(s.skip / (s.pass + s.fail + s.skip)) * 100}%`, height: "100%", background: "#d1d5db" }} />
                  </div>
                  <span style={{ fontSize: 8, color: "#22c55e", fontWeight: 600 }}>{s.pass}✓</span>
                  {s.fail > 0 && <span style={{ fontSize: 8, color: "#ef4444", fontWeight: 600 }}>{s.fail}✗</span>}
                  {s.skip > 0 && <span style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>{s.skip}⊘</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeStage === "tokens" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 2 }}>Token I/O Monitor</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 12 }}>612 input + 96 output tokens per patient assessment — $0.0042/patient/day</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[
                { label: "COST/DAY", value: TOKEN_DATA.cost.perPatient, color: "#7c3aed" },
                { label: "SAVED/DROP", value: TOKEN_DATA.cost.savedPerDropout, color: "#22c55e" },
                { label: "TOKEN ROI", value: TOKEN_DATA.cost.roi, color: "#f59e0b" },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, background: "rgba(124,58,237,0.04)", borderRadius: 8, padding: "8px 6px", textAlign: "center", border: "1px solid rgba(124,58,237,0.06)" }}>
                  <div style={{ fontSize: 7, color: m.color, fontWeight: 700, letterSpacing: 0.3 }}>{m.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>INPUT ({TOKEN_DATA.input.avg} tokens avg)</div>
            {TOKEN_DATA.input.breakdown.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: i < TOKEN_DATA.input.breakdown.length - 1 ? "1px solid rgba(124,58,237,0.04)" : "none" }}>
                <div style={{ width: 32, fontSize: 10, fontWeight: 800, color: "#1e1b4b", fontFamily: "monospace", textAlign: "right" }}>{t.tokens}</div>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(124,58,237,0.04)" }}>
                  <div style={{ width: `${t.pct}%`, height: "100%", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 9, color: "#64748b", minWidth: 100 }}>{t.field}</div>
              </div>
            ))}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, marginTop: 12, letterSpacing: 0.5 }}>OUTPUT ({TOKEN_DATA.output.avg} tokens avg)</div>
            {TOKEN_DATA.output.breakdown.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: i < TOKEN_DATA.output.breakdown.length - 1 ? "1px solid rgba(124,58,237,0.04)" : "none" }}>
                <div style={{ width: 32, fontSize: 10, fontWeight: 800, color: "#1e1b4b", fontFamily: "monospace", textAlign: "right" }}>{t.tokens}</div>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(34,197,94,0.06)" }}>
                  <div style={{ width: `${t.pct}%`, height: "100%", background: "linear-gradient(90deg, #059669, #34d399)", borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 9, color: "#64748b", minWidth: 100 }}>{t.field}</div>
              </div>
            ))}
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", marginBottom: 6, marginTop: 12, letterSpacing: 0.5 }}>COST AT SCALE</div>
            <div style={{
              background: "#fff", borderRadius: 10, padding: 12, border: "1px solid rgba(124,58,237,0.06)",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
            }}>
              {[
                { label: "Monthly cost", value: TOKEN_DATA.cost.monthly },
                { label: "Per retained patient", value: TOKEN_DATA.cost.perRetained },
                { label: "Saved per dropout prevented", value: TOKEN_DATA.cost.savedPerDropout },
                { label: "Token ROI", value: TOKEN_DATA.cost.roi },
              ].map((c, i) => (
                <div key={i}>
                  <div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: i === 3 ? "#22c55e" : "#1e1b4b" }}>{c.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-around", padding: "10px 16px",
        background: "rgba(124,58,237,0.03)", borderTop: "1px solid rgba(124,58,237,0.06)",
      }}>
        {[
          { label: "Signals", value: "30" },
          { label: "Features", value: "7" },
          { label: "AUC", value: "0.94" },
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
