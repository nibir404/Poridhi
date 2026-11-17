"use client";
import { gsap } from "gsap";

/**
 * Turns the static "Lab workspace" in the Home hero into a working demo:
 * the terminal types itself, the VM timer counts down, tabs switch views,
 * and "Check my work" passes the next check with a toast and XP.
 * Everything targets Paper layer ids, so the markup stays 1:1 with the design.
 */
const $ = (pid: string) => document.querySelector<HTMLElement>(`[data-pid="${pid}"]`);

const CHECK_SVG =
  '<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#22B866"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const VSCODE = `<div style="font-family:var(--font-mono);font-size:14px;line-height:24px;color:#D3D3D3;white-space:pre">
<span style="color:#808080">  1</span>  <span style="color:#BB80E4">services</span>:
<span style="color:#808080">  2</span>    <span style="color:#BB80E4">web</span>:
<span style="color:#808080">  3</span>      <span style="color:#BB80E4">image</span>: <span style="color:#22B866">nginx:1.27</span>
<span style="color:#808080">  4</span>      <span style="color:#BB80E4">ports</span>:
<span style="color:#808080">  5</span>        - <span style="color:#22B866">"8080:80"</span>
<span style="color:#808080">  6</span>      <span style="color:#BB80E4">deploy</span>:
<span style="color:#808080">  7</span>        <span style="color:#BB80E4">replicas</span>: <span style="color:#F0592A">3</span>  <span style="color:#616161"># step 4</span>
</div>`;

const LB = `<div style="display:flex;flex-direction:column;gap:14px;font-family:var(--font-sans)">
  <div style="display:flex;justify-content:space-between;color:#A5A5A5;font-size:13px"><span>Target group · lab-01</span><span style="color:#22B866">● healthy</span></div>
  <div style="display:flex;gap:10px">
    ${["10.61.14.250:8080", "10.61.14.251:8080", "10.61.14.252:8080"]
      .map(
        (t, i) =>
          `<div style="flex:1;padding:14px;border-radius:6px;background:#1A1A1A;border:1px solid #FFFFFF14"><div style="font-family:var(--font-mono);font-size:13px;color:#fff">${t}</div><div style="font-size:12px;color:${i === 0 ? "#22B866" : "#808080"};padding-top:6px">${i === 0 ? "200 OK · 12 ms" : "waiting for replica"}</div></div>`
      )
      .join("")}
  </div>
  <div style="font-family:var(--font-mono);font-size:13px;color:#BFC2FF">https://66dbf3-86aefdf0.lb.poridhi.io</div>
</div>`;

export function startHeroLab() {
  const term = $("1OJ-0");
  const lines = ["1OK-0", "1OL-0", "1OM-0", "1ON-0", "1OO-0", "1OP-0", "1OQ-0", "1OR-0"].map($).filter(Boolean) as HTMLElement[];
  if (!term || !lines.length) return () => {};
  const original = lines.map((l) => l.innerHTML);
  const termHTML = term.innerHTML;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  let killed = false;

  // ---- typewriter terminal -------------------------------------------------
  const type = () => {
    if (killed) return;
    lines.forEach((l) => (l.style.visibility = "hidden"));
    let t = 400;
    lines.forEach((l, i) => {
      const html = original[i];
      const isCmd = html.includes("$");
      later(() => {
        l.style.visibility = "visible";
        if (!isCmd) {
          gsap.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.25 });
          return;
        }
        // Type only the text after the prompt.
        const split = html.lastIndexOf("</span>");
        const prompt = split > -1 ? html.slice(0, split + 7) : "";
        const cmd = (split > -1 ? html.slice(split + 7) : html).replace(/&amp;/g, "&");
        let n = 0;
        l.innerHTML = prompt;
        const tick = () => {
          if (killed) return;
          n++;
          l.innerHTML = prompt + cmd.slice(0, n).replace(/&/g, "&amp;") + '<span class="pd-caret">▍</span>';
          if (n < cmd.length) later(tick, 22 + Math.random() * 30);
          else l.innerHTML = prompt + cmd.replace(/&/g, "&amp;");
        };
        tick();
      }, t);
      t += isCmd ? 300 + (html.length - 40) * 26 : 380;
    });
    later(type, t + 6000);
  };
  type();

  // ---- VM timer --------------------------------------------------------------
  const clock = $("1MX-0");
  let secs = 38 * 60 + 12;
  const iv = window.setInterval(() => {
    secs = Math.max(0, secs - 1);
    if (clock) clock.textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  }, 1000);

  // ---- tabs ------------------------------------------------------------------
  const tabs = ["1OB-0", "1OD-0", "1OF-0"].map($).filter(Boolean) as HTMLElement[];
  const tabStyle = tabs.map((t) => ({ bg: t.style.backgroundColor, color: (t.firstElementChild as HTMLElement)?.style.color }));
  const activeIdx = 0;
  const setTab = (i: number) => {
    tabs.forEach((t, j) => {
      const s = tabStyle[j === i ? activeIdx : j === activeIdx ? 1 : j];
      t.style.backgroundColor = s.bg;
      const label = t.firstElementChild as HTMLElement | null;
      if (label) label.style.color = s.color;
    });
    if (i === 0) {
      term.innerHTML = termHTML;
      // re-grab line refs after restore
      ["1OK-0", "1OL-0", "1OM-0", "1ON-0", "1OO-0", "1OP-0", "1OQ-0", "1OR-0"].forEach((pid, k) => {
        const el = $(pid);
        if (el) lines[k] = el;
      });
    } else {
      term.innerHTML = i === 1 ? VSCODE : LB;
    }
    gsap.fromTo(term, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  };
  tabs.forEach((t, i) => {
    t.style.cursor = "pointer";
    t.addEventListener("click", () => setTab(i));
  });

  // ---- Check my work ---------------------------------------------------------
  const btn = $("1O7-0");
  const bar = $("1MZ-0");
  const count = $("1N0-0");
  const toast = $("1OS-0");
  const steps = [$("1O1-0"), $("1O4-0")].filter(Boolean) as HTMLElement[];
  const stepHTML = steps.map((s) => s.innerHTML);
  const stepStyle = steps.map((s) => s.getAttribute("style") ?? "");
  let passed = 2;
  const onCheck = () => {
    if (!btn) return;
    if (passed >= 4) {
      // reset the demo
      passed = 2;
      steps.forEach((s, i) => {
        s.innerHTML = stepHTML[i];
        s.setAttribute("style", stepStyle[i]);
      });
    } else {
      const s = steps[passed - 2];
      const box = s.firstElementChild as HTMLElement | null;
      if (box) box.outerHTML = `<div style="width:22px;height:22px;flex-shrink:0">${CHECK_SVG}</div>`;
      s.style.borderColor = "transparent";
      s.style.backgroundColor = "#FFFFFF0A";
      const label = s.lastElementChild as HTMLElement | null;
      if (label) label.style.color = "#FFFFFF";
      passed++;
      if (toast) {
        const sub = toast.querySelector<HTMLElement>("[data-pid] [data-pid]:last-child");
        gsap.fromTo(toast, { y: 20, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" });
        if (sub && passed === 3) sub.innerHTML = 'Live at the load balancer · <span style="color:#484FA3;font-weight:600">+10 XP</span>';
        if (sub && passed === 4) sub.innerHTML = '3 replicas behind the LB · <span style="color:#484FA3;font-weight:600">+10 XP</span>';
      }
      if (passed === 4) setTab(2);
    }
    if (bar) gsap.to(bar, { width: `${(passed / 4) * 100}%`, duration: 0.6, ease: "power2.out" });
    if (count) count.textContent = `${passed} / 4 checks`;
    const label = btn.firstElementChild as HTMLElement | null;
    if (label) label.textContent = passed >= 4 ? "Lab complete · restart demo" : "Check my work";
    gsap.fromTo(btn, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });
  };
  if (btn) {
    btn.style.cursor = "pointer";
    btn.addEventListener("click", onCheck);
  }

  return () => {
    killed = true;
    timers.forEach(clearTimeout);
    clearInterval(iv);
    btn?.removeEventListener("click", onCheck);
  };
}
