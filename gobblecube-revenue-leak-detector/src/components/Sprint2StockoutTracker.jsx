import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { OOSBadge } from "./SharedUI";
import { formatINR } from "../utils/formatters";
import {
  CHANNELS, CHANNEL_COLORS, SKUS,
  oosData, getCityHeatmapData, getCityDetailData,
} from "../data/mockData";

const TOOLTIP_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#E2E8F0",
};

export default function Sprint2StockoutTracker({ loaded }) {
  const [selectedSku, setSelectedSku] = useState("All");
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [selectedCity, setSelectedCity] = useState(null);

  const heatmapData = getCityHeatmapData(selectedSku, selectedChannel);
  const totalWastedAcrossCities = heatmapData.reduce((s, c) => s + c.totalWasted, 0);

  return (
    <div
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "none" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── Filters ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
          Filters:
        </div>

        <select
          value={selectedSku}
          onChange={(e) => { setSelectedSku(e.target.value); setSelectedCity(null); }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "8px 14px",
            color: "#E2E8F0", fontSize: 12,
            fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}
        >
          <option value="All">All SKUs</option>
          {SKUS.map((s) => (
            <option key={s} value={s}>{s.replace("FreshGlow ", "")}</option>
          ))}
        </select>

        <select
          value={selectedChannel}
          onChange={(e) => { setSelectedChannel(e.target.value); setSelectedCity(null); }}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "8px 14px",
            color: "#E2E8F0", fontSize: 12,
            fontFamily: "inherit", cursor: "pointer", outline: "none",
          }}
        >
          <option value="All">All Channels</option>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {selectedCity && (
          <button
            onClick={() => setSelectedCity(null)}
            style={{
              background: "rgba(123,47,247,0.15)",
              border: "1px solid rgba(123,47,247,0.3)",
              borderRadius: 10, padding: "8px 14px",
              color: "#A78BFA", fontSize: 12,
              fontFamily: "inherit", cursor: "pointer", fontWeight: 600,
            }}
          >
            ← Back to all cities
          </button>
        )}
      </div>

      {/* ── Wasted Spend Alert ───────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(245,158,11,0.05) 100%)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 32 }}>🔥</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#FCA5A5" }}>
            You're burning {formatINR(totalWastedAcrossCities)} on ads in cities where your product isn't available
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
            {heatmapData.filter((c) => c.avgOOS > 20).length} cities have critical OOS rates ({">"}20%) with active ad spend
          </div>
        </div>
      </div>

      {!selectedCity ? (
        /* ── All-Cities View ─────────────────────────────────── */
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>
            City-Level Availability Heatmap
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
            Click a city to drill down into SKU-level details
          </div>

          {/* City Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
            {heatmapData
              .sort((a, b) => b.avgOOS - a.avgOOS)
              .map((city) => {
                const intensity = Math.min(city.avgOOS / 40, 1);
                const bg = `rgba(239, 68, 68, ${0.04 + intensity * 0.18})`;
                const borderColor = `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`;
                return (
                  <div
                    key={city.city}
                    onClick={() => setSelectedCity(city.city)}
                    style={{
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 14,
                      padding: "16px 14px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.03)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(239,68,68,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 6 }}>
                      {city.city}
                    </div>
                    <OOSBadge rate={city.avgOOS} />
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8" }}>
                      <span>Ad Spend</span>
                      <span style={{ fontWeight: 700, color: "#E2E8F0" }}>{formatINR(city.totalAdSpend)}</span>
                    </div>
                    {city.totalWasted > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#FCA5A5", marginTop: 3 }}>
                        <span>Wasted</span>
                        <span style={{ fontWeight: 700 }}>{formatINR(city.totalWasted)}</span>
                      </div>
                    )}
                    <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 2,
                          width: `${Math.min((city.avgOOS / 40) * 100, 100)}%`,
                          background: "linear-gradient(90deg, #F59E0B, #EF4444)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Horizontal Bar Chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Average OOS Rate by City</div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
              Sorted by severity ·{" "}
              {selectedSku === "All" ? "All SKUs" : selectedSku.replace("FreshGlow ", "")} ·{" "}
              {selectedChannel === "All" ? "All Channels" : selectedChannel}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={heatmapData.sort((a, b) => b.avgOOS - a.avgOOS)}
                layout="vertical"
                barCategoryGap="20%"
              >
                <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 45]} />
                <YAxis type="category" dataKey="city" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, "OOS Rate"]} />
                <Bar dataKey="avgOOS" radius={[0, 6, 6, 0]} name="OOS Rate %">
                  {heatmapData
                    .sort((a, b) => b.avgOOS - a.avgOOS)
                    .map((entry) => (
                      <Cell
                        key={entry.city}
                        fill={entry.avgOOS > 30 ? "#EF4444" : entry.avgOOS > 15 ? "#F59E0B" : "#22C55E"}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        /* ── City Drill-Down ─────────────────────────────────── */
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", letterSpacing: -0.5, marginBottom: 4 }}>
            📍 {selectedCity} — SKU Availability Breakdown
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
            OOS rates & wasted ad spend per SKU ·{" "}
            {selectedChannel === "All" ? "All Channels" : selectedChannel}
          </div>

          {/* SKU Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            {getCityDetailData(selectedCity, selectedChannel).map((item) => (
              <div
                key={item.sku}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${item.avgOOS > 25 ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius: 14,
                  padding: "16px 14px",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>{item.sku}</div>
                <OOSBadge rate={item.avgOOS} />
                {item.totalWasted > 0 && (
                  <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "#FCA5A5", fontWeight: 600 }}>🔥 Wasted Ad Spend</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#EF4444", marginTop: 2 }}>
                      {formatINR(item.totalWasted)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Platform Comparison Table */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              Platform Comparison — {selectedCity}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      SKU
                    </th>
                    {CHANNELS.map((ch) => (
                      <th
                        key={ch}
                        style={{
                          textAlign: "center", padding: "8px 12px",
                          color: CHANNEL_COLORS[ch],
                          fontWeight: 700,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {ch}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SKUS.map((sku) => (
                    <tr key={sku}>
                      <td
                        style={{
                          padding: "10px 12px", color: "#E2E8F0", fontWeight: 500,
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                        }}
                      >
                        {sku.replace("FreshGlow ", "")}
                      </td>
                      {CHANNELS.map((ch) => {
                        const d = oosData.find(
                          (r) => r.city === selectedCity && r.sku === sku && r.channel === ch
                        );
                        return (
                          <td
                            key={ch}
                            style={{
                              textAlign: "center", padding: "10px 12px",
                              borderBottom: "1px solid rgba(255,255,255,0.03)",
                            }}
                          >
                            <OOSBadge rate={d?.oosRate || 0} />
                            {d?.wastedSpend > 0 && (
                              <div style={{ fontSize: 10, color: "#FCA5A5", marginTop: 3 }}>
                                ⚠ {formatINR(d.wastedSpend)} wasted
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
