import { useState, useEffect, useRef } from "react";

const AX = {
  bg: "#0A0F1E", card: "#111827", border: "#1E293B",
  blue: "#2563EB", cyan: "#06B6D4", amber: "#F59E0B",
  red: "#EF4444", green: "#10B981", purple: "#8B5CF6",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#475569",
};

const AB_TEST = {
  duration: "120 days", control: "2.4M cards", treatment: "2.4M cards",
  metrics: [
    { label: "False Positive Rate", control: "14.2%", treatment: "3.8%", delta: "-73.2%", color: AX.green },
    { label: "True Fraud Detection", control: "97.1%", treatment: "99.2%", delta: "+2.1pp", color: AX.green },
    { label: "Revenue Blocked (Legit)", control: "$38.2M/mo", treatment: "$5.4M/mo", delta: "-85.9%", color: AX.green },
    { label: "Avg Resolution Time", control: "47 min", treatment: "4 sec", delta: "-99.9%", color: AX.cyan },
    { label: "Customer Complaints", control: "38,400/mo", treatment: "4,200/mo", delta: "-89.1%", color: AX.green },
    { label: "Post-Flag Spend Reduction", control: "23%", treatment: "3.1%", delta: "-86.5%", color: AX.green },
    { label: "NPS (Post-Verification)", control: "-18 pts", treatment: "+8 pts", delta: "+26 pts", color: AX.blue },
    { label: "Card Abandonment (90d)", control: "8.4%", treatment: "1.2%", delta: "-85.7%", color: AX.green },
  ],
};

const ROI = [
  { label: "Revenue Unblocked", year1: "$394M", year3: "$1.26B", icon: "💳" },
  { label: "Chargeback Reduction", year1: "$127M", year3: "$412M", icon: "🛡️" },
  { label: "Customer Retention", year1: "$218M", year3: "$741M", icon: "👤" },
  { label: "Operational Savings", year1: "$34M", year3: "$98M", icon: "⚙️" },
];

const ROADMAP = [
  { phase: "Phase 1", title: "US Pilot", timeline: "Q3 2026", status: "current", items: ["Platinum & Gold cards", "Top 1000 merchants", "iOS app integration", "7 signal model v1"] },
  { phase: "Phase 2", title: "US Rollout", timeline: "Q4 2026", status: "upcoming", items: ["All US consumer cards", "Full merchant network", "Android + Web", "ML model v2 with 12 signals"] },
  { phase: "Phase 3", title: "Global + B2B", timeline: "H1 2027", status: "planned", items: ["International markets", "Corporate card program", "Merchant-side integration", "Real-time model retraining"] },
];

function Counter({ target, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = Date.now();
    const animate = () => {
      const p = Math.min((Date.now() - start) / 1500, 1);
      setVal((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);
  return <span>{prefix}{Math.round(val)}{suffix}</span>;
}

function ABTab({ visible }) {
  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ margin: "0 16px 14px", padding: "14px", borderRadius: 14, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>🧪</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: AX.green, letterSpacing: 1.5, textTransform: "uppercase" }}>A/B Test — All Metrics Significant (p{"<"}0.001)</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ l: "Duration", v: AB_TEST.duration }, { l: "Control", v: AB_TEST.control }, { l: "Treatment", v: AB_TEST.treatment }].map((d, i) => (
            <div key={i}><div style={{ fontSize: 9, color: AX.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>{d.l}</div><div style={{ fontSize: 13, fontWeight: 700, color: AX.textPrimary }}>{d.v}</div></div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 12px" }}>
        {AB_TEST.metrics.map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 10px", borderRadius: 10,
            background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
            opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(12px)",
            transition: `all 0.4s ease ${0.15 + i * 0.05}s`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: AX.textPrimary }}>{m.label}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: AX.textMuted }}>Control: {m.control}</span>
                <span style={{ fontSize: 10, color: AX.cyan }}>Test: {m.treatment}</span>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ROITab({ visible }) {
  const totalY1 = 773;
  const totalY3 = 2511;
  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ margin: "0 16px 16px", padding: "20px 16px", textAlign: "center", background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.06))", borderRadius: 16, border: "1px solid rgba(16,185,129,0.12)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: AX.textMuted, marginBottom: 8 }}>Return on Investment</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: AX.green }}><Counter target={28} suffix="×" /></span>
          <span style={{ fontSize: 13, color: AX.textMuted }}>ROI in Year 1</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
          <div><div style={{ fontSize: 18, fontWeight: 700, color: AX.textPrimary }}>${totalY1}M</div><div style={{ fontSize: 9, color: AX.textMuted }}>Year 1</div></div>
          <div style={{ width: 1, background: AX.border }} />
          <div><div style={{ fontSize: 18, fontWeight: 700, color: AX.cyan }}>${(totalY3 / 1000).toFixed(1)}B</div><div style={{ fontSize: 9, color: AX.textMuted }}>3-Year</div></div>
          <div style={{ width: 1, background: AX.border }} />
          <div><div style={{ fontSize: 18, fontWeight: 700, color: AX.amber }}>$28M</div><div style={{ fontSize: 9, color: AX.textMuted }}>Build Cost</div></div>
        </div>
      </div>

      <div style={{ padding: "0 12px", marginBottom: 16 }}>
        {ROI.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 12,
            background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
            opacity: visible ? 1 : 0, transition: `opacity 0.5s ${0.2 + i * 0.1}s`,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{r.icon}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: AX.textPrimary }}>{r.label}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 800, color: AX.green }}>{r.year1}</div><div style={{ fontSize: 9, color: AX.textMuted }}>Yr 1</div></div>
            <div style={{ textAlign: "right", marginLeft: 8 }}><div style={{ fontSize: 15, fontWeight: 800, color: AX.cyan }}>{r.year3}</div><div style={{ fontSize: 9, color: AX.textMuted }}>3-Yr</div></div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: AX.textMuted, marginBottom: 10 }}>Stakeholder Impact</div>
        {[
          { who: "Cardholders", impact: "86% fewer false declines, 4-sec resolution, NPS +26 swing", icon: "👤", color: AX.green },
          { who: "Amex (Issuer)", impact: "$773M Y1 value, 85% less card abandonment, competitive moat", icon: "💳", color: AX.blue },
          { who: "Merchants", impact: "$394M unblocked revenue, fewer cart abandonments, faster auth", icon: "🏪", color: AX.amber },
          { who: "Fraud Ops", impact: "89% fewer manual reviews, auto-triage, focus on true threats", icon: "🛡️", color: AX.purple },
        ].map((s, i) => (
          <div key={i} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}10`, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.who}</span>
            </div>
            <div style={{ fontSize: 11, color: AX.textSecondary, lineHeight: 1.5, paddingLeft: 22 }}>{s.impact}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapTab({ visible }) {
  const statusColors = { current: AX.green, upcoming: AX.blue, planned: AX.textMuted };
  const statusLabels = { current: "In Progress", upcoming: "Next", planned: "Planned" };
  return (
    <div style={{ padding: "0 0 20px" }}>
      <div style={{ margin: "0 16px 16px", padding: "14px", borderRadius: 14, background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.1)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: AX.blue, marginBottom: 6 }}>Go-to-Market</div>
        <div style={{ fontSize: 12, color: AX.textSecondary, lineHeight: 1.6 }}>Start with US Platinum & Gold cards (highest false positive impact), expand to full US consumer portfolio, then global + corporate cards. SDK-first for merchant integration.</div>
      </div>

      <div style={{ padding: "0 16px", marginBottom: 16 }}>
        {ROADMAP.map((phase, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: `all 0.5s ease ${0.2 + i * 0.15}s` }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: statusColors[phase.status], border: phase.status === "current" ? "3px solid rgba(16,185,129,0.2)" : "none", boxSizing: "content-box" }} />
              {i < ROADMAP.length - 1 && <div style={{ width: 2, flex: 1, background: AX.border, marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: statusColors[phase.status], letterSpacing: 1, textTransform: "uppercase" }}>{phase.phase}</span>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: `${statusColors[phase.status]}15`, color: statusColors[phase.status], fontWeight: 600 }}>{statusLabels[phase.status]}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: AX.textPrimary, marginBottom: 2 }}>{phase.title}</div>
              <div style={{ fontSize: 10, color: AX.textMuted, marginBottom: 8 }}>{phase.timeline}</div>
              <div style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}` }}>
                {phase.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: j < phase.items.length - 1 ? `1px solid ${AX.border}` : "none" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: statusColors[phase.status], opacity: 0.6 }} />
                    <span style={{ fontSize: 11, color: AX.textSecondary }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ margin: "0 16px", padding: "14px", borderRadius: 14, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: AX.amber, marginBottom: 8 }}>Key Risks & Mitigations</div>
        {[
          { risk: "Model bias — certain demographics flagged disproportionately", mitigation: "Fairness audits every 30 days, demographic parity constraints in scoring" },
          { risk: "Adversarial adaptation — fraudsters learn tier thresholds", mitigation: "Dynamic threshold adjustment, ensemble models, real-time retraining" },
          { risk: "Regulatory — explainability of ML decisions", mitigation: "Full signal breakdown on every decision, ECOA/FCRA compliant explanations" },
        ].map((r, i) => (
          <div key={i} style={{ padding: "6px 0", borderBottom: i < 2 ? `1px solid ${AX.border}` : "none" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: AX.textPrimary, marginBottom: 2 }}>{r.risk}</div>
            <div style={{ fontSize: 10, color: AX.textMuted, lineHeight: 1.5 }}>→ {r.mitigation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sprint5BusinessValidation() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("abtest");
  useEffect(() => { setVisible(true); }, []);

  const tabs = [
    { key: "abtest", label: "A/B Results", icon: "🧪" },
    { key: "roi", label: "ROI & Impact", icon: "💰" },
    { key: "roadmap", label: "Roadmap", icon: "🗺️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: AX.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none", background: "radial-gradient(ellipse at 25% 30%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 70%, rgba(245,158,11,0.04) 0%, transparent 60%)" }} />

      <div style={{ padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)", transition: "all 0.8s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.08)", borderRadius: 8, padding: "6px 14px", border: "1px solid rgba(37,99,235,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#2563EB"/><text x="50" y="64" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="serif">AX</text></svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: AX.blue, letterSpacing: 1.5, textTransform: "uppercase" }}>American Express</span>
          </div>
          <div style={{ background: "rgba(16,185,129,0.1)", color: AX.green, padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", border: "1px solid rgba(16,185,129,0.15)" }}>
            Sprint 5 — Test + Validate
          </div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: AX.textPrimary, margin: "0 0 8px" }}>Business Validation</h1>
        <p style={{ fontSize: 16, color: AX.textSecondary, margin: "0 0 32px", maxWidth: 640 }}>From prototype to proof — 4.8M-card A/B test, 28× ROI, and a $773M Year 1 opportunity validated across 8 key metrics.</p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 400, borderRadius: 28, overflow: "hidden", background: AX.card, boxShadow: "0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.2s" }}>
          <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: AX.textPrimary }}>9:41</span>
            <div style={{ width: 16, height: 10, border: `1.5px solid ${AX.textPrimary}`, borderRadius: 2, position: "relative" }}>
              <div style={{ position: "absolute", right: 1.5, top: 1.5, bottom: 1.5, left: 1.5, background: AX.green, borderRadius: 0.5 }} />
            </div>
          </div>
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <svg width="16" height="16" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#2563EB"/><text x="50" y="64" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="serif">AX</text></svg>
              <span style={{ fontSize: 10, fontWeight: 600, color: AX.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Fraud Intelligence</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: AX.textPrimary, margin: "0 0 14px" }}>
              {activeTab === "abtest" ? "A/B Test Results" : activeTab === "roi" ? "ROI & Business Impact" : "Go-to-Market Roadmap"}
            </h3>
          </div>

          <div style={{ display: "flex", gap: 2, padding: "0 16px 12px", borderBottom: `1px solid ${AX.border}` }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                background: activeTab === t.key ? "rgba(37,99,235,0.12)" : "transparent",
                transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: activeTab === t.key ? AX.blue : AX.textMuted }}>{t.label}</span>
              </button>
            ))}
          </div>

          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {activeTab === "abtest" && <ABTab visible={visible} />}
            {activeTab === "roi" && <ROITab visible={visible} />}
            {activeTab === "roadmap" && <RoadmapTab visible={visible} />}
          </div>
          <div style={{ height: 20, background: AX.card }} />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        <div style={{ padding: "24px 32px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s" }}>
          <div>
            <div style={{ fontSize: 10, color: AX.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Sprint 5 — Test + Validate</div>
            <div style={{ fontSize: 14, color: AX.textSecondary, lineHeight: 1.6, maxWidth: 520 }}>
              Validated across <span style={{ color: AX.green, fontWeight: 600 }}>4.8M cards</span> over 120 days.
              <span style={{ color: AX.cyan, fontWeight: 600 }}> $773M Year 1 value</span> with
              <span style={{ color: AX.blue, fontWeight: 600 }}> 28× ROI</span> — making it Amex's highest-impact AI initiative.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Year 1", value: "$773M", color: AX.green },
              { label: "ROI", value: "28×", color: AX.blue },
              { label: "FP ↓", value: "73%", color: AX.cyan },
            ].map((m, i) => (
              <div key={i} style={{ textAlign: "center", padding: "8px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${AX.border}` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 9, color: AX.textMuted, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
