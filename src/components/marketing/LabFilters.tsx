"use client";
import { useEffect } from "react";
import { stickyIn } from "@/components/motion/stickyIn";

/** Lab library: sticky filter sidebar with working checkboxes that filter the lab-group cards. */
export default function LabFilters() {
  useEffect(() => {
    const $ = (p: string) => document.querySelector<HTMLElement>(`[data-pid="${p}"]`);
    const side = $("29B-0"), grid = $("3EJ-0"), count = $("310-0");
    if (!side || !grid) return;
    const unstick = stickyIn(side, side.parentElement!, 88);

    const boxes = Array.from(side.querySelectorAll<HTMLElement>("[data-pid]")).filter((el) => /^[☐☑]/.test(el.textContent?.trim() ?? ""));
    const group = (el: HTMLElement) => el.parentElement!.dataset.pid!;
    const label = (el: HTMLElement) => (el.textContent ?? "").split("·")[0].trim();
    const cards = Array.from(grid.children) as HTMLElement[];
    const empty = document.createElement("div");
    empty.textContent = "No lab groups match these filters. Clear one to see more.";
    Object.assign(empty.style, { display: "none", padding: "40px", width: "100%", textAlign: "center", color: "var(--color-ink-3)", font: "15px var(--font-sans)", border: "1px dashed var(--color-line)", borderRadius: "6px" });
    grid.appendChild(empty);

    // Swap the ☐/☑ glyphs for a real checkbox mark; state lives in aria-checked.
    boxes.forEach((b) => {
      const tn = Array.from(b.childNodes).find((n) => n.nodeType === 3 && /[☐☑]/.test(n.textContent!));
      if (tn) tn.textContent = tn.textContent!.replace(/[☐☑]\s*/, "");
      const mark = document.createElement("span");
      mark.className = "pd-check"; mark.setAttribute("aria-hidden", "true");
      mark.innerHTML = '<svg viewBox="0 0 16 16" width="12" height="12"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      b.prepend(mark);
      Object.assign(b.style, { display: "flex", alignItems: "center", gap: "10px" });
      b.tabIndex = 0;
    });
    const checked = (el: HTMLElement) => el.getAttribute("aria-checked") === "true";
    const setMark = (el: HTMLElement, on: boolean) => el.setAttribute("aria-checked", String(on));
    const apply = () => {
      const topics = boxes.filter((b) => group(b) === "29C-0" && checked(b)).map((b) => label(b).split(" ")[0].toLowerCase());
      let n = 0;
      cards.forEach((c) => {
        const t = (c.textContent ?? "").toLowerCase();
        const show = !topics.length || topics.some((k) => t.includes(k));
        c.style.display = show ? "" : "none";
        if (show) n++;
      });
      empty.style.display = n ? "none" : "block";
      const strong = count?.querySelector("span");
      if (strong) strong.textContent = `${n} lab group${n === 1 ? "" : "s"}`;
    };
    const handlers = boxes.map((b) => {
      b.style.cursor = "pointer"; b.style.userSelect = "none"; b.setAttribute("role", "checkbox");
      const h = () => { setMark(b, !checked(b)); apply(); };
      const k = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); h(); } };
      b.addEventListener("click", h); b.addEventListener("keydown", k);
      return () => { b.removeEventListener("click", h); b.removeEventListener("keydown", k); };
    });
    boxes.forEach((b) => setMark(b, false));
    apply();
    return () => { unstick(); handlers.forEach((u) => u()); empty.remove(); side.querySelectorAll(".pd-check").forEach((x) => x.remove()); };
  }, []);
  return null;
}
