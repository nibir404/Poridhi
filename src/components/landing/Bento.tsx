"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import LabRunning from "@/design/app/LabRunning";
import InterviewWhiteboard from "@/design/app/InterviewWhiteboard";
import ExamIDE from "@/design/app/ExamIDE";
import RoadmapAll from "@/design/app/RoadmapAll";
import MeTimeBank from "@/design/app/MeTimeBank";
import { bindRecolor } from "@/components/theme/recolor";
import { getTheme } from "@/components/theme/theme";

/**
 * Feature bento built from the real product: each card shows a crop of an actual Poridhi screen
 * (a 1600px Paper artboard, scaled and positioned), with a floating UI chip on top.
 */
type Crop = { x: number; y: number; scale: number };

function Screen({ C, crop }: { C: React.ComponentType; crop: Crop }) {
  return (
    <div aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 960, transformOrigin: "0 0", transform: `scale(${crop.scale}) translate(${-crop.x}px, ${-crop.y}px)`, pointerEvents: "none" }}>
      <C />
    </div>
  );
}

const Chip = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span className="pd-chip" style={{ position: "absolute", display: "inline-flex", alignItems: "center", gap: 8, height: 34, padding: "0 12px", borderRadius: 8, background: "color-mix(in srgb, var(--dashboard-panel) 88%, transparent)", border: "1px solid var(--dashboard-border)", backdropFilter: "blur(8px)", boxShadow: "0 12px 28px -14px rgba(0,0,0,.5)", font: "500 13px/1 var(--font-sans)", color: "var(--dashboard-text)", ...style }}>{children}</span>
);
const Tick = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dashboard-success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 12l4 4 8-8" /></svg>;
const Cursor = ({ style, label = "YOU" }: { style?: React.CSSProperties; label?: string }) => (
  <span aria-hidden className="pd-cursor" style={{ position: "absolute", display: "inline-flex", alignItems: "flex-start", gap: 2, ...style }}>
    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z" fill="var(--dashboard-text)" stroke="var(--dashboard-main)" strokeWidth="1.5" strokeLinejoin="round" /></svg>
    <span style={{ font: "600 11px/1 var(--font-mono)", padding: "3px 6px", borderRadius: 4, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", marginTop: 12 }}>{label}</span>
  </span>
);

const cards: { title: string; body: string; href: string; C: React.ComponentType; crop: Crop; span: number; chips: React.ReactNode }[] = [
  {
    title: "Labs in a real VM", body: "A fresh Ubuntu machine with VS Code, terminals and a load balancer. Every step is checked inside the VM.", href: "/app/lab/launch",
    C: LabRunning, crop: { x: 640, y: 60, scale: 0.62 }, span: 2,
    chips: (<><Chip style={{ left: 22, bottom: 92 }}><Tick /> Check 2 of 4 passed</Chip><Cursor style={{ left: "58%", bottom: 70 }} /></>),
  },
  {
    title: "AI interview", body: "An interviewer that listens. Voice, whiteboard and terminal, scored per stage.", href: "/app/interview",
    C: InterviewWhiteboard, crop: { x: 420, y: 60, scale: 0.5 }, span: 2,
    chips: (<Chip style={{ right: 18, top: 18 }}>Hire signal · <b style={{ color: "var(--dashboard-success)" }}>Lean hire</b></Chip>),
  },
  {
    title: "AI exam", body: "Ten hands-on tasks in a cloud IDE, graded by AI. Best attempt counts.", href: "/app/exam",
    C: ExamIDE, crop: { x: 560, y: 70, scale: 0.5 }, span: 2,
    chips: (<Chip style={{ left: 18, bottom: 92 }}>Q4 graded · <b style={{ color: "var(--dashboard-success)" }}>85 / 100</b></Chip>),
  },
  {
    title: "A roadmap that moves with you", body: "Six milestones, every module with a story and outcomes. Pick up exactly where you left off.", href: "/app/roadmap",
    C: RoadmapAll, crop: { x: 20, y: 70, scale: 0.56 }, span: 3,
    chips: (<><Chip style={{ right: 20, top: 20 }}>Milestone 1 · <b style={{ color: "var(--dashboard-accent)" }}>34%</b></Chip><Cursor style={{ left: "32%", top: "46%" }} /></>),
  },
  {
    title: "Earn your time back", body: "VM time counts only while a lab runs. Pass milestones or redeem coins for more.", href: "/app/me/time-bank",
    C: MeTimeBank, crop: { x: 300, y: 70, scale: 0.56 }, span: 3,
    chips: (<Chip style={{ left: 20, bottom: 92 }}><Tick /> +2h added · 1,000 coins redeemed</Chip>),
  },
];

export default function Bento() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => (host.current ? bindRecolor(host.current, getTheme) : undefined), []);
  return (
    <div ref={host} className="pd-bento" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
      {cards.map((c) => (
        <Link key={c.title} href={c.href} className="pd-l-card pd-reveal" style={{ gridColumn: `span ${c.span}`, position: "relative", display: "block", height: 420, borderRadius: 16, overflow: "hidden", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", color: "var(--dashboard-text)", textDecoration: "none", isolation: "isolate" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <Screen C={c.C} crop={c.crop} />
            {/* fade into the card so the copy stays readable */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, var(--dashboard-panel) 82%)" }} />
          </div>
          {c.chips}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 24, display: "grid", gap: 6 }}>
            <h3 style={{ margin: 0, font: "500 22px/1.2 var(--font-sans)", letterSpacing: "-.01em" }}>{c.title}</h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "var(--dashboard-muted)", maxWidth: 520 }}>{c.body}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
