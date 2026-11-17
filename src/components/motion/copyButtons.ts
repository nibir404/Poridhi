/** "Copy" / "Copy link" buttons copy the nearby code (or the page URL) and confirm with "Copied". "Reveal" shows masked secrets. */
export function wireCopy(root: HTMLElement) {
  const onClick = (e: MouseEvent) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>("[data-copy]");
    if (!c || !root.contains(c)) return;
    e.preventDefault();
    e.stopPropagation();
    const label = [c, ...Array.from(c.querySelectorAll<HTMLElement>("*"))].find((x) => !x.children.length && /^(Copy|Reveal)/.test(x.textContent?.trim() ?? ""));
    if (c.dataset.copy === "reveal") {
      c.parentElement?.parentElement?.querySelectorAll<HTMLElement>("*").forEach((x) => { if (!x.children.length && /•{3,}/.test(x.textContent ?? "")) x.textContent = (x.textContent ?? "").replace(/•+/, "x9Lr2Qe8vT"); });
      if (label) label.textContent = "Hide";
      return;
    }
    const code = c.parentElement?.querySelector("[style*='mono' i]")?.textContent?.trim();
    navigator.clipboard?.writeText(code || window.location.href).catch(() => {});
    if (label) { const was = label.textContent; label.textContent = "Copied"; setTimeout(() => (label.textContent = was), 1400); }
  };
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    const t = el.textContent?.trim();
    if (el.children.length || !(t === "Copy" || t === "Copy link" || t === "Reveal")) return;
    const btn = (el.parentElement && el.parentElement.children.length <= 2 ? el.parentElement : el) as HTMLElement;
    btn.dataset.copy = t === "Reveal" ? "reveal" : "copy";
    btn.style.cursor = "pointer";
    btn.setAttribute("role", "button");
  });
  root.addEventListener("click", onClick, true);
  return () => root.removeEventListener("click", onClick, true);
}
