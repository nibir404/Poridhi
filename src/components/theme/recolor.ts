import type { Theme } from "./theme";

/**
  * Themes by recolouring computed styles (the screens use inline design colours).
 * Light surfaces map to three distinct dark levels so page, card and inset never blend:
 *   page background → bg, white cards → card, light greys (#F4F4F4…) → inset.
 * Dark text becomes light text with AA contrast or better; tinted soft fills become dark tints;
 * saturated brand colours keep their hue and are lightened when used as text.
 * Areas the design already draws dark (hero, navy panels, lab terminal) are left as designed.
 * Originals are stored so switching back to light restores the design exactly.
 */
type Pal = { dark: boolean; bg: string; card: string; inset: string; line: string; text: string; text2: string; text3: string; tintL: number };
/** Light and dark follow the Puku palette (puku.sh): warm olive-grey neutrals, indigo accent. */
const PAL: Record<Theme, Pal> = {
  light: { dark: false, bg: "oklch(95.4% 0.009 100)", card: "oklch(98.4% 0.007 106.5)", inset: "oklch(91.8% 0.013 111.3)", line: "oklch(84.2% 0.018 120.7)", text: "oklch(28.6% 0.019 125.3)", text2: "oklch(40% 0.02 124)", text3: "oklch(50.5% 0.022 123.2)", tintL: 0 },
  dark: { dark: true, bg: "oklch(19.8% 0.004 128.7)", card: "oklch(22.9% 0.006 121.9)", inset: "oklch(26.4% 0.011 122.2)", line: "oklch(32.8% 0.014 118.6)", text: "oklch(94.7% 0.012 106.6)", text2: "oklch(82% 0.016 113)", text3: "oklch(70.2% 0.02 119.9)", tintL: 0.24 },
  terminal: { dark: true, bg: "#0B140E", card: "#122017", inset: "#1A2C20", line: "#28402F", text: "#D2F7DD", text2: "#9FD0AE", text3: "#86B796", tintL: 0.18 },
};

type RGB = [number, number, number, number];
const parse = (c: string): RGB | null => {
  const m = c.match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
};
const hsl = ([r, g, b]: RGB) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l] as const;
};
const css = (h: number, s: number, l: number, a = 1) => `hsl(${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}% / ${a})`;

function mapBg(c: RGB, p: Pal, isRoot: boolean): string | null {
  if (c[3] < 0.05) return null;
  const [h, s, l] = hsl(c);
  if (l < 0.45) return null; // already dark: keep the design
  if (s < 0.12) {
    if (isRoot || (l > 0.975 && l < 0.995)) return p.bg; // #FAFAFA page
    if (l >= 0.995) return p.card; // white card
    if (l > 0.9) return p.inset; // #F4F4F4, #EFEFEF …
    return p.line; // mid greys used as fills (progress tracks, dividers)
  }
  if (p.dark && l > 0.85) return css(h, Math.min(s, 0.45), p.tintL, c[3]); // soft tints → dark tints
  return null; // saturated fills (accent buttons, status colours) stay
}
function mapText(c: RGB, p: Pal): string | null {
  const [h, s, l] = hsl(c);
  if (s < 0.12) {
    if (l > 0.6) return null; // already light (text on dark fills)
    if (l < 0.25) return p.text;
    if (l < 0.45) return p.text2;
    return p.text3;
  }
  if (p.dark && l < 0.55) return css(h, Math.min(s, 0.8), 0.74, c[3]); // dark brand text → readable on dark
  return null;
}
function mapLine(c: RGB, p: Pal): string | null {
  if (c[3] < 0.05) return null;
  const [, s, l] = hsl(c);
  if (s < 0.12 && l > 0.7) return p.line;
  if (p.dark && s < 0.12 && l < 0.2) return p.text3; // dark outlines (selected cards) → visible
  return null;
}

const saved = new WeakMap<Element, string | null>();

function isDarkZone(el: HTMLElement) {
  // Inside an element the design paints dark (e.g. hero, navy cards, terminals): leave untouched.
  let n: HTMLElement | null = el;
  while (n && !n.classList.contains("pd-frame")) {
    if (n.dataset.pdDark) return true;
    if (n.dataset.pdLight) return false; // a light panel inside a dark area is its own light zone
    n = n.parentElement;
  }
  return false;
}

export function recolor(root: HTMLElement, theme: Theme | null) {
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement | SVGElement>("[data-pid], [data-pid] *"))];
  // Restore first, so switching dark → terminal starts from the design colours.
  all.forEach((el) => {
    if (saved.has(el)) {
      const v = saved.get(el);
      if (v === null) el.removeAttribute("style"); else el.setAttribute("style", v!);
      saved.delete(el);
    }
    if (el instanceof HTMLElement) { delete el.dataset.pdDark; delete el.dataset.pdLight; }
  });
  if (!theme) return; // restore only
  const p = PAL[theme];

  // Mark dark zones on the design colours.
  all.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const cs = getComputedStyle(el);
    const bg = parse(cs.backgroundColor);
    const darkFill = bg && bg[3] > 0.5 && hsl(bg)[2] < 0.3;
    const darkImage = cs.backgroundImage.includes("gradient") && !cs.backgroundImage.includes("255, 255, 255");
    if ((darkFill || darkImage) && el.offsetWidth > 60 && el.offsetHeight > 40) el.dataset.pdDark = "1";
    else if (bg && bg[3] > 0.9 && hsl(bg)[2] > 0.9 && el.offsetWidth > 120 && el.offsetHeight > 80) el.dataset.pdLight = "1";
  });

  all.forEach((el) => {
    const html = el instanceof HTMLElement;
    if (html && isDarkZone(el)) return;
    const cs = getComputedStyle(el);
    const set: [string, string][] = [];
    if (html) {
      const bg = parse(cs.backgroundColor);
      const nb = bg && mapBg(bg, p, el === root);
      if (nb) set.push(["background-color", nb]);
      const tx = parse(cs.color);
      const nt = tx && mapText(tx, p);
      if (nt) set.push(["color", nt]);
      (["top", "right", "bottom", "left"] as const).forEach((side) => {
        if (cs.getPropertyValue(`border-${side}-width`) === "0px") return;
        const b = parse(cs.getPropertyValue(`border-${side}-color`));
        const nl = b && mapLine(b, p);
        if (nl) set.push([`border-${side}-color`, nl]);
      });
    } else {
      for (const attr of ["stroke", "fill"] as const) {
        const v = cs.getPropertyValue(attr);
        const c = parse(v);
        if (!c) continue;
        const nv = mapText(c, p);
        if (nv) set.push([attr, nv]);
      }
    }
    if (!set.length) return;
    saved.set(el, el.getAttribute("style"));
    set.forEach(([k, v]) => (el as HTMLElement).style.setProperty(k, v, "important"));
  });
}

/** Re-applies on every theme change. Returns a cleanup. */
export function bindRecolor(root: HTMLElement, getTheme: () => Theme) {
  const run = () => recolor(root, getTheme());
  run();
  window.addEventListener("pd-theme", run);
  return () => { window.removeEventListener("pd-theme", run); recolor(root, null); };
}
