import { useState } from "react";

const DATA_SOURCES = [
  { name: "Salesforce CRM", type: "Pipeline & Revenue", records: "2.4M leads/yr", freshness: "Real-time", connected: false, issues: ["No campaign-to-agreement linkage", "Lead source field 68% blank or 'Web'", "Opportunity stage timestamps missing for 31% of records"], icon: "☁" },
  { name: "Marketo", type: "Campaign Engagement", records: "18M touchpoints/yr", freshness: "Batch (6h lag)", connected: false, issues: ["Email opens tracked but not tied to pipeline stage", "UTM parameters break at form submission", "Multi-touch journeys collapse to last-click"], icon: "📧" },
  { name: "Snowflake", type: "Historical Analytics", records: "4.2TB", freshness: "Daily ETL", connected: false, issues: ["Marketing and sales schemas in separate databases", "No unified customer ID across systems", "Historical campaign data pre-2024 missing attribution fields"], icon: "❄" },
  { name: "Docusign Platform", type: "Agreement Events", records: "680K agreements/yr", freshness: "Event-driven", connected: false, issues: ["Agreement signing events disconnected from originating campaign", "Expansion/renewal revenue not attributed to any marketing touch", "Cross-department usage (Legal, HR, Procurement) untracked"], icon: "✍" },
];

const PAIN_METRICS = [
  { label: "Unattributed Pipeline", value: "43%", detail: "43% of Docusign's $1.2B pipeline has no marketing attribution — the CMO cannot prove which campaigns drove nearly half the revenue.", color: "#DC2626" },
  { label: "Report Build Time", value: "23 hrs", detail: "Marketing analysts spend 23 hours per week manually stitching Salesforce, Marketo, and Snowflake data into attribution reports. By the time reports ship, decisions are already made.", color: "#D97706" },
  { label: "Campaign ROI Lag", value: "18 days", detail: "It takes 18 days after a campaign ends to know its pipeline impact. Performance marketers optimize blind for nearly 3 weeks.", color: "#D97706" },
  { label: "Data Accuracy", value: "62%", detail: "Only 62% of marketing-sourced opportunities have correct attribution. The rest are manually tagged, guessed, or left as 'Unknown Source'.", color: "#DC2626" },
];

const PERSONAS = [
  { role: "VP of Marketing", name: "Sarah Chen", pain: "I present to the board quarterly and I can't definitively say which of our $180M marketing spend actually drove agreements. I know our brand campaigns work — I just can't prove it with data the CFO trusts.", urgency: "critical", context: "Owns $180M annual marketing budget. Reports to CMO. Board asks 'What's our marketing ROI?' every quarter — and Sarah dreads the answer." },
  { role: "Marketing Ops Manager", name: "David Park", pain: "I spend Monday through Wednesday every week building the attribution report. By Thursday it's outdated. I'm basically a human ETL pipeline connecting Salesforce to Marketo to Snowflake.", urgency: "high", context: "Team of 3 analysts. 60% of their time goes to report building, not insight generation. Knows exactly where the data breaks — but lacks engineering support to fix it." },
  { role: "Performance Marketing Lead", name: "Priya Mehta", pain: "I'm optimizing $40M in paid spend based on last-click attribution because that's all we have. I know a prospect saw our whitepaper, attended a webinar, then clicked a retargeting ad — but I can only credit the ad.", urgency: "high", context: "Runs paid search, display, and LinkedIn campaigns. Has a hunch that top-of-funnel content drives more pipeline than the data shows — but can't prove it." },
  { role: "Field Sales Director", name: "Marcus Williams", pain: "Marketing says they sourced 60% of pipeline. My reps say they sourced 80%. We literally argue about this every QBR because the data supports both claims depending on how you define 'sourced'.", urgency: "medium", context: "Manages 45-person sales team. Attribution disputes erode trust between sales and marketing — costing alignment that directly impacts win rates." },
];

const FUNNEL_STAGES = [
  { stage: "Campaign Touchpoint", volume: "18M/yr", attributed: "100%", gap: "None — but 34% are duplicate/bot touches", color: "#D97706" },
  { stage: "Lead Created", volume: "420K/yr", attributed: "72%", gap: "28% of leads have no campaign source — created via direct, partner, or event channels that don't pass UTMs", color: "#D97706" },
  { stage: "MQL → SQL", volume: "84K/yr", attributed: "58%", gap: "Multi-touch journey collapses to single source. Nurture campaigns get zero credit despite 4.2 avg touches before conversion", color: "#F59E0B" },
  { stage: "Opportunity Created", volume: "31K/yr", attributed: "51%", gap: "Sales-created opportunities bypass marketing attribution entirely. Field events, referrals, and outbound get no marketing credit", color: "#EF4444" },
  { stage: "Agreement Signed", volume: "12.8K/yr", attributed: "43%", gap: "The attribution black hole: 57% of signed agreements have no traceable path back to marketing. Expansion deals are worst — 78% unattributed", color: "#DC2626" },
  { stage: "Expansion/Renewal", volume: "8.2K/yr", attributed: "22%", gap: "Customer marketing is almost completely dark. Renewal campaigns, upsell webinars, and advocacy programs have no revenue attribution", color: "#991B1B" },
];

const TOBE_CAPABILITIES = [
  { agent: "Data Ingestion Agent", desc: "Connects Salesforce, Marketo, Snowflake, and Docusign events into a unified customer journey graph. Validates data freshness, resolves identity, and flags quality issues automatically.", impact: "Eliminates 23 hrs/week of manual data stitching", icon: "🔗" },
  { agent: "Attribution Agent", desc: "Runs 5 attribution models simultaneously (first-touch, last-touch, linear, time-decay, W-shaped) and recommends the best model per campaign type. Self-calibrates against actual conversion data.", impact: "Attributes 94% of pipeline (vs 57% today)", icon: "📊" },
  { agent: "Insight Agent", desc: "Analyzes attribution outputs and generates natural-language insights: budget reallocation opportunities, underperforming channels, anomaly detection, and trend forecasting using LLM reasoning.", impact: "Replaces 18-day reporting lag with real-time insights", icon: "💡" },
  { agent: "Report Writer Agent", desc: "Auto-generates weekly marketing productivity reports with charts, key metrics, and executive summaries. Distributes to Slack, email, or Tableau. Adapts tone for different audiences (CMO vs analyst).", impact: "Saves 12 hrs/week in report creation and distribution", icon: "📝" },
];

export default function Sprint1AttributionGap() {
  const [view, setView] = useState("asis");
  const [expandedSource, setExpandedSource] = useState(null);
  const [expandedPersona, setExpandedPersona] = useState(null);
  const [expandedFunnel, setExpandedFunnel] = useState(null);

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
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#78350F", margin: 0 }}>Marketing Attribution Gap</h3>
            <p style={{ fontSize: 10, color: "#D97706", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 1 — Empathize + Define</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", margin: "0 16px 12px", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(217,119,6,0.15)" }}>
        {["asis", "tobe"].map(v => (
          <div key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "8px 0", textAlign: "center", cursor: "pointer",
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3, transition: "all 0.2s",
            background: view === v ? "#D97706" : "rgba(217,119,6,0.04)",
            color: view === v ? "#fff" : "#92400E",
          }}>{v === "asis" ? "AS-IS: The Black Hole" : "TO-BE: AI Agent System"}</div>
        ))}
      </div>

      <div style={{ padding: "0 16px 18px", minHeight: 440, maxHeight: 520, overflowY: "auto" }}>
        {view === "asis" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 4 }}>The Attribution Black Hole</div>
              <p style={{ fontSize: 10, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
                Docusign processes 680K agreements annually across every department — sales, legal, HR, procurement, finance. Marketing spends $180M/year driving demand, but 43% of the resulting pipeline has <strong>zero attribution</strong>. Four disconnected systems hold pieces of the customer journey, and no AI stitches them together.
              </p>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Pain Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              {PAIN_METRICS.map(m => (
                <div key={m.label} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(217,119,6,0.08)" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 8, color: "#92400E", fontWeight: 600, marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 8, color: "#78350F", lineHeight: 1.4, opacity: 0.7 }}>{m.detail}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Disconnected Data Sources</div>
            {DATA_SOURCES.map((src, i) => (
              <div key={i} onClick={() => setExpandedSource(expandedSource === i ? null : i)} style={{
                background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
                boxShadow: expandedSource === i ? "0 3px 12px rgba(217,119,6,0.1)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{src.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{src.name}</div>
                      <div style={{ fontSize: 8, color: "#94a3b8" }}>{src.type} · {src.records}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 6, background: "rgba(220,38,38,0.08)", color: "#DC2626" }}>Siloed</span>
                </div>
                {expandedSource === i && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(217,119,6,0.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#D97706", marginBottom: 4 }}>Data Gaps</div>
                    {src.issues.map((issue, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 8, color: "#DC2626", marginTop: 1 }}>✗</span>
                        <span style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginTop: 10, marginBottom: 6 }}>Attribution Decay Funnel</div>
            <div style={{ background: "#fff", borderRadius: 10, padding: 10, border: "1px solid rgba(217,119,6,0.08)", marginBottom: 12 }}>
              {FUNNEL_STAGES.map((f, i) => (
                <div key={i} onClick={() => setExpandedFunnel(expandedFunnel === i ? null : i)} style={{ cursor: "pointer", marginBottom: i < FUNNEL_STAGES.length - 1 ? 6 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#374151" }}>{f.stage}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 8, color: "#6b7280" }}>{f.volume}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, color: f.color }}>{f.attributed} attributed</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: f.attributed, height: "100%", background: f.color, borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  {expandedFunnel === i && (
                    <div style={{ marginTop: 4, padding: "6px 8px", background: "rgba(217,119,6,0.04)", borderRadius: 6 }}>
                      <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.4 }}>{f.gap}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Stakeholder Pain Map</div>
            {PERSONAS.map((p, i) => (
              <div key={i} onClick={() => setExpandedPersona(expandedPersona === i ? null : i)} style={{
                background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6,
                border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{p.role}</div>
                    <div style={{ fontSize: 8, color: "#94a3b8" }}>{p.name}</div>
                  </div>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "3px 6px", borderRadius: 6, textTransform: "uppercase",
                    background: p.urgency === "critical" ? "rgba(220,38,38,0.08)" : p.urgency === "high" ? "rgba(217,119,6,0.08)" : "rgba(100,116,139,0.08)",
                    color: p.urgency === "critical" ? "#DC2626" : p.urgency === "high" ? "#D97706" : "#64748b",
                  }}>{p.urgency}</span>
                </div>
                <p style={{ fontSize: 10, color: "#4b5563", margin: "6px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>"{p.pain}"</p>
                {expandedPersona === i && (
                  <div style={{ marginTop: 6, padding: "6px 8px", background: "rgba(217,119,6,0.04)", borderRadius: 6 }}>
                    <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.4 }}>{p.context}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {view === "tobe" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #78350F, #92400E)", borderRadius: 14, padding: 14, marginBottom: 12, color: "#fff" }}>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, marginBottom: 4, letterSpacing: 0.5 }}>THE VISION</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>AI Marketing Attribution & Insight Agent</div>
              <p style={{ fontSize: 10, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
                A multi-agent AI system built with LangGraph + CrewAI that ingests marketing data from Salesforce, Marketo, Snowflake, and Docusign — runs multi-touch attribution analysis — and generates natural-language insights and weekly reports. Automatically. Without analyst involvement.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              {[
                { label: "Attribution Coverage", before: "57%", after: "94%", color: "#059669" },
                { label: "Report Delivery", before: "18 days", after: "Real-time", color: "#059669" },
                { label: "Analyst Hours/Week", before: "23 hrs", after: "4 hrs", color: "#059669" },
                { label: "Model Types", before: "1 (last-click)", after: "5 simultaneous", color: "#D97706" },
              ].map(m => (
                <div key={m.label} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(217,119,6,0.08)" }}>
                  <div style={{ fontSize: 8, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, color: "#DC2626", textDecoration: "line-through", opacity: 0.6 }}>{m.before}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>→</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: m.color }}>{m.after}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>The 4-Agent System</div>
            {TOBE_CAPABILITIES.map((cap, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid rgba(217,119,6,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, background: "rgba(217,119,6,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>{cap.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{cap.agent}</div>
                    <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706" }}>{cap.impact}</div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: "#4b5563", margin: 0, lineHeight: 1.5 }}>{cap.desc}</p>
              </div>
            ))}

            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginTop: 8, border: "1px dashed rgba(217,119,6,0.2)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Tech Stack Alignment</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {[
                  { tool: "LangGraph", use: "Agent orchestration & state graphs" },
                  { tool: "CrewAI", use: "Multi-agent collaboration" },
                  { tool: "LangSmith", use: "Tracing & evaluation" },
                  { tool: "Snowflake", use: "Data warehouse queries" },
                  { tool: "Salesforce", use: "CRM pipeline data" },
                  { tool: "SQL", use: "Data validation & quality" },
                ].map(t => (
                  <div key={t.tool} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 0" }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#D97706", width: 60 }}>{t.tool}</span>
                    <span style={{ fontSize: 8, color: "#374151" }}>{t.use}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: 12, marginTop: 8, border: "1px solid rgba(217,119,6,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Connected Data Flow</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { from: "Salesforce + Marketo + Snowflake + Docusign", to: "Data Ingestion Agent", arrow: true },
                  { from: "Unified Customer Journey Graph", to: "Attribution Agent", arrow: true },
                  { from: "5 Attribution Models (auto-selected)", to: "Insight Agent", arrow: true },
                  { from: "Natural-Language Insights", to: "Report Writer Agent", arrow: true },
                  { from: "Weekly Report → Slack / Email / Tableau", to: "", arrow: false },
                ].map((step, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, background: i < 4 ? "#D97706" : "#059669",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, color: "#fff", fontWeight: 800, flexShrink: 0,
                      }}>{i + 1}</div>
                      <span style={{ fontSize: 9, color: "#374151", fontWeight: 600 }}>{step.from}</span>
                    </div>
                    {step.arrow && (
                      <div style={{ marginLeft: 7, borderLeft: "1.5px dashed rgba(217,119,6,0.3)", height: 8 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(217,119,6,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "Unattributed", val: "43%", color: "#DC2626" },
          { label: "Sources", val: "4 Siloed", color: "#78350F" },
          { label: "Weekly Hrs", val: "23", color: "#D97706" },
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
