import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, ComposedChart, Area, Line, CartesianGrid,
} from "recharts";
import { formatINR } from "./formatters";
import {
  CHANNELS, CHANNEL_COLORS, AD_TYPES,
  adData, getAdSummaryByChannel, getAdByType, getAdWasteBySkuChannel,
} from "./mockData";

const TOOLTIP_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#E2E8F0",
};

const AD_TYPE_COLORS = {
  "Sponsored Product": "#8B5CF6",
  "Display Ad": "#EC4899",
  "Brand Store": "#06B6D4",
  "Video Ad": "#F59E0B",
};

function ROASBadge({ roas }) {
  const bg = roas < 1 ? "#FEE2E2" : roas < 2 ? "#FEF3C7" : "#DCFCE7";
  const color = roas < 1 ? "#DC2626" : roas < 2 ? "#D97706" : "#16A34A";
  const label = roas < 1 ? "Loss" : roas < 2 ? "Low" : "Good";
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {label} · {roas}x
    </span>
  );
}

export default function Sprint4AdWaste({ loaded }) {
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [selectedAdType, setSelectedAdType] = useState(null);

  const channelSummary = getAdSummaryByChannel();
  const adTypeBreakdown = getAdByType(selectedChannel);
  const skuChannelData = getAdWasteBySkuChannel();
  const totalWasted = adData.reduce((s, d) => s + d.wasted, 0);
  const totalSpend = adData.reduce((s, d) => s + d.spend, 0);
  const wasteRate = Math.round((totalWasted / totalSpend) * 100);

  const adTypeDetail = selectedAdType
    ? adData.filter(
        (d) =>
          d.adType === selectedAdType &&
          (selectedChannel === "All" || d.channel === selectedChannel)
      )
    : [];

  return (
    <div
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "none" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Filters */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
          Filters:
        </div>
        <select
          value={selectedChannel}
          onChange={(e) => { setSelectedChannel(e.target.value); setSelectedAdType(null); }}
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
        {selectedAdType && (
          <button
            onClick={() => setSelectedAdType(null)}
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 10, padding: "8px 14px",
              color: "#A78BFA", fontSize: 12,
              fontFamily: "inherit", cursor: "pointer", fontWeight: 600,
            }}
          >
            ← Back to overview
          </button>
        )}
      </div>

      {/* Alert Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(236,72,153,0.05) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 32 }}>📢</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#C4B5FD" }}>
            {formatINR(totalWasted)} ({wasteRate}%) of ad spend is generating negative ROAS
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
            {adData.filter((d) => d.roas < 1).length} ad placements with ROAS below 1x — every rupee spent loses money
          </div>
        </div>
      </div>

      {/* Channel KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {channelSummary.map((ch) => (
          <div
            key={ch.channel}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${CHANNEL_COLORS[ch.channel]}30`,
              borderRadius: 14,
              padding: "16px 14px",
            }}
          >
            <div style={{ fontSize: 11, color: CHANNEL_COLORS[ch.channel], fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              {ch.channel}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
              <span>Total Spend</span>
              <span style={{ fontWeight: 700, color: "#E2E8F0" }}>{formatINR(ch.totalSpend)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
              <span>ROAS</span>
              <ROASBadge roas={ch.avgRoas} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8" }}>
              <span>Wasted</span>
              <span style={{ fontWeight: 700, color: "#FCA5A5" }}>{formatINR(ch.totalWasted)}</span>
            </div>
          </div>
        ))}
      </div>

      {!selectedAdType ? (
        <>
          {/* Ad Type Cards */}
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>
            Performance by Ad Type
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
            Click an ad type for SKU-level breakdown
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {adTypeBreakdown.map((item) => (
              <div
                key={item.adType}
                onClick={() => setSelectedAdType(item.adType)}
                style={{
                  background: `${AD_TYPE_COLORS[item.adType]}08`,
                  border: `1px solid ${AD_TYPE_COLORS[item.adType]}25`,
                  borderRadius: 14,
                  padding: "16px 14px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = `0 8px 25px ${AD_TYPE_COLORS[item.adType]}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: AD_TYPE_COLORS[item.adType], marginBottom: 10 }}>
                  {item.adType}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
                  <span>Spend</span>
                  <span style={{ fontWeight: 700, color: "#E2E8F0" }}>{formatINR(item.totalSpend)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
                  <span>Revenue</span>
                  <span style={{ fontWeight: 700, color: "#E2E8F0" }}>{formatINR(item.totalRevenue)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
                  <span>CTR</span>
                  <span style={{ fontWeight: 700, color: "#E2E8F0" }}>{item.avgCtr}%</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <ROASBadge roas={item.avgRoas} />
                </div>
                {item.totalWasted > 0 && (
                  <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: "#FCA5A5", fontWeight: 600 }}>Wasted Spend</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#EF4444", marginTop: 2 }}>{formatINR(item.totalWasted)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SKU x Channel Waste Grid */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Ad Waste Heatmap — SKU x Channel</div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>ROAS and wasted spend across all SKUs and platforms</div>
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
                  {skuChannelData.map((row) => (
                    <tr key={row.sku}>
                      <td style={{ padding: "10px 12px", color: "#E2E8F0", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        {row.sku}
                      </td>
                      {CHANNELS.map((ch) => {
                        const d = row.channels[ch];
                        return (
                          <td key={ch} style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <ROASBadge roas={d.roas} />
                            {d.wasted > 0 && (
                              <div style={{ fontSize: 10, color: "#FCA5A5", marginTop: 3 }}>
                                {formatINR(d.wasted)} wasted
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
        </>
      ) : (
        /* Ad Type Drill-Down */
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", letterSpacing: -0.5, marginBottom: 4 }}>
            📢 {selectedAdType} — SKU Performance
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
            Per-SKU metrics for {selectedAdType} ads · {selectedChannel === "All" ? "All Channels" : selectedChannel}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>SKU</th>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Channel</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Spend</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Impressions</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>CTR</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Conv Rate</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>CPA</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>ROAS</th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Wasted</th>
                  </tr>
                </thead>
                <tbody>
                  {adTypeDetail
                    .sort((a, b) => b.wasted - a.wasted)
                    .map((d, i) => (
                      <tr key={i}>
                        <td style={{ padding: "10px 12px", color: "#E2E8F0", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {d.shortSku}
                        </td>
                        <td style={{ padding: "10px 12px", color: CHANNEL_COLORS[d.channel], fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {d.channel}
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", color: "#E2E8F0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {formatINR(d.spend)}
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", color: "#94A3B8", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {(d.impressions / 1000).toFixed(1)}K
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", color: d.ctr > 2 ? "#22C55E" : "#F59E0B", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {d.ctr}%
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", color: d.convRate > 5 ? "#22C55E" : "#F59E0B", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {d.convRate}%
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", color: "#E2E8F0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          ₹{d.cpa}
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <ROASBadge roas={d.roas} />
                        </td>
                        <td style={{ textAlign: "center", padding: "10px 12px", color: d.wasted > 0 ? "#FCA5A5" : "#64748B", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {d.wasted > 0 ? formatINR(d.wasted) : "—"}
                        </td>
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
