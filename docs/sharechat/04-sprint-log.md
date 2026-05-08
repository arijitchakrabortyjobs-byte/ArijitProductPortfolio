# Sprint Log: Creator Command Center

## Sprint 1: Creator Profile + Earnings Dashboard
**Status:** ✅ Shipped

**What I built:** Added a "Creator View" tab to the existing ShareChat Command Center dashboard. It includes a creator profile header (Priya's mock profile), four earnings source cards (ads, gifts, brands, coin bonuses), a 12-week stacked area chart showing earnings trends with 2-week projections, a revenue split donut chart, and a sortable top-videos table with per-video earnings.

**Key decision:** I added the Creator View as a new tab alongside the existing platform analytics tabs rather than replacing them. This was intentional — the existing tabs (Overview, Feed, Gifting, etc.) show platform-level PM thinking. The Creator View shows user-facing product design. Together they demonstrate two complementary skills: internal analytics and consumer product building. A hiring manager can see both.

**Tradeoff I accepted:** All data is mock/hardcoded. In a real product, this would pull from backend APIs. But for a portfolio piece, the value is in the UX decisions and information architecture — not the data plumbing. I documented how the backend would work in `05-architecture.md`.

**What I'd test if this were real:** I'd A/B test two variants of the earnings display — one showing daily earnings (more granular, more dopamine) vs. weekly earnings (less noise, more actionable). My hypothesis is that weekly wins for retention because daily creates anxiety on low-earning days.

---

## Sprint 2: Earnings Trend & Per-Video Breakdown
**Status:** 🔜 Planned

**What I'll build:** Enhanced time-series earnings chart with a projection line based on trailing 30-day average. Per-video earnings table with attribution showing which monetization source contributed per video (e.g., "70% ads, 30% gifts").

**Decision to make:** Whether to show absolute numbers or relative performance. Priya seeing "₹12 earned from this video" might be demotivating. Showing "This video earned 3x your average" reframes the same data positively. I'm leaning toward showing both — absolute for transparency, relative for motivation.

---

## Sprint 3: Content Performance Analytics
**Status:** 🔜 Planned

**What I'll build:** Sortable content list with full metrics (views, likes, shares, saves, comments), format comparison bar chart, and date range filters.

**Decision to make:** How to handle the "vanity metrics vs. actionable metrics" tension. Views are vanity. Engagement rate is actionable. But creators care about views. I'll show views prominently but highlight engagement rate as the "Pro Tip" metric with visual emphasis.

---

## Sprint 4: Best Time to Post Heatmap
**Status:** 🔜 Planned

**What I'll build:** A 7×24 grid (day-of-week × hour-of-day) showing audience activity intensity, with top 3 recommended posting windows highlighted.

**Design decision:** I'll build this as a custom div grid, not a recharts component. Heatmaps in recharts look generic. A custom implementation lets me add interactions like "tap a cell to see exact engagement count" and visually highlight the sweet spots with glow effects that match the dashboard's aesthetic.

---

## Sprint 5: Audience Demographics
**Status:** 🔜 Planned

**What I'll build:** Donut charts for age/gender, bar charts for top states/cities/languages, and a follower growth timeline with spike annotations.

**Hypothesis to validate:** I believe the follower growth chart with auto-annotated viral moments will be the single most engaging feature for creators. When Priya sees "You gained 1,200 followers on Apr 28 from your Exam Results video," she'll understand cause-and-effect for the first time. That insight loop is what keeps creators coming back.

---

## Sprint 6: Agency Safety Score
**Status:** 🔜 Planned

**What I'll build:** A list of agencies with trust scores (1-5 stars), warning badges, verified payment history, and a review submission UI.

**Why this matters beyond the feature:** This is the "trust" sprint. ShareChat's creator scam problem is real — agency owners take money from creators and disappear. Building a safety score isn't just a feature; it's a statement that the platform protects its creators. From a product strategy perspective, this is defensibility — Instagram and YouTube don't have this problem because they don't have the agency-mediated monetization model.

---

## Sprint 7: Export Report + Cross-Platform Comparison
**Status:** 🔜 Planned

**What I'll build:** A "Download Report" button generating a mock PDF preview for brand pitches, and a cross-platform comparison tool where creators manually input YouTube/Instagram metrics.

**Tradeoff:** Manual input for cross-platform data (no API integration in V1). This is deliberate — YouTube and Instagram API access for creator data is restricted. Manual input is simpler, faster to ship, and lets us validate whether creators actually want this feature before investing in OAuth flows. If 30%+ of creators use it monthly, we'd pursue API integration in V2.

---

## Sprint 8: Polish + Portfolio Integration
**Status:** 🔜 Planned

**What I'll do:** Mobile responsiveness pass, update portfolio metadata, add the process documentation to the project detail page, and ensure the "About This View" card reflects the full journey from research to shipped product.
