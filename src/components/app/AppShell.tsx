"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SearchPalette from "@/components/nav/SearchPalette";
import { useRouter } from "next/navigation";
import DesignFrame from "@/components/layout/DesignFrame";
import { enhancePage } from "@/components/motion/enhance";
import { applyGlow } from "@/components/motion/glow";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import { getTheme, setTheme, THEMES } from "@/components/theme/theme";
import { APP_LINKS, SCREEN_LINKS } from "@/data/routes";
import { screenBehaviours } from "./behaviours";

/**
 * Wraps a generated Paper app screen (1600px artboard) with:
 * - text → route links (app nav, buttons, sidebars),
 * - "pick one" selection for option cards (onboarding, plans, filters),
 * - per-screen behaviours (OTP, timers, live states) seeded from src/data/seed.ts,
 * - the shared motion layer.
 */
export default function AppShell({ screen, children }: { screen: string; children: React.ReactNode }) {
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState(false);
  const [hasToggle, setHasToggle] = useState(true);
  const [slot, setSlot] = useState<{ el: HTMLElement; dark: boolean } | null>(null);

  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>("[data-pid]");
    if (!root) return;

    // 0) Design annotations ("STATE · …" variant boxes, "MOTION SPEC" cards) are notes for the
    //    designer, not product UI — hide them.
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
      if (el.children.length || !/^(STATE ·|MOTION SPEC)/.test(el.textContent?.trim() ?? "")) return;
      let box: HTMLElement | null = el;
      while (box && box !== root && getComputedStyle(box).borderTopStyle !== "dashed") box = box.parentElement;
      if (box && box !== root) {
        const p = box.parentElement!;
        const allNotes = Array.from(p.children).every((c) => getComputedStyle(c).borderTopStyle === "dashed");
        (allNotes && p !== root ? p : box).style.display = "none";
      } else if (el.parentElement && el.parentElement.firstElementChild === el && el.parentElement !== root) {
        el.parentElement.style.display = "none";
      }
    });

    // 1) Links by visible text.
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
      if (el.children.length > 3) return;
      const t = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      const to = SCREEN_LINKS[screen]?.[t] ?? APP_LINKS[t];
      if (!to) return;
      const p = el.parentElement;
      const target = (p && p.children.length <= 3 && /6px|4px/.test(getComputedStyle(p).borderRadius) ? p : el) as HTMLElement;
      target.dataset.go = to;
      target.style.cursor = "pointer";
      target.setAttribute("role", "link");
    });

    // 2) Option groups: siblings that share the "selected" look (2px dark border) become a radio group.
    const isSel = (el: HTMLElement) => getComputedStyle(el).borderTopWidth === "2px";
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((group) => {
      const kids = Array.from(group.children) as HTMLElement[];
      if (kids.length < 2 || kids.length > 8) return;
      const selected = kids.filter(isSel);
      if (selected.length !== 1) return;
      const others = kids.filter((k) => !isSel(k) && getComputedStyle(k).borderTopWidth === "1px");
      if (others.length < 1) return;
      const on = { w: "2px", c: getComputedStyle(selected[0]).borderTopColor };
      const off = { w: "1px", c: getComputedStyle(others[0]).borderTopColor };
      [...selected, ...others].forEach((k) => {
        k.style.cursor = "pointer";
        k.style.transition = "border-color .15s, transform .15s";
        k.dataset.option = group.dataset.pid;
        k.addEventListener("click", () => {
          [...selected, ...others].forEach((o) => {
            o.style.borderWidth = o === k ? on.w : off.w;
            o.style.borderColor = o === k ? on.c : off.c;
            o.style.borderStyle = "solid";
          });
        });
      });
    });

    // Search boxes in the app bar open the palette; ⌘K / Ctrl+K anywhere.
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
      if (el.children.length === 0 && /^Search /.test(el.textContent?.trim() ?? "") && el.parentElement) {
        el.parentElement.dataset.go = "search";
        el.parentElement.style.cursor = "pointer";
      }
    });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", onKey);

    // Design annotations ("STATE · …", "MOTION SPEC …"): hide dashed variant boxes, else just the label.
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
      if (el.children.length || !/^(STATE ·|MOTION SPEC)/.test(el.textContent?.trim() ?? "")) return;
      let box: HTMLElement | null = el.parentElement;
      for (let i = 0; i < 2 && box && getComputedStyle(box).borderTopStyle !== "dashed"; i++) box = box.parentElement;
      const target = box && getComputedStyle(box).borderTopStyle === "dashed" ? box : el;
      target.style.display = "none";
      const p = target.parentElement;
      if (p && p !== root && Array.from(p.children).every((c) => (c as HTMLElement).style.display === "none")) p.style.display = "none";
    });

    // Lab terminal: large dark mono panels (plus their dark tab strips) follow the theme via .pd-term.
    if (screen.startsWith("Lab")) {
      const lum = (e: Element) => {
        const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g)?.map(Number);
        return !m || (m[3] !== undefined && m[3] < 0.5) ? 999 : m[0] + m[1] + m[2];
      };
      root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
        if (lum(el) >= 120 || el.offsetWidth < 300 || el.offsetHeight < 150 || el.closest(".pd-term")) return;
        if (!el.querySelector('[style*="mono" i]')) return;
        const p = el.parentElement;
        const group = p && p !== root ? (Array.from(p.children) as HTMLElement[]).filter((c) => lum(c) < 120) : [el];
        group.forEach((c) => c.classList.add("pd-term"));
      });
    }

    // Theme toggle in the app bar (sun / moon / terminal) drives the shared theme.
    const moon = Array.from(root.querySelectorAll("svg path")).find((p) => p.getAttribute("d")?.startsWith("M20 14.5A8"));
    const group = moon?.closest("svg")?.parentElement?.parentElement as HTMLElement | undefined;
    const btns = group && group.children.length === 3 ? (Array.from(group.children) as HTMLElement[]) : [];
    const paint = () => {
      const cur = THEMES.indexOf(getTheme());
      btns.forEach((b, i) => {
        b.style.background = i === cur ? "#FFFFFF" : "transparent";
        b.style.border = i === cur ? "1px solid var(--color-line)" : "1px solid transparent";
        b.querySelectorAll("path,circle").forEach((p) => p.setAttribute("stroke", i === cur ? "#0E0E0E" : "#808080"));
      });
    };
    btns.forEach((b, i) => { b.style.cursor = "pointer"; b.setAttribute("role", "radio"); b.onclick = () => { setTheme(THEMES[i]); }; });
    setHasToggle(btns.length === 3);
    // No toggle in the design (lab, interview, exam): put the switch at the start of the top bar's right-hand group.
    let mount: HTMLElement | null = null;
    if (btns.length !== 3) {
      const bar = root.children[0] as HTMLElement | undefined;
      const right = bar && bar.offsetHeight <= 72 && getComputedStyle(bar).display === "flex" ? (bar.lastElementChild as HTMLElement | null) : null;
      if (right && getComputedStyle(right).display === "flex") {
        mount = document.createElement("div");
        mount.style.display = "flex";
        right.prepend(mount);
        const bg = getComputedStyle(bar!).backgroundColor.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
        const a = getComputedStyle(bar!).backgroundColor.startsWith("rgba(0, 0, 0, 0)");
        setSlot({ el: mount, dark: !a && bg[0] + bg[1] + bg[2] < 300 });
      }
    }
    paint();
    window.addEventListener("pd-theme", paint);

    // 3) One delegated click handler for links.
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
      if (t?.dataset.go === "search") { e.preventDefault(); setSearch(true); return; }
      if (!t || !root.contains(t)) return;
      e.preventDefault();
      router.push(t.dataset.go!);
    };
    root.addEventListener("click", onClick);

    // 4) Screen-specific behaviour + motion.
    const undoScreen = screenBehaviours[screen]?.(root, (to) => router.push(to));
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-pid]"))
      .filter((el) => {
        const c = Array.from(el.children) as HTMLElement[];
        return c.length >= 3 && c.length <= 8 && getComputedStyle(el).flexDirection !== "column" &&
          c.every((x) => getComputedStyle(x).borderRadius === "6px" && x.offsetHeight > 70);
      })
      .map((el) => el.dataset.pid!);
    const undoMotion = enhancePage({ cardGroups: cards });

    const undoGlow = applyGlow(root);
    return () => {
      undoGlow();
      window.removeEventListener("pd-theme", paint);
      mount?.remove();
      setSlot(null);
      root.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      undoScreen?.();
      undoMotion();
    };
  }, [router, screen]);

  return (
    <div ref={host} className="pd-app">
      <DesignFrame width={1600}>{children}</DesignFrame>
      <SearchPalette open={search} onClose={() => setSearch(false)} />
      {!hasToggle && (slot ? createPortal(<ThemeSwitch inline dark={slot.dark} />, slot.el) : <ThemeSwitch />)}
    </div>
  );
}
