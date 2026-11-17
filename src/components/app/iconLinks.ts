/**
 * Icon-only buttons (no text) on the lab, exam and interview screens, matched by icon shape.
 * Value: route, or "tool" for whiteboard tools that toggle as a group.
 */
type Map = [prefix: string, to: string][];
const LAB: Map = [
  ["M15 5l-7 7 7 7", "/app/roadmap/milestone-1?ms=1&mod=docker-networking-and-storage&item=2"],
  ["M7 9l3 3-3 3M12 15h4", "/app/lab/machines"],
  ["M14 4h6v6M20 4l-9 9", "/app/lab/expose"],
  ["M7 18a4.5 4.5 0 01-.6-", "/app/lab/cloud-tray"],
  ["M12 3v8M7 6.5a7 7 0 10", "/app/lab/menu"],
  ["circle:12:5", "/app/lab/info"],
  ["M3 12h18M12 3a14 14 0", "/app/lab/expose"],
  ["M12 7.2v9.6M11 7l-5 10", "/app/lab/expose"],
  ["M12 3l8 4.5v9L12 21l-8", "/app/lab/ide"],
  ["M12 5v14M5 12h14", "/app/lab/resources"],
  ["M3 9h18", "/app/lab/ide"],
  ["M12 4v16", "/app/lab/ide"],
  ["M6 6l12 12", "/app/lab"],
  ["M18 6L6 18", "/app/lab"],
];
const EXAM: Map = [
  ["M15 5l-7 7 7 7", "/app/exam/questions"],
  ["M9 5l7 7-7 7", "/app/exam/q4/review"],
  ["M8 9h8M8 13h8M8 17h5", "/app/exam/q4/instructions"],
  ["M8 7l-5 5 5 5M16 7l5 5", "/app/practice/exam"],
  ["M4 17l6-6-6-6M12 19h8", "/app/practice/exam"],
  ["M4 20l4-1 11-11-3-3L5", "/app/exam/q4/whiteboard"],
  ["M7 18a4 4 0 0 1-.6-8A6", "/app/exam/q4/instructions"],
];
const INTERVIEW: Map = [
  ["M15 5l-7 7 7 7", "/app/interview"],
  ["M9 5l7 7-7 7", "/app/interview/feedback"],
  ["M12 3l2 5 5 2-5 2-2 5-", "/app/interview/feedback"],
  ["M5 11a7 7 0 0 0 14 0M1", "/app/interview/session"],
  ["M5 3l14 8-6 2-3 6z", "tool"],
  ["M8 13V5a2 2 0 0 1 4 0v", "tool"],
  ["rect:4:5", "tool"],
  ["M5 6v12c0 1.7 3 3 7 3s", "tool"],
  ["M4 20L20 4M20 4h-7M20", "tool"],
  ["M4 20l4-1 11-11-3-3L5", "tool"],
  ["M5 6h14M12 6v14", "tool"],
];

export function iconMapFor(screen: string): Map | null {
  if (screen.startsWith("Lab")) return LAB;
  if (screen.startsWith("Exam")) return EXAM;
  if (screen.startsWith("Interview")) return INTERVIEW;
  return null;
}

const key = (svg: SVGElement) => {
  const p = svg.querySelector("path")?.getAttribute("d");
  if (p) return p;
  const c = svg.querySelector("circle");
  if (c) return `circle:${c.getAttribute("cx")}:${c.getAttribute("cy")}`;
  const r = svg.querySelector("rect");
  return r ? `rect:${r.getAttribute("x")}:${r.getAttribute("y")}` : "";
};

/** Tags icon buttons with data-go, and makes whiteboard tools a single-select group. */
export function wireIcons(root: HTMLElement, screen: string) {
  const map = iconMapFor(screen);
  if (!map) return () => {};
  const tools: HTMLElement[] = [];
  root.querySelectorAll<HTMLElement>("[data-pid]").forEach((btn) => {
    if (btn.dataset.go || btn.textContent?.trim() || btn.children.length !== 1) return;
    const svg = btn.querySelector<SVGElement>(":scope > svg");
    if (!svg) return;
    const k = key(svg);
    const hit = map.find(([pre]) => k.startsWith(pre));
    if (!hit) return;
    btn.style.cursor = "pointer";
    btn.setAttribute("role", "button");
    if (hit[1] === "tool") { tools.push(btn); return; }
    btn.dataset.go = hit[1];
  });
  const pick = (t: HTMLElement) => tools.forEach((x) => { x.style.background = x === t ? "var(--dashboard-hover, #F4F4F4)" : "transparent"; x.setAttribute("aria-pressed", String(x === t)); });
  const offs = tools.map((t) => { const f = () => pick(t); t.addEventListener("click", f); return () => t.removeEventListener("click", f); });
  return () => offs.forEach((f) => f());
}
