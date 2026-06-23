# US-4.1 — "Picked for You" Label on Personalized Listing Cards
**Sprint 4 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
Personalization that's invisible breeds distrust. Users who see a non-obvious listing order need a signal that it's relevant to them — not random, not paid placement. The "Picked for you" label is that signal: it names the personalization explicitly, gives users a one-tap way to understand it, and builds confidence in the ranking.

---

## When the Label Appears

| Condition | Label Shown |
|---|---|
| User is returning (≥3 bookings) AND ranking differs from default sort | "Picked for you" |
| User is new (0–2 bookings) AND cold-start ranking active | "Top picks for this route" |
| User is in A/B control group (default sort) | No label |
| User has reset preferences | No label (until next booking) |
| Ranking is identical to default sort (no personalization effect) | No label |

---

## Label Placement

- **Position:** Top-right corner of the operator card (not the listing header)
- **Max cards labelled:** Top 3 ranked results only
- **Condition:** Label only shows on cards where the rank differs from default position by ≥2 positions (i.e., the card was meaningfully promoted by personalization)

---

## UI Component Spec

### "Picked for you" chip
```
Background: rgba(99, 102, 241, 0.12)   // indigo tint
Border:     1px solid rgba(99, 102, 241, 0.40)
Text:       "Picked for you"
Color:      #6366f1 (indigo)
Font:       11px, 600 weight
Border-radius: 999px (pill shape)
Padding:    3px 10px
```

### Tooltip (on tap)
```
Text: "Based on your past trips with this operator"
Max width: 220px
Position: below the chip
Dismissible: tap outside
```

### "Top picks for this route" chip (cold-start variant)
```
Background: rgba(16, 185, 129, 0.12)   // green tint
Border:     1px solid rgba(16, 185, 129, 0.40)
Text:       "Top pick for this route"
Color:      #10b981 (green)
Same sizing as above
```

---

## Tooltip Copy by Signal

The tooltip should reflect the actual signal driving the ranking — not a generic message.

| Primary Signal | Tooltip Text |
|---|---|
| Operator affinity | "Based on your past trips with this operator" |
| Class preference | "Matches your preferred bus type" |
| Departure time | "Matches your usual travel time" |
| Combined signals | "Based on your travel preferences" |
| Cold-start | "Highly rated on this route" |

---

## Analytics Events

```json
// Fired when label is visible on screen (lazy observer)
{
  "event": "personalization_label_viewed",
  "label_type": "picked_for_you | top_pick_route",
  "operator_id": "op_007",
  "rank_position": 1,
  "primary_signal": "operator_affinity",
  "ab_variant": "variant"
}

// Fired when user taps the label chip
{
  "event": "personalization_label_tapped",
  "label_type": "picked_for_you",
  "operator_id": "op_007",
  "tooltip_shown": true
}
```

---

## Success Metrics

| Metric | Target |
|---|---|
| Label view rate (impressions / sessions with personalization) | > 80% |
| Label tap rate (tooltip opens) | 5–10% |
| Post-label-view booking rate vs no-label sessions | +5% lift |
| Bounce rate after label view | No regression vs control |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Operator card is below fold | Label fires view event only when card enters viewport (IntersectionObserver) |
| Multiple signals active | Show tooltip for the single highest-weight signal |
| User taps tooltip, then applies a filter | Label remains if filtered results still include that operator at a promoted rank |
| Dark mode | Label uses same colors (indigo/green are readable on dark backgrounds) |

---

## Sign-Off Checklist

- [ ] Figma mockup reviewed and approved by Design
- [ ] Tooltip copy approved by PM
- [ ] Analytics events firing correctly in staging
- [ ] Label not shown in control group (verified via A/B flag check)
- [ ] Accessibility: label readable by screen readers (aria-label set)

---

## Owner & Timeline
- **Design:** Figma component, tooltip spec
- **Engineering:** React component, IntersectionObserver, analytics
- **PM:** Approve tooltip copy, review success metrics
- **Due:** End of Sprint 4 (Week 8)
