import { useState, useEffect, useRef } from "react";

const AB_TEST_DATA = {
  duration: "90 days",
  controlSize: "125,000",
  treatmentSize: "125,000",
  metrics: [
    { label: "Chargeback Rate", control: "3.8%", treatment: "2.1%", delta: "-44.7%", positive: true, pValue: 0.001 },
    { label: "Subscription Cancels via Bank", control: "1,240", treatment: "410", delta: "-66.9%", positive: true, pValue: 0.001 },
    { label: "Merchant Save Rate", control: "0%", treatment: "73.2%", delta: "+73.2%", positive: true, pValue: 0.001 },
    { label: "App Sessions / Week", control: "2.1", treatment: "6.8", delta: "+3.2×", positive: true, pValue: 0.001 },
    { label: "Subscription Spend Managed", control: "$0", treatment: "$184", delta: "+$184", positive: true, pValue: 0.003 },
    { label: "NPS Score", control: "+12", treatment: "+53", delta: "+41 pts", positive: true, pValue: 0.001 },
  ],
};

const WEEKLY_ENGAGEMENT = [
  { week: "W1", control: 2.1, treatment: 3.4 },
  { week: "W2", control: 2.0, treatment: 4.1 },
  { week: "W3", control: 2.1, treatment: 4.8 },
  { week: "W4", control: 1.9, treatment: 5.2 },
  { week: "W5", control: 2.0, treatment: 5.6 },
  { week: "W6", control: 2.1, treatment: 5.9 },
  { week: "W7", control: 1.8, treatment: 6.1 },
  { week: "W8", control: 2.0, treatment: 6.3 },
  { week: "W9", control: 2.1, treatment: 6.5 },
  { week: "W10", control: 1.9, treatment: 6.6 },
  { week: "W11", control: 2.0, treatment: 6.7 },
  { week: "W12", control: 2.1, treatment: 6.8 },
];

const SAVE_FUNNEL = [
  { stage: "Ghost Detected", count: 48200, pct: 100 },
  { stage: "Cancel Initiated", count: 31800, pct: 65.9 },
  { stage: "Offer Presented", count: 29600, pct: 61.4 },
  { stage: "Offer Accepted", count: 21680, pct: 44.9 },
  { stage: "Retained 90d+", count: 18430, pct: 38.2 },
];

const ROI_PROJECTIONS = [
  { label: "Chargebacks Avoided", year1: "$4.2M", year3: "$14.8M", icon: "🛡️" },
  { label: "Merchant Revenue Saved", year1: "$18.6M", year3: "$62.1M", icon: "💰" },
  { label: "Incremental Interchange", year1: "$2.8M", year3: "$9.4M", icon: "💳" },
  { label: "Customer LTV Uplift", year1: "$8.1M", year3: "$31.2M", icon: "📈" },
];

const ROADMAP_PHASES = [
  {
    phase: "Phase 1", title: "Pilot Launch", timeline: "Q3 2026", status: "current",
    items: ["5 partner banks", "US market only", "Top 50 merchants", "Ethoca integration live"],
  },
  {
    phase: "Phase 2", title: "Scale", timeline: "Q4 2026", status: "upcoming",
    items: ["25 banks across NA + EU", "500 merchant network", "ML model v2 with personalization", "Calendar & save flow GA"],
  },
  {
    phase: "Phase 3", title: "Global Rollout", timeline: "H1 2027", status: "planned",
    items: ["100+ banks globally", "Full merchant catalog", "Predictive churn prevention", "White-label SDK for banks"],
  },
];

function AnimatedCounter({ target, prefix = "", suffix = "", duration = 1500 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return <span>{prefix}{Math.round(value)}{suffix}</span>;
}

function MiniLineChart({ data, width = 280, height = 120 }) {
  const [animProgress, setAnimProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const dur = 1500;
    const animate = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setAnimProgress(p);
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  const pad = { top: 10, right: 10, bottom: 24, left: 30 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = 8;

  const toX = (i) => pad.left + (i / (data.length - 1)) * chartW;
  const toY = (v) => pad.top + chartH - (v / maxVal) * chartH;

  const visibleCount = Math.floor(animProgress * data.length);

  const controlPath = data.slice(0, visibleCount + 1).map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.control)}`).join(" ");
  const treatmentPath = data.slice(0, visibleCount + 1).map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.treatment)}`).join(" ");

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {[0, 2, 4, 6, 8].map(v => (
        <g key={v}>
          <line x1={pad.left} y1={toY(v)} x2={width - pad.right} y2={toY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
          <text x={pad.left - 6} y={toY(v) + 3} fill="rgba(248,250,252,0.2)" fontSize={8} textAnchor="end">{v}</text>
        </g>
      ))}
      {data.filter((_, i) => i % 3 === 0).map((d, i) => (
        <text key={i} x={toX(i * 3)} y={height - 4} fill="rgba(248,250,252,0.2)" fontSize={8} textAnchor="middle">{d.week}</text>
      ))}
      <path d={controlPath} fill="none" stroke="rgba(248,250,252,0.2)" strokeWidth={1.5} strokeDasharray="4,4" />
      <path d={treatmentPath} fill="none" stroke="#22c55e" strokeWidth={2} />
      {visibleCount >= data.length - 1 && (
        <>
          <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1].control)} r={3} fill="rgba(248,250,252,0.3)" />
          <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1].treatment)} r={3} fill="#22c55e" />
        </>
      )}
    </svg>
  );
}

function FunnelBar({ pct, delay, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ height: 24, borderRadius: 6, background: "rgba(255,255,255,0.03)", overflow: "hidden", flex: 1 }}>
      <div style={{
        height: "100%", borderRadius: 6, background: color,
        width: `${width}%`, transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

function ABTestTab({ visible }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Test config */}
      <div style={{
        margin: "0 16px 16px", padding: "14px 16px",
        background: "rgba(34,197,94,0.06)", borderRadius: 14,
        border: "1px solid rgba(34,197,94,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>🧪</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: 1.5, textTransform: "uppercase" }}>A/B Test — Statistically Significant</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { label: "Duration", value: AB_TEST_DATA.duration },
            { label: "Control", value: AB_TEST_DATA.controlSize },
            { label: "Treatment", value: AB_TEST_DATA.treatmentSize },
          ].map((d, i) => (
            <div key={i}>
              <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>{d.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{d.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics table */}
      <div style={{ padding: "0 12px", marginBottom: 20 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
          color: "rgba(248,250,252,0.3)", marginBottom: 10, padding: "0 4px",
        }}>Key Metrics</div>
        {AB_TEST_DATA.metrics.map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 10px", borderRadius: 10,
            background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(16px)",
            transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.07}s`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>{m.label}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                <span style={{ fontSize: 10, color: "rgba(248,250,252,0.3)" }}>Control: {m.control}</span>
                <span style={{ fontSize: 10, color: "#60a5fa" }}>Test: {m.treatment}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: 14, fontWeight: 800,
                color: m.positive ? "#22c55e" : "#ef4444",
              }}>{m.delta}</div>
              <div style={{ fontSize: 8, color: "rgba(248,250,252,0.25)" }}>p={m.pValue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement chart */}
      <div style={{ margin: "0 16px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 10 }}>
          Weekly App Sessions (12-Week Trend)
        </div>
        <div style={{
          padding: "12px 8px", background: "rgba(255,255,255,0.02)",
          borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <MiniLineChart data={WEEKLY_ENGAGEMENT} />
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 2, background: "rgba(248,250,252,0.25)", borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: "rgba(248,250,252,0.3)" }}>Control (2.1/wk)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 2, background: "#22c55e", borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: "rgba(248,250,252,0.3)" }}>Treatment (6.8/wk)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save funnel */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 10 }}>
          Merchant Save Funnel
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {SAVE_FUNNEL.map((s, i) => {
            const colors = ["#3b82f6", "#60a5fa", "#a78bfa", "#22c55e", "#16a34a"];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, color: "rgba(248,250,252,0.4)", width: 80, textAlign: "right", flexShrink: 0 }}>{s.stage}</span>
                <FunnelBar pct={s.pct} delay={i * 150} color={colors[i]} />
                <span style={{ fontSize: 10, fontWeight: 600, color: colors[i], width: 40, flexShrink: 0 }}>
                  {(s.count / 1000).toFixed(1)}K
                </span>
              </div>
            );
          })}
        </div>
        <div style={{
          marginTop: 10, padding: "10px 12px", borderRadius: 10,
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 11, color: "rgba(248,250,252,0.4)" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#22c55e" }}>73.2%</span> of users who saw an offer accepted it —{" "}
            <span style={{ fontWeight: 600, color: "#f8fafc" }}>38.2%</span> still retained after 90 days
          </span>
        </div>
      </div>
    </div>
  );
}

function ROITab({ visible }) {
  const totalYear1 = 33.7;
  const totalYear3 = 117.5;
  const implementationCost = 4.2;

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* ROI headline */}
      <div style={{
        margin: "0 16px 16px", padding: "20px 16px", textAlign: "center",
        background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))",
        borderRadius: 16, border: "1px solid rgba(34,197,94,0.12)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 8 }}>
          Projected Return on Investment
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: "#22c55e", fontFamily: "'DM Sans', sans-serif" }}>
            <AnimatedCounter target={8} suffix="×" duration={2000} />
          </span>
          <span style={{ fontSize: 13, color: "rgba(248,250,252,0.4)" }}>ROI in Year 1</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>${totalYear1}M</div>
            <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)" }}>Year 1 Value</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#60a5fa" }}>${totalYear3}M</div>
            <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)" }}>3-Year Value</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>${implementationCost}M</div>
            <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)" }}>Build Cost</div>
          </div>
        </div>
      </div>

      {/* Value breakdown */}
      <div style={{ padding: "0 12px", marginBottom: 20 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
          color: "rgba(248,250,252,0.3)", marginBottom: 10, padding: "0 4px",
        }}>Value Breakdown</div>
        {ROI_PROJECTIONS.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 10px", borderRadius: 12,
            background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.1}s`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.03)", fontSize: 20, flexShrink: 0,
            }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>{item.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#22c55e" }}>{item.year1}</div>
              <div style={{ fontSize: 9, color: "rgba(248,250,252,0.25)" }}>Yr 1</div>
            </div>
            <div style={{ textAlign: "right", marginLeft: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#60a5fa" }}>{item.year3}</div>
              <div style={{ fontSize: 9, color: "rgba(248,250,252,0.25)" }}>3-Yr</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stakeholder impact */}
      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 10 }}>
          Stakeholder Impact
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { who: "Cardholders", impact: "Save avg $62/mo, 3.2× more engaged, NPS +41", icon: "👤", color: "#22c55e" },
            { who: "Issuing Banks", impact: "44% fewer chargebacks, 67% retention lift, premium feature differentiator", icon: "🏦", color: "#3b82f6" },
            { who: "Merchants", impact: "73% save rate on cancel attempts, $18.6M revenue preserved Y1", icon: "🏪", color: "#f59e0b" },
            { who: "Mastercard", impact: "$2.8M incremental interchange Y1, network stickiness, Ethoca upsell", icon: "💳", color: "#c084fc" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "12px 14px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${s.color}10`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.who}</span>
              </div>
              <div style={{ fontSize: 11, color: "rgba(248,250,252,0.45)", lineHeight: 1.5, paddingLeft: 22 }}>{s.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Unit economics */}
      <div style={{
        margin: "0 16px", padding: "14px 16px",
        background: "rgba(255,255,255,0.02)", borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 10 }}>
          Unit Economics (Per Bank Partner)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Avg Managed Subs", value: "8.4", sub: "per active user" },
            { label: "Revenue per User", value: "$3.20", sub: "monthly ARPU" },
            { label: "Activation Rate", value: "34%", sub: "of eligible base" },
            { label: "Payback Period", value: "4.2 mo", sub: "per bank partner" },
          ].map((u, i) => (
            <div key={i} style={{
              padding: "10px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.03)",
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>{u.value}</div>
              <div style={{ fontSize: 9, color: "rgba(248,250,252,0.4)", marginTop: 2 }}>{u.label}</div>
              <div style={{ fontSize: 8, color: "rgba(248,250,252,0.2)" }}>{u.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoadmapTab({ visible }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Go-to-market summary */}
      <div style={{
        margin: "0 16px 20px", padding: "16px",
        background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(59,130,246,0.06))",
        borderRadius: 14, border: "1px solid rgba(168,85,247,0.1)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#c084fc", marginBottom: 8 }}>
          Go-to-Market Strategy
        </div>
        <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", lineHeight: 1.6 }}>
          Land with 5 pilot banks via Mastercard's existing Ethoca relationships. Expand through network effects — each merchant integration benefits all banks. SDK-first distribution for scale.
        </div>
      </div>

      {/* Roadmap phases */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        {ROADMAP_PHASES.map((phase, i) => {
          const statusColors = { current: "#22c55e", upcoming: "#3b82f6", planned: "rgba(248,250,252,0.3)" };
          const statusLabels = { current: "In Progress", upcoming: "Next", planned: "Planned" };
          return (
            <div key={i} style={{
              display: "flex", gap: 14, marginBottom: 20,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.15}s`,
            }}>
              {/* Timeline */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  background: statusColors[phase.status],
                  border: phase.status === "current" ? "3px solid rgba(34,197,94,0.2)" : "none",
                  boxSizing: "content-box",
                }} />
                {i < ROADMAP_PHASES.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />
                )}
              </div>
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: statusColors[phase.status], letterSpacing: 1, textTransform: "uppercase" }}>
                    {phase.phase}
                  </span>
                  <span style={{
                    fontSize: 9, padding: "2px 8px", borderRadius: 6,
                    background: `${statusColors[phase.status]}15`,
                    color: statusColors[phase.status], fontWeight: 600,
                  }}>{statusLabels[phase.status]}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>{phase.title}</div>
                <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)", marginBottom: 10 }}>{phase.timeline}</div>
                <div style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  {phase.items.map((item, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "5px 0",
                      borderBottom: j < phase.items.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                    }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: statusColors[phase.status], flexShrink: 0, opacity: 0.6,
                      }} />
                      <span style={{ fontSize: 11, color: "rgba(248,250,252,0.45)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success metrics */}
      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 10 }}>
          Success Criteria — Phase 1
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { metric: "Bank Partner Activation", target: "5 banks live", status: "on-track", progress: 60 },
            { metric: "User Opt-in Rate", target: ">25% of eligible", status: "on-track", progress: 34 },
            { metric: "Save Rate", target: ">50% offer acceptance", status: "exceeding", progress: 73 },
            { metric: "Chargeback Reduction", target: ">30% in pilot cohort", status: "exceeding", progress: 45 },
            { metric: "NPS Impact", target: ">+20 point lift", status: "exceeding", progress: 100 },
          ].map((s, i) => {
            const statusColor = s.status === "exceeding" ? "#22c55e" : "#3b82f6";
            return (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.03)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#f8fafc" }}>{s.metric}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: statusColor,
                    background: `${statusColor}12`, padding: "2px 8px", borderRadius: 4,
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>{s.status}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2, background: statusColor,
                      width: `${Math.min(s.progress, 100)}%`, transition: "width 1s ease-out",
                    }} />
                  </div>
                  <span style={{ fontSize: 9, color: "rgba(248,250,252,0.35)", flexShrink: 0 }}>{s.target}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key risks */}
      <div style={{
        margin: "0 16px", padding: "14px 16px",
        background: "rgba(245,158,11,0.04)", borderRadius: 14,
        border: "1px solid rgba(245,158,11,0.1)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#f59e0b", marginBottom: 10 }}>
          Key Risks & Mitigations
        </div>
        {[
          { risk: "Merchant adoption — low initial offer quality", mitigation: "Pre-negotiate templates with top 50 merchants; default to pause/downgrade" },
          { risk: "Bank integration complexity", mitigation: "SDK-first approach, pre-built adapters for top core banking platforms" },
          { risk: "Regulatory — consent & data sharing", mitigation: "PSD2/Open Banking compliant; user-initiated flow only; no data leaves bank" },
        ].map((r, i) => (
          <div key={i} style={{
            padding: "8px 0",
            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.03)" : "none",
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#f8fafc", marginBottom: 3 }}>{r.risk}</div>
            <div style={{ fontSize: 10, color: "rgba(248,250,252,0.4)", lineHeight: 1.5 }}>→ {r.mitigation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function Sprint3BusinessValidation() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("abtest");

  useEffect(() => { setVisible(true); }, []);

  const tabs = [
    { key: "abtest", label: "A/B Results", icon: "🧪" },
    { key: "roi", label: "ROI & Impact", icon: "💰" },
    { key: "roadmap", label: "Roadmap", icon: "🗺️" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#06080f",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Background */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none",
        background: "radial-gradient(ellipse at 25% 30%, rgba(34,197,94,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 70%, rgba(245,158,11,0.04) 0%, transparent 60%)",
      }} />

      {/* Header */}
      <div style={{
        padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", borderRadius: 8,
            padding: "6px 14px", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#EB001B" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#F79E1B", marginLeft: -5 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(248,250,252,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>Mastercard</span>
          </div>
          <div style={{
            background: "rgba(34,197,94,0.1)", color: "#4ade80",
            padding: "6px 14px", borderRadius: 8, fontSize: 11,
            fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
            border: "1px solid rgba(34,197,94,0.15)",
          }}>
            Sprint 3 — Test + Validate
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", lineHeight: 1.2 }}>
          Business Validation
        </h1>
        <p style={{ fontSize: 16, color: "rgba(248,250,252,0.4)", margin: "0 0 32px", maxWidth: 640, lineHeight: 1.6 }}>
          From prototype to proof — A/B test results, ROI projections, and go-to-market roadmap that prove Smart Subscriptions is a $33M+ Year 1 opportunity.
        </p>
      </div>

      {/* Mobile frame */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px",
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: 390, borderRadius: 32, overflow: "hidden",
          background: "#0c0f1a",
          boxShadow: "0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s",
        }}>
          {/* Status bar */}
          <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>9:41</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 16, height: 10, border: "1.5px solid #f8fafc", borderRadius: 2, position: "relative" }}>
                <div style={{ position: "absolute", right: 1.5, top: 1.5, bottom: 1.5, left: 1.5, background: "#22c55e", borderRadius: 0.5 }} />
              </div>
            </div>
          </div>

          {/* App header */}
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ display: "flex" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#EB001B", opacity: 0.9 }} />
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#F79E1B", opacity: 0.9, marginLeft: -6 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(248,250,252,0.35)", letterSpacing: 2, textTransform: "uppercase" }}>
                Smart Subscriptions
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", margin: "0 0 14px" }}>
              {activeTab === "abtest" ? "A/B Test Results" : activeTab === "roi" ? "ROI & Business Impact" : "Go-to-Market Roadmap"}
            </h3>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 2, padding: "0 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10,
                  border: "none", cursor: "pointer",
                  background: activeTab === tab.key ? "rgba(255,255,255,0.08)" : "transparent",
                  transition: "all 0.2s", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: activeTab === tab.key ? "#f8fafc" : "rgba(248,250,252,0.3)",
                  letterSpacing: 0.3,
                }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {activeTab === "abtest" && <ABTestTab visible={visible} />}
            {activeTab === "roi" && <ROITab visible={visible} />}
            {activeTab === "roadmap" && <RoadmapTab visible={visible} />}
          </div>

          <div style={{ height: 20, background: "#0c0f1a" }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        <div style={{
          padding: "24px 32px", borderRadius: 16,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24,
          opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Sprint 3 — Design Thinking: Test + Validate</div>
            <div style={{ fontSize: 14, color: "rgba(248,250,252,0.6)", lineHeight: 1.6, maxWidth: 520 }}>
              Validated the full product thesis through a <span style={{ color: "#22c55e", fontWeight: 600 }}>250K-user A/B test</span>,
              proving <span style={{ color: "#60a5fa", fontWeight: 600 }}>8× ROI in Year 1</span> with
              a clear <span style={{ color: "#f59e0b", fontWeight: 600 }}>3-phase go-to-market</span> roadmap
              leveraging Mastercard's existing Ethoca network.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Year 1 Value", value: "$34M", color: "#22c55e" },
              { label: "ROI", value: "8×", color: "#3b82f6" },
              { label: "Banks Pilot", value: "5", color: "#f59e0b" },
            ].map((m, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "8px 16px",
                background: "rgba(255,255,255,0.02)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)", letterSpacing: 0.5, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
