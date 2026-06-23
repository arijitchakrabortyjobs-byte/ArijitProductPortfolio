# US-2.1 — Operator Affinity Boost for Returning Users
**Sprint 2 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Surface previously-booked operators higher in the listing for returning users. This is the single highest-signal personalization rule: a user who booked with RedBus Travels twice is statistically far more likely to book with them again than to switch to an unfamiliar operator.

---

## Business Logic

### Affinity Score Calculation

```
operator_affinity_score(user, operator, route) =
  IF operator NOT IN user.booking_history OR operator NOT serving route:
    return 0

  base_score = booking_count_on_operator (last 365 days)
  recency_weight = decay_factor(days_since_last_booking)
  route_match_bonus = 1.2 IF route matches historically booked route ELSE 1.0

  return base_score × recency_weight × route_match_bonus
```

### Decay Function
```
decay_factor(days) =
  days ≤ 30  → 1.0   (full weight — recent booking)
  days ≤ 60  → 0.8
  days ≤ 90  → 0.6
  days ≤ 180 → 0.4
  days > 180 → 0.2   (signal fades — preferences may have changed)
  days > 365 → 0.0   (signal retired)
```

---

## Ranking Boost Application

```
final_rank_score(operator) =
  base_listing_score(operator)          // existing price + availability score
  + (operator_affinity_score × 0.20)   // 20% affinity boost
```

> The 20% boost is intentionally conservative. It prioritises familiar operators without completely suppressing better-value alternatives. Boost magnitude will be tuned based on Sprint 5 A/B data.

---

## Eligibility Rules

| Condition | Behaviour |
|---|---|
| User has 0 bookings | No affinity boost applied — falls back to cold-start ranking |
| Operator serves searched route | Boost applied normally |
| Operator does NOT serve searched route | Boost = 0 (operator won't appear in results) |
| Affinity score after decay = 0 | No boost — treat as new user for this operator |
| Multiple eligible operators | All receive proportional boost; relative ranking preserved |

---

## Feature Flag Config

```json
{
  "experiment_id": "gt_operator_affinity_v1",
  "targeting": {
    "user_type": "returning",
    "city_tier": ["metro", "tier2", "tier3"]
  },
  "variants": [
    { "id": "control", "traffic_percentage": 10, "ranking_algorithm": "default" },
    { "id": "variant", "traffic_percentage": 10, "ranking_algorithm": "rule_affinity_v1" }
  ],
  "primary_metric": "search_to_payment_conversion",
  "guardrail_metrics": ["booking_error_rate", "cancellation_rate"]
}
```

---

## Logging Schema (for Sprint 3 ML Training)

Every ranking event must log:

```json
{
  "user_id": "hashed",
  "session_id": "UUID",
  "route": "origin→destination",
  "operator_id": "string",
  "boost_type": "operator_affinity",
  "boost_magnitude": 0.20,
  "affinity_score_raw": 0.85,
  "final_rank_position": 1,
  "clicked": true,
  "booked": true,
  "ab_variant": "variant"
}
```

---

## Success Metrics

| Metric | Target |
|---|---|
| Previously-booked operator CTR (variant vs control) | +20% relative lift |
| Search → Payment conversion (variant vs control) | +8% relative lift |
| Affinity boost relevance (booked operator = boosted operator) | >60% of boosted sessions |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| User has booked operator A 10x but operator A has poor reliability score | Affinity boost still applies — user trust outweighs platform score for returning users. Operator Trust Score surfaced in card UI so user can see it. |
| User searches from a new city they've never booked from | Route familiarity = 0; affinity boost on operator still applies if operator serves the new route |
| Two operators have equal affinity score | Fall back to `operator_trust_score` as tiebreaker |

---

## Owner & Timeline
- **Engineering:** Implement affinity score calculation + ranking boost
- **Data Science:** Validate decay function on historical data
- **PM:** Review eligibility rules, approve feature flag config
- **Due:** End of Sprint 2 (Week 4)
