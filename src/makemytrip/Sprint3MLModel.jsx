import { useState } from "react";

const SURFACE = "#0f0e2a";
const CARD_BG = "#1e1b4b";
const BORDER = "#312e81";
const ACCENT = "#8b5cf6";

const pill = (label, color) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
    {label}
  </span>
);

const features = [
  { name: "operator_affinity_score", type: "float [0–1]", source: "Booking history", importance: 92, color: "#6366f1" },
  { name: "preferred_class_match", type: "binary", source: "Booking history", importance: 85, color: "#8b5cf6" },
  { name: "operator_trust_score", type: "float [0–1]", source: "Operator DB", importance: 78, color: "#a855f7" },
  { name: "departure_time_fit_score", type: "float [0–1]", source: "Booking history", importance: 71, color: "#ec4899" },
  { name: "route_familiarity_score", type: "float [0–1]", source: "Search + booking", importance: 65, color: "#f97316" },
  { name: "price_sensitivity_tier", type: "int [1–3]", source: "Booking history", importance: 58, color: "#fbbf24" },
  { name: "fare_vs_route_median", type: "float", source: "Route analytics", importance: 44, color: "#34d399" },
  { name: "device_language_match", type: "binary", source: "Session", importance: 37, color: "#06b6d4" },
];

const evalMetrics = [
  { metric: "NDCG@5 — Overall", baseline: 0.685, target: 0.720, achieved: 0.748, color: "#6366f1" },
  { metric: "NDCG@5 — Tier 2/3", baseline: 0.641, target: 0.680, achieved: 0.703, color: "#8b5cf6" },
  { metric: "NDCG@5 — Returning Users", baseline: 0.712, target: 0.750, achieved: 0.771, color: "#a855f7" },
  { metric: "Precision@1", baseline: 0.280, target: 0.340, achieved: 0.361, color: "#10b981" },
];

const apiSteps = [
  { label: "Feature Retrieval (Redis)", budget: 15, color: "#6366f1" },
  { label: "Model Inference (LightGBM)", budget: 25, color: "#8b5cf6" },
  { label: "Response Serialisation", budget: 5, color: "#a855f7" },
  { label: "Network Overhead", budget: 15, color: "#ec4899" },
];

const pipelineSteps = [
  { step: "1", label: "Data Pull", duration: "30 min", desc: "90-day session data from data warehouse", color: "#6366f1" },
  { step: "2", label: "Feature Engineering", duration: "45 min", desc: "Affinity decay, normalisation, operator join", color: "#8b5cf6" },
  { step: "3", label: "Model Training", duration: "90 min", desc: "LambdaMART with early stopping on validation NDCG", color: "#a855f7" },
  { step: "4", label: "Offline Evaluation", duration: "15 min", desc: "NDCG@5 on held-out test set + segment breakdown", color: "#ec4899" },
  { step: "5", label: "Auto-Promote / Hold", duration: "5 min", desc: "If NDCG improves → staging; if degrades → alert", color: "#f97316" },
  { step: "6", label: "Staging Smoke Test", duration: "30 min", desc: "100 synthetic requests, latency < 80ms", color: "#10b981" },
];

function SectionHeader({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: ACCENT, color: "#fff", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{number}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#e0e7ff" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "#a5b4fc", marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function FeatureImportance() {
  return (
    <div>
      <SectionHeader number="1" title="Model Feature Set & Importance" subtitle="US-3.1 · LambdaMART trained on 10 behavioural signals · 50K+ sessions" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gap: 14 }}>
          {features.map((f, i) => (
            <div key={f.name}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#818cf8", fontSize: 11, fontWeight: 700, width: 18 }}>F{i + 1}</span>
                  <code style={{ color: "#e0e7ff", fontSize: 12 }}>{f.name}</code>
                  {pill(f.type, "#6b7280")}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#6b7280", fontSize: 11 }}>{f.source}</span>
                  <span style={{ color: f.color, fontWeight: 700, fontSize: 13, width: 36, textAlign: "right" }}>{f.importance}</span>
                </div>
              </div>
              <div style={{ background: SURFACE, borderRadius: 4, height: 7, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${f.importance}%`, background: f.color, borderRadius: 4, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "10px 14px", background: SURFACE, borderRadius: 8, border: "1px solid #312e81" }}>
          <span style={{ color: "#6b7280", fontSize: 11 }}>Algorithm: </span>
          <span style={{ color: "#a5b4fc", fontSize: 11 }}>LambdaMART via LightGBM Ranker · Objective: lambdarank · Eval: NDCG@5 · Early stopping on validation set</span>
        </div>
      </div>
    </div>
  );
}

function EvalMetrics() {
  return (
    <div>
      <SectionHeader number="2" title="Offline Evaluation Results" subtitle="US-3.1 · All targets exceeded · Model promoted to staging" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gap: 16 }}>
          {evalMetrics.map(m => {
            const baseW = (m.baseline / 1.0) * 100;
            const targetW = (m.target / 1.0) * 100;
            const achievedW = (m.achieved / 1.0) * 100;
            const lift = (((m.achieved - m.baseline) / m.baseline) * 100).toFixed(1);
            return (
              <div key={m.metric} style={{ background: SURFACE, borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "#c7d2fe", fontSize: 13, fontWeight: 600 }}>{m.metric}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {pill(`+${lift}% lift`, "#34d399")}
                    {pill("✓ Target met", m.color)}
                  </div>
                </div>
                <div style={{ position: "relative", background: "#1e1b4b", borderRadius: 6, height: 10, overflow: "visible" }}>
                  <div style={{ position: "absolute", left: 0, height: "100%", width: `${baseW}%`, background: "#374151", borderRadius: 6 }} />
                  <div style={{ position: "absolute", left: 0, height: "100%", width: `${achievedW}%`, background: m.color, borderRadius: 6, opacity: 0.9 }} />
                  <div style={{ position: "absolute", left: `${targetW}%`, top: -4, width: 2, height: 18, background: "#fbbf24" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ color: "#6b7280", fontSize: 11 }}>Baseline: <span style={{ color: "#9ca3af" }}>{m.baseline.toFixed(3)}</span></span>
                    <span style={{ color: "#fbbf24", fontSize: 11 }}>Target: {m.target.toFixed(3)}</span>
                    <span style={{ color: m.color, fontSize: 11, fontWeight: 700 }}>Achieved: {m.achieved.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ServingAPI() {
  return (
    <div>
      <SectionHeader number="3" title="Serving API — Latency Budget" subtitle="US-3.2 · P95 target < 80ms · Redis-cached features" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Latency Breakdown (ms)</div>
            {apiSteps.map(s => (
              <div key={s.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#c7d2fe", fontSize: 12 }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 700, fontSize: 12 }}>≤{s.budget}ms</span>
                </div>
                <div style={{ background: SURFACE, borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(s.budget / 80) * 100}%`, background: s.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#6366f122", borderRadius: 8, border: "1px solid #6366f144" }}>
              <div style={{ color: "#a5b4fc", fontSize: 12 }}>Total P95 Budget</div>
              <div style={{ color: "#6366f1", fontWeight: 800, fontSize: 20 }}>≤ 80ms</div>
            </div>
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Load Test Results</div>
            {[
              { label: "Normal (200 req/s)", p95: "43ms", error: "0.04%", status: "✓", color: "#34d399" },
              { label: "Peak (500 req/s)", p95: "71ms", error: "0.18%", status: "✓", color: "#34d399" },
              { label: "Spike (1000 req/s)", p95: "108ms", error: "0.9%", status: "⚠", color: "#fbbf24" },
            ].map(t => (
              <div key={t.label} style={{ background: SURFACE, borderRadius: 8, padding: "10px 12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#c7d2fe", fontSize: 12 }}>{t.label}</div>
                  <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>P95: {t.p95} · Errors: {t.error}</div>
                </div>
                <span style={{ color: t.color, fontSize: 18 }}>{t.status}</span>
              </div>
            ))}
            <div style={{ padding: "8px 12px", background: SURFACE, borderRadius: 8, border: "1px solid #fbbf2433" }}>
              <div style={{ color: "#fbbf24", fontSize: 11 }}>Fallback: Rule-based v1 (Sprint 2) if model timeout {">"} 60ms</div>
            </div>
          </div>
        </div>
        <div style={{ background: SURFACE, borderRadius: 8, padding: 14, border: "1px solid #312e81" }}>
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>Sample API Request</div>
          <code style={{ color: "#34d399", fontSize: 11, lineHeight: 1.8, display: "block" }}>
            POST /v1/ranking/bus<br />
            {"{"} user_id, origin, destination, travel_date, operator_ids[] {"}"}<br />
            → ranked_operators[] with score + boost_applied + is_personalized
          </code>
        </div>
      </div>
    </div>
  );
}

function RetrainingPipeline() {
  return (
    <div>
      <SectionHeader number="4" title="Weekly Retraining Pipeline" subtitle="US-3.3 · Runs every Monday 2am IST · Auto-promotes on NDCG improvement" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {pipelineSteps.map((s, i) => (
            <div key={s.step} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ background: s.color, color: "#fff", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{s.step}</div>
                {i < pipelineSteps.length - 1 && <div style={{ width: 2, height: 24, background: s.color + "44", marginTop: 4 }} />}
              </div>
              <div style={{ background: SURFACE, borderRadius: 8, padding: "10px 14px", flex: 1, border: `1px solid ${s.color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#e0e7ff", fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: 11, fontWeight: 700 }}>{s.duration}</span>
                </div>
                <div style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#10b98122", borderRadius: 8, padding: 12, border: "1px solid #10b98133" }}>
            <div style={{ color: "#34d399", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>If NDCG Improves</div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>Auto-promote to staging → smoke test → production swap. Slack post: ✅ Model promoted</div>
          </div>
          <div style={{ background: "#ef444422", borderRadius: 8, padding: 12, border: "1px solid #ef444433" }}>
            <div style={{ color: "#f87171", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>If NDCG Degrades {">"} 3%</div>
            <div style={{ color: "#9ca3af", fontSize: 11 }}>Hold candidate, keep production model. Slack alert: ⚠️ Manual review required</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: "8px 14px", background: SURFACE, borderRadius: 8, border: "1px solid #312e81", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#6b7280", fontSize: 11 }}>Total pipeline runtime</span>
          <span style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 700 }}>{"<"} 4 hours · Completes by 6:00 AM IST</span>
        </div>
      </div>
    </div>
  );
}

export default function Sprint3MLModel() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <FeatureImportance />
      <EvalMetrics />
      <ServingAPI />
      <RetrainingPipeline />
    </div>
  );
}
