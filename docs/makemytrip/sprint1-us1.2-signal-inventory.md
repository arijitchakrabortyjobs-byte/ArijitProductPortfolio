# US-1.2 — Behavioural Signal Inventory & Correlation Analysis
**Sprint 1 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Catalogue every available user signal that could predict booking completion. Prioritise the top 10 for the ML ranking model. Identify gaps that require new instrumentation.

---

## Signal Inventory

| # | Signal Name | Description | Data Source | Availability | Freshness | Cardinality | Correlation Hypothesis |
|---|---|---|---|---|---|---|---|
| S01 | `operator_booking_history` | List of operators user has booked before, with recency | Booking DB | ~35% of users | Real-time | High | Strong — repeat operator preference is the clearest loyalty signal |
| S02 | `preferred_bus_class` | Most frequently booked class (sleeper/seater/AC) | Booking DB | ~35% of users | Real-time | Low (4 values) | Strong — class is a binary filter for most travellers |
| S03 | `preferred_departure_window` | Median departure time of last 5 bookings | Booking DB | ~30% of users | Real-time | Medium | Moderate — morning vs night travel is habitual |
| S04 | `route_familiarity_score` | Number of times user has searched/booked this exact route | Search + Booking DB | ~60% of users | Real-time | High | Strong — familiar routes show higher intent completion |
| S05 | `price_sensitivity_tier` | Ratio of user's average booking fare to route median fare | Booking DB | ~35% of users | Weekly | Low (3 tiers) | Moderate — budget users drop off when shown premium options first |
| S06 | `operator_trust_score` | Platform-aggregated score: on-time %, cancellation rate, ratings | Operator DB | 100% of operators | Daily | Medium | Strong — low-trust operators shown first increase abandonment |
| S07 | `search_to_book_velocity` | Avg time between first search and first booking on a route | Search + Booking DB | ~40% of users | Real-time | High | Moderate — fast converters need less reassurance; show best match first |
| S08 | `device_language` | Device/app language setting | App session | ~95% of users | Session | Low (10 values) | Moderate — regional language users respond better to localised operators |
| S09 | `last_search_timestamp` | Recency of last bus search on MMT | Search DB | ~70% of users | Real-time | N/A (time) | Weak — indicates session intent but not preference |
| S10 | `cancellation_history` | Whether user has cancelled MMT bus bookings before | Booking DB | ~35% of users | Real-time | Low (boolean) | Moderate — high cancellors may need more trust signals upfront |
| S11 | `co_traveller_count` | Number of passengers in typical bookings | Booking DB | ~35% of users | Real-time | Low (1–6) | Weak — affects seat count but not operator preference |
| S12 | `city_tier_of_origin` | Whether user's registered city is Metro/Tier2/Tier3 | User profile | ~80% of users | Static | Low (3 values) | Moderate — Tier 2/3 users have different operator availability |

---

## Correlation Analysis Plan

**Target Variable:** `booked` (binary — did this session result in a completed booking?)

**Method:**
1. Pull 90 days of session data from data warehouse
2. Join with signal values at time of session
3. Compute point-biserial correlation for continuous signals, Cramér's V for categorical signals
4. Rank signals by correlation strength with `booked`

**Minimum sample size:** 100,000 sessions for statistical reliability

---

## Shortlisted Signals for v1 Model (Top 8)

Based on availability + correlation hypothesis strength:

| Priority | Signal | Rationale |
|---|---|---|
| 1 | `operator_booking_history` (S01) | Highest loyalty signal; direct booking intent |
| 2 | `preferred_bus_class` (S02) | Binary filter — wrong class = guaranteed bounce |
| 3 | `route_familiarity_score` (S04) | Available for 60% of users; strong predictor |
| 4 | `operator_trust_score` (S06) | 100% coverage; pure quality signal |
| 5 | `preferred_departure_window` (S03) | High habitual predictability |
| 6 | `price_sensitivity_tier` (S05) | Prevents premium-first bias for budget users |
| 7 | `device_language` (S08) | Critical for Tier 2/3 cold-start |
| 8 | `search_to_book_velocity` (S07) | Intent urgency signal |

---

## Instrumentation Gaps (New Events Required)

| Gap | What's Missing | Sprint to Fix |
|---|---|---|
| G01 | `operator_trust_score` not yet computed | Build in Sprint 2 as part of rule-based ranking | 
| G02 | `search_to_book_velocity` not persisted per user | Add to user profile store in Sprint 1 |
| G03 | Seat-level preference (window/aisle, upper/lower) not captured | Add to `gt_seat_map_entered` event payload in Sprint 1 |

---

## Sign-Off Checklist

- [ ] Signal inventory reviewed by Data Science lead
- [ ] Correlation analysis run on 90-day session data
- [ ] Top 8 signals confirmed by PM + Data Science
- [ ] Instrumentation gaps logged as engineering tickets
- [ ] Document signed off before Sprint 3 model training begins

---

## Owner & Timeline
- **Data Science:** Run correlation analysis, rank signals
- **PM:** Review shortlist, approve top 8
- **Engineering:** Close instrumentation gaps (G02, G03) in Sprint 1
- **Due:** End of Sprint 1 (Week 2)
