import { useState } from "react";

const DISPUTES = [
  { id: "DSP-1041", merchant: "Metro Electronics", txnId: "TXN-84722", amount: "₹18,500", issue: "MDR overcharge", filed: "May 18", status: "auto-resolved", severity: "medium", resolution: "MDR recalculated: interchange rate updated from 2.0% to 2.1% on May 18. ₹185 credit issued to merchant.", aiConfidence: 96, timeToResolve: "4 min" },
  { id: "DSP-1042", merchant: "Daily Fresh Mart", txnId: "TXN-84725", amount: "₹3,200", issue: "Missing settlement", filed: "May 19", status: "escalated", severity: "high", resolution: "UPI UTR not found in bank file. Auto-escalated to NPCI with merchant consent. ETA: 48h.", aiConfidence: 88, timeToResolve: "—" },
  { id: "DSP-1043", merchant: "Chai Point", txnId: "TXN-84726", amount: "₹180", issue: "Duplicate credit", filed: "May 19", status: "auto-resolved", severity: "low", resolution: "Refund reversal created duplicate. Merchant notified — no debit required. Flagged for batch cleanup.", aiConfidence: 98, timeToResolve: "1 min" },
  { id: "DSP-1044", merchant: "PharmEasy Store", txnId: "TXN-84726", amount: "₹108", issue: "Unexplained deduction", filed: "May 20", status: "investigating", severity: "medium", resolution: "Wallet provider applied platform fee not in contract. AI flagged discrepancy — awaiting Paytm response.", aiConfidence: 79, timeToResolve: "—" },
  { id: "DSP-1045", merchant: "Urban Style", txnId: "TXN-84724", amount: "₹336", issue: "Chargeback offset", filed: "May 17", status: "merchant-action", severity: "high", resolution: "Chargeback from customer dispute on May 14 (₹4,200 order). Merchant must upload delivery proof within 5 days.", aiConfidence: 85, timeToResolve: "—" },
  { id: "DSP-1046", merchant: "BookWorld", txnId: "TXN-84727", amount: "₹890", issue: "Zero MDR anomaly", filed: "May 20", status: "auto-resolved", severity: "low", resolution: "Merchant on promotional zero-MDR plan (valid till Jun 30). No discrepancy — closed.", aiConfidence: 99, timeToResolve: "< 1 min" },
];

const AUTO_RULES = [
  { rule: "MDR Recalculation", trigger: "Settlement amount differs from expected by MDR tolerance band", action: "Auto-adjusts MDR template, issues credit/debit memo", resolved: 142, accuracy: "97.8%", icon: "⚙" },
  { rule: "Duplicate Detection", trigger: "Same amount + merchant + time window < 5 min", action: "Flags duplicate, auto-closes if refund reversal confirmed", resolved: 89, accuracy: "99.1%", icon: "🔍" },
  { rule: "Split Settlement Tracker", trigger: "EMI/BNPL installment amount doesn't match expected schedule", action: "Maps to loan ID, tracks installment sequence, alerts on deviation", resolved: 56, accuracy: "94.2%", icon: "📊" },
  { rule: "Chargeback Linker", trigger: "Settlement deduction without corresponding transaction adjustment", action: "Links to chargeback case, notifies merchant with evidence deadline", resolved: 34, accuracy: "91.5%", icon: "🔗" },
  { rule: "Missing UTR Escalator", trigger: "Transaction confirmed at POS but no settlement entry after SLA", action: "Auto-files with payment network (NPCI/Visa/MC) after 24h grace", resolved: 28, accuracy: "88.9%", icon: "⏰" },
];

const MERCHANT_FEEDBACK = [
  { merchant: "Spice Garden Restaurant", rating: 5, quote: "Disputes that took 3 days now resolve in minutes. My accountant is finally happy.", segment: "Restaurant" },
  { merchant: "Metro Electronics", rating: 4, quote: "MDR corrections are automatic now. Only the chargeback cases need my attention.", segment: "Electronics" },
  { merchant: "FitZone Gym", rating: 5, quote: "Haven't had to call support in 2 months. The system just handles everything.", segment: "Fitness" },
  { merchant: "Daily Fresh Mart", rating: 3, quote: "Auto-resolution works great for simple cases. Complex NPCI escalations still feel slow.", segment: "Grocery" },
];

export default function Sprint4DisputeResolution() {
  const [tab, setTab] = useState("disputes");
  const [expandedDispute, setExpandedDispute] = useState(null);
  const [filter, setFilter] = useState("all");

  const statusColor = (s) => s === "auto-resolved" ? "#059669" : s === "escalated" ? "#ef4444" : s === "investigating" ? "#f59e0b" : "#6366f1";
  const statusLabel = (s) => s === "auto-resolved" ? "Auto-Resolved" : s === "escalated" ? "Escalated" : s === "investigating" ? "Investigating" : "Merchant Action";
  const severityColor = (s) => s === "high" ? "#ef4444" : s === "medium" ? "#f59e0b" : "#059669";

  const filtered = filter === "all" ? DISPUTES : DISPUTES.filter(d => d.status === filter);

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
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>Dispute Resolution</h3>
            <p style={{ fontSize: 10, color: "#059669", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 4 — Test + Iterate</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(5,150,105,0.08)" }}>
        {[
          { key: "disputes", label: "Active Disputes" },
          { key: "rules", label: "Auto-Resolution" },
          { key: "feedback", label: "Merchant Voice" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#059669" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #059669" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", minHeight: 440, maxHeight: 500, overflowY: "auto" }}>
        {tab === "disputes" && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              {["all", "auto-resolved", "escalated", "investigating", "merchant-action"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "4px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 9, fontWeight: 600,
                  background: filter === f ? "#059669" : "#f3f4f6",
                  color: filter === f ? "#fff" : "#6b7280",
                }}>{f === "all" ? "All" : f === "auto-resolved" ? "Resolved" : f === "merchant-action" ? "Action Req'd" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { label: "Total", val: "6", bg: "#f0fdf4", color: "#064e3b" },
                { label: "Auto-Resolved", val: "3", bg: "rgba(5,150,105,0.1)", color: "#059669" },
                { label: "Pending", val: "3", bg: "rgba(239,68,68,0.08)", color: "#ef4444" },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, padding: "8px 6px", background: m.bg, borderRadius: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 8, color: "#6b7280", fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>

            {filtered.map(d => (
              <div key={d.id} onClick={() => setExpandedDispute(expandedDispute === d.id ? null : d.id)} style={{
                background: "#fff", borderRadius: 12, padding: "10px 12px", marginBottom: 8,
                border: "1px solid rgba(5,150,105,0.08)", cursor: "pointer",
                boxShadow: expandedDispute === d.id ? "0 4px 16px rgba(5,150,105,0.12)" : "none",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{d.merchant}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{d.id} · {d.issue}</div>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 6,
                    background: `${statusColor(d.status)}15`, color: statusColor(d.status),
                  }}>{statusLabel(d.status)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 9, color: "#64748b" }}>Amt: <strong style={{ color: "#1e293b" }}>{d.amount}</strong></span>
                    <span style={{ fontSize: 9, color: "#64748b" }}>Filed: <strong>{d.filed}</strong></span>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: severityColor(d.severity), textTransform: "uppercase" }}>{d.severity}</span>
                </div>
                {expandedDispute === d.id && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(5,150,105,0.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", marginBottom: 4 }}>AI Resolution</div>
                    <p style={{ fontSize: 10, color: "#374151", margin: 0, lineHeight: 1.5 }}>{d.resolution}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 8, color: "#6b7280" }}>Confidence: <strong style={{ color: "#059669" }}>{d.aiConfidence}%</strong></span>
                        <span style={{ fontSize: 8, color: "#6b7280" }}>Resolved in: <strong>{d.timeToResolve}</strong></span>
                      </div>
                    </div>
                    {d.status !== "auto-resolved" && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button style={{ flex: 1, padding: "6px", borderRadius: 6, border: "none", background: "#059669", color: "#fff", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Accept AI Fix</button>
                        <button style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 9, fontWeight: 700, cursor: "pointer" }}>Override</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "rules" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(5,150,105,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#064e3b", marginBottom: 2 }}>Auto-Resolution Engine</div>
              <p style={{ fontSize: 10, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>5 AI rules process disputes in real-time. Merchant intervention only needed for escalated cases.</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1, textAlign: "center", padding: 6, background: "rgba(5,150,105,0.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>349</div>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>Auto-Resolved (7d)</div>
                </div>
                <div style={{ flex: 1, textAlign: "center", padding: 6, background: "rgba(5,150,105,0.06)", borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>94.3%</div>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>Avg Accuracy</div>
                </div>
              </div>
            </div>

            {AUTO_RULES.map((r, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, border: "1px solid rgba(5,150,105,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{r.icon}</span>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{r.rule}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#059669" }}>{r.accuracy}</span>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: "0 0 4px", lineHeight: 1.4 }}>
                  <strong style={{ color: "#374151" }}>Trigger:</strong> {r.trigger}
                </p>
                <p style={{ fontSize: 9, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>
                  <strong style={{ color: "#374151" }}>Action:</strong> {r.action}
                </p>
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "#f3f4f6", borderRadius: 4 }}>
                    <div style={{ width: `${(r.resolved / 150) * 100}%`, height: "100%", background: "#059669", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 8, color: "#6b7280", fontWeight: 600 }}>{r.resolved} resolved</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "feedback" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(5,150,105,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#064e3b", marginBottom: 6 }}>Merchant Satisfaction — Pilot</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: "NPS", val: "+72", color: "#059669" },
                  { label: "CSAT", val: "4.3/5", color: "#059669" },
                  { label: "Avg Resolve", val: "12 min", color: "#f59e0b" },
                  { label: "Escalation", val: "18%", color: "#ef4444" },
                ].map(m => (
                  <div key={m.label} style={{ flex: 1, textAlign: "center", padding: "6px 4px", background: "rgba(5,150,105,0.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: 7, color: "#6b7280", fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Merchant Voices</div>
            {MERCHANT_FEEDBACK.map((f, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, border: "1px solid rgba(5,150,105,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{f.merchant}</div>
                    <div style={{ fontSize: 8, color: "#94a3b8" }}>{f.segment}</div>
                  </div>
                  <div style={{ display: "flex", gap: 1 }}>
                    {Array.from({ length: 5 }, (_, j) => (
                      <span key={j} style={{ fontSize: 10, color: j < f.rating ? "#f59e0b" : "#e2e8f0" }}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 10, color: "#4b5563", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>"{f.quote}"</p>
              </div>
            ))}

            <div style={{ background: "rgba(5,150,105,0.06)", borderRadius: 12, padding: 12, marginTop: 8, border: "1px dashed rgba(5,150,105,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#064e3b", marginBottom: 4 }}>Iteration Backlog (from feedback)</div>
              {[
                { item: "Faster NPCI escalation SLA tracking", priority: "P0", votes: 12 },
                { item: "Bulk dispute export for CA review", priority: "P1", votes: 8 },
                { item: "WhatsApp dispute status notifications", priority: "P1", votes: 15 },
                { item: "Custom MDR tolerance per merchant", priority: "P2", votes: 5 },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < 3 ? "1px solid rgba(5,150,105,0.06)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4,
                      background: b.priority === "P0" ? "rgba(239,68,68,0.1)" : b.priority === "P1" ? "rgba(245,158,11,0.1)" : "rgba(5,150,105,0.1)",
                      color: b.priority === "P0" ? "#ef4444" : b.priority === "P1" ? "#f59e0b" : "#059669",
                    }}>{b.priority}</span>
                    <span style={{ fontSize: 9, color: "#374151" }}>{b.item}</span>
                  </div>
                  <span style={{ fontSize: 8, color: "#94a3b8" }}>{b.votes} votes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(5,150,105,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "Auto-Resolved", val: "50%", color: "#059669" },
          { label: "Avg Time", val: "12 min", color: "#064e3b" },
          { label: "Accuracy", val: "94.3%", color: "#059669" },
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
