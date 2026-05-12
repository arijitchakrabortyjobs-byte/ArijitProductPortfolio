import React, { useState, useEffect } from "react";
import Sprint1RevenueOverview from "./Sprint1RevenueOverview";
import Sprint2StockoutTracker from "./Sprint2StockoutTracker";
import Sprint3PricingGaps from "./Sprint3PricingGaps";
import Sprint4AdWaste from "./Sprint4AdWaste";
import Sprint5VisibilityLoss from "./Sprint5VisibilityLoss";

const TABS = [
  { key: "overview", label: "S1 · Revenue" },
  { key: "stockout", label: "S2 · Stockouts" },
  { key: "pricing", label: "S3 · Pricing" },
  { key: "adwaste", label: "S4 · Ad Waste" },
  { key: "visibility", label: "S5 · Visibility" },
];

export default function GobbleCubeDashboard() {
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
        color: "#E2E8F0",
        position: "relative",
        overflow: "hidden",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Ambient glow effects */}
      <div
        style={{
          position: "absolute", top: -200, right: -200,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -300, left: -200,
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          background: "rgba(10,14,23,0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #7B2FF7, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#fff",
              boxShadow: "0 0 20px rgba(123,47,247,0.3)",
            }}
          >
            G
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.5, color: "#F8FAFC" }}>GobbleCube</div>
            <div style={{ fontSize: 9, color: "#64748B", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
              Revenue Leak Detector
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E" }} />
          <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>FreshGlow Skincare</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
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
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px", position: "relative", zIndex: 1, maxHeight: 600, overflowY: "auto" }}>
        {activeTab === "overview" && <Sprint1RevenueOverview loaded={loaded} />}
        {activeTab === "stockout" && <Sprint2StockoutTracker loaded={loaded} />}
        {activeTab === "pricing" && <Sprint3PricingGaps loaded={loaded} />}
        {activeTab === "adwaste" && <Sprint4AdWaste loaded={loaded} />}
        {activeTab === "visibility" && <Sprint5VisibilityLoss loaded={loaded} />}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 20px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 9,
          color: "#475569",
        }}
      >
        <span>GobbleCube Revenue Leak Detector · FreshGlow Skincare · Mock Data</span>
        <span>Sprints 1–5</span>
      </div>
    </div>
  );
}
