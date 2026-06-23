# US-1.3 — Cold-Start Signal Definition for New Users
**Sprint 1 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Problem
~65% of bus-searching users on MMT have fewer than 3 completed bookings. The ML ranking model has no behavioural history to personalize for them. Without a cold-start strategy, new users get the same generic price/time sort as always — and churn before they build history.

---

## Cold-Start Trigger Condition

A user is in **cold-start mode** if:
- Completed bus bookings on MMT: **< 1** (zero history)

A user graduates out of cold-start after:
- **1 completed booking** → partial personalization (class + operator available)
- **3 completed bookings** → full ML model activation

---

## Cold-Start Signal Set

| Signal | Source | How Used | Availability |
|---|---|---|---|
| `device_language` | App session | Infer regional preference; surface local operators first | ~95% |
| `registered_city` | User profile | Infer likely origin city for route suggestions | ~80% |
| `search_time_of_day` | Session timestamp | Map to popular departure windows for that time slot | 100% |
| `day_of_week` | Session timestamp | Weekend searches → leisure; weekday → business/commute | 100% |
| `route_popularity_score` | Route analytics DB | Rank operators by how often they're booked on this route | 100% |
| `operator_reliability_score` | Operator DB | On-time %, cancellation rate, ratings — platform-wide | 100% |

---

## Cold-Start Ranking Formula (v1)

```
cold_start_score = 
  (0.40 × route_popularity_score) +
  (0.35 × operator_reliability_score) +
  (0.25 × departure_time_fit_score)
```

**Where:**
- `route_popularity_score` = (bookings on this operator-route in last 30 days) / (max bookings on any operator for this route) — normalised 0–1
- `operator_reliability_score` = composite of on-time departure % (60%) + low cancellation rate (40%) — normalised 0–1
- `departure_time_fit_score` = 1.0 if departure is within the most popular 2-hour window for this route; 0.5 otherwise

---

## UI Treatment for Cold-Start Users

| Element | Returning User | Cold-Start User |
|---|---|---|
| Listing label | "Picked for you" | "Top picks for this route" |
| Tooltip | "Based on your past trips" | "Based on traveller ratings & on-time performance" |
| Filter pre-selection | Inferred from history | No pre-selection (neutral) |

> Cold-start label must be distinct from personalized label — users should never feel the platform is pretending to know them when it doesn't.

---

## Graduation Path (Warm-Start)

```
0 bookings     → cold_start_score (formula above)
1 booking      → 50% cold_start_score + 50% operator_affinity_boost
2 bookings     → 30% cold_start_score + 70% operator_affinity_boost
3+ bookings    → full ML model (cold-start signals retired)
```

---

## Validation Plan

- A/B test cold-start ranking vs default sort for zero-history users
- Primary metric: search → payment conversion for new users
- Target: ≥3% lift before full rollout
- Run for minimum 2 weeks or 10,000 new user sessions (whichever comes later)

---

## Sign-Off Checklist

- [ ] Cold-start formula reviewed and approved by Data Science
- [ ] Feasibility of `route_popularity_score` and `operator_reliability_score` confirmed by Engineering
- [ ] UI treatment reviewed by Design
- [ ] Graduation path logic agreed with Engineering before Sprint 4 implementation

---

## Owner & Timeline
- **PM:** Define formula, own graduation path logic
- **Data Science:** Validate formula on historical new-user data
- **Engineering:** Confirm data availability for all 6 signals
- **Due:** End of Sprint 1 (Week 2)
