/**
 * Format a number as Indian Rupees with Lakh/K abbreviations.
 * e.g. 180000 → "₹1.8L", 5000 → "₹5.0K", 400 → "₹400"
 */
export function formatINR(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
}
