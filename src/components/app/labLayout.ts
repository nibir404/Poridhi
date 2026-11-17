/**
 * Lab workspace layout: the lab fills the window and the page itself does not scroll. Only the
 * guide panel scrolls. Panes are resizable with drag handles (guide ↔ workspace, terminal ↔
 * preview), widths in design px so it works at any zoom. Double-click a handle to reset.
 */
export function labLayout(root: HTMLElement, headerPx: number): () => void {
  const body = root.children[1] as HTMLElement | undefined;
  if (!body || root.closest(".pd-reflow")) return () => {};
  const cols = Array.from(body.children) as HTMLElement[];
  const guide = cols.find((c) => c.offsetWidth >= 300 && c.offsetWidth <= 720 && getComputedStyle(c).flexDirection === "column");
  const work = guide ? (guide.nextElementSibling as HTMLElement | null) : null;
  if (!guide || !work) return () => {};
  const offs: (() => void)[] = [];
  const zoom = () => root.getBoundingClientRect().width / (root.offsetWidth || 1) || 1;

  // Lock the lab to the viewport below the app header.
  root.dataset.pdLocked = "1";
  offs.push(() => { delete root.dataset.pdLocked; });
  const fit = () => {
    const h = Math.round((window.innerHeight - headerPx) / zoom());
    root.style.minHeight = "0";
    root.style.height = `${h}px`;
    root.style.overflow = "hidden";
  };
  fit();
  window.addEventListener("resize", fit);
  offs.push(() => window.removeEventListener("resize", fit));
  Object.assign(body.style, { flex: "1 1 auto", minHeight: "0", overflow: "hidden" });
  Object.assign(guide.style, { overflowY: "auto", minHeight: "0", height: "auto", alignSelf: "stretch", overscrollBehavior: "contain" });
  guide.setAttribute("data-lenis-prevent", "");
  Object.assign(work.style, { minHeight: "0", overflow: "hidden" });

  // Resizable panes.
  const addHandle = (left: HTMLElement, right: HTMLElement, resize: HTMLElement, sign: 1 | -1, min: number, max: number) => {
    const h = document.createElement("div");
    h.setAttribute("role", "separator");
    h.setAttribute("aria-orientation", "vertical");
    h.setAttribute("aria-label", "Resize panes");
    h.tabIndex = 0;
    h.className = "pd-resizer";
    left.after(h);
    const start = resize.offsetWidth;
    const set = (w: number) => { const v = Math.max(min, Math.min(max, w)); Object.assign(resize.style, { width: `${v}px`, flex: `0 0 ${v}px`, maxWidth: "none" }); };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      const x0 = e.clientX, w0 = resize.offsetWidth, z = zoom();
      document.body.style.cursor = "col-resize";
      const move = (ev: PointerEvent) => set(w0 + sign * (ev.clientX - x0) / z);
      const up = () => { h.removeEventListener("pointermove", move); h.removeEventListener("pointerup", up); document.body.style.cursor = ""; };
      h.addEventListener("pointermove", move);
      h.addEventListener("pointerup", up);
    };
    const key = (e: KeyboardEvent) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); set(resize.offsetWidth + (e.key === "ArrowRight" ? 24 : -24) * sign); } };
    const reset = () => set(start);
    h.addEventListener("pointerdown", down);
    h.addEventListener("keydown", key);
    h.addEventListener("dblclick", reset);
    offs.push(() => { h.remove(); resize.style.width = ""; resize.style.flex = ""; });
    void right;
  };
  addHandle(guide, work, guide, 1, 300, 760);
  // Inside the workspace: the row holding terminal + preview.
  const row = Array.from(work.children).find((c) => getComputedStyle(c).flexDirection === "row" && c.children.length === 2 && (c as HTMLElement).offsetHeight > 300) as HTMLElement | undefined;
  if (row) {
    const [term, preview] = Array.from(row.children) as HTMLElement[];
    Object.assign(row.style, { minHeight: "0", flex: "1 1 auto" });
    addHandle(term, preview, preview, -1, 260, 720);
  }
  return () => offs.forEach((f) => f());
}
