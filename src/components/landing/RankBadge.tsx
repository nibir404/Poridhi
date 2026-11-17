"use client";
/**
 * Rank badge, drawn like the design's metal hexagons: a polished rim, a coloured core with a
 * glossy top and a glyph per rank. Locked ranks are shown flat and grey.
 */
const TONES: Record<string, [string, string, string]> = {
  Intern: ["#9AD9B4", "#3E8E62", "#173826"],
  Junior: ["#8FC7F2", "#3878B8", "#16304C"],
  Engineer: ["#9EA3EC", "#484FA3", "#1E2144"],
  Senior: ["#F2C27D", "#B9781E", "#4A2E08"],
  Staff: ["#E9A1D6", "#A2468A", "#3E1636"],
  Principal: ["#F4E6A6", "#C49A2C", "#4A3A0C"],
};
const GLYPH: Record<string, string> = {
  Intern: "M9 9l3 3-3 3M13.5 15H16",
  Junior: "M8 9h8M8 12h8M8 15h5",
  Engineer: "M12 7.5l3.9 2.25v4.5L12 16.5l-3.9-2.25v-4.5z",
  Senior: "M8.5 12a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0M12 6.5v2M12 15.5v2",
  Staff: "M7.5 12c1.5-2.5 3-2.5 4.5 0s3 2.5 4.5 0",
  Principal: "M12 6.8l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z",
};

export default function RankBadge({ rank, size = 56, locked = false }: { rank: string; size?: number; locked?: boolean }) {
  const [hi, mid, lo] = locked ? ["#CFCFCF", "#9A9A9A", "#5E5E5E"] : TONES[rank] ?? TONES.Engineer;
  const id = `rb-${rank}-${locked ? "l" : "a"}`;
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 120 132" role="img" aria-label={`${rank} badge${locked ? " (locked)" : ""}`} style={{ flexShrink: 0, opacity: locked ? 0.55 : 1 }}>
      <defs>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".45" stopColor="#C5C9D4" /><stop offset=".6" stopColor="#F3F4F7" /><stop offset="1" stopColor="#8E93A2" /></linearGradient>
        <radialGradient id={`${id}-core`} cx=".35" cy=".2" r=".95"><stop offset="0" stopColor={hi} /><stop offset=".55" stopColor={mid} /><stop offset="1" stopColor={lo} /></radialGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".5" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
      </defs>
      <path d="M60 6 108 33v66L60 126 12 99V33z" fill={`url(#${id}-rim)`} stroke={`url(#${id}-rim)`} strokeWidth="8" strokeLinejoin="round" />
      <path d="M60 15 100 37.5v57L60 117 20 94.5v-57z" fill={lo} />
      <path d="M60 18 97 39v54L60 114 23 93V39z" fill={`url(#${id}-core)`} />
      <path d="M60 20 95 40v18c-14-7-56-7-70 0V40z" fill={`url(#${id}-gloss)`} />
      <g transform="translate(36 42) scale(2)"><path d={GLYPH[rank] ?? GLYPH.Engineer} fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></g>
    </svg>
  );
}
