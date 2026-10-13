import { useId } from "react";
import { tierColor } from "@/components/TierBadge";

const CROWN =
  "M142 370 C200 385 300 385 358 370 C370 300 395 240 407 232 A26 26 0 1 0 382 186 " +
  "C372 192 366 205 363 216 C345 258 332 264 318 260 C305 256 268 200 268 174 " +
  "A32 32 0 1 0 232 174 C232 200 195 256 182 260 C168 264 155 258 137 216 " +
  "C134 205 128 192 118 186 A26 26 0 1 0 93 232 C105 240 130 300 142 370 Z";

// Crown reward icon, tinted by membership tier (Loyal/Silver/Gold/Diamond).
export default function TierCrown({ tier, size = 24, className = "" }) {
  const uid = useId().replace(/:/g, "");
  const c = tierColor(tier) || tierColor("gold");
  const metal = `crown-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="50 62 400 400"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={tier?.name ? `${tier.name} tier` : "Rewards"}
    >
      <defs>
        <linearGradient id={metal} gradientUnits="userSpaceOnUse" x1="70" y1="140" x2="430" y2="385">
          <stop offset="0%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <path d={CROWN} fill={`url(#${metal})`} />
    </svg>
  );
}
