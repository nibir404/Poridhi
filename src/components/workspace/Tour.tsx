"use client";
import { useEffect, useLayoutEffect, useState } from "react";

/**
 * First-run product tour. Spotlights elements marked `data-tour="<id>"`, one step at a time,
 * with Back / Next / Skip. Shown once per `id` (localStorage); "Take the tour" can replay it.
 */
export type TourStep = { target: string; title: string; body: string };

export default function Tour({ id, steps, replay }: { id: string; steps: TourStep[]; replay?: number }) {
  const key = `pd-tour-${id}`;
  const [i, setI] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => { if (!localStorage.getItem(key)) { const t = setTimeout(() => setI(0), 700); return () => clearTimeout(t); } }, [key]);
  useEffect(() => { if (replay) setI(0); }, [replay]);

  useLayoutEffect(() => {
    if (i == null) return;
    // Track the target while the step is open (layouts settle, panes resize, fonts load).
    const place = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${steps[i].target}"]`);
      const r = el?.getBoundingClientRect() ?? null;
      setRect((p) => (p && r && p.x === r.x && p.y === r.y && p.width === r.width && p.height === r.height ? p : r));
    };
    place();
    const t = setInterval(place, 150);
    window.addEventListener("resize", place);
    return () => { clearInterval(t); window.removeEventListener("resize", place); };
  }, [i, steps]);

  useEffect(() => {
    if (i == null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") done(); if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft" && i > 0) setI(i - 1); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  if (i == null) return null;
  const step = steps[i];
  const done = () => { localStorage.setItem(key, "1"); setI(null); };
  const next = () => (i < steps.length - 1 ? setI(i + 1) : done());
  const pad = 6;
  const r = rect ?? new DOMRect(window.innerWidth / 2 - 1, window.innerHeight / 2 - 1, 2, 2);
  const W = 320;
  const below = r.bottom + 180 < window.innerHeight;
  const right = r.left + W + 16 < window.innerWidth;
  const card: React.CSSProperties = {
    position: "fixed", zIndex: 82, width: W,
    left: Math.max(16, Math.min(window.innerWidth - W - 16, right ? r.left : r.right - W)),
    top: below ? r.bottom + pad + 10 : undefined, bottom: below ? undefined : window.innerHeight - r.top + pad + 10,
    padding: 18, borderRadius: 12, background: "var(--dashboard-panel)", color: "var(--dashboard-text)", border: "1px solid var(--dashboard-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,.6)", fontFamily: "var(--font-sans)",
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Tour step ${i + 1} of ${steps.length}: ${step.title}`}>
      {/* Spotlight: one box with a giant shadow dims everything else */}
      <div aria-hidden style={{ position: "fixed", zIndex: 80, left: r.left - pad, top: r.top - pad, width: r.width + pad * 2, height: r.height + pad * 2, borderRadius: 10, boxShadow: "0 0 0 9999px rgba(0,0,0,.62)", outline: "2px solid #B0B3FC", transition: "all .25s cubic-bezier(.2,.7,.2,1)", pointerEvents: "none" }} />
      <div aria-hidden onClick={done} style={{ position: "fixed", inset: 0, zIndex: 79 }} />
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" }}>Tour · {i + 1} of {steps.length}</span>
          <button type="button" onClick={done} style={{ border: 0, background: "transparent", color: "var(--dashboard-muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>Skip tour</button>
        </div>
        <b style={{ fontSize: 16, display: "block", marginBottom: 6 }}>{step.title}</b>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{step.body}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
          <span style={{ display: "flex", gap: 4, flex: 1 }}>{steps.map((_, j) => <span key={j} style={{ width: j === i ? 16 : 6, height: 6, borderRadius: 3, background: j <= i ? "var(--dashboard-text)" : "var(--dashboard-border)", transition: "width .2s" }} />)}</span>
          {i > 0 && <button type="button" onClick={() => setI(i - 1)} style={{ height: 34, padding: "0 12px", borderRadius: 8, border: "1px solid var(--dashboard-border)", background: "transparent", color: "var(--dashboard-text)", cursor: "pointer" }}>Back</button>}
          <button type="button" autoFocus onClick={next} style={{ height: 34, padding: "0 14px", borderRadius: 8, border: 0, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, cursor: "pointer" }}>{i === steps.length - 1 ? "Got it" : "Next"}</button>
        </div>
      </div>
    </div>
  );
}
