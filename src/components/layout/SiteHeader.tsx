"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import ExploreMenu from "@/components/nav/ExploreMenu";
import SearchPalette from "@/components/nav/SearchPalette";

/**
 * The one header for the website and sign-in: landing, labs, courses, pricing,
 * public profiles and the sign-in / onboarding flow. Sticky, theme-aware, with Explore and ⌘K.
 */
const LINKS = [
  { label: "Labs", href: "/labs", match: /^\/labs/ },
  { label: "Courses", href: "/courses", match: /^\/courses/ },
  { label: "Pricing", href: "/pricing", match: /^\/pricing/ },
];

export default function SiteHeader() {
  const path = usePathname();
  const [explore, setExplore] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } if (e.key === "Escape") { setExplore(false); setSearch(false); } };
    const s = () => setScrolled(window.scrollY > 4);
    s();
    const open = () => setSearch(true); // phones: the mobile top bar asks for search
    window.addEventListener("keydown", k);
    window.addEventListener("scroll", s, { passive: true });
    window.addEventListener("pd-open-search", open);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("scroll", s); window.removeEventListener("pd-open-search", open); };
  }, []);
  const link = (on: boolean): React.CSSProperties => ({ height: 32, display: "inline-flex", alignItems: "center", padding: "0 12px", borderRadius: "var(--puku-radius)", color: on ? "var(--dashboard-text)" : "var(--dashboard-muted)", textDecoration: "none", font: `${on ? 600 : 500} 14px/1 var(--font-sans)`, background: on ? "var(--dashboard-hover)" : "transparent", border: 0, cursor: "pointer" });
  const inApp = path.startsWith("/signin") || path.startsWith("/onboarding") || path.startsWith("/welcome");

  return (
    <>
      <header className="pd-siteheader" style={{ position: "sticky", top: 0, zIndex: 90, height: 64, display: "flex", alignItems: "center", gap: 8, padding: "0 max(20px, calc((100% - 1200px) / 2))", background: scrolled ? "color-mix(in srgb, var(--dashboard-main) 88%, transparent)" : "var(--dashboard-main)", backdropFilter: "saturate(1.4) blur(12px)", WebkitBackdropFilter: "saturate(1.4) blur(12px)", borderBottom: "1px solid var(--dashboard-border)", fontFamily: "var(--font-sans)" }}>
        <Link href="/" aria-label="Poridhi home" className="pd-l-logo" style={{ display: "block", width: 112, height: 20, flexShrink: 0, background: "url(/assets/poridhi-logo.png) left center/contain no-repeat", marginRight: 20 }} />
        <nav aria-label="Main" className="pd-l-links" style={{ display: "flex", gap: 2 }}>
          <button type="button" style={link(explore)} onClick={() => setExplore((v) => !v)} aria-expanded={explore} aria-haspopup="true">Explore<svg className="pd-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ marginLeft: 6 }}><path d="M6 9l6 6 6-6" /></svg></button>
          {LINKS.map((l) => <Link key={l.href} href={l.href} style={link(l.match.test(path))} aria-current={l.match.test(path) ? "page" : undefined}>{l.label}</Link>)}
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => setSearch(true)} aria-label="Search" className="pd-l-search" style={{ display: "inline-flex", alignItems: "center", gap: 8, width: 220, height: 36, padding: "0 12px", borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", color: "var(--dashboard-muted)", font: "400 13px/1 var(--font-sans)", cursor: "pointer" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M11 11m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.4-4.4" /></svg>
            Search labs, tracks…<span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11 }}>⌘K</span>
          </button>
          <ThemeSwitch inline />
          {inApp ? (
            <Link href="/app" className="puku-btn puku-btn-outline" style={{ ...link(false), height: 36, border: "1px solid var(--dashboard-border)", color: "var(--dashboard-text)" }}>Go to dashboard</Link>
          ) : (
            <>
              <Link href="/signin" style={{ ...link(false), height: 36, color: "var(--dashboard-text)" }}>Log in</Link>
              <Link href="/signin" className="puku-btn puku-btn-default" style={{ display: "inline-flex", alignItems: "center", height: 36, padding: "0 14px", borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", textDecoration: "none", font: "600 14px/1 var(--font-sans)" }}>Start free</Link>
            </>
          )}
        </div>
      </header>
      <ExploreMenu open={explore} onClose={() => setExplore(false)} top={64} />
      <SearchPalette open={search} onClose={() => setSearch(false)} />
    </>
  );
}
