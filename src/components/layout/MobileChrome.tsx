"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getTheme, setTheme, THEMES, type Theme } from "@/components/theme/theme";

/** Phone shell: compact top bar + bottom tab bar, so the site behaves like an installed app. */
const PHONE = "(max-width: 767px)";

type Tab = { label: string; href: string; match: RegExp; icon: string };
const APP_TABS: Tab[] = [
  { label: "Home", href: "/app", match: /^\/app$/, icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { label: "Learn", href: "/app/roadmap", match: /^\/app\/(roadmap|course|learn)/, icon: "M6 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M18 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6" },
  { label: "Labs", href: "/app/lab/launch", match: /^\/app\/lab/, icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
  { label: "Practice", href: "/app/interview", match: /^\/app\/(interview|exam|practice)/, icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 3v-3a2 2 0 0 1-2-2z" },
  { label: "Me", href: "/app/me", match: /^\/app\/me/, icon: "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" },
];
const SITE_TABS: Tab[] = [
  { label: "Home", href: "/", match: /^\/$/, icon: APP_TABS[0].icon },
  { label: "Labs", href: "/labs", match: /^\/labs/, icon: APP_TABS[2].icon },
  { label: "Courses", href: "/courses", match: /^\/courses/, icon: APP_TABS[1].icon },
  { label: "Pricing", href: "/pricing", match: /^\/pricing/, icon: "M20 12l-8 8-9-9V3h8zM7.5 7.5h.01" },
  { label: "Sign in", href: "/signin", match: /^\/(signin|onboarding|welcome)/, icon: APP_TABS[4].icon },
];
/** Focus screens (running lab, exam question, live interview) get a back bar and no tabs. */
const FOCUS = /^\/app\/(lab(?!\/launch)|exam\/q|interview\/(session|terminal|feedback|error)|practice\/)/;

const THEME_ICON: Record<Theme, string> = {
  light: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4",
  dark: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
};

const Icon = ({ d, size = 22, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

export function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return phone;
}

export default function MobileChrome({ variant, onSearch }: { variant: "app" | "site"; onSearch: () => void }) {
  const phone = useIsPhone();
  const path = usePathname();
  const router = useRouter();
  const [theme, setT] = useState<Theme>("light");
  const [title, setTitle] = useState("");
  const tabs = variant === "app" ? APP_TABS : SITE_TABS;
  const focus = variant === "app" && FOCUS.test(path);

  useEffect(() => {
    setT(getTheme());
    const on = (e: Event) => setT((e as CustomEvent<Theme>).detail);
    window.addEventListener("pd-theme", on);
    return () => window.removeEventListener("pd-theme", on);
  }, []);

  // Hide the design's desktop nav and leave room for the bars.
  useEffect(() => {
    if (!phone) return;
    setTitle(document.title.split(" · ")[0]);
    const root = document.querySelector<HTMLElement>(".pd-frame [data-pid]");
    const nav = root?.children[0] as HTMLElement | undefined;
    const isBar = nav && nav.offsetHeight > 0 && nav.offsetHeight <= 90;
    if (isBar) nav!.style.display = "none";
    document.body.classList.add("pd-phone");
    document.body.classList.toggle("pd-phone-tabs", !focus);
    return () => {
      if (isBar) nav!.style.display = "";
      document.body.classList.remove("pd-phone", "pd-phone-tabs");
    };
  }, [phone, path, focus]);

  if (!phone) return null;
  const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  const btn: React.CSSProperties = { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: 0, borderRadius: 6, background: "transparent", color: "var(--color-ink)", cursor: "pointer" };

  return (
    <>
      <header className="pd-m-top">
        {focus ? (
          <button aria-label="Back" style={btn} onClick={() => router.back()}><Icon d="M15 5l-7 7 7 7" /></button>
        ) : (
          <button aria-label="Home" onClick={() => router.push("/")} style={{ ...btn, width: "auto", padding: "0 4px" }}>
            <span style={{ display: "block", width: 104, height: 18, background: "url(/assets/poridhi-logo.png) left center/contain no-repeat" }} />
          </button>
        )}
        {focus && <span className="pd-m-title">{title}</span>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <button aria-label="Search" style={btn} onClick={onSearch}><Icon d="M11 11m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.4-4.4" size={20} /></button>
          <button aria-label={`Switch to ${next} theme`} style={btn} onClick={() => setTheme(next)}><Icon d={THEME_ICON[theme]} size={20} /></button>
        </div>
      </header>
      {!focus && (
        <nav className="pd-m-tabs" aria-label="Main">
          {tabs.map((t) => {
            const on = t.match.test(path);
            return (
              <button key={t.label} onClick={() => router.push(t.href)} aria-current={on ? "page" : undefined}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: 0, background: "transparent", color: on ? "var(--color-ink)" : "var(--color-ink-3)", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: on ? 600 : 400, cursor: "pointer", position: "relative" }}>
                {on && <motion.span layoutId="pd-tab" style={{ position: "absolute", top: 6, width: 44, height: 30, borderRadius: 6, background: "var(--dashboard-accent)" }} transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                <span style={{ position: "relative", color: on ? "var(--dashboard-accent-ink)" : undefined }}><Icon d={t.icon} /></span>
                {t.label}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
