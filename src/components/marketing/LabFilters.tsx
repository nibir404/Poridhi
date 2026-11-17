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
    const label = (el: HTMLElement) => (el.textContent ?? "").replace(/^[☐☑]\s*/, "").split("·")[0].trim();
    const cards = Array.from(grid.children) as HTMLElement[];
    const empty = document.createElement("div");
    empty.textContent = "No lab groups match these filters. Clear one to see more.";
    Object.assign(empty.style, { display: "none", padding: "40px", width: "100%", textAlign: "center", color: "var(--color-ink-3)", font: "15px var(--font-sans)", border: "1px dashed var(--color-line)", borderRadius: "6px" });
    grid.appendChild(empty);

    const checked = (el: HTMLElement) => el.textContent!.trim().startsWith("☑");
    const setMark = (el: HTMLElement, on: boolean) => {
      const tn = Array.from(el.childNodes).find((n) => n.nodeType === 3 && /[☐☑]/.test(n.textContent!));
      if (tn) tn.textContent = tn.textContent!.replace(/[☐☑]/, on ? "☑" : "☐");
    };
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
      b.addEventListener("click", h);
      return () => b.removeEventListener("click", h);
    });
    boxes.forEach((b) => setMark(b, false));
    apply();
    return () => { unstick(); handlers.forEach((u) => u()); empty.remove(); };
  }, []);
  return null;
}
