# US-3.1 — Train LambdaMART Ranking Model on Behavioural Signals
**Sprint 3 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Replace the rule-based ranking (Sprint 2) with a trained learning-to-rank model that predicts booking probability for each operator per session. LambdaMART optimises directly for NDCG — a ranking metric — rather than pointwise classification, making it the right algorithm for this problem.

---

## Why LambdaMART

| Approach | How it works | Why not for this |
|---|---|---|
| Pointwise (logistic regression) | Predicts booking probability per item independently | Ignores relative order; can rank less-relevant items higher |
| Pairwise (RankNet) | Learns which of two items should rank higher | Better than pointwise but doesn't optimise for top-K metrics |
| **Listwise (LambdaMART)** | **Optimises NDCG directly across the full list** | **Best for top-3/top-5 ranking quality** |

---

## Feature Set (Input to Model)

| Feature Name | Type | Source | Description |
|---|---|---|---|
| `operator_affinity_score` | float [0–1] | Booking history | Recency-weighted booking frequency with operator |
| `preferred_class_match` | binary | Booking history | 1 if operator's dominant class = user's preferred class |
| `departure_time_fit_score` | float [0–1] | Booking history | Fit between bus departure and user's preferred window |
| `route_familiarity_score` | float [0–1] | Search + booking history | How often user has searched/booked this route |
| `operator_trust_score` | float [0–1] | Operator DB | Composite of on-time %, cancellation rate, ratings |
| `price_sensitivity_tier` | int [1–3] | Booking history | 1=budget, 2=mid, 3=premium |
| `fare_vs_route_median` | float | Route analytics | Operator fare / median fare for this route |
| `days_since_last_booking` | int | Booking history | Recency of user's last completed booking (any route) |
| `is_cold_start` | binary | User profile | 1 if user has <3 completed bookings |
| `device_language_match` | binary | Session | 1 if operator's region matches user's device language |

---

## Training Data

- **Source:** `gt_ranking_training_data` table (Sprint 2 logging pipeline)
- **Label:** `booked` (1 = booking completed, 0 = not booked)
- **Query:** `(user_id, route, travel_date)` — one query per search session
- **Documents:** All operators shown in that session's listing
- **Minimum training set:** 50,000 queries with at least 8,000 positive labels

### Label Grade Mapping (NDCG requires graded labels)
```
booked = true           → relevance grade 3 (most relevant)
clicked, not booked     → relevance grade 1
not clicked             → relevance grade 0
```

---

## Model Training Pipeline

```
1. Data Pull
   SELECT * FROM gt_ranking_training_data
   WHERE search_date >= NOW() - INTERVAL 90 DAYS
   AND label IS NOT NULL

2. Feature Engineering
   - Compute operator_affinity_score with decay
   - Normalise all float features to [0,1]
   - One-hot encode price_sensitivity_tier
   - Join operator_trust_score from operator master table

3. Train/Validation/Test Split
   - Train: search_date < cutoff - 7 days (70%)
   - Validation: cutoff - 7 to cutoff - 1 day (15%)
   - Test: last 7 days (15%)
   - Split by query (not by row) to prevent leakage

4. Model Training
   Algorithm: LambdaMART (via LightGBM ranker)
   Objective: lambdarank
   Eval metric: ndcg@5
   num_leaves: 63
   learning_rate: 0.05
   n_estimators: 500 (with early stopping on validation NDCG)

5. Evaluation
   - Primary: NDCG@5 on held-out test set (target: > 0.72)
   - Secondary: NDCG@5 vs rule-based v1 baseline (target: ≥5% lift)
   - Segment breakdown: Metro vs Tier2/3, new vs returning users
```

---

## Offline Evaluation Results (Target)

| Metric | Baseline (Rule v1) | ML Model Target |
|---|---|---|
| NDCG@5 overall | 0.685 | > 0.720 |
| NDCG@5 — Tier 2/3 | 0.641 | > 0.680 |
| NDCG@5 — returning users | 0.712 | > 0.750 |
| Precision@1 (top result booked) | 28% | > 34% |

---

## Model Registry & Versioning

- **Registry:** MLflow (or internal equivalent)
- **Version tag:** `gt_bus_ranking_v1.0`
- **Artifacts stored:** model binary, feature schema, training config, eval metrics
- **Promotion gate:** NDCG@5 > 0.72 AND ≥5% lift over baseline → auto-promote to staging

---

## Sign-Off Checklist

- [ ] Training pipeline runs end-to-end in < 4 hours
- [ ] NDCG@5 > 0.72 on held-out test set confirmed
- [ ] Segment analysis (Tier 2/3, new vs returning) reviewed by PM
- [ ] Model registered in MLflow with all artifacts
- [ ] Feature schema documented for serving API (US-3.2)

---

## Owner & Timeline
- **Data Science:** Model training, eval, MLflow registration
- **PM:** Review offline eval metrics, approve promotion to staging
- **Due:** End of Sprint 3 (Week 6)
