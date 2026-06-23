# US-2.2 — Bus Class Preference Ranking
**Sprint 2 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Infer a user's preferred bus class from booking history and rank that class first — eliminating the need to manually apply the class filter on every search. For sleeper users, showing seater-heavy listings first is a guaranteed conversion killer.

---

## Class Taxonomy

| Class | Code | Description |
|---|---|---|
| AC Sleeper | `ac_sleeper` | Air-conditioned, full-flat berths |
| Non-AC Sleeper | `sleeper` | Non-AC, full-flat berths |
| AC Seater | `ac_seater` | Air-conditioned, recliner/pushback seats |
| Non-AC Seater | `seater` | Non-AC, standard seats |

---

## Preference Inference Logic

```
preferred_class(user) =
  IF user.completed_bookings < 3:
    return null  // insufficient history — no class inference

  class_counts = frequency_count(user.last_10_bookings.bus_class)
  dominant_class = argmax(class_counts)

  IF class_counts[dominant_class] / total_bookings >= 0.60:
    return dominant_class  // clear preference — 60%+ of bookings are this class
  ELSE:
    return null  // mixed history — do not infer, show all classes
```

> **Threshold rationale:** 60% dominance avoids false inference. A user who books sleeper 3 out of 5 times likely prefers it; a 50/50 split should show all classes equally.

---

## Ranking Application

```
IF preferred_class is not null:
  Sort listing into two groups:
    Group A: buses of preferred_class → ranked first (by existing score within group)
    Group B: all other classes → ranked after Group A

  Add UI chip: "Showing [Sleeper] buses first · Change"
  
IF preferred_class is null:
  No class-based reordering — default listing order applies
```

---

## UI Specification

### Preference Chip (when active)
- Location: Top of listing page, below search summary bar
- Copy: `"Showing Sleeper buses first"` with a pencil/edit icon
- Tapping the chip opens the class filter panel
- Chip is dismissible (× button) — dismissal clears class preference for this session only

### Filter Panel Behaviour
- Class filter arrives pre-selected to preferred class when chip is active
- User can override — selecting a different class updates listing immediately
- Override is session-scoped only (does not permanently update preference)

---

## Preference Update Rules

| Event | Effect on Stored Preference |
|---|---|
| User completes a booking | New booking added to history; preference re-computed |
| User overrides filter in session | Session override only; stored preference unchanged |
| User clicks "Reset preferences" | Stored preference cleared; next session shows all classes |
| User has < 3 bookings | No preference stored |

---

## Logging Schema

```json
{
  "user_id": "hashed",
  "session_id": "UUID",
  "boost_type": "class_preference",
  "inferred_class": "sleeper",
  "confidence": 0.80,
  "class_override_by_user": false,
  "final_rank_position": 2,
  "booked_class": "sleeper",
  "booked": true
}
```

---

## Success Metrics

| Metric | Target |
|---|---|
| Class filter manual application rate (variant vs control) | -30% (users no longer need to filter manually) |
| Seat map entry rate for preferred-class users | +12% (fewer wrong-class dead ends) |
| Class preference accuracy | >75% (booked class = inferred class) |

---

## Owner & Timeline
- **Engineering:** Implement preference inference + listing sort
- **Design:** Preference chip component + filter panel integration
- **PM:** Approve threshold (60%) and UI spec
- **Due:** End of Sprint 2 (Week 4)
