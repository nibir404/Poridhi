"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NetworkBackground from "./NetworkBackground";
import PlatformShowcase from "@/components/marketing/PlatformShowcase";
import { startProductDemos } from "./productDemos";

gsap.registerPlugin(ScrollTrigger);

const q = (pid: string) => document.querySelector<HTMLElement>(`[data-pid="${pid}"]`);

/** Behaviour layer for the Home design. Layout stays 1:1 with Paper; this only adds motion. */
export default function HomeInteractions() {
  const [heroCard, setHeroCard] = useState<HTMLElement | null>(null);
  const [stage, setStage] = useState<{ el: HTMLElement; w: number } | null>(null);

  useEffect(() => {
    const card = q("1M4-0");
    if (card) {
      card.style.isolation = "isolate";
      Array.from(card.children).forEach((c) => {
        const el = c as HTMLElement;
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        el.style.zIndex = el.style.zIndex || "1";
      });
      setHeroCard(card);
      const lab = q("1MN-0");
      if (lab) {
        const w = lab.offsetWidth || 1240;
        Array.from(lab.children).forEach((c) => ((c as HTMLElement).style.display = "none"));
        Object.assign(lab.style, { height: "auto", background: "transparent", border: "0", boxShadow: "none", overflow: "visible", padding: "0" });
        setStage({ el: lab, w });
      }
    }

    const ctx = gsap.context(() => {
      // The wavy dither texture is retired; the network grid replaces it.
      const dither = q("1M5-0");
      if (dither) dither.style.display = "none";

      // Hero entrance
      const copy = q("1M6-0");
      if (copy) gsap.fromTo(copy.children, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.08, delay: 0.1 });

      // Lab stage: rise in, then gentle parallax as the page scrolls
      const stage = q("1MM-0");
      if (stage) {
        gsap.fromTo(stage, { y: 80, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: "power3.out", delay: 0.35 });
        gsap.to(stage, { yPercent: -6, ease: "none", scrollTrigger: { trigger: stage, start: "top 80%", end: "bottom top", scrub: true } });
      }
      // Floating proof cards bob and pop in
      ["1OS-0","1OZ-0","1P6-0"].forEach((id) => { const f = q(id); if (f) f.style.display = "none"; });
      ["1OS-0", "1P6-0"].forEach((pid, i) => {
        const f = q(pid);
        if (!f) return;
        gsap.fromTo(f, { y: 24, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)", delay: 0.9 + i * 0.25 });
        gsap.to(f, { y: "+=8", duration: 2.4 + i * 0.4, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.6 + i * 0.2 });
      });
    });

    const undoLab = () => {};
    const undoDemos = startProductDemos();
    const undo = () => { undoLab(); undoDemos(); };

    return () => {
      ctx.revert();
      undo();
    };
  }, []);

  return (
    <>
      {heroCard && createPortal(<NetworkBackground className="pointer-events-none absolute inset-0" />, heroCard)}
      {stage && createPortal(<PlatformShowcase width={stage.w} />, stage.el)}
    </>
  );
}
