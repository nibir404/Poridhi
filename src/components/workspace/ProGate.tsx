"use client";
import Link from "next/link";
import { setPlan } from "@/data/plan";
import ThemeSwitch from "@/components/theme/ThemeSwitch";

/**
 * Free plan = content only (classes, readings, lab guides). Exams, AI interviews and lab VMs need Pro.
 * `UpgradeDialog` is the shared upgrade step; `ProWall` is the full-screen gate for exam / interview.
 */
const PERKS = ["Real Ubuntu VMs with terminal, IDE, databases, load balancer and cloud tray", "AI exams with certificates", "AI mock interviews with scored reports", "Time counts only while a VM runs"];
const primary: React.CSSProperties = { height: 40, padding: "0 16px", border: 0, borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const outline: React.CSSProperties = { height: 40, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", color: "var(--dashboard-text)", textDecoration: "none", fontSize: 14 };

export function UpgradeDialog({ open, onClose, title = "Unlock this with Pro" }: { open: boolean; onClose: () => void; title?: string }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, display: "grid", placeItems: "center", background: "rgba(0,0,0,.5)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, calc(100% - 32px))", display: "grid", gap: 14, padding: 24, borderRadius: 12, background: "var(--dashboard-panel)", color: "var(--dashboard-text)", border: "1px solid var(--dashboard-border)" }}>
        <b style={{ fontSize: 20 }}>{title}</b>
        <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>The free plan includes every class, reading and lab guide. Pro adds the hands-on and assessment parts:</span>
        <div style={{ display: "grid", gap: 6, fontSize: 14 }}>{PERKS.map((x) => <span key={x}>✓ {x}</span>)}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Link href="/pricing" style={outline}>See pricing</Link>
          <button type="button" onClick={() => { setPlan("pro"); onClose(); }} className="puku-btn puku-btn-default pd-glow-btn" style={primary}>Start Pro · ৳1,500 / month</button>
        </div>
      </div>
    </div>
  );
}

/** Full-screen gate with the same task bar as the workspace, so the header stays consistent. */
export function ProWall({ back, crumb, title, what, about }: { back: string; crumb: string; title: string; what: string; about: string }) {
  return (
    <div style={{ height: "100dvh", display: "grid", gridTemplateRows: "56px 1fr", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px", borderBottom: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)" }}>
        <Link href={back} aria-label="Back" style={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "var(--puku-radius)", background: "var(--dashboard-hover)", color: "inherit" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
        </Link>
        <div style={{ display: "grid" }}><span style={{ fontSize: 12, color: "var(--dashboard-muted)" }}>{crumb}</span><span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span></div>
        <span style={{ marginLeft: "auto" }}><ThemeSwitch inline /></span>
      </header>
      <div className="pd-hatch" style={{ display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "min(480px, 100%)", display: "grid", gap: 14, justifyItems: "center", textAlign: "center", padding: 32, borderRadius: 12, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)" }}>
          <span style={{ width: 48, height: 48, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--dashboard-hover)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </span>
          <b style={{ fontSize: 20 }}>{what} is part of Pro</b>
          <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{about} On the free plan you can still read every class, reading and lab guide.</span>
          <div style={{ display: "grid", gap: 6, fontSize: 14, textAlign: "left" }}>{PERKS.map((x) => <span key={x}>✓ {x}</span>)}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" onClick={() => setPlan("pro")} className="puku-btn puku-btn-default pd-glow-btn" style={primary}>Start Pro · ৳1,500 / month</button>
            <Link href="/app/roadmap" style={outline}>Keep learning free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
