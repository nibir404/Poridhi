"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import NetworkBackground from "@/components/motion/NetworkBackground";
import PlatformShowcase from "@/components/marketing/PlatformShowcase";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import ExploreMenu from "@/components/nav/ExploreMenu";
import SearchPalette from "@/components/nav/SearchPalette";
import MobileChrome from "@/components/layout/MobileChrome";
import { bindRecolor } from "@/components/theme/recolor";
import { getTheme } from "@/components/theme/theme";
import { track } from "@/data/roadmap";

/**
 * Landing page built natively on the Puku design-system tokens (light, dark and 98 themes).
 * Calm, immersive layout: floating pill nav, a big statement over a live network grid,
 * the real product in a framed window that settles in as you scroll, a mono stats strip,
 * how it works, tracks, the three practice surfaces, and a closing call to action.
 */
const W = "min(1200px, calc(100% - 40px))";
const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const eyebrow: React.CSSProperties = { ...mono, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" };

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

/** Scroll-driven reveal in pure CSS (animation-timeline: view()); without support it is simply visible. */
function Reveal({ children, delay = 0, style, hero }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; hero?: boolean }) {
  return <div className={hero ? "pd-rise" : "pd-reveal"} style={{ ...style, animationDelay: hero ? `${delay}s` : undefined }}>{children}</div>;
}

function Button({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link href={href} className="pd-l-btn" data-primary={primary ? "1" : undefined}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 44, padding: "0 18px", borderRadius: 6, textDecoration: "none", font: `${primary ? 600 : 500} 15px/1 var(--font-sans)`, background: primary ? "var(--dashboard-accent)" : "transparent", color: primary ? "var(--dashboard-accent-ink)" : "var(--dashboard-text)", border: primary ? "1px solid transparent" : "1px solid var(--dashboard-border)" }}>
      {children}
    </Link>
  );
}

function CommandPill() {
  const cmd = "poridhi lab start docker-networking";
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 44, padding: "0 6px 0 14px", borderRadius: 6, background: "var(--dashboard-panel)", border: "1px solid var(--dashboard-border)", ...mono, fontSize: 13, color: "var(--dashboard-text)", maxWidth: "100%" }}>
      <span style={{ color: "var(--dashboard-success)" }}>$</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cmd}</span>
      <button onClick={() => { navigator.clipboard?.writeText(cmd).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1400); }} aria-label="Copy command"
        style={{ height: 32, padding: "0 10px", borderRadius: 4, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-hover)", color: "var(--dashboard-text)", cursor: "pointer", ...mono, fontSize: 12 }}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Nav({ onExplore, onSearch }: { onExplore: () => void; onSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 8); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  const link: React.CSSProperties = { height: 36, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: 6, color: "var(--dashboard-text)", textDecoration: "none", font: "500 14px/1 var(--font-sans)", background: "transparent", border: 0, cursor: "pointer" };
  return (
    <header className="pd-l-nav" style={{ position: "sticky", top: 12, zIndex: 80, width: W, margin: "12px auto 0", display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 10px 0 16px", borderRadius: 12, border: "1px solid var(--dashboard-border)", background: scrolled ? "color-mix(in srgb, var(--dashboard-panel) 82%, transparent)" : "var(--dashboard-panel)", backdropFilter: "saturate(1.4) blur(14px)", WebkitBackdropFilter: "saturate(1.4) blur(14px)", boxShadow: scrolled ? "0 12px 32px -20px rgba(0,0,0,.35)" : "none", transition: "box-shadow .2s, background .2s" }}>
      <Link href="/" aria-label="Poridhi home" style={{ display: "block", width: 112, height: 20, background: "url(/assets/poridhi-logo.png) left center/contain no-repeat", marginRight: 12 }} className="pd-l-logo" />
      <nav aria-label="Main" style={{ display: "flex", gap: 2 }} className="pd-l-links">
        <button style={link} onClick={onExplore} aria-haspopup="true">Explore <span aria-hidden style={{ marginLeft: 4 }}>▾</span></button>
        <Link href="/labs" style={link}>Labs</Link>
        <Link href="/courses" style={link}>Courses</Link>
        <Link href="/pricing" style={link}>Pricing</Link>
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onSearch} className="pd-l-search" style={{ ...link, gap: 8, border: "1px solid var(--dashboard-border)", color: "var(--dashboard-muted)", width: 220, justifyContent: "flex-start" }}>
          <Icon d="M11 11m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.4-4.4" size={15} /> Search labs, tracks… <span style={{ marginLeft: "auto", ...mono, fontSize: 11 }}>⌘K</span>
        </button>
        <ThemeSwitch inline />
        <Link href="/signin" style={link}>Log in</Link>
        <Button href="/signin" primary>Start free</Button>
      </div>
    </header>
  );
}

function Window({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", boxShadow: "var(--shadow-window, 0 32px 80px -40px rgba(0,0,0,.45))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", borderBottom: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: 999, background: c }} />)}
        <span style={{ flex: 1, textAlign: "center", ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function Landing() {
  const [explore, setExplore] = useState(false);
  const [search, setSearch] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const showcase = useRef<HTMLDivElement>(null);
  const [showW, setShowW] = useState(1120);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "start 30%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.92, 1]);
  const tilt = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 10, 0]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } if (e.key === "Escape") { setExplore(false); setSearch(false); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // The embedded product screens are Paper exports: keep them in the active theme.
  useEffect(() => {
    const el = showcase.current;
    if (!el) return;
    const fit = () => setShowW(Math.min(1120, el.clientWidth));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    const undo = bindRecolor(el, getTheme);
    return () => { ro.disconnect(); undo(); };
  }, []);

  const steps = [
    { n: "01", t: "Read every track free", d: "Roadmaps, class recordings, notes and every lab guide. No sign-up needed to start reading.", i: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 11h7" },
    { n: "02", t: "Launch a real lab", d: "A fresh Ubuntu VM with VS Code, a terminal, a load balancer and AWS access. Every step is checked inside the machine.", i: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
    { n: "03", t: "Earn your time back", d: "Pass a milestone and get lab time plus coins. Certificates are verified, not self-reported.", i: "M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M9 14.5L8 22l4-2 4 2-1-7.5" },
  ];
  const surfaces = [
    { k: "Labs", t: "A real VM in about 30 seconds", d: "Terminals, an IDE, a cloud tray and a load balancer. Time only counts while the VM runs.", href: "/app/lab/launch", i: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
    { k: "AI interview", t: "Rehearse with an interviewer that listens", d: "Voice or text, a whiteboard and a terminal. Scored per stage with a hire signal.", href: "/app/interview", i: "M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" },
    { k: "AI exam", t: "Prove it in a hands-on exam", d: "Ten real tasks in a cloud IDE, graded by AI. Best attempt counts toward your certificate.", href: "/app/exam", i: "M9 11l2 2 4-4M5 3h14v18H5z" },
  ];

  return (
    <div className="pd-landing" style={{ minHeight: "100vh", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <MobileChrome variant="site" onSearch={() => setSearch(true)} />
      <Nav onExplore={() => setExplore((v) => !v)} onSearch={() => setSearch(true)} />

      {/* Hero */}
      <section style={{ width: W, margin: "16px auto 0", position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.9 }} className="pd-l-grid"><NetworkBackground /></div>
        <div style={{ position: "relative", display: "grid", justifyItems: "center", textAlign: "center", gap: 22, padding: "clamp(64px, 10vw, 120px) 20px clamp(48px, 7vw, 88px)" }}>
          <Reveal hero>
            <Link href="/labs/guide/expose-docker-lb" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px 0 6px", borderRadius: 999, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", color: "var(--dashboard-text)", textDecoration: "none", fontSize: 13 }}>
              <span style={{ ...mono, fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)" }}>NEW</span>
              Every lab guide is now free to read →
            </Link>
          </Reveal>
          <Reveal hero delay={0.05}>
            <h1 style={{ margin: 0, font: "600 clamp(40px, 6.4vw, 84px)/1.02 var(--font-sans)", letterSpacing: "-.035em", maxWidth: 980 }}>Learn cloud &amp; AI engineering by actually doing it.</h1>
          </Reveal>
          <Reveal hero delay={0.1}>
            <p style={{ margin: 0, maxWidth: 640, fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.55, color: "var(--dashboard-muted)" }}>A hands-on engineering school. Read every track free, then build in real Ubuntu VMs with VS Code, a terminal and AWS, right in your browser.</p>
          </Reveal>
          <Reveal hero delay={0.15} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <Button href="/signin" primary>Start a free lab <Icon d="M5 12h14M13 6l6 6-6 6" size={16} /></Button>
            <Button href="/courses">Explore career tracks</Button>
          </Reveal>
          <Reveal hero delay={0.2}><CommandPill /></Reveal>
          <Reveal hero delay={0.25}><p style={{ margin: 0, fontSize: 13, color: "var(--dashboard-muted)" }}>30 free lab minutes on sign-up · No card needed</p></Reveal>
        </div>
      </section>

      {/* Product, framed */}
      <section ref={stage} style={{ width: W, margin: "-8px auto 0", perspective: 1600 }}>
        <motion.div style={{ scale, rotateX: tilt, transformOrigin: "50% 0%" }}>
          <div ref={showcase} style={{ padding: "clamp(12px, 2vw, 22px)", borderRadius: 16, border: "1px solid var(--dashboard-border)", backgroundColor: "var(--dashboard-sidebar)", backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
            <PlatformShowcase width={Math.max(280, showW - 44)} />
          </div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <Reveal style={{ width: W, margin: "40px auto 0" }}>
        <div className="pd-l-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: "1px solid var(--dashboard-border)", borderRadius: 12, background: "var(--dashboard-panel)" }}>
          {[["Labs", "700+", "hands-on, checked in the VM"], ["To a running VM", "~30s", "from click to terminal"], ["Career tracks", "12", "6 milestones each"], ["To read everything", "৳0", "pay only for VM time"]].map(([k, v, d], i) => (
            <div key={k} style={{ padding: "22px 24px", borderLeft: i ? "1px solid var(--dashboard-border)" : 0 }}>
              <div style={eyebrow}>{k}</div>
              <div style={{ ...mono, fontSize: 38, lineHeight: 1.1, margin: "10px 0 6px", letterSpacing: "-.02em" }}>{v}</div>
              <div style={{ fontSize: 14, color: "var(--dashboard-muted)" }}>{d}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* How it works */}
      <section style={{ width: W, margin: "clamp(80px, 10vw, 140px) auto 0" }}>
        <Reveal><div style={eyebrow}>How Poridhi works</div></Reveal>
        <Reveal delay={0.05}><h2 style={{ margin: "12px 0 0", font: "600 clamp(30px, 4vw, 52px)/1.08 var(--font-sans)", letterSpacing: "-.03em", maxWidth: 760 }}>Read for free. Practise on real machines. Earn your time back.</h2></Reveal>
        <div className="pd-l-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 36 }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06}>
              <div style={{ height: "100%", padding: 24, borderRadius: 12, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 6, display: "grid", placeItems: "center", background: "var(--dashboard-hover)" }}><Icon d={s.i} /></span>
                  <span style={{ ...mono, fontSize: 12, color: "var(--dashboard-muted)" }}>{s.n}</span>
                </div>
                <h3 style={{ margin: "20px 0 8px", font: "600 20px/1.25 var(--font-sans)" }}>{s.t}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Practice surfaces */}
      <section style={{ width: W, margin: "clamp(80px, 10vw, 140px) auto 0" }}>
        <Reveal><div style={eyebrow}>Three ways to practise</div></Reveal>
        <Reveal delay={0.05}><h2 style={{ margin: "12px 0 0", font: "600 clamp(30px, 4vw, 52px)/1.08 var(--font-sans)", letterSpacing: "-.03em", maxWidth: 760 }}>One roadmap. Every step proven in a real environment.</h2></Reveal>
        <div className="pd-l-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 36 }}>
          {surfaces.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.06}>
              <Link href={s.href} className="pd-l-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 24, borderRadius: 12, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", color: "var(--dashboard-text)", textDecoration: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...eyebrow }}><Icon d={s.i} size={16} />{s.k}</span>
                <h3 style={{ margin: "18px 0 8px", font: "600 22px/1.25 var(--font-sans)" }}>{s.t}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--dashboard-muted)", flex: 1 }}>{s.d}</p>
                <span style={{ marginTop: 20, fontWeight: 600, fontSize: 14, color: "var(--dashboard-accent)" }}>Try it →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Track */}
      <section style={{ width: W, margin: "clamp(80px, 10vw, 140px) auto 0" }}>
        <Reveal><div style={eyebrow}>Career track</div></Reveal>
        <Reveal delay={0.05}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: 16, marginTop: 12 }}>
            <h2 style={{ margin: 0, font: "600 clamp(30px, 4vw, 52px)/1.08 var(--font-sans)", letterSpacing: "-.03em", maxWidth: 720 }}>DevOps &amp; Cloud Engineer, in six milestones.</h2>
            <Button href="/app/roadmap">Open the roadmap</Button>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Window title="roadmap · devops-and-cloud-engineer">
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              {track.milestones.map((m, i) => (
                <li key={m.n} style={{ padding: 20, borderLeft: i ? "1px solid var(--dashboard-border)" : 0, borderTop: "1px solid transparent" }}>
                  <Link href={`/app/roadmap/milestone-1?ms=${m.n}`} style={{ color: "var(--dashboard-text)", textDecoration: "none", display: "grid", gap: 8 }}>
                    <span style={{ ...mono, fontSize: 12, color: m.n === 1 ? "var(--dashboard-accent)" : "var(--dashboard-muted)" }}>M{m.n}{m.n === 1 ? " · current" : ""}</span>
                    <span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{m.title}</span>
                    <span style={{ fontSize: 13, color: "var(--dashboard-muted)" }}>{m.modules.length} modules · certificate</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Window>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section style={{ width: W, margin: "clamp(80px, 10vw, 140px) auto 0" }}>
        <Reveal>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)", padding: "clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)", display: "grid", gap: 18, justifyItems: "start" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}><NetworkBackground /></div>
            <h2 style={{ position: "relative", margin: 0, font: "600 clamp(30px, 4vw, 52px)/1.08 var(--font-sans)", letterSpacing: "-.03em", maxWidth: 680 }}>Your first lab is 30 seconds away.</h2>
            <p style={{ position: "relative", margin: 0, maxWidth: 560, fontSize: 17, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>Start with 30 free minutes. Read everything without paying. Upgrade only when you want more VM time.</p>
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Button href="/signin" primary>Start a free lab</Button>
              <Button href="/pricing">See pricing</Button>
            </div>
          </div>
        </Reveal>
      </section>

      <footer style={{ width: W, margin: "64px auto 0", padding: "28px 0 48px", borderTop: "1px solid var(--dashboard-border)", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", fontSize: 14, color: "var(--dashboard-muted)" }}>
        <span>© 2026 Poridhi · Dhaka</span>
        <nav aria-label="Footer" style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
          {[["Labs", "/labs"], ["Courses", "/courses"], ["Pricing", "/pricing"], ["Leaderboard", "/leaderboard"], ["Verify a certificate", "/u/rahim"]].map(([t, h]) => <Link key={h} href={h} style={{ color: "inherit", textDecoration: "none" }}>{t}</Link>)}
        </nav>
      </footer>

      <ExploreMenu open={explore} onClose={() => setExplore(false)} top={80} />
      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </div>
  );
}
