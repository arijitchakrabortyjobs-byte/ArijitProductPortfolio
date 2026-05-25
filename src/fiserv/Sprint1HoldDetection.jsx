import { useState, useEffect, useRef } from "react";

const FV = {
  bg: "#0B1120", card: "#111827", cardHover: "#1F2937", border: "#1E293B",
  accent: "#F97316", accentGlow: "rgba(249,115,22,0.12)",
  blue: "#3B82F6", blueGlow: "rgba(59,130,246,0.12)",
  emerald: "#10B981", emeraldGlow: "rgba(16,185,129,0.12)",
  red: "#EF4444", redGlow: "rgba(239,68,68,0.12)",
  purple: "#8B5CF6", purpleGlow: "rgba(139,92,246,0.12)",
  amber: "#F59E0B", amberGlow: "rgba(245,158,11,0.12)",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", textMuted: "#64748B",
};

const HOLD_TYPES = [
  { type: "chargeback_risk", label: "Chargeback Risk", icon: "🛡️", color: FV.red, description: "Transaction flagged for high chargeback probability based on merchant category code, transaction velocity, or pattern match against known fraud vectors.", currentFields: ["merchant_id", "transaction_id", "amount", "timestamp"], missingFields: ["hold_type enum", "triggering_rule_id", "responsible_team_queue", "required_documents[]", "resolution_eta", "confidence_score"], avgResolutionDays: 5.2, monthlyVolume: 14200, pctOfTotal: 38 },
  { type: "volume_spike", label: "Volume Spike", icon: "📈", color: FV.amber, description: "Processing volume exceeded 3x the 30-day rolling average. Triggered automatically by the velocity engine. Often legitimate (seasonal, viral event) but requires manual review.", currentFields: ["merchant_id", "current_volume", "baseline_volume", "timestamp"], missingFields: ["hold_type enum", "spike_multiplier", "assigned_team", "required_documents[]", "resolution_eta", "escalation_path"], avgResolutionDays: 2.8, monthlyVolume: 8400, pctOfTotal: 22 },
  { type: "new_account_review", label: "New Account Review", icon: "🆕", color: FV.blue, description: "First 90-day enhanced monitoring for new merchant accounts. Standard compliance requirement. Most holds release automatically after document verification.", currentFields: ["merchant_id", "account_age_days", "timestamp"], missingFields: ["hold_type enum", "kyc_status", "document_checklist[]", "assigned_team", "resolution_eta", "auto_release_eligible"], avgResolutionDays: 7.1, monthlyVolume: 11600, pctOfTotal: 31 },
  { type: "manual_flag", label: "Manual Flag", icon: "🚩", color: FV.purple, description: "Hold placed by a risk analyst or compliance officer after manual investigation. May originate from external reports, law enforcement requests, or internal escalations.", currentFields: ["merchant_id", "analyst_id", "timestamp", "free_text_note"], missingFields: ["hold_type enum", "flag_reason_code", "required_documents[]", "priority_level", "resolution_eta", "case_link"], avgResolutionDays: 9.4, monthlyVolume: 3400, pctOfTotal: 9 },
];

const HOLD_CASE_SCHEMA = [
  { field: "hold_id", type: "UUID", source: "Generated", description: "Primary key — unique case identifier" },
  { field: "merchant_id", type: "UUID", source: "Risk Engine", description: "FK to merchant entity" },
  { field: "hold_type", type: "ENUM", source: "Risk Engine", description: "chargeback_risk | volume_spike | new_account_review | manual_flag" },
  { field: "amount_held", type: "DECIMAL", source: "Risk Engine", description: "Total funds under hold (USD)" },
  { field: "opened_at", type: "TIMESTAMP", source: "Event Bus", description: "When hold was created" },
  { field: "status", type: "ENUM", source: "Case Service", description: "open | under_review | pending_docs | escalated | resolved | released" },
  { field: "status_last_updated", type: "TIMESTAMP", source: "Case Service", description: "Last status transition timestamp" },
  { field: "assigned_team", type: "STRING", source: "Routing Rules", description: "Team queue responsible (null at creation)" },
  { field: "required_documents", type: "JSONB[]", source: "Policy Engine", description: "List of required merchant documents per hold_type" },
  { field: "resolution_eta", type: "TIMESTAMP", source: "ML Model", description: "Predicted resolution date (null at creation, backfilled by Sprint 2)" },
  { field: "triggering_rule_id", type: "STRING", source: "Risk Engine", description: "Which rule fired — may be redacted in merchant-facing views" },
  { field: "confidence_score", type: "FLOAT", source: "Risk Engine", description: "0.0–1.0 risk confidence from the triggering model" },
];

const GAP_ANALYSIS = [
  { category: "Identification", existing: "merchant_id, transaction_id, timestamp", gap: "No hold_type enum — all holds are stored as generic 'risk_event' with free-text reason", severity: "critical", impact: "Cannot route, prioritize, or set SLAs by hold category" },
  { category: "Classification", existing: "Free-text 'reason' field (avg 12 words)", gap: "No structured hold_type enum, no triggering_rule_id linkage, no confidence_score", severity: "critical", impact: "Merchant-facing messaging defaults to generic 'under review' — no specificity" },
  { category: "Ownership", existing: "None — holds sit in a shared queue", gap: "No assigned_team, no escalation_path, no SLA timer", severity: "high", impact: "Avg time-to-first-touch: 18 hours. 23% of holds are never actively worked" },
  { category: "Documentation", existing: "Manual email requests to merchants", gap: "No required_documents[] linked to hold_type, no document upload tracking", severity: "high", impact: "Merchants submit wrong docs 41% of the time, adding 2.3 days to resolution" },
  { category: "Resolution", existing: "Analyst manually marks 'resolved' in admin tool", gap: "No resolution_eta, no status enum beyond open/closed, no status_last_updated", severity: "medium", impact: "Merchants have zero visibility into hold progress or expected resolution" },
  { category: "Auditability", existing: "Basic create/close timestamps", gap: "No state transition log, no SLA breach tracking, no compliance audit trail", severity: "medium", impact: "Compliance audits require manual reconstruction — 40 hrs/quarter" },
];

const EVENT_LISTENER_SPEC = {
  eventName: "hold_created",
  source: "risk-engine.events.hold_created",
  consumer: "hold-case-service",
  idempotencyKey: "risk_event_id + merchant_id",
  retryPolicy: { maxRetries: 3, backoffMs: [1000, 5000, 15000], dlq: "hold-case-dlq" },
  fieldsPopulated: ["hold_id", "merchant_id", "hold_type", "amount_held", "opened_at", "status (= 'open')", "triggering_rule_id", "confidence_score"],
  fieldsNull: ["assigned_team", "required_documents[]", "resolution_eta"],
  testCases: [
    { name: "Happy path — chargeback hold", input: "Valid hold_created event with type=chargeback_risk", expected: "New case record with status=open, amount_held populated", status: "pass" },
    { name: "Happy path — volume spike", input: "Valid hold_created with type=volume_spike, spike_multiplier=4.2", expected: "Case created, assigned_team=null, resolution_eta=null", status: "pass" },
    { name: "Idempotency — duplicate event", input: "Same risk_event_id + merchant_id sent twice", expected: "Second write is no-op, no duplicate case", status: "pass" },
    { name: "Retry after transient DB failure", input: "First write fails (connection timeout), event re-delivered", expected: "Case created on retry, no data loss", status: "pass" },
    { name: "Malformed event — missing merchant_id", input: "hold_created event with null merchant_id", expected: "Event rejected, routed to DLQ with error context", status: "pass" },
    { name: "Unknown hold_type", input: "hold_created with type='custom_flag' (not in enum)", expected: "Event rejected, DLQ'd — strict enum validation", status: "pass" },
    { name: "High-volume burst — 500 events/sec", input: "Load test: 500 concurrent hold_created events", expected: "All cases created within 2s, zero duplicates, zero drops", status: "pass" },
  ],
};

const CONTENT_POLICY = [
  { holdType: "Chargeback Risk", merchantVisible: "Your account is under review due to a transaction dispute. Please upload the requested documents to expedite resolution.", redacted: "Specific rule ID, velocity thresholds, fraud pattern match details, confidence score", rationale: "Exposing detection logic enables adversarial circumvention" },
  { holdType: "Volume Spike", merchantVisible: "We noticed unusual processing volume on your account. This hold is precautionary — if the increase is expected (seasonal, promotion), please provide supporting documentation.", redacted: "Exact multiplier threshold (3x), baseline calculation window, peer comparison data", rationale: "Threshold disclosure allows structured evasion (staying at 2.9x)" },
  { holdType: "New Account Review", merchantVisible: "As part of our standard onboarding process, new accounts undergo enhanced verification for the first 90 days. Please complete the document checklist below.", redacted: "Nothing — this is a standard compliance process, not fraud-triggered", rationale: "Full transparency is safe; improves merchant trust during onboarding" },
  { holdType: "Manual Flag", merchantVisible: "Your account has been placed under review by our compliance team. A case manager will contact you within [SLA] business days.", redacted: "Flag source (law enforcement, internal investigation, external report), analyst identity, case linkage", rationale: "Legal and operational sensitivity — disclosure could compromise active investigations" },
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

function FHT001AuditView() {
  const [expandedHold, setExpandedHold] = useState(null);
  const [expandedGap, setExpandedGap] = useState(null);

  return (
    <div style={{
      background: FV.bg, borderRadius: 28, width: 340, minHeight: 640,
      overflow: "hidden", boxShadow: "0 8px 40px rgba(249,115,22,0.10)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: `1px solid ${FV.border}`,
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: FV.textPrimary }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: FV.accent, background: FV.accentGlow, padding: "2px 6px", borderRadius: 4 }}>FHT-001</span>
          <span style={{ fontSize: 9, color: FV.textMuted }}>Discovery</span>
        </div>
      </div>
      <div style={{ padding: "8px 20px 14px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: FV.textPrimary, margin: 0 }}>Hold Event Schema Audit</h3>
        <p style={{ fontSize: 10, color: FV.accent, margin: "4px 0 0", fontWeight: 600 }}>Risk Engine — Current State Assessment</p>
      </div>

      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: FV.card, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.red, letterSpacing: 0.5, marginBottom: 6 }}>SCHEMA HEALTH</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { label: "Monthly Holds", value: "37.6K", color: FV.accent },
              { label: "Avg Resolution", value: "5.8 days", color: FV.amber },
              { label: "Fields Present", value: "4–6", color: FV.blue },
              { label: "Fields Missing", value: "6–8", color: FV.red },
            ].map((m, i) => (
              <div key={i} style={{ background: `${m.color}08`, borderRadius: 8, padding: "8px 8px", textAlign: "center", border: `1px solid ${m.color}15` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 8, color: FV.textMuted, fontWeight: 600, letterSpacing: 0.3 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.accent, letterSpacing: 0.5, marginBottom: 6, marginTop: 12 }}>HOLD TYPES — FIELD COVERAGE</div>
        {HOLD_TYPES.map((ht, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <div onClick={() => setExpandedHold(expandedHold === i ? null : i)} style={{
              background: FV.card, borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              border: expandedHold === i ? `1px solid ${ht.color}33` : `1px solid ${FV.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{ht.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: FV.textPrimary }}>{ht.label}</span>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: ht.color, fontWeight: 600 }}>{ht.pctOfTotal}%</span>
                  <span style={{ fontSize: 9, color: FV.textMuted }}>{(ht.monthlyVolume / 1000).toFixed(1)}K/mo</span>
                </div>
              </div>
              {expandedHold === i && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: FV.textSecondary, lineHeight: 1.5, marginBottom: 8 }}>{ht.description}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: FV.emerald, marginBottom: 4 }}>PRESENT ({ht.currentFields.length})</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                    {ht.currentFields.map((f, j) => (
                      <span key={j} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: FV.emeraldGlow, color: FV.emerald, fontFamily: "'JetBrains Mono', monospace" }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: FV.red, marginBottom: 4 }}>MISSING ({ht.missingFields.length})</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {ht.missingFields.map((f, j) => (
                      <span key={j} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: FV.redGlow, color: FV.red, fontFamily: "'JetBrains Mono', monospace" }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 9, color: FV.textMuted }}>Avg resolution: <span style={{ color: FV.amber, fontWeight: 700 }}>{ht.avgResolutionDays} days</span></div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.red, letterSpacing: 0.5, marginBottom: 6, marginTop: 14 }}>GAP ANALYSIS</div>
        {GAP_ANALYSIS.map((gap, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <div onClick={() => setExpandedGap(expandedGap === i ? null : i)} style={{
              background: FV.card, borderRadius: 10, padding: "8px 12px", cursor: "pointer",
              border: `1px solid ${FV.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: FV.textPrimary }}>{gap.category}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  background: gap.severity === "critical" ? FV.redGlow : gap.severity === "high" ? FV.amberGlow : FV.blueGlow,
                  color: gap.severity === "critical" ? FV.red : gap.severity === "high" ? FV.amber : FV.blue,
                  textTransform: "uppercase",
                }}>{gap.severity}</span>
              </div>
              {expandedGap === i && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 9, color: FV.emerald, marginBottom: 2 }}>Existing: {gap.existing}</div>
                  <div style={{ fontSize: 9, color: FV.red, marginBottom: 4 }}>Gap: {gap.gap}</div>
                  <div style={{ fontSize: 9, color: FV.textSecondary, fontStyle: "italic" }}>Impact: {gap.impact}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FHT002DataModelView() {
  const [expandedField, setExpandedField] = useState(null);

  return (
    <div style={{
      background: "linear-gradient(180deg, #0B1120 0%, #111827 40%, #0F172A 100%)",
      borderRadius: 28, width: 340, minHeight: 640, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(59,130,246,0.12)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: `1px solid ${FV.border}`,
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: FV.textPrimary }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: FV.blue, background: FV.blueGlow, padding: "2px 6px", borderRadius: 4 }}>FHT-002</span>
          <span style={{ fontSize: 9, color: FV.textMuted }}>Backend</span>
        </div>
      </div>
      <div style={{ padding: "8px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #3B82F6, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>FV</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: FV.textPrimary, margin: 0 }}>Hold Case Data Model</h3>
            <p style={{ fontSize: 10, color: FV.blue, margin: 0, fontWeight: 600 }}>Normalized Case Entity — New Service</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: FV.card, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.blue, letterSpacing: 0.5, marginBottom: 8 }}>ENTITY: hold_cases</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[
              { label: "Fields", value: "12", color: FV.blue },
              { label: "Enums", value: "2", color: FV.purple },
              { label: "Indexes", value: "4", color: FV.emerald },
            ].map((m, i) => (
              <div key={i} style={{ background: `${m.color}08`, borderRadius: 8, padding: "6px 4px", textAlign: "center", border: `1px solid ${m.color}15` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 8, color: FV.textMuted, fontWeight: 600 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.blue, letterSpacing: 0.5, marginBottom: 6 }}>SCHEMA DEFINITION</div>
        {HOLD_CASE_SCHEMA.map((field, i) => (
          <div key={i} style={{ marginBottom: 3 }}>
            <div onClick={() => setExpandedField(expandedField === i ? null : i)} style={{
              background: FV.card, borderRadius: 8, padding: "7px 10px", cursor: "pointer",
              border: expandedField === i ? `1px solid ${FV.blue}33` : `1px solid ${FV.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: FV.textPrimary, fontFamily: "'JetBrains Mono', monospace" }}>{field.field}</span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <span style={{
                    fontSize: 8, fontWeight: 600, padding: "1px 5px", borderRadius: 3,
                    background: field.type === "UUID" ? FV.purpleGlow : field.type === "ENUM" ? FV.accentGlow : field.type === "TIMESTAMP" ? FV.emeraldGlow : field.type === "JSONB[]" ? FV.amberGlow : FV.blueGlow,
                    color: field.type === "UUID" ? FV.purple : field.type === "ENUM" ? FV.accent : field.type === "TIMESTAMP" ? FV.emerald : field.type === "JSONB[]" ? FV.amber : FV.blue,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{field.type}</span>
                </div>
              </div>
              {expandedField === i && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 9, color: FV.textMuted, marginBottom: 2 }}>Source: <span style={{ color: FV.accent }}>{field.source}</span></div>
                  <div style={{ fontSize: 9, color: FV.textSecondary, lineHeight: 1.4 }}>{field.description}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.purple, letterSpacing: 0.5, marginBottom: 6, marginTop: 12 }}>API CONTRACT</div>
        <div style={{ background: FV.card, borderRadius: 10, padding: 10, border: `1px solid ${FV.border}`, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 9, color: FV.emerald, marginBottom: 4 }}>POST /api/v1/hold-cases</div>
          <div style={{ fontSize: 8, color: FV.textMuted, marginBottom: 6 }}>Risk Engine → Case Service (internal only)</div>
          <div style={{ fontSize: 9, color: FV.blue, marginBottom: 2 }}>GET /api/v1/hold-cases/:hold_id</div>
          <div style={{ fontSize: 8, color: FV.textMuted, marginBottom: 6 }}>Returns case detail (merchant-safe fields only)</div>
          <div style={{ fontSize: 9, color: FV.amber, marginBottom: 2 }}>PATCH /api/v1/hold-cases/:hold_id/status</div>
          <div style={{ fontSize: 8, color: FV.textMuted }}>Status transitions (validates state machine)</div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.emerald, letterSpacing: 0.5, marginBottom: 6, marginTop: 12 }}>DESIGN PRINCIPLES</div>
        {[
          { rule: "Decoupled from risk engine", detail: "Own database, own service — read-only dependency on risk events" },
          { rule: "Strict enum validation", detail: "hold_type and status use Postgres enums, not strings" },
          { rule: "Merchant-safe by default", detail: "API responses exclude triggering_rule_id and confidence_score unless internal caller" },
        ].map((p, i) => (
          <div key={i} style={{ background: FV.card, borderRadius: 8, padding: "7px 10px", marginBottom: 3, border: `1px solid ${FV.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: FV.emerald }}>{p.rule}</div>
            <div style={{ fontSize: 9, color: FV.textSecondary }}>{p.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FHT003EventListenerView() {
  return (
    <div style={{
      background: "linear-gradient(180deg, #0B1120 0%, #0F172A 100%)",
      borderRadius: 28, width: 340, minHeight: 640, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(16,185,129,0.10)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: `1px solid ${FV.border}`,
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: FV.textPrimary }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: FV.emerald, background: FV.emeraldGlow, padding: "2px 6px", borderRadius: 4 }}>FHT-003</span>
          <span style={{ fontSize: 9, color: FV.textMuted }}>Backend</span>
        </div>
      </div>
      <div style={{ padding: "8px 20px 14px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: FV.textPrimary, margin: 0 }}>Event Listener</h3>
        <p style={{ fontSize: 10, color: FV.emerald, margin: "4px 0 0", fontWeight: 600 }}>hold_created Consumer — Idempotent Case Writer</p>
      </div>

      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: FV.card, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.emerald, letterSpacing: 0.5, marginBottom: 8 }}>EVENT FLOW</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { step: "1", label: "Risk Engine fires hold_created", color: FV.red, detail: "Event bus (Kafka/SQS)" },
              { step: "2", label: "Consumer validates schema", color: FV.amber, detail: "Reject malformed → DLQ" },
              { step: "3", label: "Idempotency check", color: FV.blue, detail: "risk_event_id + merchant_id" },
              { step: "4", label: "Write hold_cases record", color: FV.emerald, detail: "status = 'open', team = null" },
              { step: "5", label: "Emit case_created event", color: FV.purple, detail: "Downstream listeners" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: s.color }}>{s.step}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: FV.textPrimary }}>{s.label}</div>
                  <div style={{ fontSize: 8, color: FV.textMuted }}>{s.detail}</div>
                </div>
                {i < 4 && <div style={{ fontSize: 10, color: FV.textMuted }}>↓</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: FV.card, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.amber, letterSpacing: 0.5, marginBottom: 6 }}>RETRY POLICY</div>
          <div style={{ display: "flex", gap: 6 }}>
            {EVENT_LISTENER_SPEC.retryPolicy.backoffMs.map((ms, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", background: `${FV.amber}08`, borderRadius: 6, padding: "6px 4px", border: `1px solid ${FV.amber}15` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: FV.amber }}>{ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}</div>
                <div style={{ fontSize: 8, color: FV.textMuted }}>Retry {i + 1}</div>
              </div>
            ))}
            <div style={{ flex: 1, textAlign: "center", background: FV.redGlow, borderRadius: 6, padding: "6px 4px", border: `1px solid ${FV.red}15` }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: FV.red }}>DLQ</div>
              <div style={{ fontSize: 8, color: FV.textMuted }}>After 3</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.emerald, letterSpacing: 0.5, marginBottom: 6 }}>INTEGRATION TESTS ({EVENT_LISTENER_SPEC.testCases.length}/{EVENT_LISTENER_SPEC.testCases.length} PASS)</div>
        {EVENT_LISTENER_SPEC.testCases.map((tc, i) => (
          <div key={i} style={{
            background: FV.card, borderRadius: 8, padding: "7px 10px", marginBottom: 3,
            border: `1px solid ${FV.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: FV.textPrimary }}>{tc.name}</span>
              <span style={{ fontSize: 8, fontWeight: 700, color: FV.emerald, background: FV.emeraldGlow, padding: "1px 5px", borderRadius: 3 }}>PASS</span>
            </div>
            <div style={{ fontSize: 8, color: FV.textMuted, marginTop: 2 }}>{tc.expected}</div>
          </div>
        ))}

        <div style={{ background: FV.card, borderRadius: 10, padding: 10, marginTop: 10, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.blue, letterSpacing: 0.5, marginBottom: 4 }}>FIELDS POPULATED AT CREATION</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
            {EVENT_LISTENER_SPEC.fieldsPopulated.map((f, i) => (
              <span key={i} style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: FV.emeraldGlow, color: FV.emerald, fontFamily: "'JetBrains Mono', monospace" }}>{f}</span>
            ))}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.textMuted, letterSpacing: 0.5, marginBottom: 4 }}>NULL AT CREATION (backfilled later)</div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {EVENT_LISTENER_SPEC.fieldsNull.map((f, i) => (
              <span key={i} style={{ fontSize: 8, padding: "2px 5px", borderRadius: 3, background: `${FV.textMuted}15`, color: FV.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FHT004ContentPolicyView() {
  const [expandedPolicy, setExpandedPolicy] = useState(null);

  return (
    <div style={{
      background: "linear-gradient(180deg, #0B1120 0%, #1E1033 40%, #0F172A 100%)",
      borderRadius: 28, width: 340, minHeight: 640, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(139,92,246,0.10)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: `1px solid ${FV.border}`,
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: FV.textPrimary }}>9:41</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: FV.purple, background: FV.purpleGlow, padding: "2px 6px", borderRadius: 4 }}>FHT-004</span>
          <span style={{ fontSize: 9, color: FV.textMuted }}>Process</span>
        </div>
      </div>
      <div style={{ padding: "8px 20px 14px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: FV.textPrimary, margin: 0 }}>Content Policy</h3>
        <p style={{ fontSize: 10, color: FV.purple, margin: "4px 0 0", fontWeight: 600 }}>Risk & Compliance Sign-Off — What Merchants See</p>
      </div>

      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: FV.card, borderRadius: 12, padding: 12, marginBottom: 10, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.purple, letterSpacing: 0.5, marginBottom: 6 }}>GUIDING PRINCIPLE</div>
          <div style={{ fontSize: 10, color: FV.textSecondary, lineHeight: 1.6 }}>
            Merchants deserve <span style={{ color: FV.emerald, fontWeight: 700 }}>transparency about the process</span> without exposing <span style={{ color: FV.red, fontWeight: 700 }}>detection logic</span> that enables adversarial behavior. Each hold type has a signed-off disclosure level.
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: FV.purple, letterSpacing: 0.5, marginBottom: 6 }}>DISCLOSURE MATRIX</div>
        {CONTENT_POLICY.map((cp, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <div onClick={() => setExpandedPolicy(expandedPolicy === i ? null : i)} style={{
              background: FV.card, borderRadius: 10, padding: "10px 12px", cursor: "pointer",
              border: expandedPolicy === i ? `1px solid ${FV.purple}33` : `1px solid ${FV.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: FV.textPrimary }}>{cp.holdType}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  background: cp.holdType === "New Account Review" ? FV.emeraldGlow : FV.amberGlow,
                  color: cp.holdType === "New Account Review" ? FV.emerald : FV.amber,
                }}>{cp.holdType === "New Account Review" ? "FULL DISCLOSURE" : "PARTIAL"}</span>
              </div>
              {expandedPolicy === i && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: FV.emerald, marginBottom: 3 }}>MERCHANT SEES:</div>
                  <div style={{
                    fontSize: 10, color: FV.textSecondary, lineHeight: 1.5, marginBottom: 8,
                    borderLeft: `3px solid ${FV.emerald}`, paddingLeft: 8, background: FV.emeraldGlow, borderRadius: "0 6px 6px 0", padding: "6px 8px 6px 10px",
                  }}>"{cp.merchantVisible}"</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: FV.red, marginBottom: 3 }}>REDACTED:</div>
                  <div style={{ fontSize: 9, color: FV.textMuted, lineHeight: 1.4, marginBottom: 6 }}>{cp.redacted}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: FV.textMuted, marginBottom: 2 }}>RATIONALE:</div>
                  <div style={{ fontSize: 9, color: FV.textSecondary, fontStyle: "italic", lineHeight: 1.4 }}>{cp.rationale}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ background: FV.card, borderRadius: 12, padding: 12, marginTop: 12, border: `1px solid ${FV.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: FV.amber, letterSpacing: 0.5, marginBottom: 8 }}>STAKEHOLDER SIGN-OFF</div>
          {[
            { team: "Risk Engineering", signedBy: "VP Risk", status: "approved", date: "Sprint 1 · Week 1" },
            { team: "Compliance & Legal", signedBy: "Chief Compliance Officer", status: "approved", date: "Sprint 1 · Week 1" },
            { team: "Merchant Experience", signedBy: "Dir. Merchant Success", status: "approved", date: "Sprint 1 · Week 2" },
            { team: "Product (FHT)", signedBy: "PM — Fund Hold Transparency", status: "approved", date: "Sprint 1 · Week 2" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 3 ? `1px solid ${FV.border}` : "none" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: FV.textPrimary }}>{s.team}</div>
                <div style={{ fontSize: 8, color: FV.textMuted }}>{s.signedBy} · {s.date}</div>
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, color: FV.emerald, background: FV.emeraldGlow, padding: "2px 6px", borderRadius: 4 }}>APPROVED</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sprint1HoldDetection() {
  const [activeTicket, setActiveTicket] = useState("fht001");

  const tickets = [
    { key: "fht001", label: "FHT-001 · Audit", color: FV.accent },
    { key: "fht002", label: "FHT-002 · Data Model", color: FV.blue },
    { key: "fht003", label: "FHT-003 · Event Listener", color: FV.emerald },
    { key: "fht004", label: "FHT-004 · Content Policy", color: FV.purple },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(59,130,246,0.06) 50%, rgba(16,185,129,0.04) 100%)",
        borderRadius: 16, padding: 16, marginBottom: 16,
        border: "1px solid rgba(249,115,22,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #F97316, #EA580C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 900, letterSpacing: 0.5 }}>FV</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>Sprint 1 — Hold Detection & Data Model</div>
            <div style={{ fontSize: 10, color: "#F97316", fontWeight: 600 }}>Weeks 1–2 · Foundation</div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "#374151", lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: "#0F172A" }}>The Problem:</strong> Fiserv processes fund holds for thousands of merchants, but the hold event schema is fragmented — no structured hold_type enum, no resolution_eta, no document checklist linkage. Merchants see a generic "under review" message with zero visibility into progress. Average hold resolution takes 5.8 days with 23% of holds never actively worked. This sprint audits the current schema, defines the normalized Hold Case data model, builds the event listener, and aligns stakeholders on what can be surfaced to merchants.
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {tickets.map(t => (
          <div key={t.key} onClick={() => setActiveTicket(t.key)} style={{
            flex: 1, minWidth: 120, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "center",
            background: activeTicket === t.key ? t.color : "#fff",
            color: activeTicket === t.key ? "#fff" : t.color,
            fontSize: 11, fontWeight: 700, border: `1px solid ${t.color}30`,
            transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {activeTicket === "fht001" && <FHT001AuditView />}
        {activeTicket === "fht002" && <FHT002DataModelView />}
        {activeTicket === "fht003" && <FHT003EventListenerView />}
        {activeTicket === "fht004" && <FHT004ContentPolicyView />}
      </div>
    </div>
  );
}
