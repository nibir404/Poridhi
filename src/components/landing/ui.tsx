"use client";
import Link from "next/link";

/**
 * Landing primitives following the Puku design system (ds.puku.sh): 44px controls,
 * --puku-radius (6px) for controls, --puku-radius-panel (12px) for panels, a 4px spacing grid,
 * and the Button variants default / secondary / outline / ghost. Colours come from the
 * --dashboard-* tokens (pure black and white in this app).
 */
export const S = (n: number) => n * 4; // spacing scale (Puku: 4px)
export const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
export const eyebrow: React.CSSProperties = { ...mono, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" };
export const h2: React.CSSProperties = { margin: 0, font: "500 clamp(32px, 4.4vw, 56px)/1.05 var(--font-sans)", letterSpacing: "-.035em" };
export const WIDTH = "min(1200px, calc(100% - 40px))";

type Variant = "default" | "secondary" | "outline" | "ghost";
export function Button({ href, children, variant = "default", size = "md", onClick }: { href?: string; children: React.ReactNode; variant?: Variant; size?: "sm" | "md" | "lg"; onClick?: () => void }) {
  const h = size === "sm" ? 32 : size === "lg" ? 48 : 44;
  const style: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, minHeight: h, padding: `0 ${size === "sm" ? S(2) : size === "lg" ? 18 : S(3) + 2}px`,
    borderRadius: "var(--puku-radius)", font: `${variant === "default" ? 600 : 500} ${size === "sm" ? 13 : 14}px/1.3 var(--font-sans)`, textDecoration: "none", cursor: "pointer",
    border: "1px solid", borderColor: variant === "outline" || variant === "secondary" ? "var(--dashboard-border)" : "transparent",
    background: variant === "default" ? "var(--dashboard-accent)" : variant === "secondary" ? "var(--dashboard-hover)" : "transparent",
    color: variant === "default" ? "var(--dashboard-accent-ink)" : "var(--dashboard-text)",
  };
  const cls = `puku-btn puku-btn-${variant}${variant === "default" ? " pd-glow-btn" : ""}`; // primary CTAs keep the glowing hover
  return href ? <Link href={href} className={cls} style={style}>{children}</Link> : <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>;
}

export const Badge = ({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "success" }) => (
  <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: `0 ${S(2)}px`, borderRadius: 4, ...mono, fontSize: 11, letterSpacing: ".02em",
    background: tone === "accent" ? "var(--dashboard-accent)" : tone === "success" ? "color-mix(in srgb, var(--dashboard-success) 16%, transparent)" : "var(--dashboard-hover)",
    color: tone === "accent" ? "var(--dashboard-accent-ink)" : tone === "success" ? "var(--dashboard-success)" : "var(--dashboard-text)" }}>{children}</span>
);

export const Card = ({ children, style, pad = 6 }: { children: React.ReactNode; style?: React.CSSProperties; pad?: number }) => (
  <div style={{ border: "1px solid var(--dashboard-border)", borderRadius: "var(--puku-radius-panel)", background: "var(--dashboard-panel)", padding: S(pad), ...style }}>{children}</div>
);

export const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
export const Arrow = () => <Icon d="M9 6l6 6-6 6" size={14} />;
export const Check = ({ color = "var(--dashboard-success)" }: { color?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 12l4 4 8-8" /></svg>;

/** Scroll-driven reveal in pure CSS (animation-timeline: view()); visible without support. */
export function Reveal({ children, delay = 0, style, hero }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; hero?: boolean }) {
  return <div className={hero ? "pd-rise" : "pd-reveal"} style={{ ...style, animationDelay: hero ? `${delay}s` : undefined }}>{children}</div>;
}

export function SectionHead({ k, title, body, align = "left", action }: { k: string; title: React.ReactNode; body?: string; align?: "left" | "center"; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: align === "center" ? "center" : "space-between", gap: S(4), textAlign: align }}>
      <div style={{ display: "grid", gap: S(3), maxWidth: 760, justifyItems: align === "center" ? "center" : "start" }}>
        <Reveal><span style={eyebrow}>{k}</span></Reveal>
        <Reveal delay={0.04}><h2 style={h2}>{title}</h2></Reveal>
        {body && <Reveal delay={0.08}><p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{body}</p></Reveal>}
      </div>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}
