"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Refresh / first-load screen. An animated dither texture fills the window and the Poridhi logo is
 * rebuilt from ordered-dither dots (Bayer 4×4) that sweep in, then the screen dissolves away.
 * Lives in the root layout, so it shows on a full load only, never on client-side navigation.
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

export default function BootLoader() {
  const [phase, setPhase] = useState<"on" | "out" | "gone">("on");
  const canvas = useRef<HTMLCanvasElement>(null);

  // Dissolve once the page is ready (min 900 ms so the animation reads, max 4 s as a safety net).
  useEffect(() => {
    const start = performance.now();
    const finish = () => { const wait = Math.max(0, 900 - (performance.now() - start)); setTimeout(() => setPhase("out"), wait); };
    const ready = () => (document.fonts?.ready ?? Promise.resolve()).then(finish);
    if (document.readyState === "complete") ready(); else window.addEventListener("load", ready, { once: true });
    const safety = setTimeout(() => setPhase("out"), 4000);
    return () => { clearTimeout(safety); window.removeEventListener("load", ready); };
  }, []);
  useEffect(() => { if (phase === "out") { const t = setTimeout(() => setPhase("gone"), 520); return () => clearTimeout(t); } }, [phase]);

  // Dithered logo.
  useEffect(() => {
    const cv = canvas.current; if (!cv) return;
    const dark = document.documentElement.dataset.theme !== "light";
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--dashboard-text").trim() || (dark ? "#fff" : "#000");
    const img = new Image(); img.src = "/assets/poridhi-logo.png";
    let raf = 0, alive = true;
    img.onload = () => {
      if (!alive) return;
      const S = 2, CELL = 3; // logo drawn at 2× then sampled every 3 px
      const W = img.width * S, H = img.height * S;
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!; o.imageSmoothingEnabled = true; o.drawImage(img, 0, 0, W, H);
      const px = o.getImageData(0, 0, W, H).data;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      const c = cv.getContext("2d")!; c.scale(dpr, dpr);
      type Dot = { x: number; y: number; a: number; col: string; t: number };
      const dots: Dot[] = [];
      for (let y = 0; y < H; y += CELL) for (let x = 0; x < W; x += CELL) {
        const i = (y * W + x) * 4, a = px[i + 3] / 255;
        if (a < 0.08) continue;
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const warm = r > 140 || (r > 90 && b > 110 && r > g + 40); // the coloured ring keeps its colour
        dots.push({ x, y, a, col: warm ? `rgb(${r},${g},${b})` : ink, t: BAYER[((y / CELL) % 4) * 4 + ((x / CELL) % 4)] });
      }
      const t0 = performance.now();
      const draw = (now: number) => {
        const k = (now - t0) / 1000;
        c.clearRect(0, 0, W, H);
        for (const d of dots) {
          // A diagonal sweep reveals dots in Bayer order; afterwards a soft shimmer keeps it alive.
          const sweep = (k * 1.4 - (d.x / W) * 0.8 - (d.y / H) * 0.2);
          const on = sweep > d.t * 0.6;
          if (!on) continue;
          const shimmer = 0.75 + 0.25 * Math.sin(k * 4 + d.x * 0.05 + d.y * 0.08);
          const r = (CELL / 2) * Math.min(1, d.a * 1.15) * shimmer;
          if (d.a * shimmer < d.t * 0.9) continue; // ordered dither: thin areas stay sparse
          c.fillStyle = d.col; c.beginPath(); c.arc(d.x + CELL / 2, d.y + CELL / 2, r, 0, Math.PI * 2); c.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    };
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className={`pd-boot-loader${phase === "out" ? " is-out" : ""}`} role="status" aria-live="polite" aria-label="Loading Poridhi">
      <div className="pd-boot-tex" aria-hidden />
      <div className="pd-boot-center">
        <canvas ref={canvas} aria-hidden />
        <div className="pd-boot-bar" aria-hidden><span /></div>
      </div>
    </div>
  );
}
