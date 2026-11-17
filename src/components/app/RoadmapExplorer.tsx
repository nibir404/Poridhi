"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { track, doneCount, type Item, type ItemKind, type Module, type Status } from "@/data/roadmap";

/**
 * Interactive roadmap: left bar (milestones → modules → items), a pannable/zoomable canvas
 * (milestone → modules → items, like a Paper canvas), and a right bar with the story and outcomes
 * of whatever is selected. Selection is shared by all three and kept in the URL (?ms, ?mod, ?item).
 * Mounted over the design's body row; colours come from the theme tokens, so it is natively
 * light or dark.
 */
const KIND: Record<ItemKind, { label: string; icon: string }> = {
  class: { label: "Class", icon: "M3 5h18v14H3zM10 9l5 3-5 3z" },
  reading: { label: "Reading", icon: "M5 3h10l4 4v14H5zM15 3v4h4M8 12h8M8 16h5" },
  lab: { label: "Lab", icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
  quiz: { label: "Quiz", icon: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" },
  interview: { label: "AI interview", icon: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" },
  live: { label: "Live", icon: "M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7 7a7 7 0 0 0 0 10M17 7a7 7 0 0 1 0 10" },
  exam: { label: "Exam", icon: "M9 11l2 2 4-4M5 3h14v18H5z" },
};
const FILTERS: [string, ItemKind[] | null][] = [["All", null], ["Classes", ["class", "reading", "live"]], ["Labs", ["lab"]], ["Interviews", ["interview"]], ["Exams", ["quiz", "exam"]]];

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
function Dot({ s }: { s: Status }) {
  if (s === "done") return <span aria-label="Done" style={{ width: 18, height: 18, borderRadius: 999, background: "var(--dashboard-success)", color: "var(--dashboard-panel)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d="M6 12l4 4 8-8" size={12} /></span>;
  if (s === "locked") return <span aria-label="Locked" style={{ color: "var(--dashboard-muted)", flexShrink: 0, display: "grid" }}><Icon d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" size={16} /></span>;
  return <span aria-label={s === "current" ? "In progress" : "Not started"} style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${s === "current" ? "var(--dashboard-accent)" : "var(--dashboard-border)"}`, flexShrink: 0, background: s === "current" ? "conic-gradient(var(--dashboard-accent) 0 30%, transparent 30%)" : "transparent" }} />;
}

const W = { ms: 260, mod: 300, item: 320, gap: 110, row: 76, itemRow: 72 };

/** useSearchParams needs a Suspense boundary for static rendering. */
export default function RoadmapExplorer() {
  return <Suspense fallback={null}><Explorer /></Suspense>;
}

function Explorer() {
  const router = useRouter();
  const qs = useSearchParams();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const msN = Math.min(Math.max(Number(qs.get("ms") ?? 1), 1), track.milestones.length);
  const ms = track.milestones[msN - 1];
  const mod = ms.modules.find((m) => m.slug === qs.get("mod")) ?? null;
  const itemIdx = mod && qs.get("item") != null ? Number(qs.get("item")) : null;
  const item = mod && itemIdx != null ? mod.items[itemIdx] ?? null : null;
  const [filter, setFilter] = useState(0);
  const [hideDone, setHideDone] = useState(false);

  // Mount over the design's body row (keeps the real app bar from the design above it).
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pd-frame [data-pid]");
    const body = root?.children[1] as HTMLElement | undefined;
    if (!body) return;
    const kids = Array.from(body.children) as HTMLElement[];
    kids.forEach((k) => (k.style.display = "none"));
    const box = document.createElement("div");
    box.dataset.pdNative = "1";
    Object.assign(box.style, { flex: "1", minWidth: "0", display: "flex", alignSelf: "stretch" });
    body.appendChild(box);
    setHost(box);
    return () => { box.remove(); kids.forEach((k) => (k.style.display = "")); };
  }, []);

  const select = useCallback((next: { ms?: number; mod?: string | null; item?: number | null }) => {
    const p = new URLSearchParams();
    p.set("ms", String(next.ms ?? msN));
    const m = next.mod === undefined ? mod?.slug : next.mod;
    if (m) p.set("mod", m);
    const it = next.item === undefined ? itemIdx : next.item;
    if (m && it != null) p.set("item", String(it));
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [router, msN, mod, itemIdx]);

  if (!host) return null;
  return createPortal(
    <div className="pd-roadmap" style={{ display: "grid", gridTemplateColumns: "300px minmax(0,1fr) 380px", width: "100%", height: "100%", minHeight: 0, background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <LeftBar msN={msN} mod={mod} itemIdx={itemIdx} select={select} />
      <Canvas msN={msN} mod={mod} itemIdx={itemIdx} select={select} filter={filter} setFilter={setFilter} hideDone={hideDone} setHideDone={setHideDone} />
      <RightBar msN={msN} mod={mod} item={item} itemIdx={itemIdx} select={select} go={(h) => router.push(h)} />
    </div>,
    host,
  );
}

type Sel = (n: { ms?: number; mod?: string | null; item?: number | null }) => void;
const pct = (ms: (typeof track.milestones)[number]) => {
  const all = ms.modules.flatMap((m) => m.items), d = all.filter((i) => i.status === "done").length;
  return Math.round((d / all.length) * 100);
};
const trackPct = () => { const all = track.milestones.flatMap((m) => m.modules.flatMap((x) => x.items)); return Math.round((all.filter((i) => i.status === "done").length / all.length) * 100); };

/* ---------------- Left bar ---------------- */
function LeftBar({ msN, mod, itemIdx, select }: { msN: number; mod: Module | null; itemIdx: number | null; select: Sel }) {
  const row = (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", border: 0, borderRadius: 6, textAlign: "left", cursor: "pointer", font: "400 13px/17px var(--font-sans)", color: "var(--dashboard-text)", background: active ? "var(--dashboard-hover)" : "transparent" });
  return (
    <nav aria-label="Roadmap" style={{ borderRight: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)", padding: "22px 14px", overflowY: "auto" }} data-lenis-prevent>
      <div style={{ padding: "0 8px 14px" }}>
        <div style={{ font: "400 12px/16px var(--font-sans)", color: "var(--dashboard-muted)" }}>Career track</div>
        <div style={{ font: "600 18px/24px var(--font-sans)", marginTop: 2 }}>{track.title}</div>
        <Bar v={trackPct()} label={`${trackPct()}%`} />
      </div>
      {track.milestones.map((m) => {
        const open = m.n === msN;
        return (
          <div key={m.n} style={{ marginBottom: 6 }}>
            <button onClick={() => select({ ms: m.n, mod: null, item: null })} aria-expanded={open}
              style={{ ...row(open && !mod), flexDirection: "column", alignItems: "stretch", gap: 4, padding: "10px 12px", border: open ? "1px solid var(--dashboard-border)" : "1px solid transparent", background: open ? "var(--dashboard-panel)" : "transparent" }}>
              <span style={{ display: "flex", justifyContent: "space-between", font: "400 12px/16px var(--font-sans)", color: open ? "var(--dashboard-accent)" : "var(--dashboard-muted)" }}>
                <span>Milestone {m.n} · {m.modules.length} modules</span><span>{pct(m)}%</span>
              </span>
              <span style={{ font: "600 14px/19px var(--font-sans)" }}>{m.title}</span>
            </button>
            {open && (
              <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
                {m.modules.map((x) => {
                  const on = mod?.slug === x.slug;
                  return (
                    <li key={x.slug}>
                      <button onClick={() => select({ mod: on && itemIdx == null ? null : x.slug, item: null })} aria-current={on ? "true" : undefined} style={{ ...row(on), opacity: x.status === "locked" ? 0.72 : 1 }}>
                        <Dot s={x.status} />
                        <span style={{ flex: 1 }}>{x.title}</span>
                        <span style={{ color: "var(--dashboard-muted)", fontVariantNumeric: "tabular-nums" }}>{doneCount(x)}/{x.items.length}</span>
                      </button>
                      {on && (
                        <ul style={{ listStyle: "none", margin: "2px 0 6px 18px", padding: "0 0 0 10px", borderLeft: "1px solid var(--dashboard-border)" }}>
                          {x.items.map((it, i) => (
                            <li key={i}>
                              <button onClick={() => select({ mod: x.slug, item: i })} aria-current={itemIdx === i ? "true" : undefined} style={{ ...row(itemIdx === i), padding: "6px 8px", font: "400 12.5px/16px var(--font-sans)" }}>
                                <span style={{ color: "var(--dashboard-muted)", display: "grid" }}><Icon d={KIND[it.kind].icon} size={14} /></span>
                                <span style={{ flex: 1 }}>{it.title}</span>
                                {it.status === "done" && <span style={{ color: "var(--dashboard-success)" }}><Icon d="M6 12l4 4 8-8" size={13} /></span>}
                                {it.status === "locked" && <span style={{ color: "var(--dashboard-muted)" }}><Icon d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" size={13} /></span>}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function Bar({ v, label }: { v: number; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
      <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--dashboard-hover)", overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", background: "var(--dashboard-accent)" }} />
      </div>
      {label && <span style={{ font: "400 12px/16px var(--font-sans)", color: "var(--dashboard-muted)" }}>{label}</span>}
    </div>
  );
}

/* ---------------- Canvas ---------------- */
function Canvas({ msN, mod, itemIdx, select, filter, setFilter, hideDone, setHideDone }: { msN: number; mod: Module | null; itemIdx: number | null; select: Sel; filter: number; setFilter: (n: number) => void; hideDone: boolean; setHideDone: (b: boolean) => void }) {
  const ms = track.milestones[msN - 1];
  const view = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 40, y: 40, k: 1 });
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const kinds = FILTERS[filter][1];
  const items = useMemo(() => (mod ? mod.items.map((it, i) => ({ it, i })).filter(({ it }) => (!kinds || kinds.includes(it.kind)) && !(hideDone && it.status === "done")) : []), [mod, kinds, hideDone]);
  const mods = ms.modules;

  // Layout (world coordinates).
  const modX = W.ms + W.gap, itemX = modX + W.mod + W.gap;
  const modsH = mods.length * W.row;
  const msY = modsH / 2 - 60;
  const modIdx = mod ? mods.indexOf(mod) : -1;
  const itemsH = items.length * W.itemRow;
  const itemsTop = mod ? Math.max(0, modIdx * W.row + 30 - itemsH / 2) : 0;
  const worldW = itemX + W.item + 40, worldH = Math.max(modsH, itemsTop + itemsH) + 40;

  const fit = useCallback(() => {
    const el = view.current;
    if (!el) return;
    const w = mod ? worldW : modX + W.mod + 40;
    const k = Math.min(1.2, Math.max(0.35, Math.min((el.clientWidth - 60) / w, (el.clientHeight - 100) / worldH)));
    setT({ k, x: (el.clientWidth - w * k) / 2, y: 80 });
  }, [mod, worldW, worldH, modX]);
  useEffect(() => { fit(); }, [msN, mod?.slug, fit]);

  const zoomAt = (k: number, cx?: number, cy?: number) => setT((p) => {
    const el = view.current!;
    const nk = Math.min(2.5, Math.max(0.25, k));
    const ox = cx ?? el.clientWidth / 2, oy = cy ?? el.clientHeight / 2;
    return { k: nk, x: ox - ((ox - p.x) * nk) / p.k, y: oy - ((oy - p.y) * nk) / p.k };
  });
  useEffect(() => {
    const el = view.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) setT((p) => { const nk = Math.min(2.5, Math.max(0.25, p.k * Math.exp(-e.deltaY * 0.01))); const ox = e.clientX - r.left, oy = e.clientY - r.top; return { k: nk, x: ox - ((ox - p.x) * nk) / p.k, y: oy - ((oy - p.y) * nk) / p.k }; });
      else setT((p) => ({ ...p, x: p.x - e.deltaX, y: p.y - e.deltaY }));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => { const d = drag.current; if (d) setT((p) => ({ ...p, x: d.tx + e.clientX - d.x, y: d.ty + e.clientY - d.y })); };
  const onUp = () => { drag.current = null; };
  const jumpToMe = () => {
    const cur = ms.modules.find((m) => m.status === "current");
    if (cur) select({ mod: cur.slug, item: cur.items.findIndex((i) => i.status === "current") });
  };

  const curve = (x1: number, y1: number, x2: number, y2: number) => `M${x1},${y1} C${x1 + 60},${y1} ${x2 - 60},${y2} ${x2},${y2}`;
  const edge = (s: Status) => s === "done" ? "var(--dashboard-success)" : s === "current" ? "var(--dashboard-accent)" : "var(--dashboard-border)";
  const pill: React.CSSProperties = { height: 36, padding: "0 12px", border: 0, borderRadius: 6, background: "transparent", color: "var(--dashboard-text)", font: "400 13px/16px var(--font-sans)", cursor: "pointer" };

  return (
    <section aria-label="Roadmap canvas" style={{ position: "relative", minWidth: 0, overflow: "hidden" }}>
      <div ref={view} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{ position: "absolute", inset: 0, cursor: drag.current ? "grabbing" : "grab", touchAction: "none", backgroundColor: "var(--dashboard-main)", backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: `${16 * t.k}px ${16 * t.k}px`, backgroundPosition: `${t.x}px ${t.y}px` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: worldW, height: worldH, transform: `translate(${t.x}px, ${t.y}px) scale(${t.k})`, transformOrigin: "0 0" }}>
          <svg width={worldW} height={worldH} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} aria-hidden>
            {mods.map((m, i) => <path key={m.slug} d={curve(W.ms, msY + 60, modX, i * W.row + 30)} fill="none" stroke={edge(m.status)} strokeWidth={m.slug === mod?.slug ? 2.5 : 1.5} strokeDasharray={m.status === "locked" ? "4 5" : undefined} opacity={mod && m.slug !== mod.slug ? 0.45 : 1} />)}
            {mod && items.map(({ it }, j) => <path key={j} d={curve(modX + W.mod, modIdx * W.row + 30, itemX, itemsTop + j * W.itemRow + 30)} fill="none" stroke={edge(it.status)} strokeWidth={1.5} strokeDasharray={it.status === "locked" ? "4 5" : undefined} />)}
          </svg>
          {/* Milestone */}
          <button onClick={() => select({ mod: null, item: null })} aria-label={`Milestone ${ms.n}: ${ms.title}`}
            style={{ position: "absolute", left: 0, top: msY, width: W.ms, padding: 20, border: !mod ? "2px solid var(--dashboard-accent)" : "1px solid var(--dashboard-border)", borderRadius: 12, background: "linear-gradient(150deg, color-mix(in oklab, var(--dashboard-accent) 32%, var(--dashboard-panel)), var(--dashboard-panel))", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer" }}>
            <div style={{ font: "400 12px/16px var(--font-sans)", color: "var(--dashboard-muted)" }}>Milestone {ms.n} · {mods.length} modules</div>
            <div style={{ font: "600 19px/24px var(--font-sans)", margin: "10px 0 18px" }}>{ms.title}</div>
            <Bar v={pct(ms)} label={`${pct(ms)}%`} />
          </button>
          {/* Modules */}
          {mods.map((m, i) => {
            const on = m.slug === mod?.slug;
            return (
              <button key={m.slug} onClick={() => select({ mod: on ? null : m.slug, item: null })} aria-current={on ? "true" : undefined}
                style={{ position: "absolute", left: modX, top: i * W.row, width: W.mod, height: 60, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", border: on ? "2px solid var(--dashboard-accent)" : "1px solid var(--dashboard-border)", borderRadius: 6, background: m.status === "locked" ? "var(--dashboard-main)" : "var(--dashboard-panel)", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer", opacity: mod && !on ? 0.75 : 1 }}>
                <Dot s={m.status} />
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ font: "600 14px/18px var(--font-sans)" }}>{m.title}</span>
                  <span style={{ font: "400 12px/16px var(--font-sans)", color: m.status === "current" ? "var(--dashboard-accent)" : "var(--dashboard-muted)" }}>
                    {m.status === "done" ? `${m.items.length} / ${m.items.length} · done` : m.status === "current" ? `${doneCount(m)} / ${m.items.length} · in progress` : m.status === "locked" ? "Locked" : `${m.items.length} items`}
                  </span>
                </span>
              </button>
            );
          })}
          {/* Items of the open module */}
          {mod && items.map(({ it, i }, j) => {
            const on = itemIdx === i;
            return (
              <button key={i} onClick={() => select({ mod: mod.slug, item: i })} aria-current={on ? "true" : undefined}
                style={{ position: "absolute", left: itemX, top: itemsTop + j * W.itemRow, width: W.item, height: 60, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", border: on ? "2px solid var(--dashboard-accent)" : "1px solid var(--dashboard-border)", borderRadius: 6, background: it.status === "locked" ? "var(--dashboard-main)" : "var(--dashboard-panel)", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer" }}>
                <span style={{ width: 32, height: 32, borderRadius: 6, display: "grid", placeItems: "center", background: "var(--dashboard-hover)", color: "var(--dashboard-text)", flexShrink: 0 }}><Icon d={KIND[it.kind].icon} /></span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <span style={{ font: "600 13.5px/17px var(--font-sans)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.title}</span>
                  <span style={{ font: "400 12px/16px var(--font-sans)", color: "var(--dashboard-muted)" }}>{it.meta}</span>
                </span>
                {it.status === "current" && <span style={{ font: "600 10.5px/14px var(--font-sans)", padding: "2px 6px", borderRadius: 4, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)" }}>YOU ARE HERE</span>}
                {it.status === "done" && <span style={{ color: "var(--dashboard-success)" }}><Icon d="M6 12l4 4 8-8" /></span>}
                {it.pro && <span style={{ font: "600 11px/14px var(--font-sans)", padding: "2px 6px", borderRadius: 4, background: "var(--dashboard-hover)" }}>Pro</span>}
              </button>
            );
          })}
          {mod && !items.length && <div style={{ position: "absolute", left: itemX, top: itemsTop, width: W.item, padding: 16, border: "1px dashed var(--dashboard-border)", borderRadius: 6, color: "var(--dashboard-muted)", font: "400 13px/18px var(--font-sans)" }}>Nothing here with this filter.</div>}
        </div>
      </div>
      {/* Toolbars */}
      <div style={{ position: "absolute", left: 20, top: 20, display: "flex", gap: 2, padding: 3, background: "var(--dashboard-panel)", border: "1px solid var(--dashboard-border)", borderRadius: 6 }} role="toolbar" aria-label="Filter items">
        {FILTERS.map(([l], i) => <button key={l} onClick={() => setFilter(i)} aria-pressed={filter === i} style={{ ...pill, background: filter === i ? "var(--dashboard-hover)" : "transparent", fontWeight: filter === i ? 600 : 400 }}>{l}</button>)}
        <span style={{ width: 1, background: "var(--dashboard-border)", margin: "6px 2px" }} />
        <button onClick={() => setHideDone(!hideDone)} aria-pressed={hideDone} style={{ ...pill, background: hideDone ? "var(--dashboard-hover)" : "transparent" }}>Hide done</button>
      </div>
      <div style={{ position: "absolute", right: 20, top: 20, display: "flex", alignItems: "center", gap: 2, padding: 3, background: "var(--dashboard-panel)", border: "1px solid var(--dashboard-border)", borderRadius: 6 }} role="toolbar" aria-label="Canvas view">
        <button aria-label="Zoom out" onClick={() => zoomAt(t.k / 1.2)} style={pill}>−</button>
        <span style={{ minWidth: 48, textAlign: "center", font: "400 13px/16px var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>{Math.round(t.k * 100)}%</span>
        <button aria-label="Zoom in" onClick={() => zoomAt(t.k * 1.2)} style={pill}>+</button>
        <span style={{ width: 1, alignSelf: "stretch", background: "var(--dashboard-border)", margin: "6px 2px" }} />
        <button onClick={fit} style={pill}>Fit</button>
        <button onClick={jumpToMe} style={pill}>Jump to me</button>
      </div>
      <div style={{ position: "absolute", left: 20, bottom: 16, font: "400 12px/16px var(--font-sans)", color: "var(--dashboard-muted)", pointerEvents: "none" }}>Drag to move · scroll to pan · ⌘/Ctrl + scroll to zoom</div>
    </section>
  );
}

/* ---------------- Right bar ---------------- */
function RightBar({ msN, mod, item, itemIdx, select, go }: { msN: number; mod: Module | null; item: Item | null; itemIdx: number | null; select: Sel; go: (h: string) => void }) {
  const ms = track.milestones[msN - 1];
  const head = (k: string) => <div style={{ font: "500 11px/14px var(--font-sans)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)", margin: "22px 0 10px" }}>{k}</div>;
  const cta = (label: string, href: string, disabled = false) => (
    <button onClick={() => !disabled && go(href)} disabled={disabled} style={{ width: "100%", height: 40, marginTop: 22, border: 0, borderRadius: 6, background: disabled ? "var(--dashboard-hover)" : "var(--dashboard-accent)", color: disabled ? "var(--dashboard-muted)" : "var(--dashboard-accent-ink)", font: "600 14px/18px var(--font-sans)", cursor: disabled ? "not-allowed" : "pointer" }}>{label}</button>
  );
  const list = (xs: string[], done = false) => (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
      {xs.map((x, i) => (
        <li key={i} style={{ display: "flex", gap: 10, font: "400 13.5px/19px var(--font-sans)" }}>
          <span style={{ color: done ? "var(--dashboard-success)" : "var(--dashboard-accent)", marginTop: 2 }}><Icon d="M6 12l4 4 8-8" size={14} /></span>{x}
        </li>
      ))}
    </ul>
  );
  const crumbs = [`Milestone ${ms.n}`, mod && `Module ${ms.modules.indexOf(mod) + 1} of ${ms.modules.length}`, item && `Item ${itemIdx! + 1} of ${mod!.items.length}`].filter(Boolean).join(" · ");
  return (
    <aside aria-label="Details" style={{ borderLeft: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", padding: "22px 24px", overflowY: "auto" }} data-lenis-prevent>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ font: "400 12px/16px var(--font-sans)", color: "var(--dashboard-muted)" }}>{crumbs}</span>
        {(mod || item) && <button aria-label="Back" onClick={() => select(item ? { item: null } : { mod: null, item: null })} style={{ width: 32, height: 32, border: "1px solid var(--dashboard-border)", borderRadius: 6, background: "transparent", color: "var(--dashboard-text)", cursor: "pointer" }}>×</button>}
      </div>

      {item && mod ? (
        <>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Tag>{KIND[item.kind].label}</Tag><Tag>{item.meta.split(" · ").slice(1).join(" · ") || item.meta}</Tag>
            {item.pro && <Tag>Pro</Tag>}
          </div>
          <h2 style={{ font: "600 22px/28px var(--font-sans)", margin: "12px 0 8px" }}>{item.title}</h2>
          <p style={{ font: "400 14px/21px var(--font-sans)", color: "var(--dashboard-text)", margin: 0 }}>{item.summary}</p>
          {item.checks && (<>{head(`Checks · ${item.checksDone ?? 0} of ${item.checks.length}`)}
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
              {item.checks.map((c, i) => <li key={c} style={{ display: "flex", gap: 10, font: "400 13.5px/19px var(--font-sans)", color: i < (item.checksDone ?? 0) ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}><Dot s={i < (item.checksDone ?? 0) ? "done" : "todo"} />{c}</li>)}
            </ul></>)}
          {item.kind === "lab" && <p style={{ font: "400 13px/18px var(--font-sans)", color: "var(--dashboard-muted)", marginTop: 18 }}>VM time counts only after you launch · Bank: 2h 40m</p>}
          {cta(item.status === "locked" ? "Locked" : item.status === "done" ? "Review" : item.status === "current" ? (item.kind === "lab" ? "Resume lab" : "Continue") : item.kind === "lab" ? "Launch lab" : "Start", item.href, item.status === "locked")}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {itemIdx! > 0 && <Ghost onClick={() => select({ item: itemIdx! - 1 })}>← Previous</Ghost>}
            {itemIdx! < mod.items.length - 1 && <Ghost onClick={() => select({ item: itemIdx! + 1 })}>Next →</Ghost>}
            <Ghost onClick={() => go("/app/me/support/book")}>Ask a TA</Ghost>
          </div>
        </>
      ) : mod ? (
        <>
          <h2 style={{ font: "600 22px/28px var(--font-sans)", margin: "14px 0 6px" }}>{mod.title}</h2>
          <Bar v={Math.round((doneCount(mod) / mod.items.length) * 100)} label={`${doneCount(mod)} / ${mod.items.length}`} />
          {head("The story")}<p style={{ font: "400 14px/21px var(--font-sans)", margin: 0 }}>{mod.story}</p>
          {head("Outcomes")}{list(mod.outcomes, mod.status === "done")}
          {head("In this module")}
          <div style={{ display: "grid", gap: 6 }}>
            {mod.items.map((it, i) => (
              <button key={i} onClick={() => select({ item: i })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--dashboard-border)", borderRadius: 6, background: "transparent", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer", font: "400 13px/17px var(--font-sans)" }}>
                <Dot s={it.status} /><span style={{ flex: 1 }}>{it.title}</span><span style={{ color: "var(--dashboard-muted)" }}>{KIND[it.kind].label}</span>
              </button>
            ))}
          </div>
          {(() => { const next = mod.items.findIndex((i) => i.status === "current" || i.status === "todo"); return mod.status === "locked" ? cta("Locked: finish the previous module", "#", true) : next < 0 ? cta("Review module", mod.items[0].href) : cta(mod.items[next].status === "current" ? "Continue" : "Start module", mod.items[next].href); })()}
        </>
      ) : (
        <>
          <h2 style={{ font: "600 22px/28px var(--font-sans)", margin: "14px 0 6px" }}>{ms.title}</h2>
          <Bar v={pct(ms)} label={`${pct(ms)}%`} />
          {head("The story")}<p style={{ font: "400 14px/21px var(--font-sans)", margin: 0 }}>{ms.story}</p>
          {head("Outcomes")}{list(ms.outcomes)}
          {head("Certificate")}<p style={{ font: "400 14px/21px var(--font-sans)", margin: 0 }}>{ms.certificate}</p>
          {head(`${ms.modules.length} modules`)}
          <div style={{ display: "grid", gap: 6 }}>
            {ms.modules.map((m) => (
              <button key={m.slug} onClick={() => select({ mod: m.slug, item: null })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid var(--dashboard-border)", borderRadius: 6, background: "transparent", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer", font: "400 13px/17px var(--font-sans)" }}>
                <Dot s={m.status} /><span style={{ flex: 1 }}>{m.title}</span><span style={{ color: "var(--dashboard-muted)" }}>{doneCount(m)}/{m.items.length}</span>
              </button>
            ))}
          </div>
          {(() => { const cur = ms.modules.find((m) => m.status === "current"); return cur ? cta(`Continue: ${cur.title}`, `?ms=${ms.n}&mod=${cur.slug}`) : cta("Locked: pass the previous milestone exam", "#", true); })()}
        </>
      )}
    </aside>
  );
}

const Tag = ({ children }: { children: React.ReactNode }) => <span style={{ font: "400 12px/16px var(--font-sans)", padding: "4px 8px", borderRadius: 4, background: "var(--dashboard-hover)", color: "var(--dashboard-text)" }}>{children}</span>;
const Ghost = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} style={{ flex: 1, height: 36, border: "1px solid var(--dashboard-border)", borderRadius: 6, background: "transparent", color: "var(--dashboard-text)", font: "400 13px/16px var(--font-sans)", cursor: "pointer" }}>{children}</button>
);
