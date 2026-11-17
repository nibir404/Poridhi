"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import { getWallet, fmtBank } from "@/data/wallet";
import { seed } from "@/data/seed";

/**
 * The one header for every /app screen (dashboard, learn, labs, practice, exams, interviews, me).
 * Same links, search, time bank, streak, theme and account menu everywhere, so the student
 * always knows where they are. Focus screens (running lab, exam question, live interview) keep
 * their own task bar underneath it.
 */
const LINKS: { label: string; href: string; match: RegExp }[] = [
  { label: "Home", href: "/app", match: /^\/app$/ },
  { label: "Learn", href: "/app/roadmap", match: /^\/app\/(roadmap|course|learn)/ },
  { label: "Labs", href: "/app/lab/launch", match: /^\/app\/lab/ },
  { label: "Practice", href: "/app/interview", match: /^\/app\/(interview|exam|practice)/ },
  { label: "Me", href: "/app/me", match: /^\/app\/me/ },
];
const I = ({ d, size = 15, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

export default function AppHeader({ onSearch, onChip, onAccount }: { onSearch: () => void; onChip: (which: "bank" | "streak", at: DOMRect) => void; onAccount: (at: DOMRect) => void }) {
  const path = usePathname();
  const [minutes, setMinutes] = useState(seed.timeBank.minutes);
  useEffect(() => {
    const sync = () => setMinutes(getWallet().minutes);
    sync();
    window.addEventListener("pd-wallet", sync);
    return () => window.removeEventListener("pd-wallet", sync);
  }, []);
  const chip: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 12px", borderRadius: "var(--puku-radius)", border: 0, background: "var(--dashboard-hover)", color: "var(--dashboard-text)", font: "600 13px/1 var(--font-sans)", cursor: "pointer" };

  return (
    <header className="pd-appheader" style={{ position: "sticky", top: 0, zIndex: 90, height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 20px", background: "color-mix(in srgb, var(--dashboard-main) 90%, transparent)", backdropFilter: "saturate(1.4) blur(12px)", WebkitBackdropFilter: "saturate(1.4) blur(12px)", borderBottom: "1px solid var(--dashboard-border)", fontFamily: "var(--font-sans)" }}>
      <Link href="/" aria-label="Poridhi home" className="pd-l-logo" style={{ display: "block", width: 112, height: 20, flexShrink: 0, background: "url(/assets/poridhi-logo.png) left center/contain no-repeat" }} />
      <nav aria-label="App" style={{ display: "flex", gap: 2, marginLeft: 8 }}>
        {LINKS.map((l) => {
          const on = l.match.test(path);
          return (
            <Link key={l.label} href={l.href} aria-current={on ? "page" : undefined}
              style={{ height: 32, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: "var(--puku-radius)", textDecoration: "none", font: `${on ? 600 : 500} 14px/1 var(--font-sans)`, color: on ? "var(--dashboard-text)" : "var(--dashboard-muted)", background: on ? "var(--dashboard-hover)" : "transparent" }}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={onSearch} aria-label="Search" className="pd-ah-search"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, width: 240, height: 36, padding: "0 12px", borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", color: "var(--dashboard-muted)", font: "400 13px/1 var(--font-sans)", cursor: "pointer" }}>
          <I d="M11 11m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.4-4.4" />Search this track<span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11 }}>⌘K</span>
        </button>
        <button type="button" aria-label="Time bank" aria-haspopup="dialog" onClick={(e) => onChip("bank", e.currentTarget.getBoundingClientRect())} style={chip}>
          <I d="M7 3h10M7 21h10M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l2.4-2.3A4 4 0 0 0 16 6.5V3M8 21v-3.5a4 4 0 0 1 1.6-3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21" color="var(--dashboard-warning)" />{fmtBank(minutes)} bank
        </button>
        <button type="button" aria-label="Streak" aria-haspopup="dialog" onClick={(e) => onChip("streak", e.currentTarget.getBoundingClientRect())} style={chip}>
          <I d="M12 21a6 6 0 0 0 6-6c0-4-3-5.5-3.5-9-2 1.5-3 3.5-3 5.5-1-.5-1.8-1.5-2-2.8C7.6 10.4 6 12.4 6 15a6 6 0 0 0 6 6z" color="var(--dashboard-warning)" />{seed.streakDays}
        </button>
        <ThemeSwitch inline />
        <button type="button" aria-label="Account menu" aria-haspopup="menu" onClick={(e) => { e.stopPropagation(); onAccount(e.currentTarget.getBoundingClientRect()); }}
          style={{ width: 36, height: 36, borderRadius: 999, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-hover)", color: "var(--dashboard-text)", font: "600 13px/1 var(--font-sans)", cursor: "pointer" }}>
          {seed.user.initials}
        </button>
      </div>
    </header>
  );
}
