/**
 * Phone / tablet reflow for fixed-width Paper artboards.
 * The designs are absolute-pixel desktop layouts; below the breakpoint we stop scaling
 * and instead loosen them so content stacks into a single readable column:
 * wide fixed widths become fluid, overflowing rows wrap or stack, tall fixed heights
 * become auto, oversized spacing and type shrink, and app sidebars collapse.
 */
export const REFLOW_BELOW = 1024;

const px = (v: string) => (v.endsWith("px") ? parseFloat(v) : NaN);

export function reflow(root: HTMLElement) {
  const vw = root.clientWidth || document.documentElement.clientWidth;
  const phone = vw < 768;
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))].filter(
    (el) => !(el instanceof SVGElement) || el.tagName.toLowerCase() === "svg",
  );

  // Pass 1: sizes, spacing, type (cheap, no layout reads).
  for (const el of all) {
    const s = el.style;
    if (el instanceof SVGElement) continue;
    if (!el.children.length && (el.textContent ?? "").trim().length <= 12) s.whiteSpace = "nowrap"; // badges, chips, numbers
    const w = px(s.width);
    if (w > vw - 24) { s.width = "100%"; s.maxWidth = "100%"; }
    const mw = px(s.minWidth);
    if (mw > vw - 24) s.minWidth = "0";
    const h = px(s.height);
    if (h > 560) { s.height = "auto"; s.minHeight = "0"; }
    if (s.overflow === "clip" || s.overflow === "hidden") s.overflow = "visible";
    for (const k of ["paddingInline", "paddingLeft", "paddingRight"] as const) {
      const v = px(s[k]);
      if (v > 32) s[k] = phone ? "16px" : "24px";
    }
    const pb = px(s.paddingBlock);
    if (pb > 64) s.paddingBlock = phone ? "40px" : "56px";
    const g = px(s.gap);
    if (g > 32) s.gap = phone ? "20px" : "28px";
    const fs = px(s.fontSize);
    if (fs > 30) {
      const n = Math.max(phone ? 28 : 34, Math.round(fs * (phone ? 0.6 : 0.75)));
      s.fontSize = `${n}px`;
      const lh = px(s.lineHeight);
      if (lh) s.lineHeight = `${Math.round(n * (lh / fs))}px`;
    }
    // App sidebars (fixed narrow, full-height columns) collapse on phones.
    if (phone && w >= 200 && w <= 320 && s.flexShrink === "0" && s.flexDirection === "column" && el.offsetHeight > 500 && el.parentElement?.style.display === "flex") {
      s.display = "none";
    }
  }

  // Pass 2 (top-down): rows that overflow or squeeze their children re-flow.
  // Several similar blocks become a 2-column grid; a wide child stacks the row; small chips wrap.
  for (const el of all) {
    if (el instanceof SVGElement) continue;
    const s = el.style;
    if (s.display !== "flex" || !el.offsetWidth) continue;
    if (s.flexDirection === "column") {
      // Vertical icon rails (lab tools) turn into a horizontal strip.
      const k = Array.from(el.children) as HTMLElement[];
      if (k.length >= 3 && k.every((c) => c.offsetWidth <= 48 && c.offsetHeight <= 48 && !(c.textContent ?? "").trim())) {
        s.flexDirection = "row"; s.justifyContent = "center"; s.height = "auto"; s.width = "100%";
      }
      continue;
    }
    const kids = (Array.from(el.children) as HTMLElement[]).filter((k) => k.offsetWidth || k.offsetHeight);
    if (kids.length < 2) continue;
    const overflow = el.scrollWidth > el.clientWidth + 2;
    const squeezed = kids.some((k) => k.offsetWidth < 120 && (k.textContent?.trim().length ?? 0) > 10 && k.offsetHeight > 48);
    if (!overflow && !squeezed) continue;
    const textual = kids.filter((k) => (k.textContent?.trim().length ?? 0) > 0);
    const blocks = kids.length >= 3 && textual.length === kids.length && kids.every((k) => k.children.length > 0);
    const wide = kids.some((k) => k.offsetWidth > el.clientWidth * 0.45);
    const fluid = (k: HTMLElement) => { if (px(k.style.width) > 0) k.style.width = "auto"; k.style.flexBasis = "auto"; k.style.maxWidth = "100%"; k.style.minWidth = "0"; };
    if (blocks && !wide && kids.length <= 8) {
      s.display = "grid";
      s.gridTemplateColumns = `repeat(${phone ? 2 : 3}, minmax(0, 1fr))`;
      kids.forEach(fluid);
    } else if (wide || blocks) {
      s.flexDirection = "column";
      s.alignItems = "stretch";
      kids.forEach((k) => { fluid(k); if (px(k.style.width) > 0 || k.style.width === "auto") k.style.width = "100%"; });
    } else {
      s.flexWrap = "wrap";
    }
  }
}
