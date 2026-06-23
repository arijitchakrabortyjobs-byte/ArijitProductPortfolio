import { useState } from "react";

const SURFACE = "#0f0e2a";
const CARD_BG = "#1e1b4b";
const BORDER = "#312e81";
const ACCENT = "#8b5cf6";

const pill = (label, color) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
    {label}
  </span>
);

function SectionHeader({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: ACCENT, color: "#fff", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{number}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#e0e7ff" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "#a5b4fc", marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function PickedForYouSection() {
  const [tooltip, setTooltip] = useState(null);

  const cards = [
    { rank: 1, operator: "RedBus Premium", type: "AC Sleeper", time: "22:30", price: "₹820", label: "picked_for_you", signal: "operator_affinity", tooltip: "Based on your past trips with this operator", promoted: true },
    { rank: 2, operator: "VRL Travels", type: "AC Seater", time: "23:00", price: "₹650", label: "picked_for_you", signal: "class_preference", tooltip: "Matches your preferred bus type", promoted: true },
    { rank: 3, operator: "SRS Travels", type: "Non-AC Sleeper", time: "21:45", price: "₹480", label: "top_pick_route", signal: "cold_start", tooltip: "Highly rated on this route", promoted: false },
    { rank: 4, operator: "KSRTC", type: "AC Seater", time: "06:00", price: "₹720", label: null, signal: null, tooltip: null, promoted: false },
  ];

  return (
    <div>
      <SectionHeader number="1" title={`"Picked for You" Label System`} subtitle="US-4.1 · Max 3 cards labelled · Label fires only on ≥2 position promotion" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gap: 10 }}>
          {cards.map(c => (
            <div key={c.rank} style={{ background: SURFACE, borderRadius: 10, padding: "14px 16px", border: `1px solid ${c.promoted ? "#6366f133" : "#312e81"}`, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 700, background: "#1e1b4b", borderRadius: 6, padding: "2px 8px" }}>#{c.rank}</div>
                  <div>
                    <div style={{ color: "#e0e7ff", fontWeight: 600, fontSize: 14 }}>{c.operator}</div>
                    <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{c.type} · {c.time}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ color: "#e0e7ff", fontWeight: 700 }}>{c.price}</span>
                  {c.label === "picked_for_you" && (
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setTooltip(tooltip === c.rank ? null : c.rank)}
                        style={{ background: "#6366f122", color: "#6366f1", border: "1px solid #6366f155", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                      >
                        Picked for you
                      </button>
                      {tooltip === c.rank && (
                        <div style={{ position: "absolute", right: 0, top: 26, background: "#1e1b4b", border: "1px solid #6366f155", borderRadius: 8, padding: "8px 12px", width: 200, zIndex: 10, fontSize: 12, color: "#c7d2fe" }}>
                          {c.tooltip}
                        </div>
                      )}
                    </div>
                  )}
                  {c.label === "top_pick_route" && (
                    <span style={{ background: "#10b98122", color: "#10b981", border: "1px solid #10b98155", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
                      Top pick for route
                    </span>
                  )}
                </div>
              </div>
              {c.signal && (
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  {pill(`Signal: ${c.signal.replace(/_/g, " ")}`, "#6366f1")}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: SURFACE, borderRadius: 8, border: "1px solid #312e81" }}>
          <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 4 }}>Label tap targets</div>
          <div style={{ display: "flex", gap: 16 }}>
            {[["Label view rate", "> 80%"], ["Tap rate (tooltip)", "5–10%"], ["Post-label booking lift", "+5%"]].map(([k, v]) => (
              <span key={k} style={{ fontSize: 12 }}><span style={{ color: "#6b7280" }}>{k}: </span><span style={{ color: "#a5b4fc", fontWeight: 600 }}>{v}</span></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceResetSection() {
  const [resetType, setResetType] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      <SectionHeader number="2" title="User Preference Reset Control" subtitle="US-4.2 · 3 entry points · Session vs full reset · Redis invalidation on confirm" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Reset Entry Points</div>
            {[
              { id: "session", label: "Session Reset", sublabel: "Filter panel → 'Reset preferences'", effect: "Clears preferences for this session only. Full personalization resumes next session.", risk: "Low" },
              { id: "full", label: "Full Reset", sublabel: "Account Settings → Preferences", effect: "Clears all signals. Cold-start ranking until re-enabled. Redis cache invalidated.", risk: "High" },
            ].map(r => (
              <div
                key={r.id}
                onClick={() => { setResetType(r.id); setConfirmed(false); }}
                style={{ background: SURFACE, borderRadius: 10, padding: 14, marginBottom: 10, border: `2px solid ${resetType === r.id ? (r.id === "full" ? "#ef4444" : "#6366f1") : "#312e81"}`, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#e0e7ff", fontWeight: 600, fontSize: 13 }}>{r.label}</span>
                  {pill(r.risk + " risk", r.risk === "High" ? "#ef4444" : "#6366f1")}
                </div>
                <div style={{ color: "#818cf8", fontSize: 11, marginBottom: 6 }}>{r.sublabel}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{r.effect}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Confirmation Dialog (Full Reset)</div>
            <div style={{ background: SURFACE, borderRadius: 12, padding: 18, border: "1px solid #ef444433" }}>
              <div style={{ color: "#e0e7ff", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Reset your preferences?</div>
              <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
                Your past trip history won't be used to sort results. You can turn personalisation back on anytime.
              </div>
              {!confirmed ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => setConfirmed(true)}
                    style={{ background: "transparent", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Reset preferences
                  </button>
                  <button
                    onClick={() => setResetType(null)}
                    style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Keep personalisation
                  </button>
                </div>
              ) : (
                <div style={{ background: "#10b98122", borderRadius: 8, padding: 12, border: "1px solid #10b98133", textAlign: "center" }}>
                  <div style={{ color: "#34d399", fontWeight: 600, fontSize: 13 }}>✓ Preferences reset</div>
                  <div style={{ color: "#6b7280", fontSize: 11, marginTop: 4 }}>Cold-start ranking now active. Redis cache cleared.</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, background: SURFACE, borderRadius: 10, padding: 12, border: "1px solid #312e81" }}>
              <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>Success metrics</div>
              {[["Full reset rate", "< 8% / month"], ["Re-enable within 30d", "> 40%"], ["Reset-then-book", "> 60%"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>{k}</span>
                  <span style={{ color: "#a5b4fc", fontSize: 11, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColdStartUISection() {
  return (
    <div>
      <SectionHeader number="3" title="Cold-Start UI — Graduation Journey" subtitle="US-4.3 · 65% of users have 0 booking history · Trust strip + 3-state graduation" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>User State Graduation</div>
            {[
              { state: "First-time", bookings: "0 bookings", label: "Top picks for this route", color: "#10b981", sort: "Cold-start formula (0.40 × popularity + 0.35 × reliability + 0.25 × time fit)" },
              { state: "Warm-start", bookings: "1–2 bookings", label: "Recommended for you", color: "#f97316", sort: "50% cold-start + 50% affinity signals" },
              { state: "Personalized", bookings: "3+ bookings", label: "Picked for you", color: "#6366f1", sort: "Full LambdaMART ML model" },
            ].map(s => (
              <div key={s.state} style={{ background: SURFACE, borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${s.color}33` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: "#e0e7ff", fontWeight: 600, fontSize: 13 }}>{s.state}</span>
                  <span style={{ background: s.color + "22", color: s.color, border: `1px solid ${s.color}55`, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                </div>
                <div style={{ color: "#818cf8", fontSize: 11, marginBottom: 4 }}>{s.bookings}</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>{s.sort}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Trust Strip (Cold-Start Users)</div>
            <div style={{ background: "#10b98111", borderRadius: 10, padding: 14, border: "1px solid #10b98133", marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>⭐</span>
                <span style={{ color: "#34d399", fontWeight: 700, fontSize: 13 }}>Top picks for Pune → Mumbai</span>
              </div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Based on 2,847 traveller ratings & on-time data</div>
            </div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>Graduation Toast</div>
            <div style={{ background: SURFACE, borderRadius: 10, padding: 14, border: "1px solid #6366f133" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <div>
                  <div style={{ color: "#e0e7ff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Your picks are getting personal</div>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>We've started learning your travel style.</div>
                </div>
              </div>
              <div style={{ marginTop: 10, color: "#6b7280", fontSize: 11 }}>Auto-dismiss: 4s · Shown once only · Never again after first display</div>
            </div>
            <div style={{ marginTop: 12, background: SURFACE, borderRadius: 10, padding: 12, border: "1px solid #312e81" }}>
              <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>A/B Test</div>
              {[["Control", "Default sort (price/time)"], ["Variant A", "Cold-start + Trust strip"], ["Variant B", "Cold-start + strip + trust badges"]].map(([v, desc]) => (
                <div key={v} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#818cf8", fontSize: 11, fontWeight: 600 }}>{v}</span>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>{desc}</span>
                </div>
              ))}
              <div style={{ color: "#6b7280", fontSize: 11, marginTop: 6 }}>Target: ≥3% CVR lift in best performing variant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const languages = [
  { lang: "Hindi", code: "hi", share: 38, color: "#6366f1" },
  { lang: "Marathi", code: "mr", share: 12, color: "#8b5cf6" },
  { lang: "Telugu", code: "te", share: 11, color: "#a855f7" },
  { lang: "Tamil", code: "ta", share: 10, color: "#ec4899" },
  { lang: "Kannada", code: "kn", share: 8, color: "#f97316" },
  { lang: "Bengali", code: "bn", share: 7, color: "#10b981" },
];

const sampleStrings = [
  { key: "label.picked_for_you", en: "Picked for you", hi: "आपके लिए चुना", te: "మీకోసం ఎంచుకున్నది" },
  { key: "chip.showing_sleeper", en: "Showing Sleeper buses first", hi: "पहले स्लीपर बसें", te: "ముందు స్లీపర్ బస్సులు" },
  { key: "reset.cta", en: "Reset preferences", hi: "प्राथमिकताएं रीसेट करें", te: "ప్రాధాన్యతలను రీసెట్" },
  { key: "graduation.toast", en: "Your picks are getting personal", hi: "आपके सफर के हिसाब से", te: "మీ ప్రయాణానికి అనుగుణంగా" },
];

function VernacularSection() {
  return (
    <div>
      <SectionHeader number="4" title="Vernacular Localisation — 6 Indian Languages" subtitle="US-4.4 · 8 strings × 6 languages = 48 translations · Covers 86% of Tier 2/3 sessions" />
      <div style={{ background: CARD_BG, borderRadius: 12, padding: 24, border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Language Coverage (Tier 2/3 sessions)</div>
            <div style={{ display: "grid", gap: 10 }}>
              {languages.map(l => (
                <div key={l.lang}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <code style={{ color: "#6b7280", fontSize: 11, background: SURFACE, padding: "1px 6px", borderRadius: 4 }}>{l.code}</code>
                      <span style={{ color: "#c7d2fe", fontSize: 12 }}>{l.lang}</span>
                    </div>
                    <span style={{ color: l.color, fontWeight: 700, fontSize: 12 }}>{l.share}%</span>
                  </div>
                  <div style={{ background: SURFACE, borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${l.share * 2.5}%`, background: l.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#6366f122", borderRadius: 8, border: "1px solid #6366f133" }}>
              <span style={{ color: "#a5b4fc", fontSize: 11 }}>Total: <strong style={{ color: "#e0e7ff" }}>86%</strong> of Tier 2/3 Ground Transport sessions covered</span>
            </div>
            <div style={{ marginTop: 12, background: SURFACE, borderRadius: 10, padding: 12, border: "1px solid #312e81" }}>
              <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>Language Detection Priority</div>
              {["1. MMT app language setting", "2. Device OS language", "3. SIM card state → dominant language", "4. Default: English"].map(s => (
                <div key={s} style={{ color: "#9ca3af", fontSize: 11, marginBottom: 3 }}>{s}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Sample String Table (3 of 6 languages)</div>
            <div style={{ overflow: "auto" }}>
              {sampleStrings.map(s => (
                <div key={s.key} style={{ background: SURFACE, borderRadius: 8, padding: 12, marginBottom: 8, border: "1px solid #312e81" }}>
                  <code style={{ color: "#818cf8", fontSize: 11 }}>{s.key}</code>
                  <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "#6b7280", fontSize: 11, width: 20 }}>en</span>
                      <span style={{ color: "#9ca3af", fontSize: 11 }}>{s.en}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "#6366f1", fontSize: 11, width: 20 }}>hi</span>
                      <span style={{ color: "#c7d2fe", fontSize: 11 }}>{s.hi}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: "#a855f7", fontSize: 11, width: 20 }}>te</span>
                      <span style={{ color: "#c7d2fe", fontSize: 11 }}>{s.te}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: SURFACE, borderRadius: 10, padding: 12, border: "1px solid #312e81" }}>
              <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>Success metrics</div>
              {[["Tier 2/3 session duration", "+10%"], ["Personalisation label tap rate", "+25% vs English"], ["Cold-start strip engagement", "+30% vs English"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>{k}</span>
                  <span style={{ color: "#34d399", fontSize: 11, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sprint4UI() {
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <PickedForYouSection />
      <PreferenceResetSection />
      <ColdStartUISection />
      <VernacularSection />
    </div>
  );
}
