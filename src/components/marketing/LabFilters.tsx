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
    // Real search field in place of the static placeholder.
    let query = "";
    const ph = $("299-0");
    const input = document.createElement("input");
    if (ph) {
      input.type = "search"; input.placeholder = ph.textContent?.trim() || "Search labs"; input.setAttribute("aria-label", "Search labs");
      Object.assign(input.style, { flex: "1", minWidth: "0", border: "0", outline: "0", background: "transparent", color: "var(--dashboard-text)", font: "15px/18px var(--font-sans)" });
      ph.style.display = "none"; ph.after(input);
      const box = ph.parentElement!; delete box.dataset.go; box.style.cursor = "text";
      box.addEventListener("click", () => input.focus());
      input.addEventListener("input", () => { query = input.value.trim().toLowerCase(); apply(); });
    }
    // Sort: cycles Most active → A–Z → Most labs, reordering the cards.
    const SORTS = ["Most active", "A–Z", "Most labs"];
    let sortI = 0;
    const sortEl = $("311-0");
    const original = [...cards];
    const labsIn = (c: HTMLElement) => Number((c.textContent ?? "").match(/(\d+)\s*labs/)?.[1] ?? 0);
    const titleOf = (c: HTMLElement) => (c.querySelector("[data-pid]:not(:has([data-pid]))")?.textContent ?? c.textContent ?? "").trim();
    const resort = () => {
      const order = sortI === 0 ? original : [...original].sort(sortI === 1 ? (a, b) => titleOf(a).localeCompare(titleOf(b)) : (a, b) => labsIn(b) - labsIn(a));
      order.forEach((c) => grid.insertBefore(c, empty));
      if (sortEl) sortEl.textContent = `Sort: ${SORTS[sortI]} ▾`;
    };
    if (sortEl) {
      Object.assign(sortEl.style, { cursor: "pointer", userSelect: "none" }); sortEl.setAttribute("role", "button"); sortEl.tabIndex = 0; sortEl.dataset.fb = "1";
      const f = () => { sortI = (sortI + 1) % SORTS.length; resort(); };
      sortEl.addEventListener("click", f); sortEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } });
    }
    const apply = () => {
      const topics = boxes.filter((b) => group(b) === "29C-0" && checked(b)).map((b) => label(b).split(" ")[0].toLowerCase());
      let n = 0;
      cards.forEach((c) => {
        const t = (c.textContent ?? "").toLowerCase();
        const show = (!topics.length || topics.some((k) => t.includes(k))) && (!query || query.split(/\s+/).every((w) => t.includes(w)));
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
    return () => { unstick(); handlers.forEach((u) => u()); empty.remove(); input.remove(); side.querySelectorAll(".pd-check").forEach((x) => x.remove()); };
  }, []);
  return null;
}
