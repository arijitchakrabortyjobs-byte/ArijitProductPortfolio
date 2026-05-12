import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Line, CartesianGrid, Area, ComposedChart,
} from "recharts";
import { AnimatedNumber } from "./SharedUI";
import {
  CHANNEL_COLORS, LEAK_CATEGORIES,
  revenueByChannel, weeklyTrend,
} from "./mockData";

const TOOLTIP_STYLE = {
  background: "#1E293B",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 12,
  color: "#E2E8F0",
};

export default function Sprint1RevenueOverview({ loaded }) {
  const totalRevenue = revenueByChannel.reduce((s, c) => s + c.revenue, 0);
  const totalLeaks = LEAK_CATEGORIES.reduce((s, c) => s + c.amount, 0);

  return (
    <div
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? "none" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── KPI Strip ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Revenue", value: totalRevenue, suffix: "L", prefix: "₹", color: "#22C55E", sub: "This week" },
          { label: "Revenue Leaks", value: totalLeaks, suffix: "L", prefix: "₹", color: "#EF4444", sub: "4 categories" },
          { label: "Leak Rate", value: (totalLeaks / totalRevenue) * 100, suffix: "%", prefix: "", color: "#F59E0B", sub: "of total revenue" },
          { label: "Active SKUs", value: 47, suffix: "", prefix: "", decimals: 0, color: "#06B6D4", sub: "across 4 platforms" },
        ].map((kpi, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "20px 22px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute", top: 0, right: 0,
                width: 80, height: 80,
                borderRadius: "0 16px 0 80px",
                background: `${kpi.color}08`,
              }}
            />
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: kpi.color, letterSpacing: -1.5, lineHeight: 1 }}>
              <AnimatedNumber value={kpi.value} suffix={kpi.suffix} prefix={kpi.prefix} decimals={kpi.decimals ?? 1} />
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Revenue Leaks Breakdown Card ─────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 20,
          padding: "24px 28px",
          marginBottom: 24,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", letterSpacing: -0.5 }}>
            🚨 Revenue Leaks This Week
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
            ₹{totalLeaks.toFixed(1)}L leaking across 4 categories — that's{" "}
            {((totalLeaks / totalRevenue) * 100).toFixed(1)}% of your revenue
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {LEAK_CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              style={{
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${cat.color}30`,
                borderRadius: 14,
                padding: "18px 16px",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${cat.color}80`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${cat.color}30`;
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ position: "absolute", bottom: -10, right: -10, fontSize: 60, opacity: 0.06 }}>{cat.icon}</div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                {cat.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: cat.color, letterSpacing: -1 }}>₹{cat.amount}L</div>
              <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                    width: `${(cat.amount / totalLeaks) * 100}%`,
                    transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>
                {((cat.amount / totalLeaks) * 100).toFixed(0)}% of total leaks
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Revenue by Channel */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Revenue by Channel</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>Weekly performance across platforms (₹ Lakhs)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByChannel} barCategoryGap="25%">
              <XAxis dataKey="channel" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${v}L`, "Revenue"]} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {revenueByChannel.map((entry) => (
                  <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
            {revenueByChannel.map((c) => (
              <div key={c.channel} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: CHANNEL_COLORS[c.channel] }} />
                <span style={{ color: "#94A3B8" }}>{c.channel}</span>
                <span style={{ color: c.growth >= 0 ? "#22C55E" : "#EF4444", fontWeight: 700 }}>
                  {c.growth >= 0 ? "↑" : "↓"}
                  {Math.abs(c.growth)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leak Pie Chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Leak Composition</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>Share of total revenue leakage</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={LEAK_CATEGORIES}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {LEAK_CATEGORIES.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${v}L`]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {LEAK_CATEGORIES.map((c) => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }} />
                <span style={{ color: "#94A3B8" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weekly Revenue vs Leaks Trend ─────────────────────── */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px 24px 16px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Revenue vs Leaks Trend</div>
        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>8-week comparison (₹ Lakhs)</div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="revenue" fill="#22C55E15" stroke="#22C55E" strokeWidth={2} name="Revenue (₹L)" />
            <Line type="monotone" dataKey="leaks" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 3 }} name="Leaks (₹L)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
