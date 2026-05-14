import { useState, useEffect, useRef } from "react";
import * as recharts from "recharts";
import GobbleCubeDashboard from "./gobblecube/GobbleCubeDashboard";
import Sprint1SubscriptionIntelligence from "./mastercard/Sprint1SubscriptionIntelligence";

const {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} = recharts;

// ═══════════════════════════════════════════════════════════════════════════
// SHARECHAT MVP DASHBOARD (embedded as portfolio piece)
// ═══════════════════════════════════════════════════════════════════════════
const SC = {
  bg: "#0A0A0F", card: "#12121A", cardHover: "#1A1A25", border: "#1E1E2A",
  accent: "#FF4D67", accentGlow: "rgba(255,77,103,0.15)",
  purple: "#7C5CFC", purpleGlow: "rgba(124,92,252,0.12)",
  gold: "#FFB830", goldGlow: "rgba(255,184,48,0.12)",
  teal: "#00D4AA", tealGlow: "rgba(0,212,170,0.12)",
  blue: "#3B82F6",
  textPrimary: "#F0F0F5", textSecondary: "#8888A0", textMuted: "#55556A",
};

const LANGUAGES = ["Hindi","Tamil","Telugu","Marathi","Bengali","Kannada","Gujarati","Malayalam","Punjabi","Odia"];

const dailyDAU = Array.from({length:30},(_,i)=>({
  day:`Apr ${i+1}`,
  dau:Math.round(28e6+Math.random()*4e6+i*1e5),
  gifters:Math.round(68e4+Math.random()*12e4+i*8e3),
  creators:Math.round(12e5+Math.random()*2e5+i*12e3),
}));
const giftRevenueByLang = LANGUAGES.map(l=>({
  lang:l, revenue:Math.round(800+Math.random()*2200),
  arpu:+(1.2+Math.random()*3.8).toFixed(2), gifters:Math.round(4e4+Math.random()*16e4),
}));
const chatroomData = Array.from({length:7},(_,i)=>{
  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return {day:days[i],sessions:Math.round(12e4+Math.random()*8e4+(i>4?6e4:0)),
    avgDuration:Math.round(12+Math.random()*18),giftsPerSession:+(2.1+Math.random()*3.5).toFixed(1)};
});
const creatorTiers=[
  {tier:"Nano (<1K)",count:820000,avgGifts:12,retention:34},
  {tier:"Micro (1-10K)",count:285000,avgGifts:86,retention:52},
  {tier:"Mid (10-100K)",count:72000,avgGifts:340,retention:68},
  {tier:"Macro (100K-1M)",count:8400,avgGifts:2100,retention:78},
  {tier:"Mega (1M+)",count:1200,avgGifts:14500,retention:91},
];
const feedMetrics=[
  {metric:"CTR",value:82},{metric:"Watch %",value:71},{metric:"Share Rate",value:45},
  {metric:"Save Rate",value:58},{metric:"Comment",value:36},{metric:"Gift Conv.",value:28},
];
const retentionCohort=[
  {cohort:"D1",organic:62,paid:41,creator:58},{cohort:"D3",organic:48,paid:28,creator:45},
  {cohort:"D7",organic:35,paid:18,creator:34},{cohort:"D14",organic:26,paid:12,creator:27},
  {cohort:"D30",organic:19,paid:7,creator:21},
];
const giftFunnel=[
  {stage:"Feed Impression",users:32e6},{stage:"Content Viewed",users:184e5},
  {stage:"Profile Visited",users:42e5},{stage:"Chatroom Entered",users:18e5},
  {stage:"Gift Icon Tapped",users:82e4},{stage:"Gift Sent",users:48e4},
  {stage:"Repeat Gifter (7d)",users:142e3},
];
const regionHeatmap=[
  {tier:"Tier 1",dau:8.2,arpu:3.80,giftPenetration:8.2,sessionsPerDay:4.2},
  {tier:"Tier 2",dau:12.8,arpu:1.90,giftPenetration:4.1,sessionsPerDay:5.8},
  {tier:"Tier 3",dau:9.4,arpu:0.85,giftPenetration:1.8,sessionsPerDay:6.1},
];
const aiInsights=[
  {id:1,severity:"high",module:"Gifting",insight:"Tier-3 gift conversion drops 72% after coin purchase modal — users abandon at UPI payment step. Hypothesis: ₹10 minimum is too high for Tier-3 ARPU.",action:"A/B test ₹5 starter packs with UPI autopay nudge",impact:"+₹2.4Cr/month"},
  {id:2,severity:"high",module:"Feed",insight:"Tamil-language creators with 1K-10K followers generate 3.2x more shares/post than Hindi Mega creators, but get 8x fewer feed impressions.",action:"Boost regional micro-creator content in feed ranking signal",impact:"+14% D7 retention in Tamil cohort"},
  {id:3,severity:"medium",module:"Chatrooms",insight:"Weekend chatroom sessions are 62% longer with 2.1x more gifts, but creator supply drops 40% on weekends.",action:"Launch weekend creator incentive: 1.5x coin multiplier Sat-Sun",impact:"+₹85L/month"},
  {id:4,severity:"medium",module:"Creator Tools",insight:"Nano creators (<1K followers) churn at 66% within 30 days. Top churn reason: zero gifts received in first week.",action:"Auto-trigger 'First Gift' campaign — gift 50 free coins to new creator's first 3 viewers",impact:"+18% nano creator D30 retention"},
  {id:5,severity:"low",module:"Feed",insight:"Video completion rate for devotional content is 89% (vs 54% avg) but zero gifting integration exists on this content type.",action:"Add 'Bless with Gift' CTA on devotional content with ₹1 micro-gift option",impact:"~₹40L/month new revenue"},
];

// ═══════════════════════════════════════════════════════════════════════════
// CREATOR VIEW — Mock data for individual creator dashboard (Sprint 1)
// ═══════════════════════════════════════════════════════════════════════════
const CREATOR_PROFILE = {
  name: "Priya Sharma",
  handle: "@priyacomedy",
  language: "Hindi",
  city: "Indore",
  followers: 45200,
  following: 312,
  totalPosts: 284,
  joinedDate: "Sep 2024",
  tier: "Micro (1-10K → 10-100K)",
  avatarEmoji: "👩‍🎨",
};

const CREATOR_EARNINGS = {
  totalThisMonth: 8470,
  totalLastMonth: 6890,
  adRevenue: 3200,
  giftIncome: 4120,
  brandDeals: 1150,
  coinBonuses: 0,
};

const CREATOR_EARNINGS_WEEKLY = [
  { week: "W1 Mar", ads: 620, gifts: 780, brands: 0, total: 1400 },
  { week: "W2 Mar", ads: 710, gifts: 920, brands: 0, total: 1630 },
  { week: "W3 Mar", ads: 680, gifts: 850, brands: 500, total: 2030 },
  { week: "W4 Mar", ads: 750, gifts: 1040, brands: 0, total: 1790 },
  { week: "W1 Apr", ads: 800, gifts: 1100, brands: 0, total: 1900 },
  { week: "W2 Apr", ads: 820, gifts: 980, brands: 650, total: 2450 },
  { week: "W3 Apr", ads: 790, gifts: 1060, brands: 0, total: 1850 },
  { week: "W4 Apr", ads: 810, gifts: 1120, brands: 500, total: 2430 },
  { week: "W1 May", ads: 850, gifts: 1200, brands: 0, total: 2050 },
  { week: "W2 May", ads: 880, gifts: 1280, brands: 0, total: 2160 },
  // Projected weeks
  { week: "W3 May*", ads: 900, gifts: 1320, brands: 300, total: 2520, projected: true },
  { week: "W4 May*", ads: 920, gifts: 1360, brands: 0, total: 2280, projected: true },
];

const CREATOR_EARNINGS_DAILY = Array.from({ length: 30 }, (_, i) => {
  const ads = 420 + Math.round(Math.random() * 140) + Math.floor(i * 6);
  const gifts = 520 + Math.round(Math.random() * 160) + Math.floor(i * 7);
  const brands = (i % 5 === 0 ? 180 + Math.round(Math.random() * 90) : 50 + Math.round(Math.random() * 80));
  return {
    day: `Apr ${i + 1}`,
    ads,
    gifts,
    brands,
    total: ads + gifts + brands,
  };
});

const CREATOR_EARNINGS_PIE = [
  { name: "Ad Revenue", value: CREATOR_EARNINGS.adRevenue, color: SC.blue },
  { name: "Gift Income", value: CREATOR_EARNINGS.giftIncome, color: SC.gold },
  { name: "Brand Deals", value: CREATOR_EARNINGS.brandDeals, color: SC.purple },
];

const CREATOR_TOP_VIDEOS = [
  { id: 1, title: "Exam Results Day — Every Student Ever 😂", emoji: "🎬", views: 48200, earnings: 1240, ads: 420, gifts: 620, brands: 200, engagement: 8.4, format: "Short Video", date: "Apr 28" },
  { id: 2, title: "Monday Motivation: Never Give Up 💪", emoji: "🎥", views: 31500, earnings: 820, ads: 260, gifts: 420, brands: 140, engagement: 5.2, format: "Short Video", date: "Apr 25" },
  { id: 3, title: "When Mom Finds Your Phone at 2 AM", emoji: "🎬", views: 27800, earnings: 710, ads: 190, gifts: 380, brands: 140, engagement: 7.1, format: "Short Video", date: "May 2" },
  { id: 4, title: "Chai vs Coffee — The Ultimate Debate ☕", emoji: "📸", views: 22100, earnings: 580, ads: 150, gifts: 290, brands: 140, engagement: 6.3, format: "Image Post", date: "Apr 30" },
  { id: 5, title: "5 Things Only Indore People Understand", emoji: "🎬", views: 19400, earnings: 490, ads: 110, gifts: 250, brands: 130, engagement: 9.1, format: "Short Video", date: "May 5" },
  { id: 6, title: "Desi Wedding Dance Moves Tutorial 💃", emoji: "🎬", views: 16700, earnings: 420, ads: 130, gifts: 210, brands: 80, engagement: 6.8, format: "Short Video", date: "Apr 22" },
  { id: 7, title: "Motivational Quote — Believe in Yourself", emoji: "📝", views: 12300, earnings: 180, ads: 60, gifts: 90, brands: 30, engagement: 3.2, format: "Text Post", date: "May 1" },
  { id: 8, title: "Street Food of Indore — Sarafa Bazar 🍜", emoji: "📸", views: 14800, earnings: 390, ads: 100, gifts: 190, brands: 100, engagement: 5.9, format: "Image Post", date: "Apr 18" },
];

// ═══════════════════════════════════════════════════════════════════════════

const ChartTooltipStyle={
  contentStyle:{background:"#1A1A28",border:`1px solid ${SC.border}`,borderRadius:10,fontSize:12,color:SC.textPrimary,boxShadow:"0 8px 32px rgba(0,0,0,0.4)"},
  itemStyle:{color:SC.textSecondary},labelStyle:{color:SC.textPrimary,fontWeight:600},
};

const TABS=[
  {id:"overview",label:"Overview",icon:"📊"},{id:"feed",label:"Feed & Ranking",icon:"📱"},
  {id:"chatrooms",label:"Chatrooms",icon:"💬"},{id:"creators",label:"Creator Tools",icon:"🎨"},
  {id:"gifting",label:"Gifting",icon:"🎁"},{id:"insights",label:"AI Insights",icon:"🧠"},
  {id:"creator-view",label:"Creator View",icon:"👤"},
];

// ── ShareChat Dashboard Component ──
function ShareChatDashboard() {
  const [activeTab,setActiveTab]=useState("overview");
  const [insightFilter,setInsightFilter]=useState("all");
  const [videoSort,setVideoSort]=useState("earnings");
  const [trendResolution,setTrendResolution]=useState("weekly");

  const SCMetricCard=({label,value,delta,glow,icon})=>(
    <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:glow,filter:"blur(20px)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:18}}>{icon}</span>
        <span style={{color:SC.textSecondary,fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>
      </div>
      <div style={{fontSize:26,fontWeight:700,color:SC.textPrimary}}>{value}</div>
      {delta&&<div style={{fontSize:12,color:delta.startsWith("+")?SC.teal:SC.accent,marginTop:4,fontWeight:600}}>{delta} vs last month</div>}
    </div>
  );

  const SH=({title,subtitle,badge})=>(
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <h3 style={{fontSize:16,fontWeight:700,color:SC.textPrimary,margin:0}}>{title}</h3>
        {badge&&<span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,background:badge.color,color:badge.textColor,letterSpacing:0.5}}>{badge.text}</span>}
      </div>
      {subtitle&&<p style={{fontSize:12,color:SC.textSecondary,margin:"4px 0 0"}}>{subtitle}</p>}
    </div>
  );

  const renderOverview=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
        <SCMetricCard icon="👥" label="Daily Active Users" value="31.2M" delta="+4.8%" glow={SC.accentGlow}/>
        <SCMetricCard icon="🎁" label="Gift Revenue (Apr)" value="₹94.2Cr" delta="+12.3%" glow={SC.goldGlow}/>
        <SCMetricCard icon="🎤" label="Active Creators" value="1.38M" delta="+6.1%" glow={SC.purpleGlow}/>
        <SCMetricCard icon="💬" label="Chatroom Sessions" value="1.02M/day" delta="+18.7%" glow={SC.tealGlow}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="DAU & Engagement Trend" subtitle="30-day rolling — DAU, Active Gifters, Active Creators"/>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyDAU}>
              <defs>
                <linearGradient id="dauG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SC.accent} stopOpacity={0.3}/><stop offset="100%" stopColor={SC.accent} stopOpacity={0}/></linearGradient>
                <linearGradient id="giftG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SC.gold} stopOpacity={0.3}/><stop offset="100%" stopColor={SC.gold} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={SC.border}/>
              <XAxis dataKey="day" tick={{fill:SC.textMuted,fontSize:10}} interval={4}/>
              <YAxis tick={{fill:SC.textMuted,fontSize:10}} tickFormatter={v=>`${(v/1e6).toFixed(0)}M`}/>
              <Tooltip {...ChartTooltipStyle}/>
              <Area type="monotone" dataKey="dau" stroke={SC.accent} fill="url(#dauG)" strokeWidth={2} name="DAU"/>
              <Area type="monotone" dataKey="creators" stroke={SC.purple} fill="transparent" strokeWidth={1.5} strokeDasharray="4 2" name="Creators"/>
              <Area type="monotone" dataKey="gifters" stroke={SC.gold} fill="url(#giftG)" strokeWidth={2} name="Gifters"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="Tier-wise Unit Economics" badge={{text:"KEY INSIGHT",color:SC.goldGlow,textColor:SC.gold}}/>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:8}}>
            {regionHeatmap.map(r=>(
              <div key={r.tier} style={{background:SC.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${SC.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontWeight:700,color:SC.textPrimary,fontSize:13}}>{r.tier}</span>
                  <span style={{fontSize:11,color:SC.teal,fontWeight:600}}>{r.dau}M DAU</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[{label:"ARPU",val:`$${r.arpu}`,c:SC.gold},{label:"Gift %",val:`${r.giftPenetration}%`,c:SC.accent},{label:"Sess/Day",val:r.sessionsPerDay,c:SC.purple}].map(m=>(
                    <div key={m.label} style={{textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:700,color:m.c}}>{m.val}</div>
                      <div style={{fontSize:9,color:SC.textMuted,textTransform:"uppercase",letterSpacing:0.5}}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
        <SH title="Retention Cohort Analysis" subtitle="Organic vs Paid vs Creator-referred acquisition channels"/>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={retentionCohort}>
            <CartesianGrid strokeDasharray="3 3" stroke={SC.border}/>
            <XAxis dataKey="cohort" tick={{fill:SC.textMuted,fontSize:11}}/>
            <YAxis tick={{fill:SC.textMuted,fontSize:11}} tickFormatter={v=>`${v}%`}/>
            <Tooltip {...ChartTooltipStyle}/>
            <Legend wrapperStyle={{fontSize:11,color:SC.textSecondary}}/>
            <Line type="monotone" dataKey="organic" stroke={SC.teal} strokeWidth={2.5} dot={{r:4,fill:SC.teal}} name="Organic"/>
            <Line type="monotone" dataKey="paid" stroke={SC.accent} strokeWidth={2.5} dot={{r:4,fill:SC.accent}} name="Paid"/>
            <Line type="monotone" dataKey="creator" stroke={SC.purple} strokeWidth={2.5} dot={{r:4,fill:SC.purple}} strokeDasharray="5 3" name="Creator Ref."/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderFeed=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="Feed Engagement Radar" subtitle="Content performance signals across all languages"/>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={feedMetrics}>
              <PolarGrid stroke={SC.border}/><PolarAngleAxis dataKey="metric" tick={{fill:SC.textSecondary,fontSize:11}}/>
              <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:SC.textMuted,fontSize:9}}/>
              <Radar name="Score" dataKey="value" stroke={SC.accent} fill={SC.accent} fillOpacity={0.2} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="Language-wise Gift Revenue" badge={{text:"REVENUE",color:SC.goldGlow,textColor:SC.gold}}/>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={giftRevenueByLang} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={SC.border} horizontal={false}/>
              <XAxis type="number" tick={{fill:SC.textMuted,fontSize:10}} tickFormatter={v=>`₹${v}L`}/>
              <YAxis type="category" dataKey="lang" tick={{fill:SC.textSecondary,fontSize:11}} width={70}/>
              <Tooltip {...ChartTooltipStyle} formatter={v=>[`₹${v}L`,"Revenue"]}/>
              <Bar dataKey="revenue" radius={[0,6,6,0]} barSize={16}>
                {giftRevenueByLang.map((_,i)=><Cell key={i} fill={[SC.accent,SC.purple,SC.gold,SC.teal,SC.blue][i%5]} fillOpacity={0.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
        <SH title="Feed Ranking Experiment Proposal" badge={{text:"PRD DRAFT",color:SC.purpleGlow,textColor:SC.purple}}/>
        <div style={{background:SC.bg,borderRadius:10,padding:18,border:`1px solid ${SC.border}`,fontSize:13,color:SC.textSecondary,lineHeight:1.7,fontFamily:"'JetBrains Mono',monospace"}}>
          <div style={{color:SC.accent,fontWeight:700,marginBottom:8}}>// Hypothesis</div>
          <div>Boosting micro-creator (1K-10K) content by 2x in feed ranking for their language cohort will increase D7 retention by 10-15% without cannibalizing Mega creator engagement.</div>
          <div style={{color:SC.purple,fontWeight:700,marginTop:14,marginBottom:8}}>// Experiment Design</div>
          <div><span style={{color:SC.gold}}>Control:</span> Current ranking (engagement-weighted, favoring high-follower creators)</div>
          <div><span style={{color:SC.teal}}>Variant A:</span> +2x boost for micro-creators in same-language feed slots 3-8</div>
          <div><span style={{color:SC.blue}}>Variant B:</span> +2x boost + "Rising Creator" badge overlay on boosted content</div>
          <div style={{color:SC.accent,fontWeight:700,marginTop:14,marginBottom:8}}>// North Star Metrics</div>
          <div>Primary: D7 retention (by language cohort) | Secondary: shares/DAU, gifts/creator, feed time spent</div>
          <div style={{color:SC.purple,fontWeight:700,marginTop:14,marginBottom:8}}>// Guardrails</div>
          <div>Mega creator impressions must not drop {">"} 5% | Overall DAU must remain flat or positive | Gift revenue must not decline</div>
        </div>
      </div>
    </div>
  );

  const renderChatrooms=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        <SCMetricCard icon="🎙️" label="Avg Session Duration" value="24 min" delta="+3.2 min" glow={SC.purpleGlow}/>
        <SCMetricCard icon="🎁" label="Gifts per Session" value="3.8" delta="+0.6" glow={SC.goldGlow}/>
        <SCMetricCard icon="🔥" label="Peak Concurrent" value="142K" delta="+22%" glow={SC.accentGlow}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="Weekly Chatroom Pattern" subtitle="Sessions, duration, and gifting intensity by day"/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chatroomData}>
              <CartesianGrid strokeDasharray="3 3" stroke={SC.border}/>
              <XAxis dataKey="day" tick={{fill:SC.textMuted,fontSize:11}}/>
              <YAxis yAxisId="left" tick={{fill:SC.textMuted,fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <YAxis yAxisId="right" orientation="right" tick={{fill:SC.textMuted,fontSize:10}}/>
              <Tooltip {...ChartTooltipStyle}/><Legend wrapperStyle={{fontSize:11}}/>
              <Bar yAxisId="left" dataKey="sessions" fill={SC.purple} fillOpacity={0.7} radius={[4,4,0,0]} name="Sessions" barSize={20}/>
              <Line yAxisId="right" type="monotone" dataKey="giftsPerSession" stroke={SC.gold} strokeWidth={2.5} dot={{r:4,fill:SC.gold}} name="Gifts/Session"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="Chatroom Gift Combo UX" badge={{text:"WIREFRAME",color:SC.tealGlow,textColor:SC.teal}}/>
          <div style={{background:SC.bg,borderRadius:12,padding:16,border:`1px solid ${SC.border}`}}>
            <div style={{textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:11,color:SC.textMuted,textTransform:"uppercase",letterSpacing:1}}>Battle Mode — 0:42 remaining</div>
              <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:8}}>
                <div><div style={{fontSize:22,fontWeight:800,color:SC.accent}}>₹2,340</div><div style={{fontSize:10,color:SC.textMuted}}>Team Rani</div></div>
                <div style={{fontSize:20,color:SC.textMuted,alignSelf:"center"}}>vs</div>
                <div><div style={{fontSize:22,fontWeight:800,color:SC.teal}}>₹2,180</div><div style={{fontSize:10,color:SC.textMuted}}>Team Raja</div></div>
              </div>
            </div>
            <div style={{borderTop:`1px solid ${SC.border}`,paddingTop:12}}>
              <div style={{fontSize:10,color:SC.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:0.8}}>Quick Gifts (tap to send)</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                {[{emoji:"🌹",price:"₹1"},{emoji:"❤️",price:"₹5"},{emoji:"💎",price:"₹10"},{emoji:"👑",price:"₹50"},{emoji:"🚀",price:"₹100"}].map(g=>(
                  <div key={g.price} style={{background:SC.card,borderRadius:10,padding:"8px 12px",textAlign:"center",cursor:"pointer",border:`1px solid ${SC.border}`}}>
                    <div style={{fontSize:22}}>{g.emoji}</div>
                    <div style={{fontSize:10,color:SC.gold,fontWeight:600,marginTop:2}}>{g.price}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,textAlign:"center",padding:"8px 16px",background:`linear-gradient(135deg,${SC.accent},${SC.purple})`,borderRadius:8,fontSize:12,fontWeight:700,color:"#fff",cursor:"pointer"}}>
                🔥 COMBO x5 — Send 5 gifts instantly
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreators=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
        <SH title="Creator Tier Analysis" subtitle="Follower distribution, avg gifts received, and 30-day retention"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 6px"}}>
            <thead><tr>
              {["Creator Tier","Count","Avg Gifts/Month","D30 Retention","Health"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"8px 14px",fontSize:10,color:SC.textMuted,textTransform:"uppercase",letterSpacing:0.8,fontWeight:600}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{creatorTiers.map(row=>(
              <tr key={row.tier} style={{background:SC.bg}}>
                <td style={{padding:"12px 14px",borderRadius:"8px 0 0 8px",fontWeight:600,color:SC.textPrimary,fontSize:13}}>{row.tier}</td>
                <td style={{padding:"12px 14px",color:SC.textSecondary,fontSize:13}}>{row.count.toLocaleString()}</td>
                <td style={{padding:"12px 14px",color:SC.gold,fontWeight:600,fontSize:13}}>{row.avgGifts.toLocaleString()}</td>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{flex:1,height:6,background:SC.border,borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:`${row.retention}%`,height:"100%",borderRadius:3,background:row.retention>60?SC.teal:row.retention>40?SC.gold:SC.accent}}/>
                    </div>
                    <span style={{fontSize:12,color:SC.textSecondary,fontWeight:600,minWidth:32}}>{row.retention}%</span>
                  </div>
                </td>
                <td style={{padding:"12px 14px",borderRadius:"0 8px 8px 0"}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,
                    background:row.retention>60?SC.tealGlow:row.retention>40?SC.goldGlow:SC.accentGlow,
                    color:row.retention>60?SC.teal:row.retention>40?SC.gold:SC.accent}}>
                    {row.retention>60?"HEALTHY":row.retention>40?"AT RISK":"CRITICAL"}
                  </span>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
        <SH title="Creator First-Week Experience Redesign" badge={{text:"PRODUCT SPEC",color:SC.accentGlow,textColor:SC.accent}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[
            {day:"Day 0",title:"Onboarding",desc:"Language selection → AI-suggested first post template → auto-hashtag in regional trending",color:SC.accent,icon:"🚀"},
            {day:"Day 1",title:"First Gift",desc:"Platform gifts 50 coins to creator's first 3 viewers → triggers gifting tutorial for both sides",color:SC.gold,icon:"🎁"},
            {day:"Day 3",title:"Chatroom Invite",desc:"Auto-invite to a beginner chatroom in their language → co-host with mid-tier creator",color:SC.purple,icon:"🎙️"},
            {day:"Day 7",title:"Growth Nudge",desc:"Milestone badge + feed boost for 24h → personalized analytics unlock → progress bar",color:SC.teal,icon:"📈"},
          ].map(step=>(
            <div key={step.day} style={{background:SC.bg,borderRadius:10,padding:16,border:`1px solid ${SC.border}`,position:"relative"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:step.color,borderRadius:"10px 10px 0 0"}}/>
              <div style={{fontSize:20,marginBottom:6}}>{step.icon}</div>
              <div style={{fontSize:10,color:step.color,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{step.day}</div>
              <div style={{fontSize:14,fontWeight:700,color:SC.textPrimary,margin:"4px 0"}}>{step.title}</div>
              <div style={{fontSize:11,color:SC.textSecondary,lineHeight:1.5}}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGifting=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
        <SH title="Gifting Conversion Funnel" subtitle="From feed impression to repeat gifter — where are we losing users?" badge={{text:"CORE METRIC",color:SC.accentGlow,textColor:SC.accent}}/>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:8}}>
          {giftFunnel.map((stage,i)=>{
            const maxU=giftFunnel[0].users;const wP=(stage.users/maxU)*100;
            const drop=i>0?(((giftFunnel[i-1].users-stage.users)/giftFunnel[i-1].users)*100).toFixed(1):null;
            return(
              <div key={stage.stage} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:130,fontSize:11,color:SC.textSecondary,textAlign:"right",flexShrink:0}}>{stage.stage}</div>
                <div style={{flex:1}}>
                  <div style={{height:28,borderRadius:6,background:`linear-gradient(90deg,${SC.accent}cc,${SC.purple}88)`,width:`${wP}%`,display:"flex",alignItems:"center",paddingLeft:10,transition:"width 0.8s ease"}}>
                    <span style={{fontSize:11,color:"#fff",fontWeight:700,whiteSpace:"nowrap"}}>{stage.users>=1e6?`${(stage.users/1e6).toFixed(1)}M`:`${(stage.users/1e3).toFixed(0)}K`}</span>
                  </div>
                </div>
                {drop&&<div style={{width:60,fontSize:11,color:SC.accent,fontWeight:600,flexShrink:0}}>↓ {drop}%</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="Language × ARPU Matrix"/>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[...giftRevenueByLang].sort((a,b)=>b.arpu-a.arpu)}>
              <CartesianGrid strokeDasharray="3 3" stroke={SC.border}/>
              <XAxis dataKey="lang" tick={{fill:SC.textMuted,fontSize:9}} interval={0} angle={-30} textAnchor="end" height={50}/>
              <YAxis tick={{fill:SC.textMuted,fontSize:10}} tickFormatter={v=>`$${v}`}/>
              <Tooltip {...ChartTooltipStyle}/>
              <Bar dataKey="arpu" radius={[4,4,0,0]} barSize={20} name="ARPU ($)">
                {giftRevenueByLang.map((_,i)=><Cell key={i} fill={i<3?SC.gold:i<6?SC.purple:SC.accent} fillOpacity={0.8}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20}}>
          <SH title="₹1 Micro-Gift Experiment" badge={{text:"A/B TEST",color:SC.tealGlow,textColor:SC.teal}}/>
          <div style={{background:SC.bg,borderRadius:10,padding:16,border:`1px solid ${SC.border}`,fontSize:12,color:SC.textSecondary,lineHeight:1.8}}>
            <div><span style={{color:SC.gold,fontWeight:700}}>Problem:</span> Tier-3 users abandon at ₹10 minimum gift. UPI friction adds 3 extra taps.</div>
            <div style={{marginTop:8}}><span style={{color:SC.teal,fontWeight:700}}>Solution:</span> ₹1 micro-gifts with UPI autopay — single tap gifting.</div>
            <div style={{marginTop:8}}><span style={{color:SC.purple,fontWeight:700}}>Hypothesis:</span> 4x increase in first-time gifters; 2x gifter D7 retention in Tier-3.</div>
            <div style={{marginTop:8}}><span style={{color:SC.accent,fontWeight:700}}>Success:</span> Gift penetration in Tier-3 moves from 1.8% → 5%+ within 60 days.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsights=()=>{
    const filtered=insightFilter==="all"?aiInsights:aiInsights.filter(i=>i.module.toLowerCase()===insightFilter);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["all","feed","chatrooms","creator tools","gifting"].map(f=>(
            <button key={f} onClick={()=>setInsightFilter(f)} style={{
              padding:"6px 14px",borderRadius:8,border:`1px solid ${SC.border}`,
              background:insightFilter===f?SC.accent:SC.card,color:insightFilter===f?"#fff":SC.textSecondary,
              fontSize:12,fontWeight:600,cursor:"pointer",textTransform:"capitalize",
            }}>{f}</button>
          ))}
        </div>
        {filtered.map(ins=>(
          <div key={ins.id} style={{background:SC.card,border:`1px solid ${SC.border}`,borderRadius:14,padding:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:ins.severity==="high"?SC.accent:ins.severity==="medium"?SC.gold:SC.teal}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,background:ins.severity==="high"?SC.accentGlow:ins.severity==="medium"?SC.goldGlow:SC.tealGlow,color:ins.severity==="high"?SC.accent:ins.severity==="medium"?SC.gold:SC.teal,textTransform:"uppercase"}}>{ins.severity}</span>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:4,background:SC.purpleGlow,color:SC.purple}}>{ins.module}</span>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:SC.teal,background:SC.tealGlow,padding:"3px 10px",borderRadius:6}}>{ins.impact}</span>
            </div>
            <div style={{fontSize:13,color:SC.textPrimary,fontWeight:500,lineHeight:1.6,marginBottom:10}}>{ins.insight}</div>
            <div style={{fontSize:12,color:SC.gold,background:SC.goldGlow,padding:"8px 12px",borderRadius:8,fontWeight:500}}>
              💡 <strong>Recommended Action:</strong> {ins.action}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRINT 1: CREATOR VIEW — Earnings Dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCreatorView = () => {
    const earningsDelta = CREATOR_EARNINGS.totalThisMonth - CREATOR_EARNINGS.totalLastMonth;
    const earningsDeltaPct = ((earningsDelta / CREATOR_EARNINGS.totalLastMonth) * 100).toFixed(1);

    const sortedVideos = [...CREATOR_TOP_VIDEOS].sort((a, b) => {
      if (videoSort === "earnings") return b.earnings - a.earnings;
      if (videoSort === "views") return b.views - a.views;
      if (videoSort === "engagement") return b.engagement - a.engagement;
      return 0;
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Creator Profile Header */}
        <div style={{
          background: `linear-gradient(135deg, ${SC.card} 0%, rgba(124,92,252,0.08) 100%)`,
          border: `1px solid ${SC.border}`, borderRadius: 14, padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `linear-gradient(135deg, ${SC.accent}, ${SC.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, flexShrink: 0,
            boxShadow: `0 4px 20px rgba(124,92,252,0.3)`,
          }}>
            {CREATOR_PROFILE.avatarEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: SC.textPrimary }}>{CREATOR_PROFILE.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: SC.purpleGlow, color: SC.purple,
              }}>{CREATOR_PROFILE.tier}</span>
            </div>
            <div style={{ fontSize: 13, color: SC.textSecondary, marginBottom: 6 }}>
              {CREATOR_PROFILE.handle} · {CREATOR_PROFILE.language} · {CREATOR_PROFILE.city}
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { label: "Followers", value: CREATOR_PROFILE.followers.toLocaleString() },
                { label: "Posts", value: CREATOR_PROFILE.totalPosts },
                { label: "Joined", value: CREATOR_PROFILE.joinedDate },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: SC.textPrimary }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: SC.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: SC.bg, borderRadius: 12, padding: "14px 20px",
            border: `1px solid ${SC.border}`, textAlign: "center", flexShrink: 0,
          }}>
            <div style={{ fontSize: 10, color: SC.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              This Month
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: SC.gold }}>
              ₹{CREATOR_EARNINGS.totalThisMonth.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: SC.teal, fontWeight: 700, marginTop: 2 }}>
              +{earningsDeltaPct}% vs last month
            </div>
          </div>
        </div>

        {/* Earnings by Source — 4 Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <SCMetricCard
            icon="📺" label="Ad Revenue" value={`₹${CREATOR_EARNINGS.adRevenue.toLocaleString()}`}
            delta={`+${((CREATOR_EARNINGS.adRevenue / CREATOR_EARNINGS.totalThisMonth) * 100).toFixed(0)}% of total`}
            glow={SC.purpleGlow}
          />
          <SCMetricCard
            icon="🎁" label="Gift Income" value={`₹${CREATOR_EARNINGS.giftIncome.toLocaleString()}`}
            delta={`+${((CREATOR_EARNINGS.giftIncome / CREATOR_EARNINGS.totalThisMonth) * 100).toFixed(0)}% of total`}
            glow={SC.goldGlow}
          />
          <SCMetricCard
            icon="🤝" label="Brand Deals" value={`₹${CREATOR_EARNINGS.brandDeals.toLocaleString()}`}
            delta={`+${((CREATOR_EARNINGS.brandDeals / CREATOR_EARNINGS.totalThisMonth) * 100).toFixed(0)}% of total`}
            glow={SC.tealGlow}
          />
          <SCMetricCard
            icon="🪙" label="Coin Bonuses" value={`₹${CREATOR_EARNINGS.coinBonuses.toLocaleString()}`}
            delta="Platform rewards"
            glow={SC.accentGlow}
          />
        </div>

        {/* Earnings Trend + Pie Chart */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
          {/* Daily/Weekly Earnings Trend */}
          <div style={{ background: SC.card, border: `1px solid ${SC.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
              <SH
                title="Earnings Trend"
                subtitle="Daily or weekly view with projection line"
                badge={{ text: trendResolution === "daily" ? "DAILY" : "WEEKLY", color: SC.goldGlow, textColor: SC.gold }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "daily", label: "Daily" },
                  { id: "weekly", label: "Weekly" },
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setTrendResolution(option.id)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 999,
                      border: `1px solid ${SC.border}`,
                      background: trendResolution === option.id ? SC.accent : SC.bg,
                      color: trendResolution === option.id ? "#fff" : SC.textSecondary,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={(() => {
                const data = trendResolution === "daily" ? CREATOR_EARNINGS_DAILY : CREATOR_EARNINGS_WEEKLY;
                const avg = Math.round(data.reduce((sum, row) => sum + row.total, 0) / data.length);
                return data.map(row => ({ ...row, avgProjection: avg }));
              })()}>
                <defs>
                  <linearGradient id="adsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SC.blue} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SC.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="giftsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SC.gold} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={SC.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={SC.border} />
                <XAxis dataKey={trendResolution === "daily" ? "day" : "week"} tick={{ fill: SC.textMuted, fontSize: 9 }} interval={0} angle={trendResolution === "weekly" ? -25 : -15} textAnchor="end" height={trendResolution === "weekly" ? 45 : 35} />
                <YAxis tick={{ fill: SC.textMuted, fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  {...ChartTooltipStyle}
                  formatter={(value, name) => [`₹${value}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: SC.textSecondary }} />
                <Area type="monotone" dataKey="ads" stackId="1" stroke={SC.blue} fill="url(#adsGrad)" strokeWidth={2} name="Ad Revenue" />
                <Area type="monotone" dataKey="gifts" stackId="1" stroke={SC.gold} fill="url(#giftsGrad)" strokeWidth={2} name="Gift Income" />
                <Area type="monotone" dataKey="brands" stackId="1" stroke={SC.purple} fill={SC.purpleGlow} strokeWidth={2} name="Brand Deals" />
                <Line type="monotone" dataKey="avgProjection" stroke={SC.teal} strokeWidth={2} strokeDasharray="6 4" dot={false} name="30-day avg projection" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings Breakdown Pie */}
          <div style={{ background: SC.card, border: `1px solid ${SC.border}`, borderRadius: 14, padding: 20 }}>
            <SH title="Revenue Split" subtitle="This month by source" />
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={CREATOR_EARNINGS_PIE}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {CREATOR_EARNINGS_PIE.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  {...ChartTooltipStyle}
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {CREATOR_EARNINGS_PIE.map(e => (
                <div key={e.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: e.color }} />
                    <span style={{ fontSize: 12, color: SC.textSecondary }}>{e.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SC.textPrimary }}>₹{e.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Videos by Earnings */}
        <div style={{ background: SC.card, border: `1px solid ${SC.border}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SH title="Top Content by Earnings" subtitle="Tap column headers to sort" />
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { key: "earnings", label: "Earnings" },
                { key: "views", label: "Views" },
                { key: "engagement", label: "Engagement" },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setVideoSort(s.key)}
                  style={{
                    padding: "4px 12px", borderRadius: 6,
                    border: `1px solid ${SC.border}`,
                    background: videoSort === s.key ? SC.accent : SC.bg,
                    color: videoSort === s.key ? "#fff" : SC.textSecondary,
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" }}>
              <thead>
                <tr>
                  {["#", "Content", "Format", "Date", "Views", "Earnings", "Source Split", "Eng. Rate"].map(h => (
                    <th key={h} style={{
                      textAlign: h === "#" ? "center" : "left",
                      padding: "6px 12px", fontSize: 10, color: SC.textMuted,
                      textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((vid, idx) => {
                  const adsPct = Math.round((vid.ads / vid.earnings) * 100);
                  const giftsPct = Math.round((vid.gifts / vid.earnings) * 100);
                  const brandsPct = 100 - adsPct - giftsPct;
                  return (
                  <tr key={vid.id} style={{ background: SC.bg }}>
                    <td style={{
                      padding: "10px 12px", borderRadius: "8px 0 0 8px", textAlign: "center",
                      color: idx < 3 ? SC.gold : SC.textMuted, fontWeight: 800, fontSize: 14,
                    }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "10px 12px", maxWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{vid.emoji}</span>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: SC.textPrimary,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{vid.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                        background: vid.format === "Short Video" ? SC.accentGlow
                          : vid.format === "Image Post" ? SC.purpleGlow : SC.tealGlow,
                        color: vid.format === "Short Video" ? SC.accent
                          : vid.format === "Image Post" ? SC.purple : SC.teal,
                      }}>{vid.format}</span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 11, color: SC.textMuted }}>{vid.date}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: SC.textSecondary, fontWeight: 600 }}>
                      {vid.views >= 1000 ? `${(vid.views / 1000).toFixed(1)}K` : vid.views}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: SC.gold, fontWeight: 700 }}>
                      ₹{vid.earnings.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 12px", minWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, display: "flex", height: 10, background: SC.border, borderRadius: 6, overflow: "hidden" }}>
                          <div style={{ width: `${adsPct}%`, background: SC.blue }} />
                          <div style={{ width: `${giftsPct}%`, background: SC.gold }} />
                          <div style={{ width: `${brandsPct}%`, background: SC.purple }} />
                        </div>
                        <span style={{ fontSize: 11, color: SC.textSecondary, minWidth: 72, textAlign: "right" }}>
                          {`${adsPct}% / ${giftsPct}% / ${brandsPct}%`}
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: SC.textMuted, marginTop: 4 }}>Ads / Gifts / Brands</div>
                    </td>
                    <td style={{ padding: "10px 12px", borderRadius: "0 8px 8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          flex: 1, height: 5, background: SC.border, borderRadius: 3, overflow: "hidden", maxWidth: 60,
                        }}>
                          <div style={{
                            width: `${(vid.engagement / 10) * 100}%`, height: "100%", borderRadius: 3,
                            background: vid.engagement > 7 ? SC.teal : vid.engagement > 5 ? SC.gold : SC.accent,
                          }} />
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 600, minWidth: 32,
                          color: vid.engagement > 7 ? SC.teal : vid.engagement > 5 ? SC.gold : SC.accent,
                        }}>{vid.engagement}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRD Context Note */}
        <div style={{
          background: `linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(0,212,170,0.06) 100%)`,
          border: `1px solid ${SC.border}`, borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: SC.textPrimary, marginBottom: 4 }}>
              About This View
            </div>
            <div style={{ fontSize: 12, color: SC.textSecondary, lineHeight: 1.7 }}>
              This Creator View implements Sprint 1 of the <strong style={{ color: SC.purple }}>Creator Command Center PRD</strong> — an
              individual creator's analytics and earnings intelligence dashboard. Unlike the platform-level tabs (Overview, Feed, etc.)
              which serve internal PMs, this view is designed for <strong style={{ color: SC.gold }}>the creator themselves</strong> — giving
              them visibility into their earnings, content performance, and growth. Upcoming sprints will add audience demographics,
              best-time-to-post heatmaps, agency safety scores, and exportable brand pitch reports.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["Sprint 1: Earnings ✅", "Sprint 2: Trends", "Sprint 3: Content", "Sprint 4: Heatmap", "Sprint 5: Audience", "Sprint 6: Safety", "Sprint 7: Export", "Sprint 8: Polish"].map((s, i) => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                  background: i === 0 ? SC.tealGlow : SC.bg,
                  color: i === 0 ? SC.teal : SC.textMuted,
                  border: `1px solid ${i === 0 ? "transparent" : SC.border}`,
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent=()=>{
    switch(activeTab){
      case"overview":return renderOverview();case"feed":return renderFeed();case"chatrooms":return renderChatrooms();
      case"creators":return renderCreators();case"gifting":return renderGifting();case"insights":return renderInsights();
      case"creator-view":return renderCreatorView();
      default:return renderOverview();
    }
  };

  return(
    <div style={{background:SC.bg,color:SC.textPrimary,fontFamily:"'DM Sans',sans-serif",borderRadius:12,overflow:"hidden",border:`1px solid ${SC.border}`}}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${SC.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(180deg,rgba(255,77,103,0.04) 0%,transparent 100%)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${SC.accent},${SC.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:"#fff"}}>S</div>
          <div>
            <div style={{fontSize:14,fontWeight:800,letterSpacing:-0.5}}>ShareChat Product Command Center</div>
            <div style={{fontSize:10,color:SC.textMuted}}>Creator Growth × Gifting × Feed Optimization</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:SC.teal,boxShadow:`0 0 8px ${SC.teal}`}}/>
          <span style={{fontSize:10,color:SC.teal,fontWeight:600}}>Live</span>
        </div>
      </div>
      <div style={{display:"flex"}}>
        <div style={{width:170,borderRight:`1px solid ${SC.border}`,padding:"12px 0",flexShrink:0,background:"rgba(18,18,26,0.5)"}}>
          {TABS.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{
              width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 16px",border:"none",cursor:"pointer",
              background:activeTab===tab.id?SC.accentGlow:"transparent",borderRight:activeTab===tab.id?`2px solid ${SC.accent}`:"2px solid transparent",
              color:activeTab===tab.id?SC.textPrimary:SC.textSecondary,fontSize:12,fontWeight:activeTab===tab.id?700:500,
              transition:"all 0.15s ease",fontFamily:"'DM Sans',sans-serif",
            }}>
              <span style={{fontSize:14}}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        <div style={{flex:1,padding:16,overflowY:"auto",maxHeight:600}}>{renderContent()}</div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// PORTFOLIO WEBSITE
// ═══════════════════════════════════════════════════════════════════════════
const PORTFOLIO_PROJECTS = [
  {
    id: "sharechat",
    title: "ShareChat Product Command Center",
    subtitle: "Creator Growth × Gifting × Feed Optimization — an interactive analytics dashboard and product strategy tool",
    tags: ["B2C Social", "Feed Ranking", "Virtual Gifting", "Creator Economy", "India"],
    date: "May 2026",
    description: "A full-stack product thinking exercise across ShareChat's core modules. Covers DAU/engagement analytics, language-wise ARPU analysis, gifting conversion funnels, creator tier health, chatroom battle-mode UX, and 5 data-driven experiment proposals with projected revenue impact. Includes a Creator View dashboard — an individual creator's earnings and performance analytics tool built from a PRD grounded in real user pain points.",
    highlights: [
      "Gifting conversion funnel — identified 72% drop at UPI payment step for Tier-3 users",
      "Feed ranking A/B test PRD with hypothesis, variants, metrics, and guardrails",
      "Creator lifecycle redesign — Day 0 to Day 7 intervention plan to fix 66% nano-creator churn",
      "Creator View: individual earnings dashboard with per-video breakdown and revenue split (PRD Sprint 1)",
    ],
    type: "interactive",
  },
  {
    id: "gobblecube",
    title: "GobbleCube Revenue Leak Detector",
    subtitle: "B2B revenue intelligence for FMCG brands — tracking stockouts, pricing gaps, ad waste & visibility loss across Blinkit, Zepto, Amazon, Flipkart",
    tags: ["B2B SaaS", "FMCG / CPG", "Revenue Intelligence", "Quick Commerce", "India"],
    date: "May 2026",
    description: "A 5-sprint product build for GobbleCube — a B2B platform that helps FMCG brands detect and recover revenue leaks across India's top e-commerce and quick-commerce channels. Built as a take-home for the AI Builder role, this dashboard covers the full Revenue Leak taxonomy: stockout detection with wasted ad-spend correlation, competitive pricing intelligence, ad efficiency tracking with ROAS analysis, and search visibility monitoring with keyword rankings.",
    highlights: [
      "Sprint 1: Revenue overview with KPI strip, leak breakdown by category, and 8-week trend analysis",
      "Sprint 2: City-level stockout heatmap with OOS severity badges, wasted ad-spend alerts, and SKU drill-down",
      "Sprint 3: Competitive pricing gaps — undercut detection, lost sales estimation, and per-platform competitor price maps",
      "Sprint 4: Ad waste tracker — ROAS badges, ad type performance (Sponsored/Display/Brand/Video), SKU×Channel waste heatmap",
      "Sprint 5: Visibility loss — search rank radar, keyword rankings, share of shelf, buy box win rate scorecards",
    ],
    type: "interactive",
  },
  {
    id: "mastercard",
    title: "Mastercard Smart Subscription Intelligence",
    subtitle: "AI-powered subscription optimizer — transforming passive transaction lists into proactive health insights, ghost detection & savings recommendations",
    tags: ["B2C Fintech", "Subscription Management", "AI Intelligence", "Mastercard Ethoca", "Design Thinking"],
    date: "May 2026",
    description: "A 3-sprint product build reimagining Mastercard's Smart Subscriptions from a passive list into an AI-powered subscription optimizer embedded in banking apps via Ethoca. Grounded in real data: 41% subscription fatigue rate (Deloitte 2025), 25% of Mastercard chargebacks from recurring transactions, and 72% of consumers wanting subscription management in their banking app. Each sprint follows Design Thinking phases — from empathizing with the problem (Sprint 1) to prototyping the intelligence engine (Sprint 2) to proving business value (Sprint 3).",
    highlights: [
      "Sprint 1: AS-IS vs TO-BE split-screen — cryptic transaction logs transformed into a Subscription Health Score with ghost detection",
      "Health Score algorithm (0-100) based on usage frequency, cost overlap, and spending trend across 12 subscription categories",
      "Ghost subscription detector flagging services inactive 30+ days — identified $90.80/mo potential savings for test user profile",
      "Data-backed business case: 40% chargeback reduction, 3.2× engagement lift, 67% retention improvement projected",
    ],
    type: "interactive",
  },
];

export default function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [activeProject, setActiveProject] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setLoaded(true), 150);
  }, []);

  const openProject = (id) => {
    setActiveProject(id);
    setActivePage("project");
  };

  const goHome = () => {
    setActiveProject(null);
    setActivePage("home");
  };

  // ── Styles ──
  const s = {
    page: {
      minHeight: "100vh",
      background: "#FAFAF8",
      color: "#1A1A1A",
      fontFamily: "'DM Sans', sans-serif",
      opacity: loaded ? 1 : 0,
      transition: "opacity 0.6s ease",
    },
    nav: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "0 48px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "rgba(250,250,248,0.92)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #E8E8E4",
    },
  };

  const renderNav = () => (
    <div style={s.nav}>
      <div
        onClick={goHome}
        style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: "#1A1A1A",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "'Newsreader', serif", fontSize: 18, fontWeight: 600, fontStyle: "italic",
        }}>A</div>
        <span style={{
          fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: "#1A1A1A",
        }}>Arijit Chakraborty</span>
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        <a onClick={goHome} style={{
          fontSize: 13, color: activePage === "home" ? "#1A1A1A" : "#888",
          fontWeight: activePage === "home" ? 600 : 400, cursor: "pointer",
          textDecoration: "none", borderBottom: activePage === "home" ? "1.5px solid #1A1A1A" : "none",
          paddingBottom: 2,
        }}>Work</a>
        <a href="https://www.linkedin.com/in/arijit-chakraborty-82b5594a/" target="_blank" rel="noopener noreferrer" style={{
          fontSize: 13, color: "#888", textDecoration: "none", fontWeight: 400, cursor: "pointer",
        }}>LinkedIn ↗</a>
        <a href="mailto:arijit.chakraborty.jobs@gmail.com" style={{
          fontSize: 12, fontWeight: 600, color: "#fff", background: "#1A1A1A",
          padding: "7px 18px", borderRadius: 8, textDecoration: "none",
          letterSpacing: 0.2,
        }}>Get in touch</a>
      </div>
    </div>
  );

  const renderTopRow = () => (
    <div style={{
      padding: "72px 96px 60px",
      display: "flex",
      gap: 80,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    }}>
      <div style={{
        flex: "0 1 400px", minWidth: 260,
        display: "flex", flexDirection: "column", alignItems: "flex-start",
      }}>
        <img
          src="/arijit-headshot.png"
          alt="Arijit Chakraborty"
          style={{
            width: 220, height: 220, borderRadius: "50%",
            objectFit: "cover", border: "4px solid #fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        />
        <p style={{
          fontSize: 15, lineHeight: 1.7, color: "#555",
          marginTop: 24, fontWeight: 400,
        }}>
          I'm <strong style={{ color: "#1A1A1A" }}>Arijit Chakraborty</strong> — a product manager
          who blends customer empathy with AI-native prototyping. I move fast from problem to
          shipped product, partnering closely with engineering, design, and data teams along the way.
        </p>
      </div>
      <div style={{ flex: "1 1 480px", maxWidth: 600 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase",
          color: "#999", marginBottom: 20,
        }}>Product Manager</div>
        <h1 style={{
          fontSize: 52, fontWeight: 300, lineHeight: 1.15, margin: 0,
          fontFamily: "'Newsreader', serif", color: "#1A1A1A", letterSpacing: -1.5,
        }}>
          I turn <em style={{ fontWeight: 600, fontStyle: "italic" }}>ambiguous problems</em> into{" "}
          <span style={{ color: "#666" }}>shipped products.</span>
        </h1>
        <p style={{
          fontSize: 17, lineHeight: 1.7, color: "#666", marginTop: 24,
          maxWidth: 560, fontWeight: 400,
        }}>
          11+ years across SaaS, CRM, and consumer platforms. I prototype with AI tools,
          validate with data, and ship with engineering teams. Currently exploring technical
          product roles at scaling startups.
        </p>
        <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
          <div style={{
            padding: "8px 16px", borderRadius: 6, background: "#F0F0EC",
            fontSize: 12, color: "#555", fontWeight: 500,
          }}>🇮🇳 Based in Hyderabad</div>
          <div style={{
            padding: "8px 16px", borderRadius: 6, background: "#F0F0EC",
            fontSize: 12, color: "#555", fontWeight: 500,
          }}>🧠 AI-native builder</div>
        </div>
      </div>
    </div>
  );

  const renderProjectCard = (project) => {
    const isPlaceholder = project.type === "placeholder";
    return (
      <div
        key={project.id}
        onClick={() => !isPlaceholder && openProject(project.id)}
        style={{
          background: "#fff",
          border: "1px solid #E8E8E4",
          borderRadius: 16,
          overflow: "hidden",
          cursor: isPlaceholder ? "default" : "pointer",
          transition: "all 0.25s ease",
          opacity: isPlaceholder ? 0.5 : 1,
        }}
        onMouseEnter={e => { if (!isPlaceholder) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)"; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {/* Preview bar */}
        {!isPlaceholder && (
          <div style={{
            height: 200, background: "#0A0A0F",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: project.id === "gobblecube"
                ? "linear-gradient(135deg, rgba(123,47,247,0.1) 0%, rgba(6,182,212,0.08) 50%, rgba(245,158,11,0.05) 100%)"
                : project.id === "mastercard"
                ? "linear-gradient(135deg, rgba(235,0,27,0.08) 0%, rgba(247,158,27,0.08) 50%, rgba(59,130,246,0.06) 100%)"
                : "linear-gradient(135deg, rgba(255,77,103,0.1) 0%, rgba(124,92,252,0.1) 50%, rgba(0,212,170,0.05) 100%)",
            }} />
            {/* Company logo */}
            <div style={{
              position: "absolute", top: 14, left: 18, zIndex: 2,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {project.id === "mastercard" && (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EB001B", opacity: 0.9 }} />
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F79E1B", opacity: 0.9, marginLeft: -10 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 0.5 }}>mastercard</span>
                </div>
              )}
              {project.id === "sharechat" && (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
                    <rect x="5" y="5" width="90" height="90" rx="22" fill="#FFD84C" />
                    <path d="M5 50 L5 27 Q5 5 27 5 L50 5 Z" fill="#8B5CF6" />
                    <path d="M5 50 L50 5 L50 50 Z" fill="#38BDF8" />
                    <path d="M5 50 L5 73 Q5 95 27 95 L50 95 L50 50 Z" fill="#FF6B8A" />
                    <path d="M50 50 L50 95 L73 95 Q95 95 95 73 L95 50 Z" fill="#F97316" />
                    <path d="M50 5 L73 5 Q95 5 95 27 L95 50 L50 50 Z" fill="#FFD84C" />
                    <path d="M5 50 L50 50 L50 95 Z" fill="#F97316" fillOpacity="0.6" />
                    <rect x="5" y="5" width="90" height="90" rx="22" fill="none" stroke="#555" strokeWidth="3" strokeOpacity="0.15" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 0.3 }}>ShareChat</span>
                </div>
              )}
              {project.id === "gobblecube" && (
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
                    <path d="M15 30 L50 15 L85 30 L50 45 Z" fill="#4F7BF7" />
                    <path d="M15 50 L50 35 L85 50 L50 65 Z" fill="#4F7BF7" fillOpacity="0.85" />
                    <path d="M15 70 L50 55 L85 70 L50 85 Z" fill="#3B5FCC" />
                    <path d="M15 30 L15 38 L50 53 L50 45 Z" fill="#3B5FCC" />
                    <path d="M85 30 L85 38 L50 53 L50 45 Z" fill="#6B9BFF" />
                    <path d="M15 50 L15 58 L50 73 L50 65 Z" fill="#3B5FCC" />
                    <path d="M85 50 L85 58 L50 73 L50 65 Z" fill="#6B9BFF" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 0.3 }}>GobbleCube</span>
                </div>
              )}
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
              padding: 20, width: "90%", opacity: 0.85,
            }}>
              {(project.id === "gobblecube" ? [
                { label: "Revenue", value: "₹83L", color: "#22C55E" },
                { label: "Leaks", value: "₹12L", color: "#EF4444" },
                { label: "Channels", value: "4", color: "#7B2FF7" },
                { label: "Sprints", value: "5", color: "#06B6D4" },
              ] : project.id === "mastercard" ? [
                { label: "Health", value: "61", color: "#f59e0b" },
                { label: "Savings", value: "$91", color: "#22c55e" },
                { label: "Ghosts", value: "3", color: "#ef4444" },
                { label: "Subs", value: "12", color: "#3b82f6" },
              ] : [
                { label: "DAU", value: "31.2M", color: "#FF4D67" },
                { label: "Gift Rev", value: "₹94Cr", color: "#FFB830" },
                { label: "Creators", value: "1.38M", color: "#7C5CFC" },
                { label: "Sessions", value: "1.02M", color: "#00D4AA" },
              ]).map(m => (
                <div key={m.label} style={{
                  background: "rgba(18,18,26,0.8)", borderRadius: 8, padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: 0.8 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{
              position: "absolute", bottom: 12, right: 16,
              fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500,
            }}>Click to explore →</div>
          </div>
        )}

        {isPlaceholder && (
          <div style={{
            height: 200, background: "#F5F5F2",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 40, opacity: 0.3 }}>🚧</div>
          </div>
        )}

        <div style={{ padding: "24px 28px" }}>
          {project.date && (
            <div style={{ fontSize: 11, color: "#999", fontWeight: 500, marginBottom: 8 }}>{project.date}</div>
          )}
          <h3 style={{
            fontSize: 20, fontWeight: 700, margin: 0, color: "#1A1A1A",
            letterSpacing: -0.3,
          }}>{project.title}</h3>
          <p style={{
            fontSize: 13, color: "#777", margin: "6px 0 14px", lineHeight: 1.5,
          }}>{project.subtitle}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 5,
                background: isPlaceholder ? "#E8E8E4" : "#F0F0EC",
                color: isPlaceholder ? "#aaa" : "#666", fontWeight: 500,
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProjectsGrid = () => (
    <div style={{ padding: "0 48px 80px" }}>
      <div style={{
        fontSize: 15, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase",
        color: "#1A1A1A", marginBottom: 28, paddingTop: 24,
        borderTop: "1px solid #E8E8E4",
      }}>Building Products</div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 24,
      }}>
        {PORTFOLIO_PROJECTS.map(p => renderProjectCard(p))}
      </div>
    </div>
  );

  const renderToolsStrip = () => {
    const tools = [
      { name: "Claude", icon: "✦", color: "#D97706", bg: "rgba(217,119,6,0.08)" },
      { name: "VS Code", icon: "⬡", color: "#007ACC", bg: "rgba(0,122,204,0.08)" },
      { name: "GitHub", icon: "⬢", color: "#f0f0f0", bg: "rgba(255,255,255,0.06)" },
      { name: "Vercel", icon: "▲", color: "#f0f0f0", bg: "rgba(255,255,255,0.06)" },
      { name: "Productboard", icon: "◆", color: "#FF6D3B", bg: "rgba(255,109,59,0.08)" },
      { name: "Mixpanel", icon: "◉", color: "#7856FF", bg: "rgba(120,86,255,0.08)" },
    ];
    return (
      <div style={{
        padding: "48px 48px", background: "#0c0f1a",
        borderTop: "1px solid #E8E8E4",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)", marginBottom: 24, textAlign: "center",
        }}>Tools & Stack</div>
        <div style={{
          display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap",
        }}>
          {tools.map(t => (
            <div key={t.name} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              padding: "20px 24px", borderRadius: 14,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              minWidth: 110, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.bg; e.currentTarget.style.borderColor = `${t.color}33`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              <span style={{ fontSize: 24, color: t.color, lineHeight: 1 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: 0.3 }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAboutStrip = () => (
    <div style={{
      padding: "48px 48px",
      background: "#fff",
      borderTop: "1px solid #E8E8E4",
      borderBottom: "1px solid #E8E8E4",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#BBB", marginBottom: 12 }}>Approach</div>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>
            I start from first principles, not best practices. Every product decision gets
            broken down to its core assumptions, validated with data, and iterated rapidly.
            I prototype with AI tools before asking for engineering bandwidth.
          </p>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#BBB", marginBottom: 12 }}>Skills</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "SQL & Python (hands-on analytics)",
              "AI prototyping (LLMs, no-code, scripts)",
              "PRDs, wireframes, user stories",
              "Feed ranking & recommendation systems",
              "A/B testing & experiment design",
              "User research across Tier 1-3 India",
            ].map(s => (
              <div key={s} style={{ fontSize: 13, color: "#555", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#CCC", flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#BBB", marginBottom: 12 }}>Background</div>
          <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>
            11+ years in tech — from test automation frameworks at Oracle and Accenture
            to owning quality strategy for B2B SaaS platforms. MSc from NUI Galway.
            Now channeling that systems-thinking into consumer product building for India's next billion users.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div style={{
      padding: "32px 48px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      color: "#BBB", fontSize: 12,
    }}>
      <span>© 2026 Arijit Chakraborty</span>
      <div style={{ display: "flex", gap: 24 }}>
        <a href="mailto:arijit.chakraborty.jobs@gmail.com" style={{ color: "#888", textDecoration: "none" }}>arijit.chakraborty.jobs@gmail.com</a>
        <a href="https://www.linkedin.com/in/arijit-chakraborty-82b5594a/" target="_blank" rel="noopener noreferrer" style={{ color: "#888", textDecoration: "none" }}>LinkedIn ↗</a>
      </div>
    </div>
  );

  // ── Project Detail Page ──
  const renderProjectDetail = () => {
    const project = PORTFOLIO_PROJECTS.find(p => p.id === activeProject);
    if (!project) return null;
    return (
      <div>
        {/* Back + header */}
        <div style={{ padding: "32px 48px 24px" }}>
          <button onClick={goHome} style={{
            background: "none", border: "1px solid #E0E0DC", borderRadius: 8,
            padding: "6px 14px", fontSize: 12, color: "#888", cursor: "pointer",
            fontWeight: 500, marginBottom: 20, fontFamily: "'DM Sans', sans-serif",
          }}>← Back to all work</button>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase",
            color: "#BBB", marginBottom: 8,
          }}>{project.date}</div>
          <h1 style={{
            fontSize: 36, fontWeight: 700, margin: 0, letterSpacing: -0.8,
            color: "#1A1A1A",
          }}>{project.title}</h1>
          <p style={{ fontSize: 15, color: "#777", margin: "8px 0 20px", lineHeight: 1.5 }}>{project.subtitle}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 5,
                background: "#F0F0EC", color: "#666", fontWeight: 500,
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Context */}
        <div style={{ padding: "0 48px 24px" }}>
          <div style={{
            background: "#fff", border: "1px solid #E8E8E4", borderRadius: 12,
            padding: 24,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#BBB", marginBottom: 10 }}>What This Demonstrates</div>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 16px" }}>{project.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {project.highlights.map((h, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: "#FAFAF8", borderRadius: 8, padding: "10px 14px",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, background: "#1A1A1A",
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    marginTop: 1,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{h}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Embedded Dashboard */}
        <div style={{ padding: "0 48px 60px" }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase",
            color: "#BBB", marginBottom: 14,
          }}>Interactive Dashboard</div>
          {project.id === "sharechat" && <ShareChatDashboard />}
          {project.id === "gobblecube" && <GobbleCubeDashboard />}
          {project.id === "mastercard" && <Sprint1SubscriptionIntelligence />}
        </div>
      </div>
    );
  };

  // ── Main Render ──
  return (
    <div style={s.page}>
      {renderNav()}
      {activePage === "home" && (
        <>
          {renderTopRow()}
          {renderProjectsGrid()}
          {renderToolsStrip()}
          {renderAboutStrip()}
          {renderFooter()}
        </>
      )}
      {activePage === "project" && (
        <>
          {renderProjectDetail()}
          {renderFooter()}
        </>
      )}
    </div>
  );
}
