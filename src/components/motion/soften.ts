/**
 * Tones down pure-black fills from the design.
 * - Small black chips, selected rows and badges become soft lavender with navy text.
 * - Large black panels become the brand night navy.
 * Lab terminal panels (.pd-term / monospace consoles) are left alone.
 */
const BLACK = /^rgb\((14|18|23|26), \1, \1\)$/;
const NAVY = "var(--dashboard-text)"; // text colour on the grey chip (black on light, white on dark)
const PANEL = "#111111"; // large black panels: near-black, true to the black-and-white theme

export function soften(root: HTMLElement) {
  // Design system metrics: controls keep --puku-radius (6px); panels use --puku-radius-panel (12px).
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    if (el.style.borderRadius !== "6px" || el.offsetWidth < 240 || el.offsetHeight < 120) return;
    const cs = getComputedStyle(el);
    if (cs.borderTopWidth !== "0px" || cs.backgroundColor !== "rgba(0, 0, 0, 0)") el.style.borderRadius = "var(--puku-radius-panel)";
  });
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    const cs = getComputedStyle(el);
    if (!BLACK.test(cs.backgroundColor) || el.closest(".pd-term")) return;
    const r = el.getBoundingClientRect();
    const zoom = r.width / (el.offsetWidth || 1) || 1;
    const h = r.height / zoom;
    const mono = /mono/i.test(cs.fontFamily) || !!el.querySelector('[style*="mono" i]');
    if (h <= 48 && !mono) {
      el.style.backgroundColor = "var(--dashboard-hover)";
      [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))].forEach((n) => {
        if (n instanceof SVGElement) {
          if (/^#fff(fff)?$/i.test(n.getAttribute("stroke") ?? "")) (n as SVGElement).style.stroke = NAVY;
          if (/^#fff(fff)?$/i.test(n.getAttribute("fill") ?? "")) (n as SVGElement).style.fill = NAVY;
        } else if (getComputedStyle(n).color === "rgb(255, 255, 255)") n.style.color = NAVY;
      });
    } else if (!mono) {
      el.style.backgroundColor = PANEL;
    }
  });
}
