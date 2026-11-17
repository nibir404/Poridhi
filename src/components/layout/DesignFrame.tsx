"use client";
import { useEffect, useRef } from "react";

/**
 * Renders a Paper artboard at its design width and scales it to the viewport.
 * ≥ design width: natural size, centered. Narrower: uniform scale so the
 * layout stays pixel-identical to the design on every screen.
 */
export default function DesignFrame({ width = 1440, children }: { width?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const vw = document.documentElement.clientWidth;
      const s = Math.min(1, vw / width);
      el.style.setProperty("--pd-scale", String(s));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [width]);
  return (
    <div ref={ref} className="pd-frame" style={{ width: "100%", overflowX: "clip" }}>
      <div style={{ width, margin: "0 auto", zoom: "var(--pd-scale, 1)" as unknown as number }}>{children}</div>
    </div>
  );
}
