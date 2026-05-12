import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis, CartesianGrid,
} from "recharts";
import { formatINR } from "../utils/formatters";
import {
  CHANNELS, CHANNEL_COLORS, SKUS,
  pricingData, getPricingSummaryByChannel, getPricingBySku,
} from "../data/mockData";

const TOOLTIP_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#E2E8F0",
};

export default function Sprint3PricingGaps({ loaded }) {
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [selectedSku, setSelectedSku] = useState(null);

  const channelSummary = getPricingSummaryByChannel();
  const skuBreakdown = getPricingBySku(selectedChannel);
  const totalLostSales = pricingData.reduce((s, d) => s + d.lostSales, 0);
  const undercutCount = pricingData.filter((d) => d.priceDiff > 0).length;

  const skuDetail = selectedSku
    ? pricingData.filter(
        (d) =>
          d.sku === selectedSku &&
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
          onChange={(e) => { setSelectedChannel(e.target.value); setSelectedSku(null); }}
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
        {selectedSku && (
          <button
            onClick={() => setSelectedSku(null)}
            style={{
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 10, padding: "8px 14px",
              color: "#FBBF24", fontSize: 12,
              fontFamily: "inherit", cursor: "pointer", fontWeight: 600,
            }}
          >
            ← Back to all SKUs
          </button>
        )}
      </div>

      {/* Alert Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(234,88,12,0.05) 100%)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 32 }}>💰</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#FBBF24" }}>
            Competitors are undercutting you on {undercutCount} of {pricingData.length} SKU-channel combinations
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
            Estimated {formatINR(totalLostSales)} in lost sales due to pricing gaps
          </div>
        </div>
      </div>

      {/* KPI Row */}
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
              <span>Undercut</span>
              <span style={{ fontWeight: 700, color: ch.undercut > 2 ? "#EF4444" : "#22C55E" }}>
                {ch.undercut}/{ch.total} SKUs
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
              <span>Avg Gap</span>
              <span style={{ fontWeight: 700, color: ch.avgGap > 0 ? "#F59E0B" : "#22C55E" }}>
                {ch.avgGap > 0 ? "+" : ""}₹{ch.avgGap}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8" }}>
              <span>Lost Sales</span>
              <span style={{ fontWeight: 700, color: "#FCA5A5" }}>{formatINR(ch.totalLost)}</span>
            </div>
          </div>
        ))}
      </div>

      {!selectedSku ? (
        <>
          {/* SKU Price Comparison */}
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>
            SKU Price Competitiveness
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
            Click a SKU to see platform & competitor breakdown
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            {skuBreakdown.map((item) => {
              const isUndercut = item.gap > 0;
              return (
                <div
                  key={item.sku}
                  onClick={() => setSelectedSku(item.fullSku)}
                  style={{
                    background: isUndercut
                      ? "rgba(245,158,11,0.06)"
                      : "rgba(34,197,94,0.04)",
                    border: `1px solid ${isUndercut ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.15)"}`,
                    borderRadius: 14,
                    padding: "16px 14px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = `0 8px 25px ${isUndercut ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.1)"}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#F8FAFC", marginBottom: 10 }}>{item.sku}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
                    <span>Our Price</span>
                    <span style={{ fontWeight: 700, color: "#E2E8F0" }}>₹{item.avgOurPrice}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
                    <span>Lowest Competitor</span>
                    <span style={{ fontWeight: 700, color: "#E2E8F0" }}>₹{item.avgLowest}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: isUndercut ? "#FBBF24" : "#22C55E", fontWeight: 700 }}>
                      {isUndercut ? `+₹${item.gap} above` : `₹${Math.abs(item.gap)} below`}
                    </span>
                  </div>
                  {item.totalLost > 0 && (
                    <div style={{ marginTop: 8, padding: "6px 10px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: "#FCA5A5", fontWeight: 600 }}>Est. Lost Sales</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#EF4444", marginTop: 2 }}>{formatINR(item.totalLost)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bar Chart: Lost Sales by SKU */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Lost Sales by SKU</div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
              Revenue lost to competitor undercutting · {selectedChannel === "All" ? "All Channels" : selectedChannel}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={skuBreakdown.sort((a, b) => b.totalLost - a.totalLost)} barCategoryGap="20%">
                <XAxis dataKey="sku" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [formatINR(v), "Lost Sales"]} />
                <Bar dataKey="totalLost" radius={[6, 6, 0, 0]} name="Lost Sales">
                  {skuBreakdown
                    .sort((a, b) => b.totalLost - a.totalLost)
                    .map((entry) => (
                      <Cell key={entry.sku} fill={entry.gap > 0 ? "#F59E0B" : "#22C55E"} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        /* SKU Drill-Down */
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", letterSpacing: -0.5, marginBottom: 4 }}>
            💰 {selectedSku.replace("FreshGlow ", "")} — Price Comparison
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
            Your pricing vs competitors across platforms · {selectedChannel === "All" ? "All Channels" : selectedChannel}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      Platform
                    </th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      Our Price
                    </th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      MRP
                    </th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      Discount
                    </th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      Lowest Competitor
                    </th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      Gap
                    </th>
                    <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      Lost Sales
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {skuDetail.map((d) => (
                    <tr key={d.channel}>
                      <td style={{ padding: "10px 12px", color: CHANNEL_COLORS[d.channel], fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        {d.channel}
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 12px", color: "#E2E8F0", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        ₹{d.ourPrice}
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 12px", color: "#64748B", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        ₹{d.mrp}
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 12px", color: "#22C55E", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        {d.discount}%
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 12px", color: "#E2E8F0", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        ₹{d.lowestComp}
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <span
                          style={{
                            padding: "2px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: d.priceDiff > 0 ? "#FEF3C7" : "#DCFCE7",
                            color: d.priceDiff > 0 ? "#D97706" : "#16A34A",
                          }}
                        >
                          {d.priceDiff > 0 ? `+₹${d.priceDiff}` : `₹${d.priceDiff}`}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", padding: "10px 12px", color: d.lostSales > 0 ? "#FCA5A5" : "#64748B", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        {d.lostSales > 0 ? formatINR(d.lostSales) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Competitor Breakdown */}
            {skuDetail.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 14 }}>Competitor Price Map</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {skuDetail.map((d) => (
                    <div
                      key={d.channel}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${CHANNEL_COLORS[d.channel]}20`,
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: CHANNEL_COLORS[d.channel], marginBottom: 8 }}>
                        {d.channel}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#22C55E", fontWeight: 700, marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span>You</span>
                        <span>₹{d.ourPrice}</span>
                      </div>
                      {d.competitors.map((comp) => (
                        <div
                          key={comp.competitor}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            color: comp.price < d.ourPrice ? "#FCA5A5" : "#94A3B8",
                            marginBottom: 3,
                          }}
                        >
                          <span>{comp.competitor}</span>
                          <span style={{ fontWeight: 600 }}>₹{comp.price}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
