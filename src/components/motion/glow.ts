"use client";
/**
 * Adds the cursor-following glow edge to every card and button inside `root`.
 * Cards: rounded (6px) boxes with a border or fill, big enough to be a card.
 * Buttons: 32–48px tall rounded elements with an accent/dark fill.
 */
export function applyGlow(root: ParentNode) {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-pid]"));
  const isBtn = (el: HTMLElement, cs: CSSStyleDeclaration) =>
    el.offsetHeight >= 30 && el.offsetHeight <= 48 && el.offsetWidth < 420 &&
    /rgb\((176, 179, 252|191, 194, 255|14, 14, 14)\)/.test(cs.backgroundColor);
  els.forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.borderRadius !== "6px") return;
    if (isBtn(el, cs)) { el.classList.add("pd-glow-btn"); return; }
    const bordered = cs.borderTopWidth !== "0px" || cs.backgroundColor !== "rgba(0, 0, 0, 0)" || cs.backgroundImage !== "none";
    if (bordered && el.offsetWidth >= 160 && el.offsetHeight >= 60 && el.offsetWidth < 1300) el.classList.add("pd-glow");
  });
  const move = (e: PointerEvent) => {
    const t = (e.target as HTMLElement)?.closest?.<HTMLElement>(".pd-glow");
    if (!t) return;
    const r = t.getBoundingClientRect();
    const z = r.width / t.offsetWidth || 1; // account for DesignFrame zoom
    t.style.setProperty("--mx", `${(e.clientX - r.left) / z}px`);
    t.style.setProperty("--my", `${(e.clientY - r.top) / z}px`);
  };
  document.addEventListener("pointermove", move, { passive: true });
  return () => document.removeEventListener("pointermove", move);
}
