import React, { useState, useEffect } from "react";
import Sprint1RevenueOverview from "./components/Sprint1RevenueOverview";
import Sprint2StockoutTracker from "./components/Sprint2StockoutTracker";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Söhne', sans-serif",
        background: "linear-gradient(145deg, #0A0E17 0%, #111827 50%, #0F172A 100%)",
        minHeight: "100vh",
        color: "#E2E8F0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow effects */}
      <div
        style={{
          position: "fixed", top: -200, right: -200,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed", bottom: -300, left: -200,
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Header ───────────────────────────────────────────── */}
      <header
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          background: "rgba(10,14,23,0.8)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #7B2FF7, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "#fff",
              boxShadow: "0 0 20px rgba(123,47,247,0.3)",
            }}
          >
            G
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5, color: "#F8FAFC" }}>GobbleCube</div>
            <div style={{ fontSize: 10, color: "#64748B", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
              Revenue Leak Detector
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12, padding: 4,
          }}
        >
          {[
            { key: "overview", label: "Sprint 1 · Revenue Overview" },
            { key: "stockout", label: "Sprint 2 · Stockout Tracker" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                letterSpacing: -0.2,
                transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                background: activeTab === t.key
                  ? "linear-gradient(135deg, #7B2FF7, #6D28D9)"
                  : "transparent",
                color: activeTab === t.key ? "#fff" : "#94A3B8",
                boxShadow: activeTab === t.key
                  ? "0 4px 15px rgba(123,47,247,0.3)"
                  : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Brand Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E" }} />
          <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>FreshGlow Skincare</span>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main style={{ padding: "24px 32px", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {activeTab === "overview" && <Sprint1RevenueOverview loaded={loaded} />}
        {activeTab === "stockout" && <Sprint2StockoutTracker loaded={loaded} />}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        style={{
          padding: "16px 32px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 10,
          color: "#475569",
        }}
      >
        <span>GobbleCube Revenue Leak Detector · FreshGlow Skincare · Mock Data</span>
        <span>Sprints 1 &amp; 2 · Milestone: GobbleCube Revenue Leak Detector</span>
      </footer>
    </div>
  );
}
