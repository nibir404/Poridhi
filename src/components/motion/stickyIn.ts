/** Sticky that works inside zoomed DesignFrame (native position:sticky breaks under CSS zoom). */
export function stickyIn(el: HTMLElement, container: HTMLElement, topPx = 88) {
  if (el.closest(".pd-reflow")) return () => {}; // stacked layouts on phone/tablet: no sticky
  el.style.alignSelf = "flex-start";
  el.style.willChange = "transform";
  let raf = 0;
  const update = () => {
    raf = 0;
    if (el.closest(".pd-reflow")) { el.style.transform = ""; el.style.alignSelf = ""; return; } // phone/tablet: stacked, not sticky
    const zoom = el.getBoundingClientRect().width / (el.offsetWidth || 1) || 1;
    el.style.transform = "";
    const c = container.getBoundingClientRect(), s = el.getBoundingClientRect();
    const max = c.bottom - s.bottom; // room left below the element (screen px)
    const want = topPx * zoom - s.top; // topPx is in design px
    const y = Math.max(0, Math.min(want, max));
    el.style.transform = y ? `translateY(${y / zoom}px)` : "";
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener("scroll", on, { passive: true });
  window.addEventListener("resize", on);
  update();
  return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); el.style.transform = ""; };
}
