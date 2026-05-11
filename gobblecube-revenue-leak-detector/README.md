# GobbleCube — Revenue Leak Detector

> B2B revenue intelligence dashboard for FMCG brands selling across Blinkit, Zepto, Amazon, and Flipkart.
> Solves the **"Data Grind"** — brand teams spend 60% of their time assembling data instead of acting on it.

**Brand:** FreshGlow Skincare (mock)
**Milestone:** GobbleCube: Revenue Leak Detector
**Label:** `Gobblecube`

---

## Sprints Implemented

### Sprint 1 — Revenue Health Overview + Leak Summary ([Issue #10](https://github.com/arijitchakrabortyjobs-byte/ArijitProductPortfolio/issues/10))

Dashboard showing:
- **KPI strip:** Total revenue, total leaks, leak rate %, active SKUs — with animated counters
- **Revenue Leaks breakdown:** ₹12L leaking across 4 categories (Stockouts ₹4.2L, Pricing Gaps ₹2.8L, Ad Waste ₹3.1L, Visibility Loss ₹1.9L) with proportional progress bars
- **Revenue by channel:** Bar chart across Blinkit, Zepto, Amazon, Flipkart with growth indicators
- **Leak composition:** Donut chart showing share of each leak type
- **Revenue vs Leaks trend:** 8-week area + line combo chart

### Sprint 2 — Stockout & Availability Tracker (Hyperlocal) ([Issue #11](https://github.com/arijitchakrabortyjobs-byte/ArijitProductPortfolio/issues/11))

City-level availability heatmap showing:
- **Filters:** SKU and channel dropdowns
- **Wasted Spend Alert:** Hero card quantifying ad spend burning in stockout cities — _"You're burning ₹X on ads in cities where your product isn't available"_
- **City heatmap grid:** 10 Indian cities with OOS severity badges (Critical/Warning/Healthy), ad spend, wasted spend, and heat bars
- **Horizontal bar chart:** Cities ranked by OOS rate with color-coded severity
- **City drill-down:** Click any city to see:
  - Per-SKU OOS cards with wasted ad-spend callouts
  - Full SKU × Platform comparison table with per-cell OOS rates and wasted spend

**Core Insight (GobbleCube differentiator):** Correlating ad spend with stockout locations to quantify wasted spend at the hyperlocal level.

---

## Project Structure

```
gobblecube-revenue-leak-detector/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── SharedUI.jsx              # AnimatedNumber, OOSBadge
│   │   ├── Sprint1RevenueOverview.jsx # Sprint 1 dashboard
│   │   └── Sprint2StockoutTracker.jsx # Sprint 2 dashboard
│   ├── data/
│   │   └── mockData.js               # Constants, mock data, helpers
│   ├── utils/
│   │   └── formatters.js             # INR formatter
│   ├── App.jsx                        # Shell: header, tabs, footer
│   └── index.js                       # Entry point
├── package.json
└── README.md
```

## Tech Stack

- React 18
- Recharts (charts & data viz)
- CSS-in-JS (inline styles, no external CSS framework)
- DM Sans (Google Fonts)

## Getting Started

```bash
cd gobblecube-revenue-leak-detector
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data

All data is **mock/seeded** for demo purposes. The seeded random generator ensures consistent numbers across renders.

---

_Part of the [ArijitProductPortfolio](https://github.com/arijitchakrabortyjobs-byte/ArijitProductPortfolio) project._
