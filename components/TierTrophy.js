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

// One laurel branch (left side); mirrored for the right.
const LEAVES = [
  { x: 30, y: 92, r: -20 },
  { x: 22, y: 80, r: -35 },
  { x: 17, y: 67, r: -50 },
  { x: 15, y: 54, r: -65 },
  { x: 16, y: 41, r: -80 },
  { x: 20, y: 29, r: -95 },
];

export default function TierTrophy({ tier, size = 72, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const c = tierColor(tier) || TIER_COLORS.gold;
  const isDiamond = c === TIER_COLORS.diamond;
  const metal = `metal-${uid}`;
  const shine = `shine-${uid}`;
  const glow = `glow-${uid}`;

  const branch = (
    <g fill={`url(#${metal})`}>
      <path d="M38 102 C20 90 12 66 20 26" fill="none" stroke={`url(#${metal})`} strokeWidth="2.2" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r})`}>
          <path d="M0 0 C4 -5 12 -5 16 0 C12 5 4 5 0 0Z" transform="translate(0 -1) rotate(-25)" />
          <path d="M0 0 C4 -5 12 -5 16 0 C12 5 4 5 0 0Z" transform="translate(0 1) rotate(205)" />
        </g>
      ))}
    </g>
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={tier?.name ? `${tier.name} tier` : "Rewards"}
    >
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="45%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor={c.base} stopOpacity="0.28" />
          <stop offset="100%" stopColor={c.base} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft halo */}
      <circle cx="60" cy="58" r="56" fill={`url(#${glow})`} />

      {/* Laurel wreath */}
      {branch}
      <g transform="translate(120 0) scale(-1 1)">{branch}</g>

      {/* Cup */}
      <g fill={`url(#${metal})`} stroke={c.dark} strokeWidth="1" strokeLinejoin="round">
        <path d="M38 26 h44 v6 c0 18 -9 30 -22 32 c-13 -2 -22 -14 -22 -32 z" />
        <path d="M38 32 c-10 0 -12 4 -11 9 c1 7 7 11 14 12 l0 -4 c-5 -1 -9 -4 -10 -8 c-0.5 -3 1 -5 7 -5 z" />
        <path d="M82 32 c10 0 12 4 11 9 c-1 7 -7 11 -14 12 l0 -4 c5 -1 9 -4 10 -8 c0.5 -3 -1 -5 -7 -5 z" />
        <path d="M56 63 h8 v12 h-8 z" />
        <path d="M50 75 h20 l3 6 h-26 z" />
        <rect x="42" y="81" width="36" height="8" rx="2" />
      </g>
      {/* Shine sweep */}
      <path d="M44 29 h8 c0 16 3 25 9 31 c-10 -3 -17 -14 -17 -31 z" fill={`url(#${shine})`} />

      {/* Star */}
      <path
        d="M60 33 l3.3 6.8 7.5 1.1 -5.4 5.3 1.3 7.4 -6.7 -3.5 -6.7 3.5 1.3 -7.4 -5.4 -5.3 7.5 -1.1 z"
        fill="#fff"
        fillOpacity="0.95"
        stroke={c.dark}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Sparkles for the top tier */}
      {isDiamond &&
        [
          [24, 16, 4],
          [98, 20, 3.2],
          [104, 70, 2.6],
        ].map(([x, y, r], i) => (
          <path
            key={i}
            d={`M${x} ${y - r * 2} Q${x} ${y} ${x + r * 2} ${y} Q${x} ${y} ${x} ${y + r * 2} Q${x} ${y} ${x - r * 2} ${y} Q${x} ${y} ${x} ${y - r * 2}Z`}
            fill={c.light}
            stroke={c.base}
            strokeWidth="0.6"
          />
        ))}
    </svg>
  );
}
