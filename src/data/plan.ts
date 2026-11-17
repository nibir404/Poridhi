"use client";
import { useEffect, useState } from "react";

/**
 * Subscription and VM state for the demo.
 * - plan: "free" can open any lab and read its guide; only "pro" can launch the VM.
 * - vm: "off" | "booting" | "on" for the current lab session (sessionStorage, so a new tab starts off).
 * Both broadcast a `pd-plan` event so every open component follows along.
 */
export type Plan = "free" | "pro";
export type Vm = "off" | "booting" | "on";
const EV = "pd-plan";

export const getPlan = (): Plan => (typeof window !== "undefined" && localStorage.getItem("pd-plan") === "pro" ? "pro" : "free");
export const setPlan = (p: Plan) => { localStorage.setItem("pd-plan", p); if (p === "free") setVm("off"); window.dispatchEvent(new Event(EV)); };
export const getVm = (): Vm => (typeof window !== "undefined" ? ((sessionStorage.getItem("pd-vm") as Vm) || "off") : "off");
export const setVm = (v: Vm) => { sessionStorage.setItem("pd-vm", v); window.dispatchEvent(new Event(EV)); };

/** React hook: current plan and VM state, live. */
export function usePlan() {
  const [s, set] = useState<{ plan: Plan; vm: Vm }>({ plan: "free", vm: "off" });
  useEffect(() => {
    const f = () => set({ plan: getPlan(), vm: getVm() });
    f(); window.addEventListener(EV, f); window.addEventListener("storage", f);
    return () => { window.removeEventListener(EV, f); window.removeEventListener("storage", f); };
  }, []);
  return s;
}
