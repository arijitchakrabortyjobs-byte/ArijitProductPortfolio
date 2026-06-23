import { useState } from "react";
import {
  funnelBaseline,
  signalInventory,
  sprintRoadmap,
  rankingRules,
  coldStartFormula,
} from "./mockData";
import Sprint3MLModel from "./Sprint3MLModel";
import Sprint4UI from "./Sprint4UI";

const ACCENT = "#6366f1";
const CARD_BG = "#1e1b4b";
const SURFACE = "#0f0e2a";
const BORDER = "#312e81";

const pill = (label, color) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
    {label}
  </span>
);

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

function FunnelSection() {
  const max = funnelBaseline[0].users;
  return (
    <div>
      <SectionHeader number="1" title="Funnel Baseline — Bus Booking" subtitle="US-1.1 · End-to-end instrumentation across 6 steps" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gap: 14 }}>
          {funnelBaseline.map((step, i) => {
            const isDropOff = i > 0 && step.conversion < 60;
            return (
              <div key={step.step}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#a5b4fc", fontSize: 12, fontWeight: 600, width: 72 }}>{step.step}</span>
                    <span style={{ color: "#c7d2fe", fontSize: 12 }}>{step.label}</span>
                    {isDropOff && <span style={{ background: "#ef444422", color: "#f87171", border: "1px solid #ef444455", borderRadius: 999, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>KEY DROP-OFF</span>}
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <span style={{ color: "#818cf8", fontSize: 12 }}>{step.users.toLocaleString()} users</span>
                    <span style={{ color: i === 0 ? "#a5b4fc" : step.conversion < 60 ? "#f87171" : "#34d399", fontWeight: 700, fontSize: 13, width: 48, textAlign: "right" }}>
                      {i === 0 ? "100%" : `${step.conversion}%`}
                    </span>
                  </div>
                </div>
                <div style={{ background: "#1e1b4b", borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(step.users / max) * 100}%`,
                    background: step.conversion < 60 && i > 0 ? "linear-gradient(90deg, #ef4444, #f97316)" : `linear-gradient(90deg, ${ACCENT}, #818cf8)`,
                    borderRadius: 4,
                    transition: "width 0.6s ease"
                  }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, padding: "12px 16px", background: "#0f0e2a", borderRadius: 8, border: "1px solid #ef444433" }}>
          <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 600 }}>Overall Search → Paid Conversion: <span style={{ color: "#f87171", fontSize: 14 }}>12.96%</span></div>
          <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>Biggest drop: Seat Map → Payment Init (45%). Primary target for Sprints 2–4.</div>
        </div>
      </div>
    </div>
  );
}

function SignalSection() {
  const correlationColor = { Strong: "#34d399", Moderate: "#fbbf24", Weak: "#f87171" };
  return (
    <div>
      <SectionHeader number="2" title="Signal Inventory" subtitle="US-1.2 · 12 signals catalogued · Top 8 shortlisted for ML model" />
      <div style={{ background: CARD_BG, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 80px 70px 70px", padding: "10px 16px", background: "#0f0e2a", borderBottom: `1px solid ${BORDER}` }}>
          {["ID", "Signal", "Coverage", "Correlation", "Sprint", "Status"].map(h => (
            <span key={h} style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {signalInventory.map((s, i) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 90px 80px 70px 70px", padding: "12px 16px", borderBottom: i < signalInventory.length - 1 ? `1px solid ${BORDER}` : "none", alignItems: "center" }}>
            <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 700 }}>{s.id}</span>
            <span style={{ color: "#e0e7ff", fontSize: 13 }}>{s.name}</span>
            <div>
              <div style={{ background: "#1e1b4b", borderRadius: 4, height: 6, width: "80%", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${s.availability}%`, background: s.availability > 60 ? "#34d399" : s.availability > 30 ? "#fbbf24" : "#f87171", borderRadius: 4 }} />
              </div>
              <span style={{ color: "#6b7280", fontSize: 10 }}>{s.availability}%</span>
            </div>
            <span style={{ color: correlationColor[s.correlation] || "#a5b4fc", fontSize: 12, fontWeight: 600 }}>{s.correlation}</span>
            <span style={{ color: "#a5b4fc", fontSize: 12 }}>Sprint {s.sprint}</span>
            {s.status === "ready"
              ? pill("Ready", "#34d399")
              : pill("Gap", "#f87171")}
          </div>
        ))}
      </div>
    </div>
  );
}

function ColdStartSection() {
  return (
    <div>
      <SectionHeader number="3" title="Cold-Start Formula" subtitle="US-1.3 · Ranking formula for users with zero booking history" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {coldStartFormula.map(f => (
            <div key={f.label} style={{ background: SURFACE, borderRadius: 10, padding: 16, border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: "#c7d2fe", fontSize: 13, fontWeight: 600 }}>{f.label}</span>
                <span style={{ color: f.color, fontSize: 20, fontWeight: 800 }}>{f.weight}%</span>
              </div>
              <div style={{ background: "#1e1b4b", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${f.weight}%`, background: f.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
          <div style={{ background: SURFACE, borderRadius: 10, padding: 16, border: `1px solid #34d39933` }}>
            <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>Formula</div>
            <code style={{ color: "#34d399", fontSize: 11, lineHeight: 1.8 }}>
              score = 0.40 × popularity<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.35 × reliability<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 0.25 × time_fit
            </code>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "0 bookings", desc: "Full cold-start formula", badge: "Top picks for this route", color: "#6366f1" },
            { label: "1 booking", desc: "50% cold-start + 50% affinity", badge: "Partial personalization", color: "#8b5cf6" },
            { label: "3+ bookings", desc: "Full ML model activated", badge: "Picked for you", color: "#34d399" },
          ].map(g => (
            <div key={g.label} style={{ background: SURFACE, borderRadius: 8, padding: 12, border: `1px solid ${g.color}44` }}>
              <div style={{ color: g.color, fontWeight: 700, fontSize: 13 }}>{g.label}</div>
              <div style={{ color: "#9ca3af", fontSize: 11, margin: "4px 0" }}>{g.desc}</div>
              <div style={{ background: g.color + "22", color: g.color, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600, display: "inline-block" }}>"{g.badge}"</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RankingRulesSection() {
  return (
    <div>
      <SectionHeader number="4" title="Rule-Based Ranking v1" subtitle="Sprint 2 · Three deterministic personalization rules before ML model" />
      <div style={{ display: "grid", gap: 14 }}>
        {rankingRules.map((r, i) => (
          <div key={r.rule} style={{ background: CARD_BG, borderRadius: 12, padding: 20, border: `1px solid ${r.color}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: r.color + "22", color: r.color, borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  {i + 1}
                </div>
                <span style={{ color: "#e0e7ff", fontWeight: 700, fontSize: 15 }}>{r.rule}</span>
              </div>
              <span style={{ background: r.color + "22", color: r.color, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{r.boost}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["Trigger", r.trigger], ["Coverage", r.coverage], ["Decay", r.decay]].map(([label, val]) => (
                <div key={label} style={{ background: SURFACE, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ color: "#6b7280", fontSize: 10, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ color: "#c7d2fe", fontSize: 12 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SprintRoadmap() {
  return (
    <div>
      <SectionHeader number="5" title="3-Month Roadmap" subtitle="6 sprints · 24 user stories · AI-Powered Personalized Bus Discovery" />
      <div style={{ display: "grid", gap: 12 }}>
        {sprintRoadmap.map(s => (
          <div key={s.sprint} style={{ background: CARD_BG, borderRadius: 12, padding: 18, border: `1px solid ${s.color}44` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: s.color, color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                  Sprint {s.sprint}
                </div>
                <span style={{ color: "#e0e7ff", fontWeight: 700 }}>{s.name}</span>
                <span style={{ color: "#6b7280", fontSize: 12 }}>{s.weeks}</span>
              </div>
              <span style={{ color: s.color, fontSize: 11, fontStyle: "italic" }}>{s.theme}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {s.stories.map(story => (
                <div key={story.id} style={{
                  background: story.status === "done" ? s.color + "22" : "#1e1b4b",
                  border: `1px solid ${story.status === "done" ? s.color : "#374151"}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span style={{ color: story.status === "done" ? s.color : "#4b5563", fontSize: 11, fontWeight: 700 }}>{story.id}</span>
                  <span style={{ color: story.status === "done" ? "#c7d2fe" : "#6b7280", fontSize: 12 }}>{story.title}</span>
                  {story.status === "done" && <span style={{ color: s.color, fontSize: 13 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MakeMyTripDashboard() {
  const [activeTab, setActiveTab] = useState("sprint1");
  const tabs = [
    { id: "sprint1", label: "Sprint 1 — Foundation" },
    { id: "sprint2", label: "Sprint 2 — Ranking v1" },
    { id: "sprint3", label: "Sprint 3 — ML Model" },
    { id: "sprint4", label: "Sprint 4 — UI & Cold Start" },
    { id: "roadmap", label: "Full Roadmap" },
  ];

  return (
    <div style={{ background: SURFACE, minHeight: "100vh", padding: "32px 24px", fontFamily: "'Inter', sans-serif", color: "#e0e7ff" }}>
      {/* Header */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#fff" }}>
              MakeMyTrip · PM Portfolio
            </div>
            <div style={{ background: "#34d39922", color: "#34d399", border: "1px solid #34d39944", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>
              Sprints 1–4 Implemented
            </div>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
            AI-Powered Ground Transport Discovery
          </h1>
          <p style={{ color: "#818cf8", fontSize: 14, margin: 0 }}>
            Personalized Bus Ranking Engine · Product Manager (Ground Transport) Application · RL4
          </p>
        </div>

        {/* KPI Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Overall Conversion", value: "12.96%", sub: "Search → Paid baseline", color: "#f87171" },
            { label: "Seat Map Drop-off", value: "45%", sub: "Biggest funnel leak", color: "#fbbf24" },
            { label: "Signals Catalogued", value: "12", sub: "Top 8 shortlisted for ML", color: "#34d399" },
            { label: "Sprints to Full Rollout", value: "6", sub: "3 months · 24 user stories", color: "#818cf8" },
          ].map(k => (
            <div key={k.label} style={{ background: CARD_BG, borderRadius: 12, padding: "16px 18px", border: `1px solid ${BORDER}` }}>
              <div style={{ color: k.color, fontSize: 24, fontWeight: 800 }}>{k.value}</div>
              <div style={{ color: "#e0e7ff", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{k.label}</div>
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: CARD_BG, padding: 4, borderRadius: 10, border: `1px solid ${BORDER}`, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? ACCENT : "transparent",
              color: activeTab === t.id ? "#fff" : "#818cf8",
              border: "none",
              borderRadius: 7,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: "grid", gap: 32 }}>
          {activeTab === "sprint1" && (
            <>
              <FunnelSection />
              <SignalSection />
              <ColdStartSection />
            </>
          )}
          {activeTab === "sprint2" && (
            <>
              <RankingRulesSection />
            </>
          )}
          {activeTab === "sprint3" && <Sprint3MLModel />}
          {activeTab === "sprint4" && <Sprint4UI />}
          {activeTab === "roadmap" && (
            <>
              <SprintRoadmap />
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#4b5563", fontSize: 12 }}>Arijit Chakraborty · Product Manager (Ground Transport) · MakeMyTrip RL4 Application</span>
          <a href="https://github.com/arijitchakrabortyjobs-byte/ArijitProductPortfolio" target="_blank" rel="noreferrer" style={{ color: "#6366f1", fontSize: 12, textDecoration: "none" }}>View on GitHub →</a>
        </div>
      </div>
    </div>
  );
}
