# Architecture: How This Would Work in Production

## Overview
The Creator Command Center frontend is a React SPA. In production, it would be backed by a BFF (Backend-for-Frontend) API that aggregates data from multiple internal services. Here's how I'd design the system if I were pitching this to an engineering team.

## Data Sources & Services

### 1. Earnings Aggregation Service
- **Sources:** Ad revenue API (impression/click attribution per creator per video), Gift transactions DB (real-time ledger of coin/gift transfers), Brand deal CRM (contract-based payouts tracked by partnerships team)
- **Refresh cadence:** Hourly for ad revenue (batch from ad server logs), real-time for gifts (event-driven via Kafka consumer), daily for brand deals (manual + CRM sync)
- **Key endpoint:** `GET /api/v1/creator/{id}/earnings?range=30d&breakdown=source`
- **Why hourly for ads:** Ad attribution requires impression deduplication and click-through matching. Real-time would be noisy and expensive. Hourly is the industry standard (YouTube Studio updates earnings daily; we'd already be faster).

### 2. Content Analytics Pipeline
- **Sources:** View events, engagement events (like, share, save, comment), and watch-time signals from the existing feed event stream (likely Kafka or Kinesis)
- **Processing:** A Flink/Spark Streaming job aggregates per-video metrics into a content_performance table, partitioned by creator_id and date
- **Refresh cadence:** 4-hour latency is acceptable for content metrics. Real-time is unnecessary because creators check performance a few times a day, not every second.
- **Key endpoint:** `GET /api/v1/creator/{id}/content?sort=earnings&limit=20&range=90d`

### 3. Audience Demographics Service
- **Sources:** User profile DB (age, gender, state, city, language preference) joined with engagement events to build "audience of creator X" materialized views
- **Refresh cadence:** Weekly. Demographics don't change fast, and the join query across millions of rows is expensive. Weekly materialized view refresh is the right tradeoff.
- **Key endpoint:** `GET /api/v1/creator/{id}/audience?facets=age,gender,state,language`

### 4. Agency Safety Service
- **Sources:** Creator-submitted reviews, platform-recorded payout history, complaint/dispute records from the support team
- **Scoring model:** Weighted average of: verified payment completion rate (40%), average payout time in days (20%), creator review score (20%), unresolved complaint count (20%)
- **Key endpoint:** `GET /api/v1/agencies?sort=safety_score&limit=20`

## API Design Principles
- **BFF pattern:** One API gateway tailored to the dashboard's needs, not generic CRUD endpoints. The frontend should make 2-3 API calls to render a full page, not 15.
- **Caching:** Earnings data cached for 1 hour (Redis), content metrics for 4 hours, audience demographics for 24 hours. Cache-busting on explicit refresh.
- **Auth:** Creator authenticates via ShareChat's existing OAuth. The BFF validates the token and scopes all queries to that creator's ID. No creator can see another creator's data.
- **Rate limiting:** 60 requests/minute per creator. Dashboard polls every 5 minutes for real-time feel without hammering the backend.

## Infrastructure Considerations
- **Target device:** Mid-range Android (2-4 GB RAM) on 4G in Tier 2/3 India
- **Performance budget:** Dashboard must load in under 3 seconds on 10 Mbps. This means aggressive lazy loading, skeleton screens, and keeping the JS bundle under 200KB gzipped.
- **Localization:** UI must support Hindi, Telugu, Tamil, Marathi, Bengali from launch. All API responses return localization keys, not hardcoded strings.
- **Data privacy:** DPDP Act (India's data protection law) compliance is mandatory. Earnings data is PII. Encrypted in transit (TLS 1.3) and at rest (AES-256). Creator consent required before any data sharing with agencies.

## What I'd Propose to Engineering
In a real sprint planning session, I'd walk the engineering team through this architecture doc and ask them to estimate two things: (1) how much of this data pipeline already exists and can be reused, and (2) what's the minimum viable backend to ship Sprint 1 (likely just the earnings aggregation service + a thin BFF). We'd ship the rest incrementally, just like the frontend.
