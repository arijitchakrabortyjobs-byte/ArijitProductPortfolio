# US-1.4 — A/B Test Feature-Flag Framework Spec
**Sprint 1 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Define the feature-flag and A/B testing infrastructure that will control all ranking experiments across Sprints 2–6. This is the experimentation backbone — every ranking change ships through this system.

---

## Requirements

### Flag Targeting Dimensions
The system must support traffic splits across these dimensions simultaneously:

| Dimension | Values |
|---|---|
| Traffic percentage | 0–100% (per variant) |
| City tier | Metro / Tier 2 / Tier 3 / All |
| User type | New (0 bookings) / Returning / All |
| Platform | Android / iOS / Web / All |
| Route type | Intercity / Intracity / All |

### Flag Consistency
- Split must be **user-level** (not session-level)
- Same user must always see the same variant for the duration of an experiment
- Achieved via: `hash(user_id + experiment_id) mod 100 < traffic_percentage`

---

## Experiment Configuration Schema

```json
{
  "experiment_id": "gt_ranking_personalization_v1",
  "description": "Rule-based operator affinity ranking vs default sort",
  "status": "active",
  "start_date": "2025-07-14",
  "end_date": "2025-07-28",
  "targeting": {
    "city_tier": ["metro", "tier2", "tier3"],
    "user_type": "returning",
    "platform": ["android", "ios"]
  },
  "variants": [
    {
      "id": "control",
      "name": "Default Sort (Price + Departure Time)",
      "traffic_percentage": 10,
      "ranking_algorithm": "default"
    },
    {
      "id": "variant_a",
      "name": "Rule-Based Personalized Ranking",
      "traffic_percentage": 10,
      "ranking_algorithm": "rule_v1"
    }
  ],
  "primary_metric": "search_to_payment_conversion",
  "guardrail_metrics": ["booking_error_rate", "cancellation_rate", "support_ticket_volume"],
  "auto_pause_on_guardrail_breach": true,
  "guardrail_threshold_pct": 5
}
```

---

## Experiment Lifecycle

```
Draft → Review → Approved → Active → Paused | Concluded
```

| State | Who Can Transition | Condition |
|---|---|---|
| Draft → Review | PM | Config complete |
| Review → Approved | Engineering Lead + PM | Feasibility confirmed |
| Approved → Active | Engineering | Flag deployed, events firing |
| Active → Paused | Auto (guardrail breach) or PM | Guardrail breach OR manual stop |
| Active → Concluded | PM + Analytics | Reached target sample size + statistical significance |

---

## Metric Definitions

### Primary Metric
**Search → Payment Conversion Rate**
```
= (sessions with gt_payment_success) / (sessions with gt_search_initiated) × 100
```
Measured per variant; relative lift = (variant_rate - control_rate) / control_rate × 100

### Guardrail Metrics
| Metric | Definition | Breach Threshold |
|---|---|---|
| Booking error rate | `gt_payment_failed` / `gt_payment_initiated` | +5% vs control |
| Cancellation rate | Cancellations / Completed bookings (7-day post-booking) | +5% vs control |
| Support ticket volume | GT-related support tickets created | +5% vs control |

---

## Statistical Significance Requirements

- **Confidence level:** 95% (p < 0.05)
- **Minimum detectable effect:** 5% relative lift in conversion
- **Minimum run duration:** 14 days (to capture weekly seasonality)
- **Minimum sample size per variant:** 5,000 sessions

> Sample size calculated using: α = 0.05, power = 0.80, baseline conversion ~17%

---

## Tooling

| Component | Tool |
|---|---|
| Feature flags | LaunchDarkly (or internal flag service if available) |
| Event tracking | Amplitude |
| Statistical analysis | Internal stats engine or Evan Miller's A/B calculator |
| Alerting | PagerDuty (Sev-1) + Slack (Sev-2) |

---

## Sign-Off Checklist

- [ ] Flag schema reviewed by Engineering lead
- [ ] User-level hashing mechanism confirmed (no session drift)
- [ ] Control/variant assignment verified in staging (same user = same variant across sessions)
- [ ] Guardrail auto-pause logic tested
- [ ] Amplitude events include `ab_variant` property for all GT funnel events

---

## Owner & Timeline
- **Engineering:** Build flag infrastructure, integrate with ranking service
- **Analytics:** Set up experiment dashboards in Amplitude
- **PM:** Own experiment config; approve before each experiment goes active
- **Due:** End of Sprint 1 (Week 2)
