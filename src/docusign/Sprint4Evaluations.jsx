import { useState } from "react";

const EVAL_DATASETS = [
  {
    name: "Attribution Accuracy",
    desc: "Does the Attribution Agent correctly assign credit to the right campaigns? Tested against 500 manually-labeled opportunities where human analysts confirmed the true attribution path.",
    runs: 500,
    metrics: [
      { model: "First Touch", precision: "94.2%", recall: "91.8%", f1: "93.0%", bestSegment: "Brand awareness" },
      { model: "Last Touch", precision: "96.1%", recall: "88.4%", f1: "92.1%", bestSegment: "Retargeting" },
      { model: "Linear", precision: "89.7%", recall: "93.2%", f1: "91.4%", bestSegment: "Nurture sequences" },
      { model: "Time Decay", precision: "91.3%", recall: "90.6%", f1: "90.9%", bestSegment: "Event-driven" },
      { model: "W-Shaped", precision: "93.8%", recall: "94.1%", f1: "93.9%", bestSegment: "Enterprise B2B" },
    ],
    verdict: "W-Shaped performs best overall for Docusign's B2B SaaS motion. Bayesian auto-selector correctly chose optimal model 89.2% of the time.",
  },
  {
    name: "Insight Quality",
    desc: "Are the Insight Agent's recommendations actionable, accurate, and non-hallucinated? 3 marketing leaders scored 200 AI-generated insights on a 1-5 scale across 4 dimensions.",
    runs: 200,
    scores: [
      { dimension: "Actionability", avg: 4.2, distribution: [2, 8, 28, 82, 80], desc: "Can a marketer act on this insight without additional research?" },
      { dimension: "Accuracy", avg: 4.4, distribution: [1, 4, 18, 76, 101], desc: "Is the underlying data and calculation correct?" },
      { dimension: "Novelty", avg: 3.8, distribution: [4, 14, 42, 78, 62], desc: "Does this insight tell them something they didn't already know?" },
      { dimension: "Clarity", avg: 4.5, distribution: [0, 3, 14, 68, 115], desc: "Is the insight clearly written and easy to understand?" },
    ],
    verdict: "Avg quality score: 4.2/5. Novelty is the weakest dimension — agent sometimes surfaces obvious patterns. Iteration: add 'surprise score' filter to rank truly non-obvious insights higher.",
  },
  {
    name: "Hallucination Detection",
    desc: "Does the agent fabricate data, invent campaign names, or cite metrics that don't exist in the source data? Critical for CMO-facing reports where a single fabricated number destroys trust.",
    runs: 847,
    results: [
      { type: "Fabricated metric", count: 3, severity: "critical", example: "Agent cited '$4.2M pipeline from Partner channel' — Partner channel doesn't exist in current Marketo setup", fix: "Added source validation layer: every metric must trace to a SQL query result" },
      { type: "Wrong attribution", count: 7, severity: "high", example: "Credited 'Annual Conference' with 12% of Q2 pipeline — but conference was in Q1 and attribution window expired", fix: "Enforced 90-day attribution decay window in model parameters" },
      { type: "Stale data reference", count: 12, severity: "medium", example: "Referenced 'LinkedIn audience size: 2.4M' which was correct in March but audience was reduced to 1.8M in April", fix: "Added data freshness check — all cited metrics must be < 7 days old" },
      { type: "Rounded incorrectly", count: 4, severity: "low", example: "Stated 'pipeline grew 18%' when actual growth was 17.4% — rounds up to make insight sound more impressive", fix: "Enforced 1-decimal precision for all percentage claims" },
    ],
    verdict: "26 total issues across 847 runs (3.1% error rate). After fixes, re-evaluation showed 0.4% error rate. Zero critical hallucinations in last 12 runs.",
  },
];

const AB_TESTS = [
  {
    name: "Single Model vs Multi-Model Attribution",
    hypothesis: "Running 5 attribution models with auto-selection will attribute more pipeline than the current single last-click model, without increasing false attribution",
    control: { name: "Last-Click Only", coverage: "57%", falseAttribution: "4.2%", analystSatisfaction: "2.8/5" },
    variant: { name: "5-Model + Auto-Select", coverage: "94.2%", falseAttribution: "3.8%", analystSatisfaction: "4.3/5" },
    result: "Variant wins on all 3 metrics. p < 0.001 for coverage and satisfaction. False attribution actually decreased because multi-model cross-validation catches single-model errors.",
    significant: true,
  },
  {
    name: "Weekly Report: AI-Generated vs Human-Written",
    hypothesis: "AI-generated weekly reports will be rated at least as useful as human-written reports by marketing leadership, at 1/20th the cost",
    control: { name: "Human Analyst (23 hrs)", coverage: "—", falseAttribution: "—", analystSatisfaction: "3.9/5" },
    variant: { name: "AI Agent (1m 51s)", coverage: "—", falseAttribution: "—", analystSatisfaction: "4.1/5" },
    result: "AI reports rated slightly higher. Key advantage: consistency (human reports varied 2.8-4.6, AI reports 3.8-4.4) and timeliness (Monday 8 AM vs Thursday afternoon).",
    significant: true,
  },
  {
    name: "Real-Time Alerts vs Weekly Batch",
    hypothesis: "Adding real-time anomaly alerts (LinkedIn CPL spike, campaign budget depletion) on top of weekly reports will improve marketing response time",
    control: { name: "Weekly Batch Only", coverage: "—", falseAttribution: "—", analystSatisfaction: "—" },
    variant: { name: "Weekly + Real-Time Alerts", coverage: "—", falseAttribution: "—", analystSatisfaction: "—" },
    result: "Response time to anomalies improved from 4.2 days (next weekly report) to 2.1 hours. But alert fatigue emerged at > 5 alerts/week — tuned threshold to 3 P0 alerts max.",
    significant: true,
  },
];

const SQL_VALIDATIONS = [
  { query: "SELECT COUNT(*) FROM leads WHERE campaign_source IS NULL AND created_date > DATEADD(day, -7, GETDATE())", purpose: "Validate lead source completeness", expected: "< 2,000", actual: "1,247", pass: true },
  { query: "SELECT COUNT(DISTINCT contact_id) FROM unified_graph WHERE identity_confidence < 0.8", purpose: "Flag low-confidence identity matches", expected: "< 500", actual: "412", pass: true },
  { query: "SELECT SUM(attributed_pipeline) / SUM(total_pipeline) AS coverage FROM attribution_output", purpose: "Verify attribution coverage target", expected: "> 0.90", actual: "0.942", pass: true },
  { query: "SELECT COUNT(*) FROM insights WHERE source_query_id IS NULL", purpose: "Ensure every insight traces to a source query", expected: "0", actual: "0", pass: true },
  { query: "SELECT AVG(model_confidence) FROM attribution_scores WHERE model = selected_model", purpose: "Verify selected model confidence", expected: "> 0.80", actual: "0.886", pass: true },
];

export default function Sprint4Evaluations() {
  const [tab, setTab] = useState("evals");
  const [expandedEval, setExpandedEval] = useState(null);
  const [expandedTest, setExpandedTest] = useState(null);

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
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#78350F", margin: 0 }}>Evaluations & Testing</h3>
            <p style={{ fontSize: 10, color: "#D97706", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 4 — Test + Iterate</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(217,119,6,0.08)" }}>
        {[
          { key: "evals", label: "LangSmith Evals" },
          { key: "ab", label: "A/B Tests" },
          { key: "sql", label: "Data Validation" },
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
        {tab === "evals" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>LangSmith Evaluation Suite</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                3 evaluation datasets test the agent system end-to-end: attribution accuracy against human-labeled ground truth, insight quality scored by marketing leaders, and hallucination detection across 847 production runs. These evals run automatically after every workflow execution.
              </p>
            </div>

            {EVAL_DATASETS.map((ev, i) => (
              <div key={i} onClick={() => setExpandedEval(expandedEval === i ? null : i)} style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
                boxShadow: expandedEval === i ? "0 3px 12px rgba(217,119,6,0.1)" : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>{ev.name}</div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280" }}>{ev.runs} runs</span>
                </div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{ev.desc}</p>

                {expandedEval === i && (
                  <div style={{ marginTop: 8 }}>
                    {ev.metrics && (
                      <div style={{ background: "#f8fafc", borderRadius: 8, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 42px 38px", padding: "4px 8px", background: "rgba(217,119,6,0.06)" }}>
                          <span style={{ fontSize: 7, fontWeight: 700, color: "#6b7280" }}>MODEL</span>
                          <span style={{ fontSize: 7, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>PREC</span>
                          <span style={{ fontSize: 7, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>REC</span>
                          <span style={{ fontSize: 7, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>F1</span>
                        </div>
                        {ev.metrics.map(m => (
                          <div key={m.model} style={{ display: "grid", gridTemplateColumns: "1fr 48px 42px 38px", padding: "4px 8px", borderTop: "1px solid rgba(217,119,6,0.04)", alignItems: "center" }}>
                            <span style={{ fontSize: 8, fontWeight: 600, color: "#374151" }}>{m.model}</span>
                            <span style={{ fontSize: 8, color: "#059669", textAlign: "center" }}>{m.precision}</span>
                            <span style={{ fontSize: 8, color: "#D97706", textAlign: "center" }}>{m.recall}</span>
                            <span style={{ fontSize: 8, fontWeight: 700, color: "#1e293b", textAlign: "center" }}>{m.f1}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {ev.scores && ev.scores.map(s => (
                      <div key={s.dimension} style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{s.dimension}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: "#D97706" }}>{s.avg}/5</span>
                        </div>
                        <div style={{ display: "flex", gap: 1, height: 12, borderRadius: 4, overflow: "hidden" }}>
                          {s.distribution.map((count, j) => (
                            <div key={j} style={{
                              flex: count, minWidth: count > 0 ? 2 : 0,
                              background: j === 0 ? "#ef4444" : j === 1 ? "#f97316" : j === 2 ? "#eab308" : j === 3 ? "#84cc16" : "#22c55e",
                            }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 7, color: "#94a3b8", marginTop: 1 }}>{s.desc}</div>
                      </div>
                    ))}

                    {ev.results && ev.results.map((r, j) => (
                      <div key={j} style={{ padding: "6px 8px", background: r.severity === "critical" ? "rgba(220,38,38,0.04)" : r.severity === "high" ? "rgba(217,119,6,0.04)" : "rgba(100,116,139,0.04)", borderRadius: 6, marginBottom: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: "#374151" }}>{r.type}</span>
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: "#1e293b" }}>{r.count}x</span>
                            <span style={{
                              fontSize: 7, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
                              background: r.severity === "critical" ? "rgba(220,38,38,0.1)" : r.severity === "high" ? "rgba(217,119,6,0.1)" : "rgba(100,116,139,0.08)",
                              color: r.severity === "critical" ? "#DC2626" : r.severity === "high" ? "#D97706" : "#64748b",
                              textTransform: "uppercase",
                            }}>{r.severity}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: 8, color: "#6b7280", lineHeight: 1.3, marginBottom: 2 }}>{r.example}</div>
                        <div style={{ fontSize: 8, color: "#059669", lineHeight: 1.3 }}>Fix: {r.fix}</div>
                      </div>
                    ))}

                    <div style={{ padding: "6px 8px", background: "rgba(5,150,105,0.06)", borderRadius: 6, marginTop: 6 }}>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "#059669", marginBottom: 2 }}>VERDICT</div>
                      <div style={{ fontSize: 9, color: "#374151", lineHeight: 1.4 }}>{ev.verdict}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "ab" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>A/B Test Results</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                3 controlled experiments validating the agent system against the current manual workflow. Each test ran for 4 weeks with the marketing ops team scoring outcomes blind (they didn't know which output was AI vs human).
              </p>
            </div>

            {AB_TESTS.map((test, i) => (
              <div key={i} onClick={() => setExpandedTest(expandedTest === i ? null : i)} style={{
                background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: "1px solid rgba(217,119,6,0.08)", cursor: "pointer",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{test.name}</div>
                <p style={{ fontSize: 9, color: "#6b7280", margin: "0 0 6px", lineHeight: 1.4 }}>
                  <strong style={{ color: "#374151" }}>H:</strong> {test.hypothesis}
                </p>
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  <div style={{ flex: 1, padding: "6px 8px", background: "rgba(220,38,38,0.04)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#DC2626", fontWeight: 600 }}>CONTROL</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#374151" }}>{test.control.name}</div>
                  </div>
                  <div style={{ flex: 1, padding: "6px 8px", background: "rgba(5,150,105,0.04)", borderRadius: 6, textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: "#059669", fontWeight: 600 }}>VARIANT</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#374151" }}>{test.variant.name}</div>
                  </div>
                </div>
                {expandedTest === i && (
                  <div style={{ marginTop: 6, padding: "8px 10px", background: "rgba(5,150,105,0.04)", borderRadius: 8, border: "1px solid rgba(5,150,105,0.1)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#059669", marginBottom: 3 }}>Result</div>
                    <p style={{ fontSize: 9, color: "#374151", margin: 0, lineHeight: 1.5 }}>{test.result}</p>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(5,150,105,0.1)", color: "#059669" }}>Statistically Significant</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "sql" && (
          <div>
            <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 12, padding: 12, marginBottom: 12, border: "1px solid rgba(217,119,6,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", marginBottom: 2 }}>SQL Data Validation Agent</div>
              <p style={{ fontSize: 9, color: "#92400E", margin: 0, lineHeight: 1.4 }}>
                A dedicated validation layer that runs SQL assertions against Snowflake after every ingestion cycle. If any assertion fails, the workflow halts and alerts the data engineering team. These queries ensure the AI never operates on stale, incomplete, or corrupted data.
              </p>
            </div>

            {SQL_VALIDATIONS.map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid rgba(217,119,6,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>{v.purpose}</div>
                  <span style={{ fontSize: 8, fontWeight: 700, color: v.pass ? "#059669" : "#DC2626" }}>{v.pass ? "PASS" : "FAIL"}</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 6, padding: 8, marginBottom: 4, overflowX: "auto" }}>
                  <code style={{ fontSize: 7, color: "#93c5fd", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{v.query}</code>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 8, color: "#6b7280" }}>Expected: <strong style={{ color: "#374151" }}>{v.expected}</strong></span>
                  <span style={{ fontSize: 8, color: "#6b7280" }}>Actual: <strong style={{ color: v.pass ? "#059669" : "#DC2626" }}>{v.actual}</strong></span>
                </div>
              </div>
            ))}

            <div style={{ background: "#fff", borderRadius: 10, padding: 12, marginTop: 8, border: "1px solid rgba(217,119,6,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#78350F", marginBottom: 6 }}>Validation Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[
                  { label: "Assertions", val: "5/5", color: "#059669" },
                  { label: "Last Run", val: "2:00 AM", color: "#D97706" },
                  { label: "Streak", val: "47 passes", color: "#059669" },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: "center", padding: 6, background: "rgba(217,119,6,0.04)", borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.val}</div>
                    <div style={{ fontSize: 7, color: "#6b7280" }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 16px 18px", borderTop: "1px solid rgba(217,119,6,0.08)", display: "flex", justifyContent: "space-around" }}>
        {[
          { label: "Error Rate", val: "0.4%", color: "#059669" },
          { label: "A/B Wins", val: "3/3", color: "#D97706" },
          { label: "SQL Checks", val: "5/5", color: "#059669" },
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
