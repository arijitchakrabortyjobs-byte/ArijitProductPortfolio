import { useState, useEffect, useRef } from "react";

const AX = {
  bg: "#0A0F1E", card: "#111827", border: "#1E293B",
  blue: "#2563EB", cyan: "#06B6D4", amber: "#F59E0B",
  red: "#EF4444", green: "#10B981", purple: "#8B5CF6",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#475569",
};

const LIVE_TRANSACTIONS = [
  { id: "TXN-9841", merchant: "Delta Airlines", amount: 1247.00, location: "JFK → CDG", device: "iPhone 15 Pro", score: 91, tier: "auto-approve", signals: { device: 95, location: 82, merchant: 88, behavior: 94, velocity: 90, network: 87, time: 92 }, category: "International Travel", time: "2s ago" },
  { id: "TXN-9842", merchant: "Louis Vuitton", amount: 3850.00, location: "Paris, FR", device: "iPhone 15 Pro", score: 72, tier: "soft-verify", signals: { device: 95, location: 42, merchant: 30, behavior: 68, velocity: 85, network: 74, time: 88 }, category: "High-Value Purchase", time: "5s ago" },
  { id: "TXN-9843", merchant: "Netflix", amount: 22.99, location: "Home IP", device: "Apple TV", score: 97, tier: "auto-approve", signals: { device: 98, location: 99, merchant: 99, behavior: 96, velocity: 95, network: 94, time: 92 }, category: "Recurring", time: "8s ago" },
  { id: "TXN-9844", merchant: "Crypto Exchange XYZ", amount: 5000.00, location: "VPN Detected", device: "Unknown Browser", score: 23, tier: "hard-block", signals: { device: 10, location: 8, merchant: 15, behavior: 22, velocity: 30, network: 12, time: 45 }, category: "High-Risk", time: "12s ago" },
  { id: "TXN-9845", merchant: "Whole Foods", amount: 127.43, location: "Home + 2mi", device: "Apple Watch", score: 94, tier: "auto-approve", signals: { device: 92, location: 96, merchant: 95, behavior: 93, velocity: 98, network: 91, time: 90 }, category: "Grocery", time: "15s ago" },
  { id: "TXN-9846", merchant: "Airbnb", amount: 892.00, location: "Lisbon, PT", device: "Safari — MacBook", score: 67, tier: "soft-verify", signals: { device: 88, location: 35, merchant: 72, behavior: 55, velocity: 78, network: 65, time: 70 }, category: "Travel", time: "18s ago" },
  { id: "TXN-9847", merchant: "Steam Games", amount: 59.99, location: "Home IP", device: "Gaming PC", score: 45, tier: "active-verify", signals: { device: 40, location: 90, merchant: 25, behavior: 38, velocity: 42, network: 35, time: 60 }, category: "Digital", time: "22s ago" },
  { id: "TXN-9848", merchant: "Uber Eats", amount: 34.50, location: "Home + 0.5mi", device: "iPhone 15 Pro", score: 96, tier: "auto-approve", signals: { device: 98, location: 97, merchant: 94, behavior: 96, velocity: 95, network: 93, time: 94 }, category: "Food Delivery", time: "25s ago" },
];

const TIER_CONFIG = [
  { name: "Auto-Approve", range: "85-100", color: AX.green, pct: 62, icon: "✓", latency: "<2ms", friction: "None" },
  { name: "Soft Verify", range: "60-84", color: AX.amber, pct: 23, icon: "📱", latency: "~8s", friction: "Push notification tap" },
  { name: "Active Verify", range: "30-59", color: "#F97316", pct: 11, icon: "🔐", latency: "~45s", friction: "Biometric + SMS code" },
  { name: "Hard Block", range: "0-29", color: AX.red, pct: 4, icon: "🛑", latency: "Instant", friction: "Decline + call required" },
];

const PERFORMANCE_METRICS = [
  { label: "Transactions/sec", value: "12,847", delta: "Peak: 28K", color: AX.cyan },
  { label: "Avg Decision Time", value: "1.8ms", delta: "P99: 12ms", color: AX.green },
  { label: "False Positive Rate", value: "3.8%", delta: "↓ 73% from 14.2%", color: AX.green },
  { label: "True Fraud Caught", value: "99.2%", delta: "↑ from 97.1%", color: AX.blue },
];

function ScoreRing({ score, size = 52 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 85 ? AX.green : score >= 60 ? AX.amber : score >= 30 ? "#F97316" : AX.red;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={circ - (score/100)*circ} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}</span>
      </div>
    </div>
  );
}

function SignalBar({ label, value }) {
  const color = value >= 80 ? AX.green : value >= 50 ? AX.amber : AX.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 9, color: AX.textMuted, width: 52, textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.04)" }}>
        <div style={{ height: "100%", borderRadius: 2, background: color, width: `${value}%`, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 600, color, width: 24 }}>{value}</span>
    </div>
  );
}

export default function Sprint3LiveDecisionEngine() {
  const [visible, setVisible] = useState(false);
  const [expandedTxn, setExpandedTxn] = useState(null);
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => { setVisible(true); }, []);

  const tabs = [
    { key: "live", label: "Live Feed" },
    { key: "tiers", label: "Tier Model" },
    { key: "perf", label: "Performance" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: AX.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none", background: "radial-gradient(ellipse at 30% 30%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(6,182,212,0.05) 0%, transparent 60%)" }} />

      <div style={{ padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)", transition: "all 0.8s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.08)", borderRadius: 8, padding: "6px 14px", border: "1px solid rgba(37,99,235,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#2563EB"/><text x="50" y="64" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="serif">AX</text></svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: AX.blue, letterSpacing: 1.5, textTransform: "uppercase" }}>American Express</span>
          </div>
          <div style={{ background: "rgba(6,182,212,0.1)", color: AX.cyan, padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", border: "1px solid rgba(6,182,212,0.15)" }}>
            Sprint 3 — Prototype
          </div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: AX.textPrimary, margin: "0 0 8px" }}>Live Decision Engine</h1>
        <p style={{ fontSize: 16, color: AX.textSecondary, margin: "0 0 32px", maxWidth: 620 }}>Real-time confidence scoring in action — watch transactions flow through the 4-tier verification model at 12,000+ TPS.</p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 400, borderRadius: 28, overflow: "hidden", background: AX.card, boxShadow: "0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease 0.2s" }}>
          {/* Status bar */}
          <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: AX.textPrimary }}>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: AX.green, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: AX.green, fontWeight: 600 }}>LIVE</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <svg width="16" height="16" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#2563EB"/><text x="50" y="64" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="800" fontFamily="serif">AX</text></svg>
              <span style={{ fontSize: 10, fontWeight: 600, color: AX.textMuted, letterSpacing: 2, textTransform: "uppercase" }}>Fraud Intelligence</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: AX.textPrimary, margin: "0 0 14px" }}>
              {activeTab === "live" ? "Transaction Feed" : activeTab === "tiers" ? "Verification Tiers" : "Engine Performance"}
            </h3>
          </div>

          {/* Tabs */}
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
            {/* Live Feed */}
            {activeTab === "live" && LIVE_TRANSACTIONS.map((txn, i) => {
              const tierCfg = TIER_CONFIG.find(t => t.name.toLowerCase().replace(/[ -]/g, "-") === txn.tier) || TIER_CONFIG[0];
              const isExpanded = expandedTxn === txn.id;
              return (
                <div key={txn.id} onClick={() => setExpandedTxn(isExpanded ? null : txn.id)} style={{
                  margin: "0 12px 6px", padding: "12px", borderRadius: 14, cursor: "pointer",
                  background: isExpanded ? "rgba(37,99,235,0.06)" : "rgba(255,255,255,0.015)",
                  border: `1px solid ${isExpanded ? "rgba(37,99,235,0.15)" : AX.border}`,
                  opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(16px)",
                  transition: `all 0.4s ease ${0.1 + i * 0.05}s`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <ScoreRing score={txn.score} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: AX.textPrimary }}>{txn.merchant}</span>
                        <span style={{ fontSize: 8, fontWeight: 700, color: tierCfg.color, background: `${tierCfg.color}15`, padding: "1px 6px", borderRadius: 4, textTransform: "uppercase" }}>{tierCfg.name}</span>
                      </div>
                      <div style={{ fontSize: 10, color: AX.textMuted, marginTop: 2 }}>{txn.location} · {txn.device}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: AX.textPrimary }}>${txn.amount.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: AX.textMuted }}>{txn.time}</div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: 10, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}` }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: AX.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Signal Breakdown</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {Object.entries(txn.signals).map(([key, val]) => (
                          <SignalBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={val} />
                        ))}
                      </div>
                      <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: `${tierCfg.color}10`, border: `1px solid ${tierCfg.color}20` }}>
                        <span style={{ fontSize: 10, color: tierCfg.color, fontWeight: 600 }}>{tierCfg.icon} {tierCfg.name}</span>
                        <span style={{ fontSize: 10, color: AX.textMuted, marginLeft: 8 }}>Latency: {tierCfg.latency} · Friction: {tierCfg.friction}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Tier Model */}
            {activeTab === "tiers" && (
              <div style={{ padding: "0 16px" }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", gap: 2 }}>
                    {TIER_CONFIG.map(t => (
                      <div key={t.name} style={{ width: `${t.pct}%`, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{t.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {TIER_CONFIG.map((t, i) => (
                  <div key={t.name} style={{ padding: "14px", marginBottom: 8, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${t.color}20`, opacity: visible ? 1 : 0, transition: `opacity 0.5s ${0.2 + i * 0.1}s` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{t.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.name}</div>
                          <div style={{ fontSize: 10, color: AX.textMuted }}>Score {t.range}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: AX.textPrimary }}>{t.pct}%</div>
                        <div style={{ fontSize: 9, color: AX.textMuted }}>of traffic</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1, padding: "8px", borderRadius: 8, background: `${t.color}08`, textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.latency}</div>
                        <div style={{ fontSize: 8, color: AX.textMuted }}>Latency</div>
                      </div>
                      <div style={{ flex: 2, padding: "8px", borderRadius: 8, background: `${t.color}08` }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: AX.textSecondary }}>{t.friction}</div>
                        <div style={{ fontSize: 8, color: AX.textMuted }}>Customer friction</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: AX.textSecondary, lineHeight: 1.5 }}>
                    <span style={{ color: AX.green, fontWeight: 700 }}>85%</span> of transactions now resolved with zero or minimal friction, up from <span style={{ color: AX.red, fontWeight: 600 }}>47%</span> in the legacy system.
                  </div>
                </div>
              </div>
            )}

            {/* Performance */}
            {activeTab === "perf" && (
              <div style={{ padding: "0 16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {PERFORMANCE_METRICS.map((m, i) => (
                    <div key={i} style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, opacity: visible ? 1 : 0, transition: `opacity 0.5s ${0.2 + i * 0.1}s` }}>
                      <div style={{ fontSize: 9, color: AX.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: AX.textMuted, marginTop: 4 }}>{m.delta}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: AX.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Before vs After</div>
                  {[
                    { metric: "False Positive Rate", before: "14.2%", after: "3.8%", improvement: "↓ 73%" },
                    { metric: "Avg Resolution Time", before: "47 min", after: "8 sec", improvement: "↓ 99.7%" },
                    { metric: "Customer Complaints", before: "38,400/mo", after: "4,200/mo", improvement: "↓ 89%" },
                    { metric: "Revenue Unblocked", before: "$0", after: "$32.8M/mo", improvement: "New" },
                    { metric: "True Fraud Detection", before: "97.1%", after: "99.2%", improvement: "↑ 2.1pp" },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${AX.border}` : "none" }}>
                      <span style={{ flex: 2, fontSize: 11, fontWeight: 500, color: AX.textSecondary }}>{row.metric}</span>
                      <span style={{ flex: 1, fontSize: 11, color: AX.textMuted, textAlign: "center" }}>{row.before}</span>
                      <span style={{ flex: 1, fontSize: 11, color: AX.textPrimary, fontWeight: 600, textAlign: "center" }}>{row.after}</span>
                      <span style={{ width: 50, fontSize: 10, fontWeight: 700, color: AX.green, textAlign: "right" }}>{row.improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ height: 20, background: AX.card }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        <div style={{ padding: "24px 32px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: `1px solid ${AX.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s" }}>
          <div>
            <div style={{ fontSize: 10, color: AX.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Sprint 3 — Prototype: Live Decision Engine</div>
            <div style={{ fontSize: 14, color: AX.textSecondary, lineHeight: 1.6, maxWidth: 520 }}>
              Confidence scores running in production at <span style={{ color: AX.cyan, fontWeight: 600 }}>12,000+ TPS</span>.
              Transactions route through <span style={{ color: AX.blue, fontWeight: 600 }}>4 verification tiers</span> with
              <span style={{ color: AX.green, fontWeight: 600 }}> 85% zero-friction</span> approval rate.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "FP Rate", value: "3.8%", color: AX.green },
              { label: "Latency", value: "1.8ms", color: AX.cyan },
              { label: "Zero Friction", value: "85%", color: AX.blue },
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
