"use client";
import { useEffect, useRef } from "react";

/**
 * Halftone dot-matrix shader (canvas 2D). Dots on a fixed grid; each dot's size comes from
 * animated value noise, gated by a slow blocky mask, so patches of dither form, dissolve and
 * drift. Colour follows the theme text token. Paused off-screen, static with reduced motion.
 */
export default function DotField({ className, gap = 9, density = 0.62 }: { className?: string; gap?: number; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true, color = "#000";
    const perm = new Uint8Array(512);
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
    const fade = (t: number) => t * t * (3 - 2 * t);
    const hash = (x: number, y: number) => perm[(perm[x & 255] + y) & 511] / 255;
    const noise = (x: number, y: number) => {
      const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      const u = fade(xf), v = fade(yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
    const readColor = () => { color = getComputedStyle(document.documentElement).getPropertyValue("--dashboard-text").trim() || "#000"; };
    const resize = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (t: number) => {
      raf = 0;
      const time = reduce ? 0 : t * 0.00012;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const cols = Math.ceil(w / gap), rows = Math.ceil(h / gap);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        // Blocky mask: coarse cells switch on and off slowly.
        const block = noise(Math.floor(c / 7) * 0.9 + time * 2, Math.floor(r / 5) * 0.9 - time);
        if (block < 1 - density) continue;
        const n = noise(c * 0.18 + time * 6, r * 0.18 - time * 4);
        const s = Math.max(0, (n - 0.32) * 1.6) * (block - (1 - density)) / density;
        if (s < 0.08) continue;
        ctx.globalAlpha = Math.min(1, 0.25 + s);
        ctx.beginPath();
        ctx.arc(c * gap + gap / 2, r * gap + gap / 2, Math.min(gap * 0.42, 0.6 + s * gap * 0.42), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };
    readColor(); resize(); draw(performance.now());
    const onTheme = () => { setTimeout(() => { readColor(); if (!raf) raf = requestAnimationFrame(draw); }, 30); };
    window.addEventListener("pd-theme", onTheme);
    const ro = new ResizeObserver(() => { resize(); if (!raf) raf = requestAnimationFrame(draw); }); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduce) raf = requestAnimationFrame(draw); }); io.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pd-theme", onTheme); };
  }, [gap, density]);
  return <canvas ref={ref} className={className} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />;
}
