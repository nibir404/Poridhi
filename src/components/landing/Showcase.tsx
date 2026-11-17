"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LabRunning from "@/design/app/LabRunning";
import InterviewWhiteboard from "@/design/app/InterviewWhiteboard";
import ExamIDE from "@/design/app/ExamIDE";
import RoadmapAll from "@/design/app/RoadmapAll";
import MeTimeBank from "@/design/app/MeTimeBank";
import { bindRecolor } from "@/components/theme/recolor";
import { getTheme } from "@/components/theme/theme";
import { MINIS } from "./Minis";
import { Arrow, Badge, Button, Card, Check, Icon, Reveal, S, SectionHead, WIDTH, eyebrow, mono } from "./ui";

/* ---------------- Read. Launch. Pass. ---------------- */
export function Steps() {
  const step = (n: string, t: string, d: string, visual: React.ReactNode, i: number) => (
    <Reveal key={n} delay={i * 0.05}>
      <Card pad={0} style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 196, padding: S(5), borderBottom: "1px solid var(--dashboard-border)", backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: "14px 14px", display: "grid", placeItems: "center" }}>{visual}</div>
        <div style={{ padding: S(6), display: "grid", gap: S(2) }}>
          <span style={{ ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>{n}</span>
          <h3 style={{ margin: 0, font: "500 20px/1.25 var(--font-sans)", letterSpacing: "-.01em" }}>{t}</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{d}</p>
        </div>
      </Card>
    </Reveal>
  );
  const mini: React.CSSProperties = { width: "100%", maxWidth: 300, borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-main)", padding: S(4), display: "grid", gap: S(2), fontSize: 13 };
  return (
    <section style={{ width: WIDTH, margin: `${S(32)}px auto 0` }}>
      <SectionHead k="How it works" title="Read. Launch. Pass." body="Three steps from a free lesson to a verified skill. No setup, no local installs." />
      <div className="pd-l-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: S(4), marginTop: S(10) }}>
        {step("01", "Read the guide, free", "Every track, class and lab guide is open. No account needed to start learning.", (
          <div style={mini}>
            <span style={eyebrow}>Lab guide · 4 steps</span>
            <b style={{ fontSize: 14 }}>Expose a container with a load balancer</b>
            {["Run nginx in the background", "Map the port", "Publish via the LB"].map((x, i) => <span key={x} style={{ display: "flex", gap: S(2), color: i < 2 ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}><span style={{ ...mono }}>{i + 1}.</span>{x}</span>)}
          </div>
        ), 0)}
        {step("02", "Launch a real VM", "A fresh Ubuntu machine with VS Code and terminals in about 30 seconds.", (
          <div style={mini}>
            <span style={{ display: "flex", justifyContent: "space-between" }}><b style={{ fontSize: 14 }}>lab-01</b><Badge tone="success">Live</Badge></span>
            <span style={{ ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>ubuntu-22.04 · 2 vCPU · 4 GB</span>
            <div style={{ height: 6, borderRadius: 999, background: "var(--dashboard-border)", overflow: "hidden" }}><div className="pd-boot" style={{ height: "100%", background: "var(--dashboard-text)" }} /></div>
            <span style={{ ...mono, fontSize: 12 }}>Booted in 28s</span>
          </div>
        ), 1)}
        {step("03", "Pass the checks", "Each step is verified inside the machine. Pass the milestone exam for a certificate.", (
          <div style={mini}>
            {["nginx is running", "Port 8080 answers", "Public URL answers"].map((x) => <span key={x} style={{ display: "flex", alignItems: "center", gap: S(2) }}><Check />{x}</span>)}
            <span style={{ display: "flex", justifyContent: "space-between", paddingTop: S(2), borderTop: "1px solid var(--dashboard-border)" }}><span>Certificate</span><Badge tone="accent">+300 coins</Badge></span>
          </div>
        ), 2)}
      </div>
    </section>
  );
}

/* ---------------- Tabbed feature showcase ---------------- */
type Crop = { x: number; y: number; scale: number };
const TABS: { k: string; t: string; d: string; href: string; C: React.ComponentType; crop: Crop; points: string[] }[] = [
  { k: "Labs", t: "Real VMs with every tool ready", d: "Ubuntu, VS Code, terminals, a load balancer and a cloud tray. Steps are checked inside the machine.", href: "/app/lab/launch", C: LabRunning, crop: { x: 0, y: 0, scale: 0.62 }, points: ["Boots in about 30 seconds", "Time counts only while the VM runs", "Checks run inside the VM"] },
  { k: "AI interview", t: "Rehearse with an interviewer that listens", d: "Voice or text, a whiteboard and a terminal. Scored per stage with a hire signal.", href: "/app/interview", C: InterviewWhiteboard, crop: { x: 0, y: 0, scale: 0.62 }, points: ["Five stages, requirements to wrap-up", "Feedback on every answer", "Retry any stage"] },
  { k: "AI exam", t: "Hands-on exams, graded by AI", d: "Ten real tasks in a cloud IDE. The best attempt counts toward your certificate.", href: "/app/exam", C: ExamIDE, crop: { x: 0, y: 0, scale: 0.62 }, points: ["Rubric shown before you start", "Five attempts per milestone", "Verified certificate on pass"] },
  { k: "Roadmap", t: "One roadmap from Linux to GitOps", d: "Six milestones, every module with a story and outcomes. Pick up exactly where you left off.", href: "/app/roadmap", C: RoadmapAll, crop: { x: 0, y: 0, scale: 0.62 }, points: ["Milestones, modules and items", "Progress synced across devices", "Jump straight to your next step"] },
  { k: "Time bank", t: "Your progress pays for your practice", d: "Lab minutes are the only thing that costs anything. Earn them back by passing milestones.", href: "/app/me/time-bank", C: MeTimeBank, crop: { x: 0, y: 0, scale: 0.62 }, points: ["Pro adds 40 hours a month", "Milestones add 3 hours", "1,000 coins = 2 hours"] },
];
export function FeatureTabs() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => (host.current ? bindRecolor(host.current, getTheme) : undefined), []);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((v) => (v + 1) % TABS.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused]);
  const T = TABS[i];
  return (
    <section style={{ width: WIDTH, margin: `${S(32)}px auto 0` }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <SectionHead k="The platform" title="Practise every skill with zero setup." body="Labs, interviews, exams and your roadmap live in one place, built on the same machines you will use at work." />
      <div className="pd-tabs" style={{ display: "grid", gridTemplateColumns: "minmax(0, .8fr) minmax(0, 1.6fr)", gap: S(6), marginTop: S(10), alignItems: "start" }}>
        <div role="tablist" aria-label="Platform features" style={{ display: "grid", gap: S(2) }}>
          {TABS.map((t, k) => {
            const on = k === i;
            return (
              <button key={t.k} role="tab" aria-selected={on} onClick={() => setI(k)} style={{ position: "relative", textAlign: "left", padding: S(5), borderRadius: "var(--puku-radius-panel)", border: `1px solid ${on ? "var(--dashboard-text)" : "var(--dashboard-border)"}`, background: on ? "var(--dashboard-panel)" : "transparent", color: "var(--dashboard-text)", cursor: "pointer", overflow: "hidden", fontFamily: "var(--font-sans)" }}>
                <span style={{ ...eyebrow, color: on ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}>{t.k}</span>
                <span style={{ display: "block", marginTop: S(2), font: "500 17px/1.3 var(--font-sans)" }}>{t.t}</span>
                {on && <span style={{ display: "block", marginTop: S(2), fontSize: 14, lineHeight: 1.5, color: "var(--dashboard-muted)" }}>{t.d}</span>}
                {on && !paused && <span key={i} className="pd-tabbar" aria-hidden style={{ position: "absolute", left: 0, bottom: 0, height: 2, background: "var(--dashboard-text)" }} />}
              </button>
            );
          })}
        </div>
        <div ref={host} style={{ display: "grid", gap: S(4) }}>
          <Link href={T.href} aria-label={`Open ${T.k} in the app`} key={T.k} className="pd-screen-in pd-live-screen" style={{ display: "block", position: "relative", height: 520, borderRadius: "var(--puku-radius-panel)", overflow: "hidden", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-main)", boxShadow: "0 32px 64px -40px rgba(0,0,0,.45)" }}>
            <div aria-hidden style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 960, transformOrigin: "0 0", transform: `scale(${T.crop.scale}) translate(${-T.crop.x}px, ${-T.crop.y}px)`, pointerEvents: "none" }}><T.C /></div>
            <span className="pd-live-cta" style={{ position: "absolute", right: S(4), bottom: S(4), display: "inline-flex", alignItems: "center", gap: S(2), height: 36, padding: `0 ${S(3)}px`, borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", font: "600 13px/1 var(--font-sans)" }}>Open the real {T.k.toLowerCase()} <Arrow /></span>
          </Link>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: S(5) }}>
            {T.points.map((p) => <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: S(2), fontSize: 14 }}><Check color="var(--dashboard-text)" />{p}</span>)}
            <span style={{ marginLeft: "auto" }}><Button href={T.href} variant="outline" size="sm">Open {T.k.toLowerCase()} <Arrow /></Button></span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Capability and proof grids ---------------- */
function Grid({ k, title, body, items }: { k: string; title: string; body: string; items: { t: string; d: string; i: string }[] }) {
  return (
    <section style={{ width: WIDTH, margin: `${S(32)}px auto 0` }}>
      <SectionHead k={k} title={title} body={body} />
      <div className="pd-l-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", marginTop: S(10), borderTop: "1px solid var(--dashboard-border)", borderLeft: "1px solid var(--dashboard-border)" }}>
        {items.map((x, n) => (
          <Reveal key={x.t} delay={(n % 4) * 0.03}>
            <div style={{ height: "100%", padding: S(6), borderRight: "1px solid var(--dashboard-border)", borderBottom: "1px solid var(--dashboard-border)", display: "grid", gap: S(3), alignContent: "start" }}>
              <div style={{ minHeight: 108, display: "grid", alignItems: "center", padding: S(3), borderRadius: "var(--puku-radius-panel)", background: "var(--dashboard-sidebar)", backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: "12px 12px" }}>{MINIS[x.t]}</div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: S(2), color: "var(--dashboard-muted)" }}><Icon d={x.i} size={16} /></span>
              <h3 style={{ margin: 0, font: "500 16px/1.3 var(--font-sans)" }}>{x.t}</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{x.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
export const Capabilities = () => (
  <Grid k="Inside every lab" title="Everything a lab needs, built in." body="No local Docker, no cloud account, no setup scripts. Open a lab and the whole environment is there." items={[
    { t: "VS Code in the browser", d: "A full IDE on the VM, with your files and extensions.", i: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" },
    { t: "Multiple terminals", d: "Split terminals on one or more machines.", i: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
    { t: "Load balancer", d: "Put a public URL in front of any port.", i: "M12 4v6M6 20v-4l6-6 6 6v4" },
    { t: "Databases on demand", d: "Postgres, MongoDB and Redis in one click.", i: "M5 6c0-1.7 3-3 7-3s7 1.3 7 3v12c0 1.7-3 3-7 3s-7-1.3-7-3zM5 6c0 1.7 3 3 7 3s7-1.3 7-3" },
    { t: "Cloud tray", d: "Real AWS access, scoped to the lab and cleaned up after.", i: "M7 18a5 5 0 0 1-.9-9.9A6 6 0 0 1 17.6 7 4.5 4.5 0 0 1 17 18z" },
    { t: "Expose ports", d: "Share a running service with a link in seconds.", i: "M14 4h6v6M20 4l-9 9M18 13v7H4V6h7" },
    { t: "Credentials", d: "Keys and passwords for the lab, shown when you need them.", i: "M11 12l9-9M17 6l3 3M8 21a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" },
    { t: "Files and snapshots", d: "Download your work and pick up where you stopped.", i: "M3 7h7l2 2h9v10H3z" },
  ]} />
);
export const Proof = () => (
  <Grid k="Proof, not promises" title="Skills you can show, verified." body="Every check runs inside the machine, every exam is graded, and everything lands on your public profile." items={[
    { t: "Checks in the VM", d: "Steps pass only when the machine shows the result.", i: "M6 12l4 4 8-8" },
    { t: "AI-graded exams", d: "Hands-on tasks graded against a published rubric.", i: "M9 11l2 2 4-4M5 3h14v18H5z" },
    { t: "Verified certificates", d: "Anyone can verify them from your profile.", i: "M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M9 14.5L8 22l4-2 4 2-1-7.5" },
    { t: "Public portfolio", d: "Labs passed, certificates and interview signal in one link.", i: "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" },
    { t: "Interview signal", d: "Mock interview scores per stage, with a hire signal.", i: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0" },
    { t: "Ranks you earn", d: "Intern to Principal, from XP you cannot buy.", i: "M12 3l8 4.5v9L12 21l-8-4.5v-9z" },
    { t: "Leaderboard", d: "Weekly rankings across every track.", i: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
    { t: "TA sessions", d: "Book a TA when a lab gets stuck.", i: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 3v-3a2 2 0 0 1-2-2z" },
  ]} />
);

export const ShowcaseLinks = () => (
  <p style={{ textAlign: "center", marginTop: S(6), fontSize: 14, color: "var(--dashboard-muted)" }}><Link href="/labs" style={{ color: "inherit" }}>Browse 700+ labs →</Link></p>
);
