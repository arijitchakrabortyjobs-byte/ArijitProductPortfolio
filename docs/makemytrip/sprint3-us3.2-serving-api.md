# US-3.2 — Real-Time Model Serving API (< 80ms P95)
**Sprint 3 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Expose the trained LambdaMART model as a low-latency REST API that the bus listing service can call at search time. Latency is the hard constraint: if the API adds > 80ms to the listing page load, it will hurt conversion more than the personalization gains.

---

## API Specification

### Endpoint
```
POST /v1/ranking/bus
Content-Type: application/json
```

### Request
```json
{
  "user_id": "u_a3f9c2d1",
  "origin": "Pune",
  "destination": "Mumbai",
  "travel_date": "2025-08-15",
  "operator_ids": ["op_001", "op_002", "op_003", "op_007", "op_012"],
  "request_context": {
    "device_language": "hi",
    "city_tier": "tier2",
    "session_id": "sess_abc123"
  }
}
```

### Response
```json
{
  "ranked_operators": [
    { "operator_id": "op_007", "rank": 1, "score": 0.923, "boost_applied": "operator_affinity" },
    { "operator_id": "op_001", "rank": 2, "score": 0.841, "boost_applied": "class_preference" },
    { "operator_id": "op_003", "rank": 3, "score": 0.774, "boost_applied": "none" },
    { "operator_id": "op_012", "rank": 4, "score": 0.651, "boost_applied": "none" },
    { "operator_id": "op_002", "rank": 5, "score": 0.589, "boost_applied": "none" }
  ],
  "ranking_model": "gt_bus_ranking_v1.0",
  "is_personalized": true,
  "cold_start": false,
  "latency_ms": 42,
  "request_id": "req_xyz789"
}
```

---

## Latency Budget

| Component | Budget |
|---|---|
| Feature retrieval (Redis cache) | ≤ 15ms |
| Model inference (LightGBM) | ≤ 25ms |
| Response serialisation | ≤ 5ms |
| Network overhead | ≤ 15ms |
| **Total P95 target** | **≤ 80ms** |

---

## Feature Retrieval Architecture

User features (affinity score, preferred class, departure window) are pre-computed and cached in Redis, not computed on-the-fly at request time. This keeps inference latency predictable.

```
Search Request
    │
    ▼
Ranking API
    ├── Redis (user features, TTL: 1 hour)        → ~10ms
    ├── Operator Feature Store (trust scores)      → ~5ms
    └── LightGBM Model Inference                   → ~20ms
    │
    ▼
Ranked Operator List → Bus Listing Service
```

### Redis Key Schema
```
gt:user_features:{user_id} → {
  "operator_affinity": {"op_001": 0.85, "op_007": 0.92},
  "preferred_class": "sleeper",
  "preferred_window": "morning",
  "price_sensitivity_tier": 2,
  "is_cold_start": false,
  "computed_at": "2025-08-15T06:00:00Z"
}
TTL: 3600 seconds (1 hour)
```

---

## Fallback Strategy

```
Primary: ML model (gt_bus_ranking_v1.0)
    │
    ├── IF model unavailable OR inference > 60ms timeout:
    │       Fallback to rule-based ranking (Sprint 2)
    │
    └── IF rule-based also fails:
            Fallback to default sort (price + departure time)

Fallback rate target: < 1% of requests
```

### Fallback Logging
Every fallback event is logged with reason:
```json
{
  "event": "ranking_fallback",
  "reason": "model_timeout | model_unavailable | feature_retrieval_failure",
  "fallback_to": "rule_v1 | default_sort",
  "session_id": "sess_abc123"
}
```

---

## Load Testing Requirements

| Scenario | Concurrency | P95 Latency Target | Error Rate Target |
|---|---|---|---|
| Normal load | 200 req/s | < 50ms | < 0.1% |
| Peak load | 500 req/s | < 80ms | < 0.5% |
| Spike (2× peak) | 1000 req/s | < 120ms (graceful degrade) | < 2% |

---

## Monitoring & Alerting

| Metric | Alert Threshold | Channel |
|---|---|---|
| API P95 latency | > 100ms | PagerDuty Sev-1 |
| Error rate | > 1% | PagerDuty Sev-1 |
| Fallback rate | > 3% | Slack #gt-alerts Sev-2 |
| Redis cache miss rate | > 20% | Slack #gt-alerts Sev-2 |
| Model version mismatch | Any | Slack #gt-alerts Sev-2 |

---

## Sign-Off Checklist

- [ ] API contract reviewed and approved by Bus Listing Service team
- [ ] Redis feature store populated for top 1M active users
- [ ] Load test at 500 req/s passes (P95 < 80ms, error rate < 0.5%)
- [ ] Fallback logic tested end-to-end (force model failure in staging)
- [ ] Monitoring dashboard live before A/B launch

---

## Owner & Timeline
- **Engineering:** API implementation, Redis integration, load testing
- **Data Science:** Model export to LightGBM binary, feature schema documentation
- **PM:** Review fallback logic, approve monitoring thresholds
- **Due:** End of Sprint 3 (Week 6)
