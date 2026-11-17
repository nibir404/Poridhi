export type Theme = "light" | "dark";
export const THEMES: Theme[] = ["light", "dark"];
const KEY = "pd-theme";
export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const t = localStorage.getItem(KEY) as Theme | null;
  return t && THEMES.includes(t) ? t : "light";
}
export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  document.documentElement.dataset.theme = t;
  document.documentElement.dataset.pukuTheme = t === "dark" ? "dark" : "light";
  window.dispatchEvent(new CustomEvent("pd-theme", { detail: t }));
}

/**
 * Wires a design's own sun / moon / terminal button group (found by the moon icon) to the theme.
 * Returns null when the design has no such group.
 */
export function wireDesignToggle(root: HTMLElement): (() => void) | null {
  const moon = Array.from(root.querySelectorAll("svg path")).find((p) => p.getAttribute("d")?.startsWith("M20 14.5A8"));
  const group = moon?.closest("svg")?.parentElement?.parentElement as HTMLElement | undefined;
  if (!group || group.children.length !== 3) return null;
  const all = Array.from(group.children) as HTMLElement[];
  all[2].style.display = "none"; // the design's third (terminal) theme button: that theme is retired
  const btns = all.slice(0, 2);
  const paint = () => {
    const cur = THEMES.indexOf(getTheme());
    btns.forEach((b, i) => {
      b.style.background = i === cur ? "#FFFFFF" : "transparent";
      b.style.border = i === cur ? "1px solid var(--color-line)" : "1px solid transparent";
      b.querySelectorAll("path,circle").forEach((p) => p.setAttribute("stroke", i === cur ? "#0E0E0E" : "#808080"));
    });
  };
  btns.forEach((b, i) => { b.style.cursor = "pointer"; b.setAttribute("role", "radio"); b.setAttribute("aria-label", `${THEMES[i]} theme`); b.onclick = () => setTheme(THEMES[i]); });
  paint();
  window.addEventListener("pd-theme", paint);
  return () => window.removeEventListener("pd-theme", paint);
}
