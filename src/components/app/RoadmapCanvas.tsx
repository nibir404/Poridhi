"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/data/roadmap";

/**
 * Track roadmap as a free canvas: drag the background to pan, scroll or pinch to zoom, and drag any
 * milestone card to arrange the board your way (positions persist). Minimal cards: number, title,
 * progress, modules as a quiet list, then exam and certificate as one line each.
 */
type Pos = Record<number, { x: number; y: number }>;
const W = 280, GAP = 64, KEY = "pd-roadmap-layout";
const defaultPos = (): Pos => Object.fromEntries(track.milestones.map((m, i) => [m.n, { x: 80 + i * (W + GAP), y: 80 + (i % 2) * 40 }]));
const ink = { muted: "var(--dashboard-muted)", border: "1px solid var(--dashboard-border)" };

export default function RoadmapCanvas() {
  const [pos, setPos] = useState<Pos>(defaultPos);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const box = useRef<HTMLDivElement>(null);
  const heights = useRef<Record<number, number>>({});

  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setPos({ ...defaultPos(), ...JSON.parse(s) }); } catch {} }, []);
  const save = (p: Pos) => { setPos(p); localStorage.setItem(KEY, JSON.stringify(p)); };

  // Pan the background.
  const panDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-card],[data-ui]")) return;
    const s = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = "grabbing";
    const mv = (ev: PointerEvent) => setView((v) => ({ ...v, x: s.vx + ev.clientX - s.x, y: s.vy + ev.clientY - s.y }));
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); document.body.style.cursor = ""; };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  // Drag a card by its header.
  const cardDown = (n: number) => (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    e.stopPropagation();
    const s = { x: e.clientX, y: e.clientY, px: pos[n].x, py: pos[n].y };
    let cur = pos;
    document.body.style.cursor = "grabbing";
    const mv = (ev: PointerEvent) => { cur = { ...cur, [n]: { x: s.px + (ev.clientX - s.x) / view.k, y: s.py + (ev.clientY - s.y) / view.k } }; setPos(cur); };
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); document.body.style.cursor = ""; save(cur); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  const zoomAt = useCallback((k: number, cx?: number, cy?: number) => setView((v) => {
    const nk = Math.min(1.8, Math.max(0.35, k));
    const r = box.current?.getBoundingClientRect();
    const px = cx ?? (r ? r.width / 2 : 0), py = cy ?? (r ? r.height / 2 : 0);
    return { k: nk, x: px - ((px - v.x) * nk) / v.k, y: py - ((py - v.y) * nk) / v.k };
  }), []);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const w = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) setView((v) => { const nk = Math.min(1.8, Math.max(0.35, v.k * Math.exp(-e.deltaY / 300))); const px = e.clientX - r.left, py = e.clientY - r.top; return { k: nk, x: px - ((px - v.x) * nk) / v.k, y: py - ((py - v.y) * nk) / v.k }; });
      else setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    };
    el.addEventListener("wheel", w, { passive: false });
    return () => el.removeEventListener("wheel", w);
  }, []);
  const fit = () => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    const xs = Object.values(pos).map((p) => p.x), ys = Object.values(pos).map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs) + W, minY = Math.min(...ys), maxY = Math.max(...ys) + 560;
    const k = Math.min(1, Math.max(0.35, Math.min((r.width - 80) / (maxX - minX), (r.height - 140) / (maxY - minY))));
    setView({ k, x: (r.width - (maxX - minX) * k) / 2 - minX * k, y: 84 - minY * k });
  };
  useEffect(() => { const t = setTimeout(fit, 50); return () => clearTimeout(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connector between consecutive milestones (right edge of one → left edge of the next).
  const links = track.milestones.slice(1).map((m, i) => {
    const a = pos[track.milestones[i].n], b = pos[m.n];
    if (!a || !b) return null;
    const x1 = a.x + W, y1 = a.y + 40, x2 = b.x, y2 = b.y + 40, mx = (x1 + x2) / 2;
    return <path key={m.n} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" stroke="var(--dashboard-muted)" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="4 5" />;
  });

  const btn: React.CSSProperties = { width: 32, height: 32, display: "grid", placeItems: "center", border: 0, borderRadius: 6, background: "transparent", color: "var(--dashboard-text)", cursor: "pointer", fontSize: 15 };

  return (
    <div ref={box} onPointerDown={panDown} data-lenis-prevent style={{ position: "relative", height: "calc(100dvh - 64px)", overflow: "hidden", cursor: "grab", touchAction: "none", userSelect: "none", background: "var(--dashboard-main)", backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1.2px)", backgroundSize: `${22 * view.k}px ${22 * view.k}px`, backgroundPosition: `${view.x}px ${view.y}px`, color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      {/* Title */}
      <div data-ui style={{ position: "absolute", left: 24, top: 20, zIndex: 2, display: "grid", gap: 2, pointerEvents: "none" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: ink.muted }}>Track</span>
        <b style={{ fontSize: 18, letterSpacing: "-.01em" }}>DevOps & Cloud Engineer</b>
      </div>

      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`, transformOrigin: "0 0" }}>
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={1} height={1} aria-hidden>{links}</svg>
        {track.milestones.map((m) => {
          const done = m.modules.filter((x) => x.status === "done").length;
          const pct = Math.round((done / m.modules.length) * 100);
          const current = m.modules.some((x) => x.status === "current");
          const shown = open[m.n] ? m.modules : m.modules.slice(0, 5);
          return (
            <section key={m.n} data-card aria-label={`Milestone ${m.n}: ${m.title}`} ref={(el) => { if (el) heights.current[m.n] = el.offsetHeight; }}
              style={{ position: "absolute", left: pos[m.n].x, top: pos[m.n].y, width: W, borderRadius: 12, border: current ? "1px solid var(--dashboard-text)" : ink.border, background: "var(--dashboard-panel)", boxShadow: "0 12px 32px -20px rgba(0,0,0,.35)", cursor: "default" }}>
              <header onPointerDown={cardDown(m.n)} style={{ padding: "14px 16px 12px", cursor: "grab", display: "grid", gap: 8, borderBottom: ink.border }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase", color: ink.muted }}>
                  <span>Milestone {m.n}{current ? " · current" : ""}</span><span aria-hidden>⋮⋮</span>
                </span>
                <Link href={`/app/roadmap/milestone-1?ms=${m.n}`} style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: "inherit", textDecoration: "none" }}>{m.title}</Link>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, height: 3, borderRadius: 2, background: "var(--dashboard-border)" }}><span style={{ display: "block", width: `${pct}%`, height: "100%", borderRadius: 2, background: "var(--dashboard-success)" }} /></span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: ink.muted }}>{pct}% · {m.modules.length}</span>
                </span>
              </header>
              <ul style={{ listStyle: "none", margin: 0, padding: 6, display: "grid" }}>
                {shown.map((x) => (
                  <li key={x.slug}>
                    <Link href={`/app/roadmap/milestone-1?ms=${m.n}&mod=${x.slug}`} className="pd-rail-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, fontSize: 13, color: x.status === "locked" ? ink.muted : "inherit", textDecoration: "none", fontWeight: x.status === "current" ? 600 : 400 }}>
                      <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, flexShrink: 0, background: x.status === "done" ? "var(--dashboard-success)" : x.status === "current" ? "var(--dashboard-text)" : "transparent", border: x.status === "done" || x.status === "current" ? 0 : "1.5px solid var(--dashboard-border)" }} />
                      {x.title}
                    </Link>
                  </li>
                ))}
                {m.modules.length > 5 && <li><button type="button" onClick={() => setOpen((o) => ({ ...o, [m.n]: !o[m.n] }))} style={{ width: "100%", padding: "7px 10px", border: 0, background: "transparent", color: ink.muted, fontSize: 12, textAlign: "left", cursor: "pointer" }}>{open[m.n] ? "Show less" : `+${m.modules.length - 5} more`}</button></li>}
              </ul>
              <footer style={{ borderTop: ink.border, padding: "10px 16px", display: "grid", gap: 4, fontSize: 12, color: ink.muted }}>
                <Link href="/app/exam" style={{ color: "inherit", textDecoration: "none" }}>Milestone exam · AI · Pro</Link>
                <span>{m.certificate}</span>
              </footer>
            </section>
          );
        })}
      </div>

      {/* Controls */}
      <div data-ui style={{ position: "absolute", right: 20, bottom: 20, zIndex: 2, display: "flex", alignItems: "center", gap: 2, padding: 4, borderRadius: 10, border: ink.border, background: "var(--dashboard-panel)" }}>
        <button type="button" aria-label="Zoom out" onClick={() => zoomAt(view.k / 1.2)} style={btn}>−</button>
        <span style={{ minWidth: 44, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12 }}>{Math.round(view.k * 100)}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => zoomAt(view.k * 1.2)} style={btn}>+</button>
        <span style={{ width: 1, height: 18, background: "var(--dashboard-border)", margin: "0 4px" }} />
        <button type="button" onClick={fit} style={{ ...btn, width: "auto", padding: "0 10px", fontSize: 13 }}>Fit</button>
        <button type="button" onClick={() => { localStorage.removeItem(KEY); setPos(defaultPos()); setTimeout(fit, 0); }} style={{ ...btn, width: "auto", padding: "0 10px", fontSize: 13 }}>Reset layout</button>
      </div>
      <span data-ui style={{ position: "absolute", left: 24, bottom: 24, fontSize: 12, color: ink.muted, pointerEvents: "none" }}>Drag to pan · ⌘/Ctrl + scroll to zoom · drag a card's header to move it</span>
    </div>
  );
}
