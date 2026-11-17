export type Theme = "light" | "dark" | "terminal";
export const THEMES: Theme[] = ["light", "dark", "terminal"];
const KEY = "pd-theme";
export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const t = localStorage.getItem(KEY) as Theme | null;
  return t && THEMES.includes(t) ? t : "light";
}
export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  document.documentElement.dataset.theme = t;
  window.dispatchEvent(new CustomEvent("pd-theme", { detail: t }));
}
