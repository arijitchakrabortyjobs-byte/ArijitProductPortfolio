# US-4.3 — Cold-Start Ranking UI for First-Time Users
**Sprint 4 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
65% of bus-searching users have zero booking history. Without a cold-start UI, they see the same generic price/time sort as always — indistinguishable from a decade-old experience. This story wires the cold-start formula (Sprint 1, US-1.3) into the actual product UI, making it visible and trustworthy for new users.

---

## Cold-Start States and UI Treatment

| User State | Bookings | UI Label | Sort Applied |
|---|---|---|---|
| First-time | 0 | "Top picks for this route" | Cold-start formula |
| Warm-start | 1–2 | "Recommended for you" | 50% cold + 50% affinity |
| Personalized | 3+ | "Picked for you" | Full ML model |
| Reset | Any (post-reset) | "Top picks for this route" | Cold-start formula |

---

## "Top Picks for This Route" Strip

### Component Spec
A route-level trust header shown above the listing for cold-start users:

```
┌─────────────────────────────────────────────────────────┐
│  ⭐ Top picks for Pune → Mumbai                          │
│     Based on 2,847 traveller ratings & on-time data      │
└─────────────────────────────────────────────────────────┘
```

- Background: `rgba(16, 185, 129, 0.08)` (light green)
- Border: `1px solid rgba(16, 185, 129, 0.25)`
- Icon: star (⭐) in #10b981
- Text: "Top picks for [Origin] → [Destination]"
- Sub-text: "Based on [N] traveller ratings & on-time data" (N = actual count from route analytics)
- Dismissible: Yes (× button, persists dismissal for the session)

---

## Operator Card Enhancements for Cold-Start

For cold-start users, operator cards show additional trust signals that returning users don't need (since they have history):

### Trust Badge
```
ON-TIME  92%      Rated 4.3★     2.1K trips
```
- On-time departure percentage (from operator trust score)
- Passenger rating (from review aggregation)
- Total trips on this route in last 30 days (social proof)

### Route Popularity Indicator
```
████████░░  Popular on this route
```
- Bar fill = route_popularity_score (0–1)
- Label: "Popular on this route" / "Less travelled route"

---

## Cold-Start Score Transparency

When a user taps the "Top picks for this route" chip:

```
Bottom sheet title: "How we ranked these buses"

Why these are at the top:
  ● Route popularity — how often others book this operator
  ● On-time performance — departure reliability score
  ● Best match timing — buses that fit peak travel hours

These rankings improve as you travel more with MakeMyTrip.
```

---

## Graduation Animation

When a user completes their first booking and returns for a second search, show a one-time toast:

```
🎉 "Your picks are getting personal"
   "We've started learning your travel style."
   [Dismiss]
```

- Appears at top of listing page on first return search post-booking
- Auto-dismisses after 4 seconds
- Never shown again after first display

---

## A/B Test for Cold-Start UI

| Variant | Experience | Primary Metric |
|---|---|---|
| Control | Default sort (price/time) for new users | Search → Payment CVR |
| Variant A | Cold-start formula + "Top picks" strip | Search → Payment CVR |
| Variant B | Cold-start formula + strip + trust badges on cards | Search → Payment CVR |

Target: Variant A or B shows ≥3% lift over control. Best performer ships.

---

## Analytics Events

```json
// Strip viewed
{ "event": "cold_start_strip_viewed", "route": "Pune→Mumbai", "result_count": 14 }

// Strip dismissed
{ "event": "cold_start_strip_dismissed" }

// Trust badge tapped
{ "event": "cold_start_trust_badge_tapped", "operator_id": "op_007", "badge_type": "on_time" }

// Graduation toast shown
{ "event": "cold_start_graduation_toast_shown", "bookings_completed": 1 }
```

---

## Sign-Off Checklist

- [ ] Cold-start strip component reviewed in Figma
- [ ] Operator trust data (on-time %, ratings) available for all operators in DB
- [ ] Graduation toast triggered correctly on first post-booking search
- [ ] A/B test variants configured in feature flag system
- [ ] Analytics events firing in staging

---

## Owner & Timeline
- **Design:** Trust strip, card badge layout, bottom sheet transparency copy
- **Engineering:** Cold-start score computation, trust badge data pipeline
- **PM:** Approve copy, A/B test configuration
- **Due:** End of Sprint 4 (Week 8)
