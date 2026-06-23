# US-2.4 — Ranking Decision Logging Schema for ML Training
**Sprint 2 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Every ranking decision made by the rule-based engine in Sprint 2 must be logged with sufficient detail to serve as **labelled training data** for the Sprint 3 ML ranking model. The quality of the ML model is directly bounded by the quality of these logs.

---

## Why This Matters
The ML model in Sprint 3 uses a learning-to-rank (LTR) approach. LTR requires:
- **Query:** The search (user + route + date)
- **Documents:** The operators shown in the listing
- **Labels:** Which operator was clicked / booked (relevance signal)
- **Features:** The signal values at the time of ranking

Without these logs, Sprint 3 has no training data.

---

## Log Event: `gt_ranking_decision`

Fired **once per operator** shown in the listing — i.e. if 12 operators appear, 12 events fire per search session.

### Schema

```json
{
  "log_version": "1.0",
  "event_name": "gt_ranking_decision",
  "timestamp": "ISO 8601",

  // Query context
  "user_id": "string (SHA-256 hashed)",
  "session_id": "string (UUID)",
  "route_origin": "string",
  "route_destination": "string",
  "travel_date": "YYYY-MM-DD",
  "search_timestamp": "ISO 8601",
  "ab_variant": "enum: control | variant | none",

  // Document (operator being ranked)
  "operator_id": "string",
  "operator_name": "string",
  "bus_class": "enum: ac_sleeper | sleeper | ac_seater | seater",
  "departure_time": "HH:MM",
  "fare": "float (INR)",
  "seats_available": "integer",

  // Ranking decision
  "final_rank_position": "integer (1 = top of list)",
  "default_rank_position": "integer (what rank would be without personalization)",
  "rank_delta": "integer (final_rank - default_rank; negative = promoted)",

  // Boosts applied
  "boosts_applied": [
    {
      "boost_type": "enum: operator_affinity | class_preference | departure_time | none",
      "boost_magnitude": "float (0.0 – 1.0)",
      "raw_signal_value": "float"
    }
  ],
  "total_boost_score": "float",

  // Signal values at time of ranking (features for ML)
  "signals": {
    "operator_affinity_score": "float | null",
    "preferred_class_match": "boolean | null",
    "departure_time_fit_score": "float | null",
    "route_familiarity_score": "float | null",
    "operator_trust_score": "float",
    "price_sensitivity_tier": "enum: budget | mid | premium | null",
    "days_since_last_booking_with_operator": "integer | null"
  },

  // Outcome labels (filled asynchronously post-session)
  "clicked": "boolean",
  "clicked_rank_position": "integer | null",
  "booked": "boolean",
  "booking_id": "string | null",
  "time_to_click_seconds": "float | null",
  "time_to_book_seconds": "float | null"
}
```

---

## Data Pipeline

```
App Event → Kafka Topic: gt_ranking_decisions
         → Flink Stream Processor (join with booking outcome within 2hrs)
         → Data Warehouse Table: gt_ranking_training_data
         → Weekly export to ML Feature Store (for Sprint 3 model training)
```

### Outcome Join Logic
- Booking outcome (`booked`, `booking_id`) joined asynchronously
- Join window: up to 2 hours after search session start
- If no booking within 2 hours: `booked = false`, `booking_id = null`

---

## Data Quality Requirements

| Check | Threshold | Action if Failed |
|---|---|---|
| Events with null `user_id` | < 0.1% | Alert Engineering; investigate session tracking |
| Events with null `operator_trust_score` | < 0.5% | Alert Data team; fallback to operator average |
| Outcome join rate (bookings matched) | > 95% | Alert if drops below; check Kafka lag |
| Daily log volume vs expected | ±20% of baseline | Alert PM + Data Science |

---

## Training Data Volume Target

| Metric | Target |
|---|---|
| Minimum sessions before Sprint 3 training | 50,000 |
| Minimum positive labels (booked = true) | 8,000 |
| Expected daily log volume | ~5,000–8,000 sessions |
| Target reached by | Day 10 of Sprint 2 |

---

## Access & Retention

- **Access:** Data Science team (full access), PM (read-only dashboard), Engineering (write only)
- **Retention:** 365 days (raw logs); indefinitely (aggregated training sets)
- **PII handling:** `user_id` is SHA-256 hashed at source; no plaintext PII in logs

---

## Sign-Off Checklist

- [ ] Log schema reviewed and approved by Data Science lead
- [ ] Kafka topic and Flink job set up by Engineering
- [ ] Outcome join logic tested with synthetic bookings in staging
- [ ] Data quality checks automated and alerting configured
- [ ] 50,000 session target confirmed achievable before Sprint 3 kickoff

---

## Owner & Timeline
- **Engineering:** Instrument `gt_ranking_decision` events; build Kafka → DW pipeline
- **Data Science:** Define feature store schema; validate join logic
- **PM:** Review schema completeness; own data quality targets
- **Due:** End of Sprint 2 (Week 4) — logs must be live from Day 1 of Sprint 2
