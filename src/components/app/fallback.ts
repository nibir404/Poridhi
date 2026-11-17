"use client";
/**
 * Last wiring pass over a design screen: every control that still looks clickable but has no
 * behaviour gets one. Runs after links, option groups, context and per-screen behaviours, and only
 * touches elements without a pointer cursor (everything wired earlier sets one).
 *  - segment groups (filters, tabs, slots, quiz options) → single-select with the design's own selected look
 *  - steppers (− value +) → change the number
 *  - known actions (calendar, upload, tags, delete, sort…) → do the thing
 *  - anything else that looks like a button → acknowledges with a toast
 */
export function toast(msg: string) {
  let host = document.getElementById("pd-toasts");
  if (!host) {
    host = document.createElement("div");
    host.id = "pd-toasts";
    host.setAttribute("role", "status");
    Object.assign(host.style, { position: "fixed", left: "50%", bottom: "24px", transform: "translateX(-50%)", zIndex: "9999", display: "grid", gap: "8px", pointerEvents: "none" });
    document.body.appendChild(host);
  }
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, { padding: "10px 16px", borderRadius: "8px", background: "var(--dashboard-text)", color: "var(--dashboard-main)", font: "500 14px/1.3 var(--font-sans)", boxShadow: "0 12px 32px -12px rgba(0,0,0,.4)", opacity: "0", transform: "translateY(6px)", transition: "opacity .2s, transform .2s" });
  host.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "none"; });
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 250); }, 2200);
}

const txt = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();
const isWired = (el: HTMLElement) => !!el.closest("[data-go],a,button,input,textarea,[role=link],[role=button],[role=checkbox],[role=radio],[data-option],[data-fb]") || getComputedStyle(el).cursor === "pointer";
const looksBtn = (el: HTMLElement) => {
  const cs = getComputedStyle(el), r = el.getBoundingClientRect();
  if (r.height < 20 || r.height > 120 || r.width > 420 || r.width < 16) return false;
  const filled = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
  const bordered = cs.borderTopStyle !== "none" && parseFloat(cs.borderTopWidth) > 0;
  return parseFloat(cs.borderRadius) >= 4 && (filled || bordered);
};
const sig = (el: HTMLElement) => { const cs = getComputedStyle(el); return `${cs.backgroundColor}|${cs.color}|${cs.borderTopColor}|${cs.borderTopWidth}`; };
const mark = (el: HTMLElement, role: string) => { el.dataset.fb = "1"; el.style.cursor = "pointer"; el.setAttribute("role", role); el.tabIndex = 0; };
const onAct = (el: HTMLElement, fn: (e: Event) => void, offs: (() => void)[]) => {
  const k = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(e); } };
  el.addEventListener("click", fn); el.addEventListener("keydown", k);
  offs.push(() => { el.removeEventListener("click", fn); el.removeEventListener("keydown", k); });
};
const copyLook = (from: HTMLElement, to: HTMLElement) => {
  const cs = getComputedStyle(from);
  to.style.backgroundColor = cs.backgroundColor; to.style.borderColor = cs.borderTopColor; to.style.borderWidth = cs.borderTopWidth; to.style.borderStyle = cs.borderTopStyle;
  const fc = getComputedStyle(from.querySelector("[data-pid]") ?? from).color;
  to.style.color = fc; to.querySelectorAll<HTMLElement>("[data-pid]").forEach((c) => (c.style.color = fc));
};

/** Single-select groups: siblings that look like buttons, one styled differently (the selected one). */
function segments(root: HTMLElement, offs: (() => void)[]) {
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((group) => {
    const kids = (Array.from(group.children) as HTMLElement[]).filter((k) => k.offsetParent !== null);
    if (kids.length < 2 || kids.length > 14) return;
    const short = (k: HTMLElement) => { const h = k.getBoundingClientRect().height; return h >= 20 && h <= 60 && txt(k).length > 0 && txt(k).length <= 30; };
    if (!kids.some(looksBtn) || !kids.every((k) => looksBtn(k) || short(k))) return;
    const hs = kids.map((k) => k.getBoundingClientRect().height);
    if (Math.max(...hs) - Math.min(...hs) > 6) return; // a title next to a badge is not a toggle
    const fs = new Set(kids.map((k) => getComputedStyle(k.querySelector("[data-pid]:not(:has([data-pid]))") ?? k).fontSize));
    if (fs.size > 1) return;
    const free = kids.filter((k) => !isWired(k));
    if (free.length < 2) return;
    const sigs = kids.map(sig), counts = new Map<string, number>();
    sigs.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
    const common = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    let sel = kids.find((_, i) => sigs[i] !== common) ?? null;
    if (!sel && counts.size !== 1) return;
    const plain = kids.find((_, i) => sigs[i] === common)!;
    const selLook = sel ? sel.cloneNode(false) as HTMLElement : null;
    if (selLook && sel) { selLook.style.cssText = sel.style.cssText; }
    const selStyle = sel ? { el: sel } : null;
    const snapshot = (el: HTMLElement) => ({ bg: getComputedStyle(el).backgroundColor, bc: getComputedStyle(el).borderTopColor, bw: getComputedStyle(el).borderTopWidth, c: getComputedStyle(el.querySelector("[data-pid]") ?? el).color });
    const on = selStyle ? snapshot(selStyle.el) : { bg: "var(--dashboard-accent)", bc: "var(--dashboard-accent)", bw: "1px", c: "var(--dashboard-accent-ink)" };
    const off = snapshot(plain);
    const paint = (el: HTMLElement, s: typeof on) => {
      el.style.backgroundColor = s.bg; el.style.borderColor = s.bc; el.style.borderWidth = s.bw; el.style.borderStyle = "solid";
      el.style.color = s.c; el.querySelectorAll<HTMLElement>("[data-pid]").forEach((c) => { if (!c.children.length) c.style.color = s.c; });
    };
    group.setAttribute("role", "radiogroup");
    kids.forEach((k) => {
      if (isWired(k) && k.dataset.fb !== "1") return;
      mark(k, "radio");
      k.setAttribute("aria-checked", String(k === sel));
      onAct(k, () => {
        kids.forEach((o) => { if (o.dataset.fb === "1") { paint(o, o === k ? on : off); o.setAttribute("aria-checked", String(o === k)); } });
        sel = k;
        filterList(root, txt(k));
      }, offs);
    });
  });
}

/** Filters like "All · 3 / Open · 1": hide list rows that don't mention the chosen word. */
function filterList(root: HTMLElement, label: string) {
  const word = label.split(/[·\d]/)[0].trim().toLowerCase();
  if (!word || /^all/.test(word)) { root.querySelectorAll<HTMLElement>("[data-fb-hidden]").forEach((r) => { r.style.display = ""; delete r.dataset.fbHidden; }); return; }
  const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-pid]")).filter((r) => {
    const p = r.parentElement; if (!p || p.children.length < 3) return false;
    const h = r.getBoundingClientRect().height; return h > 44 && h < 200 && Array.from(p.children).every((s) => Math.abs((s as HTMLElement).getBoundingClientRect().height - h) < 80);
  });
  const lists = new Set(rows.map((r) => r.parentElement!));
  lists.forEach((list) => {
    const items = Array.from(list.children) as HTMLElement[];
    const hits = items.filter((i) => txt(i).toLowerCase().includes(word));
    if (!hits.length || hits.length === items.length) return;
    items.forEach((i) => { const show = hits.includes(i); i.style.display = show ? "" : "none"; if (!show) i.dataset.fbHidden = "1"; else delete i.dataset.fbHidden; });
  });
}

/** "− 8080 +", "−100%+": the minus and plus change the number between them. */
function steppers(root: HTMLElement, offs: (() => void)[]) {
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((box) => {
    const kids = Array.from(box.children) as HTMLElement[];
    if (kids.length !== 3) return;
    const [a, mid, b] = kids;
    if (!/^[−-]$/.test(txt(a)) || txt(b) !== "+" || !/\d/.test(txt(mid))) return;
    const leaf = (mid.querySelector("[data-pid]:not(:has([data-pid]))") as HTMLElement) ?? mid;
    const step = /%/.test(txt(mid)) ? 10 : /^\d{4,}$/.test(txt(mid)) ? 1 : 1;
    const bump = (d: number) => { const v = parseInt(txt(leaf).replace(/\D/g, ""), 10) || 0; const n = Math.max(0, v + d * step); leaf.textContent = txt(leaf).replace(/\d+/, String(n)); };
    [[a, -1], [b, 1]].forEach(([el, d]) => { mark(el as HTMLElement, "button"); (el as HTMLElement).setAttribute("aria-label", d === 1 ? "Increase" : "Decrease"); onAct(el as HTMLElement, () => bump(d as number), offs); });
  });
}

const NAV: [RegExp, string][] = [[/^IDE···$/, "/app/lab/ide"], [/^RA$/, "/app/me/edit"], [/Add note/, "/app/learn/class/note"], [/^Rate session$/, "/app/me/support/rate"], [/^Submit Q4$/, "/app/exam/q4/review"], [/^Q\d+/, "/app/exam/q4/instructions"]];
const ACTIONS: [RegExp, (el: HTMLElement, root: HTMLElement) => void][] = [
  [/^Add to Google Calendar$/, () => window.open("https://calendar.google.com/calendar/render?action=TEMPLATE&text=Poridhi%20live%20class&details=Live%20class%20on%20Poridhi", "_blank", "noopener")],
  [/^Upload photo$/, (el) => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.onchange = () => { const f = i.files?.[0]; if (!f) return; const url = URL.createObjectURL(f); const av = el.closest("[data-pid]")?.parentElement?.querySelector<HTMLElement>("[data-pid]"); if (av) { av.style.backgroundImage = `url(${url})`; av.style.backgroundSize = "cover"; av.textContent = ""; } toast("Photo updated"); }; i.click(); }],
  [/×$/, (el) => { el.remove(); toast(`Removed ${txt(el).replace(/\s*×$/, "")}`); }],
  [/^\+ Add$/, (el) => { const v = window.prompt("Add a skill"); if (!v) return; const c = el.cloneNode(true) as HTMLElement; c.dataset.fb = ""; const leaf = c.querySelector("[data-pid]:not(:has([data-pid]))") ?? c; leaf.textContent = `${v} ×`; el.before(c); c.addEventListener("click", () => c.remove()); c.style.cursor = "pointer"; }],
  [/^Delete$/, () => { if (window.confirm("Delete your account? This is a demo, nothing is removed.")) toast("Account deletion requested"); }],
  [/▾$/, (el) => { const leaf = (el.querySelector("[data-pid]:not(:has([data-pid]))") as HTMLElement) ?? el; const t = txt(leaf); const opts: Record<string, string[]> = { Level: ["Any", "Beginner", "Intermediate", "Advanced"], Sort: ["Most started", "Newest", "Shortest"] }; const k = t.split(":")[0]; const list = opts[k]; if (!list) return; const cur = t.replace(/^.*?:\s*/, "").replace(" ▾", ""); leaf.textContent = `${k}: ${list[(list.indexOf(cur) + 1) % list.length]} ▾`; }],
  [/^(Change|Manage)$/, (el) => toast(`${txt(el)}: opens in your account settings`)],
  [/^Pause$/, (el) => { const leaf = (el.querySelector("[data-pid]:not(:has([data-pid]))") as HTMLElement) ?? el; leaf.textContent = "Resume"; toast("Interview paused"); }],
  [/^Resume$/, (el) => { const leaf = (el.querySelector("[data-pid]:not(:has([data-pid]))") as HTMLElement) ?? el; leaf.textContent = "Pause"; toast("Interview resumed"); }],
  [/^Today$/, () => toast("Showing today")],
  [/Highlight/, () => toast("Highlight saved to your notes")],
  [/Ask Puku/, () => toast("Puku is reading this part of the transcript…")],
  [/^After 10 min$/, (el) => { const leaf = (el.querySelector("[data-pid]:not(:has([data-pid]))") as HTMLElement) ?? el; const o = ["After 5 min", "After 10 min", "After 30 min", "Never"]; leaf.textContent = o[(o.indexOf(txt(leaf)) + 1) % o.length]; }],
];

/** Wire whatever is still dead. Returns an undo. */
export function wireFallback(root: HTMLElement): () => void {
  const offs: (() => void)[] = [];
  // Controls drawn over a textured banner get a solid backing so they stay readable.
  const tex = Array.from(root.querySelectorAll<HTMLElement>('[style*="dither-card"]')).map((t) => t.getBoundingClientRect());
  if (tex.length) root.querySelectorAll<HTMLElement>('[data-go], [role="button"], [role="link"]').forEach((b) => {
    const r = b.getBoundingClientRect();
    if (r.width > 260 || r.height > 56 || r.height < 16) return;
    if (!tex.some((t) => r.left < t.right && r.right > t.left && r.top < t.bottom && r.bottom > t.top)) return;
    const bg = getComputedStyle(b).backgroundColor;
    if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return;
    Object.assign(b.style, { position: "relative", zIndex: "1", background: "var(--dashboard-panel)", border: "1px solid var(--dashboard-border)", borderRadius: "8px", padding: b.style.padding || "6px 12px", boxShadow: "0 4px 14px -6px rgba(0,0,0,.35)" });
  });
  steppers(root, offs);
  segments(root, offs);
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((el) => {
    if (isWired(el) || !looksBtn(el)) return;
    const t = txt(el);
    if (!t || t.length > 40) return;
    const nav = NAV.find(([re]) => re.test(t));
    if (nav) { el.dataset.go = nav[1]; el.style.cursor = "pointer"; el.setAttribute("role", "link"); return; } // soft route via the shell
    const hit = ACTIONS.find(([re]) => re.test(t));
    if (!hit) return; // badges, timers and labels stay static
    mark(el, "button");
    onAct(el, (e) => { e.stopPropagation(); hit[1](el, root); }, offs);
  });
  return () => offs.forEach((f) => f());
}
