"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SearchPalette from "@/components/nav/SearchPalette";
import { useRouter } from "next/navigation";
import DesignFrame from "@/components/layout/DesignFrame";
import MobileChrome from "@/components/layout/MobileChrome";
import { enhancePage } from "@/components/motion/enhance";
import { applyGlow } from "@/components/motion/glow";
import { wireCopy } from "@/components/motion/copyButtons";
import { soften } from "@/components/motion/soften";
import { bindRecolor } from "@/components/theme/recolor";
import { getTheme as currentTheme } from "@/components/theme/theme";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import AccountMenu from "./AccountMenu";
import AppHeader from "./AppHeader";
import SiteHeader from "@/components/layout/SiteHeader";
import ChipPopover, { type Chip } from "./ChipPopover";
import RedeemDialog from "./RedeemDialog";
import { getWallet, fmtBank, openRedeem } from "@/data/wallet";
import { seed } from "@/data/seed";
import { wireIcons } from "./iconLinks";
import { stickyIn } from "@/components/motion/stickyIn";
import { getTheme, setTheme, THEMES } from "@/components/theme/theme";
import { APP_LINKS, SCREEN_LINKS } from "@/data/routes";
import { screenBehaviours } from "./behaviours";
import { applyContext } from "./context";

/**
 * Wraps a generated Paper app screen (1600px artboard) with:
 * - text → route links (app nav, buttons, sidebars),
 * - "pick one" selection for option cards (onboarding, plans, filters),
 * - per-screen behaviours (OTP, timers, live states) seeded from src/data/seed.ts,
 * - the shared motion layer.
 */
const bar0Early = (root: HTMLElement) => { const b = root.children[0] as HTMLElement | undefined; return b && b.offsetHeight <= 90 ? b : undefined; };

export default function AppShell({ screen, children }: { screen: string; children: React.ReactNode }) {
  const withHeader = !screen.startsWith("Auth"); // every /app screen; sign-in uses the site header
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState(false);
  const [hasToggle, setHasToggle] = useState(true);
  const [account, setAccount] = useState<DOMRect | null>(null);
  const [chip, setChip] = useState<{ which: Chip; at: DOMRect } | null>(null);
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

    // Buttons ↔ seed entities (modules, labs, exam questions).
    applyContext(root, screen);

    // App bar: logo → landing page; time-bank and streak chips open their flows.
    const chipOffs: (() => void)[] = [];
    const barEl = bar0Early(root);
    if (barEl) Array.from(barEl.querySelectorAll<HTMLElement>("[data-pid]")).forEach((el) => {
      if (el.style.backgroundImage.includes("poridhi-logo")) { el.dataset.go = "/"; el.style.cursor = "pointer"; el.setAttribute("role", "link"); el.setAttribute("aria-label", "Poridhi home"); return; }
      const t = el.textContent?.trim() ?? "";
      const flame = !!el.querySelector('path[d^="M12 21a6 6 0 0 0 6-6"]');
      const glass = !!el.querySelector('path[d^="M7 3h10M7 21h10"]');
      if (el.children.length > 3 || !((flame && /^\d+$/.test(t)) || (glass && /bank$/.test(t)))) return;
      const which: Chip = flame ? "streak" : "bank";
      delete el.dataset.go;
      el.style.cursor = "pointer";
      el.setAttribute("role", "button");
      el.setAttribute("aria-haspopup", "dialog");
      el.setAttribute("aria-label", which === "bank" ? "Time bank" : "Streak");
      const open = (e: Event) => { e.stopPropagation(); e.preventDefault(); setChip((c) => (c?.which === which ? null : { which, at: el.getBoundingClientRect() })); };
      el.addEventListener("click", open, true);
      chipOffs.push(() => el.removeEventListener("click", open, true));
    });

    // Redeem actions open the redeem dialog; coin and bank figures follow the wallet.
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
      const t = el.textContent?.trim() ?? "";
      if (el.children.length) return;
      if (/^Redeem( →| coins)?$/.test(t)) {
        const btn = (el.parentElement && el.parentElement.children.length <= 2 ? el.parentElement : el) as HTMLElement;
        btn.dataset.go = "redeem"; btn.style.cursor = "pointer"; btn.setAttribute("role", "button");
      }
      const coins = seed.coins.toLocaleString("en-US");
      if (t === coins) el.dataset.wallet = "coins";
      else if (t === `${fmtBank(seed.timeBank.minutes)} bank`) el.dataset.wallet = "bank";
      else if (t === fmtBank(seed.timeBank.minutes)) el.dataset.wallet = "bankshort";
    });
    const syncWallet = () => {
      const w = getWallet();
      root.querySelectorAll<HTMLElement>("[data-wallet]").forEach((el) => {
        el.textContent = el.dataset.wallet === "coins" ? w.coins.toLocaleString("en-US") : el.dataset.wallet === "bank" ? `${fmtBank(w.minutes)} bank` : fmtBank(w.minutes);
      });
    };
    syncWallet();
    window.addEventListener("pd-wallet", syncWallet);
    chipOffs.push(() => window.removeEventListener("pd-wallet", syncWallet));

    // Avatar (round, outlined, last in the app bar) opens the account menu.
    const bar0 = root.children[0] as HTMLElement | undefined;
    const avatar = bar0 && bar0.offsetHeight <= 90 ? Array.from(bar0.querySelectorAll<HTMLElement>("[data-pid]")).reverse().find((e) => getComputedStyle(e).borderTopLeftRadius === "999px" && e.offsetWidth <= 44 && e.offsetWidth >= 28) : undefined;
    const openAccount = (e: Event) => { e.stopPropagation(); setAccount((cur) => (cur ? null : avatar!.getBoundingClientRect())); };
    if (avatar) {
      avatar.style.cursor = "pointer";
      avatar.setAttribute("role", "button");
      avatar.setAttribute("aria-label", "Account menu");
      avatar.tabIndex = 0;
      avatar.addEventListener("click", openAccount);
    }

    // One header everywhere: the native AppHeader replaces the design's global app bar. Task bars
    // (lab, exam, interview) stay, sticky right under it; side columns stay in view below both.
    const stickies: (() => void)[] = [];
    const appBar = bar0Early(root);
    const bodyRow = root.children[1] as HTMLElement | undefined;
    const isGlobalBar = !!appBar && ["Home", "Learn", "Labs", "Practice", "Me"].every((t) => Array.from(appBar.querySelectorAll("[data-pid]")).some((e) => !e.children.length && e.textContent?.trim() === t));
    if (withHeader && isGlobalBar) appBar!.style.display = "none";
    if (appBar && bodyRow && !root.closest(".pd-reflow")) {
      const zoom = root.getBoundingClientRect().width / (root.offsetWidth || 1) || 1;
      const headerH = withHeader ? 64 / zoom : 0; // native header height, in design px
      let top = headerH;
      if (!(withHeader && isGlobalBar)) {
        Object.assign(appBar.style, { position: "relative", zIndex: "60" });
        if (getComputedStyle(appBar).backgroundColor === "rgba(0, 0, 0, 0)") appBar.style.backgroundColor = "var(--dashboard-main)";
        stickies.push(stickyIn(appBar, root, headerH));
        appBar.style.alignSelf = "stretch";
        top += appBar.offsetHeight;
      }
      (Array.from(bodyRow.children) as HTMLElement[]).forEach((col) => {
        const w = col.offsetWidth;
        const cs = getComputedStyle(col);
        if (w < 48 || w > 440 || cs.flexShrink !== "0" || col.offsetHeight < 300) return; // side columns only
        col.style.height = `${Math.round(window.innerHeight / zoom - top)}px`;
        col.style.overflowY = "auto";
        col.setAttribute("data-lenis-prevent", "");
        stickies.push(stickyIn(col, bodyRow, top));
      });
    }

    // Icon-only buttons on lab, exam and interview screens.
    const undoIcons = wireIcons(root, screen);

    // Lab icon strip: each tool icon opens its panel (matched by icon shape, so order changes don't matter).
    if (screen.startsWith("Lab")) {
      const RAIL: [string, string, string][] = [
        ["M6 3h9l4 4v14H", "/app/lab", "Lab guide"],
        ["M3 7h7l2 2h9v1", "/app/lab/files", "Files"],
        ["M7 18a4.5 4.5", "/app/lab/resources", "Cloud resources"],
        ["M11 12l9-9M17", "/app/lab/credentials", "Credentials"],
        ["M12 11v6M12 7.", "/app/lab/info", "Lab info"],
      ];
      root.querySelectorAll<HTMLElement>("[data-pid]").forEach((rail) => {
        const kids = Array.from(rail.children) as HTMLElement[];
        if (rail.style.flexDirection !== "column" || kids.length < 3 || !kids.every((k) => !k.textContent?.trim() && k.querySelector("svg"))) return;
        kids.forEach((k) => {
          const d = k.querySelector("path")?.getAttribute("d") ?? "";
          const hit = RAIL.find(([p]) => d.startsWith(p));
          if (!hit) return;
          k.dataset.go = hit[1];
          k.style.cursor = "pointer";
          k.setAttribute("role", "link");
          k.setAttribute("aria-label", hit[2]);
          k.title = hit[2];
        });
      });
    }

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
      if (t?.dataset.go === "redeem") { e.preventDefault(); openRedeem(); return; }
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

    soften(root);
    const undoGlow = applyGlow(root);
    const undoCopy = wireCopy(root);
    const undoRecolor = bindRecolor(root, currentTheme);
    return () => {
      undoGlow();
      chipOffs.forEach((f) => f());
      stickies.forEach((f) => f());
      undoIcons();
      undoCopy();
      avatar?.removeEventListener("click", openAccount);
      undoRecolor();
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
      {!withHeader && <SiteHeader />}
      {withHeader && <AppHeader onSearch={() => setSearch(true)} onChip={(which, at) => setChip((c) => (c?.which === which ? null : { which, at }))} onAccount={(at) => setAccount((a) => (a ? null : at))} />}
      <DesignFrame width={1600}>{children}</DesignFrame>
      <SearchPalette open={search} onClose={() => setSearch(false)} />
      <AccountMenu anchor={account} onClose={() => setAccount(null)} />
      <ChipPopover chip={chip?.which ?? null} anchor={chip?.at ?? null} onClose={() => setChip(null)} />
      <RedeemDialog />
      <MobileChrome variant="app" onSearch={() => setSearch(true)} />
      {!withHeader && !hasToggle && (slot ? createPortal(<ThemeSwitch inline dark={slot.dark} />, slot.el) : <ThemeSwitch />)}
    </div>
  );
}
