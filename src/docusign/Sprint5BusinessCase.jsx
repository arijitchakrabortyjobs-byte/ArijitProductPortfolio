import { useState } from "react";

const EXEC_SUMMARY = {
  headline: "AI Marketing Attribution Agent eliminates the 43% attribution black hole, saves 23 analyst hours/week, and unlocks $28.4M in optimized pipeline — at $0.42/run.",
  keyMetrics: [
    { label: "Pipeline Attributed", before: "57%", after: "94.2%", lift: "+65%" },
    { label: "Report Delivery", before: "18 days", after: "Real-time", lift: "-99%" },
    { label: "Analyst Hours/Wk", before: "23 hrs", after: "4 hrs", lift: "-83%" },
    { label: "Insight Quality", before: "2.8/5", after: "4.2/5", lift: "+50%" },
  ],
  recommendation: "Full deployment recommended. All go/no-go criteria met. 4-phase rollout from Marketing Ops → Performance Marketing → Field Sales → Executive dashboards.",
};

const ROI_BREAKDOWN = [
  { category: "Pipeline Recovery", annualValue: "$28.4M", detail: "Previously invisible pipeline now attributed — enabling data-driven budget reallocation. $4.2M display ad spend redirected to 2.1x ROAS content syndication.", mechanism: "The 37% of pipeline that was 'dark' is now visible. When marketing can prove which campaigns drove which deals, budget follows performance — not intuition." },
  { category: "Analyst Productivity", annualValue: "$1.8M", detail: "19 analyst hours/week freed from manual report building. 3 FTEs equivalent redeployed from data wrangling to strategic analysis.", mechanism: "Data Ingestion Agent + Report Writer Agent automate the entire Monday-Wednesday reporting cycle. Analysts now spend that time on 'what should we do' instead of 'what happened'." },
  { category: "Campaign Optimization", annualValue: "$6.2M", detail: "Real-time attribution enables in-flight campaign optimization. Performance marketers adjust spend within hours, not weeks.", mechanism: "18-day reporting lag meant campaigns ran blind for 3 weeks after launch. Now, the Insight Agent surfaces anomalies (like the 340% LinkedIn CPL spike) within hours." },
  { category: "Churn Prevention", annualValue: "$4.1M", detail: "Customer marketing attribution (22% → 78%) reveals which engagement programs prevent churn. Renewal campaigns finally get credit.", mechanism: "Expansion/renewal pipeline was 78% unattributed — Customer Success had no idea which marketing programs drove renewals. Now they do, and they can double down." },
];

const STAKEHOLDER_IMPACT = [
  { role: "CMO (Sarah Chen)", before: "Dreads board meetings — can't prove marketing ROI. Defends $180M budget with anecdotes.", after: "Walks into board with AI-generated attribution report showing campaign-level ROI. Confidence to propose $12M budget increase for proven channels.", quote: "For the first time, I can answer 'What did marketing contribute?' with actual data, not estimates." },
  { role: "Marketing Ops (David Park)", before: "Team of 3 spends 60% of time building reports. Monday-Wednesday is pure data wrangling.", after: "Reports auto-generate at 2 AM Monday. Team focuses on experiment design and strategic analysis.", quote: "I went from being an expensive ETL pipeline to actually doing the analysis I was hired for." },
  { role: "Performance Marketing (Priya Mehta)", before: "Optimizes $40M in paid spend based on last-click. Knows it's wrong but has no alternative.", after: "5 attribution models show true campaign impact. Reallocated $4.2M from display to content — pipeline up 18%.", quote: "I always suspected our webinars were undervalued. Now I have proof — and the budget to match." },
  { role: "Field Sales (Marcus Williams)", before: "QBR arguments about who sourced what. Marketing says 60%, sales says 80%. Zero alignment.", after: "Shared attribution dashboard both teams trust. Pipeline sourcing disputes dropped 89%.", quote: "We finally stopped arguing about credit and started talking about how to win together." },
];

const ROLLOUT_PLAN = [
  { phase: "Phase 1 — Marketing Ops", timeline: "Weeks 1-4", users: "5 analysts", status: "complete", scope: "Deploy Data Ingestion + Attribution agents. Validate against manual reports. Train ops team on interpreting multi-model attribution.", success: "Attribution coverage hit 94.2%. Ops team validated accuracy against 500 manually-labeled opportunities." },
  { phase: "Phase 2 — Performance Marketing", timeline: "Weeks 5-8", users: "12 marketers", status: "active", scope: "Activate Insight Agent for real-time campaign optimization. Add budget reallocation recommendations. Deploy anomaly alerts to Slack.", success: "3 budget reallocations executed based on AI insights. LinkedIn CPL issue caught 4 days faster than manual detection." },
  { phase: "Phase 3 — Sales Alignment", timeline: "Weeks 9-12", users: "50 reps + managers", status: "planned", scope: "Shared attribution dashboard for sales and marketing. Joint pipeline reviews using AI-generated insights. Resolve sourcing disputes with data.", success: "Target: < 5% attribution disputes at QBR. Shared metrics agreement between VP Sales and VP Marketing." },
  { phase: "Phase 4 — Executive Dashboards", timeline: "Weeks 13-16", users: "C-suite (CMO, CFO, CEO)", status: "planned", scope: "Auto-generated board-ready reports. Quarterly marketing ROI narrative. Budget planning informed by attributed pipeline data.", success: "Target: CMO presents AI-generated attribution to board. CFO approves data-driven budget request." },
];

const GO_NO_GO = [
  { criteria: "Attribution coverage > 90%", actual: "94.2%", pass: true },
  { criteria: "Hallucination rate < 1%", actual: "0.4%", pass: true },
  { criteria: "Insight quality > 4.0/5", actual: "4.2/5", pass: true },
  { criteria: "Cost per run < $1.00", actual: "$0.42", pass: true },
  { criteria: "P95 latency < 3 minutes", actual: "2m 04s", pass: true },
  { criteria: "3/3 A/B tests significant", actual: "3/3 wins", pass: true },
  { criteria: "Zero critical hallucinations (last 12 runs)", actual: "0 found", pass: true },
  { criteria: "Analyst satisfaction > 4.0/5", actual: "4.3/5", pass: true },
];

export default function Sprint5BusinessCase() {
  const [tab, setTab] = useState("summary");
  const [expandedROI, setExpandedROI] = useState(null);
  const [expandedStake, setExpandedStake] = useState(null);

  return (
    <div style={{
      background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 40%, #ffffff 100%)",
      borderRadius: 28, width: 340, minHeight: 620, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(217,119,6,0.12)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(217,119,6,0.1)",
      margin: "0 auto",
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>

      <div style={{ padding: "4px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #D97706, #B45309)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>DS</span>
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#78350F", margin: 0 }}>Business Validation</h3>
            <p style={{ fontSize: 10, color: "#D97706", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 5 — Validate + Scale</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(217,119,6,0.08)" }}>
        {[
          { key: "summary", label: "Executive Summary" },
          { key: "roi", label: "ROI & Impact" },
          { key: "rollout", label: "Rollout Plan" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#D97706" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #D97706" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", minHeight: 440, maxHeight: 500, overflowY: "auto" }}>
        {tab === "summary" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #78350F, #92400E)", borderRadius: 14, padding: 14, marginBottom: 12, color: "#fff" }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, letterSpacing: 0.5, marginBottom: 4 }}>EXECUTIVE BRIEF</div>
              <p style={{ fontSize: 11, fontWeight: 600, margin: 0, lineHeight: 1.5, opacity: 0.95 }}>{EXEC_SUMMARY.headline}</p>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Key Metrics — Before vs After</div>
            {EXEC_SUMMARY.keyMetrics.map(m => (
              <div key={m.label} style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", marginBottom: 6, border: "1px solid rgba(217,119,6,0.08)" }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, padding: "4px 8px", background: "rgba(220,38,38,0.04)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#94a3b8" }}>Before</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>{m.before}</div>
                  </div>
                  <span style={{ fontSize: 12, color: "#059669", fontWeight: 800 }}>→</span>
                  <div style={{ flex: 1, padding: "4px 8px", background: "rgba(5,150,105,0.04)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#94a3b8" }}>After</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>{m.after}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#059669", width: 36, textAlign: "right" }}>{m.lift}</span>
                </div>
              </div>
            ))}

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginTop: 10, marginBottom: 6 }}>Go / No-Go Checklist</div>
            <div style={{ background: "#fff", borderRadius: 10, padding: 10, border: "1px solid rgba(217,119,6,0.08)" }}>
              {GO_NO_GO.map((g, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < GO_NO_GO.length - 1 ? "1px solid rgba(217,119,6,0.04)" : "none" }}>
                  <span style={{ fontSize: 9, color: "#374151", flex: 1 }}>{g.criteria}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: g.pass ? "#059669" : "#DC2626" }}>{g.actual}</span>
                    <span style={{ fontSize: 10, color: g.pass ? "#059669" : "#DC2626" }}>{g.pass ? "✓" : "✗"}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: "6px 8px", background: "rgba(5,150,105,0.06)", borderRadius: 6, textAlign: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#059669" }}>8/8 CRITERIA MET — GO FOR FULL DEPLOYMENT</span>
              </div>
            </div>
          </div>
        )}

        {tab === "roi" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #78350F, #92400E)", borderRadius: 14, padding: 14, marginBottom: 12, color: "#fff" }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>ANNUAL ROI PROJECTION</div>
              <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>$40.5M</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Combined pipeline recovery + productivity + optimization savings</div>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>82x</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>ROI Multiple</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>6 wks</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>Payback</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>$492K</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>Annual Cost</div>
                </div>
              </div>
            </div>

            {ROI_BREAKDOWN.map((r, i) => (
              <div key={i} onClick={() => setExpandedROI(expandedROI === i ? null : i)} style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{r.category}</div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>{r.annualValue}</span>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{r.detail}</p>
                {expandedROI === i && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(217,119,6,0.04)", borderRadius: 8, border: "1px dashed rgba(217,119,6,0.15)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#D97706", marginBottom: 3 }}>How This Works</div>
                    <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.5 }}>{r.mechanism}</p>
                  </div>
                )}
              </div>
            ))}

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginTop: 8, marginBottom: 6 }}>Stakeholder Impact</div>
            {STAKEHOLDER_IMPACT.map((s, i) => (
              <div key={i} onClick={() => setExpandedStake(expandedStake === i ? null : i)} style={{
                background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{s.role}</div>
                <p style={{ fontSize: 9, color: "#4b5563", margin: 0, lineHeight: 1.4, fontStyle: "italic" }}>"{s.quote}"</p>
                {expandedStake === i && (
                  <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    <div style={{ padding: "6px 8px", background: "rgba(220,38,38,0.04)", borderRadius: 6 }}>
                      <div style={{ fontSize: 7, fontWeight: 600, color: "#DC2626", marginBottom: 2 }}>BEFORE</div>
                      <div style={{ fontSize: 8, color: "#374151", lineHeight: 1.3 }}>{s.before}</div>
                    </div>
                    <div style={{ padding: "6px 8px", background: "rgba(5,150,105,0.04)", borderRadius: 6 }}>
                      <div style={{ fontSize: 7, fontWeight: 600, color: "#059669", marginBottom: 2 }}>AFTER</div>
                      <div style={{ fontSize: 8, color: "#374151", lineHeight: 1.3 }}>{s.after}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "rollout" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.08)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 6 }}>4-Phase Rollout</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: "38%", height: "100%", background: "linear-gradient(90deg, #D97706, #F59E0B)", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706" }}>38%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 8, color: "#94a3b8" }}>17 users active</span>
                <span style={{ fontSize: 8, color: "#94a3b8" }}>Target: 67+ by Week 16</span>
              </div>
            </div>

            {ROLLOUT_PLAN.map((p, i) => {
              const phaseColor = p.status === "complete" ? "#059669" : p.status === "active" ? "#2563EB" : "#94a3b8";
              const phaseBg = p.status === "complete" ? "rgba(5,150,105,0.08)" : p.status === "active" ? "rgba(37,99,235,0.08)" : "rgba(148,163,184,0.08)";
              return (
                <div key={i} style={{
                  background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  border: `1px solid ${p.status === "active" ? "rgba(37,99,235,0.2)" : "rgba(217,119,6,0.08)"}`,
                  boxShadow: p.status === "active" ? "0 2px 12px rgba(37,99,235,0.08)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.phase}</div>
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 6,
                      background: phaseBg, color: phaseColor, textTransform: "capitalize",
                    }}>{p.status}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
                    <div style={{ fontSize: 9, color: "#6b7280" }}>Users: <strong style={{ color: "#1e293b" }}>{p.users}</strong></div>
                    <div style={{ fontSize: 9, color: "#6b7280" }}>Timeline: <strong style={{ color: "#1e293b" }}>{p.timeline}</strong></div>
                  </div>
                  <div style={{ padding: "6px 8px", background: "rgba(217,119,6,0.04)", borderRadius: 6, marginBottom: 4 }}>
                    <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706", marginBottom: 2 }}>SCOPE</div>
                    <div style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{p.scope}</div>
                  </div>
                  <div style={{ padding: "6px 8px", background: phaseBg, borderRadius: 6 }}>
                    <div style={{ fontSize: 8, fontWeight: 600, color: phaseColor, marginBottom: 2 }}>
                      {p.status === "complete" ? "RESULTS" : p.status === "active" ? "PROGRESS" : "SUCCESS CRITERIA"}
                    </div>
                    <div style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{p.success}</div>
                  </div>
                </div>
              );
            })}

            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginTop: 4, border: "1px dashed rgba(217,119,6,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Cost Model</div>
              {[
                { item: "LLM API (GPT-4/Claude)", cost: "$0.42/run × 52 weeks", annual: "$21.8K" },
                { item: "Snowflake Compute", cost: "XS warehouse, 2 min/run", annual: "$8.4K" },
                { item: "LangSmith Tracing", cost: "Pro plan + storage", annual: "$12K" },
                { item: "Engineering Maintenance", cost: "0.5 FTE SRE time", annual: "$90K" },
                { item: "Infrastructure (AWS)", cost: "Agent runtime + storage", annual: "$36K" },
              ].map(c => (
                <div key={c.item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: "1px solid rgba(217,119,6,0.06)" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{c.item}</div>
                    <div style={{ fontSize: 7, color: "#94a3b8" }}>{c.cost}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#78350F" }}>{c.annual}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, padding: "6px 8px", background: "rgba(217,119,6,0.08)", borderRadius: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#78350F" }}>Total Annual Cost</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#D97706" }}>$168.2K</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(217,119,6,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "Annual ROI", val: "$40.5M", color: "#059669" },
          { label: "ROI Multiple", val: "82x", color: "#D97706" },
          { label: "Payback", val: "6 wks", color: "#78350F" },
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
