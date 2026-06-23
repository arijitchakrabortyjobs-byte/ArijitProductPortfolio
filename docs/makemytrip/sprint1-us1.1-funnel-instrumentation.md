# US-1.1 — End-to-End Funnel Instrumentation Spec
**Sprint 1 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Establish precise, step-level event tracking across the bus booking funnel so the team has an unambiguous baseline conversion rate before any experiment begins. No ranking change should ship without this foundation.

---

## Funnel Steps & Event Schema

| Step | Event Name | Trigger |
|---|---|---|
| 1 | `gt_search_initiated` | User taps "Search" on the Ground Transport home screen |
| 2 | `gt_listing_viewed` | Bus listing page renders with ≥1 result |
| 3 | `gt_operator_card_clicked` | User taps any operator card on listing page |
| 4 | `gt_seat_map_entered` | Seat selection screen renders |
| 5 | `gt_payment_initiated` | User taps "Proceed to Pay" |
| 6 | `gt_payment_success` | Payment confirmation received from gateway |

---

## Event Properties (All Events)

```json
{
  "user_id": "string (hashed)",
  "session_id": "string (UUID)",
  "event_name": "string",
  "timestamp": "ISO 8601",
  "route_origin": "string (city name)",
  "route_destination": "string (city name)",
  "travel_date": "YYYY-MM-DD",
  "operator_id": "string | null",
  "sort_order_applied": "enum: default | personalized | price_asc | departure_asc",
  "device_type": "enum: android | ios | web",
  "city_tier": "enum: metro | tier2 | tier3",
  "is_returning_user": "boolean",
  "ab_variant": "enum: control | variant | none"
}
```

---

## Additional Properties Per Step

### `gt_listing_viewed`
```json
{
  "result_count": "integer",
  "top_operator_id": "string",
  "ranking_algorithm_version": "string (e.g. rule_v1 | ml_v1)"
}
```

### `gt_operator_card_clicked`
```json
{
  "operator_rank_position": "integer (1-indexed)",
  "operator_id": "string",
  "bus_class": "enum: sleeper | semi_sleeper | seater | ac",
  "departure_time": "HH:MM",
  "fare": "float"
}
```

### `gt_payment_success`
```json
{
  "booking_id": "string",
  "final_operator_id": "string",
  "final_fare": "float",
  "seat_count": "integer",
  "payment_method": "enum: upi | card | netbanking | wallet"
}
```

---

## Analytics Tool
**Primary:** Amplitude (existing MMT implementation)
**Secondary:** Internal data warehouse via Kafka event stream

---

## Dashboard Requirements

Build a funnel dashboard in Amplitude with the following views:

1. **Overall Funnel** — step-by-step conversion rates (all users)
2. **City Tier Split** — Metro vs Tier 2 vs Tier 3 conversion at each step
3. **New vs Returning** — conversion rates segmented by user type
4. **Device Split** — Android vs iOS vs Web
5. **Daily Trend** — 30-day rolling conversion rate per step

---

## Baseline Targets (To Be Measured, Not Assumed)

| Funnel Step | Hypothesis (Pre-measurement) |
|---|---|
| Search → Listing | ~85% (high — search intent is strong) |
| Listing → Card Click | ~55% (moderate — users scan before tapping) |
| Card Click → Seat Map | ~70% (most users who click intend to proceed) |
| Seat Map → Payment Init | ~45% (known drop-off — seat map friction) |
| Payment Init → Success | ~88% (payment failures are low) |
| **Overall: Search → Paid** | **~17% (estimated)** |

> These are hypotheses only. Actual baseline numbers from instrumentation will replace these before Sprint 2 begins.

---

## Sign-Off Checklist

- [ ] Event schema reviewed by Engineering lead
- [ ] Events firing correctly in staging (QA sign-off)
- [ ] Events verified in Amplitude dashboard (Analytics sign-off)
- [ ] Baseline numbers captured for 7-day period (PM sign-off)
- [ ] Dashboard shared with Director - Product Management

---

## Owner & Timeline
- **PM:** Define schema, review dashboard, sign off baseline
- **Engineering:** Instrument events in app (Android + iOS + Web)
- **Analytics:** Build Amplitude dashboard, validate event integrity
- **Due:** End of Sprint 1 (Week 2)
