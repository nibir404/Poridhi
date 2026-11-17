"use client";
import Link from "next/link";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import { Button, S, WIDTH, mono } from "./ui";

/** The original footer's links, laid out render.com style: brand and CTA, link columns, legal row. */
const COLS: [string, [string, string][]][] = [
  ["Explore", [["Courses", "/courses"], ["Labs", "/labs"], ["Lab guides", "/labs/guide/expose-docker-lb"], ["Pricing", "/pricing"]]],
  ["In every track", [["AI interview", "/app/interview"], ["AI exam", "/app/exam"], ["Roadmap", "/app/roadmap"], ["Time bank", "/app/me/time-bank"]]],
  ["Community", [["Verify a certificate", "/u/rahim"], ["Public profiles", "/u/rahim"]]],
  ["Company", [["About", "/"], ["Help center", "/app/me/support"], ["Contact", "/app/me/support"]]],
];

export default function Footer() {
  const link: React.CSSProperties = { color: "var(--dashboard-muted)", textDecoration: "none", fontSize: 14, lineHeight: "20px" };
  return (
    <footer style={{ marginTop: S(32), borderTop: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)" }}>
      <div className="pd-footer" style={{ width: WIDTH, margin: "0 auto", padding: `${S(16)}px 0 ${S(10)}px`, display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) repeat(4, minmax(0, 1fr))", gap: S(8) }}>
        <div style={{ display: "grid", gap: S(4), alignContent: "start" }}>
          <Link href="/" aria-label="Poridhi home" className="pd-l-logo" style={{ display: "block", width: 120, height: 22, background: "url(/assets/poridhi-logo.png) left center/contain no-repeat" }} />
          <p style={{ margin: 0, maxWidth: 280, fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>A hands-on engineering school. Learn cloud and AI by doing it on real machines.</p>
          <div><Button href="/signin">Start a free lab</Button></div>
        </div>
        {COLS.map(([h, items]) => (
          <nav key={h} aria-label={h} style={{ display: "grid", gap: S(3), alignContent: "start" }}>
            <span style={{ ...mono, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-text)" }}>{h}</span>
            {items.map(([t, href]) => <Link key={t} href={href} className="pd-footer-link" style={link}>{t}</Link>)}
          </nav>
        ))}
      </div>
      <div style={{ width: WIDTH, margin: "0 auto", padding: `${S(5)}px 0 ${S(8)}px`, borderTop: "1px solid var(--dashboard-border)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: S(5), fontSize: 13, color: "var(--dashboard-muted)" }}>
        <span>© 2018–2026 Poridhi. All rights reserved.</span>
        <span style={{ display: "flex", gap: S(4) }}>
          {["Privacy", "Terms", "Refunds"].map((t) => <Link key={t} href="/app/me/support" className="pd-footer-link" style={{ ...link, fontSize: 13 }}>{t}</Link>)}
        </span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: S(2) }}><span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--dashboard-success)" }} />All labs operational</span>
        <ThemeSwitch inline />
      </div>
    </footer>
  );
}
