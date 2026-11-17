"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Dashboard activity: replaces the flat "This week" card with a GitHub-style contribution heatmap
 * (last 20 weeks of lab minutes), a coloured weekly bar chart with hover values, and quick stats.
 * Mounted into the design's card by finding its "This week" title.
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK = [34, 62, 48, 88, 20, 54, 0]; // minutes, Sun = today (so far)
const LEVELS = ["var(--dashboard-hover)", "rgba(139,92,246,.35)", "rgba(139,92,246,.6)", "rgba(139,92,246,.85)", "#B0B3FC"];

function seeded(n: number) { let s = 7; return Array.from({ length: n }, (_, i) => { s = (s * 9301 + 49297) % 233280; const r = s / 233280; const weekend = i % 7 >= 5; return r < (weekend ? 0.45 : 0.22) ? 0 : Math.round(r * (weekend ? 70 : 110)); }); }

function Activity() {
  const weeks = 20;
  const cells = useMemo(() => { const c = seeded(weeks * 7); c.splice(c.length - 7, 7, ...WEEK); return c; }, []);
  const [hover, setHover] = useState<string | null>(null);
  const [bar, setBar] = useState<number | null>(null);
  const level = (v: number) => (v === 0 ? 0 : v < 30 ? 1 : v < 60 ? 2 : v < 90 ? 3 : 4);
  const total = WEEK.reduce((a, b) => a + b, 0), max = Math.max(...WEEK);
  const active = cells.filter((v) => v > 0).length;
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov"];
  const muted = "var(--dashboard-muted)";

  return (
    <div style={{ display: "grid", gap: 20, color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <b style={{ fontSize: 16 }}>Activity</b>
        <span style={{ fontSize: 13, color: muted }}>{hover ?? `${active} active days in the last ${weeks} weeks`}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: 28, alignItems: "end" }}>
        {/* Heatmap */}
        <div style={{ display: "grid", gap: 6, maxWidth: 28 + weeks * 17, alignSelf: "start" }}>
          <div style={{ display: "grid", gridTemplateColumns: `28px repeat(${weeks}, 1fr)`, fontSize: 11, color: muted }}>
            <span />{Array.from({ length: weeks }, (_, w) => <span key={w}>{w % 4 === 0 ? months[w / 4] : ""}</span>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `28px repeat(${weeks}, 1fr)`, gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column", gap: 3 }}>
            {DAYS.map((d, i) => <span key={d} style={{ gridColumn: 1, gridRow: i + 1, fontSize: 10, color: muted, alignSelf: "center" }}>{i % 2 === 0 ? d : ""}</span>)}
            {cells.map((v, i) => {
              const w = Math.floor(i / 7), d = i % 7;
              const label = `${v ? `${v} min` : "No lab time"} · ${DAYS[d]}, week ${w + 1}`;
              return <span key={i} title={label} onMouseEnter={() => setHover(label)} onMouseLeave={() => setHover(null)} style={{ gridColumn: w + 2, gridRow: d + 1, aspectRatio: "1", borderRadius: 3, background: LEVELS[level(v)], outline: i === cells.length - 1 ? "1.5px solid var(--dashboard-text)" : undefined, outlineOffset: -1 }} />;
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", fontSize: 11, color: muted }}>Less{LEVELS.map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}More</div>
        </div>

        {/* Weekly bars */}
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: muted }}><span>This week</span><span>{bar != null ? `${DAYS[bar]} · ${WEEK[bar]} min` : `${Math.floor(total / 60)}h ${total % 60}m total`}</span></div>
          <div style={{ height: 132, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, alignItems: "end" }}>
            {WEEK.map((v, i) => (
              <button key={i} type="button" aria-label={`${DAYS[i]}: ${v} minutes`} onMouseEnter={() => setBar(i)} onMouseLeave={() => setBar(null)} onFocus={() => setBar(i)} onBlur={() => setBar(null)}
                style={{ height: `${Math.max(4, (v / max) * 100)}%`, border: 0, padding: 0, borderRadius: 6, cursor: "default", background: v === max ? "linear-gradient(180deg, #B0B3FC, #8B5CF6)" : i === 6 ? "var(--dashboard-hover)" : "linear-gradient(180deg, rgba(139,92,246,.75), rgba(59,130,246,.55))", opacity: bar == null || bar === i ? 1 : 0.45, transition: "opacity .15s, height .4s" }} />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, textAlign: "center", fontSize: 11, color: muted }}>{DAYS.map((d, i) => <span key={d} style={{ color: i === 6 ? "var(--dashboard-text)" : undefined }}>{d}</span>)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[["Avg / active day", `${Math.round(total / WEEK.filter(Boolean).length)} min`], ["Best day", `Thu · ${max} min`], ["Checks passed", "9 this week"], ["vs last week", "+18%"]].map(([k, v]) => (
          <div key={k} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--dashboard-border)", display: "grid", gap: 2 }}>
            <span style={{ fontSize: 12, color: muted }}>{k}</span><b style={{ fontSize: 15, color: k === "vs last week" ? "var(--dashboard-success)" : undefined }}>{v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardViz() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const find = () => {
      const title = Array.from(document.querySelectorAll<HTMLElement>("[data-pid]")).find((e) => !e.children.length && e.textContent?.trim() === "This week" && e.closest("[data-pid]")?.parentElement?.textContent?.includes("Lab minutes per day"));
      let card = title?.parentElement ?? null;
      while (card && !card.textContent?.includes("MON")) card = card.parentElement;
      if (!card) return false;
      Array.from(card.children).forEach((c) => ((c as HTMLElement).style.display = "none"));
      const slot = document.createElement("div");
      slot.style.width = "100%";
      card.appendChild(slot);
      setHost(slot);
      return true;
    };
    if (find()) return;
    const t = setTimeout(find, 300);
    return () => clearTimeout(t);
  }, []);
  return host ? createPortal(<Activity />, host) : null;
}
