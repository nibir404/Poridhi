"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const $ = (pid: string) => document.querySelector<HTMLElement>(`[data-pid="${pid}"]`);

/**
 * "Inside Poridhi" roadmap module: rows highlight on hover, the current row's
 * action completes the step, the reward toast pops and the counter advances.
 */
function roadmapDemo() {
  const rows = ["19Z-0", "1A9-0", "1AJ-0", "1AT-0"].map($).filter(Boolean) as HTMLElement[];
  const counter = $("19Y-0");
  const toast = $("1B5-0");
  const cert = $("1BE-0");
  const action = $("1AH-0");
  const cleanups: (() => void)[] = [];

  rows.forEach((r) => {
    r.style.transition = "background-color .25s, transform .25s";
    const enter = () => { r.style.backgroundColor = "var(--color-white-100)"; r.style.transform = "translateX(4px)"; };
    const leave = () => { r.style.backgroundColor = ""; r.style.transform = ""; };
    r.addEventListener("pointerenter", enter);
    r.addEventListener("pointerleave", leave);
    cleanups.push(() => { r.removeEventListener("pointerenter", enter); r.removeEventListener("pointerleave", leave); });
  });

  let done = 2;
  const complete = () => {
    if (done >= 4) done = 1;
    done++;
    if (counter) counter.textContent = `${done} of 4`;
    if (toast) gsap.fromTo(toast, { y: 18, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" });
    if (cert && done === 4) gsap.fromTo(cert, { rotateY: -14, scale: 0.96 }, { rotateY: 0, scale: 1, duration: 0.9, ease: "elastic.out(1,0.6)" });
  };
  if (action) {
    action.style.cursor = "pointer";
    action.addEventListener("click", complete);
    cleanups.push(() => action.removeEventListener("click", complete));
  }

  // Certificate tilts toward the pointer.
  if (cert) {
    cert.style.transformStyle = "preserve-3d";
    const move = (e: PointerEvent) => {
      const r = cert.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(cert, { rotateY: x * 10, rotateX: -y * 8, transformPerspective: 900, duration: 0.4, ease: "power2.out" });
    };
    const leave = () => gsap.to(cert, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
    cert.addEventListener("pointermove", move);
    cert.addEventListener("pointerleave", leave);
    cleanups.push(() => { cert.removeEventListener("pointermove", move); cert.removeEventListener("pointerleave", leave); });
  }
  return () => cleanups.forEach((f) => f());
}

/**
 * AI interview card: the voice waveform moves like live audio and the
 * whiteboard architecture redraws itself whenever it scrolls into view.
 */
function interviewDemo() {
  const wave = $("1DT-0");
  const board = $("1EH-0");
  const tweens: gsap.core.Tween[] = [];
  if (wave) {
    Array.from(wave.children).forEach((bar, i) => {
      const el = bar as HTMLElement;
      el.style.transformOrigin = "50% 50%";
      tweens.push(gsap.to(el, { scaleY: () => 0.25 + Math.random() * 1.1, duration: 0.28 + (i % 4) * 0.07, repeat: -1, yoyo: true, repeatRefresh: true, ease: "sine.inOut" }));
    });
  }
  let st: ScrollTrigger | undefined;
  const svg = board?.querySelector("svg");
  if (svg) {
    const shapes = Array.from(svg.querySelectorAll<SVGGeometryElement>("path, rect, circle, line, polyline"));
    shapes.forEach((s) => {
      const len = typeof s.getTotalLength === "function" ? s.getTotalLength() : 400;
      s.style.strokeDasharray = `${len}`;
      s.style.strokeDashoffset = `${len}`;
    });
    const tl = gsap.timeline({ paused: true });
    tl.to(shapes, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.12 });
    st = ScrollTrigger.create({ trigger: board!, start: "top 80%", onEnter: () => tl.restart(), onEnterBack: () => tl.restart() });
  }
  return () => {
    tweens.forEach((t) => t.kill());
    st?.kill();
  };
}

export function startProductDemos() {
  const a = roadmapDemo();
  const b = interviewDemo();
  return () => { a(); b(); };
}
