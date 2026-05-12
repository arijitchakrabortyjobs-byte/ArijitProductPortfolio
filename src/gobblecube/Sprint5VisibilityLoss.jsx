import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { formatINR } from "./formatters";
import {
  CHANNELS, CHANNEL_COLORS, SKUS,
  visibilityData, getVisibilitySummaryByChannel, getVisibilityBySku, getKeywordRankings,
} from "./mockData";

const TOOLTIP_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#E2E8F0",
};

function RankBadge({ rank }) {
  const bg = rank > 30 ? "#FEE2E2" : rank > 15 ? "#FEF3C7" : "#DCFCE7";
  const color = rank > 30 ? "#DC2626" : rank > 15 ? "#D97706" : "#16A34A";
  const label = rank > 30 ? "Poor" : rank > 15 ? "Mid" : "Top";
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
      {label} · #{rank}
    </span>
  );
}

export default function Sprint5VisibilityLoss({ loaded }) {
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [selectedSku, setSelectedSku] = useState("All");

  const channelSummary = getVisibilitySummaryByChannel();
  const skuBreakdown = getVisibilityBySku(selectedChannel);
  const keywordData = getKeywordRankings(selectedSku, selectedChannel);
  const totalLost = visibilityData.reduce((s, d) => s + d.estimatedLost, 0);
  const lowVisCount = visibilityData.filter((d) => d.shareOfShelf < 15).length;

  const radarData = channelSummary.map((ch) => ({
    channel: ch.channel,
    searchRank: Math.max(50 - ch.avgRank, 0),
    shareOfShelf: ch.avgSoS,
    buyBox: ch.avgBuyBox,
  }));

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
          value={selectedSku}
          onChange={(e) => setSelectedSku(e.target.value)}
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
          onChange={(e) => setSelectedChannel(e.target.value)}
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
      </div>

      {/* Alert Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.05) 100%)",
          border: "1px solid rgba(6,182,212,0.2)",
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 32 }}>👁</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#67E8F9" }}>
            {lowVisCount} SKU-channel combinations have under 15% share of shelf
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
            Estimated {formatINR(totalLost)} in lost revenue from poor search visibility and low shelf share
          </div>
        </div>
      </div>

      {/* Channel KPI Cards */}
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
              <span>Avg Rank</span>
              <RankBadge rank={ch.avgRank} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
              <span>Share of Shelf</span>
              <span style={{ fontWeight: 700, color: ch.avgSoS < 15 ? "#FCA5A5" : "#22C55E" }}>
                {ch.avgSoS}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
              <span>Buy Box Win</span>
              <span style={{ fontWeight: 700, color: ch.avgBuyBox > 60 ? "#22C55E" : "#F59E0B" }}>
                {ch.avgBuyBox}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8" }}>
              <span>Est. Lost</span>
              <span style={{ fontWeight: 700, color: "#FCA5A5" }}>{formatINR(ch.totalLost)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Radar Chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Channel Visibility Radar</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>Search rank score, share of shelf, buy box win rate</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="channel" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: "#64748B", fontSize: 9 }} />
              <Radar name="Search Rank" dataKey="searchRank" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Share of Shelf" dataKey="shareOfShelf" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Buy Box" dataKey="buyBox" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            {[
              { label: "Search Rank", color: "#06B6D4" },
              { label: "Share of Shelf", color: "#8B5CF6" },
              { label: "Buy Box", color: "#22C55E" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ color: "#94A3B8" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Rankings */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Keyword Rankings</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
            Average search position by keyword · {selectedSku === "All" ? "All SKUs" : selectedSku.replace("FreshGlow ", "")}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={keywordData.slice(0, 8)} layout="vertical" barCategoryGap="18%">
              <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 50]} reversed />
              <YAxis type="category" dataKey="keyword" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`#${v}`, "Avg Rank"]} />
              <Bar dataKey="avgRank" radius={[0, 6, 6, 0]} name="Avg Rank">
                {keywordData.slice(0, 8).map((entry) => (
                  <Cell
                    key={entry.keyword}
                    fill={entry.avgRank <= 10 ? "#22C55E" : entry.avgRank <= 25 ? "#F59E0B" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SKU Visibility Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>
          SKU Visibility Scorecard
        </div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
          Search rank, shelf share, and estimated revenue loss · {selectedChannel === "All" ? "All Channels" : selectedChannel}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>SKU</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Avg Rank</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Share of Shelf</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Buy Box Win</th>
                <th style={{ textAlign: "center", padding: "8px 12px", color: "#94A3B8", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Est. Lost Revenue</th>
              </tr>
            </thead>
            <tbody>
              {skuBreakdown
                .sort((a, b) => b.totalLost - a.totalLost)
                .map((item) => (
                  <tr key={item.sku}>
                    <td style={{ padding: "10px 12px", color: "#E2E8F0", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      {item.sku}
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <RankBadge rank={item.avgRank} />
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span
                        style={{
                          background: item.avgSoS < 15 ? "#FEE2E2" : item.avgSoS < 25 ? "#FEF3C7" : "#DCFCE7",
                          color: item.avgSoS < 15 ? "#DC2626" : item.avgSoS < 25 ? "#D97706" : "#16A34A",
                          padding: "2px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {item.avgSoS}%
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <span style={{ fontWeight: 700, color: item.avgBuyBox > 60 ? "#22C55E" : "#F59E0B" }}>
                        {item.avgBuyBox}%
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px 12px", fontWeight: 700, color: item.totalLost > 0 ? "#FCA5A5" : "#64748B", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      {item.totalLost > 0 ? formatINR(item.totalLost) : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Comparison */}
      <div style={{ marginTop: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Platform Comparison — All SKUs</div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>Search rank, shelf share, and buy box win rate across platforms</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={channelSummary} barCategoryGap="25%">
            <XAxis dataKey="channel" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="avgSoS" name="Share of Shelf %" radius={[6, 6, 0, 0]} fill="#06B6D4" />
            <Bar dataKey="avgBuyBox" name="Buy Box Win %" radius={[6, 6, 0, 0]} fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
          {[
            { label: "Share of Shelf %", color: "#06B6D4" },
            { label: "Buy Box Win %", color: "#8B5CF6" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
              <span style={{ color: "#94A3B8" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
