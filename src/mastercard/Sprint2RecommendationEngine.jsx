import { useState, useEffect, useRef } from "react";

const SUBSCRIPTIONS = [
  { id: 1, name: "Netflix Premium", amount: 22.99, category: "Streaming", icon: "🎬", color: "#E50914", usageScore: 92, renewDate: "Jun 3", renewDay: 3 },
  { id: 2, name: "Spotify Family", amount: 16.99, category: "Music", icon: "🎵", color: "#1DB954", usageScore: 95, renewDate: "Jun 7", renewDay: 7 },
  { id: 3, name: "Hulu + Live TV", amount: 76.99, category: "Streaming", icon: "📺", color: "#1CE783", usageScore: 12, renewDate: "May 28", renewDay: 28, ghost: true },
  { id: 4, name: "Adobe Creative Cloud", amount: 59.99, category: "Productivity", icon: "🎨", color: "#FF0000", usageScore: 78, renewDate: "Jun 15", renewDay: 15 },
  { id: 5, name: "YouTube Premium", amount: 13.99, category: "Streaming", icon: "▶️", color: "#FF0000", usageScore: 88, renewDate: "Jun 1", renewDay: 1 },
  { id: 6, name: "Amazon Prime", amount: 14.99, category: "Shopping", icon: "📦", color: "#FF9900", usageScore: 85, renewDate: "Jul 22", renewDay: 22 },
  { id: 7, name: "Apple iCloud+ 2TB", amount: 9.99, category: "Cloud", icon: "☁️", color: "#007AFF", usageScore: 99, renewDate: "Jun 10", renewDay: 10 },
  { id: 8, name: "Calm Premium", amount: 5.83, category: "Wellness", icon: "🧘", color: "#4A90D9", usageScore: 4, renewDate: "Dec 1", renewDay: 1, ghost: true },
  { id: 9, name: "Peacock Premium", amount: 7.99, category: "Streaming", icon: "🦚", color: "#0096E6", usageScore: 8, renewDate: "Jun 20", renewDay: 20, ghost: true },
  { id: 10, name: "ChatGPT Plus", amount: 20.00, category: "AI Tools", icon: "🤖", color: "#10A37F", usageScore: 97, renewDate: "Jun 5", renewDay: 5 },
  { id: 11, name: "Dropbox Plus", amount: 11.99, category: "Cloud", icon: "💧", color: "#0061FF", usageScore: 6, renewDate: "Jun 18", renewDay: 18, ghost: true },
  { id: 12, name: "NYT Digital", amount: 4.25, category: "News", icon: "📰", color: "#121212", usageScore: 42, renewDate: "Jun 2", renewDay: 2 },
];

const RECOMMENDATIONS = [
  {
    id: "overlap-streaming",
    type: "overlap",
    severity: "high",
    title: "Streaming Overlap Detected",
    description: "You have 4 streaming services but only actively use 2. Netflix + YouTube Premium cover 94% of your watch time.",
    services: [1, 3, 5, 9],
    savingsAmount: 84.98,
    action: "Review streaming stack",
  },
  {
    id: "ghost-cancel",
    type: "ghost",
    severity: "high",
    title: "4 Ghost Subscriptions Found",
    description: "Calm, Peacock, Dropbox, and Hulu haven't been used in 30+ days. Cancel or pause to save $102.80/mo.",
    services: [3, 8, 9, 11],
    savingsAmount: 102.80,
    action: "Start cancel flow",
  },
  {
    id: "downgrade-adobe",
    type: "downgrade",
    severity: "medium",
    title: "Adobe — Downgrade Available",
    description: "You primarily use Photoshop and Illustrator. The Photography Plan at $9.99/mo covers both — save $50/mo.",
    services: [4],
    savingsAmount: 50.00,
    action: "View alternatives",
  },
  {
    id: "cloud-consolidate",
    type: "overlap",
    severity: "low",
    title: "Cloud Storage Consolidation",
    description: "iCloud (2TB) + Dropbox overlap. Moving files to iCloud saves $11.99/mo with no storage loss.",
    services: [7, 11],
    savingsAmount: 11.99,
    action: "Compare plans",
  },
];

const CALENDAR_EVENTS = [
  { day: 1, subs: [5, 8] },
  { day: 2, subs: [12] },
  { day: 3, subs: [1] },
  { day: 5, subs: [10] },
  { day: 7, subs: [2] },
  { day: 10, subs: [7] },
  { day: 15, subs: [4] },
  { day: 18, subs: [11] },
  { day: 20, subs: [9] },
  { day: 22, subs: [6] },
];

const SAVE_OFFERS = {
  "Hulu + Live TV": [
    { type: "downgrade", label: "Switch to Hulu Basic", price: "$7.99/mo", savings: "$69.00", icon: "📉", desc: "Keep on-demand content, drop live TV" },
    { type: "pause", label: "Pause for 3 months", price: "$0.00/mo", savings: "$230.97", icon: "⏸️", desc: "Resume anytime, keep your watchlist" },
    { type: "discount", label: "50% off for 6 months", price: "$38.50/mo", savings: "$231.00", icon: "🏷️", desc: "Exclusive Mastercard retention offer" },
  ],
  "Peacock Premium": [
    { type: "downgrade", label: "Switch to Free Tier", price: "$0.00/mo", savings: "$95.88", icon: "📉", desc: "Ads-supported, still 50K+ hours" },
    { type: "pause", label: "Pause for 2 months", price: "$0.00/mo", savings: "$15.98", icon: "⏸️", desc: "Come back for NFL season" },
    { type: "discount", label: "Annual plan — $49.99/yr", price: "$4.17/mo", savings: "$45.89", icon: "🏷️", desc: "Save 48% with yearly commitment" },
  ],
  "Dropbox Plus": [
    { type: "downgrade", label: "Switch to Basic (2GB)", price: "$0.00/mo", savings: "$143.88", icon: "📉", desc: "Free tier, migrate files to iCloud" },
    { type: "pause", label: "Pause for 1 month", price: "$0.00/mo", savings: "$11.99", icon: "⏸️", desc: "Keep files, pause billing" },
    { type: "discount", label: "Annual plan — $99.99/yr", price: "$8.33/mo", savings: "$43.89", icon: "🏷️", desc: "Save 31% going annual" },
  ],
  "Calm Premium": [
    { type: "downgrade", label: "Switch to Free Tier", price: "$0.00/mo", savings: "$69.96", icon: "📉", desc: "Limited meditations, daily calm" },
    { type: "pause", label: "Pause until needed", price: "$0.00/mo", savings: "$5.83", icon: "⏸️", desc: "Reactivate when you need it" },
    { type: "discount", label: "Lifetime deal — $299", price: "One-time", savings: "∞", icon: "🏷️", desc: "Never pay monthly again" },
  ],
};

function AnimatedBar({ targetWidth, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(targetWidth), 300 + delay);
    return () => clearTimeout(t);
  }, [targetWidth, delay]);
  return (
    <div style={{
      height: 28, borderRadius: 6, background: color,
      width: `${width}%`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
      display: "flex", alignItems: "center", justifyContent: "flex-end",
      paddingRight: width > 15 ? 8 : 0, minWidth: width > 0 ? 2 : 0,
    }}>
      {width > 15 && (
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>
          ${(targetWidth * 2.66).toFixed(0)}
        </span>
      )}
    </div>
  );
}

function RecommendationsTab({ visible, onStartSaveFlow }) {
  const severityColors = { high: "#ef4444", medium: "#f59e0b", low: "#3b82f6" };
  const typeIcons = { overlap: "🔄", ghost: "👻", downgrade: "📉" };

  const totalSavings = RECOMMENDATIONS.reduce((s, r) => s + r.savingsAmount, 0);
  const waterfallData = RECOMMENDATIONS.map(r => ({
    label: r.title.split(" ")[0],
    amount: r.savingsAmount,
    pct: (r.savingsAmount / 265.99) * 100,
    color: severityColors[r.severity],
  }));

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* AI Insights Header */}
      <div style={{
        margin: "0 16px 16px", padding: "16px",
        background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08))",
        borderRadius: 16, border: "1px solid rgba(59,130,246,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>🧠</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: 1.5, textTransform: "uppercase" }}>AI Analysis Complete</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span style={{ fontSize: 32, fontWeight: 800, color: "#22c55e", fontFamily: "'DM Sans', sans-serif" }}>${totalSavings.toFixed(0)}</span>
            <span style={{ fontSize: 13, color: "rgba(248,250,252,0.4)", marginLeft: 6 }}>/mo potential savings</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)" }}>
            {RECOMMENDATIONS.length} recommendations
          </div>
        </div>
      </div>

      {/* Savings Waterfall */}
      <div style={{ margin: "0 16px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 12 }}>
          Savings Waterfall
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {waterfallData.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, color: "rgba(248,250,252,0.4)", width: 70, textAlign: "right", flexShrink: 0 }}>{d.label}</span>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 6, overflow: "hidden" }}>
                <AnimatedBar targetWidth={d.pct} color={d.color} delay={i * 150} />
              </div>
            </div>
          ))}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8, marginTop: 4,
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(248,250,252,0.5)", width: 70, textAlign: "right" }}>Total</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#22c55e" }}>${totalSavings.toFixed(2)}/mo</span>
          </div>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px" }}>
        {RECOMMENDATIONS.map((rec, i) => {
          const subs = rec.services.map(id => SUBSCRIPTIONS.find(s => s.id === id));
          return (
            <div key={rec.id} style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 16,
              border: `1px solid ${severityColors[rec.severity]}15`,
              padding: "16px", overflow: "hidden",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.1}s`,
            }}>
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{typeIcons[rec.type]}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    color: severityColors[rec.severity],
                    background: `${severityColors[rec.severity]}12`,
                    padding: "3px 8px", borderRadius: 6,
                  }}>{rec.severity} priority</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#22c55e" }}>
                  -${rec.savingsAmount.toFixed(0)}
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>{rec.title}</div>
              <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)", lineHeight: 1.5, marginBottom: 12 }}>{rec.description}</div>

              {/* Affected services */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {subs.map(sub => (
                  <div key={sub.id} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "rgba(255,255,255,0.04)", borderRadius: 8,
                    padding: "4px 10px",
                  }}>
                    <span style={{ fontSize: 12 }}>{sub.icon}</span>
                    <span style={{ fontSize: 10, color: "rgba(248,250,252,0.5)", fontWeight: 500 }}>{sub.name}</span>
                    <span style={{ fontSize: 10, color: "rgba(248,250,252,0.25)" }}>${sub.amount}</span>
                  </div>
                ))}
              </div>

              {/* Action button */}
              <button
                onClick={() => {
                  if (rec.type === "ghost") onStartSaveFlow(SUBSCRIPTIONS.find(s => s.id === 3));
                }}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10,
                  border: `1px solid ${severityColors[rec.severity]}30`,
                  background: `${severityColors[rec.severity]}10`,
                  color: severityColors[rec.severity], cursor: "pointer",
                  fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                  transition: "all 0.2s",
                }}
              >
                {rec.action} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTab({ visible }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const startOffset = 6; // June 2026 starts on Saturday

  const getSubsForDay = (day) => {
    const event = CALENDAR_EVENTS.find(e => e.day === day);
    if (!event) return [];
    return event.subs.map(id => SUBSCRIPTIONS.find(s => s.id === id));
  };

  const today = 14;

  const upcomingRenewals = CALENDAR_EVENTS
    .filter(e => e.day >= 1)
    .slice(0, 6)
    .map(e => ({
      day: e.day,
      subs: e.subs.map(id => SUBSCRIPTIONS.find(s => s.id === id)),
      total: e.subs.reduce((sum, id) => sum + SUBSCRIPTIONS.find(s => s.id === id).amount, 0),
    }));

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Month header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 20px", marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>June 2026</div>
          <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)", marginTop: 2 }}>
            10 renewals · $265.99 total
          </div>
        </div>
        <div style={{
          background: "rgba(245,158,11,0.1)", borderRadius: 10, padding: "8px 12px",
          border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b", textAlign: "center" }}>3</div>
          <div style={{ fontSize: 8, color: "rgba(248,250,252,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>days until</div>
          <div style={{ fontSize: 8, color: "rgba(248,250,252,0.3)", letterSpacing: 1 }}>next renewal</div>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {dayNames.map((d, i) => (
            <div key={i} style={{
              textAlign: "center", fontSize: 10, fontWeight: 600,
              color: "rgba(248,250,252,0.2)", padding: "6px 0",
            }}>{d}</div>
          ))}
          {Array.from({ length: startOffset }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const subs = getSubsForDay(day);
            const hasRenewal = subs.length > 0;
            const hasGhost = subs.some(s => s.ghost);
            const isSelected = selectedDay === day;
            const total = subs.reduce((s, sub) => s + sub.amount, 0);

            return (
              <div
                key={day}
                onClick={() => hasRenewal && setSelectedDay(isSelected ? null : day)}
                style={{
                  position: "relative", textAlign: "center",
                  padding: "8px 2px", borderRadius: 10, cursor: hasRenewal ? "pointer" : "default",
                  background: isSelected ? "rgba(59,130,246,0.15)" : hasRenewal ? "rgba(255,255,255,0.02)" : "transparent",
                  border: isSelected ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  fontSize: 13, fontWeight: hasRenewal ? 700 : 400,
                  color: hasGhost ? "#f87171" : hasRenewal ? "#f8fafc" : "rgba(248,250,252,0.2)",
                }}>{day}</div>
                {hasRenewal && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
                    {subs.slice(0, 3).map((sub, i) => (
                      <div key={i} style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: sub.ghost ? "#ef4444" : sub.color,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div style={{
          margin: "0 16px 16px", padding: "14px",
          background: "rgba(59,130,246,0.05)", borderRadius: 14,
          border: "1px solid rgba(59,130,246,0.1)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#60a5fa", marginBottom: 10 }}>
            June {selectedDay} — Renewals
          </div>
          {getSubsForDay(selectedDay).map(sub => (
            <div key={sub.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{sub.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>{sub.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)" }}>
                    {sub.ghost ? "👻 Ghost — consider canceling before renewal" : `Usage: ${sub.usageScore}%`}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: sub.ghost ? "#ef4444" : "#f8fafc",
              }}>${sub.amount}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming renewals timeline */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 12 }}>
          Upcoming Renewals
        </div>
        {upcomingRenewals.map((event, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12,
            opacity: visible ? 1 : 0,
            transition: `opacity 0.5s ${0.3 + i * 0.08}s`,
          }}>
            {/* Timeline dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: event.subs.some(s => s.ghost) ? "#ef4444" : "#3b82f6",
                border: "2px solid #0c0f1a",
              }} />
              {i < upcomingRenewals.length - 1 && (
                <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(248,250,252,0.5)" }}>Jun {event.day}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: event.subs.some(s => s.ghost) ? "#f87171" : "#f8fafc" }}>
                  ${event.total.toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                {event.subs.map(sub => (
                  <span key={sub.id} style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 6,
                    background: sub.ghost ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                    color: sub.ghost ? "#f87171" : "rgba(248,250,252,0.5)",
                    border: sub.ghost ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  }}>
                    {sub.icon} {sub.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cancel deadline warning */}
      <div style={{
        margin: "8px 16px 0", padding: "14px 16px",
        background: "rgba(239,68,68,0.06)", borderRadius: 14,
        border: "1px solid rgba(239,68,68,0.1)",
        display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>⏰</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>Cancel Before Deadlines</div>
          <div style={{ fontSize: 11, color: "rgba(248,250,252,0.4)", lineHeight: 1.5 }}>
            Hulu renews May 28 — <span style={{ color: "#f87171", fontWeight: 600 }}>cancel by May 25</span> to avoid $76.99 charge.
            Peacock renews Jun 20 — cancel by Jun 17.
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveFlowTab({ visible, initialSub }) {
  const [selectedSub, setSelectedSub] = useState(initialSub || null);
  const [flowStep, setFlowStep] = useState("select"); // select, reason, offers, confirmed
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [cancelReason, setCancelReason] = useState(null);

  useEffect(() => {
    if (initialSub) {
      setSelectedSub(initialSub);
      setFlowStep("reason");
    }
  }, [initialSub]);

  const ghostSubs = SUBSCRIPTIONS.filter(s => s.ghost);
  const reasons = [
    { id: "not-using", label: "Not using it enough", icon: "😴" },
    { id: "too-expensive", label: "Too expensive", icon: "💸" },
    { id: "found-alternative", label: "Found an alternative", icon: "🔄" },
    { id: "temporary", label: "Just need a break", icon: "⏸️" },
  ];

  const resetFlow = () => {
    setSelectedSub(null);
    setFlowStep("select");
    setSelectedOffer(null);
    setCancelReason(null);
  };

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Ethoca badge */}
      <div style={{
        margin: "0 16px 16px", display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EB001B" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F79E1B", marginLeft: -4 }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(248,250,252,0.35)", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Powered by Ethoca Consumer Clarity
        </span>
      </div>

      {flowStep === "select" && (
        <>
          <div style={{ padding: "0 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>Manage Subscriptions</div>
            <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)", lineHeight: 1.5 }}>
              Cancel, pause, or downgrade directly from your bank. Merchants may offer savings to keep you.
            </div>
          </div>

          <div style={{ padding: "0 12px" }}>
            {ghostSubs.map((sub, i) => (
              <div
                key={sub.id}
                onClick={() => { setSelectedSub(sub); setFlowStep("reason"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 12px", borderRadius: 14, cursor: "pointer",
                  background: "rgba(239,68,68,0.03)", marginBottom: 6,
                  border: "1px solid rgba(239,68,68,0.08)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(20px)",
                  transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.08}s`,
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: `${sub.color}15`, fontSize: 20,
                }}>{sub.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: "#f87171", marginTop: 2 }}>
                    👻 Inactive 30+ days · Renews {sub.renewDate}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>${sub.amount}</div>
                  <div style={{ fontSize: 10, color: "rgba(248,250,252,0.25)" }}>/mo</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {flowStep === "reason" && selectedSub && (
        <div style={{ padding: "0 16px" }}>
          <button onClick={resetFlow} style={{
            background: "none", border: "none", color: "rgba(248,250,252,0.4)",
            fontSize: 12, cursor: "pointer", padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4,
          }}>← Back</button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, display: "flex",
              alignItems: "center", justifyContent: "center",
              background: `${selectedSub.color}15`, fontSize: 24,
            }}>{selectedSub.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>Cancel {selectedSub.name}?</div>
              <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)" }}>${selectedSub.amount}/mo · {selectedSub.category}</div>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(248,250,252,0.5)", marginBottom: 12 }}>
            Why are you canceling?
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reasons.map(r => (
              <button
                key={r.id}
                onClick={() => { setCancelReason(r.id); setFlowStep("offers"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  color: "#f8fafc", fontSize: 13, fontWeight: 500,
                  textAlign: "left", transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {flowStep === "offers" && selectedSub && (
        <div style={{ padding: "0 16px" }}>
          <button onClick={() => setFlowStep("reason")} style={{
            background: "none", border: "none", color: "rgba(248,250,252,0.4)",
            fontSize: 12, cursor: "pointer", padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4,
          }}>← Back</button>

          <div style={{
            padding: "16px", marginBottom: 16, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.08))",
            border: "1px solid rgba(34,197,94,0.12)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              Wait — {selectedSub.name.split(" ")[0]} has offers for you
            </div>
            <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", lineHeight: 1.5 }}>
              Before you cancel, the merchant wants to offer you alternatives via Mastercard's Ethoca network.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(SAVE_OFFERS[selectedSub.name] || []).map((offer, i) => (
              <div
                key={i}
                onClick={() => { setSelectedOffer(offer); setFlowStep("confirmed"); }}
                style={{
                  padding: "16px", borderRadius: 14, cursor: "pointer",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{offer.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{offer.label}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#22c55e",
                    background: "rgba(34,197,94,0.1)", padding: "3px 8px", borderRadius: 6,
                  }}>Save {offer.savings}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,0.4)", marginBottom: 6 }}>{offer.desc}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>New price: {offer.price}</div>
              </div>
            ))}
          </div>

          {/* Still cancel option */}
          <button
            onClick={() => { setSelectedOffer({ type: "cancel", label: "Full Cancel" }); setFlowStep("confirmed"); }}
            style={{
              width: "100%", marginTop: 16, padding: "12px", borderRadius: 12,
              background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            No thanks, cancel anyway
          </button>
        </div>
      )}

      {flowStep === "confirmed" && selectedSub && selectedOffer && (
        <div style={{ padding: "0 16px", textAlign: "center" }}>
          <button onClick={resetFlow} style={{
            background: "none", border: "none", color: "rgba(248,250,252,0.4)",
            fontSize: 12, cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: 4,
          }}>← Start over</button>

          <div style={{
            padding: "32px 24px", borderRadius: 20,
            background: selectedOffer.type === "cancel"
              ? "rgba(239,68,68,0.04)"
              : "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.06))",
            border: selectedOffer.type === "cancel"
              ? "1px solid rgba(239,68,68,0.1)"
              : "1px solid rgba(34,197,94,0.12)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {selectedOffer.type === "cancel" ? "✅" : selectedOffer.type === "pause" ? "⏸️" : selectedOffer.type === "discount" ? "🎉" : "📉"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>
              {selectedOffer.type === "cancel" ? "Subscription Canceled" : `${selectedOffer.label}`}
            </div>
            <div style={{ fontSize: 13, color: "rgba(248,250,252,0.4)", lineHeight: 1.6, marginBottom: 20 }}>
              {selectedOffer.type === "cancel"
                ? `${selectedSub.name} has been canceled. You won't be charged again after your current billing period.`
                : `Your change to ${selectedSub.name} has been processed via Ethoca. The merchant has confirmed your new plan.`}
            </div>

            {selectedOffer.type !== "cancel" && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(34,197,94,0.1)", borderRadius: 10,
                padding: "10px 20px", border: "1px solid rgba(34,197,94,0.15)",
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#22c55e" }}>
                  {selectedOffer.savings}
                </span>
                <span style={{ fontSize: 11, color: "rgba(248,250,252,0.4)" }}>saved</span>
              </div>
            )}

            <div style={{
              marginTop: 20, padding: "12px 16px", borderRadius: 10,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{ display: "flex" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EB001B" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F79E1B", marginLeft: -3 }} />
              </div>
              <span style={{ fontSize: 10, color: "rgba(248,250,252,0.3)", letterSpacing: 1 }}>
                Processed via Mastercard Ethoca Network
              </span>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      {flowStep === "select" && (
        <div style={{
          margin: "20px 16px 0", padding: "16px",
          background: "rgba(255,255,255,0.02)", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "rgba(248,250,252,0.3)", marginBottom: 12 }}>
            How the Save Flow Works
          </div>
          {[
            { step: "1", label: "You initiate cancel", desc: "Tell us why, from your banking app" },
            { step: "2", label: "Ethoca notifies merchant", desc: "Real-time communication bridge" },
            { step: "3", label: "Merchant sends offers", desc: "Downgrade, pause, or discount" },
            { step: "4", label: "You choose", desc: "Accept offer or proceed with cancel" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.03)" : "none",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                background: "rgba(59,130,246,0.1)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#60a5fa",
              }}>{item.step}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>{item.label}</div>
                <div style={{ fontSize: 10, color: "rgba(248,250,252,0.35)" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default function Sprint2RecommendationEngine() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("recommend");
  const [saveFlowSub, setSaveFlowSub] = useState(null);

  useEffect(() => { setVisible(true); }, []);

  const handleStartSaveFlow = (sub) => {
    setSaveFlowSub(sub);
    setActiveTab("save");
  };

  const tabs = [
    { key: "recommend", label: "AI Insights", icon: "🧠" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "save", label: "Save Flow", icon: "🛡️" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#06080f",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Background texture */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none",
        background: "radial-gradient(ellipse at 30% 20%, rgba(168,85,247,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(34,197,94,0.04) 0%, transparent 60%)",
      }} />

      {/* Header */}
      <div style={{
        padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* Sprint badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", borderRadius: 8,
            padding: "6px 14px", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#EB001B" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#F79E1B", marginLeft: -5 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(248,250,252,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>Mastercard</span>
          </div>
          <div style={{
            background: "rgba(168,85,247,0.1)", color: "#c084fc",
            padding: "6px 14px", borderRadius: 8, fontSize: 11,
            fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
            border: "1px solid rgba(168,85,247,0.15)",
          }}>
            Sprint 2 — Ideate + Prototype
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", lineHeight: 1.2 }}>
          AI Recommendation Engine
        </h1>
        <p style={{ fontSize: 16, color: "rgba(248,250,252,0.4)", margin: "0 0 32px", maxWidth: 640, lineHeight: 1.6 }}>
          From health scores to actionable intelligence — AI-powered savings recommendations, renewal calendar, and merchant save flow via Ethoca.
        </p>
      </div>

      {/* Mobile App Frame */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px",
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: 390, borderRadius: 32, overflow: "hidden",
          background: "#0c0f1a",
          boxShadow: "0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s",
        }}>
          {/* Status bar */}
          <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>9:41</span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 16, height: 10, border: "1.5px solid #f8fafc", borderRadius: 2, position: "relative" }}>
                <div style={{ position: "absolute", right: 1.5, top: 1.5, bottom: 1.5, left: 1.5, background: "#22c55e", borderRadius: 0.5 }} />
              </div>
            </div>
          </div>

          {/* App header */}
          <div style={{ padding: "12px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ display: "flex" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#EB001B", opacity: 0.9 }} />
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#F79E1B", opacity: 0.9, marginLeft: -6 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(248,250,252,0.35)", letterSpacing: 2, textTransform: "uppercase" }}>
                Smart Subscriptions
              </span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", margin: "0 0 14px" }}>
              {activeTab === "recommend" ? "Recommendations" : activeTab === "calendar" ? "Renewal Calendar" : "Manage & Save"}
            </h3>
          </div>

          {/* Tab bar */}
          <div style={{
            display: "flex", gap: 2, padding: "0 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key !== "save") setSaveFlowSub(null); }}
                style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10,
                  border: "none", cursor: "pointer",
                  background: activeTab === tab.key ? "rgba(255,255,255,0.08)" : "transparent",
                  transition: "all 0.2s", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: activeTab === tab.key ? "#f8fafc" : "rgba(248,250,252,0.3)",
                  letterSpacing: 0.3,
                }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ maxHeight: 600, overflowY: "auto" }}>
            {activeTab === "recommend" && <RecommendationsTab visible={visible} onStartSaveFlow={handleStartSaveFlow} />}
            {activeTab === "calendar" && <CalendarTab visible={visible} />}
            {activeTab === "save" && <SaveFlowTab visible={visible} initialSub={saveFlowSub} />}
          </div>

          {/* Bottom safe area */}
          <div style={{ height: 20, background: "#0c0f1a" }} />
        </div>
      </div>

      {/* Bottom insight bar */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px",
      }}>
        <div style={{
          padding: "24px 32px", borderRadius: 16,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24,
          opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Sprint 2 — Design Thinking: Ideate + Prototype</div>
            <div style={{ fontSize: 14, color: "rgba(248,250,252,0.6)", lineHeight: 1.6, maxWidth: 520 }}>
              Layered AI intelligence on Sprint 1's health scores. The recommendation engine detects <span style={{ color: "#c084fc", fontWeight: 600 }}>overlap patterns</span>,
              the calendar visualizes <span style={{ color: "#60a5fa", fontWeight: 600 }}>renewal pressure</span>,
              and the save flow reduces chargebacks via <span style={{ color: "#f59e0b", fontWeight: 600 }}>Ethoca merchant bridge</span>.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Save Rate", value: "73%", color: "#22c55e" },
              { label: "Avg Savings", value: "$62", color: "#3b82f6" },
              { label: "NPS Lift", value: "+41", color: "#c084fc" },
            ].map((m, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "8px 16px",
                background: "rgba(255,255,255,0.02)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)", letterSpacing: 0.5, marginTop: 2 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
