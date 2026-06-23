# US-3.3 — Automated Weekly Model Retraining Pipeline
**Sprint 3 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
The ranking model must adapt to shifting user preferences and seasonal travel patterns (festival travel, summer holidays, school reopenings). Manual retraining is not scalable. This pipeline runs weekly, automatically retraining, evaluating, and promoting the model — with human review only when quality degrades.

---

## Pipeline Architecture

```
Every Monday 2:00 AM IST
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│ Step 1: Data Pull (30 min)                              │
│  - Pull last 90 days of gt_ranking_training_data        │
│  - Filter: label IS NOT NULL, session_count > 5         │
│  - Output: training_data_{YYYYMMDD}.parquet             │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: Feature Engineering (45 min)                    │
│  - Compute operator affinity scores with decay          │
│  - Normalise all float features                         │
│  - Join operator trust scores                           │
│  - Output: feature_matrix_{YYYYMMDD}.parquet            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Step 3: Model Training (90 min)                         │
│  - Train LambdaMART on 70% of data                      │
│  - Validate on 15% (early stopping)                     │
│  - Output: model_candidate_{YYYYMMDD}.lgbm              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ Step 4: Offline Evaluation (15 min)                     │
│  - NDCG@5 on held-out test set                          │
│  - Compare vs current production model                  │
│  - Segment breakdown: Metro/Tier2/Tier3, new/returning  │
│  - Output: eval_report_{YYYYMMDD}.json                  │
└─────────────────┬───────────────────────────────────────┘
                  │
          ┌───────┴───────────┐
          │                   │
    NDCG improves?       NDCG degrades?
          │                   │
          ▼                   ▼
┌─────────────────┐  ┌─────────────────────────────┐
│ Step 5a: Auto-  │  │ Step 5b: Hold & Alert        │
│ Promote to      │  │  - Keep current prod model   │
│ Staging         │  │  - Alert DS + PM on Slack    │
│ (register in    │  │  - Create investigation      │
│  MLflow as      │  │    ticket automatically      │
│  candidate)     │  └─────────────────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 6: Staging Smoke Test (30 min)                     │
│  - 100 synthetic requests through serving API           │
│  - Assert: P95 latency < 80ms, error rate < 0.1%        │
│  - Assert: ranked output is non-empty for all requests  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         Auto-promote to Production
         (zero-downtime swap via model version tag)
```

**Total pipeline run time: < 4 hours** (target: complete by 6:00 AM IST)

---

## Promotion Decision Rules

```python
def should_promote(new_ndcg, prod_ndcg, new_latency_p95):
    ndcg_improved = new_ndcg > prod_ndcg                    # any improvement
    ndcg_not_catastrophic = new_ndcg >= prod_ndcg * 0.97   # < 3% regression
    latency_ok = new_latency_p95 < 80                      # ms

    return ndcg_improved and latency_ok

def should_alert(new_ndcg, prod_ndcg):
    return new_ndcg < prod_ndcg * 0.97  # >3% regression → alert + hold
```

---

## Alert Spec

### Slack Message (auto-posted to #gt-personalization)
```
🟢 GT Ranking Model Retrained — 2025-08-18
Model: gt_bus_ranking_v1.3
NDCG@5: 0.748 (+1.2% vs prod v1.2)
Status: AUTO-PROMOTED to production ✅
Training data: 72,841 queries | 11,203 bookings
Pipeline completed in: 3h 42m
```

```
🔴 GT Ranking Model Quality Degraded — 2025-08-25
Model: gt_bus_ranking_v1.4 (CANDIDATE — NOT PROMOTED)
NDCG@5: 0.701 (-3.8% vs prod v1.3)
Status: HELD — manual review required ⚠️
Possible causes: data drift, feature pipeline issue, seasonal shift
Action: @data-science-oncall please investigate
```

---

## Data Quality Gates (Step 1 must pass all before training)

| Check | Threshold | Action if Failed |
|---|---|---|
| Minimum queries | ≥ 50,000 | Skip training, alert |
| Minimum positive labels | ≥ 8,000 | Skip training, alert |
| Feature null rate | < 5% per feature | Log warning, continue |
| Label join rate (bookings matched) | > 90% | Alert if <90%, skip if <80% |
| Date range completeness | < 3 missing days | Log warning, continue |

---

## Infrastructure

| Component | Technology |
|---|---|
| Scheduler | Apache Airflow (DAG: `gt_ranking_weekly_retrain`) |
| Compute | Spark on EMR (feature engineering) + single GPU instance (model training) |
| Storage | S3 (training data, model artifacts) |
| Model registry | MLflow |
| Alerting | Slack webhook + PagerDuty for Sev-1 pipeline failures |

---

## Sign-Off Checklist

- [ ] Pipeline runs successfully for 2 consecutive weeks in staging
- [ ] Promotion and hold logic tested with synthetic NDCG scenarios
- [ ] Alert messages reviewed and approved by PM + Data Science
- [ ] Airflow DAG monitored with SLA: pipeline must complete by 6am IST
- [ ] Rollback procedure documented: revert to previous MLflow model version

---

## Owner & Timeline
- **Data Science:** Airflow DAG, training script, evaluation logic
- **Engineering:** Spark pipeline, MLflow integration, Slack webhook
- **PM:** Review alert spec, approve promotion thresholds
- **Due:** End of Sprint 3 (Week 6)
