# US-2.3 — Departure Time Preference Ranking
**Sprint 2 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Surface buses in a user's habitual departure window first — without them having to apply the departure time filter manually on every search. Travel timing is highly habitual: a morning traveller almost never intentionally books a 10pm bus.

---

## Departure Window Taxonomy

| Window ID | Label | Time Range |
|---|---|---|
| `early_morning` | Early Morning | 04:00 – 07:59 |
| `morning` | Morning | 08:00 – 11:59 |
| `afternoon` | Afternoon | 12:00 – 15:59 |
| `evening` | Evening | 16:00 – 19:59 |
| `night` | Night | 20:00 – 23:59 |
| `midnight` | Late Night | 00:00 – 03:59 |

---

## Preference Inference Logic

```
preferred_window(user) =
  IF user.completed_bookings < 5:
    return null  // need at least 5 bookings for reliable time inference

  departure_times = user.last_5_bookings.departure_time
  median_departure = median(departure_times)
  preferred_window = map_to_window(median_departure)

  // Validate: at least 3 of 5 bookings fall in the same window
  bookings_in_window = count(departure_times WHERE window == preferred_window)
  
  IF bookings_in_window >= 3:
    return preferred_window
  ELSE:
    return null  // inconsistent history — no time preference
```

---

## Ranking Application

```
IF preferred_window is not null:

  departure_time_fit_score(bus) =
    bus.departure_window == preferred_window      → 1.0
    bus.departure_window is adjacent window       → 0.6   // ±1 window
    bus.departure_window is 2 windows away        → 0.2
    else                                          → 0.0

  listing_boost = departure_time_fit_score × 0.15

  // Buses within ±2 hours of median preferred departure get 15% boost
  // Buses outside this range receive no boost (not penalised, just not boosted)
```

---

## UI Specification

### Timing Chip (when active)
- Location: Top of listing, next to class preference chip (if both active)
- Copy: `"Showing Morning buses first"` with clock icon
- Tapping opens departure time filter panel (pre-selected to preferred window)
- Dismissible per session

### Visual Indicator on Card
- Buses in preferred window: no additional marker (ranking does the work silently)
- Buses far outside window: small label `"Late Night"` on card — transparency for user

---

## Guard: Journey-Type Awareness

Some routes have no meaningful choice — e.g. a 6-hour overnight route mostly has night departures. In this case, time preference boost is suppressed:

```
IF (route_departure_window_diversity < 2 distinct windows available):
  suppress time preference boost for this search
  // Avoids amplifying a signal that doesn't apply
```

---

## Logging Schema

```json
{
  "user_id": "hashed",
  "session_id": "UUID",
  "boost_type": "departure_time_preference",
  "inferred_window": "morning",
  "median_departure_time": "08:45",
  "departure_fit_score": 1.0,
  "boost_magnitude": 0.15,
  "final_rank_position": 1,
  "booked_departure_time": "09:00",
  "booked": true
}
```

---

## Success Metrics

| Metric | Target |
|---|---|
| Time filter manual application rate (variant vs control) | -25% |
| Avg scroll depth on listing (variant vs control) | -15% (users find their bus faster) |
| Departure time accuracy (booked window = inferred window) | >70% |

---

## Owner & Timeline
- **Engineering:** Implement window inference + fit score calculation
- **Design:** Timing chip component
- **PM:** Approve window taxonomy and guard condition
- **Due:** End of Sprint 2 (Week 4)
