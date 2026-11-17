"use client";
import { gsap } from "gsap";
import { seed } from "@/data/seed";

type Behaviour = (root: HTMLElement, go: (to: string) => void) => (() => void) | void;
const $ = (root: HTMLElement, pid: string) => root.querySelector<HTMLElement>(`[data-pid="${pid}"]`);
const byText = (root: HTMLElement, text: string) =>
  Array.from(root.querySelectorAll<HTMLElement>("[data-pid]")).find((e) => e.children.length === 0 && e.textContent?.trim() === text);
const clickable = (el: HTMLElement | null | undefined, fn: () => void) => {
  if (!el) return () => {};
  const t = (el.parentElement && el.parentElement.children.length === 1 ? el.parentElement : el) as HTMLElement;
  t.style.cursor = "pointer";
  t.addEventListener("click", fn);
  return () => t.removeEventListener("click", fn);
};

/** Per-screen interactive states. Keys match names in design/app-manifest.json. */
export const screenBehaviours: Record<string, Behaviour> = {
  // Sign-in: the email field becomes a real input.
  AuthSignIn(root, go) {
    const field = $(root, "HOS-0");
    if (!field) return;
    field.innerHTML = "";
    const input = document.createElement("input");
    Object.assign(input, { type: "email", placeholder: "you@example.com", value: "" });
    Object.assign(input.style, { all: "unset", width: "100%", fontSize: "13px", lineHeight: "16px", color: "#0E0E0E", fontFamily: "var(--font-sans)" });
    input.addEventListener("keydown", (e) => e.key === "Enter" && go("/signin/check-email"));
    field.appendChild(input);
  },

  // Check email: 6-digit code types itself, resend countdown ticks, then continues.
  AuthCheckEmail(root, go) {
    const boxes = ["HUY-0", "HV0-0", "HV2-0", "HV4-0", "HV6-0", "HV7-0"].map((p) => $(root, p)).filter(Boolean) as HTMLElement[];
    const tpl = $(root, "HUY-0")?.getAttribute("style") ?? "";
    const digit = (b: HTMLElement, d: string, active = false) => {
      b.setAttribute("style", tpl + (active ? "border-width:2px;" : ""));
      b.innerHTML = `<div style="font-family:var(--font-mono);font-size:20px;line-height:24px;color:#0E0E0E">${d}</div>`;
    };
    boxes.forEach((b, i) => (i < 3 ? null : (b.innerHTML = "")));
    const timers: number[] = [];
    seed.otp.split("").forEach((d, i) => {
      timers.push(window.setTimeout(() => {
        if (boxes[i]) { digit(boxes[i], d); gsap.fromTo(boxes[i], { scale: 0.9 }, { scale: 1, duration: 0.25, ease: "back.out(2)" }); }
        if (i + 1 < boxes.length && boxes[i + 1]) digit(boxes[i + 1], "▍", true);
      }, 900 + i * 260));
    });
    timers.push(window.setTimeout(() => go("/onboarding/goal"), 900 + 6 * 260 + 900));
    const resend = Array.from(root.querySelectorAll("span")).find((s) => s.textContent === "0:42");
    let s = 42;
    const iv = window.setInterval(() => { s = Math.max(0, s - 1); if (resend) resend.textContent = `0:${String(s).padStart(2, "0")}`; }, 1000);
    return () => { timers.forEach(clearTimeout); clearInterval(iv); };
  },

  AuthGoal(root, go) { return clickable(byText(root, "Continue"), () => go("/onboarding/level")); },
  AuthLevel(root, go) {
    const a = clickable(byText(root, "Continue"), () => go("/onboarding/plan"));
    const b = clickable(byText(root, "Back"), () => go("/onboarding/goal"));
    // Hours per week updates the estimate.
    const est = Array.from(root.querySelectorAll("span")).find((s) => s.textContent === "5 weeks");
    const map: Record<string, string> = { "2–4 h": "9 weeks", "5–8 h": "5 weeks", "10 h+": "3 weeks" };
    const offs: (() => void)[] = [];
    Object.keys(map).forEach((k) => offs.push(clickable(byText(root, k), () => { if (est) est.textContent = map[k]; })));
    return () => { a(); b(); offs.forEach((f) => f()); };
  },

  // Dashboard: live VM resume countdown and greeting by time of day.
  Dashboard(root) {
    const g = byText(root, "Good evening, Rahim");
    if (g) {
      const h = new Date().getHours();
      g.textContent = `${h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"}, ${seed.user.first}`;
    }
    const day = byText(root, "Sunday, 16 Nov");
    if (day) day.textContent = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
    const bars = Array.from($(root, "I2M-0")?.children ?? []) as HTMLElement[];
    const tw = gsap.fromTo(bars, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.3 });
    return () => { tw.kill(); gsap.set(bars, { clearProps: "transform" }); };
  },

  // VM boot finishes on its own and drops the student into the running lab.
  LabBoot(_root, go) { const t = window.setTimeout(() => go("/app/lab"), 6500); return () => clearTimeout(t); },
};
