import { useState } from "react";

const DAILY_SUMMARY = {
  date: "May 20, 2026",
  totalTxns: 4218,
  totalValue: "₹18.4L",
  matched: { count: 4049, pct: 96.0, value: "₹17.6L" },
  partial: { count: 101, pct: 2.4, value: "₹52K" },
  exceptions: { count: 68, pct: 1.6, value: "₹24K" },
};

const SETTLEMENT_TRACKER = [
  { mode: "UPI", txns: 1432, expected: "₹4.82L", received: "₹4.82L", status: "settled", pct: 100, cycle: "T+0", color: "#059669" },
  { mode: "Debit Card", txns: 928, expected: "₹5.12L", received: "₹5.12L", status: "settled", pct: 100, cycle: "T+1", color: "#059669" },
  { mode: "Credit Card", txns: 1184, expected: "₹6.41L", received: "₹6.28L", status: "partial", pct: 98, cycle: "T+2", color: "#f59e0b" },
  { mode: "Wallets", txns: 380, expected: "₹1.24L", received: "₹0", status: "pending", pct: 0, cycle: "T+3", color: "#94a3b8" },
  { mode: "EMI/BNPL", txns: 294, expected: "₹82K", received: "₹27K", status: "partial", pct: 33, cycle: "T+5", color: "#f59e0b" },
];

const EXCEPTIONS = [
  { id: "EXC-4201", merchant: "Metro Electronics", type: "MDR Mismatch", amount: "₹18,500", expected: "₹18,130", received: "₹17,945", diff: "-₹185", severity: "medium", aiSuggestion: "Interchange rate changed from 2.0% to 2.1% on May 18. Auto-adjust MDR template.", confidence: 92 },
  { id: "EXC-4202", merchant: "Daily Fresh Mart", type: "Missing Settlement", amount: "₹3,200", expected: "₹3,200", received: "₹0", diff: "-₹3,200", severity: "high", aiSuggestion: "UPI transaction UTR not found in bank settlement file. Likely delayed — 94% of similar cases settle within 24h.", confidence: 88 },
  { id: "EXC-4203", merchant: "Chai Point", type: "Duplicate Credit", amount: "₹180", expected: "₹180", received: "₹360", diff: "+₹180", severity: "low", aiSuggestion: "Refund reversal created duplicate credit. Flag for merchant acknowledgment — no action needed.", confidence: 96 },
  { id: "EXC-4204", merchant: "FitZone Gym", type: "Split Mismatch", amount: "₹5,000", expected: "₹1,667", received: "₹1,650", diff: "-₹17", severity: "low", aiSuggestion: "EMI processing fee rounding difference (₹17). Within tolerance — auto-close.", confidence: 98 },
  { id: "EXC-4205", merchant: "Urban Style", type: "Chargeback Offset", amount: "₹4,200", expected: "₹4,116", received: "₹3,780", diff: "-₹336", severity: "high", aiSuggestion: "Settlement includes chargeback deduction from TXN-83991 (May 14). Link to dispute case #CB-2841.", confidence: 85 },
];

const TIMELINE = [
  { time: "6:00 AM", event: "UPI settlements received", detail: "1,432 transactions · ₹4.82L · 100% matched", status: "complete" },
  { time: "8:30 AM", event: "Debit card batch settled", detail: "928 transactions · ₹5.12L · 100% matched", status: "complete" },
  { time: "10:00 AM", event: "Credit card T+2 batch", detail: "1,184 transactions · ₹6.28L settled (₹13K pending MDR adj.)", status: "partial" },
  { time: "—", event: "Wallet settlements (expected T+3)", detail: "380 transactions · ₹1.24L · Due May 23", status: "pending" },
  { time: "—", event: "EMI installment #2 of 3", detail: "294 transactions · ₹27K of ₹82K received", status: "partial" },
];

export default function Sprint3ReconciliationDashboard() {
  const [tab, setTab] = useState("overview");
  const [expandedException, setExpandedException] = useState(null);

  const severityColor = (s) => s === "high" ? "#ef4444" : s === "medium" ? "#f59e0b" : "#059669";

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
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>Live Reconciliation</h3>
            <p style={{ fontSize: 10, color: "#059669", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 3 — Prototype + Test</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(5,150,105,0.08)" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "settlements", label: "Settlements" },
          { key: "exceptions", label: "Exceptions" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#059669" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #059669" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", maxHeight: 440, overflowY: "auto" }}>
        {tab === "overview" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(5,150,105,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#059669", letterSpacing: 0.5 }}>TODAY · {DAILY_SUMMARY.date}</span>
                <span style={{ fontSize: 10, color: "#064e3b", fontWeight: 800 }}>{DAILY_SUMMARY.totalValue}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: "Matched", value: DAILY_SUMMARY.matched.pct + "%", count: DAILY_SUMMARY.matched.count, color: "#059669" },
                  { label: "Partial", value: DAILY_SUMMARY.partial.pct + "%", count: DAILY_SUMMARY.partial.count, color: "#f59e0b" },
                  { label: "Exception", value: DAILY_SUMMARY.exceptions.pct + "%", count: DAILY_SUMMARY.exceptions.count, color: "#ef4444" },
                ].map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center", background: `${s.color}08`, borderRadius: 8, padding: "8px 4px", border: `1px solid ${s.color}12` }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 9, color: "#64748b" }}>{s.count.toLocaleString()} txns</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, height: 10, borderRadius: 5, background: "rgba(0,0,0,0.03)", display: "flex", overflow: "hidden" }}>
                <div style={{ width: `${DAILY_SUMMARY.matched.pct}%`, background: "#059669", height: "100%" }} />
                <div style={{ width: `${DAILY_SUMMARY.partial.pct}%`, background: "#f59e0b", height: "100%" }} />
                <div style={{ width: `${DAILY_SUMMARY.exceptions.pct}%`, background: "#ef4444", height: "100%" }} />
              </div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#064e3b", marginBottom: 6, letterSpacing: 0.5 }}>SETTLEMENT TIMELINE</div>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                    background: t.status === "complete" ? "#059669" : t.status === "partial" ? "#f59e0b" : "#d1d5db",
                  }} />
                  {i < TIMELINE.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(5,150,105,0.1)", marginTop: 2 }} />}
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#064e3b" }}>{t.event}</span>
                    <span style={{ fontSize: 9, color: "#9ca3af" }}>{t.time}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "settlements" && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", marginBottom: 8, letterSpacing: 0.5 }}>SETTLEMENT BY PAYMENT MODE</div>
            {SETTLEMENT_TRACKER.map((s, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: 12, marginBottom: 6,
                border: "1px solid rgba(5,150,105,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#064e3b" }}>{s.mode}</span>
                    <span style={{ fontSize: 9, color: "#9ca3af", marginLeft: 6 }}>{s.txns} txns · {s.cycle}</span>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: s.status === "settled" ? "rgba(5,150,105,0.08)" : s.status === "partial" ? "rgba(245,158,11,0.08)" : "rgba(0,0,0,0.04)",
                    color: s.status === "settled" ? "#059669" : s.status === "partial" ? "#f59e0b" : "#9ca3af",
                    letterSpacing: 0.3, textTransform: "uppercase",
                  }}>{s.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#64748b", marginBottom: 4 }}>
                  <span>Expected: <strong style={{ color: "#064e3b" }}>{s.expected}</strong></span>
                  <span>Received: <strong style={{ color: s.color }}>{s.received}</strong></span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.04)" }}>
                  <div style={{ width: `${s.pct}%`, height: "100%", borderRadius: 3, background: s.color, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2, textAlign: "right" }}>{s.pct}% settled</div>
              </div>
            ))}
          </div>
        )}

        {tab === "exceptions" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { label: "High", value: 2, color: "#ef4444" },
                { label: "Medium", value: 1, color: "#f59e0b" },
                { label: "Low", value: 2, color: "#059669" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: `${s.color}08`, borderRadius: 8, padding: "8px 4px", textAlign: "center", border: `1px solid ${s.color}12` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {EXCEPTIONS.map((ex, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div onClick={() => setExpandedException(expandedException === i ? null : i)} style={{
                  background: "#fff", borderRadius: 10, padding: "10px 10px", cursor: "pointer",
                  borderLeft: `3px solid ${severityColor(ex.severity)}`,
                  border: "1px solid rgba(0,0,0,0.04)",
                  borderLeftWidth: 3, borderLeftColor: severityColor(ex.severity),
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#064e3b" }}>{ex.merchant}</span>
                      <div style={{ fontSize: 9, color: "#9ca3af" }}>{ex.id} · {ex.type}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: severityColor(ex.severity) }}>{ex.diff}</div>
                      <div style={{ fontSize: 8, color: "#9ca3af" }}>{ex.severity}</div>
                    </div>
                  </div>
                </div>
                {expandedException === i && (
                  <div style={{ background: "#f0fdf4", borderRadius: "0 0 10px 10px", padding: "10px 12px", marginTop: -2, border: "1px solid rgba(5,150,105,0.08)", borderTop: "none" }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 9, color: "#64748b" }}>
                      <span>Amt: {ex.amount}</span>
                      <span>Expected: {ex.expected}</span>
                      <span>Got: {ex.received}</span>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(5,150,105,0.1)" }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "#059669", marginBottom: 4, letterSpacing: 0.3 }}>🤖 AI SUGGESTION · {ex.confidence}% confidence</div>
                      <div style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>{ex.aiSuggestion}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <div style={{ flex: 1, padding: "6px 8px", borderRadius: 6, background: "#059669", textAlign: "center", cursor: "pointer" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>Accept</span>
                      </div>
                      <div style={{ flex: 1, padding: "6px 8px", borderRadius: 6, background: "#ecfdf5", textAlign: "center", cursor: "pointer", border: "1px solid rgba(5,150,105,0.15)" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#059669" }}>Escalate</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-around", padding: "10px 16px",
        background: "rgba(5,150,105,0.03)", borderTop: "1px solid rgba(5,150,105,0.06)",
      }}>
        {[
          { label: "Matched", value: "96%" },
          { label: "Exceptions", value: "68" },
          { label: "Settled", value: "₹17.6L" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#064e3b" }}>{s.value}</div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
