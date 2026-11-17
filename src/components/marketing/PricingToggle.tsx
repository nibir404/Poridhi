"use client";
import { useEffect } from "react";

/** Pricing: a real Monthly / Yearly segmented control (one row, clear selected state) that updates Pro's price. */
export default function PricingToggle() {
  useEffect(() => {
    const $ = (p: string) => document.querySelector<HTMLElement>(`[data-pid="${p}"]`);
    const group = $("2HE-0"), monthly = $("2HF-0"), yearly = $("2HH-0"), price = $("2IA-0"), per = $("2IB-0");
    if (!group || !monthly || !yearly) return;
    group.setAttribute("role", "radiogroup"); group.setAttribute("aria-label", "Billing period");
    Object.assign(group.style, { display: "inline-flex", flexWrap: "nowrap", alignItems: "center", width: "fit-content", gap: "2px", padding: "3px", borderRadius: "8px", background: "var(--dashboard-hover)", border: "1px solid var(--dashboard-border)" });
    const opts = [monthly, yearly];
    const set = (yr: boolean) => {
      opts.forEach((o, i) => {
        const on = (i === 1) === yr;
        o.dataset.fb = "1"; o.setAttribute("role", "radio"); o.setAttribute("aria-checked", String(on)); o.tabIndex = 0;
        Object.assign(o.style, { cursor: "pointer", whiteSpace: "nowrap", height: "32px", borderRadius: "6px", borderStyle: "solid", borderWidth: "1px", transition: "background .15s, border-color .15s",
          background: on ? "var(--dashboard-panel)" : "transparent", borderColor: on ? "var(--dashboard-border)" : "transparent", boxShadow: on ? "0 1px 2px rgba(0,0,0,.25)" : "none" });
        const label = o.firstElementChild as HTMLElement | null;
        if (label) { label.style.color = on ? "var(--dashboard-text)" : "var(--dashboard-muted)"; label.style.fontWeight = on ? "600" : "500"; }
      });
      if (price) price.textContent = yr ? "৳1,250" : "৳1,500";
      if (per) per.textContent = yr ? "/ month · billed ৳15,000 yearly" : "/ month · or ৳15,000 / year";
    };
    const offs = opts.map((o, i) => {
      const f = () => set(i === 1);
      const k = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } if (e.key === "ArrowRight" || e.key === "ArrowLeft") { set(!(i === 1)); opts[i === 1 ? 0 : 1].focus(); } };
      o.addEventListener("click", f); o.addEventListener("keydown", k);
      return () => { o.removeEventListener("click", f); o.removeEventListener("keydown", k); };
    });
    set(false);
    return () => offs.forEach((f) => f());
  }, []);
  return null;
}
