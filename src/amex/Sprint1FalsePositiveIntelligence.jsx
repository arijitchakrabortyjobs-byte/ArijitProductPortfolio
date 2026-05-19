import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";

// ═══════════════════════════════════════════════════════════════════════
// AMEX SPRINT 1 — EMPATHIZE + DEFINE
// False Positive Fraud Detection Intelligence
// ═══════════════════════════════════════════════════════════════════════

const AX = {
  bg: "#0A0F1E", card: "#111827", cardHover: "#1A2236", border: "#1E293B",
  blue: "#2563EB", blueGlow: "rgba(37,99,235,0.15)",
  cyan: "#06B6D4", cyanGlow: "rgba(6,182,212,0.12)",
  amber: "#F59E0B", amberGlow: "rgba(245,158,11,0.12)",
  red: "#EF4444", redGlow: "rgba(239,68,68,0.12)",
  green: "#10B981", greenGlow: "rgba(16,185,129,0.12)",
  purple: "#8B5CF6",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#475569",
};

// ── Mock Data ──
const falsePositivesByCategory = [
  { category: "International Travel", fp_rate: 18.2, volume: 42000, revenue_blocked: 8.4 },
  { category: "Online Recurring", fp_rate: 12.7, volume: 38000, revenue_blocked: 5.1 },
  { category: "High-Value Purchase", fp_rate: 14.5, volume: 15000, revenue_blocked: 12.3 },
  { category: "New Merchant", fp_rate: 11.3, volume: 28000, revenue_blocked: 3.8 },
  { category: "Cross-Border E-com", fp_rate: 16.8, volume: 31000, revenue_blocked: 7.2 },
  { category: "Contactless / Tap", fp_rate: 4.2, volume: 120000, revenue_blocked: 1.1 },
];

const weeklyTrend = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  false_positives: Math.round(4200 + Math.random() * 1800 + i * 120),
  true_fraud: Math.round(980 + Math.random() * 300),
  precision: +(88 + Math.random() * 4 - i * 0.15).toFixed(1),
}));

const customerImpact = [
  { metric: "Cards Temporarily Blocked (Monthly)", value: "142,000", severity: "critical", delta: "+12% YoY" },
  { metric: "Avg Resolution Time", value: "47 min", severity: "high", delta: "+8 min vs target" },
  { metric: "Customer Complaints (FP-related)", value: "38,400/mo", severity: "critical", delta: "+22% YoY" },
  { metric: "Revenue Blocked by FP (Monthly)", value: "$38.2M", severity: "critical", delta: "0.8% of TPV" },
  { metric: "Customers Who Reduced Spend Post-FP", value: "23%", severity: "high", delta: "within 30 days" },
  { metric: "NPS Drop After False Decline", value: "-18 pts", severity: "high", delta: "vs pre-decline NPS" },
];

const channelBreakdown = [
  { name: "Card Present (POS)", value: 22, color: AX.blue },
  { name: "Card Not Present (Online)", value: 41, color: AX.cyan },
  { name: "International", value: 24, color: AX.amber },
  { name: "Recurring / Subscription", value: 13, color: AX.purple },
];

const resolutionFlow = [
  { stage: "Transaction Flagged", count: 142000, pct: 100 },
  { stage: "Auto-Resolved (ML)", count: 48000, pct: 33.8 },
  { stage: "SMS/Push Verification Sent", count: 94000, pct: 66.2 },
  { stage: "Customer Confirmed Legit", count: 71000, pct: 50.0 },
  { stage: "Called Support (Frustrated)", count: 23000, pct: 16.2 },
  { stage: "Card Remained Blocked >1hr", count: 18000, pct: 12.7 },
  { stage: "Reduced Spend in 30 Days", count: 32660, pct: 23.0 },
];

const asIsItems = [
  { icon: "🔴", text: "Rule-based + ML hybrid flags transactions in <2ms but generates 142K false positives/month" },
  { icon: "🔴", text: "Siloed signals — device, behavioral, merchant, and location patterns aren't unified in one view" },
  { icon: "🔴", text: "Binary outcome: APPROVE or DECLINE. No confidence score exposed to the cardholder" },
  { icon: "🔴", text: "SMS verification is fire-and-forget — 66% of flagged transactions require customer action" },
  { icon: "🔴", text: "No travel-awareness: international transactions flagged at 18.2% FP rate despite travel itinerary data in Amex Travel" },
  { icon: "🔴", text: "Post-decline NPS drops 18 points. 23% of falsely declined customers reduce spend within 30 days" },
];

const toBeItems = [
  { icon: "🟢", text: "Unified Risk Canvas: device + behavioral + merchant + location + travel signals in one real-time view" },
  { icon: "🟢", text: "Confidence spectrum (0-100) replacing binary APPROVE/DECLINE — enabling tiered verification" },
  { icon: "🟢", text: "Travel-aware model: auto-ingests Amex Travel bookings to suppress FP for known destinations" },
  { icon: "🟢", text: "Smart verification: low-risk flags auto-resolve; medium-risk get push with context; high-risk get human review" },
  { icon: "🟢", text: "Real-time cardholder transparency: 'We're checking a $2,400 charge at Harrods London — you're in London, confirming automatically'" },
  { icon: "🟢", text: "Recovery engine: instant unblock + apology credit for confirmed false positives within 60 seconds" },
];

const KPI = ({ label, value, severity, delta }) => {
  const colors = { critical: AX.red, high: AX.amber, medium: AX.cyan, low: AX.green };
  return (
    <div style={{
      background: AX.card, border: `1px solid ${AX.border}`, borderRadius: 12,
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6,
      borderLeft: `3px solid ${colors[severity]}`,
    }}>
      <div style={{ fontSize: 11, color: AX.textMuted, fontWeight: 500, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: AX.textPrimary, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11, color: colors[severity], fontWeight: 600 }}>{delta}</div>
    </div>
  );
};

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
          <span style={{ fontWeight: 600 }}>{typeof p.value === 'number' && p.value > 999 ? p.value.toLocaleString() : p.value}{p.name === 'precision' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default function Sprint1FalsePositiveIntelligence() {
  const [view, setView] = useState("asis");

  return (
    <div style={{
      background: AX.bg, borderRadius: 16, overflow: "hidden",
      border: `1px solid ${AX.border}`, fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "24px 28px 20px",
        background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(6,182,212,0.05))",
        borderBottom: `1px solid ${AX.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #2563EB, #06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
          }}>AX</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: AX.textPrimary, letterSpacing: -0.5 }}>
              Sprint 1 — Empathize + Define
            </div>
            <div style={{ fontSize: 11, color: AX.textMuted }}>
              False Positive Fraud Detection Intelligence · Design Thinking Phase 1
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 12, padding: "10px 14px", borderRadius: 8,
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
          fontSize: 12, color: "#FCA5A5", lineHeight: 1.5,
        }}>
          <strong style={{ color: AX.red }}>The Problem:</strong> American Express's fraud detection system generates 142,000 false positives per month,
          blocking $38.2M in legitimate transactions. 23% of falsely declined customers reduce their spending within 30 days.
          In 2025, Amex was fined $138M for insufficient fraud prevention measures — yet the bigger hidden cost is customer trust erosion from over-aggressive blocking.
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <SectionTitle icon="📊" title="Impact Dashboard" subtitle="Monthly false positive impact across Amex's global card network" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {customerImpact.map((kpi, i) => <KPI key={i} {...kpi} label={kpi.metric} />)}
        </div>
      </div>

      {/* AS-IS vs TO-BE Toggle */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { key: "asis", label: "AS-IS (Current State)", color: AX.red },
            { key: "tobe", label: "TO-BE (Proposed)", color: AX.green },
          ].map(v => (
            <button key={v.key} onClick={() => setView(v.key)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              background: view === v.key ? v.color : "rgba(255,255,255,0.05)",
              color: view === v.key ? "#fff" : AX.textSecondary,
              transition: "all 0.2s",
            }}>{v.label}</button>
          ))}
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr", gap: 8,
        }}>
          {(view === "asis" ? asIsItems : toBeItems).map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "12px 16px", borderRadius: 10,
              background: view === "asis" ? "rgba(239,68,68,0.05)" : "rgba(16,185,129,0.05)",
              border: `1px solid ${view === "asis" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"}`,
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 12.5, color: AX.textSecondary, lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* FP by Category */}
          <div style={{ background: AX.card, borderRadius: 12, padding: 18, border: `1px solid ${AX.border}` }}>
            <SectionTitle icon="🎯" title="False Positive Rate by Transaction Category" subtitle="% of legitimate transactions incorrectly flagged" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={falsePositivesByCategory} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={AX.border} />
                <XAxis type="number" tick={{ fill: AX.textMuted, fontSize: 10 }} unit="%" />
                <YAxis dataKey="category" type="category" tick={{ fill: AX.textSecondary, fontSize: 10 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="fp_rate" name="FP Rate %" radius={[0, 4, 4, 0]}>
                  {falsePositivesByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.fp_rate > 15 ? AX.red : entry.fp_rate > 10 ? AX.amber : AX.green} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Breakdown Pie */}
          <div style={{ background: AX.card, borderRadius: 12, padding: 18, border: `1px solid ${AX.border}` }}>
            <SectionTitle icon="📱" title="FP Distribution by Channel" subtitle="Where false positives occur most" />
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={channelBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {channelBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {channelBreakdown.map((ch, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: ch.color }} />
                    <span style={{ fontSize: 11, color: AX.textSecondary }}>{ch.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: AX.textPrimary, marginLeft: "auto" }}>{ch.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <div style={{ background: AX.card, borderRadius: 12, padding: 18, border: `1px solid ${AX.border}` }}>
          <SectionTitle icon="📈" title="12-Week Trend: False Positives vs True Fraud Caught" subtitle="Growing FP volume while true fraud detection remains flat — precision is degrading" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={AX.border} />
              <XAxis dataKey="week" tick={{ fill: AX.textMuted, fontSize: 10 }} />
              <YAxis tick={{ fill: AX.textMuted, fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="false_positives" name="False Positives" stroke={AX.red} fill="rgba(239,68,68,0.1)" strokeWidth={2} />
              <Area type="monotone" dataKey="true_fraud" name="True Fraud Caught" stroke={AX.green} fill="rgba(16,185,129,0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolution Funnel */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${AX.border}` }}>
        <div style={{ background: AX.card, borderRadius: 12, padding: 18, border: `1px solid ${AX.border}` }}>
          <SectionTitle icon="🔄" title="False Positive Resolution Funnel" subtitle="Customer journey after a legitimate transaction is flagged" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {resolutionFlow.map((stage, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 180, fontSize: 11, color: AX.textSecondary, textAlign: "right", flexShrink: 0 }}>
                  {stage.stage}
                </div>
                <div style={{
                  flex: 1, height: 28, background: "rgba(255,255,255,0.03)",
                  borderRadius: 6, overflow: "hidden", position: "relative",
                }}>
                  <div style={{
                    width: `${stage.pct}%`, height: "100%", borderRadius: 6,
                    background: i < 2 ? AX.blue : i < 4 ? AX.cyan : i < 6 ? AX.amber : AX.red,
                    transition: "width 0.6s ease",
                    display: "flex", alignItems: "center", paddingLeft: 8,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>
                      {stage.count.toLocaleString()} ({stage.pct}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Design Thinking Insight */}
      <div style={{ padding: "20px 28px 24px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.08))",
          border: `1px solid rgba(37,99,235,0.15)`, borderRadius: 12, padding: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: AX.textPrimary, marginBottom: 8 }}>
            🧠 Sprint 1 Design Thinking Insight
          </div>
          <div style={{ fontSize: 12, color: AX.textSecondary, lineHeight: 1.7 }}>
            <strong style={{ color: AX.cyan }}>Empathize:</strong> Cardholders don't experience "fraud systems" — they experience moments of humiliation
            at a checkout counter or a failed online purchase. The emotional cost of a false positive far exceeds the financial cost of the blocked transaction.
            <br /><br />
            <strong style={{ color: AX.cyan }}>Define:</strong> The core problem isn't model accuracy — Amex's models run at 88-92% precision.
            The problem is that the <em>resolution experience</em> after a false positive is broken. 66% of flagged transactions require manual customer action.
            Auto-resolution covers only 34%. The opportunity is a <strong>Confidence-Aware Verification System</strong> that uses context (travel data, merchant history,
            device trust) to auto-resolve 70%+ of false positives without customer friction, while providing real-time transparency for the remaining 30%.
            <br /><br />
            <strong style={{ color: AX.amber }}>→ Sprint 2 will prototype the Confidence Score Engine and tiered verification UX.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
