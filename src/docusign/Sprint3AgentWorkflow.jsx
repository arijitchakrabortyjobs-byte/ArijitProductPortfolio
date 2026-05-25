import { useState } from "react";

const WORKFLOW_STEPS = [
  {
    agent: "Data Ingestion Agent",
    icon: "🔗",
    status: "complete",
    duration: "38s",
    tokens: "2,140",
    input: "Triggered Monday 2:00 AM PST — weekly scheduled run #47",
    steps: [
      { action: "Salesforce Extract", detail: "Pulled 8,421 leads, 3,218 opportunities, 1,847 accounts from last 7 days", status: "ok", latency: "6.2s" },
      { action: "Marketo Sync", detail: "Ingested 142,891 email events, 23,410 form submissions, 8,204 page visits", status: "ok", latency: "11.4s" },
      { action: "Snowflake Query", detail: "Ran 4 SQL queries against campaign_performance and revenue_attribution tables (4.2TB warehouse)", status: "ok", latency: "8.1s" },
      { action: "Docusign Events", detail: "Fetched 1,284 agreement events: 891 signed, 247 viewed, 146 voided/declined", status: "ok", latency: "3.8s" },
      { action: "Identity Resolution", detail: "Matched 97.8% of records across systems. 412 new identities created. 23 conflicts flagged for review.", status: "warn", latency: "8.7s" },
    ],
    output: "Unified Customer Journey Graph: 14,291 unique contacts with 186,209 touchpoints across 4 systems. Data quality score: 96.4%",
  },
  {
    agent: "Attribution Agent",
    icon: "📊",
    status: "complete",
    duration: "24s",
    tokens: "4,820",
    input: "Received unified graph with 14,291 contacts and 186,209 touchpoints",
    steps: [
      { action: "First Touch Model", detail: "Attributed 3,218 opportunities. Top source: Organic Search (34%), LinkedIn Ads (22%), Webinar Series (18%)", status: "ok", latency: "4.1s" },
      { action: "Last Touch Model", detail: "Attributed 3,218 opportunities. Top source: Sales Email (29%), Retargeting (24%), Demo Request Page (19%)", status: "ok", latency: "3.8s" },
      { action: "Linear Model", detail: "Distributed credit across avg 6.2 touches per opportunity. Nurture emails get 4x more credit than in last-touch", status: "ok", latency: "4.6s" },
      { action: "Time Decay Model", detail: "Half-life: 14 days. Recent webinar series gets 3.2x more credit than Q1 brand campaign", status: "ok", latency: "4.2s" },
      { action: "W-Shaped Model", detail: "40/20/40 split across first-touch, MQL, opportunity-create. Enterprise segment shows clearest W-pattern", status: "ok", latency: "3.9s" },
      { action: "Bayesian Model Selector", detail: "Auto-selected: Brand campaigns → Time Decay (89% conf), Webinars → W-Shaped (92% conf), Paid → Last Touch (94% conf)", status: "ok", latency: "3.4s" },
    ],
    output: "Attribution complete: 94.2% of pipeline attributed (up from 57%). Avg model confidence: 88.6%. 186 campaigns scored across 5 models.",
  },
  {
    agent: "Insight Agent",
    icon: "💡",
    status: "complete",
    duration: "31s",
    tokens: "8,240",
    input: "Attribution scores for 186 campaigns across 5 models + $180M budget allocation + Q1-Q2 historical data",
    steps: [
      { action: "Anomaly Detection", detail: "3 anomalies found: LinkedIn CPL spiked 340% (audience saturation), webinar attendance dropped 28% (topic fatigue), SMB segment attribution gap widened", status: "warn", latency: "6.8s" },
      { action: "Budget Optimizer", detail: "Recommends reallocating $4.2M: -$2.8M display (0.3x ROAS) → +$1.6M content syndication (2.1x ROAS) + $1.2M webinar series (1.8x ROAS)", status: "ok", latency: "8.2s" },
      { action: "Trend Forecaster", detail: "Enterprise pipeline trending +18% QoQ driven by analyst report mentions. SMB pipeline flat — needs attention.", status: "ok", latency: "7.4s" },
      { action: "Insight Ranker", detail: "Generated 14 insights, ranked by actionability × confidence × revenue impact. Top 3 flagged as P0.", status: "ok", latency: "8.6s" },
    ],
    output: "14 insights generated. Top insight: 'Webinar series drove 34% of enterprise pipeline but receives only 12% of budget — reallocating $2M yields estimated 18% pipeline increase.' Confidence: 91%.",
  },
  {
    agent: "Report Writer Agent",
    icon: "📝",
    status: "complete",
    duration: "18s",
    tokens: "6,180",
    input: "14 ranked insights + attribution data + historical comparisons + 3 audience profiles (CMO, Ops, Analyst)",
    steps: [
      { action: "Executive Brief", detail: "1-page CMO summary: 3 key metrics, top 3 insights, 1 action item. Reading level: executive. Tone: strategic.", status: "ok", latency: "5.2s" },
      { action: "Operational Report", detail: "5-page marketing ops report: channel performance, budget efficiency, campaign rankings, 14 insights with evidence. Tone: analytical.", status: "ok", latency: "6.4s" },
      { action: "Analyst Deep-Dive", detail: "12-page data appendix: model outputs, confidence intervals, SQL query results, methodology notes. Tone: technical.", status: "ok", latency: "4.1s" },
      { action: "Distribution", detail: "Slack #marketing-insights: summary posted. Email: CMO brief → Sarah Chen, Ops report → David Park, Deep-dive → Analytics team.", status: "ok", latency: "2.3s" },
    ],
    output: "3 reports generated and distributed. Slack summary posted at 2:02 AM. Email delivery confirmed for 8:00 AM. Total workflow: 1 min 51 sec.",
  },
];

const LANGSMITH_TRACE = [
  { span: "weekly_attribution_run_#47", type: "chain", duration: "1m 51s", tokens: "21,380", cost: "$0.42", status: "success" },
  { span: "├─ data_ingestion_agent", type: "agent", duration: "38s", tokens: "2,140", cost: "$0.04", status: "success" },
  { span: "│  ├─ salesforce_extract", type: "tool", duration: "6.2s", tokens: "—", cost: "—", status: "success" },
  { span: "│  ├─ marketo_sync", type: "tool", duration: "11.4s", tokens: "—", cost: "—", status: "success" },
  { span: "│  ├─ snowflake_query", type: "tool", duration: "8.1s", tokens: "—", cost: "—", status: "success" },
  { span: "│  ├─ docusign_events", type: "tool", duration: "3.8s", tokens: "—", cost: "—", status: "success" },
  { span: "│  └─ identity_resolution", type: "tool", duration: "8.7s", tokens: "—", cost: "—", status: "warn" },
  { span: "├─ quality_gate", type: "conditional", duration: "0.1s", tokens: "—", cost: "—", status: "pass: 96.4%" },
  { span: "├─ attribution_agent", type: "agent", duration: "24s", tokens: "4,820", cost: "$0.10", status: "success" },
  { span: "├─ confidence_gate", type: "conditional", duration: "0.1s", tokens: "—", cost: "—", status: "pass: 88.6%" },
  { span: "├─ insight_agent", type: "agent", duration: "31s", tokens: "8,240", cost: "$0.16", status: "success" },
  { span: "└─ report_writer_agent", type: "agent", duration: "18s", tokens: "6,180", cost: "$0.12", status: "success" },
];

const WEEKLY_INSIGHTS = [
  { rank: 1, priority: "P0", insight: "Webinar series drove 34% of enterprise pipeline but receives only 12% of budget. Reallocating $2M from display ads yields estimated 18% pipeline increase.", confidence: 91, impact: "$8.4M pipeline", category: "Budget" },
  { rank: 2, priority: "P0", insight: "LinkedIn CPL spiked 340% this week — audience of 'IT Decision Makers' is saturated after 6 months. Recommend rotating to 'Digital Transformation Leaders' audience.", confidence: 87, impact: "$1.2M savings", category: "Channel" },
  { rank: 3, priority: "P0", insight: "SMB segment attribution gap widened to 52% unattributed. Root cause: SMB buyers self-serve through website → trial → purchase without touching marketing-tracked channels.", confidence: 84, impact: "$12M dark pipeline", category: "Gap" },
  { rank: 4, priority: "P1", insight: "Content syndication ROAS is 2.1x but only receives 4% of budget. Top-performing content: 'State of Agreement Management 2026' white paper (1,840 MQLs).", confidence: 89, impact: "$3.2M pipeline", category: "Content" },
  { rank: 5, priority: "P1", insight: "First-touch attribution shows organic search drives 34% of all new leads — but SEO team headcount was cut 40% in Q1. Recommend reversing.", confidence: 92, impact: "$5.1M pipeline at risk", category: "Organic" },
];

export default function Sprint3AgentWorkflow() {
  const [tab, setTab] = useState("workflow");
  const [expandedStep, setExpandedStep] = useState(null);
  const [expandedInsight, setExpandedInsight] = useState(null);

  const statusIcon = (s) => s === "ok" ? "✓" : s === "warn" ? "⚠" : "✗";
  const statusColor = (s) => s === "ok" || s === "success" ? "#059669" : s === "warn" ? "#D97706" : "#DC2626";

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
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#78350F", margin: 0 }}>Agent Workflow</h3>
            <p style={{ fontSize: 10, color: "#D97706", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 3 — Build + Trace</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(217,119,6,0.08)" }}>
        {[
          { key: "workflow", label: "Live Run" },
          { key: "trace", label: "LangSmith Trace" },
          { key: "output", label: "Weekly Insights" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#D97706" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #D97706" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", minHeight: 440, maxHeight: 500, overflowY: "auto" }}>
        {tab === "workflow" && (
          <div>
            <div style={{ background: "rgba(5,150,105,0.06)", borderRadius: 12, padding: 10, marginBottom: 12, border: "1px solid rgba(5,150,105,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#064e3b" }}>Run #47 — Complete</div>
                  <div style={{ fontSize: 9, color: "#059669" }}>Monday, May 19 · 2:00 AM PST</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#059669" }}>1m 51s</div>
                  <div style={{ fontSize: 8, color: "#6b7280" }}>21,380 tokens · $0.42</div>
                </div>
              </div>
            </div>

            {WORKFLOW_STEPS.map((step, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div onClick={() => setExpandedStep(expandedStep === i ? null : i)} style={{
                  background: "#fff", borderRadius: 12, padding: "10px 12px",
                  border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
                  boxShadow: expandedStep === i ? "0 3px 12px rgba(217,119,6,0.1)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{step.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{step.agent}</div>
                        <div style={{ fontSize: 8, color: "#6b7280" }}>{step.duration} · {step.tokens} tokens</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 6, background: "rgba(5,150,105,0.08)", color: "#059669" }}>Complete</span>
                  </div>

                  {expandedStep === i && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ padding: "6px 8px", background: "rgba(217,119,6,0.04)", borderRadius: 6, marginBottom: 6 }}>
                        <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706" }}>INPUT</div>
                        <div style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{step.input}</div>
                      </div>
                      {step.steps.map((s, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "4px 0", borderBottom: j < step.steps.length - 1 ? "1px solid rgba(217,119,6,0.06)" : "none" }}>
                          <span style={{ fontSize: 9, color: statusColor(s.status), marginTop: 1 }}>{statusIcon(s.status)}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{s.action} <span style={{ color: "#94a3b8", fontWeight: 400 }}>({s.latency})</span></div>
                            <div style={{ fontSize: 8, color: "#6b7280", lineHeight: 1.3 }}>{s.detail}</div>
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "6px 8px", background: "rgba(5,150,105,0.04)", borderRadius: 6, marginTop: 6 }}>
                        <div style={{ fontSize: 8, fontWeight: 600, color: "#059669" }}>OUTPUT</div>
                        <div style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{step.output}</div>
                      </div>
                    </div>
                  )}
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", marginLeft: 22, height: 8 }}>
                    <div style={{ width: 1.5, height: "100%", background: "rgba(217,119,6,0.2)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "trace" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>LangSmith Trace View</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                Every agent call, tool invocation, and LLM request is traced in LangSmith. This provides full observability: token usage, latency, cost tracking, and the ability to replay any run for debugging. Evaluations run against each trace to measure quality.
              </p>
            </div>

            <div style={{ background: "#1e293b", borderRadius: 12, padding: 10, fontFamily: "'JetBrains Mono', monospace" }}>
              {LANGSMITH_TRACE.map((t, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "4px 0",
                  borderBottom: i < LANGSMITH_TRACE.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 8,
                      color: t.type === "chain" ? "#fbbf24" : t.type === "agent" ? "#93c5fd" : t.type === "tool" ? "#86efac" : "#c4b5fd",
                      fontWeight: t.type === "chain" ? 700 : 400,
                    }}>{t.span}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 7, color: "#94a3b8", width: 36, textAlign: "right" }}>{t.duration}</span>
                    <span style={{ fontSize: 7, color: "#6b7280", width: 36, textAlign: "right" }}>{t.tokens}</span>
                    <span style={{
                      fontSize: 7, width: 28, textAlign: "right", fontWeight: 600,
                      color: t.status === "success" || t.status?.startsWith("pass") ? "#4ade80" : t.status === "warn" ? "#fbbf24" : "#94a3b8",
                    }}>{t.status === "success" ? "✓" : t.status?.startsWith("pass") ? "✓" : t.status === "warn" ? "⚠" : "—"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
              {[
                { label: "Total Tokens", val: "21,380", sub: "input: 14,200 · output: 7,180" },
                { label: "Total Cost", val: "$0.42", sub: "avg $0.38/run over 47 runs" },
                { label: "P95 Latency", val: "2m 04s", sub: "target < 3 min" },
                { label: "Success Rate", val: "97.8%", sub: "1 retry in 47 runs" },
              ].map(m => (
                <div key={m.label} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(217,119,6,0.08)" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#78350F" }}>{m.val}</div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706" }}>{m.label}</div>
                  <div style={{ fontSize: 7, color: "#94a3b8", marginTop: 1 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: 10, marginTop: 8, border: "1px solid rgba(217,119,6,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Evaluation Hooks</div>
              {[
                { eval: "Data Completeness", score: "96.4%", threshold: "> 95%", pass: true },
                { eval: "Identity Match Rate", score: "97.8%", threshold: "> 95%", pass: true },
                { eval: "Attribution Coverage", score: "94.2%", threshold: "> 90%", pass: true },
                { eval: "Model Confidence", score: "88.6%", threshold: "> 80%", pass: true },
                { eval: "Insight Actionability", score: "73%", threshold: "> 60%", pass: true },
                { eval: "Hallucination Check", score: "0 found", threshold: "0 tolerance", pass: true },
              ].map(e => (
                <div key={e.eval} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", borderBottom: "1px solid rgba(217,119,6,0.04)" }}>
                  <span style={{ fontSize: 9, color: "#374151" }}>{e.eval}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: "#6b7280" }}>{e.threshold}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: e.pass ? "#059669" : "#DC2626" }}>{e.score}</span>
                    <span style={{ fontSize: 8, color: e.pass ? "#059669" : "#DC2626" }}>{e.pass ? "✓" : "✗"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "output" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #78350F, #92400E)", borderRadius: 14, padding: 14, marginBottom: 12, color: "#fff" }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, letterSpacing: 0.5 }}>WEEKLY MARKETING INTELLIGENCE</div>
              <div style={{ fontSize: 15, fontWeight: 800, margin: "4px 0 2px" }}>Week of May 19, 2026</div>
              <div style={{ fontSize: 9, opacity: 0.7 }}>Auto-generated by Insight Agent + Report Writer Agent</div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>14</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>Insights</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>3</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>P0 Actions</div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>94.2%</div>
                  <div style={{ fontSize: 8, opacity: 0.7 }}>Attributed</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Top Insights (Ranked by Impact)</div>
            {WEEKLY_INSIGHTS.map((ins, i) => (
              <div key={i} onClick={() => setExpandedInsight(expandedInsight === i ? null : i)} style={{
                background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                border: `1px solid ${ins.priority === "P0" ? "rgba(217,119,6,0.15)" : "rgba(217,119,6,0.08)"}`,
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4,
                      background: ins.priority === "P0" ? "rgba(217,119,6,0.1)" : "rgba(100,116,139,0.08)",
                      color: ins.priority === "P0" ? "#D97706" : "#64748b",
                    }}>{ins.priority}</span>
                    <span style={{ fontSize: 8, padding: "2px 5px", borderRadius: 4, background: "rgba(217,119,6,0.06)", color: "#92400E", fontWeight: 600 }}>{ins.category}</span>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#059669" }}>{ins.impact}</span>
                </div>
                <p style={{ fontSize: 10, color: "#374151", margin: 0, lineHeight: 1.5 }}>{ins.insight}</p>
                {expandedInsight === i && (
                  <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, padding: "4px 6px", background: "rgba(217,119,6,0.04)", borderRadius: 6, textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#D97706" }}>{ins.confidence}%</div>
                      <div style={{ fontSize: 7, color: "#6b7280" }}>Confidence</div>
                    </div>
                    <div style={{ flex: 1, padding: "4px 6px", background: "rgba(5,150,105,0.04)", borderRadius: 6, textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>#{ins.rank}</div>
                      <div style={{ fontSize: 7, color: "#6b7280" }}>Impact Rank</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 10, padding: 10, marginTop: 4, border: "1px dashed rgba(217,119,6,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 4 }}>Report Distribution</div>
              {[
                { variant: "CMO Executive Brief", recipient: "Sarah Chen (VP Marketing)", status: "Delivered 8:00 AM", icon: "📧" },
                { variant: "Ops Report", recipient: "David Park (Marketing Ops)", status: "Delivered 8:00 AM", icon: "📧" },
                { variant: "Analyst Deep-Dive", recipient: "Analytics Team (6 people)", status: "Delivered 8:00 AM", icon: "📧" },
                { variant: "Slack Summary", recipient: "#marketing-insights", status: "Posted 2:02 AM", icon: "💬" },
              ].map(r => (
                <div key={r.variant} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                  <span style={{ fontSize: 10 }}>{r.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{r.variant}</div>
                    <div style={{ fontSize: 8, color: "#6b7280" }}>{r.recipient}</div>
                  </div>
                  <span style={{ fontSize: 7, color: "#059669", fontWeight: 600 }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(217,119,6,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "Run Time", val: "1m 51s", color: "#D97706" },
          { label: "Cost/Run", val: "$0.42", color: "#78350F" },
          { label: "Insights", val: "14", color: "#059669" },
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
