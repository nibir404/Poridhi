"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import { wireDesignToggle } from "@/components/theme/theme";
import { useRouter } from "next/navigation";
import DesignFrame from "@/components/layout/DesignFrame";
import MobileChrome from "@/components/layout/MobileChrome";
import ExploreMenu from "@/components/nav/ExploreMenu";
import SearchPalette from "@/components/nav/SearchPalette";
import { enhancePage } from "@/components/motion/enhance";
import { applyGlow } from "@/components/motion/glow";
import { soften } from "@/components/motion/soften";
import { bindRecolor } from "@/components/theme/recolor";
import { getTheme as currentTheme } from "@/components/theme/theme";

/** Text on the page → route. Applied to any leaf element with exactly this text. */
const LINKS: Record<string, string> = {
  Labs: "/labs",
  Courses: "/courses",
  Pricing: "/pricing",
  "Log in": "/signin",
  "Start free": "/signin",
  "Start a free lab": "/signin",
  "Start learning free": "/signin",
  "Go Pro": "/signin?plan=pro",
  "Explore career tracks →": "/courses",
  "Verify a certificate": "/u/rahim",
  Leaderboard: "/leaderboard",
  "View modules →": "/labs/kubernetes-aws",
  "Read guide →": "/labs/guide/expose-docker-lb",
  "Lab library · 700+": "/labs",
  "Career tracks": "/courses",
  "DevOps & Cloud Engineer": "/courses/devops",
  "Browse all topics →": "/courses",
};

type Props = {
  children: React.ReactNode;
  /** Optional page-specific behaviour (e.g. Home hero shader). */
  extra?: React.ReactNode;
};

export default function MarketingShell({ children, extra }: Props) {
  const router = useRouter();
  const host = useRef<HTMLDivElement>(null);
  const [explore, setExplore] = useState(false);
  const [search, setSearch] = useState(false);
  const [slot, setSlot] = useState<{ el: HTMLElement; dark: boolean } | null>(null);

  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>("[data-pid]");
    if (!root) return;
    const kids = Array.from(root.children) as HTMLElement[];
    const nav = kids[0];
    const sections = kids.slice(1).map((k) => k.dataset.pid!).filter(Boolean);
    // Treat any flex row of 3+ similar bordered/rounded blocks as a card group.
    const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-pid]"))
      .filter((el) => {
        const c = Array.from(el.children) as HTMLElement[];
        if (c.length < 3 || c.length > 12) return false;
        const cs = getComputedStyle(el);
        if (cs.display !== "flex" || cs.flexDirection === "column") return false;
        return c.every((x) => getComputedStyle(x).borderRadius === "6px" && x.offsetWidth > 140 && x.offsetHeight > 120);
      })
      .map((el) => el.dataset.pid!);
    const undo = enhancePage({ sections, cardGroups: groups, stickyNav: nav?.dataset.pid });

    // Tag links / triggers with data attributes, then handle clicks with one delegated listener.
    root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
      const t = el.textContent?.trim() ?? "";
      if (el.children.length > 2) return;
      let action = "";
      if (t === "Explore" && nav?.contains(el)) action = "explore";
      else if (t.startsWith("Search labs") && nav?.contains(el)) action = "search";
      else if (LINKS[t]) action = LINKS[t];
      if (!action) return;
      const p = el.parentElement;
      const target = (p && p.children.length <= 3 && getComputedStyle(p).borderRadius !== "0px" ? p : el) as HTMLElement;
      target.dataset.go = action;
      target.style.cursor = "pointer";
      target.setAttribute("role", "link");
      target.tabIndex = 0;
    });
    const logo = nav ? Array.from(nav.querySelectorAll<HTMLElement>("[data-pid]")).find((e) => e.style.backgroundImage.includes("logo")) : undefined;
    if (logo) {
      logo.dataset.go = "/";
      logo.style.cursor = "pointer";
    }
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
      if (!t || !root.contains(t)) return;
      e.preventDefault();
      const go = t.dataset.go!;
      if (go === "explore") setExplore((v) => !v);
      else if (go === "search") setSearch(true);
      else router.push(go);
    };
    root.addEventListener("click", onClick);
    const handlers: [HTMLElement, () => void][] = [];
    handlers.push([root, onClick as unknown as () => void]);

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") {
        setSearch(false);
        setExplore(false);
      }
    };
    window.addEventListener("keydown", onKey);
    soften(root);
    const undoGlow = applyGlow(root);
    const undoRecolor = bindRecolor(root, currentTheme);
    // Theme switch at the start of the nav's right-hand group.
    const undoToggle = nav ? wireDesignToggle(nav) : null;
    const right = nav?.lastElementChild as HTMLElement | null;
    let mount: HTMLElement | null = null;
    if (!undoToggle && right && getComputedStyle(right).display === "flex") {
      mount = document.createElement("div");
      mount.style.display = "flex";
      right.prepend(mount);
      const m = getComputedStyle(nav!).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [255, 255, 255];
      setSlot({ el: mount, dark: !(m[3] !== undefined && m[3] < 0.5) && m[0] + m[1] + m[2] < 300 });
    }
    return () => {
      undoToggle?.();
      mount?.remove();
      setSlot(null);
      undoGlow();
      undoRecolor();
      undo();
      handlers.forEach(([el, h]) => el.removeEventListener("click", h));
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  return (
    <div ref={host}>
      <DesignFrame width={1440}>{children}</DesignFrame>
      {extra}
      {slot && createPortal(<ThemeSwitch inline dark={slot.dark} />, slot.el)}

      <ExploreMenu open={explore} onClose={() => setExplore(false)} />
      <SearchPalette open={search} onClose={() => setSearch(false)} />
      <MobileChrome variant="site" onSearch={() => setSearch(true)} />
    </div>
  );
}
