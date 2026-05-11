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
