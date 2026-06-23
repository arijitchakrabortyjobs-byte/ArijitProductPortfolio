# US-4.2 — User Preference Reset Control
**Sprint 4 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Personalization must never feel like a trap. A user whose travel habits have changed — new job, new city, changed class preference — needs a clear way to reset the system and get a neutral listing. This also builds trust: if users know they can undo it, they're more comfortable letting the system personalise.

---

## Reset Entry Points

### 1. Filter Panel (primary — in-context)
- Location: Inside the "Sort & Filter" bottom sheet, last item before "Apply"
- Label: "Reset my travel preferences"
- Sub-text: "Show all options in default order"
- Style: Text link (not a button) — low prominence to avoid accidental taps

### 2. Account Settings (secondary — persistent)
- Location: Profile > Preferences > Ground Transport
- Label: "Personalised Bus Recommendations"
- Toggle: ON / OFF
- When OFF: Cold-start ranking applies; "Reset" appears as a separate CTA below the toggle

### 3. Listing Page Chip (contextual — when personalization is active)
- Location: Preference chip row ("Showing Sleeper buses first · Change")
- "Change" link opens filter panel directly at the class preference section
- Separate "Reset all" text link at bottom of filter panel

---

## Reset Behaviour

```
FULL RESET (from Account Settings toggle OFF):
  - Clears: operator_affinity_score, preferred_class, preferred_window
  - Sets: is_personalized = false in user profile
  - Effect: Cold-start ranking applies until user re-enables
  - Redis cache: invalidated immediately (TTL set to 0)
  - Next session: "Top picks for this route" label shown (cold-start mode)

SESSION RESET (from Filter Panel "Reset preferences"):
  - Clears preferences for THIS SESSION ONLY
  - Does NOT modify stored user profile
  - Effect: Default sort applied for remainder of session
  - Next session: Full personalization resumes
  - Use case: User wants to explore without their preferences for one trip
```

---

## Confirmation Dialog

```
Title:   "Reset your preferences?"
Body:    "Your past trip history won't be used to sort results.
          You can turn personalisation back on anytime."
CTA 1:   "Reset preferences"  [destructive — red text]
CTA 2:   "Keep personalisation"  [primary — filled button]
```

> No confirmation for session-level reset (lower stakes, easily reversible by next session).

---

## Analytics Events

```json
// Full reset initiated
{
  "event": "personalization_reset_initiated",
  "reset_type": "full | session",
  "entry_point": "account_settings | filter_panel | listing_chip",
  "sessions_since_last_booking": 3
}

// Full reset confirmed
{
  "event": "personalization_reset_confirmed",
  "reset_type": "full"
}

// Reset cancelled (user tapped "Keep personalisation")
{
  "event": "personalization_reset_cancelled"
}
```

---

## Success Metrics

| Metric | Target |
|---|---|
| Full reset rate | < 8% of personalized users per month |
| Session reset rate | < 5% of personalized sessions |
| Re-enable rate (within 30 days of full reset) | > 40% |
| Reset-then-book rate | > 60% (reset doesn't kill intent) |

> Reset rate < 8% signals that personalization is relevant to most users. If it exceeds 12%, investigate whether the ranking model is over-fitting to stale history.

---

## Re-enable Flow

When a user turns personalization back ON after a full reset:
- Preference signals start accumulating again from scratch
- Graduation path applies (0 → 1 → 3 bookings for full ML activation)
- No "memory" of pre-reset preferences (clean slate)

---

## Sign-Off Checklist

- [ ] Confirmation dialog copy approved by PM
- [ ] Session vs full reset distinction confirmed with Engineering
- [ ] Redis invalidation tested (no stale features served post-reset)
- [ ] Re-enable flow tested end-to-end
- [ ] Analytics events validated in staging

---

## Owner & Timeline
- **Design:** Reset UI in filter panel + account settings
- **Engineering:** Redis invalidation, user profile update, session flag
- **PM:** Approve copy, monitor reset rate post-launch
- **Due:** End of Sprint 4 (Week 8)
