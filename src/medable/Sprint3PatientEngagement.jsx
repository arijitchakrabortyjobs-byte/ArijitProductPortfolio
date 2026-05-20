import { useState } from "react";

const ENGAGEMENT_CHANNELS = [
  { name: "Smart Notifications", icon: "🔔", active: true, sent: 1247, opened: 892, acted: 634, openRate: 71.5, actionRate: 50.8 },
  { name: "Video Check-ins", icon: "📹", active: true, sent: 486, opened: 412, acted: 389, openRate: 84.8, actionRate: 80.0 },
  { name: "eCOA Reminders", icon: "📋", active: true, sent: 2103, opened: 1842, acted: 1654, openRate: 87.6, actionRate: 78.6 },
  { name: "Travel Assistance", icon: "🚗", active: true, sent: 312, opened: 298, acted: 276, openRate: 95.5, actionRate: 88.5 },
  { name: "Peer Support", icon: "👥", active: false, sent: 0, opened: 0, acted: 0, openRate: 0, actionRate: 0 },
];

const PATIENT_TIMELINE = [
  { time: "Today, 9:15 AM", type: "checkin", title: "Morning wellness check-in", detail: "Sarah completed daily symptom diary — all within normal range", status: "complete", icon: "✅" },
  { time: "Today, 8:30 AM", type: "nudge", title: "Smart reminder sent", detail: "\"Your Visit 10 is tomorrow at 2:00 PM — we've arranged parking near entrance B\"", status: "delivered", icon: "🔔" },
  { time: "Yesterday, 4:20 PM", type: "video", title: "Coordinator video check-in", detail: "Discussed side effect concerns — adjusted schedule to reduce burden", status: "complete", icon: "📹" },
  { time: "Yesterday, 10:00 AM", type: "ecoa", title: "eCOA completed", detail: "Quality of Life questionnaire submitted — 3 min completion time", status: "complete", icon: "📋" },
  { time: "2 days ago", type: "travel", title: "Travel assistance confirmed", detail: "Ride scheduled for Visit 10 — pickup at 1:15 PM", status: "confirmed", icon: "🚗" },
  { time: "3 days ago", type: "milestone", title: "Trial milestone reached", detail: "\"Congratulations! You've completed 75% of the study — your contribution matters\"", status: "sent", icon: "🎉" },
  { time: "5 days ago", type: "nudge", title: "Engagement nudge", detail: "Personalized progress summary with lab results trending positive", status: "opened", icon: "📊" },
];

const JOURNEY_SCREENS = [
  { name: "Home", desc: "Personalized dashboard with upcoming visits, progress, and wellness tracking" },
  { name: "My Schedule", desc: "Trial visit calendar with reminders, travel coordination, and reschedule options" },
  { name: "Health Diary", desc: "Daily symptom logging, mood tracking, and eCOA submissions in under 3 minutes" },
  { name: "Messages", desc: "Direct secure messaging with coordinator, automated check-ins, and support resources" },
];

const ENGAGEMENT_METRICS = {
  before: { retention: 62, engagement: 48, ecoaCompletion: 54, satisfaction: 3.1, avgResponseTime: "18h", missedVisits: 34 },
  after: { retention: 89, engagement: 82, ecoaCompletion: 91, satisfaction: 4.6, avgResponseTime: "2.1h", missedVisits: 8 },
};

export default function Sprint3PatientEngagement() {
  const [tab, setTab] = useState("app");
  const [activeScreen, setActiveScreen] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState(null);

  return (
    <div style={{
      background: "linear-gradient(180deg, #f5f0ff 0%, #faf8ff 40%, #ffffff 100%)",
      borderRadius: 28, width: 340, minHeight: 620, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(124,58,237,0.12)",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(124,58,237,0.1)",
      margin: "0 auto",
    }}>
      <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2 }} />
      </div>
      <div style={{ padding: "4px 20px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>M</span>
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", margin: 0 }}>Patient Engagement Hub</h3>
            <p style={{ fontSize: 10, color: "#7c3aed", margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Sprint 3 — Prototype + Test</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "2px solid rgba(124,58,237,0.08)" }}>
        {[
          { key: "app", label: "Patient App" },
          { key: "channels", label: "Channels" },
          { key: "impact", label: "Before / After" },
        ].map(t => (
          <div key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "8px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            color: tab === t.key ? "#7c3aed" : "#9ca3af",
            borderBottom: tab === t.key ? "2px solid #7c3aed" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{t.label}</div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", maxHeight: 440, overflowY: "auto" }}>
        {tab === "app" && (
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {JOURNEY_SCREENS.map((s, i) => (
                <div key={i} onClick={() => setActiveScreen(i)} style={{
                  flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer", textAlign: "center",
                  background: activeScreen === i ? "#7c3aed" : "#fff",
                  color: activeScreen === i ? "#fff" : "#7c3aed",
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                  border: activeScreen === i ? "1px solid #7c3aed" : "1px solid rgba(124,58,237,0.1)",
                  transition: "all 0.2s",
                }}>{s.name}</div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 14, marginBottom: 14, border: "1px solid rgba(124,58,237,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 4 }}>{JOURNEY_SCREENS[activeScreen].name}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>{JOURNEY_SCREENS[activeScreen].desc}</div>
              {activeScreen === 0 && (
                <div>
                  <div style={{ background: "linear-gradient(135deg, #f5f0ff, #ede9fe)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>YOUR PROGRESS</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>75%</div><div style={{ fontSize: 9, color: "#9ca3af" }}>Complete</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>9/12</div><div style={{ fontSize: 9, color: "#9ca3af" }}>Visits Done</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: "#7c3aed" }}>94%</div><div style={{ fontSize: 9, color: "#9ca3af" }}>Engagement</div></div>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(124,58,237,0.1)" }}>
                      <div style={{ width: "75%", height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #7c3aed, #a78bfa)" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>NEXT UP</div>
                  <div style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid rgba(124,58,237,0.08)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>Visit 10 — Blood Draw + Assessment</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>Tomorrow, 2:00 PM · Ride confirmed · Est. 45 min</div>
                  </div>
                </div>
              )}
              {activeScreen === 1 && (
                <div>
                  {["Visit 10 — Tomorrow 2:00 PM", "Phone Check-in — Jun 15", "Visit 11 — Jun 22", "eCOA Due — Jun 25"].map((v, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(124,58,237,0.04)" : "none" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? "#7c3aed" : "#ddd5f5" }} />
                      <span style={{ fontSize: 11, color: "#1e1b4b", fontWeight: i === 0 ? 700 : 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeScreen === 2 && (
                <div>
                  {["Symptom check — Normal ✓", "Mood — Good (4/5)", "Sleep — 7.2 hrs avg", "Side effects — None reported"].map((d, i) => (
                    <div key={i} style={{ padding: "8px 10px", background: i % 2 === 0 ? "rgba(124,58,237,0.03)" : "#fff", borderRadius: 6, marginBottom: 2, fontSize: 11, color: "#374151" }}>{d}</div>
                  ))}
                </div>
              )}
              {activeScreen === 3 && (
                <div>
                  {[
                    { from: "Dr. Martinez", msg: "Your labs look great — keep it up!", time: "2h ago" },
                    { from: "Study Team", msg: "Reminder: please fast before tomorrow's visit", time: "5h ago" },
                    { from: "Support", msg: "Your ride for tomorrow is confirmed", time: "Yesterday" },
                  ].map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(124,58,237,0.04)" : "none" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #ede9fe, #ddd6fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#7c3aed", flexShrink: 0 }}>{m.from[0]}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b" }}>{m.from} <span style={{ fontWeight: 400, color: "#9ca3af", fontSize: 9 }}>{m.time}</span></div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{m.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 0.5 }}>RECENT ACTIVITY</div>
            {PATIENT_TIMELINE.slice(0, 5).map((e, i) => (
              <div key={i} onClick={() => setExpandedEvent(expandedEvent === i ? null : i)} style={{
                display: "flex", gap: 8, padding: "8px 10px", background: "#fff", borderRadius: 8,
                marginBottom: 4, cursor: "pointer", border: "1px solid rgba(124,58,237,0.04)",
              }}>
                <span style={{ fontSize: 14 }}>{e.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#1e1b4b" }}>{e.title}</div>
                  {expandedEvent === i && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{e.detail}</div>}
                  <div style={{ fontSize: 9, color: "#c4b5fd", marginTop: 2 }}>{e.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "channels" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: 12, marginBottom: 14, border: "1px solid rgba(124,58,237,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 0.5 }}>OMNICHANNEL ENGAGEMENT</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                5 coordinated channels replace fragmented communication — each touchpoint personalized by patient risk profile and preferences.
              </div>
            </div>
            {ENGAGEMENT_CHANNELS.map((ch, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 12, padding: 12, marginBottom: 6,
                border: "1px solid rgba(124,58,237,0.06)",
                opacity: ch.active ? 1 : 0.5,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b" }}>{ch.icon} {ch.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ch.active ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.04)", color: ch.active ? "#22c55e" : "#9ca3af", letterSpacing: 0.5 }}>{ch.active ? "ACTIVE" : "PLANNED"}</span>
                </div>
                {ch.active && (
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                      {[
                        { label: "Sent", value: ch.sent.toLocaleString() },
                        { label: "Opened", value: ch.opened.toLocaleString() },
                        { label: "Acted", value: ch.acted.toLocaleString() },
                      ].map((m, j) => (
                        <div key={j} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#1e1b4b" }}>{m.value}</div>
                          <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 2 }}>Open Rate</div>
                        <div style={{ height: 6, borderRadius: 3, background: "rgba(124,58,237,0.06)" }}>
                          <div style={{ width: `${ch.openRate}%`, height: "100%", borderRadius: 3, background: "#7c3aed" }} />
                        </div>
                        <div style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700, marginTop: 2 }}>{ch.openRate}%</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 8, color: "#9ca3af", marginBottom: 2 }}>Action Rate</div>
                        <div style={{ height: 6, borderRadius: 3, background: "rgba(34,197,94,0.06)" }}>
                          <div style={{ width: `${ch.actionRate}%`, height: "100%", borderRadius: 3, background: "#22c55e" }} />
                        </div>
                        <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, marginTop: 2 }}>{ch.actionRate}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "impact" && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 8, letterSpacing: 0.5 }}>BEFORE → AFTER ENGAGEMENT HUB</div>
            {[
              { label: "Retention Rate", before: ENGAGEMENT_METRICS.before.retention + "%", after: ENGAGEMENT_METRICS.after.retention + "%", delta: "+27pp", good: true },
              { label: "Engagement Score", before: ENGAGEMENT_METRICS.before.engagement + "%", after: ENGAGEMENT_METRICS.after.engagement + "%", delta: "+34pp", good: true },
              { label: "eCOA Completion", before: ENGAGEMENT_METRICS.before.ecoaCompletion + "%", after: ENGAGEMENT_METRICS.after.ecoaCompletion + "%", delta: "+37pp", good: true },
              { label: "Patient Satisfaction", before: ENGAGEMENT_METRICS.before.satisfaction + "/5", after: ENGAGEMENT_METRICS.after.satisfaction + "/5", delta: "+48%", good: true },
              { label: "Avg Response Time", before: ENGAGEMENT_METRICS.before.avgResponseTime, after: ENGAGEMENT_METRICS.after.avgResponseTime, delta: "-88%", good: true },
              { label: "Missed Visits/Month", before: ENGAGEMENT_METRICS.before.missedVisits.toString(), after: ENGAGEMENT_METRICS.after.missedVisits.toString(), delta: "-76%", good: true },
            ].map((m, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 10, padding: 12, marginBottom: 6,
                border: "1px solid rgba(124,58,237,0.06)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1e1b4b", marginBottom: 8 }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#ef4444", fontWeight: 600, marginBottom: 2 }}>BEFORE</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#9ca3af" }}>{m.before}</div>
                  </div>
                  <div style={{ fontSize: 16, color: "#7c3aed" }}>→</div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 600, marginBottom: 2 }}>AFTER</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b" }}>{m.after}</div>
                  </div>
                  <div style={{
                    padding: "4px 8px", borderRadius: 6,
                    background: "rgba(34,197,94,0.1)",
                    fontSize: 11, fontWeight: 800, color: "#22c55e",
                  }}>{m.delta}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-around", padding: "10px 16px",
        background: "rgba(124,58,237,0.03)", borderTop: "1px solid rgba(124,58,237,0.06)",
      }}>
        {[
          { label: "Retention", value: "89%" },
          { label: "eCOA", value: "91%" },
          { label: "CSAT", value: "4.6" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1e1b4b" }}>{s.value}</div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
