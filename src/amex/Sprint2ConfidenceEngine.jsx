import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from "recharts";

// ═══════════════════════════════════════════════════════════════════════
// AMEX SPRINT 2 — IDEATE + PROTOTYPE
// Confidence Score Engine + Tiered Verification UX
// ═══════════════════════════════════════════════════════════════════════

const AX = {
  bg: "#0A0F1E", card: "#111827", border: "#1E293B",
  blue: "#2563EB", cyan: "#06B6D4", amber: "#F59E0B",
  red: "#EF4444", green: "#10B981", purple: "#8B5CF6",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#475569",
};

// ── Confidence Score Breakdown ──
const signalWeights = [
  { signal: "Device Trust", weight: 20, description: "Known device, biometric match, app session active" },
  { signal: "Location Match", weight: 18, description: "Transaction location matches home, work, or Amex Travel itinerary" },
  { signal: "Merchant History", weight: 15, description: "Cardholder has transacted with this merchant before" },
  { signal: "Behavioral Pattern", weight: 17, description: "Spending pattern consistent with cardholder's 90-day history" },
  { signal: "Transaction Velocity", weight: 12, description: "Number, speed, and amount of recent transactions within norm" },
  { signal: "Network Intelligence", weight: 10, description: "Other Amex cardholders transacting at same merchant/location" },
  { signal: "Time-of-Day Pattern", weight: 8, description: "Transaction time consistent with cardholder's active hours" },
];

const radarData = [
  { signal: "Device", current: 65, proposed: 92 },
  { signal: "Location", current: 45, proposed: 88 },
  { signal: "Merchant", current: 70, proposed: 85 },
  { signal: "Behavior", current: 58, proposed: 90 },
  { signal: "Velocity", current: 72, proposed: 82 },
  { signal: "Network", current: 30, proposed: 78 },
  { signal: "Time", current: 40, proposed: 75 },
];

// ── Tiered Verification Model ──
const tiers = [
  {
    name: "Auto-Approve",
    range: "85-100",
    color: AX.green,
    pct: 62,
    action: "Transaction approved silently. No customer friction.",
    example: "Known device + home city + frequent merchant = auto-approve",
    latency: "<2ms",
  },
  {
    name: "Soft Verify",
    range: "60-84",
    color: AX.cyan,
    pct: 23,
    action: "Push notification with context: 'We noticed a $890 charge at Harrods London. Since you're in London, we've approved it. Tap if this wasn't you.'",
    example: "Known device + new city but matches Amex Travel booking",
    latency: "Instant push",
  },
  {
    name: "Active Verify",
    range: "35-59",
    color: AX.amber,
    pct: 11,
    action: "In-app challenge: biometric confirm or 1-tap approve. Transaction held for 60 seconds max.",
    example: "Unknown device + known merchant + normal amount",
    latency: "<60 sec hold",
  },
  {
    name: "Hard Block",
    range: "0-34",
    color: AX.red,
    pct: 4,
    action: "Transaction declined. Immediate call from Amex fraud team within 2 minutes.",
    example: "Unknown device + unknown location + abnormal amount + velocity spike",
    latency: "Instant decline",
  },
];

// ── Projected Impact ──
const projectedImpact = [
  { metric: "False Positives (Monthly)", current: "142,000", proposed: "38,000", improvement: "-73%", color: AX.green },
  { metric: "Revenue Blocked by FP", current: "$38.2M", proposed: "$8.4M", improvement: "-78%", color: AX.green },
  { metric: "Customer Complaints (FP)", current: "38,400", proposed: "9,200", improvement: "-76%", color: AX.green },
  { metric: "Avg Resolution Time", current: "47 min", proposed: "12 sec (auto) / 45 sec (verify)", improvement: "-99%", color: AX.green },
  { metric: "Auto-Resolution Rate", current: "34%", proposed: "85%", improvement: "+150%", color: AX.cyan },
  { metric: "True Fraud Detection", current: "95.2%", proposed: "96.8%", improvement: "+1.6pp", color: AX.cyan },
];

// ── Simulation Data ──
const simulationScenarios = [
  {
    id: 1,
    title: "Sarah — Business Traveler in Tokyo",
    amount: "$3,200",
    merchant: "Park Hyatt Tokyo",
    signals: { device: 95, location: 82, merchant: 20, behavior: 75, velocity: 88, network: 70, time: 45 },
    score: 78,
    tier: "Soft Verify",
    tierColor: AX.cyan,
    outcome: "Approved + push: 'We noticed a $3,200 charge at Park Hyatt Tokyo. Your Amex Travel shows a Tokyo booking — approved automatically.'",
    oldOutcome: "DECLINED. Sarah had to call from a hotel lobby in Tokyo at 11pm to unblock her card. Took 47 minutes. She switched to Visa for the rest of the trip.",
  },
  {
    id: 2,
    title: "James — Online Subscription Renewal",
    amount: "$149.99",
    merchant: "Adobe Creative Cloud",
    signals: { device: 90, location: 95, merchant: 95, behavior: 92, velocity: 98, network: 85, time: 88 },
    score: 93,
    tier: "Auto-Approve",
    tierColor: AX.green,
    outcome: "Approved silently. Zero friction. James never even knows the system checked.",
    oldOutcome: "FLAGGED. SMS sent asking 'Was this you?' James was in a meeting, didn't see it for 3 hours. Adobe access suspended. He missed a client deadline.",
  },
  {
    id: 3,
    title: "Priya — First-Time Luxury Purchase",
    amount: "$8,500",
    merchant: "Louis Vuitton (New Store)",
    signals: { device: 85, location: 90, merchant: 10, behavior: 35, velocity: 40, network: 55, time: 80 },
    score: 48,
    tier: "Active Verify",
    tierColor: AX.amber,
    outcome: "Transaction held 60 sec. Push: 'Confirm $8,500 at Louis Vuitton with Face ID.' Priya confirms in 8 seconds. Approved.",
    oldOutcome: "DECLINED at the counter. Priya was embarrassed in front of the store associate. Called support, waited 35 minutes. Left the store without purchasing.",
  },
];

const SectionTitle = ({ icon, title, subtitle }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: AX.textPrimary, letterSpacing: -0.3 }}>{title}</span>
    </div>
    {subtitle && <div style={{ fontSize: 12, color: AX.textMuted, marginLeft: 24 }}>{subtitle}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1E293B", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 12, color: "#E2E8F0",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ color: "#94A3B8" }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Sprint2ConfidenceEngine() {
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <div style={{
      background: AX.bg, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${AX.border}`, fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 28px 20px",
        background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.05))",
        borderBottom: `1px solid ${AX.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
          }}>AX</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: AX.textPrimary, letterSpacing: -0.5 }}>
              Sprint 2 — Ideate + Prototype
            </div>
            <div style={{ fontSize: 11, color: AX.textMuted }}>
              Confidence Score Engine + Tiered Verification UX · Design Thinking Phase 2
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 12, padding: "10px 14px", borderRadius: 8,
          background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)",
          fontSize: 12, color: "#A5F3FC", lineHeight: 1.5,
        }}>
          <strong style={{ color: AX.cyan }}>The Prototype:</strong> Replace the binary APPROVE/DECLINE system with a
          <strong> Confidence Score (0-100)</strong> computed from 7 unified signals. Transactions are routed through 4 verification tiers
          based on score — from silent auto-approval to human-assisted review. Projected to reduce false positives by 73%.
        </div>
      </div>

      {/* Confidence Score Architecture */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <SectionTitle icon="🧮" title="Confidence Score Architecture" subtitle="7 signals weighted to produce a 0-100 trust score per transaction" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Signal Weights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {signalWeights.map((s, i) => (
              <div key={i} style={{
                background: AX.card, border: `1px solid ${AX.border}`, borderRadius: 10,
                padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: `${AX.blue}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: AX.blue, flexShrink: 0,
                }}>{s.weight}%</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: AX.textPrimary }}>{s.signal}</div>
                  <div style={{ fontSize: 10, color: AX.textMuted, marginTop: 2 }}>{s.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart: Current vs Proposed */}
          <div style={{ background: AX.card, borderRadius: 12, padding: 18, border: `1px solid ${AX.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: AX.textPrimary, marginBottom: 4 }}>Signal Coverage: Current vs Proposed</div>
            <div style={{ fontSize: 10, color: AX.textMuted, marginBottom: 12 }}>Red = siloed signals today. Blue = unified confidence score.</div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={AX.border} />
                <PolarAngleAxis dataKey="signal" tick={{ fill: AX.textSecondary, fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fill: AX.textMuted, fontSize: 9 }} domain={[0, 100]} />
                <Radar name="Current (Siloed)" dataKey="current" stroke={AX.red} fill={AX.red} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Proposed (Unified)" dataKey="proposed" stroke={AX.cyan} fill={AX.cyan} fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tiered Verification */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <SectionTitle icon="🔐" title="4-Tier Verification Model" subtitle="Confidence score determines verification intensity — not binary approve/decline" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {tiers.map((tier, i) => (
            <div key={i} style={{
              background: AX.card, border: `1px solid ${AX.border}`, borderRadius: 12,
              padding: 16, borderTop: `3px solid ${tier.color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: tier.color }}>{tier.name}</div>
                <div style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  background: `${tier.color}15`, color: tier.color,
                }}>{tier.pct}%</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: AX.textMuted, marginBottom: 6 }}>Score: {tier.range}</div>
              <div style={{ fontSize: 11, color: AX.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{tier.action}</div>
              <div style={{
                fontSize: 10, color: AX.textMuted, padding: "6px 8px", borderRadius: 6,
                background: "rgba(255,255,255,0.03)", lineHeight: 1.4,
              }}>
                <strong>Example:</strong> {tier.example}
              </div>
              <div style={{ fontSize: 10, color: tier.color, fontWeight: 600, marginTop: 8 }}>⏱ {tier.latency}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Scenario Simulator */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <SectionTitle icon="🎬" title="Scenario Simulator — Before vs After" subtitle="See how the Confidence Score Engine changes real transaction outcomes" />
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {simulationScenarios.map((sc, i) => (
            <button key={i} onClick={() => setActiveScenario(i)} style={{
              padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600,
              background: activeScenario === i ? AX.blue : "rgba(255,255,255,0.05)",
              color: activeScenario === i ? "#fff" : AX.textSecondary,
              transition: "all 0.2s",
            }}>{sc.title}</button>
          ))}
        </div>

        {(() => {
          const sc = simulationScenarios[activeScenario];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Old System */}
              <div style={{
                background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: AX.red, marginBottom: 8 }}>❌ OLD SYSTEM (Binary)</div>
                <div style={{ fontSize: 12, color: AX.textSecondary, lineHeight: 1.6 }}>{sc.oldOutcome}</div>
              </div>
              {/* New System */}
              <div style={{
                background: `${sc.tierColor}08`, border: `1px solid ${sc.tierColor}25`,
                borderRadius: 12, padding: 18,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: AX.green }}>✅ NEW SYSTEM (Confidence)</div>
                  <div style={{
                    fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 6,
                    background: `${sc.tierColor}20`, color: sc.tierColor,
                  }}>Score: {sc.score} → {sc.tier}</div>
                </div>
                <div style={{ fontSize: 12, color: AX.textSecondary, lineHeight: 1.6 }}>{sc.outcome}</div>
                <div style={{
                  marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap",
                }}>
                  {Object.entries(sc.signals).map(([key, val]) => (
                    <div key={key} style={{
                      fontSize: 9, padding: "3px 8px", borderRadius: 4,
                      background: val > 80 ? "rgba(16,185,129,0.1)" : val > 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                      color: val > 80 ? AX.green : val > 50 ? AX.amber : AX.red,
                      fontWeight: 600,
                    }}>{key}: {val}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Projected Impact */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <SectionTitle icon="📊" title="Projected Impact" subtitle="Before and after deploying the Confidence Score Engine" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {projectedImpact.map((m, i) => (
            <div key={i} style={{
              background: AX.card, border: `1px solid ${AX.border}`, borderRadius: 12,
              padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, color: AX.textMuted, marginBottom: 8, fontWeight: 500 }}>{m.metric}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: AX.textMuted, textDecoration: "line-through" }}>{m.current}</span>
                <span style={{ fontSize: 12, color: AX.textMuted }}>→</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: AX.textPrimary }}>{m.proposed}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.improvement}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Design Thinking Insight */}
      <div style={{ padding: "20px 28px 24px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(6,182,212,0.08))",
          border: `1px solid rgba(139,92,246,0.15)`, borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: AX.textPrimary, marginBottom: 8 }}>
            🧠 Sprint 2 Design Thinking Insight
          </div>
          <div style={{ fontSize: 12, color: AX.textSecondary, lineHeight: 1.7 }}>
            <strong style={{ color: AX.purple }}>Ideate:</strong> The breakthrough isn't better fraud models — it's replacing the binary APPROVE/DECLINE
            paradigm with a <strong>confidence spectrum</strong>. Most "fraud" decisions today are made with a hammer (block or allow).
            The Confidence Score introduces a scalpel — 4 tiers of response calibrated to actual risk.
            <br /><br />
            <strong style={{ color: AX.purple }}>Prototype:</strong> The Scenario Simulator above proves the concept with 3 real-world cases.
            In every case, the customer experience transforms from frustration/embarrassment to seamless/transparent.
            The projected numbers — 73% FP reduction, 85% auto-resolution rate — aren't aspirational; they come from
            redistributing the current 142K monthly false positives across the 4 tiers based on signal availability.
            <br /><br />
            <strong style={{ color: AX.amber }}>→ Sprint 3 will build the Operational Dashboard for fraud analysts and the real-time monitoring system.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
