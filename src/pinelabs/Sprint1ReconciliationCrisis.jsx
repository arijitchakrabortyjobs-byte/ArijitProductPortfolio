import { useState, useEffect, useRef } from "react";

const RECON_STATS = {
  merchantsAffected: 988000,
  dailyTxns: "16.4M",
  unmatchedDaily: "312K",
  avgReconTime: "4.2 hrs",
  errorRate: "8.7%",
  settlementDelay: "T+3 to T+5",
  monthlyLeakage: "₹142Cr",
  manualEffort: "3.8 FTEs/merchant",
};

const PAYMENT_MODES = [
  { mode: "Credit Cards", volume: "28%", settlement: "T+2", batchTime: "11 PM", reconDifficulty: "Medium", issues: ["Split settlements", "Interchange fee deductions", "Chargeback reversals mixed in"] },
  { mode: "Debit Cards", volume: "22%", settlement: "T+1", batchTime: "9 PM", reconDifficulty: "Low", issues: ["RuPay vs Visa/MC different cycles", "Failed txn refund delays"] },
  { mode: "UPI", volume: "34%", settlement: "T+0 to T+1", batchTime: "Real-time", reconDifficulty: "High", issues: ["Instant + delayed mix", "Collect vs pay mismatch", "Multiple VPA settlements"] },
  { mode: "Wallets", volume: "9%", settlement: "T+3 to T+5", batchTime: "Varies", reconDifficulty: "Very High", issues: ["Each wallet separate cycle", "Promotional cashback adjustments", "MDR deduction inconsistency"] },
  { mode: "EMI/BNPL", volume: "7%", settlement: "T+5 to T+7", batchTime: "Weekly", reconDifficulty: "Very High", issues: ["Partial settlements over months", "Processing fee splits", "Subvention amount reconciliation"] },
];

const RECON_FUNNEL = [
  { stage: "Total Daily Transactions", count: "16.4M", pct: 100, color: "#059669" },
  { stage: "Auto-Matched (exact)", count: "12.8M", pct: 78, color: "#10b981" },
  { stage: "Partial Match (amount ±)", count: "2.1M", pct: 13, color: "#f59e0b" },
  { stage: "Unmatched / Exceptions", count: "1.2M", pct: 7, color: "#ef4444" },
  { stage: "Requires Manual Review", count: "312K", pct: 2, color: "#dc2626" },
];

const MERCHANT_PAIN = [
  { persona: "Small Retailer", size: "₹2-5L/mo", hours: "2-3 hrs/day", tools: "Excel + bank app", quote: "I spend every morning matching yesterday's UPI payments with what hit my bank. Half the time the amounts don't match because of fees I don't understand.", pain: 9.2 },
  { persona: "Restaurant Chain", size: "₹15-30L/mo", hours: "1 FTE dedicated", tools: "Tally + manual", quote: "We have 12 outlets, 5 payment modes each. Our accountant spends 80% of her time just figuring out if we got paid correctly.", pain: 8.7 },
  { persona: "D2C Brand", size: "₹50L-2Cr/mo", hours: "2 FTEs + consultant", tools: "Custom scripts", quote: "EMI settlements come in pieces over 3-6 months. We literally cannot close our books on time because reconciliation is never done.", pain: 8.1 },
];

const TOBE_FEATURES = [
  { name: "Smart Auto-Match", desc: "AI matches transactions across POS, bank, and gateway using fuzzy logic — handles fee deductions, split settlements, and timing gaps", improvement: "78% → 96% auto-match rate", icon: "🔗" },
  { name: "Anomaly Detection", desc: "ML flags settlement discrepancies in real-time — missing deposits, duplicate charges, incorrect MDR deductions", improvement: "8.7% → 0.4% error rate", icon: "🔍" },
  { name: "Predictive Settlement", desc: "Forecasts expected settlement amounts and dates per payment mode, alerting when actual deviates from predicted", improvement: "Zero surprise shortfalls", icon: "📈" },
  { name: "One-Click Reconciliation", desc: "Merchant sees unified view: what was sold, what was settled, what's pending — across all payment modes in one screen", improvement: "4.2 hrs → 8 min daily", icon: "⚡" },
];

function AnimatedNumber({ value, suffix = "", prefix = "", duration = 1200, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

function AsIsView() {
  const [expandedMode, setExpandedMode] = useState(null);
  return (
    <div style={{
      background: "#f8faf8", borderRadius: 28, width: 320, minHeight: 620,
      overflow: "hidden", boxShadow: "0 8px 40px rgba(5,150,105,0.10)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(5,150,105,0.08)",
    }}>
      <div style={{ background: "#fff", padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>
      <div style={{ background: "#fff", padding: "8px 20px 16px" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Settlement Manager</h3>
        <p style={{ fontSize: 11, color: "#999", margin: "4px 0 0" }}>Pine Labs Merchant Portal · Daily Recon</p>
      </div>

      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: 0.5, marginBottom: 6 }}>⚠️ RECONCILIATION CRISIS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Unmatched/Day", value: RECON_STATS.unmatchedDaily, color: "#ef4444" },
              { label: "Avg Recon Time", value: RECON_STATS.avgReconTime, color: "#f59e0b" },
              { label: "Error Rate", value: RECON_STATS.errorRate, color: "#ef4444" },
              { label: "Monthly Leakage", value: RECON_STATS.monthlyLeakage, color: "#dc2626" },
            ].map((m, i) => (
              <div key={i} style={{ background: `${m.color}08`, borderRadius: 8, padding: "8px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: "#064e3b", letterSpacing: 0.5, marginBottom: 6, marginTop: 12 }}>PAYMENT MODES — SETTLEMENT CHAOS</div>
        {PAYMENT_MODES.map((pm, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <div onClick={() => setExpandedMode(expandedMode === i ? null : i)} style={{
              background: "#fff", borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              border: expandedMode === i ? "1px solid rgba(5,150,105,0.2)" : "1px solid rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{pm.mode}</span>
                  <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 6 }}>{pm.volume}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "#059669", fontWeight: 600 }}>{pm.settlement}</span>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: pm.reconDifficulty === "Very High" ? "rgba(239,68,68,0.08)" : pm.reconDifficulty === "High" ? "rgba(245,158,11,0.08)" : pm.reconDifficulty === "Medium" ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.05)",
                    color: pm.reconDifficulty === "Very High" ? "#ef4444" : pm.reconDifficulty === "High" ? "#f59e0b" : "#059669",
                  }}>{pm.reconDifficulty}</span>
                </div>
              </div>
              {expandedMode === i && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginBottom: 4 }}>Batch: {pm.batchTime}</div>
                  {pm.issues.map((issue, j) => (
                    <div key={j} style={{ display: "flex", gap: 4, marginBottom: 2 }}>
                      <span style={{ fontSize: 9, color: "#ef4444" }}>✗</span>
                      <span style={{ fontSize: 10, color: "#64748b" }}>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 9, fontWeight: 700, color: "#064e3b", letterSpacing: 0.5, marginBottom: 6, marginTop: 12 }}>RECONCILIATION FUNNEL</div>
        {RECON_FUNNEL.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 32, fontSize: 10, fontWeight: 800, color: step.color, textAlign: "right" }}>{step.pct}%</div>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(0,0,0,0.03)" }}>
              <div style={{ width: `${step.pct}%`, height: "100%", borderRadius: 4, background: step.color, transition: "width 0.8s ease" }} />
            </div>
            <div style={{ minWidth: 90 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{step.stage}</div>
              <div style={{ fontSize: 8, color: "#9ca3af" }}>{step.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToBeView() {
  const [selectedPain, setSelectedPain] = useState(0);
  return (
    <div style={{
      background: "linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 40%, #ffffff 100%)",
      borderRadius: 28, width: 320, minHeight: 620, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(5,150,105,0.12)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(5,150,105,0.1)",
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>
      <div style={{ padding: "8px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>PL</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#064e3b", margin: 0 }}>Smart Reconciliation</h3>
            <p style={{ fontSize: 10, color: "#059669", margin: 0, fontWeight: 600 }}>AI-Powered Settlement Intelligence</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: "rgba(5,150,105,0.04)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(5,150,105,0.08)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", letterSpacing: 0.5, marginBottom: 8 }}>TO-BE: INTELLIGENT AUTO-RECONCILIATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Auto-Match", before: "78%", after: "96%", color: "#059669" },
              { label: "Recon Time", before: "4.2 hrs", after: "8 min", color: "#059669" },
              { label: "Error Rate", before: "8.7%", after: "0.4%", color: "#059669" },
              { label: "Leakage", before: "₹142Cr", after: "₹6Cr", color: "#059669" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "8px 8px", border: "1px solid rgba(5,150,105,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 9, color: "#9ca3af", textDecoration: "line-through" }}>{m.before}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.after}</span>
                </div>
                <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.3 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: "#064e3b", letterSpacing: 0.5, marginBottom: 6 }}>AI CAPABILITIES</div>
        {TOBE_FEATURES.map((f, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6,
            border: "1px solid rgba(5,150,105,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{f.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#064e3b" }}>{f.name}</span>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.5, marginBottom: 4 }}>{f.desc}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", background: "rgba(5,150,105,0.06)", padding: "3px 8px", borderRadius: 4, display: "inline-block" }}>{f.improvement}</div>
          </div>
        ))}

        <div style={{ fontSize: 9, fontWeight: 700, color: "#064e3b", letterSpacing: 0.5, marginBottom: 6, marginTop: 12 }}>MERCHANT VOICES</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {MERCHANT_PAIN.map((p, i) => (
            <div key={i} onClick={() => setSelectedPain(i)} style={{
              flex: 1, padding: "6px 4px", borderRadius: 6, cursor: "pointer", textAlign: "center",
              background: selectedPain === i ? "#059669" : "#fff",
              color: selectedPain === i ? "#fff" : "#059669",
              fontSize: 8, fontWeight: 700, border: "1px solid rgba(5,150,105,0.1)",
            }}>{p.persona}</div>
          ))}
        </div>
        <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: "1px solid rgba(5,150,105,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#064e3b" }}>{MERCHANT_PAIN[selectedPain].persona}</span>
            <span style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>Pain: {MERCHANT_PAIN[selectedPain].pain}/10</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 9, color: "#9ca3af" }}>
            <span>Vol: {MERCHANT_PAIN[selectedPain].size}</span>
            <span>Time: {MERCHANT_PAIN[selectedPain].hours}</span>
            <span>Tools: {MERCHANT_PAIN[selectedPain].tools}</span>
          </div>
          <div style={{
            fontSize: 11, color: "#374151", fontStyle: "italic", lineHeight: 1.5,
            borderLeft: "3px solid #059669", paddingLeft: 10,
          }}>"{MERCHANT_PAIN[selectedPain].quote}"</div>
        </div>
      </div>
    </div>
  );
}

export default function Sprint1ReconciliationCrisis() {
  const [view, setView] = useState("asis");

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <div style={{
        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
        borderRadius: 16, padding: 16, marginBottom: 16,
        border: "1px solid rgba(5,150,105,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #059669, #047857)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 900, letterSpacing: 0.5 }}>PL</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#064e3b" }}>Sprint 1 — Empathize + Define</div>
            <div style={{ fontSize: 10, color: "#059669", fontWeight: 600 }}>Settlement Reconciliation Crisis · Design Thinking Phase 1</div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: "#064e3b" }}>The Problem:</strong> Pine Labs processes 16.4M daily transactions across 988K merchants through 5+ payment modes — each with different settlement cycles (T+0 to T+7), batch schedules, and fee structures. 312K transactions daily require manual reconciliation. Merchants spend an average of 4.2 hours per day just figuring out if they got paid correctly. Monthly revenue leakage from reconciliation errors: ₹142 Cr.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { key: "asis", label: "AS-IS: Manual Chaos" },
          { key: "tobe", label: "TO-BE: AI Reconciliation" },
        ].map(v => (
          <div key={v.key} onClick={() => setView(v.key)} style={{
            flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "center",
            background: view === v.key ? "#059669" : "#fff",
            color: view === v.key ? "#fff" : "#059669",
            fontSize: 11, fontWeight: 700, border: "1px solid rgba(5,150,105,0.15)",
            transition: "all 0.2s",
          }}>{v.label}</div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {view === "asis" ? <AsIsView /> : <ToBeView />}
      </div>
    </div>
  );
}
