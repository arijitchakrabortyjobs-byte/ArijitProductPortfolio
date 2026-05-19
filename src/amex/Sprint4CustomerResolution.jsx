import { useState, useEffect } from "react";

const AX = {
  bg: "#0A0F1E", card: "#111827", border: "#1E293B",
  blue: "#2563EB", cyan: "#06B6D4", amber: "#F59E0B",
  red: "#EF4444", green: "#10B981", purple: "#8B5CF6",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#475569",
};

const RESOLUTION_SCENARIOS = [
  {
    id: "travel",
    title: "International Traveler",
    customer: "Sarah Chen",
    card: "Platinum •••• 4891",
    txn: { merchant: "Hotel Le Marais", amount: 680, location: "Paris, FR", score: 72, tier: "Soft Verify" },
    timeline: [
      { time: "0s", event: "Transaction detected", detail: "Confidence Score: 72 → Soft Verify tier", icon: "📡", color: AX.blue },
      { time: "1s", event: "Push notification sent", detail: "\"Was this you? $680 at Hotel Le Marais, Paris\"", icon: "📱", color: AX.cyan },
      { time: "4s", event: "Customer taps Confirm", detail: "Biometric verified via Face ID on iPhone", icon: "✅", color: AX.green },
      { time: "5s", event: "Transaction approved", detail: "Merchant notified, payment completed", icon: "💳", color: AX.green },
      { time: "+30s", event: "Trust signal updated", detail: "Paris added to active travel context for 7 days", icon: "🧠", color: AX.purple },
    ],
    outcome: { status: "Approved in 4 seconds", oldSystem: "Declined + 47 min call", saved: "Customer kept $4,200 trip spend on Amex" },
  },
  {
    id: "block",
    title: "True Fraud Caught",
    customer: "Michael Torres",
    card: "Gold •••• 7234",
    txn: { merchant: "Crypto Exchange XYZ", amount: 5000, location: "VPN Detected", score: 23, tier: "Hard Block" },
    timeline: [
      { time: "0s", event: "Transaction detected", detail: "Confidence Score: 23 → Hard Block tier", icon: "📡", color: AX.red },
      { time: "0.5s", event: "Transaction declined", detail: "Unknown device, VPN, first-time merchant", icon: "🛑", color: AX.red },
      { time: "1s", event: "Alert sent to customer", detail: "\"Suspicious activity detected on your card\"", icon: "🔔", color: AX.amber },
      { time: "2s", event: "Fraud team notified", detail: "Case auto-created with signal breakdown", icon: "🛡️", color: AX.blue },
      { time: "+10m", event: "Customer confirms fraud", detail: "Card frozen, replacement ordered", icon: "✅", color: AX.green },
    ],
    outcome: { status: "Fraud blocked instantly", oldSystem: "Same outcome but 23% of similar blocks were false positives", saved: "$5,000 fraud prevented + zero false positive risk" },
  },
  {
    id: "subscription",
    title: "Recurring Payment",
    customer: "Priya Sharma",
    card: "Blue Cash •••• 3156",
    txn: { merchant: "Adobe Creative Cloud", amount: 59.99, location: "Auto-bill", score: 97, tier: "Auto-Approve" },
    timeline: [
      { time: "0s", event: "Recurring charge detected", detail: "Confidence Score: 97 → Auto-Approve", icon: "📡", color: AX.green },
      { time: "1ms", event: "Auto-approved", detail: "Known merchant, known amount, known schedule", icon: "✅", color: AX.green },
      { time: "2ms", event: "Merchant confirmed", detail: "Payment settled, no customer interruption", icon: "💳", color: AX.green },
    ],
    outcome: { status: "Zero friction", oldSystem: "12.7% of recurring payments falsely flagged", saved: "No interruption to 890K monthly recurring transactions" },
  },
];

const CSAT_METRICS = [
  { segment: "Post-Soft Verify", before: 3.2, after: 4.6, volume: "23%" },
  { segment: "Post-Active Verify", before: 2.1, after: 3.8, volume: "11%" },
  { segment: "Post-Hard Block (True Fraud)", before: 2.8, after: 4.2, volume: "4%" },
  { segment: "Auto-Approved (No Friction)", before: 4.1, after: 4.8, volume: "62%" },
];

export default function Sprint4CustomerResolution() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("scenarios");
  const [activeScenario, setActiveScenario] = useState("travel");
  const [timelineStep, setTimelineStep] = useState(0);

  useEffect(() => { setVisible(true); }, []);

  const scenario = RESOLUTION_SCENARIOS.find(s => s.id === activeScenario);

  useEffect(() => {
    setTimelineStep(0);
    if (activeTab !== "scenarios") return;
    const timer = setInterval(() => {
      setTimelineStep(prev => {
        if (prev >= (scenario?.timeline.length || 0) - 1) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [activeScenario, activeTab]);

  const tabs = [
    { key: "scenarios", label: "Scenarios" },
    { key: "csat", label: "CSAT Impact" },
    { key: "journey", label: "UX Flows" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: AX.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none", background: "radial-gradient(ellipse at 25% 40%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(ellipse at 75% 60%, rgba(139,92,246,0.05) 0%, transparent 60%)" }} />

      <div style={{ padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)", transition: "all 0.8s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.08)", borderRadius: 8, padding: "6px 14px", border: "1px solid rgba(37,99,235,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#2563EB"/><text x="50" y="64" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="serif">AX</text></svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: AX.blue, letterSpacing: 1.5, textTransform: "uppercase" }}>American Express</span>
          </div>
          <div style={{ background: "rgba(139,92,246,0.1)", color: AX.purple, padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", border: "1px solid rgba(139,92,246,0.15)" }}>
            Sprint 4 — Prototype
          </div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: AX.textPrimary, margin: "0 0 8px" }}>Customer Resolution UX</h1>
        <p style={{ fontSize: 16, color: AX.textSecondary, margin: "0 0 32px", maxWidth: 620 }}>From 47-minute phone calls to 4-second in-app confirmations — redesigning every moment after a fraud flag.</p>
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
              <span style={{ fontSize: 10, fontWeight: 600, color: AX.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Resolution Experience</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: AX.textPrimary, margin: "0 0 14px" }}>
              {activeTab === "scenarios" ? "Live Scenarios" : activeTab === "csat" ? "Customer Satisfaction" : "Verification Flows"}
            </h3>
          </div>

          <div style={{ display: "flex", gap: 2, padding: "0 16px 12px", borderBottom: `1px solid ${AX.border}` }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
                background: activeTab === t.key ? "rgba(37,99,235,0.12)" : "transparent",
                color: activeTab === t.key ? AX.blue : AX.textMuted,
                fontSize: 11, fontWeight: 600, transition: "all 0.2s",
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{ maxHeight: 560, overflowY: "auto", padding: "12px 0" }}>
            {/* Scenarios */}
            {activeTab === "scenarios" && (
              <div style={{ padding: "0 12px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {RESOLUTION_SCENARIOS.map(s => (
                    <button key={s.id} onClick={() => setActiveScenario(s.id)} style={{
                      flex: 1, padding: "8px 6px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: activeScenario === s.id ? "rgba(37,99,235,0.12)" : `rgba(255,255,255,0.02)`,
                      color: activeScenario === s.id ? AX.blue : AX.textMuted,
                      fontSize: 10, fontWeight: 600, transition: "all 0.2s",
                      borderWidth: 1, borderStyle: "solid",
                      borderColor: activeScenario === s.id ? "rgba(37,99,235,0.2)" : AX.border,
                    }}>{s.title}</button>
                  ))}
                </div>

                {scenario && (
                  <>
                    <div style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: AX.textPrimary }}>{scenario.customer}</div>
                          <div style={{ fontSize: 10, color: AX.textMuted }}>{scenario.card}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: AX.textPrimary }}>${scenario.txn.amount}</div>
                          <div style={{ fontSize: 10, color: AX.textMuted }}>{scenario.txn.merchant}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "rgba(37,99,235,0.1)", color: AX.blue, fontWeight: 600 }}>Score: {scenario.txn.score}</span>
                        <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: AX.amber, fontWeight: 600 }}>{scenario.txn.tier}</span>
                        <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.04)", color: AX.textMuted }}>{scenario.txn.location}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: 9, fontWeight: 600, color: AX.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, padding: "0 4px" }}>Resolution Timeline</div>
                    {scenario.timeline.map((step, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 12, marginBottom: 8,
                        opacity: i <= timelineStep ? 1 : 0.2,
                        transform: i <= timelineStep ? "translateX(0)" : "translateX(10px)",
                        transition: "all 0.4s ease",
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                          <div style={{ width: 12, height: 12, borderRadius: "50%", background: i <= timelineStep ? step.color : AX.border, transition: "background 0.3s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7 }}>
                            {i <= timelineStep && "●"}
                          </div>
                          {i < scenario.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: i < timelineStep ? step.color : AX.border, transition: "background 0.3s", marginTop: 2, opacity: 0.3 }} />}
                        </div>
                        <div style={{ flex: 1, paddingBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12 }}>{step.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: AX.textMuted }}>{step.time}</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: AX.textPrimary, marginTop: 2 }}>{step.event}</div>
                          <div style={{ fontSize: 10, color: AX.textMuted, marginTop: 1 }}>{step.detail}</div>
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: 8, padding: "12px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: AX.green, marginBottom: 4 }}>{scenario.outcome.status}</div>
                      <div style={{ fontSize: 10, color: AX.textMuted, marginBottom: 6 }}>Old system: {scenario.outcome.oldSystem}</div>
                      <div style={{ fontSize: 10, color: AX.textSecondary, fontWeight: 600 }}>{scenario.outcome.saved}</div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CSAT */}
            {activeTab === "csat" && (
              <div style={{ padding: "0 16px" }}>
                <div style={{ padding: "16px", borderRadius: 14, background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))", border: "1px solid rgba(37,99,235,0.1)", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: AX.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Overall CSAT Improvement</div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, color: AX.textMuted, textDecoration: "line-through" }}>3.1</span>
                    <span style={{ fontSize: 14, color: AX.textMuted }}>→</span>
                    <span style={{ fontSize: 36, fontWeight: 800, color: AX.green }}>4.5</span>
                    <span style={{ fontSize: 13, color: AX.textMuted }}>/5.0</span>
                  </div>
                  <div style={{ fontSize: 11, color: AX.green, fontWeight: 600, marginTop: 4 }}>+45% improvement across all segments</div>
                </div>

                {CSAT_METRICS.map((m, i) => (
                  <div key={i} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, marginBottom: 8, opacity: visible ? 1 : 0, transition: `opacity 0.5s ${0.2 + i * 0.1}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: AX.textPrimary }}>{m.segment}</span>
                      <span style={{ fontSize: 9, color: AX.textMuted }}>{m.volume} of traffic</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: AX.textMuted }}>Before: {m.before}</span>
                          <span style={{ fontSize: 9, color: AX.green, fontWeight: 600 }}>After: {m.after}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                          <div style={{ position: "absolute", height: "100%", borderRadius: 3, background: AX.red, width: `${(m.before / 5) * 100}%`, opacity: 0.3 }} />
                          <div style={{ position: "absolute", height: "100%", borderRadius: 3, background: AX.green, width: `${(m.after / 5) * 100}%` }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: AX.green, width: 50, textAlign: "right" }}>+{((m.after - m.before) / m.before * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}

                <div style={{ padding: "14px", borderRadius: 12, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.1)", marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: AX.purple, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>NPS Recovery</div>
                  <div style={{ fontSize: 11, color: AX.textSecondary, lineHeight: 1.5 }}>
                    Customers who experience Soft Verify now rate the fraud protection as a <span style={{ color: AX.green, fontWeight: 600 }}>positive feature</span> — NPS +8 vs pre-incident baseline, compared to <span style={{ color: AX.red, fontWeight: 600 }}>-18 pts</span> in the old system.
                  </div>
                </div>
              </div>
            )}

            {/* UX Flows */}
            {activeTab === "journey" && (
              <div style={{ padding: "0 16px" }}>
                {[
                  {
                    tier: "Soft Verify", color: AX.amber, pct: "23%",
                    steps: ["Push notification on trusted device", "\"Was this you?\" with merchant + amount", "One-tap confirm or \"Not me\" button", "If confirmed → approved in <5s", "If denied → escalate to Active Verify"],
                  },
                  {
                    tier: "Active Verify", color: "#F97316", pct: "11%",
                    steps: ["SMS code sent to registered number", "Biometric required (Face ID / fingerprint)", "Location check prompt if available", "3-minute window before auto-decline", "If verified → approved + trust signal boost"],
                  },
                  {
                    tier: "Hard Block", color: AX.red, pct: "4%",
                    steps: ["Transaction instantly declined", "In-app alert with fraud details", "One-tap \"This was me\" recovery option", "If legitimate → fast-track to Active Verify", "If fraud → card frozen, replacement in 24h"],
                  },
                ].map((flow, i) => (
                  <div key={i} style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${flow.color}15`, marginBottom: 10, opacity: visible ? 1 : 0, transition: `opacity 0.5s ${0.2 + i * 0.12}s` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: flow.color }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: flow.color }}>{flow.tier}</span>
                      </div>
                      <span style={{ fontSize: 10, color: AX.textMuted }}>{flow.pct} of transactions</span>
                    </div>
                    {flow.steps.map((step, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: j < flow.steps.length - 1 ? `1px solid ${AX.border}` : "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: flow.color, width: 14, flexShrink: 0, textAlign: "center" }}>{j + 1}</span>
                        <span style={{ fontSize: 11, color: AX.textSecondary }}>{step}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ height: 20, background: AX.card }} />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        <div style={{ padding: "24px 32px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s" }}>
          <div>
            <div style={{ fontSize: 10, color: AX.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Sprint 4 — Prototype: Customer Resolution</div>
            <div style={{ fontSize: 14, color: AX.textSecondary, lineHeight: 1.6, maxWidth: 520 }}>
              Three resolution scenarios demonstrate the new UX: <span style={{ color: AX.cyan, fontWeight: 600 }}>4-second soft verify</span> for travelers,
              <span style={{ color: AX.red, fontWeight: 600 }}> instant fraud blocks</span> with smart recovery,
              and <span style={{ color: AX.green, fontWeight: 600 }}>CSAT up 45%</span> across all segments.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Resolve Time", value: "4s", color: AX.green },
              { label: "CSAT", value: "4.5", color: AX.blue },
              { label: "NPS Swing", value: "+26", color: AX.purple },
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
