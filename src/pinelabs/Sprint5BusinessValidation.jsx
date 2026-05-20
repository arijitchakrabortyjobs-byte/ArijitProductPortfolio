import { useState } from "react";

const AB_RESULTS = [
  { metric: "Auto-Match Rate", control: "78%", variant: "96.0%", lift: "+23.1%", pValue: "< 0.001", significant: true },
  { metric: "Avg Recon Time", control: "4.2 hrs", variant: "8 min", lift: "-96.8%", pValue: "< 0.001", significant: true },
  { metric: "Exception Rate", control: "22%", variant: "4%", lift: "-81.8%", pValue: "< 0.001", significant: true },
  { metric: "False Match Rate", control: "3.2%", variant: "0.08%", lift: "-97.5%", pValue: "< 0.001", significant: true },
  { metric: "Merchant CSAT", control: "3.1/5", variant: "4.3/5", lift: "+38.7%", pValue: "0.002", significant: true },
  { metric: "Dispute Resolve Time", control: "3.2 days", variant: "12 min", lift: "-99.7%", pValue: "< 0.001", significant: true },
];

const ROI_METRICS = [
  { category: "Revenue Recovery", before: "₹0", after: "₹142 Cr/yr", detail: "Previously unrecovered leakage from unmatched settlements now auto-reconciled" },
  { category: "Ops Cost Saved", before: "₹18 Cr/yr", after: "₹2.4 Cr/yr", detail: "84 FTEs reduced to 12 with AI handling 96% of reconciliation automatically" },
  { category: "Merchant Churn", before: "8.2%", after: "3.1%", detail: "Faster settlements + transparent reconciliation improve merchant retention" },
  { category: "Processing Speed", before: "4.2 hrs/day", after: "8 min/day", detail: "End-to-end reconciliation across 5 payment modes completes before ops team arrives" },
];

const ROLLOUT_PHASES = [
  { phase: "Phase 1 — Pilot", merchants: "500", timeline: "Weeks 1-4", status: "complete", markets: "Bengaluru, Mumbai", criteria: "High-volume UPI merchants (>500 txns/day)", results: "96% auto-match, 4.3 CSAT, 0 critical bugs" },
  { phase: "Phase 2 — Metro Expansion", merchants: "25,000", timeline: "Weeks 5-10", status: "active", markets: "Top 8 metros", criteria: "Multi-mode merchants (UPI + Card + Wallet)", results: "94.8% auto-match, ramping EMI coverage" },
  { phase: "Phase 3 — Tier 2/3 Rollout", merchants: "200,000", timeline: "Weeks 11-18", status: "planned", markets: "Tier 2/3 cities (50+ cities)", criteria: "All merchants with >100 txns/day", results: "Model retraining for regional payment patterns" },
  { phase: "Phase 4 — Full Fleet", merchants: "988,000", timeline: "Weeks 19-26", status: "planned", markets: "All 20 countries", criteria: "Universal rollout with merchant opt-out", results: "Target: 94%+ auto-match across all segments" },
];

export default function Sprint5BusinessValidation() {
  const [tab, setTab] = useState("ab");

  const phaseStatusColor = (s) => s === "complete" ? "#059669" : s === "active" ? "#2563eb" : "#94a3b8";
  const phaseStatusBg = (s) => s === "complete" ? "rgba(5,150,105,0.08)" : s === "active" ? "rgba(37,99,235,0.08)" : "rgba(148,163,184,0.08)";

  return (
    <div style={{
      background: "linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 40%, #ffffff 100%)",
      borderRadius: 28, width: 340, minHeight: 620, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(5,150,105,0.12)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(5,150,105,0.1)",
      margin: "0 auto",
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>
      <div style={{ padding: "4px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>PL</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>Business Validation</h3>
            <p style={{ fontSize: 10, color: "#059669", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 5 — Scale + Measure</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(5,150,105,0.08)" }}>
        {[
          { key: "ab", label: "A/B Results" },
          { key: "roi", label: "ROI Impact" },
          { key: "rollout", label: "Rollout Plan" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#059669" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #059669" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", minHeight: 440, maxHeight: 500, overflowY: "auto" }}>
        {tab === "ab" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(5,150,105,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#064e3b", marginBottom: 2 }}>A/B Test Summary</div>
              <p style={{ fontSize: 9, color: "#6b7280", margin: "0 0 8px", lineHeight: 1.4 }}>500 merchants · 30-day test · Manual recon (control) vs AI engine (variant)</p>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1, textAlign: "center", padding: 6, background: "rgba(5,150,105,0.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>6/6</div>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>Metrics Significant</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: 6, background: "rgba(5,150,105,0.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>p &lt; 0.01</div>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>All Results</div>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(5,150,105,0.08)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 54px 54px 50px", padding: "6px 10px", background: "rgba(5,150,105,0.04)" }}>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280" }}>METRIC</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>CONTROL</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>VARIANT</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>LIFT</span>
              </div>
              {AB_RESULTS.map((r, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 54px 54px 50px", padding: "8px 10px",
                  borderTop: "1px solid rgba(5,150,105,0.06)", alignItems: "center",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{r.metric}</span>
                  <span style={{ fontSize: 9, color: "#94a3b8", textAlign: "center" }}>{r.control}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#059669", textAlign: "center" }}>{r.variant}</span>
                  <div style={{ textAlign: "center" }}>
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                      background: "rgba(5,150,105,0.1)", color: "#059669",
                    }}>{r.lift}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "roi" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #064e3b, #047857)", borderRadius: 14, padding: 14, marginBottom: 12, color: "#fff" }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>ANNUAL ROI PROJECTION</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>₹157.6 Cr</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>₹142 Cr recovered + ₹15.6 Cr ops savings</div>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>18x</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>ROI Multiple</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>4.2 mo</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>Payback Period</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>₹8.7 Cr</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>Build Cost</div>
                </div>
              </div>
            </div>

            {ROI_METRICS.map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, border: "1px solid rgba(5,150,105,0.08)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{r.category}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: "4px 6px", background: "rgba(239,68,68,0.06)", borderRadius: 6 }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 1 }}>Before</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>{r.before}</div>
                  </div>
                  <span style={{ fontSize: 14, color: "#059669" }}>→</span>
                  <div style={{ flex: 1, textAlign: "center", padding: "4px 6px", background: "rgba(5,150,105,0.06)", borderRadius: 6 }}>
                    <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 1 }}>After</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>{r.after}</div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{r.detail}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "rollout" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(5,150,105,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#064e3b", marginBottom: 6 }}>Rollout to 988K Merchants</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: "28%", height: "100%", background: "linear-gradient(90deg, #059669, #10b981)", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#059669" }}>28%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 8, color: "#94a3b8" }}>25,500 merchants live</span>
                <span style={{ fontSize: 8, color: "#94a3b8" }}>Target: 988K by Week 26</span>
              </div>
            </div>

            {ROLLOUT_PHASES.map((p, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 12, padding: 12, marginBottom: 8,
                border: `1px solid ${p.status === "active" ? "rgba(37,99,235,0.2)" : "rgba(5,150,105,0.08)"}`,
                boxShadow: p.status === "active" ? "0 2px 12px rgba(37,99,235,0.08)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.phase}</div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 6,
                    background: phaseStatusBg(p.status), color: phaseStatusColor(p.status),
                    textTransform: "capitalize",
                  }}>{p.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: "#6b7280" }}>Merchants: <strong style={{ color: "#1e293b" }}>{p.merchants}</strong></div>
                  <div style={{ fontSize: 9, color: "#6b7280" }}>Timeline: <strong style={{ color: "#1e293b" }}>{p.timeline}</strong></div>
                  <div style={{ fontSize: 9, color: "#6b7280", gridColumn: "1 / -1" }}>Markets: <strong style={{ color: "#1e293b" }}>{p.markets}</strong></div>
                </div>
                <div style={{ padding: "6px 8px", background: "rgba(5,150,105,0.04)", borderRadius: 6, marginBottom: 4 }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: "#059669", marginBottom: 2 }}>CRITERIA</div>
                  <div style={{ fontSize: 9, color: "#374151" }}>{p.criteria}</div>
                </div>
                <div style={{ padding: "6px 8px", background: phaseStatusBg(p.status), borderRadius: 6 }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: phaseStatusColor(p.status), marginBottom: 2 }}>
                    {p.status === "complete" ? "RESULTS" : p.status === "active" ? "PROGRESS" : "TARGET"}
                  </div>
                  <div style={{ fontSize: 9, color: "#374151" }}>{p.results}</div>
                </div>
              </div>
            ))}

            <div style={{ background: "rgba(5,150,105,0.06)", borderRadius: 12, padding: 12, marginTop: 4, border: "1px dashed rgba(5,150,105,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#064e3b", marginBottom: 4 }}>Go/No-Go Criteria</div>
              {[
                { check: "Auto-match rate > 93%", status: true },
                { check: "False match rate < 0.5%", status: true },
                { check: "Merchant CSAT > 4.0/5", status: true },
                { check: "Zero critical settlement errors", status: true },
                { check: "P99 latency < 200ms", status: true },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                  <span style={{ fontSize: 10, color: c.status ? "#059669" : "#ef4444" }}>{c.status ? "✓" : "✗"}</span>
                  <span style={{ fontSize: 9, color: "#374151" }}>{c.check}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(5,150,105,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "ROI", val: "18x", color: "#059669" },
          { label: "Merchants", val: "988K", color: "#064e3b" },
          { label: "Recovery", val: "₹142Cr", color: "#059669" },
        ].map(m => (
          <div key={m.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.val}</div>
            <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: 600 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
