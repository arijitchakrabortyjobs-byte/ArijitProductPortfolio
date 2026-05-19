import { useState } from "react";

const STAGES = [
  { id: "ingest", icon: "📡", label: "Signal Ingestion", short: "Ingest" },
  { id: "features", icon: "⚙️", label: "Feature Engineering", short: "Features" },
  { id: "model", icon: "🧠", label: "Self-Tuning Model", short: "Model" },
  { id: "guardrails", icon: "🛡️", label: "Guardrails & Evals", short: "Guardrails" },
  { id: "tokens", icon: "📊", label: "Token I/O Monitor", short: "Tokens" },
];

const SIGNALS = [
  { name: "Device Fingerprint", source: "SDK", freq: "Every txn", latency: "2ms", fields: ["device_id", "os_version", "screen_res", "battery_level", "installed_apps_hash"] },
  { name: "Geolocation", source: "GPS + IP", freq: "Every txn", latency: "5ms", fields: ["lat_lng", "ip_geo", "cell_tower_id", "wifi_ssid_hash", "travel_velocity"] },
  { name: "Merchant Intel", source: "Network DB", freq: "Cached 1h", latency: "1ms", fields: ["mcc_code", "merchant_risk_tier", "avg_txn_amount", "chargeback_rate", "tenure_days"] },
  { name: "Behavioral Pattern", source: "ML Pipeline", freq: "Rolling 30d", latency: "8ms", fields: ["spend_velocity", "category_distribution", "time_pattern", "amount_deviation_z", "new_merchant_rate"] },
  { name: "Velocity Signals", source: "Stream", freq: "1min window", latency: "3ms", fields: ["txn_count_1h", "txn_count_24h", "unique_merchants_1h", "amount_sum_1h", "decline_count_24h"] },
  { name: "Network Graph", source: "Graph DB", freq: "Every txn", latency: "12ms", fields: ["shared_device_count", "merchant_cluster_risk", "peer_fraud_rate", "account_link_depth", "anomaly_score"] },
];

const FEATURES_DATA = [
  { raw: "device_id + os_version + screen_res", computed: "device_trust_score", type: "Float [0,1]", method: "Embedding similarity → known device DB", weight: "0.18" },
  { raw: "lat_lng + ip_geo + travel_velocity", computed: "location_match_score", type: "Float [0,1]", method: "Haversine distance + IP geolookup consensus", weight: "0.15" },
  { raw: "mcc_code + merchant_risk_tier + chargeback_rate", computed: "merchant_risk_score", type: "Float [0,1]", method: "Bayesian risk scoring per MCC cluster", weight: "0.14" },
  { raw: "spend_velocity + amount_deviation_z + category_distribution", computed: "behavior_anomaly_score", type: "Float [0,1]", method: "Isolation Forest on 30-day rolling window", weight: "0.20" },
  { raw: "txn_count_1h + amount_sum_1h + decline_count_24h", computed: "velocity_risk_score", type: "Float [0,1]", method: "Sliding window aggregation + z-score threshold", weight: "0.13" },
  { raw: "shared_device_count + peer_fraud_rate + anomaly_score", computed: "network_risk_score", type: "Float [0,1]", method: "GNN-based community fraud propagation", weight: "0.12" },
  { raw: "txn_hour + day_of_week + days_since_last_txn", computed: "temporal_risk_score", type: "Float [0,1]", method: "Gaussian mixture model on historical patterns", weight: "0.08" },
];

const MODEL_VERSIONS = [
  { version: "v3.2.1", date: "May 2026", auc: 0.987, precision: 0.962, recall: 0.941, f1: 0.951, fpRate: 3.8, status: "production", changes: "Added GNN network features, retuned velocity thresholds" },
  { version: "v3.1.0", date: "Apr 2026", auc: 0.979, precision: 0.948, recall: 0.932, f1: 0.940, fpRate: 5.2, status: "shadow", changes: "Introduced behavioral Isolation Forest signals" },
  { version: "v3.0.0", date: "Mar 2026", auc: 0.971, precision: 0.934, recall: 0.918, f1: 0.926, fpRate: 6.6, status: "retired", changes: "Baseline XGBoost with 4 signal families" },
];

const FEEDBACK_LOOP = [
  { trigger: "Customer confirms legitimate", action: "Positive label → retrain queue", impact: "Reduces false positive weight on matching patterns", freq: "~38K/month" },
  { trigger: "Fraud confirmed (chargeback)", action: "Negative label → immediate weight update", impact: "Increases sensitivity for similar transaction profiles", freq: "~4.2K/month" },
  { trigger: "Model drift detected (>2% AUC drop)", action: "Auto-trigger retraining pipeline", impact: "Full model retrain on last 90 days of labeled data", freq: "~1-2x/quarter" },
  { trigger: "New merchant category emerging", action: "Feature expansion + cold-start fallback", impact: "Adds category-specific sub-model with conservative thresholds", freq: "As needed" },
];

const GUARDRAILS = [
  { name: "Demographic Parity", metric: "Max disparity across groups", threshold: "< 5%", current: "2.1%", status: "pass" },
  { name: "Equal Opportunity", metric: "FPR gap across protected classes", threshold: "< 3%", current: "1.8%", status: "pass" },
  { name: "Confidence Calibration", metric: "Expected calibration error", threshold: "< 0.05", current: "0.031", status: "pass" },
  { name: "Adversarial Robustness", metric: "AUC under perturbation", threshold: "> 0.95", current: "0.968", status: "pass" },
  { name: "Latency SLA", metric: "p99 inference latency", threshold: "< 15ms", current: "11.2ms", status: "pass" },
  { name: "Model Staleness", metric: "Days since last retrain", threshold: "< 30d", current: "12d", status: "pass" },
  { name: "Feature Drift", metric: "PSI on top-10 features", threshold: "< 0.2", current: "0.08", status: "pass" },
  { name: "Output Distribution", metric: "KL divergence vs baseline", threshold: "< 0.1", current: "0.04", status: "pass" },
];

const EVAL_SUITES = [
  { name: "Golden Set (10K labeled txns)", lastRun: "2h ago", pass: 47, fail: 1, skip: 2, duration: "4m 12s" },
  { name: "Adversarial Suite (synthetic attacks)", lastRun: "6h ago", pass: 31, fail: 0, skip: 0, duration: "8m 45s" },
  { name: "Regression (prod shadow traffic)", lastRun: "1h ago", pass: 156, fail: 2, skip: 5, duration: "22m 03s" },
  { name: "Fairness Audit (demographic slices)", lastRun: "12h ago", pass: 24, fail: 0, skip: 0, duration: "15m 30s" },
];

const TOKEN_DATA = {
  input: {
    avgPerTxn: 847,
    breakdown: [
      { field: "Transaction context", tokens: 312, pct: 36.8 },
      { field: "Historical features (30d)", tokens: 248, pct: 29.3 },
      { field: "Network graph embedding", tokens: 156, pct: 18.4 },
      { field: "Merchant intelligence", tokens: 89, pct: 10.5 },
      { field: "System prompt + guardrails", tokens: 42, pct: 5.0 },
    ],
  },
  output: {
    avgPerTxn: 124,
    breakdown: [
      { field: "Confidence score + tier", tokens: 18, pct: 14.5 },
      { field: "Signal decomposition (7 scores)", tokens: 42, pct: 33.9 },
      { field: "Explanation rationale", tokens: 38, pct: 30.6 },
      { field: "Recommended action + metadata", tokens: 26, pct: 21.0 },
    ],
  },
  cost: {
    daily: { txns: "4.7M", inputTokens: "3.98B", outputTokens: "582M", cost: "$4,180" },
    monthly: { txns: "141M", inputTokens: "119.4B", outputTokens: "17.5B", cost: "$125,400" },
    perTxn: "$0.00089",
    savedPerFP: "$268",
    roi: "301×",
  },
};

export default function AIMLArchitecture() {
  const [activeStage, setActiveStage] = useState("ingest");
  const [expandedSignal, setExpandedSignal] = useState(null);
  const [expandedFeature, setExpandedFeature] = useState(null);

  const renderPipeline = () => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
        {STAGES.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div
              onClick={() => setActiveStage(s.id)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                cursor: "pointer",
                background: activeStage === s.id ? "linear-gradient(135deg, #2563EB, #1d4ed8)" : "rgba(255,255,255,0.04)",
                border: activeStage === s.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s",
                textAlign: "center",
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: activeStage === s.id ? "#fff" : "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>{s.short}</div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                <div style={{
                  width: 20, height: 2,
                  background: "linear-gradient(90deg, #2563EB, #3b82f6)",
                  borderRadius: 1,
                }} />
                <div style={{ fontSize: 10, color: "#3b82f6" }}>▸</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderIngest = () => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Real-Time Signal Ingestion</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>6 signal families ingested per transaction — total latency budget: 18ms</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ background: "rgba(37,99,235,0.15)", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 80 }}>
          <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 600, letterSpacing: 0.5 }}>SIGNALS/SEC</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>54.4K</div>
        </div>
        <div style={{ background: "rgba(37,99,235,0.15)", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 80 }}>
          <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 600, letterSpacing: 0.5 }}>FIELDS/TXN</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>30</div>
        </div>
        <div style={{ background: "rgba(37,99,235,0.15)", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 80 }}>
          <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 600, letterSpacing: 0.5 }}>p99 LATENCY</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>18ms</div>
        </div>
      </div>
      {SIGNALS.map((sig, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div
            onClick={() => setExpandedSignal(expandedSignal === i ? null : i)}
            style={{
              background: expandedSignal === i ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.03)",
              border: expandedSignal === i ? "1px solid rgba(37,99,235,0.3)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, padding: "10px 12px", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{sig.name}</span>
                <span style={{ fontSize: 10, color: "#64748b", marginLeft: 8 }}>via {sig.source}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#60a5fa" }}>{sig.latency}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{sig.freq}</span>
                <span style={{ fontSize: 10, color: "#64748b" }}>{expandedSignal === i ? "▾" : "▸"}</span>
              </div>
            </div>
            {expandedSignal === i && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {sig.fields.map((f, j) => (
                  <span key={j} style={{
                    fontSize: 9, padding: "3px 8px", borderRadius: 4,
                    background: "rgba(37,99,235,0.2)", color: "#93c5fd",
                    fontFamily: "monospace",
                  }}>{f}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFeatures = () => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Feature Engineering Pipeline</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>30 raw fields → 7 computed features — each normalized [0,1] and weighted for ensemble scoring</div>
      <div style={{ background: "rgba(37,99,235,0.08)", borderRadius: 10, padding: 12, marginBottom: 16, border: "1px solid rgba(37,99,235,0.15)" }}>
        <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>CONFIDENCE SCORE FORMULA</div>
        <div style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "monospace", lineHeight: 1.8 }}>
          score = 100 × Σ(wᵢ × featureᵢ)<br />
          <span style={{ color: "#64748b" }}>where</span> Σwᵢ = 1.0, <span style={{ color: "#64748b" }}>each</span> featureᵢ ∈ [0, 1]
        </div>
      </div>
      {FEATURES_DATA.map((f, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div
            onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
            style={{
              background: expandedFeature === i ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.03)",
              border: expandedFeature === i ? "1px solid rgba(37,99,235,0.3)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8, padding: "10px 12px", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd", fontFamily: "monospace" }}>{f.computed}</span>
                <span style={{ fontSize: 10, color: "#64748b", marginLeft: 8 }}>w = {f.weight}</span>
              </div>
              <div style={{
                width: 36, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden",
              }}>
                <div style={{ width: `${parseFloat(f.weight) * 500}%`, height: "100%", background: "#2563EB", borderRadius: 3 }} />
              </div>
            </div>
            {expandedFeature === i && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>
                  <span style={{ color: "#64748b" }}>Raw inputs:</span> <span style={{ fontFamily: "monospace", fontSize: 9 }}>{f.raw}</span>
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>
                  <span style={{ color: "#64748b" }}>Method:</span> {f.method}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                  <span style={{ color: "#64748b" }}>Output:</span> {f.type}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderModel = () => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Self-Tuning Model</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Continuous learning from production feedback — auto-retrains when drift exceeds thresholds</div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Model Versions</div>
      {MODEL_VERSIONS.map((m, i) => (
        <div key={i} style={{
          background: m.status === "production" ? "rgba(37,99,235,0.12)" : "rgba(255,255,255,0.03)",
          border: m.status === "production" ? "1px solid rgba(37,99,235,0.3)" : "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8, padding: 12, marginBottom: 6,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#e2e8f0", fontFamily: "monospace" }}>{m.version}</span>
              <span style={{
                fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5, textTransform: "uppercase",
                background: m.status === "production" ? "rgba(34,197,94,0.2)" : m.status === "shadow" ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.08)",
                color: m.status === "production" ? "#4ade80" : m.status === "shadow" ? "#fbbf24" : "#94a3b8",
              }}>{m.status}</span>
            </div>
            <span style={{ fontSize: 10, color: "#64748b" }}>{m.date}</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            {[
              { label: "AUC", value: m.auc },
              { label: "Precision", value: m.precision },
              { label: "Recall", value: m.recall },
              { label: "F1", value: m.f1 },
              { label: "FP Rate", value: m.fpRate + "%" },
            ].map((metric, j) => (
              <div key={j}>
                <div style={{ fontSize: 8, color: "#64748b", fontWeight: 600, letterSpacing: 0.5 }}>{metric.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{metric.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>{m.changes}</div>
        </div>
      ))}

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, marginTop: 16, letterSpacing: 0.5, textTransform: "uppercase" }}>Feedback Loop (Self-Tuning)</div>
      {FEEDBACK_LOOP.map((f, i) => (
        <div key={i} style={{
          display: "flex", gap: 10, marginBottom: 8, padding: "10px 12px", borderRadius: 8,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#60a5fa", fontWeight: 800,
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{f.trigger}</div>
            <div style={{ fontSize: 10, color: "#93c5fd", marginBottom: 2 }}>{f.action}</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{f.impact}</span>
              <span style={{ fontSize: 9, color: "#64748b" }}>{f.freq}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGuardrails = () => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Guardrails & Evaluation</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>8 safety checks + 4 eval suites run continuously — any failure triggers automatic rollback to last stable version</div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Safety Guardrails</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 4, marginBottom: 20 }}>
        {GUARDRAILS.map((g, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px", borderRadius: 6,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{g.name}</div>
              <div style={{ fontSize: 9, color: "#64748b" }}>{g.metric}</div>
            </div>
            <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", fontFamily: "monospace" }}>{g.current}</div>
                <div style={{ fontSize: 8, color: "#64748b" }}>threshold: {g.threshold}</div>
              </div>
              <div style={{
                fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                background: "rgba(34,197,94,0.15)", color: "#4ade80", letterSpacing: 0.5,
              }}>PASS</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Evaluation Suites</div>
      {EVAL_SUITES.map((s, i) => (
        <div key={i} style={{
          padding: "10px 12px", borderRadius: 8, marginBottom: 6,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{s.name}</span>
            <span style={{ fontSize: 9, color: "#64748b" }}>{s.lastRun}</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${(s.pass / (s.pass + s.fail + s.skip)) * 100}%`, height: "100%", background: "#22c55e" }} />
              <div style={{ width: `${(s.fail / (s.pass + s.fail + s.skip)) * 100}%`, height: "100%", background: "#ef4444" }} />
              <div style={{ width: `${(s.skip / (s.pass + s.fail + s.skip)) * 100}%`, height: "100%", background: "#64748b" }} />
            </div>
            <span style={{ fontSize: 9, color: "#4ade80", fontWeight: 600 }}>{s.pass}✓</span>
            {s.fail > 0 && <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 600 }}>{s.fail}✗</span>}
            {s.skip > 0 && <span style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>{s.skip}⊘</span>}
            <span style={{ fontSize: 9, color: "#64748b" }}>{s.duration}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTokens = () => (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Token I/O Monitor</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16 }}>Per-transaction token budget: 847 input + 124 output — optimized for sub-$0.001 per decision</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "COST/TXN", value: TOKEN_DATA.cost.perTxn, color: "#60a5fa" },
          { label: "SAVED/FP", value: TOKEN_DATA.cost.savedPerFP, color: "#4ade80" },
          { label: "TOKEN ROI", value: TOKEN_DATA.cost.roi, color: "#fbbf24" },
        ].map((m, i) => (
          <div key={i} style={{ background: "rgba(37,99,235,0.15)", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 80 }}>
            <div style={{ fontSize: 9, color: m.color, fontWeight: 600, letterSpacing: 0.5 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Input Tokens ({TOKEN_DATA.input.avgPerTxn} avg/txn)</div>
      <div style={{ marginBottom: 16 }}>
        {TOKEN_DATA.input.breakdown.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
            borderBottom: i < TOKEN_DATA.input.breakdown.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <div style={{ width: 40, fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "monospace", textAlign: "right" }}>{t.tokens}</div>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${t.pct}%`, height: "100%", background: "linear-gradient(90deg, #2563EB, #3b82f6)", borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", minWidth: 140 }}>{t.field}</div>
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>{t.pct}%</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Output Tokens ({TOKEN_DATA.output.avgPerTxn} avg/txn)</div>
      <div style={{ marginBottom: 16 }}>
        {TOKEN_DATA.output.breakdown.map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
            borderBottom: i < TOKEN_DATA.output.breakdown.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
          }}>
            <div style={{ width: 40, fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "monospace", textAlign: "right" }}>{t.tokens}</div>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${t.pct}%`, height: "100%", background: "linear-gradient(90deg, #059669, #10b981)", borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", minWidth: 140 }}>{t.field}</div>
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", minWidth: 36, textAlign: "right" }}>{t.pct}%</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Cost at Scale</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { period: "Daily", ...TOKEN_DATA.cost.daily },
          { period: "Monthly", ...TOKEN_DATA.cost.monthly },
        ].map((c, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8, padding: 12,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", marginBottom: 8, letterSpacing: 0.5 }}>{c.period}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>Transactions</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{c.txns}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>Input tokens</div>
            <div style={{ fontSize: 11, color: "#e2e8f0", marginBottom: 4 }}>{c.inputTokens}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>Output tokens</div>
            <div style={{ fontSize: 11, color: "#e2e8f0", marginBottom: 4 }}>{c.outputTokens}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>Total cost</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#4ade80" }}>{c.cost}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      background: "#0A0F1E",
      borderRadius: 16,
      overflow: "hidden",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: 420,
      margin: "0 auto",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        padding: "16px 16px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: 1,
          }}>AX</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>AI/ML Architecture</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>End-to-End Fraud Intelligence Pipeline</div>
          </div>
        </div>
        {renderPipeline()}
      </div>

      <div style={{ padding: 16 }}>
        {activeStage === "ingest" && renderIngest()}
        {activeStage === "features" && renderFeatures()}
        {activeStage === "model" && renderModel()}
        {activeStage === "guardrails" && renderGuardrails()}
        {activeStage === "tokens" && renderTokens()}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-around",
        padding: "10px 16px",
        background: "rgba(0,0,0,0.3)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { label: "Signals", value: "30" },
          { label: "Features", value: "7" },
          { label: "Latency", value: "18ms" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{s.value}</div>
            <div style={{ fontSize: 8, color: "#64748b", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
