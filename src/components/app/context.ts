import { examQuestions, labs, modules } from "@/data/entities";

/**
 * Ties buttons to seed entities and fills screens from them.
 * 1. Links: a link into /app/learn or /app/lab whose text names a module or lab gets ?m= / ?lab=;
 *    exam question rows link to their own question (?q=).
 * 2. Fill: the opened screen swaps the design's sample text for the chosen item.
 * 3. Carry: inside a flow (learn, lab, exam question) the id is kept on onward links.
 */
const leaves = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>("[data-pid]")).filter((e) => !e.children.length && e.textContent?.trim());

function swap(root: HTMLElement, pairs: [RegExp | string, string][]) {
  leaves(root).forEach((el) => {
    let t = el.textContent ?? "";
    const before = t;
    pairs.forEach(([from, to]) => { t = typeof from === "string" ? t.split(from).join(to) : t.replace(from, to); });
    if (t !== before) el.textContent = t;
  });
}

const withParam = (href: string, k: string, v: string) => (href.includes(`${k}=`) ? href : `${href}${href.includes("?") ? "&" : "?"}${k}=${encodeURIComponent(v)}`);

export function applyContext(root: HTMLElement, screen: string) {
  const qs = new URLSearchParams(window.location.search);
  const linked = Array.from(root.querySelectorAll<HTMLElement>("[data-go]"));

  // 1. Name-based links to modules and labs.
  const mods = Object.entries(modules).sort((a, b) => b[1].title.length - a[1].title.length);
  linked.forEach((el) => {
    const go = el.dataset.go!;
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (/^\/app\/learn\/(class|locked|check|live|gate)/.test(go)) {
      const hit = mods.find(([, m]) => text.startsWith(m.title));
      if (hit) el.dataset.go = withParam(go, "m", hit[0]);
    }
    if (go.startsWith("/app/lab")) {
      const hit = Object.entries(labs).find(([, l]) => text.includes(l.title));
      if (hit) el.dataset.go = withParam(go, "lab", hit[0]);
    }
  });

  // Exam question list: each row opens its own question.
  if (screen === "ExamQuestions") {
    examQuestions.forEach((q) => {
      const title = leaves(root).find((e) => e.textContent?.trim() === q.title);
      let row = title?.parentElement ?? null;
      while (row && row !== root && row.children.length < 4) row = row.parentElement;
      if (!row || row === root) return;
      const passed = /Passed/.test(row.textContent ?? "");
      const to = `/app/exam/q4/${passed ? "review" : "instructions"}?q=${q.n}`;
      row.dataset.go = to;
      row.style.cursor = "pointer";
      row.querySelectorAll<HTMLElement>("[data-go]").forEach((b) => (b.dataset.go = to));
    });
  }

  // 2. Fill the screen from the chosen item.
  const m = qs.get("m") && modules[qs.get("m")!];
  if (m && /^(Class|Gate|QuickCheck|ModuleComplete)/.test(screen)) {
    swap(root, [["Docker networking & storage", m.title], ["Volumes vs bind mounts", m.lesson]]);
  }
  const lab = qs.get("lab") && labs[qs.get("lab")!];
  if (lab && screen.startsWith("Lab")) {
    swap(root, [["Publish nginx through the load balancer", lab.title], ["Run nginx in Docker, prove it answers on 8080, then expose it at a public URL.", lab.goal]]);
  }
  const q = examQuestions.find((x) => String(x.n) === qs.get("q"));
  if (q && /^Exam(Instructions|Whiteboard|Submit|State1|State2|IDE)$/.test(screen)) {
    swap(root, [["Load balancer configuration", q.title], [/\bQ4\b/g, `Q${q.n}`], [/\bQ5\b/g, `Q${Math.min(q.n + 1, 10)}`], ["MEDIUM", q.level.toUpperCase()], ["100 PTS", `${q.points} PTS`]]);
  }

  // 3. Carry the id along the flow.
  root.querySelectorAll<HTMLElement>("[data-go]").forEach((el) => {
    const go = el.dataset.go!;
    if (qs.get("m") && /^\/app\/learn\//.test(go)) el.dataset.go = withParam(go, "m", qs.get("m")!);
    if (qs.get("lab") && /^\/app\/lab/.test(go)) el.dataset.go = withParam(go, "lab", qs.get("lab")!);
    if (qs.get("q") && /^\/app\/exam\/q4\//.test(go)) el.dataset.go = withParam(go, "q", qs.get("q")!);
  });
}

