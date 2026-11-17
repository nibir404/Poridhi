"use client";
import { useEffect, useRef } from "react";

/**
 * Hero background: a quiet grid of network nodes. Small packets of light travel along the grid
 * lines between nodes and briefly light up the node they reach, like traffic moving through a
 * cluster. Canvas 2D, DPR-aware, paused off-screen, static under prefers-reduced-motion.
 */
type Packet = { x: number; y: number; dx: number; dy: number; left: number; hue: number };

export default function NetworkBackground({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const GAP = 56; // grid spacing in CSS px
    let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, raf = 0, visible = true, last = 0;
    let glow = new Float32Array(0); // per-node brightness, decays
    const packets: Packet[] = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
      glow = new Float32Array(cols * rows);
    };
    const spawn = () => {
      const horizontal = Math.random() < 0.5;
      const c = Math.floor(Math.random() * cols), r = Math.floor(Math.random() * rows);
      const dir = Math.random() < 0.5 ? -1 : 1;
      packets.push({ x: c * GAP, y: r * GAP, dx: horizontal ? dir : 0, dy: horizontal ? 0 : dir, left: GAP * (2 + Math.floor(Math.random() * 5)), hue: Math.random() < 0.18 ? 18 : 238 });
    };

    const draw = (t: number) => {
      raf = 0;
      const dt = Math.min(48, t - (last || t)); last = t;
      ctx.clearRect(0, 0, w, h);
      // Grid lines, fading towards the edges.
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "rgba(191,194,255,0.10)"); grad.addColorStop(1, "rgba(191,194,255,0.02)");
      ctx.strokeStyle = grad; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c < cols; c++) { ctx.moveTo(c * GAP + 0.5, 0); ctx.lineTo(c * GAP + 0.5, h); }
      for (let r = 0; r < rows; r++) { ctx.moveTo(0, r * GAP + 0.5); ctx.lineTo(w, r * GAP + 0.5); }
      ctx.stroke();
      // Nodes.
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, g = glow[i];
        glow[i] = Math.max(0, g - dt * 0.0012);
        ctx.fillStyle = `rgba(191,194,255,${0.16 + g * 0.7})`;
        ctx.beginPath(); ctx.arc(c * GAP, r * GAP, 1.4 + g * 2.2, 0, Math.PI * 2); ctx.fill();
      }
      // Packets with a short tail.
      if (!reduce && packets.length < Math.max(6, Math.floor((cols * rows) / 60)) && Math.random() < 0.06) spawn();
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k];
        const step = reduce ? 0 : dt * 0.09;
        p.x += p.dx * step; p.y += p.dy * step; p.left -= step;
        const tail = 28;
        const g2 = ctx.createLinearGradient(p.x - p.dx * tail, p.y - p.dy * tail, p.x, p.y);
        const col = p.hue === 18 ? "240,89,42" : "191,194,255";
        g2.addColorStop(0, `rgba(${col},0)`); g2.addColorStop(1, `rgba(${col},0.85)`);
        ctx.strokeStyle = g2; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p.x - p.dx * tail, p.y - p.dy * tail); ctx.lineTo(p.x, p.y); ctx.stroke();
        // Reaching a node lights it.
        const c = Math.round(p.x / GAP), r = Math.round(p.y / GAP);
        if (Math.abs(p.x - c * GAP) < step + 0.5 && Math.abs(p.y - r * GAP) < step + 0.5 && c >= 0 && r >= 0 && c < cols && r < rows) glow[r * cols + c] = 1;
        if (p.left <= 0 || p.x < -GAP || p.y < -GAP || p.x > w + GAP || p.y > h + GAP) packets.splice(k, 1);
      }
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    if (reduce) for (let i = 0; i < 8; i++) spawn();
    draw(performance.now());
    const ro = new ResizeObserver(() => { resize(); if (!raf) raf = requestAnimationFrame(draw); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduce) raf = requestAnimationFrame(draw); });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden style={{ width: "100%", height: "100%", display: "block" }} />;
}
