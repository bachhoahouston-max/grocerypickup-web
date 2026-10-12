import { useId } from "react";

// Tier colors from the brand spec; light/dark are derived shades for the metallic gradient.
const TIER_COLORS = {
  loyal: { base: "#0B4F3C", light: "#3A9C7D", dark: "#05291F" },
  silver: { base: "#A7B0B7", light: "#EEF1F3", dark: "#6B747B" },
  gold: { base: "#D8A62E", light: "#F8DE8A", dark: "#94690F" },
  diamond: { base: "#55B8E8", light: "#D4F1FF", dark: "#22709E" },
};

export const tierColor = (tier) => {
  const key = String(tier?.key || tier?.name || tier || "").toLowerCase();
  return TIER_COLORS[key] || null;
};

const STAR = "M20 10.5 l2.8 5.7 6.3 0.9 -4.6 4.4 1.1 6.3 -5.6 -3 -5.6 3 1.1 -6.3 -4.6 -4.4 6.3 -0.9 z";

// Round medal for Loyal/Silver/Gold, a cut gem for Diamond.
export default function TierBadge({ tier, size = 40, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const c = tierColor(tier) || TIER_COLORS.gold;
  const metal = `metal-${uid}`;
  const inner = `inner-${uid}`;

  if (c === TIER_COLORS.diamond) {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" className={className} role="img" aria-label={tier?.name}>
        <defs>
          <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.light} />
            <stop offset="50%" stopColor={c.base} />
            <stop offset="100%" stopColor={c.dark} />
          </linearGradient>
        </defs>
        <path d="M11 7 h18 l8 9 -17 19 -17 -19 z" fill={`url(#${metal})`} />
        <path d="M3 16 h34 M11 7 l4 9 5 19 5 -19 4 -9 M15 16 l5 -9 5 9" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M11 7 h9 l-5 9 h-12 z" fill="#fff" fillOpacity="0.35" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} role="img" aria-label={tier?.name}>
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="55%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={inner} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="60%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill={`url(#${metal})`} />
      <circle cx="20" cy="20" r="14" fill={`url(#${inner})`} stroke="#fff" strokeOpacity="0.5" strokeWidth="1" />
      <path d={STAR} fill="#fff" fillOpacity="0.95" stroke={c.dark} strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}
