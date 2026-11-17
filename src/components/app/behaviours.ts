"use client";
import { gsap } from "gsap";
import { seed } from "@/data/seed";
import { notes } from "@/data/entities";

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

  // Notes: course and module filters, search, pick a note, play/edit/delete, export as Markdown.
  MeNotes(root, go) {
    const offs: (() => void)[] = [];
    const on = (el: HTMLElement | null, ev: string, fn: (e: Event) => void) => { if (!el) return; el.style.cursor = "pointer"; el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };
    const cards = notes.map((n) => ({ n, el: $(root, n.card) })).filter((c) => c.el) as { n: (typeof notes)[number]; el: HTMLElement }[];
    let course = "devops", mod = "all", query = "", picked = notes[0];

    const course$ = [["I9E-0", "all"], ["I9H-0", "devops"], ["I9L-0", "k8s"], ["I9P-0", "go"], ["I9T-0", "lab"]] as const;
    const mod$ = [["I9Y-0", "all"], ["IA0-0", "M1"], ["IA2-0", "M2"], ["IA4-0", "M3"], ["IA6-0", "highlight"]] as const;
    const empty = document.createElement("div");
    Object.assign(empty.style, { padding: "28px", textAlign: "center", color: "var(--color-ink-3)", fontFamily: "var(--font-sans)", fontSize: "14px", border: "1px dashed var(--color-line)", borderRadius: "6px", display: "none" });
    empty.textContent = "No notes match. Try another course or clear the search.";
    cards[0]?.el.parentElement?.appendChild(empty);

    const chip = (el: HTMLElement | null, active: boolean, dark: boolean) => {
      if (!el) return;
      if (dark) { el.style.background = active ? "var(--color-ink)" : "transparent"; el.style.border = active ? "1px solid var(--color-ink)" : "1px solid var(--color-line)"; el.querySelectorAll<HTMLElement>("div").forEach((d) => (d.style.color = active ? "var(--color-bg)" : "var(--color-ink)")); }
      else { el.style.borderWidth = active ? "2px" : "1px"; el.style.borderStyle = active ? "solid" : (el === $(root, "I9T-0") ? "dashed" : "solid"); el.style.borderColor = active ? "var(--color-ink)" : "var(--color-line)"; }
      el.setAttribute("aria-pressed", String(active));
    };
    const pick = (n: (typeof notes)[number]) => {
      picked = n;
      cards.forEach((c) => (c.el.style.borderColor = c.n === n ? "var(--color-ink)" : "var(--color-line)"));
      const set = (pid: string, t: string) => { const e = $(root, pid); if (e) e.textContent = t; };
      set("HN8-0", n.title); set("HNK-0", n.meta); set("HNL-0", n.body); set("HNI-0", n.at ? `Jump to ${n.at}` : "Open lab");
      const tags = $(root, "HNM-0");
      if (tags) Array.from(tags.children).forEach((t, i) => { const d = t.querySelector("div"); (t as HTMLElement).style.display = n.tags[i] ? "" : "none"; if (d && n.tags[i]) d.textContent = n.tags[i]; });
    };
    const render = () => {
      course$.forEach(([pid, k]) => chip($(root, pid), course === k, false));
      mod$.forEach(([pid, k]) => chip($(root, pid), mod === k, true));
      let shown = 0;
      cards.forEach(({ n, el }) => {
        const ok = (query || course === "all" || n.course === course) && (query || mod === "all" || (mod === "highlight" ? !!n.highlight : n.module === mod)) &&
          (!query || `${n.title} ${n.body} ${n.highlight ?? ""} ${n.tags.join(" ")}`.toLowerCase().includes(query));
        el.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      empty.style.display = shown ? "none" : "block";
      const first = cards.find((c) => c.el.style.display !== "none");
      if (first && first.el.style.display !== "none" && cards.find((c) => c.n === picked)?.el.style.display === "none") pick(first.n);
    };
    course$.forEach(([pid, k]) => on($(root, pid), "click", () => { course = k; mod = "all"; render(); }));
    mod$.forEach(([pid, k]) => on($(root, pid), "click", () => { mod = k; render(); }));
    cards.forEach(({ n, el }) => on(el, "click", () => pick(n)));

    // Search notes: real input.
    const box = $(root, "HLQ-0"), ph = $(root, "HLU-0");
    if (box && ph) {
      const input = document.createElement("input");
      Object.assign(input, { type: "search", placeholder: "Search notes" });
      input.setAttribute("aria-label", "Search notes");
      Object.assign(input.style, { all: "unset", flex: "1", minWidth: "0", fontFamily: "var(--font-sans)", fontSize: "13px", lineHeight: "16px", color: "var(--color-ink)" });
      ph.replaceWith(input);
      const onInput = () => { query = input.value.trim().toLowerCase(); render(); };
      input.addEventListener("input", onInput);
      offs.push(() => input.removeEventListener("input", onInput));
    }
    // Player, edit, delete.
    const open = () => go(picked.m ? `/app/learn/class?m=${picked.m}${picked.at ? `&t=${picked.at}` : ""}` : "/app/lab");
    on($(root, "HNF-0"), "click", open);
    on($(root, "HNI-0"), "click", open);
    on($(root, "HNA-0"), "click", () => go(picked.m ? `/app/learn/class/note?m=${picked.m}` : "/app/learn/class/note"));
    on($(root, "HNC-0"), "click", () => {
      const c = cards.find((x) => x.n === picked);
      if (!c) return;
      gsap.to(c.el, { opacity: 0, height: 0, paddingBlock: 0, marginBottom: -10, duration: 0.25, onComplete: () => { c.el.remove(); cards.splice(cards.indexOf(c), 1); if (cards[0]) pick(cards[0].n); render(); } });
    });
    // Export .md: downloads the visible notes as Markdown.
    on($(root, "HLV-0"), "click", () => {
      const md = ["# Poridhi notes", "", ...cards.filter((c) => c.el.style.display !== "none").flatMap(({ n }) => [`## ${n.title}${n.at ? ` (${n.at})` : ""}`, "", ...(n.highlight ? [`> ${n.highlight}`, ""] : []), n.body, "", n.tags.join(" "), ""])].join("\n");
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([md], { type: "text/markdown" })), download: "poridhi-notes.md" });
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    // Sort toggle.
    const sort = $(root, "IA8-0");
    let newest = true;
    on(sort, "click", () => {
      newest = !newest;
      if (sort) sort.textContent = `Sort: ${newest ? "Newest" : "Oldest"} ▾`;
      const list = cards[0]?.el.parentElement;
      if (list) cards.map((c) => c.el).reverse().forEach((el) => list.insertBefore(el, empty)); // flip the current order
      cards.reverse();
    });
    pick(picked);
    render();
    return () => { offs.forEach((f) => f()); empty.remove(); };
  },
};
