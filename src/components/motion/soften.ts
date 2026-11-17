/**
 * Tones down pure-black fills from the design.
 * - Small black chips, selected rows and badges become soft lavender with navy text.
 * - Large black panels become the brand night navy.
 * Lab terminal panels (.pd-term / monospace consoles) are left alone.
 */
const BLACK = /^rgb\((14|18|23|26), \1, \1\)$/;
const NAVY = "#1E2144";

export function soften(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    const cs = getComputedStyle(el);
    if (!BLACK.test(cs.backgroundColor) || el.closest(".pd-term")) return;
    const r = el.getBoundingClientRect();
    const zoom = r.width / (el.offsetWidth || 1) || 1;
    const h = r.height / zoom;
    const mono = /mono/i.test(cs.fontFamily) || !!el.querySelector('[style*="mono" i]');
    if (h <= 48 && !mono) {
      el.style.backgroundColor = "#EDEDF6";
      [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))].forEach((n) => {
        if (n instanceof SVGElement) {
          if (/^#fff(fff)?$/i.test(n.getAttribute("stroke") ?? "")) n.setAttribute("stroke", NAVY);
          if (/^#fff(fff)?$/i.test(n.getAttribute("fill") ?? "")) n.setAttribute("fill", NAVY);
        } else if (getComputedStyle(n).color === "rgb(255, 255, 255)") n.style.color = NAVY;
      });
    } else if (!mono) {
      el.style.backgroundColor = NAVY;
    }
  });
}
