"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { reflow, REFLOW_BELOW } from "./reflow";

type Mode = "fluid" | "scale" | "reflow";

/**
 * Renders a Paper artboard.
 * - Wider than the design: full width. Layers drawn at the full artboard width stretch to 100%,
 *   so backgrounds and app columns fill the screen while inner content keeps its design size.
 * - 1024px up to the design width: uniform scale, pixel-identical to the design.
 * - Below 1024px: no scaling; the layout is reflowed into a fluid column (see reflow.ts).
 */
export default function DesignFrame({ width = 1440, children }: { width?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode | null>(null);

  useLayoutEffect(() => {
    const pick = () => {
      const vw = document.documentElement.clientWidth;
      const m: Mode = vw < REFLOW_BELOW ? "reflow" : vw > width ? "fluid" : "scale";
      setMode((cur) => {
        // Reflow rewrites inline styles, so crossing into or out of it starts from a clean render.
        if (cur && cur !== m && (cur === "reflow" || m === "reflow")) window.location.reload();
        return m;
      });
      ref.current?.style.setProperty("--pd-scale", String(Math.min(1, vw / width)));
    };
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, [width]);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el || !mode) return;
    if (mode === "reflow") { reflow(el); return; }
    // Stretch every layer that spans the whole artboard; restore when back in scale mode.
    const full = Array.from(el.querySelectorAll<HTMLElement>("[data-pid]")).filter((n) => n.style.width === `${width}px` || n.dataset.pdFull);
    full.forEach((n) => {
      n.dataset.pdFull = "1";
      n.style.width = mode === "fluid" ? "100%" : `${width}px`;
    });
    // Fill the window height: artboards are drawn at a fixed height (e.g. 960px), so on taller
    // windows the page would stop half way. Grow the artboard (its main row is flex-grow) instead.
    const root = el.querySelector<HTMLElement>("[data-pid]");
    if (!root) return;
    const fill = () => {
      if (root.dataset.pdLocked) return; // a screen that sizes itself to the window (lab workspace)
      const zoom = mode === "scale" ? Math.min(1, document.documentElement.clientWidth / width) : 1;
      if (/^\d+px$/.test(root.style.height)) { root.dataset.pdH = root.style.height; root.style.height = "auto"; }
      root.style.minHeight = `max(${root.dataset.pdH ?? "0px"}, ${Math.ceil(window.innerHeight / zoom)}px)`;
    };
    fill();
    window.addEventListener("resize", fill);
    return () => window.removeEventListener("resize", fill);
  }, [mode, width]);

  const style: React.CSSProperties =
    mode === "reflow" || mode === "fluid"
      ? { width: "100%" }
      : ({ width, margin: "0 auto", zoom: "var(--pd-scale, 1)" } as unknown as React.CSSProperties);
  return (
    <div ref={ref} className={`pd-frame${mode === "reflow" ? " pd-reflow" : ""}`} style={{ width: "100%", overflowX: "clip" }}>
      <div ref={inner} style={style}>{children}</div>
    </div>
  );
}
