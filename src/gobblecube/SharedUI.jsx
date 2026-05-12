import React, { useState, useEffect, useRef } from "react";

/**
 * Animates a number from 0 → value with an ease-out cubic curve.
 */
export function AnimatedNumber({ value, suffix = "", prefix = "", decimals = 1 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const end = value;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(end * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Colored pill badge showing OOS severity.
 */
export function OOSBadge({ rate }) {
  const bg = rate > 30 ? "#FEE2E2" : rate > 15 ? "#FEF3C7" : "#DCFCE7";
  const color = rate > 30 ? "#DC2626" : rate > 15 ? "#D97706" : "#16A34A";
  const label = rate > 30 ? "Critical" : rate > 15 ? "Warning" : "Healthy";

  return (
    <span
      style={{
        background: bg,
        color,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {label} · {rate}%
    </span>
  );
}
