// ─── CHANNEL & CATEGORY CONSTANTS ────────────────────────────────────────────

export const CHANNELS = ["Blinkit", "Zepto", "Amazon", "Flipkart"];

export const CHANNEL_COLORS = {
  Blinkit: "#F5C518",
  Zepto: "#7B2FF7",
  Amazon: "#FF9900",
  Flipkart: "#2874F0",
};

export const LEAK_CATEGORIES = [
  { key: "stockouts", label: "Stockouts", icon: "📦", color: "#EF4444", amount: 4.2 },
  { key: "pricing", label: "Pricing Gaps", icon: "💰", color: "#F59E0B", amount: 2.8 },
  { key: "adWaste", label: "Ad Waste", icon: "📢", color: "#8B5CF6", amount: 3.1 },
  { key: "visibility", label: "Visibility Loss", icon: "👁", color: "#06B6D4", amount: 1.9 },
];

// ─── SPRINT 1: REVENUE DATA ─────────────────────────────────────────────────

export const revenueByChannel = [
  { channel: "Blinkit", revenue: 18.4, growth: 12.3 },
  { channel: "Zepto", revenue: 14.7, growth: 22.1 },
  { channel: "Amazon", revenue: 28.3, growth: 5.6 },
  { channel: "Flipkart", revenue: 21.6, growth: -2.1 },
];

export const weeklyTrend = [
  { week: "W1", revenue: 19.2, leaks: 2.8 },
  { week: "W2", revenue: 20.1, leaks: 3.1 },
  { week: "W3", revenue: 18.7, leaks: 3.5 },
  { week: "W4", revenue: 21.5, leaks: 2.9 },
  { week: "W5", revenue: 22.3, leaks: 3.2 },
  { week: "W6", revenue: 20.8, leaks: 3.0 },
  { week: "W7", revenue: 23.1, leaks: 2.6 },
  { week: "W8", revenue: 21.0, leaks: 3.0 },
];

// ─── SPRINT 2: STOCKOUT & AVAILABILITY DATA ─────────────────────────────────

export const CITIES = [
  { city: "Mumbai", lat: 19.07, lng: 72.87 },
  { city: "Delhi", lat: 28.61, lng: 77.20 },
  { city: "Bangalore", lat: 12.97, lng: 77.59 },
  { city: "Hyderabad", lat: 17.38, lng: 78.48 },
  { city: "Chennai", lat: 13.08, lng: 80.27 },
  { city: "Kolkata", lat: 22.57, lng: 88.36 },
  { city: "Pune", lat: 18.52, lng: 73.85 },
  { city: "Ahmedabad", lat: 23.02, lng: 72.57 },
  { city: "Jaipur", lat: 26.91, lng: 75.78 },
  { city: "Lucknow", lat: 26.84, lng: 80.94 },
];

export const SKUS = [
  "FreshGlow Vitamin C Serum 30ml",
  "FreshGlow Sunscreen SPF50 50ml",
  "FreshGlow Night Repair Cream 40g",
  "FreshGlow Face Wash 100ml",
  "FreshGlow Moisturizer 60ml",
];

// ─── OOS DATA GENERATOR ─────────────────────────────────────────────────────
// Generates deterministic-looking data using a simple seed-based approach
// so the dashboard shows consistent numbers across renders.

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateOOSData() {
  const data = [];
  let seed = 42;

  CITIES.forEach((c) => {
    SKUS.forEach((sku) => {
      CHANNELS.forEach((ch) => {
        seed++;
        const oosRate = seededRandom(seed) * 45;
        seed++;
        const adSpend = Math.round(seededRandom(seed) * 25000 + 5000);
        const wastedSpend =
          oosRate > 20 ? Math.round(adSpend * (oosRate / 100) * 0.85) : 0;

        data.push({
          city: c.city,
          lat: c.lat,
          lng: c.lng,
          sku,
          channel: ch,
          oosRate: Math.round(oosRate * 10) / 10,
          adSpend,
          wastedSpend,
        });
      });
    });
  });

  return data;
}

export const oosData = generateOOSData();

// ─── DERIVED DATA HELPERS ────────────────────────────────────────────────────

/**
 * Aggregate OOS + ad-spend data per city, filtered by SKU and channel.
 */
export function getCityHeatmapData(selectedSku, selectedChannel) {
  return CITIES.map((c) => {
    const relevant = oosData.filter(
      (d) =>
        d.city === c.city &&
        (selectedSku === "All" || d.sku === selectedSku) &&
        (selectedChannel === "All" || d.channel === selectedChannel)
    );
    const avgOOS = relevant.reduce((s, d) => s + d.oosRate, 0) / relevant.length;
    const totalAdSpend = relevant.reduce((s, d) => s + d.adSpend, 0);
    const totalWasted = relevant.reduce((s, d) => s + d.wastedSpend, 0);
    return {
      ...c,
      avgOOS: Math.round(avgOOS * 10) / 10,
      totalAdSpend,
      totalWasted,
    };
  });
}

/**
 * Per-SKU breakdown for a single city (used in drill-down view).
 */
export function getCityDetailData(city, selectedChannel) {
  return SKUS.map((sku) => {
    const relevant = oosData.filter(
      (d) =>
        d.city === city &&
        d.sku === sku &&
        (selectedChannel === "All" || d.channel === selectedChannel)
    );
    const avgOOS = relevant.reduce((s, d) => s + d.oosRate, 0) / relevant.length;
    const totalWasted = relevant.reduce((s, d) => s + d.wastedSpend, 0);
    return {
      sku: sku.replace("FreshGlow ", ""),
      fullSku: sku,
      avgOOS: Math.round(avgOOS * 10) / 10,
      totalWasted,
    };
  });
}

// ─── SPRINT 3: PRICING GAPS DATA ────────────────────────────────────────────

export const COMPETITORS = ["BrandX", "NaturGlow", "SkinFirst", "PureBasics"];

function generatePricingData() {
  const data = [];
  let seed = 200;

  const basePrices = {
    "FreshGlow Vitamin C Serum 30ml": 599,
    "FreshGlow Sunscreen SPF50 50ml": 449,
    "FreshGlow Night Repair Cream 40g": 699,
    "FreshGlow Face Wash 100ml": 249,
    "FreshGlow Moisturizer 60ml": 349,
  };

  SKUS.forEach((sku) => {
    const basePrice = basePrices[sku];
    CHANNELS.forEach((ch) => {
      seed++;
      const ourPrice = Math.round(basePrice * (0.85 + seededRandom(seed) * 0.3));
      seed++;
      const mrp = Math.round(basePrice * 1.2);
      const discount = Math.round(((mrp - ourPrice) / mrp) * 100);

      const competitors = COMPETITORS.map((comp) => {
        seed++;
        const compPrice = Math.round(basePrice * (0.7 + seededRandom(seed) * 0.45));
        return { competitor: comp, price: compPrice };
      });

      const lowestComp = Math.min(...competitors.map((c) => c.price));
      const priceDiff = ourPrice - lowestComp;
      const lostSales = priceDiff > 0 ? Math.round(priceDiff * (8 + seededRandom(seed++) * 20)) : 0;

      data.push({
        sku,
        shortSku: sku.replace("FreshGlow ", ""),
        channel: ch,
        ourPrice,
        mrp,
        discount,
        competitors,
        lowestComp,
        priceDiff,
        lostSales,
      });
    });
  });

  return data;
}

export const pricingData = generatePricingData();

export function getPricingSummaryByChannel() {
  return CHANNELS.map((ch) => {
    const items = pricingData.filter((d) => d.channel === ch);
    const undercut = items.filter((d) => d.priceDiff > 0).length;
    const totalLost = items.reduce((s, d) => s + d.lostSales, 0);
    const avgGap = items.reduce((s, d) => s + d.priceDiff, 0) / items.length;
    return { channel: ch, undercut, total: items.length, totalLost, avgGap: Math.round(avgGap) };
  });
}

export function getPricingBySku(selectedChannel) {
  return SKUS.map((sku) => {
    const items = pricingData.filter(
      (d) => d.sku === sku && (selectedChannel === "All" || d.channel === selectedChannel)
    );
    const avgOurPrice = Math.round(items.reduce((s, d) => s + d.ourPrice, 0) / items.length);
    const avgLowest = Math.round(items.reduce((s, d) => s + d.lowestComp, 0) / items.length);
    const totalLost = items.reduce((s, d) => s + d.lostSales, 0);
    return {
      sku: sku.replace("FreshGlow ", ""),
      fullSku: sku,
      avgOurPrice,
      avgLowest,
      gap: avgOurPrice - avgLowest,
      totalLost,
    };
  });
}

// ─── SPRINT 4: AD WASTE DATA ────────────────────────────────────────────────

export const AD_TYPES = ["Sponsored Product", "Display Ad", "Brand Store", "Video Ad"];

function generateAdData() {
  const data = [];
  let seed = 500;

  SKUS.forEach((sku) => {
    CHANNELS.forEach((ch) => {
      AD_TYPES.forEach((adType) => {
        seed++;
        const spend = Math.round(seededRandom(seed) * 40000 + 5000);
        seed++;
        const impressions = Math.round(seededRandom(seed) * 200000 + 10000);
        seed++;
        const clicks = Math.round(impressions * (seededRandom(seed) * 0.04 + 0.005));
        seed++;
        const conversions = Math.round(clicks * (seededRandom(seed) * 0.12 + 0.01));
        const ctr = Math.round((clicks / impressions) * 10000) / 100;
        const convRate = Math.round((conversions / clicks) * 10000) / 100;
        const cpa = conversions > 0 ? Math.round(spend / conversions) : spend;
        const revenue = Math.round(conversions * (seededRandom(++seed) * 500 + 200));
        const roas = spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0;
        const wasted = roas < 1 ? Math.round(spend - revenue) : 0;

        data.push({
          sku,
          shortSku: sku.replace("FreshGlow ", ""),
          channel: ch,
          adType,
          spend,
          impressions,
          clicks,
          conversions,
          ctr,
          convRate,
          cpa,
          revenue,
          roas,
          wasted,
        });
      });
    });
  });

  return data;
}

export const adData = generateAdData();

export function getAdSummaryByChannel() {
  return CHANNELS.map((ch) => {
    const items = adData.filter((d) => d.channel === ch);
    const totalSpend = items.reduce((s, d) => s + d.spend, 0);
    const totalRevenue = items.reduce((s, d) => s + d.revenue, 0);
    const totalWasted = items.reduce((s, d) => s + d.wasted, 0);
    const avgRoas = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0;
    return { channel: ch, totalSpend, totalRevenue, totalWasted, avgRoas };
  });
}

export function getAdByType(selectedChannel) {
  return AD_TYPES.map((adType) => {
    const items = adData.filter(
      (d) => d.adType === adType && (selectedChannel === "All" || d.channel === selectedChannel)
    );
    const totalSpend = items.reduce((s, d) => s + d.spend, 0);
    const totalRevenue = items.reduce((s, d) => s + d.revenue, 0);
    const totalWasted = items.reduce((s, d) => s + d.wasted, 0);
    const avgCtr = Math.round((items.reduce((s, d) => s + d.ctr, 0) / items.length) * 100) / 100;
    const avgRoas = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0;
    return { adType, totalSpend, totalRevenue, totalWasted, avgCtr, avgRoas };
  });
}

export function getAdWasteBySkuChannel() {
  return SKUS.map((sku) => {
    const channels = {};
    CHANNELS.forEach((ch) => {
      const items = adData.filter((d) => d.sku === sku && d.channel === ch);
      channels[ch] = {
        spend: items.reduce((s, d) => s + d.spend, 0),
        wasted: items.reduce((s, d) => s + d.wasted, 0),
        roas: (() => {
          const sp = items.reduce((s, d) => s + d.spend, 0);
          const rv = items.reduce((s, d) => s + d.revenue, 0);
          return sp > 0 ? Math.round((rv / sp) * 100) / 100 : 0;
        })(),
      };
    });
    return { sku: sku.replace("FreshGlow ", ""), fullSku: sku, channels };
  });
}

// ─── SPRINT 5: VISIBILITY LOSS DATA ─────────────────────────────────────────

export const KEYWORDS = [
  "vitamin c serum",
  "face sunscreen",
  "night cream",
  "face wash oily skin",
  "moisturizer dry skin",
  "anti aging serum",
  "spf 50 sunscreen",
  "skin repair cream",
  "gentle face wash",
  "hydrating moisturizer",
];

function generateVisibilityData() {
  const data = [];
  let seed = 800;

  SKUS.forEach((sku) => {
    CHANNELS.forEach((ch) => {
      seed++;
      const searchRank = Math.round(seededRandom(seed) * 48 + 1);
      seed++;
      const shareOfShelf = Math.round(seededRandom(seed) * 35 * 10) / 10;
      seed++;
      const categoryRank = Math.round(seededRandom(seed) * 20 + 1);
      seed++;
      const prevSearchRank = Math.round(seededRandom(seed) * 48 + 1);
      const rankChange = prevSearchRank - searchRank;

      const keywords = KEYWORDS.slice(0, 3 + Math.round(seededRandom(++seed) * 4)).map((kw) => {
        seed++;
        const rank = Math.round(seededRandom(seed) * 50 + 1);
        seed++;
        const prevRank = Math.round(seededRandom(seed) * 50 + 1);
        seed++;
        const volume = Math.round(seededRandom(seed) * 50000 + 1000);
        return { keyword: kw, rank, prevRank, change: prevRank - rank, volume };
      });

      seed++;
      const buyBoxWinRate = Math.round(seededRandom(seed) * 100 * 10) / 10;
      seed++;
      const reviewCount = Math.round(seededRandom(seed) * 2000 + 50);
      seed++;
      const avgRating = Math.round((3 + seededRandom(seed) * 2) * 10) / 10;
      seed++;
      const estimatedLost = shareOfShelf < 15 ? Math.round(seededRandom(seed) * 80000 + 10000) : 0;

      data.push({
        sku,
        shortSku: sku.replace("FreshGlow ", ""),
        channel: ch,
        searchRank,
        shareOfShelf,
        categoryRank,
        rankChange,
        keywords,
        buyBoxWinRate,
        reviewCount,
        avgRating,
        estimatedLost,
      });
    });
  });

  return data;
}

export const visibilityData = generateVisibilityData();

export function getVisibilitySummaryByChannel() {
  return CHANNELS.map((ch) => {
    const items = visibilityData.filter((d) => d.channel === ch);
    const avgRank = Math.round(items.reduce((s, d) => s + d.searchRank, 0) / items.length);
    const avgSoS = Math.round((items.reduce((s, d) => s + d.shareOfShelf, 0) / items.length) * 10) / 10;
    const avgBuyBox = Math.round((items.reduce((s, d) => s + d.buyBoxWinRate, 0) / items.length) * 10) / 10;
    const totalLost = items.reduce((s, d) => s + d.estimatedLost, 0);
    return { channel: ch, avgRank, avgSoS, avgBuyBox, totalLost };
  });
}

export function getVisibilityBySku(selectedChannel) {
  return SKUS.map((sku) => {
    const items = visibilityData.filter(
      (d) => d.sku === sku && (selectedChannel === "All" || d.channel === selectedChannel)
    );
    const avgRank = Math.round(items.reduce((s, d) => s + d.searchRank, 0) / items.length);
    const avgSoS = Math.round((items.reduce((s, d) => s + d.shareOfShelf, 0) / items.length) * 10) / 10;
    const totalLost = items.reduce((s, d) => s + d.estimatedLost, 0);
    const avgBuyBox = Math.round((items.reduce((s, d) => s + d.buyBoxWinRate, 0) / items.length) * 10) / 10;
    return { sku: sku.replace("FreshGlow ", ""), fullSku: sku, avgRank, avgSoS, totalLost, avgBuyBox };
  });
}

export function getKeywordRankings(selectedSku, selectedChannel) {
  const items = visibilityData.filter(
    (d) =>
      (selectedSku === "All" || d.sku === selectedSku) &&
      (selectedChannel === "All" || d.channel === selectedChannel)
  );
  const kwMap = {};
  items.forEach((item) => {
    item.keywords.forEach((kw) => {
      if (!kwMap[kw.keyword]) kwMap[kw.keyword] = { keyword: kw.keyword, ranks: [], volumes: [] };
      kwMap[kw.keyword].ranks.push(kw.rank);
      kwMap[kw.keyword].volumes.push(kw.volume);
    });
  });
  return Object.values(kwMap).map((kw) => ({
    keyword: kw.keyword,
    avgRank: Math.round(kw.ranks.reduce((a, b) => a + b, 0) / kw.ranks.length),
    avgVolume: Math.round(kw.volumes.reduce((a, b) => a + b, 0) / kw.volumes.length),
  })).sort((a, b) => a.avgRank - b.avgRank);
}
