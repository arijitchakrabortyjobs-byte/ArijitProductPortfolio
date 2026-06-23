export const funnelBaseline = [
  { step: "Search", label: "Search Initiated", users: 100000, conversion: 100 },
  { step: "Listing", label: "Listing Viewed", users: 85000, conversion: 85.0 },
  { step: "Card Click", label: "Operator Card Clicked", users: 46750, conversion: 55.0 },
  { step: "Seat Map", label: "Seat Map Entered", users: 32725, conversion: 70.0 },
  { step: "Pay Init", label: "Payment Initiated", users: 14726, conversion: 45.0 },
  { step: "Paid", label: "Payment Success", users: 12959, conversion: 88.0 },
];

export const signalInventory = [
  { id: "S01", name: "Operator Booking History", availability: 35, correlation: "Strong", sprint: 2, status: "ready" },
  { id: "S02", name: "Preferred Bus Class", availability: 35, correlation: "Strong", sprint: 2, status: "ready" },
  { id: "S03", name: "Preferred Departure Window", availability: 30, correlation: "Moderate", sprint: 2, status: "ready" },
  { id: "S04", name: "Route Familiarity Score", availability: 60, correlation: "Strong", sprint: 2, status: "ready" },
  { id: "S05", name: "Price Sensitivity Tier", availability: 35, correlation: "Moderate", sprint: 3, status: "ready" },
  { id: "S06", name: "Operator Trust Score", availability: 100, correlation: "Strong", sprint: 2, status: "gap" },
  { id: "S07", name: "Search-to-Book Velocity", availability: 40, correlation: "Moderate", sprint: 3, status: "gap" },
  { id: "S08", name: "Device Language", availability: 95, correlation: "Moderate", sprint: 2, status: "ready" },
];

export const sprintRoadmap = [
  {
    sprint: 1,
    name: "Foundation",
    weeks: "Week 1–2",
    theme: "Know before you build",
    color: "#6366f1",
    stories: [
      { id: "US-1.1", title: "Funnel Instrumentation", status: "done" },
      { id: "US-1.2", title: "Signal Inventory", status: "done" },
      { id: "US-1.3", title: "Cold-Start Signals", status: "done" },
      { id: "US-1.4", title: "A/B Framework", status: "done" },
    ],
  },
  {
    sprint: 2,
    name: "Rule-Based Ranking v1",
    weeks: "Week 3–4",
    theme: "Ship something measurable",
    color: "#8b5cf6",
    stories: [
      { id: "US-2.1", title: "Operator Affinity Boost", status: "done" },
      { id: "US-2.2", title: "Class Preference Ranking", status: "done" },
      { id: "US-2.3", title: "Departure Time Ranking", status: "done" },
      { id: "US-2.4", title: "Ranking Decision Logs", status: "done" },
    ],
  },
  {
    sprint: 3,
    name: "ML Ranking Model v1",
    weeks: "Week 5–6",
    theme: "Move from rules to intelligence",
    color: "#a855f7",
    stories: [
      { id: "US-3.1", title: "Train LambdaMART Model", status: "upcoming" },
      { id: "US-3.2", title: "Model Serving API", status: "upcoming" },
      { id: "US-3.3", title: "Auto Retraining Pipeline", status: "upcoming" },
    ],
  },
  {
    sprint: 4,
    name: "Personalized UI & Cold Start",
    weeks: "Week 7–8",
    theme: "Make personalization visible",
    color: "#ec4899",
    stories: [
      { id: "US-4.1", title: "'Picked for You' Label", status: "upcoming" },
      { id: "US-4.2", title: "Preference Reset Control", status: "upcoming" },
      { id: "US-4.3", title: "Cold-Start Ranking UI", status: "upcoming" },
      { id: "US-4.4", title: "Vernacular Localisation", status: "upcoming" },
    ],
  },
  {
    sprint: 5,
    name: "A/B Launch & Monitoring",
    weeks: "Week 9–10",
    theme: "Ship to real users, watch carefully",
    color: "#f97316",
    stories: [
      { id: "US-5.1", title: "20% Traffic A/B Rollout", status: "upcoming" },
      { id: "US-5.2", title: "Real-Time Dashboard", status: "upcoming" },
      { id: "US-5.3", title: "Daily Experiment Report", status: "upcoming" },
    ],
  },
  {
    sprint: 6,
    name: "Tier 2/3 Tuning & Rollout",
    weeks: "Week 11–12",
    theme: "Optimise for the underserved",
    color: "#10b981",
    stories: [
      { id: "US-6.1", title: "Tier 2/3 Model Variant", status: "upcoming" },
      { id: "US-6.2", title: "A/B Learnings → Model v2", status: "upcoming" },
      { id: "US-6.3", title: "Full Rollout Checklist", status: "upcoming" },
      { id: "US-6.4", title: "Cab & Rail Extension Plan", status: "upcoming" },
    ],
  },
];

export const rankingRules = [
  {
    rule: "Operator Affinity",
    boost: "+20%",
    trigger: "User has booked this operator before",
    coverage: "35% of returning users",
    decay: "Linear over 365 days",
    color: "#6366f1",
  },
  {
    rule: "Class Preference",
    boost: "Group sort",
    trigger: "≥60% of last 10 bookings in same class",
    coverage: "30% of returning users",
    decay: "Updated on each new booking",
    color: "#8b5cf6",
  },
  {
    rule: "Departure Time Fit",
    boost: "+15%",
    trigger: "Bus departs within preferred 2-hour window",
    coverage: "25% of returning users (≥5 bookings)",
    decay: "Recomputed from last 5 bookings",
    color: "#a855f7",
  },
];

export const coldStartFormula = [
  { label: "Route Popularity", weight: 40, color: "#6366f1" },
  { label: "Operator Reliability", weight: 35, color: "#8b5cf6" },
  { label: "Departure Time Fit", weight: 25, color: "#a855f7" },
];
