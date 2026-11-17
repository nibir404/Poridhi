"use client";
import { useEffect, useState } from "react";
import { getTheme, setTheme, THEMES, type Theme } from "./theme";

const ICON: Record<Theme, string> = {
  light: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4",
  dark: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
};

/** Floating light / dark / terminal switch for screens whose design has no toggle (lab, interview, exam). */
export default function ThemeSwitch({ inline = false, dark = false }: { inline?: boolean; dark?: boolean }) {
  const [t, setT] = useState<Theme>("light");
  useEffect(() => {
    setT(getTheme());
    const on = (e: Event) => setT((e as CustomEvent<Theme>).detail);
    window.addEventListener("pd-theme", on);
    return () => window.removeEventListener("pd-theme", on);
  }, []);
  return (
    <div role="radiogroup" aria-label="Theme" className="pd-theme-switch"
      style={{ ...(inline ? { flexShrink: 0 } : { position: "fixed", left: 16, bottom: 16, zIndex: 120, boxShadow: "0 8px 24px -12px rgba(0,0,0,.35)" }), display: "flex", gap: 2, padding: 3, borderRadius: 6, background: dark ? "rgba(255,255,255,.08)" : "var(--color-surface)", border: inline ? 0 : "1px solid var(--color-line)" }}>
      {THEMES.map((k) => (
        <button key={k} role="radio" aria-checked={t === k} aria-label={`${k} theme`} onClick={() => setTheme(k)}
          style={{ width: inline ? 28 : 32, height: inline ? 28 : 32, display: "flex", alignItems: "center", justifyContent: "center", border: t === k && !dark ? "1px solid #E6E6E6" : "1px solid transparent", borderRadius: 4, background: t === k ? (dark ? "rgba(255,255,255,.16)" : "var(--color-bg)") : "transparent", cursor: "pointer" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t === k ? (dark ? "#FFFFFF" : "var(--color-ink)") : dark ? "#A5A5A5" : "var(--color-ink-3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICON[k]} /></svg>
        </button>
      ))}
    </div>
  );
}
