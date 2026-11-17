"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PlatformShowcase from "@/components/marketing/PlatformShowcase";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import ExploreMenu from "@/components/nav/ExploreMenu";
import SearchPalette from "@/components/nav/SearchPalette";
import MobileChrome from "@/components/layout/MobileChrome";
import { bindRecolor } from "@/components/theme/recolor";
import { getTheme } from "@/components/theme/theme";
import { track } from "@/data/roadmap";
import DotField from "./DotField";
import Bento from "./Bento";

/**
 * Immersive landing page on the Puku design-system tokens (light, dark, 98).
 * Soft gradient light behind a left-aligned statement, a dashed isometric cube field of
 * "running VMs", the real product bleeding off the bottom of the hero, hatched dividers,
 * a mono stack grid, and feature cards with dashed isometric illustrations.
 */
const W = "min(1200px, calc(100% - 40px))";
const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const eyebrow: React.CSSProperties = { ...mono, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" };
const h2: React.CSSProperties = { margin: 0, font: "500 clamp(32px, 4.4vw, 56px)/1.05 var(--font-sans)", letterSpacing: "-.035em" };

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

/** Scroll-driven reveal in pure CSS; without support it is simply visible. */
function Reveal({ children, delay = 0, style, hero }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; hero?: boolean }) {
  return <div className={hero ? "pd-rise" : "pd-reveal"} style={{ ...style, animationDelay: hero ? `${delay}s` : undefined }}>{children}</div>;
}

function Pill({ href, children, solid }: { href: string; children: React.ReactNode; solid?: boolean }) {
  return (
    <Link href={href} className="pd-l-btn" data-primary={solid ? "1" : undefined}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 999, textDecoration: "none", font: `500 14px/1 var(--font-sans)`, background: solid ? "var(--dashboard-text)" : "color-mix(in srgb, var(--dashboard-panel) 70%, transparent)", color: solid ? "var(--dashboard-main)" : "var(--dashboard-text)", border: solid ? "1px solid transparent" : "1px solid var(--dashboard-border)", backdropFilter: "blur(8px)" }}>
      {children}
    </Link>
  );
}

function Hatch({ h = 36 }: { h?: number }) {
  return <div aria-hidden className="pd-hatch" style={{ height: h, borderTop: "1px solid var(--dashboard-border)", borderBottom: "1px solid var(--dashboard-border)" }} />;
}

function Nav({ onExplore, onSearch }: { onExplore: () => void; onSearch: () => void }) {
  const link: React.CSSProperties = { height: 34, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: 999, color: "var(--dashboard-text)", textDecoration: "none", font: "400 14px/1 var(--font-sans)", background: "transparent", border: 0, cursor: "pointer" };
  return (
    <header className="pd-l-nav" style={{ position: "relative", zIndex: 5, width: W, margin: "0 auto", display: "flex", alignItems: "center", gap: 8, height: 72 }}>
      <Link href="/" aria-label="Poridhi home" className="pd-l-logo" style={{ display: "block", width: 112, height: 20, background: "url(/assets/poridhi-logo.png) left center/contain no-repeat", marginRight: 28 }} />
      <nav aria-label="Main" style={{ display: "flex", gap: 2 }} className="pd-l-links">
        <button style={link} onClick={onExplore} aria-haspopup="true">Explore</button>
        <Link href="/labs" style={link}>Labs</Link>
        <Link href="/courses" style={link}>Courses</Link>
        <Link href="/pricing" style={link}>Pricing</Link>
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onSearch} aria-label="Search" className="pd-l-search" style={{ ...link, gap: 8, color: "var(--dashboard-muted)" }}>
          <Icon d="M11 11m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.4-4.4" size={15} /><span style={{ ...mono, fontSize: 12 }}>⌘K</span>
        </button>
        <ThemeSwitch inline />
        <Link href="/signin" style={{ ...link, border: "1px solid var(--dashboard-border)" }}>Log in</Link>
        <Pill href="/signin" solid>Start free</Pill>
      </div>
    </header>
  );
}

export default function Landing() {
  const [explore, setExplore] = useState(false);
  const [search, setSearch] = useState(false);
  const showcase = useRef<HTMLDivElement>(null);
  const [showW, setShowW] = useState(1100);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } if (e.key === "Escape") { setExplore(false); setSearch(false); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // The embedded product screens are Paper exports: keep them in the active theme.
  useEffect(() => {
    const el = showcase.current;
    if (!el) return;
    const fit = () => setShowW(Math.min(1100, el.clientWidth));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    const undo = bindRecolor(el, getTheme);
    return () => { ro.disconnect(); undo(); };
  }, []);

  const stack = ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "Ansible", "Prometheus", "Grafana", "GitHub Actions", "Argo CD", "Go", "Python"];

  return (
    <div className="pd-landing" style={{ minHeight: "100vh", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)", overflowX: "clip" }}>
      <MobileChrome variant="site" onSearch={() => setSearch(true)} />

      {/* Hero: gradient light, statement, cube field, product bleeding off */}
      <section className="pd-l-hero" style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--dashboard-border)" }}>
        <div aria-hidden className="pd-l-aurora" />
        <div aria-hidden className="pd-l-noise" />
        <Nav onExplore={() => setExplore((v) => !v)} onSearch={() => setSearch(true)} />
        <div style={{ position: "relative", width: W, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, .95fr)", alignItems: "center", gap: 24, padding: "clamp(40px, 7vw, 96px) 0 clamp(32px, 5vw, 64px)" }} className="pd-l-hero-grid">
          <div style={{ display: "grid", gap: 20, justifyItems: "start" }}>
            <Reveal hero>
              <Link href="/labs/guide/expose-docker-lb" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 28, padding: "0 12px 0 4px", borderRadius: 999, border: "1px solid var(--dashboard-border)", background: "color-mix(in srgb, var(--dashboard-panel) 70%, transparent)", color: "var(--dashboard-text)", textDecoration: "none", fontSize: 13, backdropFilter: "blur(8px)" }}>
                <span style={{ ...mono, fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)" }}>NEW</span>
                Every lab guide is free to read
              </Link>
            </Reveal>
            <Reveal hero delay={0.05}>
              <h1 style={{ margin: 0, font: "500 clamp(44px, 6.2vw, 84px)/1 var(--font-sans)", letterSpacing: "-.045em" }}>Learn cloud &amp; AI<br />by actually doing it.</h1>
            </Reveal>
            <Reveal hero delay={0.1}>
              <p style={{ margin: 0, maxWidth: 480, fontSize: 17, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>Read every track free. Then build in real Ubuntu VMs with VS Code, a terminal and AWS, right in your browser.</p>
            </Reveal>
            <Reveal hero delay={0.15} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Pill href="/signin" solid>Start a free lab <Icon d="M9 6l6 6-6 6" size={14} /></Pill>
              <Pill href="/courses">Explore tracks</Pill>
            </Reveal>
            <Reveal hero delay={0.2}><span style={{ ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>30 free lab minutes · no card</span></Reveal>
          </div>
          <div className="pd-l-cubes" style={{ position: "relative", aspectRatio: "1.15 / 1", marginRight: "-8%", maskImage: "radial-gradient(closest-side, #000 60%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 60%, transparent)" }}>
            <DotField />
          </div>
        </div>
        {/* Product, cropped by the hero's bottom edge */}
        <div ref={showcase} style={{ position: "relative", width: W, margin: "0 auto", height: "clamp(300px, 38vw, 520px)", overflow: "hidden" }}>
          <PlatformShowcase width={Math.max(280, showW)} />
        </div>
      </section>

      <Hatch />

      {/* Stack grid */}
      <section style={{ width: W, margin: "0 auto" }}>
        <div className="pd-l-stack" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", borderLeft: "1px solid var(--dashboard-border)" }}>
          {stack.map((s) => (
            <div key={s} style={{ height: 88, display: "grid", placeItems: "center", borderRight: "1px solid var(--dashboard-border)", borderBottom: "1px solid var(--dashboard-border)", ...mono, fontSize: 14, color: "var(--dashboard-muted)" }}>{s}</div>
          ))}
        </div>
      </section>

      <Hatch />

      {/* Statement */}
      <section style={{ width: W, margin: "0 auto", padding: "clamp(72px, 9vw, 128px) 0", textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
        <Reveal><h2 style={h2}>Practice that checks your work</h2></Reveal>
        <Reveal delay={0.05}><p style={{ margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.6, color: "var(--dashboard-muted)" }}>Every step is verified inside a real machine. Read for free, practise on real infrastructure, and earn your lab time back by passing milestones.</p></Reveal>
        <Reveal delay={0.1}><Pill href="/signin" solid>Get started <Icon d="M9 6l6 6-6 6" size={14} /></Pill></Reveal>
      </section>

      {/* Feature bento: crops of the real product */}
      <section style={{ width: W, margin: "0 auto" }}>
        <Bento />
      </section>

      {/* How it works, numbered rows */}
      <section style={{ width: W, margin: "clamp(80px, 10vw, 140px) auto 0" }}>
        <Reveal><div style={eyebrow}>How Poridhi works</div></Reveal>
        <Reveal delay={0.05}><h2 style={{ ...h2, marginTop: 12, maxWidth: 760 }}>Read free. Practise for real. Earn your time back.</h2></Reveal>
        <ol style={{ listStyle: "none", margin: "40px 0 0", padding: 0, borderTop: "1px solid var(--dashboard-border)" }}>
          {[
            ["01", "Read every track free", "Roadmaps, class recordings, notes and every lab guide. No sign-up needed."],
            ["02", "Launch a real lab", "A fresh VM with every tool ready. Steps are checked inside the machine as you go."],
            ["03", "Earn your time back", "Pass a milestone exam and get lab time and coins. Certificates are verified."],
          ].map(([n, t, d]) => (
            <li key={n} className="pd-l-row" style={{ display: "grid", gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1.2fr)", gap: 24, padding: "28px 0", borderBottom: "1px solid var(--dashboard-border)", alignItems: "baseline" }}>
              <span style={{ ...mono, fontSize: 13, color: "var(--dashboard-muted)" }}>{n}</span>
              <span style={{ font: "500 22px/1.25 var(--font-sans)", letterSpacing: "-.01em" }}>{t}</span>
              <span style={{ fontSize: 16, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{d}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Track */}
      <section style={{ width: W, margin: "clamp(80px, 10vw, 140px) auto 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: 16 }}>
          <Reveal><div style={eyebrow}>Career track</div><h2 style={{ ...h2, marginTop: 12 }}>DevOps &amp; Cloud Engineer</h2></Reveal>
          <Reveal delay={0.05}><Pill href="/app/roadmap">Open the roadmap <Icon d="M9 6l6 6-6 6" size={14} /></Pill></Reveal>
        </div>
        <Reveal delay={0.1}>
          <ol className="pd-l-track" style={{ listStyle: "none", margin: "32px 0 0", padding: 0, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", border: "1px solid var(--dashboard-border)", borderRadius: 12, overflow: "hidden" }}>
            {track.milestones.map((m, i) => (
              <li key={m.n} style={{ borderLeft: i ? "1px solid var(--dashboard-border)" : 0, background: m.n === 1 ? "color-mix(in oklab, var(--dashboard-accent) 12%, var(--dashboard-panel))" : "var(--dashboard-panel)" }}>
                <Link href={`/app/roadmap/milestone-1?ms=${m.n}`} style={{ display: "grid", gap: 10, padding: "20px 18px 22px", color: "var(--dashboard-text)", textDecoration: "none", height: "100%" }}>
                  <span style={{ ...mono, fontSize: 12, color: m.n === 1 ? "var(--dashboard-accent)" : "var(--dashboard-muted)" }}>M{m.n}{m.n === 1 ? " · current" : ""}</span>
                  <span style={{ font: "500 15px/1.3 var(--font-sans)" }}>{m.title}</span>
                  <span style={{ ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>{m.modules.length} modules</span>
                </Link>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* Closing */}
      <section className="pd-l-hero" style={{ position: "relative", overflow: "hidden", marginTop: "clamp(80px, 10vw, 140px)", borderTop: "1px solid var(--dashboard-border)" }}>
        <div aria-hidden className="pd-l-aurora pd-l-aurora-2" />
        <div style={{ position: "relative", width: W, margin: "0 auto", padding: "clamp(72px, 9vw, 128px) 0", display: "grid", gap: 18, justifyItems: "center", textAlign: "center" }}>
          <h2 style={h2}>Your first lab is 30 seconds away.</h2>
          <p style={{ margin: 0, maxWidth: 520, fontSize: 16, lineHeight: 1.6, color: "var(--dashboard-muted)" }}>Start with 30 free minutes. Read everything without paying. Upgrade only when you want more VM time.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Pill href="/signin" solid>Start a free lab</Pill>
            <Pill href="/pricing">See pricing</Pill>
          </div>
        </div>
      </section>

      <footer style={{ width: W, margin: "0 auto", padding: "28px 0 48px", borderTop: "1px solid var(--dashboard-border)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", fontSize: 14, color: "var(--dashboard-muted)" }}>
        <span style={mono}>© 2026 Poridhi · Dhaka</span>
        <nav aria-label="Footer" style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
          {[["Labs", "/labs"], ["Courses", "/courses"], ["Pricing", "/pricing"], ["Leaderboard", "/leaderboard"], ["Verify a certificate", "/u/rahim"]].map(([t, h]) => <Link key={h} href={h} style={{ color: "inherit", textDecoration: "none" }}>{t}</Link>)}
        </nav>
      </footer>

      <ExploreMenu open={explore} onClose={() => setExplore(false)} top={72} />
      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </div>
  );
}
