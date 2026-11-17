"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import LabRunning from "@/design/app/LabRunning";
import InterviewVoice from "@/design/app/InterviewVoice";
import ExamIDE from "@/design/app/ExamIDE";
import RoadmapMilestone from "@/design/app/RoadmapMilestone";

/** The real product screens from Paper, shown live inside the landing hero. */
const TABS = [
  { key: "lab", label: "Lab in a real VM", icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17", C: LabRunning },
  { key: "interview", label: "AI interview", icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 3v-3a2 2 0 0 1-2-2zM9 9v3M12 7.5v6M15 9v3", C: InterviewVoice },
  { key: "exam", label: "AI exam", icon: "M5 3h14v18H5zM9 8h6M9 12h6M9 16h3", C: ExamIDE },
  { key: "roadmap", label: "Roadmap", icon: "M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6", C: RoadmapMilestone },
] as const;
const ROTATE_MS = 8000;

/** Little "it's alive" touches inside each embedded screen. */
function animateScreen(key: string, root: HTMLElement) {
  const $ = (pid: string) => root.querySelector<HTMLElement>(`[data-pid="${pid}"]`);
  const tweens: gsap.core.Tween[] = [];
  const timers: number[] = [];
  if (key === "lab") {
    const term = $("79I-0");
    if (term) {
      const full = term.innerHTML;
      const lines = full.split("<br>");
      term.innerHTML = "";
      lines.forEach((ln, i) => timers.push(window.setTimeout(() => { term.innerHTML = lines.slice(0, i + 1).join("<br>") + '<span class="pd-caret">▍</span>'; }, 300 + i * 650)));
    }
    const hc = Array.from($("914-0")?.children ?? []) as HTMLElement[];
    hc.forEach((b, i) => tweens.push(gsap.fromTo(b, { opacity: 0.35 }, { opacity: 1, duration: 0.5, repeat: -1, yoyo: true, delay: i * 0.15 })));
  }
  if (key === "interview") {
    const bars = (Array.from($("EAD-0")?.children ?? []) as HTMLElement[]).slice(0, 21);
    bars.forEach((b, i) => { b.style.transformOrigin = "50% 50%"; tweens.push(gsap.to(b, { scaleY: () => 0.3 + Math.random() * 1.2, duration: 0.25 + (i % 5) * 0.05, repeat: -1, yoyo: true, repeatRefresh: true, ease: "sine.inOut" })); });
    const clock = Array.from(root.querySelectorAll("div")).find((d) => d.children.length === 1 && d.firstChild?.textContent?.startsWith("0:48"));
    let s = 48;
    const iv = window.setInterval(() => { s++; if (clock?.firstChild) clock.firstChild.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} `; }, 1000);
    timers.push(iv as unknown as number);
    const nodes = Array.from($("CKV-0")?.children ?? []) as HTMLElement[];
    tweens.push(gsap.fromTo(nodes, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.25, ease: "power2.out" }) as gsap.core.Tween);
  }
  if (key === "exam") {
    const code = $("DD1-0");
    if (code) tweens.push(gsap.fromTo(code, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 2.4, ease: "steps(24)" }));
    const bar = $("D8M-0");
    if (bar) tweens.push(gsap.to(bar, { width: "70%", duration: 8, ease: "none" }));
  }
  return () => { tweens.forEach((t) => t.kill()); timers.forEach((t) => { clearTimeout(t); clearInterval(t); }); };
}

export default function PlatformShowcase({ width }: { width: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const screen = useRef<HTMLDivElement>(null);
  const zoom = width / 1600;

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => setI((v) => (v + 1) % TABS.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [i, paused]);

  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    const id = window.setTimeout(() => { undo = animateScreen(TABS[i].key, el); }, 60);
    let undo = () => {};
    return () => { clearTimeout(id); undo(); };
  }, [i]);

  const T = TABS[i];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} style={{ width, display: "flex", flexDirection: "column", gap: 14 }}>
      <div role="tablist" data-lenis-prevent style={{ display: "flex", gap: 6, alignSelf: "center", maxWidth: "100%", overflowX: "auto", scrollbarWidth: "none", padding: 4, borderRadius: 6, background: "var(--dashboard-panel)", border: "1px solid var(--dashboard-border)", backdropFilter: "blur(10px)" }}>
        {TABS.map((t, k) => (
          <button key={t.key} role="tab" aria-selected={k === i} onClick={() => setI(k)}
            style={{ position: "relative", flexShrink: 0, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 14px", border: 0, borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, color: k === i ? "var(--dashboard-accent-ink)" : "var(--dashboard-text)", background: k === i ? "var(--dashboard-accent)" : "transparent", overflow: "hidden", transition: "background .2s,color .2s" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
            {t.label}
            {k === i && !paused && (
              <motion.span key={`p${i}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "var(--dashboard-accent-ink)", transformOrigin: "0 50%" }} />
            )}
          </button>
        ))}
      </div>
      <div className="pd-glow" style={{ position: "relative", width, height: 960 * zoom, borderRadius: 6, overflow: "hidden", border: "1px solid var(--dashboard-border)", boxShadow: "0 40px 100px -48px rgba(0,0,0,.5)", background: "var(--dashboard-panel)" }}>
        <div key={T.key} ref={screen} className="pd-screen-in" style={{ width: 1600, height: 960, zoom } as React.CSSProperties}>
          <T.C />
        </div>
      </div>
    </div>
  );
}
