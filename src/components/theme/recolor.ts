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
/** Light and dark come from the Puku design system tokens (src/styles/puku-tokens.css). */
const DS = { bg: "var(--dashboard-main)", card: "var(--dashboard-panel)", inset: "var(--dashboard-hover)", line: "var(--dashboard-border)", text: "var(--dashboard-text)", text2: "var(--dashboard-text)", text3: "var(--dashboard-muted)" };
const PAL: Record<Theme, Pal> = {
  light: { dark: false, ...DS, tintL: 0 },
  dark: { dark: true, ...DS, tintL: 0.24 },
};
/** Design accent (#B0B3FC family) → the design system's accent; status hues → DS status tokens. */
const isAccent = ([h, s, l]: readonly [number, number, number]) => h > 225 && h < 250 && s > 0.6 && l > 0.75 && l < 0.92;
const status = (h: number, s: number, l: number): string | null => {
  if (s < 0.35 || l < 0.25 || l > 0.75) return null;
  if (h >= 95 && h <= 170) return "var(--dashboard-success)";
  if (h <= 12 || h >= 340) return "var(--dashboard-danger)";
  if (h > 12 && h <= 45) return "var(--dashboard-warning)";
  return null;
};

type RGB = [number, number, number, number];
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, RGB | null>();
/** Any CSS colour (rgb, hex, oklch, color-mix…) → sRGB via a 1×1 canvas. */
const parse = (c: string): RGB | null => {
  if (!c || c === "none" || c === "transparent") return c === "transparent" ? [0, 0, 0, 0] : null;
  if (c.includes("url(")) return null; // gradient / pattern paint (e.g. rank badges): never recolour
  if (cache.has(c)) return cache.get(c)!;
  let out: RGB | null = null;
  const m = c.startsWith("rgb") ? c.match(/[\d.]+/g) : null;
  if (m && m.length >= 3) out = [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]];
  else {
    ctx ??= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#010203"; ctx.fillStyle = c;
      if (ctx.fillStyle === "#010203") { cache.set(c, null); return null; } // not a colour
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      out = [d[0], d[1], d[2], d[3] / 255];
    }
  }
  cache.set(c, out);
  return out;
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
  // Translucent grey/white fills (search boxes, chips drawn for a dark hero) vanish on a flat
  // theme background: give them the inset surface so they read as fields.
  if (c[3] < 0.35 && s < 0.12) return p.inset;
  if (l < 0.45) {
    // Dark mode: the design's own near-black surfaces join the DS palette (sidebar / panel / hover levels).
    if (p.text === DS.text && s < 0.12 && l >= 0.04) {
      if (p.dark) return l < 0.09 ? "var(--dashboard-sidebar)" : l < 0.16 ? "var(--dashboard-panel)" : "var(--dashboard-hover)";
      // Light mode: the design's dark work areas (lab workspace, consoles, panels) become light too.
      return l < 0.09 ? "var(--dashboard-hover)" : l < 0.16 ? "var(--dashboard-panel)" : "var(--dashboard-sidebar)";
    }
    return null; // otherwise keep the design (brand navy, media)
  }
  if (s < 0.12) {
    if (isRoot) return p.bg;
    if (l > 0.975 && l < 0.995) return p.bg; // #FAFAFA page
    if (l >= 0.995) return p.card; // white card
    if (l > 0.9) return p.inset; // #F4F4F4, #EFEFEF …
    return p.line; // mid greys used as fills (progress tracks, dividers)
  }
  if (isAccent([h, s, l]) && p.text === DS.text) return "var(--dashboard-accent)";
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
  const st = p.text === DS.text ? status(h, s, l) : null;
  if (st) return st;
  if (p.dark && l < 0.55) return css(h, Math.min(s, 0.8), 0.74, c[3]); // dark brand text → readable on dark
  return null;
}
function mapLine(c: RGB, p: Pal, width = 1): string | null {
  if (c[3] < 0.05) return null;
  const [, s, l] = hsl(c);
  if (s >= 0.12) return null; // coloured borders (status, accent) keep their colour
  if (width >= 2 && l < 0.3) return "var(--dashboard-accent)"; // selected outline: accent, not black
  return p.line; // every grey border, light or dark, uses the quiet DS border
}

/** Only the properties the theme set are remembered and restored, so animation state
 *  (opacity, transforms written by GSAP) is never rolled back. */
const saved = new WeakMap<Element, Map<string, [string, string]>>();
function setProp(el: HTMLElement | SVGElement, k: string, v: string) {
  let m = saved.get(el);
  if (!m) saved.set(el, (m = new Map()));
  if (!m.has(k)) m.set(k, [el.style.getPropertyValue(k), el.style.getPropertyPriority(k)]);
  el.style.setProperty(k, v, "important");
}
function restore(el: HTMLElement | SVGElement) {
  const m = saved.get(el);
  if (!m) return;
  m.forEach(([v, pr], k) => (v ? el.style.setProperty(k, v, pr) : el.style.removeProperty(k)));
  saved.delete(el);
}


export function recolor(root: HTMLElement, theme: Theme | null) {
  // Live components (data-pd-native) theme themselves from the tokens: leave them alone.
  // (A non-design host element, e.g. the landing page's showcase frame, is not recoloured itself.)
  const all = [...(root.dataset.pid ? [root] : []), ...Array.from(root.querySelectorAll<HTMLElement | SVGElement>("[data-pid], [data-pid] *"))].filter((e) => !e.closest("[data-pd-native]"));
  // Restore first, so switching dark → terminal starts from the design colours.
  all.forEach((el) => {
    restore(el);
    if (el instanceof HTMLElement) { delete el.dataset.pdImg; delete el.dataset.pdDark; delete el.dataset.pdLight; delete el.dataset.pdAccent; }
  });
  if (!theme) return; // restore only
  const p = PAL[theme];

  // Mark dark zones on the design colours.
  all.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const cs = getComputedStyle(el);
    const bg = parse(cs.backgroundColor);
    const darkFill = bg && bg[3] > 0.5 && hsl(bg)[2] < 0.3;
    // Gradient art = a gradient whose first colour is dark (hero, product tiles); light dot grids are not art.
    const firstStop = cs.backgroundImage.includes("gradient") ? cs.backgroundImage.match(/(rgba?\([^)]+\)|oklch\([^)]+\)|#[0-9a-f]{3,8})/i) : null;
    const fc = firstStop ? parse(firstStop[1]) : null;
    const darkImage = !!fc && fc[3] > 0.3 && hsl(fc)[2] < 0.35;
    if ((darkFill || darkImage) && el.offsetWidth > 60 && el.offsetHeight > 40) { el.dataset.pdDark = "1"; if (darkImage) el.dataset.pdImg = "1"; }
    else if (bg && bg[3] > 0.9 && hsl(bg)[2] > 0.9 && el.offsetWidth > 120 && el.offsetHeight > 80) el.dataset.pdLight = "1";
  });

  all.forEach((el) => {
    const html = el instanceof HTMLElement;
    // Light themes keep areas the design paints dark; dark mode recolours them too (except media and consoles).
    // Gradient art (hero, product tiles) and media keep their colours.
    if (el.closest("[data-pd-img], video, canvas")) return;
    const cs = getComputedStyle(el);
    const set: [string, string][] = [];
    let nb: string | null | undefined = null;
    if (html) {
      const bg = parse(cs.backgroundColor);
      nb = bg && mapBg(bg, p, el === root);
      // Dark mode: thin coloured fills (progress bars, meters) in deep brand colours sink into the
      // dark surface; draw them in the bright accent instead.
      if (!nb && p.dark && bg && bg[3] > 0.5 && (el as HTMLElement).offsetHeight > 0 && (el as HTMLElement).offsetHeight <= 12) {
        const [, s2, l2] = hsl(bg);
        if (s2 >= 0.2 && l2 < 0.5) nb = "var(--dashboard-accent)";
      }
      if (nb) set.push(["background-color", nb]);
      // Dotted canvas grids: light dots become the quiet border colour in dark themes.
      if (p.dark && cs.backgroundImage.startsWith("radial-gradient(rgb(2")) set.push(["background-image", "radial-gradient(var(--dashboard-border) 1px, transparent 1px)"]);
      if (nb === "var(--dashboard-accent)") el.dataset.pdAccent = "1";
      const onAccent = !!el.closest("[data-pd-accent]");
      const tx = parse(cs.color);
      const nt = onAccent ? "var(--dashboard-accent-ink)" : tx && mapText(tx, p);
      if (nt) set.push(["color", nt]);
      (["top", "right", "bottom", "left"] as const).forEach((side) => {
        if (cs.getPropertyValue(`border-${side}-width`) === "0px") return;
        const b = parse(cs.getPropertyValue(`border-${side}-color`));
        const inDark = !p.dark && !!(el as HTMLElement).closest("[data-pd-dark]");
        const nl = b && (inDark && hsl(b)[1] < 0.12 && parseFloat(cs.getPropertyValue(`border-${side}-width`)) < 2 ? p.line : mapLine(b, p, parseFloat(cs.getPropertyValue(`border-${side}-width`))));
        if (nl) set.push([`border-${side}-color`, nl]);
      });
    } else {
      for (const attr of ["stroke", "fill"] as const) {
        const v = cs.getPropertyValue(attr);
        const c = parse(v);
        if (!c) continue;
        const nv = (el as Element).closest("[data-pd-accent]") ? (c[3] > 0 && v !== "none" ? "var(--dashboard-accent-ink)" : null) : hsl(c)[1] < 0.12 ? mapText(c, p) : null; // icons in grey follow the theme; coloured art (coins, badges) keeps its colours
        if (nv) set.push([attr, nv]);
      }
    }
    if (!set.length) return;
    set.forEach(([k, v]) => setProp(el, k, v));
  });
}

/* ---------- Contrast guard: every text meets WCAG AA against its real background ---------- */
const lum = ([r, g, b]: RGB) => {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: RGB, b: RGB) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const blend = (fg: RGB, bg: RGB): RGB => [fg[0] * fg[3] + bg[0] * (1 - fg[3]), fg[1] * fg[3] + bg[1] * (1 - fg[3]), fg[2] * fg[3] + bg[2] * (1 - fg[3]), 1];

function backdrop(el: Element): RGB {
  for (let n: Element | null = el; n; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const img = cs.backgroundImage;
    if (img && img !== "none" && img.includes("gradient")) {
      const stop = img.match(/(rgba?\([^)]+\)|oklch\([^)]+\)|#[0-9a-f]{3,8})/i);
      const c = stop && parse(stop[1]);
      if (c && c[3] > 0.5) return c;
    }
    const c = parse(cs.backgroundColor);
    if (c && c[3] > 0.5) return c;
  }
  return parse(getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255, 1];
}

export function guardContrast(root: HTMLElement) {
  const ink = parse(getComputedStyle(document.documentElement).getPropertyValue("--dashboard-text").trim()) ?? [0, 0, 0, 1];
  // Design layers and the inline spans inside them (code line numbers, timers).
  root.querySelectorAll<HTMLElement>("[data-pid], [data-pid] span").forEach((el) => {
    if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim())) return;
    if (!el.offsetWidth && !el.offsetHeight) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || +cs.opacity === 0) return;
    const fg = parse(cs.color);
    if (!fg) return;
    const bg = backdrop(el);
    const size = parseFloat(cs.fontSize);
    const large = size >= 24 || (size >= 18.66 && +cs.fontWeight >= 600);
    const need = large ? 3 : 4.5;
    if (ratio(blend(fg, bg), bg) >= need) return;
    const options: [string, RGB][] = [["var(--dashboard-text)", ink], ["#FFFFFF", [255, 255, 255, 1]], ["#000000", [0, 0, 0, 1]]];
    const best = options.map(([css, c]) => [css, ratio(c, bg)] as const).sort((a, b) => b[1] - a[1])[0];
    setProp(el, "color", best[0]);
  });
  // Grey icons (stroke or fill) need 3:1 against their backdrop (WCAG non-text contrast).
  root.querySelectorAll<SVGElement>("svg :is(path, circle, rect, line, polyline, polygon, ellipse)").forEach((el) => {
    if (el.closest("[data-pd-native]")) return;
    const cs = getComputedStyle(el);
    const bg = backdrop(el.closest("svg")!);
    for (const attr of ["stroke", "fill"] as const) {
      const c = parse(cs.getPropertyValue(attr));
      if (!c || c[3] < 0.5) continue;
      if (ratio(c, bg) >= 3) continue;
      const [h, s] = hsl(c);
      const ds = (v: string) => parse(getComputedStyle(document.documentElement).getPropertyValue(v).trim());
      const options: [string, RGB | null][] = [];
      if (s >= 0.12) {
        // Coloured icons keep their meaning: status hues → DS status colours, others → the accent.
        const tok = h >= 95 && h <= 170 ? "--dashboard-success" : h <= 12 || h >= 340 ? "--dashboard-danger" : h > 12 && h <= 45 ? "--dashboard-warning" : "--dashboard-accent";
        options.push([`var(${tok})`, ds(tok)]);
      }
      options.push(["var(--dashboard-text)", ink], ["#FFFFFF", [255, 255, 255, 1]], ["#000000", [0, 0, 0, 1]]);
      const pickC = options.find(([, o]) => o && ratio(o, bg) >= 3) ?? options[options.length - 1];
      setProp(el, attr, pickC[0]);
    }
  });
}

/** Re-applies on every theme change. Returns a cleanup. */
export function bindRecolor(root: HTMLElement, getTheme: () => Theme) {
  const run = () => { recolor(root, getTheme()); window.setTimeout(() => guardContrast(root), 0); };
  run();
  window.addEventListener("pd-theme", run);
  // Screens swapped in later (e.g. the rotating product preview) get the same treatment.
  let t = 0;
  const mo = new MutationObserver((list) => {
    const added = list.some((m) => Array.from(m.addedNodes).some((n) => n instanceof HTMLElement && (n.dataset.pid || n.querySelector("[data-pid]"))));
    if (!added) return;
    // Recolour right away: observer callbacks run before the next paint, so a newly shown
    // screen never flashes in its original (light) colours.
    clearTimeout(t);
    mo.disconnect();
    recolor(root, getTheme());
    guardContrast(root);
    mo.observe(root, { childList: true, subtree: true });
  });
  mo.observe(root, { childList: true, subtree: true });
  return () => { mo.disconnect(); clearTimeout(t); window.removeEventListener("pd-theme", run); recolor(root, null); };
}
