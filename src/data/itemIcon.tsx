import type { Item } from "./catalog";

/** Topic-specific icon + tile colour for catalog items (search palette, Explore menu). */
const P = {
  route: "M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6",
  helm: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M5.6 18.4l4.3-4.3M14.1 9.9l4.3-4.3",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  branch: "M6 3v12M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9c0 6-12 3-12 6",
  box: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  network: "M5 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 11l10-5M7 13l10 5",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14",
  chip: "M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  agent: "M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z M9 12l2 2 4-4",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 11h7",
  mic: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  board: "M3 4h18v12H3zM8 20h8M12 16v4M7 12l3-3 2 2 4-4",
  cloud: "M7 18a5 5 0 0 1-.9-9.9A6 6 0 0 1 17.6 7 4.5 4.5 0 0 1 17 18z",
  terminal: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17",
};

export function itemIcon(i: Item): { path: string; bg: string; stroke: string } {
  const t = `${i.title} ${i.meta}`.toLowerCase();
  const navy = { bg: "var(--dashboard-accent)", stroke: "var(--dashboard-accent-ink)" }; // design system: black/white
  const soft = { bg: "var(--dashboard-hover)", stroke: "var(--dashboard-text)" };
  const pick = (path: string, tone = navy) => ({ path, ...tone });
  if (i.kind === "Track") return pick(/kubernetes/.test(t) ? P.helm : /mlops|ai/.test(t) ? P.chip : /backend|system/.test(t) ? P.code : P.route);
  if (i.kind === "AI practice") return pick(/system design|whiteboard/.test(t) ? P.board : P.mic, soft);
  if (i.kind === "Lab guide") return pick(P.book, soft);
  const lab = { bg: "var(--dashboard-selected)", stroke: "var(--dashboard-text)" };
  if (/terraform/.test(t)) return pick(P.layers, lab);
  if (/prometheus|grafana|monitor/.test(t)) return pick(P.chart, lab);
  if (/github|ci\b|actions/.test(t)) return pick(P.branch, lab);
  if (/docker|container/.test(t)) return pick(P.box, lab);
  if (/kubernetes|kubectl|pod|cka|rolling/.test(t)) return pick(P.helm, lab);
  if (/vxlan|network|namespace|dns/.test(t)) return pick(P.network, lab);
  if (/llm|gpu|mlops/.test(t)) return pick(P.chip, lab);
  if (/agent|mcp/.test(t)) return pick(P.agent, lab);
  if (/ssh|audit|security|harden/.test(t)) return pick(P.shield, lab);
  if (/\bgo\b|python|shortener/.test(t)) return pick(P.code, lab);
  if (/aws|nlb|cloud/.test(t)) return pick(P.cloud, lab);
  return pick(P.terminal, lab);
}

export function ItemIcon({ item, size = 44 }: { item: Item; size?: number }) {
  const ic = itemIcon(item);
  return (
    <div style={{ width: size, height: size, borderRadius: 8, border: "1px solid var(--dashboard-border)", background: ic.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke={ic.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ic.path} /></svg>
    </div>
  );
}
