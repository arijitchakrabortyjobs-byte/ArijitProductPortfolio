import { useState, useEffect, useRef } from "react";

const SUBSCRIPTIONS = [
  { id: 1, name: "Netflix Premium", rawName: "NFLX DIGITAL*2847", amount: 22.99, category: "Streaming", icon: "🎬", color: "#E50914", lastUsed: "2 days ago", usageScore: 92, daysInactive: 2, renewDate: "Jun 3" },
  { id: 2, name: "Spotify Family", rawName: "SPOTIFY USA*FAM", amount: 16.99, category: "Music", icon: "🎵", color: "#1DB954", lastUsed: "Today", usageScore: 95, daysInactive: 0, renewDate: "Jun 7" },
  { id: 3, name: "Hulu + Live TV", rawName: "HULU *LIVE 84829", amount: 76.99, category: "Streaming", icon: "📺", color: "#1CE783", lastUsed: "38 days ago", usageScore: 12, daysInactive: 38, renewDate: "May 28" },
  { id: 4, name: "Adobe Creative Cloud", rawName: "ADOBE *CREATIVE", amount: 59.99, category: "Productivity", icon: "🎨", color: "#FF0000", lastUsed: "5 days ago", usageScore: 78, daysInactive: 5, renewDate: "Jun 15" },
  { id: 5, name: "YouTube Premium", rawName: "GOOGLE*YTPREM", amount: 13.99, category: "Streaming", icon: "▶️", color: "#FF0000", lastUsed: "1 day ago", usageScore: 88, daysInactive: 1, renewDate: "Jun 1" },
  { id: 6, name: "Amazon Prime", rawName: "AMZN MKTP US*PR", amount: 14.99, category: "Shopping", icon: "📦", color: "#FF9900", lastUsed: "3 days ago", usageScore: 85, daysInactive: 3, renewDate: "Jul 22" },
  { id: 7, name: "Apple iCloud+ 2TB", rawName: "APPLE.COM/US BILL", amount: 9.99, category: "Cloud", icon: "☁️", color: "#007AFF", lastUsed: "Always on", usageScore: 99, daysInactive: 0, renewDate: "Jun 10" },
  { id: 8, name: "Calm Premium", rawName: "CALM.COM*ANNUAL", amount: 5.83, category: "Wellness", icon: "🧘", color: "#4A90D9", lastUsed: "67 days ago", usageScore: 4, daysInactive: 67, renewDate: "Dec 1" },
  { id: 9, name: "Peacock Premium", rawName: "PCCK*PREMIUM NBU", amount: 7.99, category: "Streaming", icon: "🦚", color: "#0096E6", lastUsed: "52 days ago", usageScore: 8, daysInactive: 52, renewDate: "Jun 20" },
  { id: 10, name: "ChatGPT Plus", rawName: "OPENAI *CHATGPT", amount: 20.00, category: "AI Tools", icon: "🤖", color: "#10A37F", lastUsed: "Today", usageScore: 97, daysInactive: 0, renewDate: "Jun 5" },
  { id: 11, name: "Dropbox Plus", rawName: "DROPBOX*PLUS PLAN", amount: 11.99, category: "Cloud", icon: "💧", color: "#0061FF", lastUsed: "44 days ago", usageScore: 6, daysInactive: 44, renewDate: "Jun 18" },
  { id: 12, name: "NYT Digital", rawName: "NYTIMES*DIGI SUB", amount: 4.25, category: "News", icon: "📰", color: "#121212", lastUsed: "12 days ago", usageScore: 42, daysInactive: 12, renewDate: "Jun 2" },
];

const HEALTH_SCORE = 61;
const MONTHLY_TOTAL = SUBSCRIPTIONS.reduce((s, sub) => s + sub.amount, 0);
const POTENTIAL_SAVINGS = SUBSCRIPTIONS.filter(s => s.usageScore < 20).reduce((s, sub) => s + sub.amount, 0);
const GHOST_COUNT = SUBSCRIPTIONS.filter(s => s.daysInactive > 30).length;

function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1200, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
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

function HealthRing({ score, size = 160, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const timer = setTimeout(() => setOffset(circ - (score / 100) * circ), 300);
    return () => clearTimeout(timer);
  }, [score, circ]);
  const color = score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 42, fontWeight: 700, color: "#f8fafc", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
          <AnimatedNumber value={score} duration={1500} />
        </span>
        <span style={{ fontSize: 11, color: "rgba(248,250,252,0.5)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>Health</span>
      </div>
    </div>
  );
}

function GhostBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "rgba(239,68,68,0.12)", color: "#f87171",
      padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
      letterSpacing: 0.5, textTransform: "uppercase",
      border: "1px solid rgba(239,68,68,0.2)"
    }}>
      👻 Ghost
    </span>
  );
}

function UsageBar({ score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(score), 400); return () => clearTimeout(t); }, [score]);
  const barColor = score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ width: 80, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 2, background: barColor, width: `${width}%`, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function AsIsView({ visible }) {
  const transactions = [
    { name: "NFLX DIGITAL*2847", date: "May 03", amount: -22.99 },
    { name: "SPOTIFY USA*FAM", date: "May 07", amount: -16.99 },
    { name: "HULU *LIVE 84829", date: "Apr 28", amount: -76.99 },
    { name: "ADOBE *CREATIVE", date: "May 15", amount: -59.99 },
    { name: "GOOGLE*YTPREM", date: "May 01", amount: -13.99 },
    { name: "AMZN MKTP US*PR", date: "Apr 22", amount: -14.99 },
    { name: "APPLE.COM/US BILL", date: "May 10", amount: -9.99 },
    { name: "CALM.COM*ANNUAL", date: "Dec 01", amount: -69.99 },
    { name: "PCCK*PREMIUM NBU", date: "Apr 20", amount: -7.99 },
    { name: "OPENAI *CHATGPT", date: "May 05", amount: -20.00 },
    { name: "DROPBOX*PLUS PLAN", date: "May 18", amount: -11.99 },
    { name: "NYTIMES*DIGI SUB", date: "May 02", amount: -4.25 },
    { name: "WHOLEFDS MKT #103", date: "May 12", amount: -67.43 },
    { name: "UBER   *TRIP", date: "May 11", amount: -24.50 },
    { name: "SHELL OIL 574726", date: "May 10", amount: -48.72 },
  ];
  return (
    <div style={{
      background: "#f5f5f5", borderRadius: 28, width: 320, minHeight: 620,
      overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      fontFamily: "'SF Pro Text', 'DM Sans', -apple-system, sans-serif",
      border: "1px solid rgba(0,0,0,0.08)"
    }}>
      {/* Status bar */}
      <div style={{ background: "#fff", padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 16, height: 10, border: "1.5px solid #1a1a1a", borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", right: 1.5, top: 1.5, bottom: 1.5, left: 1.5, background: "#1a1a1a", borderRadius: 0.5 }} />
          </div>
        </div>
      </div>
      {/* Header */}
      <div style={{ background: "#fff", padding: "8px 20px 16px" }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Transactions</h3>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>Recent Activity</p>
      </div>
      {/* Transaction list */}
      <div style={{ padding: "0 12px 20px", maxHeight: 480, overflowY: "auto" }}>
        {transactions.map((tx, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 12px", background: "#fff", borderRadius: 12,
            marginBottom: 2, borderBottom: "1px solid #f0f0f0"
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", fontFamily: "'SF Mono', 'Fira Code', monospace", letterSpacing: -0.3 }}>
                {tx.name}
              </div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{tx.date}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
              ${Math.abs(tx.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToBeView({ visible }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Streaming", "Productivity", "Cloud", "Other"];
  const filtered = activeCategory === "All" ? SUBSCRIPTIONS :
    activeCategory === "Other" ? SUBSCRIPTIONS.filter(s => !["Streaming","Productivity","Cloud"].includes(s.category)) :
    SUBSCRIPTIONS.filter(s => s.category === activeCategory);

  return (
    <div style={{
      background: "#0c0f1a", borderRadius: 28, width: 360, minHeight: 620,
      overflow: "hidden", boxShadow: "0 8px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
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

      {/* Header with Mastercard branding */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ display: "flex" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#EB001B", opacity: 0.9 }} />
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#F79E1B", opacity: 0.9, marginLeft: -6 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(248,250,252,0.35)", letterSpacing: 2, textTransform: "uppercase" }}>Smart Subscriptions</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Subscription Health</h3>
          </div>
          <HealthRing score={HEALTH_SCORE} size={80} stroke={5} />
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ padding: "16px 20px 12px", display: "flex", gap: 8 }}>
        {[
          { label: "Monthly", value: `$${MONTHLY_TOTAL.toFixed(0)}`, sub: `${SUBSCRIPTIONS.length} active`, color: "#3b82f6" },
          { label: "Savings", value: `$${POTENTIAL_SAVINGS.toFixed(0)}`, sub: "potential/mo", color: "#22c55e" },
          { label: "Ghosts", value: `${GHOST_COUNT}`, sub: "inactive 30d+", color: "#ef4444" },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 14,
            padding: "12px 10px", border: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 10, color: "rgba(248,250,252,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: "rgba(248,250,252,0.3)", marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Category pills */}
      <div style={{ padding: "4px 20px 8px", display: "flex", gap: 6, overflowX: "auto" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
            background: activeCategory === cat ? "rgba(255,255,255,0.12)" : "transparent",
            color: activeCategory === cat ? "#f8fafc" : "rgba(248,250,252,0.35)",
            transition: "all 0.2s"
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Subscription list */}
      <div style={{ padding: "4px 12px 20px", maxHeight: 340, overflowY: "auto" }}>
        {filtered.map((sub, i) => (
          <div key={sub.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px", borderRadius: 14,
            background: sub.usageScore < 20 ? "rgba(239,68,68,0.04)" : "transparent",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(20px)",
            transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.06}s`,
          }}>
            {/* Icon */}
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: `${sub.color}15`, fontSize: 18, flexShrink: 0
            }}>
              {sub.icon}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.name}</span>
                {sub.daysInactive > 30 && <GhostBadge />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(248,250,252,0.35)" }}>{sub.category}</span>
                <span style={{ fontSize: 10, color: "rgba(248,250,252,0.2)" }}>•</span>
                <span style={{ fontSize: 10, color: sub.daysInactive > 30 ? "#f87171" : "rgba(248,250,252,0.35)" }}>{sub.lastUsed}</span>
              </div>
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <UsageBar score={sub.usageScore} color={sub.color} />
                <span style={{ fontSize: 9, color: "rgba(248,250,252,0.3)" }}>{sub.usageScore}%</span>
              </div>
            </div>
            {/* Price + renew */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>${sub.amount}</div>
              <div style={{ fontSize: 9, color: "rgba(248,250,252,0.25)", marginTop: 2 }}>renews {sub.renewDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sprint1SubscriptionIntelligence() {
  const [visible, setVisible] = useState(false);
  const [activeView, setActiveView] = useState("split"); // split, asis, tobe

  useEffect(() => { setVisible(true); }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#06080f",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Background texture */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.4, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.04) 0%, transparent 60%)"
      }} />

      {/* Header */}
      <div style={{
        padding: "40px 40px 0", maxWidth: 1200, margin: "0 auto", position: "relative",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)"
      }}>
        {/* Sprint badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", borderRadius: 8,
            padding: "6px 14px", border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <div style={{ display: "flex" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#EB001B" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#F79E1B", marginLeft: -5 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(248,250,252,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>Mastercard</span>
          </div>
          <div style={{
            background: "rgba(59,130,246,0.1)", color: "#60a5fa",
            padding: "6px 14px", borderRadius: 8, fontSize: 11,
            fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
            border: "1px solid rgba(59,130,246,0.15)"
          }}>
            Sprint 1 — Empathize + Define
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", lineHeight: 1.2 }}>
          Smart Subscription Intelligence
        </h1>
        <p style={{ fontSize: 16, color: "rgba(248,250,252,0.4)", margin: "0 0 24px", maxWidth: 600, lineHeight: 1.6 }}>
          From cryptic transaction logs to intelligent subscription health — see the problem, then see the solution.
        </p>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, width: "fit-content", marginBottom: 32 }}>
          {[
            { key: "split", label: "Split View" },
            { key: "asis", label: "AS-IS (Current)" },
            { key: "tobe", label: "TO-BE (Proposed)" },
          ].map(v => (
            <button key={v.key} onClick={() => setActiveView(v.key)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 600,
              background: activeView === v.key ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeView === v.key ? "#f8fafc" : "rgba(248,250,252,0.35)",
              transition: "all 0.2s"
            }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main comparison area */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "flex-start",
          gap: 60, flexWrap: "wrap"
        }}>
          {/* AS-IS side */}
          {(activeView === "split" || activeView === "asis") && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.3s"
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(248,250,252,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Current Experience
                </span>
              </div>
              <AsIsView visible={visible} />
              {/* Pain points */}
              <div style={{
                maxWidth: 320, opacity: visible ? 1 : 0,
                transition: "opacity 0.8s 0.6s"
              }}>
                {[
                  "Cryptic merchant names — users can't identify subscriptions",
                  "No separation of recurring vs. one-time charges",
                  "Zero visibility into unused or forgotten services",
                  "No renewal dates — surprise charges every month"
                ].map((pain, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)"
                  }}>
                    <span style={{ color: "#ef4444", fontSize: 14, lineHeight: 1.4 }}>✕</span>
                    <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)", lineHeight: 1.5 }}>{pain}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Arrow / divider */}
          {activeView === "split" && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              alignSelf: "center", gap: 8, opacity: visible ? 1 : 0,
              transition: "opacity 0.8s 0.5s", paddingTop: 40
            }}>
              <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }} />
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "rgba(248,250,252,0.4)"
              }}>→</div>
              <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }} />
            </div>
          )}

          {/* TO-BE side */}
          {(activeView === "split" || activeView === "tobe") && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
                opacity: visible ? 1 : 0, transition: "opacity 0.8s 0.4s"
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(248,250,252,0.5)", letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Proposed Experience
                </span>
              </div>
              <ToBeView visible={visible} />
              {/* Value props */}
              <div style={{
                maxWidth: 360, opacity: visible ? 1 : 0,
                transition: "opacity 0.8s 0.7s"
              }}>
                {[
                  "Rich merchant identity — logos, names, categories auto-resolved",
                  "Subscription Health Score quantifies portfolio optimization",
                  "Ghost detector flags forgotten subscriptions (30+ days inactive)",
                  "Renewal calendar prevents surprise charges with advance notice"
                ].map((val, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)"
                  }}>
                    <span style={{ color: "#22c55e", fontSize: 14, lineHeight: 1.4 }}>✓</span>
                    <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)", lineHeight: 1.5 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom insight bar */}
        <div style={{
          marginTop: 48, padding: "24px 32px", borderRadius: 16,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24,
          opacity: visible ? 1 : 0, transition: "opacity 1s 0.8s"
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Data-Backed Insight</div>
            <div style={{ fontSize: 14, color: "rgba(248,250,252,0.6)", lineHeight: 1.6, maxWidth: 500 }}>
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>25%</span> of all Mastercard chargebacks are subscription-related.{" "}
              <span style={{ color: "#60a5fa", fontWeight: 600 }}>72%</span> of consumers want subscription management in their banking app.{" "}
              <span style={{ color: "#22c55e", fontWeight: 600 }}>$90.80/mo</span> potential savings identified for this user profile.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Chargebacks ↓", value: "40%", color: "#22c55e" },
              { label: "Engagement ↑", value: "3.2×", color: "#3b82f6" },
              { label: "Retention ↑", value: "67%", color: "#f59e0b" },
            ].map((m, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "8px 16px",
                background: "rgba(255,255,255,0.02)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)"
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
