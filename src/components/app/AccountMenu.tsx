"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { seed } from "@/data/seed";

const ITEMS: { label: string; href: string; icon: string }[] = [
  { label: "Dashboard", href: "/app", icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { label: "Account", href: "/app/me", icon: "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" },
  { label: "Leaderboard", href: "/app/leaderboard", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { label: "Settings", href: "/app/me/settings", icon: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" },
];

/** Avatar menu in the app bar: account, settings, dashboard and log out. */
export default function AccountMenu({ anchor, onClose }: { anchor: DOMRect | null; onClose: () => void }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!anchor) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const click = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) onClose(); };
    window.addEventListener("keydown", key);
    setTimeout(() => window.addEventListener("click", click), 0);
    box.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("click", click); };
  }, [anchor, onClose]);
  const go = (href: string) => { onClose(); router.push(href); };
  const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, width: "100%", height: 40, padding: "0 12px", border: 0, borderRadius: 6, background: "transparent", color: "var(--color-ink)", font: "400 14px/18px var(--font-sans)", cursor: "pointer", textAlign: "left" };
  return (
    <AnimatePresence>
      {anchor && (
        <motion.div ref={box} role="menu" aria-label="Account" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }}
          style={{ position: "fixed", top: anchor.bottom + 8, right: Math.max(8, window.innerWidth - anchor.right), zIndex: 160, width: 240, padding: 6, background: "var(--color-bg)", border: "1px solid var(--color-line)", borderRadius: 12, boxShadow: "0 24px 48px -24px rgba(0,0,0,.45)" }}>
          <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--color-line)", marginBottom: 6 }}>
            <div style={{ font: "600 14px/18px var(--font-sans)", color: "var(--color-ink)" }}>{seed.user.name}</div>
            <div style={{ font: "400 12px/16px var(--font-sans)", color: "var(--color-ink-3)" }}>{seed.user.email}</div>
          </div>
          {ITEMS.map((i) => (
            <button key={i.label} role="menuitem" className="pd-menu-row" style={row} onClick={() => go(i.href)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={i.icon} /></svg>
              {i.label}
            </button>
          ))}
          <div style={{ height: 1, background: "var(--color-line)", margin: "6px 0" }} />
          <button role="menuitem" className="pd-menu-row" style={{ ...row, color: "var(--color-danger)" }} onClick={() => go("/signin")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" /></svg>
            Log out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
