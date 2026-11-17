"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Opts = {
  /** Section layers that fade/slide up when scrolled into view. */
  sections?: string[];
  /** Containers whose direct children are cards: staggered reveal + hover lift + dither hover. */
  cardGroups?: string[];
  /** Container whose big numbers count up on first view. */
  countUp?: string;
  /** Nav layer to make sticky with a blurred background once scrolled. */
  stickyNav?: string;
};

const q = (pid: string) => document.querySelector<HTMLElement>(`[data-pid="${pid}"]`);

/** Shared, design-safe motion: never changes layout, only transforms/opacity. */
export function enhancePage({ sections = [], cardGroups = [], countUp, stickyNav }: Opts) {
  const cleanups: (() => void)[] = [];
  const ctx = gsap.context(() => {
    sections.forEach((pid) => {
      const el = q(pid);
      if (!el) return;
      gsap.fromTo(el, { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });

    cardGroups.forEach((pid) => {
      const group = q(pid);
      if (!group) return;
      const cards = Array.from(group.children) as HTMLElement[];
      cards.forEach((c) => c.classList.add("pd-hover-lift", "pd-dither-hover"));
    });

    if (countUp) {
      const box = q(countUp);
      box?.querySelectorAll<HTMLElement>("div").forEach((d) => {
        if (d.children.length) return;
        const txt = d.textContent?.trim() ?? "";
        const m = txt.match(/^([\d,]+)(\+|%| h| min)?$/);
        if (!m) return;
        const target = Number(m[1].replace(/,/g, ""));
        const suffix = m[2] ?? "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.6, ease: "power2.out",
          scrollTrigger: { trigger: box, start: "top 90%", once: true },
          onUpdate: () => { d.textContent = Math.round(obj.v).toLocaleString("en-US") + suffix; },
        });
      });
    }
  });

  if (stickyNav) {
    const nav = q(stickyNav);
    if (nav) {
      Object.assign(nav.style, { position: "sticky", top: "0px", zIndex: "50", transition: "background-color .3s, box-shadow .3s, backdrop-filter .3s" });
      const onScroll = () => {
        const on = window.scrollY > 8;
        nav.style.backgroundColor = on ? "rgba(255,255,255,0.82)" : "";
        nav.style.backdropFilter = on ? "saturate(1.4) blur(12px)" : "";
        nav.style.boxShadow = on ? "0 1px 0 var(--color-line)" : "";
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }
  }

  // Primary buttons (accent-filled): steady on hover, only a slight brightness change.
  document.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    const bg = el.style.backgroundColor;
    if (!/--color-accent\)|#BFC2FF|#B0B3FC/i.test(bg) || el.offsetHeight > 48) return;
    el.style.cursor = "pointer";
    el.style.transition = "filter .2s";
    const move = () => {};
    const leave = () => {};
    const enter = () => (el.style.filter = "brightness(1.04)");
    const out = () => (el.style.filter = "");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", out);
    cleanups.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", out);
    });
  });

  ScrollTrigger.refresh();
  return () => {
    ctx.revert();
    cleanups.forEach((f) => f());
  };
}
