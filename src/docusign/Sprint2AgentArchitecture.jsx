import { useState } from "react";

const AGENTS = [
  {
    id: "ingestion",
    name: "Data Ingestion Agent",
    role: "The Connector",
    goal: "Unify marketing data from 4 siloed systems into a single customer journey graph with validated identity resolution",
    backstory: "In a world where Salesforce holds pipeline data, Marketo holds engagement data, Snowflake holds historical analytics, and Docusign holds agreement events — this agent is the bridge. It speaks SQL, understands API schemas, and resolves customer identities across systems where the same person might be 'sarah.chen@acme.com' in Marketo, 'Lead-00847291' in Salesforce, and 'Account #4821' in Snowflake.",
    tools: ["Salesforce REST API", "Marketo Bulk Extract", "Snowflake SQL Connector", "Docusign Events API", "Identity Resolution Engine"],
    inputs: "Raw data from 4 source systems + data quality rules",
    outputs: "Unified Customer Journey Graph (JSON) + Data Quality Report",
    metrics: { latency: "< 45s", freshness: "≤ 6hr lag", coverage: "98.2% identity match" },
    icon: "🔗",
    color: "#2563EB",
  },
  {
    id: "attribution",
    name: "Attribution Agent",
    role: "The Analyst",
    goal: "Run 5 attribution models simultaneously and recommend the optimal model per campaign type based on statistical confidence",
    backstory: "Marketing attribution is not one-size-fits-all. A brand awareness webinar series deserves time-decay attribution (early touches matter more as awareness builds). A bottom-funnel retargeting campaign should use last-click (the final push matters most). This agent doesn't just run models — it understands which model to trust for which campaign type, and explains why.",
    tools: ["Multi-Touch Attribution Engine", "Statistical Confidence Calculator", "Campaign Type Classifier", "Bayesian Model Selector"],
    inputs: "Unified Customer Journey Graph from Agent 1",
    outputs: "Attribution scores per campaign/channel/content + Model confidence scores + Model recommendation",
    metrics: { models: "5 simultaneous", coverage: "94% pipeline attributed", confidence: "87% avg model confidence" },
    icon: "📊",
    color: "#D97706",
  },
  {
    id: "insight",
    name: "Insight Agent",
    role: "The Strategist",
    goal: "Analyze attribution data and generate actionable natural-language insights that a human analyst would take hours to discover",
    backstory: "Raw attribution data is useless to a VP of Marketing. They don't want to see that Campaign X had a 0.34 attribution weight on Opportunity Y. They want to know: 'Your Q2 webinar series drove 34% of enterprise pipeline but received only 12% of budget — reallocating $2M from underperforming display ads would yield an estimated 18% pipeline increase.' This agent thinks like a senior marketing strategist, not a data engineer.",
    tools: ["LLM Reasoning Chain (GPT-4/Claude)", "Anomaly Detection", "Trend Forecaster", "Budget Optimizer", "Competitive Benchmark"],
    inputs: "Attribution scores + Historical performance data + Budget allocation",
    outputs: "Ranked insight cards with confidence scores + Budget reallocation recommendations + Anomaly alerts",
    metrics: { insights: "12-18 per week", actionability: "73% acted upon", accuracy: "91% insight validity" },
    icon: "💡",
    color: "#7C3AED",
  },
  {
    id: "reporter",
    name: "Report Writer Agent",
    role: "The Communicator",
    goal: "Auto-generate formatted weekly marketing productivity reports tailored to different audiences — from CMO executive summary to analyst deep-dive",
    backstory: "The last mile of marketing intelligence is communication. A brilliant insight buried in a 40-page deck is worthless. This agent generates three report variants: a 1-page executive brief for the CMO (key metrics, top 3 insights, one action item), a 5-page operational report for marketing ops (channel performance, budget efficiency, campaign rankings), and a detailed data appendix for analysts. It also pushes summaries to Slack and schedules follow-up emails.",
    tools: ["LLM Report Generator", "Chart Builder (Recharts/Tableau)", "Slack API", "Email Formatter", "Audience Tone Adapter"],
    inputs: "Insights + Attribution data + Historical comparisons",
    outputs: "3 report variants (Executive / Operational / Analyst) + Slack summary + Email distribution",
    metrics: { delivery: "Every Monday 8 AM", formats: "3 audience variants", satisfaction: "4.6/5 reader rating" },
    icon: "📝",
    color: "#059669",
  },
];

const STATE_GRAPH = {
  nodes: [
    { id: "start", label: "START", type: "control", desc: "Triggered weekly (Monday 2 AM) or on-demand via Slack command" },
    { id: "ingest", label: "Data Ingestion", type: "agent", agent: "ingestion", desc: "Pull from Salesforce, Marketo, Snowflake, Docusign. Resolve identities. Validate quality." },
    { id: "quality_check", label: "Quality Gate", type: "conditional", desc: "IF data completeness > 95% AND freshness < 6h → proceed. ELSE → retry with backfill or alert ops." },
    { id: "attribute", label: "Attribution Engine", type: "agent", agent: "attribution", desc: "Run 5 models. Score campaigns. Select best model per campaign type. Calculate confidence." },
    { id: "confidence_check", label: "Confidence Gate", type: "conditional", desc: "IF avg model confidence > 80% → proceed to insights. ELSE → rerun with alternative parameters or flag for human review." },
    { id: "analyze", label: "Insight Generation", type: "agent", agent: "insight", desc: "Analyze attribution. Detect anomalies. Generate natural-language insights. Rank by actionability." },
    { id: "report", label: "Report Writing", type: "agent", agent: "reporter", desc: "Generate 3 report variants. Build charts. Push to Slack. Schedule email delivery." },
    { id: "trace", label: "LangSmith Trace", type: "observability", desc: "Every node logs to LangSmith: token usage, latency, input/output pairs, evaluation scores. Full audit trail." },
    { id: "end", label: "DELIVERED", type: "control", desc: "Reports distributed. Slack summary posted. LangSmith trace complete. Ready for human feedback loop." },
  ],
  edges: [
    { from: "start", to: "ingest", label: "trigger" },
    { from: "ingest", to: "quality_check", label: "data ready" },
    { from: "quality_check", to: "attribute", label: "pass (>95%)", condition: true },
    { from: "quality_check", to: "ingest", label: "fail — retry", condition: true },
    { from: "attribute", to: "confidence_check", label: "models scored" },
    { from: "confidence_check", to: "analyze", label: "pass (>80%)", condition: true },
    { from: "confidence_check", to: "attribute", label: "low confidence — rerun", condition: true },
    { from: "analyze", to: "report", label: "insights ranked" },
    { from: "report", to: "end", label: "distributed" },
  ],
};

const ATTRIBUTION_MODELS = [
  { name: "First Touch", weight: "100% to first interaction", bestFor: "Brand awareness campaigns, top-of-funnel content", example: "Prospect reads Docusign blog post → later signs up for demo → First Touch credits the blog 100%", color: "#2563EB" },
  { name: "Last Touch", weight: "100% to final interaction", bestFor: "Bottom-funnel retargeting, sales enablement", example: "After 8 touches, prospect clicks retargeting ad → signs deal → Last Touch credits the ad 100%", color: "#D97706" },
  { name: "Linear", weight: "Equal credit to all touches", bestFor: "Long enterprise sales cycles with consistent nurture", example: "Blog → Webinar → Email → Demo → Deal: each gets 25% credit", color: "#7C3AED" },
  { name: "Time Decay", weight: "More credit to recent touches", bestFor: "Campaigns where recency drives conversion", example: "Touch 6 months ago gets 5% credit, touch last week gets 40% — rewards recent acceleration", color: "#059669" },
  { name: "W-Shaped", weight: "40/20/40 to first, lead-create, opportunity-create", bestFor: "B2B SaaS with defined funnel stages", example: "First blog visit (40%) + MQL form fill (20%) + Sales-accepted meeting (40%) — credits the milestones", color: "#DC2626" },
];

export default function Sprint2AgentArchitecture() {
  const [tab, setTab] = useState("agents");
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [expandedNode, setExpandedNode] = useState(null);
  const [expandedModel, setExpandedModel] = useState(null);

  const nodeColor = (type) => type === "agent" ? "#D97706" : type === "conditional" ? "#7C3AED" : type === "observability" ? "#2563EB" : "#374151";
  const nodeBg = (type) => type === "agent" ? "rgba(217,119,6,0.08)" : type === "conditional" ? "rgba(124,58,237,0.08)" : type === "observability" ? "rgba(37,99,235,0.08)" : "rgba(55,65,81,0.08)";

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
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#78350F", margin: 0 }}>Agent Architecture</h3>
            <p style={{ fontSize: 10, color: "#D97706", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 2 — Ideate + Prototype</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(217,119,6,0.08)" }}>
        {[
          { key: "agents", label: "Agent Roles" },
          { key: "graph", label: "LangGraph Flow" },
          { key: "models", label: "Attribution Models" },
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
        {tab === "agents" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>Multi-Agent Crew (CrewAI)</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>4 specialized agents collaborate via LangGraph state management. Each agent has a defined role, goal, tools, and backstory — following CrewAI's agent design pattern. The crew operates autonomously with human-in-the-loop escalation for low-confidence scenarios.</p>
            </div>

            {AGENTS.map((agent, i) => (
              <div key={agent.id} onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)} style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: `1px solid ${expandedAgent === agent.id ? agent.color + "30" : "rgba(217,119,6,0.08)"}`,
                cursor: "pointer", boxShadow: expandedAgent === agent.id ? `0 4px 16px ${agent.color}15` : "none",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: `${agent.color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>{agent.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{agent.name}</div>
                      <span style={{ fontSize: 8, fontWeight: 700, color: agent.color, padding: "2px 6px", background: `${agent.color}10`, borderRadius: 4 }}>Agent {i + 1}</span>
                    </div>
                    <div style={{ fontSize: 9, color: agent.color, fontWeight: 600 }}>{agent.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: "0 0 6px", lineHeight: 1.4 }}>
                  <strong style={{ color: "#374151" }}>Goal:</strong> {agent.goal}
                </p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Object.entries(agent.metrics).map(([k, v]) => (
                    <span key={k} style={{ fontSize: 7, padding: "2px 5px", borderRadius: 4, background: `${agent.color}08`, color: agent.color, fontWeight: 700 }}>
                      {k}: {v}
                    </span>
                  ))}
                </div>

                {expandedAgent === agent.id && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ padding: "8px 10px", background: "rgba(217,119,6,0.04)", borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#78350F", marginBottom: 3 }}>Backstory (CrewAI)</div>
                      <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.5 }}>{agent.backstory}</p>
                    </div>
                    <div style={{ padding: "8px 10px", background: "rgba(217,119,6,0.04)", borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#78350F", marginBottom: 3 }}>Tools</div>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {agent.tools.map(t => (
                          <span key={t} style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: "#fff", border: "1px solid rgba(217,119,6,0.12)", color: "#374151" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      <div style={{ padding: "6px 8px", background: "rgba(217,119,6,0.04)", borderRadius: 6 }}>
                        <div style={{ fontSize: 8, fontWeight: 600, color: "#D97706", marginBottom: 2 }}>INPUTS</div>
                        <div style={{ fontSize: 8, color: "#374151", lineHeight: 1.3 }}>{agent.inputs}</div>
                      </div>
                      <div style={{ padding: "6px 8px", background: "rgba(217,119,6,0.04)", borderRadius: 6 }}>
                        <div style={{ fontSize: 8, fontWeight: 600, color: "#059669", marginBottom: 2 }}>OUTPUTS</div>
                        <div style={{ fontSize: 8, color: "#374151", lineHeight: 1.3 }}>{agent.outputs}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "graph" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>LangGraph State Graph</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                The orchestration layer that manages agent execution order, conditional routing, retry logic, and state persistence. Built as a LangGraph StateGraph with typed state schema — each node transforms state and passes it forward.
              </p>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {[
                { label: "Agent Node", color: "#D97706" },
                { label: "Conditional", color: "#7C3AED" },
                { label: "Observability", color: "#2563EB" },
                { label: "Control", color: "#374151" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                  <span style={{ fontSize: 8, color: "#6b7280" }}>{l.label}</span>
                </div>
              ))}
            </div>

            {STATE_GRAPH.nodes.map((node, i) => (
              <div key={node.id}>
                <div onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)} style={{
                  background: "#fff", borderRadius: 10, padding: "8px 12px", marginBottom: 2,
                  border: `1px solid ${nodeColor(node.type)}20`, cursor: "pointer",
                  boxShadow: expandedNode === node.id ? `0 2px 8px ${nodeColor(node.type)}15` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: node.type === "conditional" ? 11 : 6,
                      background: nodeBg(node.type), border: `1.5px solid ${nodeColor(node.type)}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 8, fontWeight: 800, color: nodeColor(node.type), flexShrink: 0,
                    }}>{node.type === "conditional" ? "?" : node.type === "observability" ? "○" : i === 0 ? "▶" : i === STATE_GRAPH.nodes.length - 1 ? "■" : (i).toString()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#1e293b" }}>{node.label}</div>
                      <div style={{ fontSize: 8, color: nodeColor(node.type), fontWeight: 600 }}>
                        {node.type === "agent" ? `Agent: ${AGENTS.find(a => a.id === node.agent)?.name}` : node.type === "conditional" ? "Conditional Router" : node.type === "observability" ? "LangSmith Integration" : "Control Flow"}
                      </div>
                    </div>
                  </div>
                  {expandedNode === node.id && (
                    <div style={{ marginTop: 6, padding: "6px 8px", background: nodeBg(node.type), borderRadius: 6 }}>
                      <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.5 }}>{node.desc}</p>
                    </div>
                  )}
                </div>
                {i < STATE_GRAPH.nodes.length - 1 && (
                  <div style={{ display: "flex", alignItems: "center", marginLeft: 18, height: 14 }}>
                    <div style={{ width: 1.5, height: "100%", background: "rgba(217,119,6,0.2)" }} />
                    {STATE_GRAPH.edges[i] && (
                      <span style={{ fontSize: 7, color: "#94a3b8", marginLeft: 6, fontWeight: 600 }}>
                        {STATE_GRAPH.edges[i].label}
                        {STATE_GRAPH.edges[i].condition && " ⟡"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div style={{ background: "#fff", borderRadius: 10, padding: 12, marginTop: 10, border: "1px solid rgba(217,119,6,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>State Schema (TypedDict)</div>
              <div style={{ background: "#1e293b", borderRadius: 8, padding: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                {[
                  { key: "raw_data", type: "Dict[str, DataFrame]", desc: "# 4 source extracts" },
                  { key: "unified_graph", type: "CustomerJourneyGraph", desc: "# identity-resolved" },
                  { key: "quality_score", type: "float", desc: "# 0-100 completeness" },
                  { key: "attributions", type: "Dict[str, ModelOutput]", desc: "# 5 model results" },
                  { key: "model_confidence", type: "float", desc: "# avg confidence" },
                  { key: "insights", type: "List[Insight]", desc: "# ranked insights" },
                  { key: "reports", type: "Dict[str, Report]", desc: "# 3 audience variants" },
                  { key: "trace_id", type: "str", desc: "# LangSmith trace" },
                ].map(s => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 2 }}>
                    <span style={{ fontSize: 8, color: "#93c5fd", fontWeight: 600, width: 90 }}>{s.key}</span>
                    <span style={{ fontSize: 8, color: "#6b7280" }}>: </span>
                    <span style={{ fontSize: 8, color: "#fbbf24", flex: 1 }}>{s.type}</span>
                    <span style={{ fontSize: 7, color: "#4b5563" }}>{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "models" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>5 Attribution Models</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                The Attribution Agent runs all 5 models simultaneously on every campaign. Instead of forcing marketing to pick one model, the AI auto-selects the best model per campaign type based on statistical confidence and funnel position. This is the key innovation — attribution that adapts to the campaign, not the other way around.
              </p>
            </div>

            {ATTRIBUTION_MODELS.map((model, i) => (
              <div key={i} onClick={() => setExpandedModel(expandedModel === i ? null : i)} style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: `1px solid ${expandedModel === i ? model.color + "30" : "rgba(217,119,6,0.08)"}`,
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, background: `${model.color}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: model.color,
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{model.name}</div>
                      <div style={{ fontSize: 8, color: model.color, fontWeight: 600 }}>{model.weight}</div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: "4px 0 0", lineHeight: 1.4 }}>
                  <strong style={{ color: "#374151" }}>Best for:</strong> {model.bestFor}
                </p>
                {expandedModel === i && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: `${model.color}06`, borderRadius: 8, border: `1px dashed ${model.color}20` }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: model.color, marginBottom: 3 }}>Example Scenario</div>
                    <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.5 }}>{model.example}</p>
                  </div>
                )}
              </div>
            ))}

            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginTop: 4, border: "1px solid rgba(217,119,6,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Auto-Selection Logic</div>
              <p style={{ fontSize: 9, color: "#4b5563", margin: "0 0 8px", lineHeight: 1.5 }}>
                The Attribution Agent uses a Bayesian model selector that evaluates each model's predictive power against actual conversion data. For each campaign, it computes a confidence score per model and selects the model with the highest statistical significance.
              </p>
              {[
                { type: "Brand Awareness", model: "Time Decay", reason: "Early awareness touches compound — recency bias captures the building momentum", confidence: "89%" },
                { type: "Product Launch", model: "W-Shaped", reason: "Three clear milestones: awareness → interest → activation. Equal credit misses the inflection points", confidence: "92%" },
                { type: "Retargeting", model: "Last Touch", reason: "Bottom-funnel intent is what converted — the retargeting ad was the tipping point, not the brand exposure months ago", confidence: "94%" },
                { type: "Nurture Sequence", model: "Linear", reason: "Long, consistent drip campaigns where every email contributes equally to the eventual conversion", confidence: "86%" },
              ].map(r => (
                <div key={r.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid rgba(217,119,6,0.06)" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{r.type}</div>
                    <div style={{ fontSize: 8, color: "#6b7280" }}>{r.reason}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#D97706" }}>{r.model}</div>
                    <div style={{ fontSize: 7, color: "#059669" }}>{r.confidence}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(217,119,6,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "Agents", val: "4", color: "#D97706" },
          { label: "Models", val: "5", color: "#78350F" },
          { label: "Coverage", val: "94%", color: "#059669" },
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
