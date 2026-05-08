# Learnings & What's Next

## What I Learned Building This

### 1. The platform view and the user view are completely different products
When I first built the ShareChat Command Center, I instinctively built what a PM would want: DAU trends, retention cohorts, gifting funnels, A/B test proposals. That's valuable — but it's an internal tool. When I switched perspectives to "what would Priya, a 24-year-old creator in Indore, actually need?" — every design decision changed. She doesn't care about D7 retention curves. She cares about "did my video make money today?" This was the single biggest insight of the project: always build from the user's chair, not the PM's desk.

### 2. Scoping is the hardest part of product work
The PRD has 12 user stories across 5 themes. I could have tried to build all of them at once. Instead, I forced myself to ship Sprint 1 with just earnings visibility — the one feature that addresses the #1 pain point for the #1 persona. Everything else can wait. In practice, I've seen teams fail because they try to ship a "complete" V1 instead of a focused one. The Creator View tab with just earnings data is more useful than a half-finished dashboard with 12 incomplete features.

### 3. Mock data still tells a story if designed well
All the data in the Creator View is fake. But it's not random — the numbers are realistic (₹8,470/month for a 45K-follower Hindi creator is plausible), the trends show growth (which creates an optimistic narrative), and the per-video earnings correlate with engagement (comedy skits outperform motivational quotes, which matches reality). Thoughtful mock data demonstrates product intuition just as much as real data would.

### 4. Documentation is the product
Before this project, I thought the deliverable was the dashboard. Now I believe the deliverable is the *thinking behind* the dashboard. The research doc, the problem framing, the sprint log with tradeoff decisions, the architecture doc — those are what separate "I can build things" from "I can build the *right* things." Any developer can ship a dashboard. A PM ships a dashboard that solves a specific problem for a specific person, and can explain why.

## What I'd Do Differently

### Start with user interviews, not desk research
I researched pain points from reviews, forums, and industry reports. That's secondary research. If I were doing this inside ShareChat, I'd start by talking to 5 creators — 2 nano, 2 mid-tier, 1 mega — and asking them to walk me through their daily workflow. I'd watch them check their earnings (or fail to). I'd see where they get frustrated. Desk research tells you what problems exist. User interviews tell you which problems hurt the most.

### Build a clickable prototype before writing code
I jumped from PRD to code. In a real product team, I'd create a Figma prototype first, test it with 3-5 creators, iterate on the information architecture, and only then build. The current dashboard layout is my best guess — but I haven't validated whether creators want to see earnings first (my assumption) or content performance first (possible alternative).

### Add real interactivity earlier
The Creator View is currently read-only. In Sprint 2+, I'd add features like: tap a video to see its full earnings attribution, toggle between daily/weekly/monthly views, and set earnings goals with progress tracking. These micro-interactions are what make a dashboard feel like a tool, not a report.

## What's Next

### For this portfolio piece
- Complete Sprints 2-8 as outlined in the sprint log
- Add the process documentation (these docs) as a visible section in the portfolio site itself
- Record a 3-minute Loom walkthrough explaining the thinking behind the product decisions

### For the broader portfolio
- Pick a second company (likely Supabase or Linear) and repeat the same process: research → problem framing → PRD → incremental build
- Each new case study should demonstrate a different product skill: the ShareChat piece shows consumer product thinking and creator economy understanding; the next should show developer tools or B2B SaaS thinking

### If I were pitching this to ShareChat
I'd send a cold email to their Head of Creator Ecosystem with: (1) a link to the live dashboard, (2) the research doc showing I understand their creator churn problem, and (3) one specific, measurable hypothesis: "Giving creators weekly earnings visibility will increase D30 creator retention by 15-20%." That's specific enough to be credible and actionable enough to start a conversation.
