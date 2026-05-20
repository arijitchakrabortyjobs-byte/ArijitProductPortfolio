import { useState } from "react";

const TRANSACTIONS = [
  { id: "TXN-84721", merchant: "Spice Garden Restaurant", amount: 2840, mode: "UPI", posTime: "10:23 AM", settledAmount: 2840, settledTime: "10:24 AM", status: "matched", confidence: 99, matchType: "exact", signals: { amount: "✓ Exact", timing: "✓ 1 min", ref: "✓ UTR match", mode: "✓ UPI-UPI" } },
  { id: "TXN-84722", merchant: "Metro Electronics", amount: 18500, mode: "Credit Card", posTime: "10:31 AM", settledAmount: 18130, settledTime: "Next day", status: "matched", confidence: 96, matchType: "fuzzy", signals: { amount: "△ ₹370 MDR (2%)", timing: "✓ T+1 cycle", ref: "✓ Auth code", mode: "✓ CC-CC" } },
  { id: "TXN-84723", merchant: "Daily Fresh Mart", amount: 1250, mode: "Debit Card", posTime: "10:45 AM", settledAmount: 1250, settledTime: "Same day", status: "matched", confidence: 98, matchType: "exact", signals: { amount: "✓ Exact", timing: "✓ T+0", ref: "✓ RRN match", mode: "✓ DC-DC" } },
  { id: "TXN-84724", merchant: "Urban Style Clothing", amount: 4200, mode: "EMI", posTime: "11:02 AM", settledAmount: 1400, settledTime: "Week 1", status: "partial", confidence: 87, matchType: "split", signals: { amount: "△ ₹1400/3 EMI", timing: "✓ EMI cycle", ref: "✓ Loan ID", mode: "△ EMI split" } },
  { id: "TXN-84725", merchant: "Chai Point", amount: 180, mode: "UPI", posTime: "11:15 AM", settledAmount: 0, settledTime: "—", status: "missing", confidence: 0, matchType: "none", signals: { amount: "✗ Not received", timing: "✗ 6h overdue", ref: "✗ No UTR", mode: "— UPI" } },
  { id: "TXN-84726", merchant: "PharmEasy Store", amount: 3600, mode: "Wallet", posTime: "11:28 AM", settledAmount: 3492, settledTime: "T+4", status: "anomaly", confidence: 72, matchType: "fuzzy", signals: { amount: "⚠ ₹108 unexplained", timing: "△ T+4 (expected T+3)", ref: "✓ Wallet ref", mode: "✓ Paytm-Paytm" } },
  { id: "TXN-84727", merchant: "BookWorld", amount: 890, mode: "Credit Card", posTime: "11:42 AM", settledAmount: 890, settledTime: "T+2", status: "matched", confidence: 94, matchType: "fuzzy", signals: { amount: "✓ Exact (no MDR?)", timing: "✓ T+2", ref: "✓ Auth code", mode: "✓ CC-CC" } },
  { id: "TXN-84728", merchant: "FitZone Gym", amount: 5000, mode: "UPI", posTime: "12:01 PM", settledAmount: 5000, settledTime: "12:02 PM", status: "matched", confidence: 100, matchType: "exact", signals: { amount: "✓ Exact", timing: "✓ 1 min", ref: "✓ UTR match", mode: "✓ UPI-UPI" } },
];

const MATCHING_RULES = [
  { name: "Exact Amount + Reference", desc: "Transaction amount matches settlement exactly with matching reference number (UTR/RRN/Auth code)", accuracy: "99.2%", coverage: "62%", tier: 1 },
  { name: "Amount ± MDR Tolerance", desc: "Settlement = Transaction - expected MDR% for payment mode. Tolerance band accounts for interchange variations", accuracy: "96.8%", coverage: "18%", tier: 2 },
  { name: "Split Settlement Matching", desc: "EMI/BNPL partial settlements mapped to original transaction via loan ID. Tracks installment sequence", accuracy: "91.4%", coverage: "7%", tier: 3 },
  { name: "Temporal + Amount Fuzzy", desc: "No direct reference match but amount + timing + merchant + mode combination is statistically unique", accuracy: "87.2%", coverage: "9%", tier: 4 },
  { name: "Anomaly → Manual Queue", desc: "Confidence below 70% or unexplained discrepancy flagged for human review with AI-suggested resolution", accuracy: "—", coverage: "4%", tier: 5 },
];

const ENGINE_METRICS = {
  before: { autoMatch: 78, avgConfidence: 71, reconTime: "4.2 hrs", exceptions: 312000, falseMatch: "3.2%" },
  after: { autoMatch: 96, avgConfidence: 94, reconTime: "8 min", exceptions: 18400, falseMatch: "0.08%" },
};

export default function Sprint2MatchingEngine() {
  const [tab, setTab] = useState("feed");
  const [expandedTxn, setExpandedTxn] = useState(null);

  const statusColor = (s) => s === "matched" ? "#059669" : s === "partial" ? "#f59e0b" : s === "missing" ? "#ef4444" : "#8b5cf6";
  const statusBg = (s) => s === "matched" ? "rgba(5,150,105,0.08)" : s === "partial" ? "rgba(245,158,11,0.08)" : s === "missing" ? "rgba(239,68,68,0.08)" : "rgba(139,92,246,0.08)";

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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>PL</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>AI Matching Engine</h3>
            <p style={{ fontSize: 10, color: "#059669", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 2 — Ideate + Prototype</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(5,150,105,0.08)" }}>
        {[
          { key: "feed", label: "Live Matching" },
          { key: "rules", label: "Match Rules" },
          { key: "impact", label: "Before / After" },
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
        {tab === "feed" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[
                { label: "Matched", value: "5", color: "#059669" },
                { label: "Partial", value: "1", color: "#f59e0b" },
                { label: "Missing", value: "1", color: "#ef4444" },
                { label: "Anomaly", value: "1", color: "#8b5cf6" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, background: statusBg(s.label.toLowerCase()), borderRadius: 8, padding: "8px 4px", textAlign: "center", border: `1px solid ${s.color}15` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 7, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {TRANSACTIONS.map((txn, i) => (
              <div key={i} style={{ marginBottom: 4 }}>
                <div onClick={() => setExpandedTxn(expandedTxn === i ? null : i)} style={{
                  background: "#fff", borderRadius: 10, padding: "10px 10px", cursor: "pointer",
                  borderLeft: `3px solid ${statusColor(txn.status)}`,
                  border: "1px solid rgba(0,0,0,0.04)",
                  borderLeftWidth: 3, borderLeftColor: statusColor(txn.status),
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#064e3b" }}>{txn.merchant}</span>
                      <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 1 }}>{txn.id} · {txn.mode} · {txn.posTime}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#064e3b" }}>₹{txn.amount.toLocaleString()}</div>
                      {txn.confidence > 0 && (
                        <div style={{
                          fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 4, display: "inline-block",
                          background: statusBg(txn.status), color: statusColor(txn.status),
                        }}>{txn.confidence}% match</div>
                      )}
                      {txn.confidence === 0 && (
                        <div style={{ fontSize: 8, fontWeight: 700, color: "#ef4444" }}>MISSING</div>
                      )}
                    </div>
                  </div>
                </div>
                {expandedTxn === i && (
                  <div style={{ background: "#f0fdf4", borderRadius: "0 0 10px 10px", padding: "10px 12px", marginTop: -2, border: "1px solid rgba(5,150,105,0.08)", borderTop: "none" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#059669", marginBottom: 6, letterSpacing: 0.5 }}>AI MATCH SIGNALS</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      {Object.entries(txn.signals).map(([key, val], j) => (
                        <div key={j} style={{ background: "#fff", borderRadius: 6, padding: "5px 8px", border: "1px solid rgba(5,150,105,0.06)" }}>
                          <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, textTransform: "capitalize" }}>{key}</div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: val.startsWith("✓") ? "#059669" : val.startsWith("✗") ? "#ef4444" : val.startsWith("⚠") ? "#8b5cf6" : "#f59e0b" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      <div style={{ fontSize: 9, color: "#9ca3af" }}>Settled: <strong style={{ color: "#064e3b" }}>₹{txn.settledAmount.toLocaleString()}</strong></div>
                      <div style={{ fontSize: 9, color: "#9ca3af" }}>· {txn.settledTime}</div>
                      <div style={{ fontSize: 9, color: "#9ca3af" }}>· Type: <strong style={{ color: "#059669" }}>{txn.matchType}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "rules" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 14, border: "1px solid rgba(5,150,105,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", marginBottom: 4, letterSpacing: 0.5 }}>5-TIER MATCHING CASCADE</div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5 }}>
                Transactions flow through 5 matching tiers in order. Each tier catches what the previous couldn't — from exact matches (Tier 1) to AI-suggested anomaly resolution (Tier 5).
              </div>
            </div>
            {MATCHING_RULES.map((rule, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 12, padding: 12, marginBottom: 6,
                border: "1px solid rgba(5,150,105,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "linear-gradient(135deg, #059669, #10b981)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: "#fff",
                    }}>{rule.tier}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#064e3b" }}>{rule.name}</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5, marginBottom: 6 }}>{rule.desc}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>Accuracy</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>{rule.accuracy}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>Coverage</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#064e3b" }}>{rule.coverage}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "impact" && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", marginBottom: 8, letterSpacing: 0.5 }}>AI MATCHING ENGINE IMPACT</div>
            {[
              { label: "Auto-Match Rate", before: ENGINE_METRICS.before.autoMatch + "%", after: ENGINE_METRICS.after.autoMatch + "%", delta: "+18pp" },
              { label: "Avg Confidence", before: ENGINE_METRICS.before.avgConfidence + "%", after: ENGINE_METRICS.after.avgConfidence + "%", delta: "+23pp" },
              { label: "Daily Recon Time", before: ENGINE_METRICS.before.reconTime, after: ENGINE_METRICS.after.reconTime, delta: "-97%" },
              { label: "Daily Exceptions", before: ENGINE_METRICS.before.exceptions.toLocaleString(), after: ENGINE_METRICS.after.exceptions.toLocaleString(), delta: "-94%" },
              { label: "False Match Rate", before: ENGINE_METRICS.before.falseMatch, after: ENGINE_METRICS.after.falseMatch, delta: "-97.5%" },
            ].map((m, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: 12, marginBottom: 6,
                border: "1px solid rgba(5,150,105,0.06)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#064e3b", marginBottom: 8 }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 600, marginBottom: 2 }}>BEFORE</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#9ca3af" }}>{m.before}</div>
                  </div>
                  <div style={{ fontSize: 16, color: "#059669" }}>→</div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#059669", fontWeight: 600, marginBottom: 2 }}>AFTER</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#064e3b" }}>{m.after}</div>
                  </div>
                  <div style={{
                    padding: "4px 8px", borderRadius: 6,
                    background: "rgba(5,150,105,0.08)",
                    fontSize: 11, fontWeight: 800, color: "#059669",
                  }}>{m.delta}</div>
                </div>
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
          { label: "Auto-Match", value: "96%" },
          { label: "Confidence", value: "94%" },
          { label: "Recon Time", value: "8 min" },
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
