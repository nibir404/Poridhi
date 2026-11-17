"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Workspace, { Ico, iconBtn, type RailItem } from "./Workspace";
import { Composer, Editor, Terminal, Thread, type Msg, type TermLine } from "./parts";
import { labs } from "@/data/entities";
import { setPlan, setVm, usePlan } from "@/data/plan";
import Link from "next/link";

/**
 * Lab workspace (Claude / Codex layout): guide thread on the left, the working pane on the right
 * with Canvas (live environment diagram), Terminal, Editor and Preview. One small lab engine drives
 * everything: commands typed in the terminal or the composer change node status, pass checks and
 * post guide messages. `embedded` renders it inside the landing hero at a fixed height.
 */
type Status = "live" | "booting" | "failing" | "idle";
const CHECKS = ["Pull and run nginx", "Map port 8080 → 80", "Publish through the load balancer", "Scale to 3 replicas"];
const STEP_TEXT = [
  "Start nginx in the background and publish container port 80 on host port 8080.",
  "Prove it answers locally: curl the container through port 8080.",
  "Point the load balancer at the VM and curl the public URL. Watch the request trace.",
  "Scale nginx to 3 replicas so the load balancer has healthy targets.",
];
const HINTS = ["Try: docker run -d -p 8080:80 nginx", "Try: curl -sI localhost:8080", "The LB targets port 80, but nginx listens on 8080 on the host. Retarget it: lb target 8080", "Try: docker compose up -d --scale web=3"];

type Engine = { status: Record<string, Status>; checks: number; lbTarget: number; term: TermLine[]; msgs: Msg[] };
let seq = 0;
type NoId<T> = T extends unknown ? Omit<T, "id"> : never; // distributes over the Msg union
const m = (x: NoId<Msg>): Msg => ({ ...x, id: ++seq } as Msg);

function initial(vmOn = true): Engine {
  return {
    status: { browser: "idle", lb: "idle", vm: vmOn ? "live" : "idle", nginx: "idle", db: "idle" }, checks: 0, lbTarget: 80,
    term: [{ text: "Welcome to lab-01 (Ubuntu 22.04). Time counts only while this VM runs.", tone: "dim" }],
    msgs: [
      m({ from: "system", text: "Milestone 1 · Docker networking & storage · Lab 3 of 7" }),
      m({ from: "guide", text: <><b>Goal:</b> run nginx in Docker, prove it answers on 8080, then expose it at a public URL. {vmOn ? "Your VM is ready." : "Read the guide on the right as long as you like: the clock only starts when you launch the VM."}</> }),
      m({ from: "guide", text: <><b>Step 1.</b> {STEP_TEXT[0]}</> }),
    ],
  };
}

/** The lab document: always readable, with or without a VM. */
function Guide({ checks }: { checks: number }) {
  const card: React.CSSProperties = { padding: 14, borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-main)" };
  const code: React.CSSProperties = { display: "block", marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "var(--dashboard-hover)", fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "pre-wrap" };
  const cmds = ["docker run -d -p 8080:80 nginx", "curl -sI localhost:8080", "lb target 8080\ncurl -sI https://66dbf3.lb.poridhi.io", "docker compose up -d --scale web=3"];
  return (
    <div style={{ padding: 20, display: "grid", gap: 16, maxWidth: 720 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" }}>Lab guide · ~40 min · free to read</span>
      <h2 style={{ margin: 0, fontSize: 22, letterSpacing: "-.02em" }}>{labs["publish-nginx-lb"].title}</h2>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>Run nginx in Docker, prove it answers on 8080, then expose it at a public URL through the load balancer. You'll meet a real <b>502 Bad Gateway</b> on the way and learn why it happens.</p>
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12 }}><span>internet</span><span>→</span><span>load balancer :80</span><span>→</span><span>lab-01 :8080</span><span>→</span><span>nginx :80</span></div>
      {CHECKS.map((c, i) => (
        <div key={c} style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--dashboard-muted)" }}>{String(i + 1).padStart(2, "0")}</span>
            <b style={{ flex: 1, fontSize: 15 }}>{c}</b>
            <span style={{ fontSize: 12, color: i < checks ? "var(--dashboard-success)" : "var(--dashboard-muted)" }}>{i < checks ? "✓ passed" : "auto-check"}</span>
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{STEP_TEXT[i]}</p>
          <code style={code}>{cmds[i]}</code>
        </div>
      ))}
    </div>
  );
}

function run(e: Engine, raw: string): Engine {
  const cmd = raw.replace(/^\$\s*/, "").trim();
  const s = { ...e, status: { ...e.status }, term: [...e.term, { text: cmd, tone: "cmd" as const }], msgs: [...e.msgs] };
  const out = (text: string, tone?: TermLine["tone"]) => s.term.push({ text, tone });
  const pass = (n: number) => {
    if (s.checks >= n) return;
    s.checks = n;
    s.msgs.push(m({ from: "check", text: `Check ${n} · ${CHECKS[n - 1]}`, ok: true }));
    if (n < CHECKS.length) s.msgs.push(m({ from: "guide", text: <><b>Step {n + 1}.</b> {STEP_TEXT[n]}</> }));
    else s.msgs.push(m({ from: "guide", text: <>All four checks passed. Lab complete: <b>+40 XP · +20 coins</b>. Your VM keeps running until you end the lab.</> }));
  };
  if (/^docker run .*-p\s*8080:80.*nginx/.test(cmd)) { out("a91f3c2e7b10d4e6", "dim"); s.status.nginx = "live"; pass(1); }
  else if (/^docker run/.test(cmd)) { out("docker: missing the port mapping. Publish 80 as 8080 with -p 8080:80", "err"); }
  else if (/^curl .*localhost:8080/.test(cmd)) { if (s.status.nginx === "live") { out("HTTP/1.1 200 OK", "ok"); out("Server: nginx/1.27", "dim"); pass(2); } else out("curl: (7) Failed to connect to localhost port 8080", "err"); }
  else if (/^curl .*lb\.poridhi\.io/.test(cmd)) {
    s.status.browser = "live";
    if (s.lbTarget === 8080 && s.status.nginx === "live") { s.status.lb = "live"; out("HTTP/1.1 200 OK", "ok"); pass(3); }
    else { s.status.lb = "failing"; out("HTTP/1.1 502 Bad Gateway", "err"); s.msgs.push(m({ from: "check", text: "Not yet · got 502 from the load balancer", ok: false })); s.msgs.push(m({ from: "guide", tone: "hint", text: HINTS[2] })); }
  }
  else if (/^lb target 8080/.test(cmd)) { s.lbTarget = 8080; s.status.lb = "booting"; out("load balancer: target lab-01:8080 · health check passing", "ok"); }
  else if (/scale web=3|--scale/.test(cmd)) { if (s.checks >= 3) { s.status.db = "live"; out("✔ web-1  ✔ web-2  ✔ web-3  Started", "ok"); pass(4); } else out("Finish step 3 first so the load balancer has a target.", "err"); }
  else if (/^docker ps/.test(cmd)) out(s.status.nginx === "live" ? "a91f3c2e7b10  nginx  Up 2 minutes  0.0.0.0:8080->80/tcp" : "CONTAINER ID   IMAGE   STATUS", s.status.nginx === "live" ? undefined : "dim");
  else if (/^(ls|pwd|whoami|clear)$/.test(cmd)) { if (cmd === "clear") s.term = []; else out(cmd === "ls" ? "nginx/  default.conf  README.md" : cmd === "pwd" ? "/home/poridhian" : "poridhian"); }
  else out(`${cmd.split(" ")[0]}: command not found here. Type "hint" in the chat for help.`, "err");
  return s;
}

const NODES: { id: string; name: string; kind: string; x: number; y: number; icon: string; about: string }[] = [
  { id: "browser", name: "Browser", kind: "public URL", x: 0, y: 1, icon: "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18", about: "Anyone on the internet, reaching your lab through the load balancer's URL." },
  { id: "lb", name: "Load balancer", kind: ":80 → :8080", x: 1, y: 1, icon: "M12 4v6M6 20v-4l6-6 6 6v4", about: "Public entry point. Must target the port nginx listens on (8080)." },
  { id: "vm", name: "lab-01", kind: "Ubuntu 22.04 VM", x: 2, y: 0, icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17", about: "Your fresh VM with VS Code and terminals." },
  { id: "nginx", name: "nginx", kind: "container :8080", x: 2, y: 1, icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9z", about: "The container you run, published on host port 8080." },
  { id: "db", name: "replicas", kind: "web ×3", x: 2, y: 2, icon: "M4 6h16M4 12h16M4 18h16", about: "Scaled copies of nginx behind the load balancer." },
];
const EDGES: [string, string][] = [["browser", "lb"], ["lb", "nginx"], ["vm", "nginx"], ["nginx", "db"]];
const pill = (s: Status): React.CSSProperties => ({ fontFamily: "var(--font-mono)", fontSize: 11, height: 20, padding: "0 7px", borderRadius: 4, display: "inline-flex", alignItems: "center", background: s === "live" ? "color-mix(in srgb, var(--dashboard-success) 16%, transparent)" : s === "failing" ? "color-mix(in srgb, var(--dashboard-danger) 16%, transparent)" : s === "booting" ? "color-mix(in srgb, var(--dashboard-warning) 16%, transparent)" : "var(--dashboard-hover)", color: s === "live" ? "var(--dashboard-success)" : s === "failing" ? "var(--dashboard-danger)" : s === "booting" ? "var(--dashboard-warning)" : "var(--dashboard-muted)" });
const LABEL: Record<Status, string> = { live: "Live", booting: "Starting", failing: "502", idle: "Idle" };

function Canvas({ status }: { status: Record<string, Status> }) {
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const CW = 196, CH = 64, GX = 60, GY = 28, W = 3 * CW + 2 * GX, H = 3 * CH + 2 * GY;
  useEffect(() => { const el = box.current; if (!el) return; const f = () => setK(Math.min(1, (el.clientWidth - 40) / W)); f(); const ro = new ResizeObserver(f); ro.observe(el); return () => ro.disconnect(); }, [W]);
  const pos = (n: (typeof NODES)[number]) => ({ left: n.x * (CW + GX), top: n.y * (CH + GY) });
  const by = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <div ref={box} style={{ minHeight: "100%", display: "grid", placeItems: "center", padding: 20, backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
      <div style={{ width: W * k, height: H * k + 70 }}>
        <div style={{ position: "relative", width: W, height: H, transform: `scale(${k})`, transformOrigin: "0 0" }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
            {EDGES.map(([a, b]) => { const A = pos(by[a]), B = pos(by[b]); const v = by[a].x === by[b].x; const d = v ? `M${A.left + CW / 2},${A.top + (B.top > A.top ? CH : 0)} L${B.left + CW / 2},${B.top + (B.top > A.top ? 0 : CH)}` : `M${A.left + CW},${A.top + CH / 2} C${A.left + CW + 40},${A.top + CH / 2} ${B.left - 40},${B.top + CH / 2} ${B.left},${B.top + CH / 2}`; const live = status[a] === "live" && status[b] === "live"; const bad = status[a] === "failing" || status[b] === "failing"; return <path key={a + b} d={d} fill="none" stroke={bad ? "var(--dashboard-danger)" : live ? "var(--dashboard-text)" : "var(--dashboard-muted)"} strokeWidth={live ? 1.6 : 1.2} strokeDasharray={live ? undefined : "4 4"} className={live ? "pd-flow" : undefined} />; })}
          </svg>
          {NODES.map((n) => { const s = status[n.id], p = pos(n); return (
            <button key={n.id} type="button" onClick={() => setPicked(picked === n.id ? null : n.id)} aria-pressed={picked === n.id} aria-label={`${n.name}: ${n.about}`}
              style={{ position: "absolute", ...p, width: CW, height: CH, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", borderRadius: "var(--puku-radius)", border: `1px solid ${s === "failing" ? "var(--dashboard-danger)" : picked === n.id ? "var(--dashboard-text)" : "var(--dashboard-border)"}`, background: "var(--dashboard-panel)", color: "var(--dashboard-text)", textAlign: "left", cursor: "pointer" }}>
              <span style={{ width: 32, height: 32, borderRadius: "var(--puku-radius)", display: "grid", placeItems: "center", background: "var(--dashboard-hover)", flexShrink: 0 }}><Ico d={n.icon} /></span>
              <span style={{ display: "grid", minWidth: 0, flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{n.name}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--dashboard-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.kind}</span></span>
              <span style={pill(s)}>{LABEL[s]}</span>
            </button>
          ); })}
        </div>
        {picked && <p role="status" style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--dashboard-muted)" }}><b style={{ color: "var(--dashboard-text)" }}>{by[picked].name}.</b> {by[picked].about}</p>}
      </div>
    </div>
  );
}

function Preview({ status, lbTarget }: { status: Record<string, Status>; lbTarget: number }) {
  const ok = status.lb === "live";
  const rows: [string, string, boolean][] = [["Browser", "GET https://66dbf3.lb.poridhi.io", status.browser === "live"], ["Load balancer", `forwards → lab-01:${lbTarget}`, lbTarget === 8080], ["nginx container", ok ? "200 OK · 38 ms" : "nothing listening on :80", ok]];
  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", height: 34, padding: "0 10px", borderRadius: "var(--puku-radius)", background: "var(--dashboard-main)", border: "1px solid var(--dashboard-border)", fontFamily: "var(--font-mono)", fontSize: 12 }}>https://66dbf3.lb.poridhi.io</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={pill(ok ? "live" : status.lb === "failing" ? "failing" : "idle")}>{ok ? "200" : status.lb === "failing" ? "502" : "—"}</span><b>{ok ? "OK" : status.lb === "failing" ? "Bad Gateway" : "No request yet"}</b></div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)" }}>Request trace</span>
      {rows.map(([a, b, good]) => <div key={a} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)" }}><span style={{ color: good ? "var(--dashboard-success)" : "var(--dashboard-danger)" }}><Ico d={good ? "M6 12l4 4 8-8" : "M6 6l12 12M18 6L6 18"} /></span><span style={{ display: "grid" }}><b style={{ fontSize: 13 }}>{a}</b><span style={{ fontSize: 12, color: "var(--dashboard-muted)" }}>{b}</span></span></div>)}
    </div>
  );
}

export default function LabWorkspace({ embedded = false }: { embedded?: boolean }) {
  const { plan, vm: vmState } = usePlan();
  const vm = embedded ? "on" : vmState; // the hero demo always runs
  const [e, setE] = useState<Engine>(() => initial(embedded));
  const [tab, setTab] = useState(embedded ? "canvas" : "guide");
  const [upgrade, setUpgrade] = useState(false);
  const prevVm = useRef(vm);
  useEffect(() => {
    if (prevVm.current !== "on" && vm === "on" && !embedded) {
      setE((x) => ({ ...x, status: { ...x.status, vm: "live" }, msgs: [...x.msgs, m({ from: "system", text: "VM launched · lab-01 · Ubuntu 22.04 · the clock is running" }), m({ from: "guide", text: <>Your VM is up. Open the <b>Terminal</b> and start with step {Math.min(x.checks + 1, 4)}.</> })] }));
      setTab("terminal");
    }
    if (vm === "off") setE((x) => ({ ...x, status: { ...x.status, vm: "idle" } }));
    prevVm.current = vm;
  }, [vm, embedded]);
  const launch = () => { if (plan !== "pro") { setUpgrade(true); return; } setVm("booting"); setTimeout(() => setVm("on"), 2200); };
  const [typing, setTyping] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({ "default.conf": "server {\n  listen 80;\n  location / {\n    root /usr/share/nginx/html;\n  }\n}\n", "compose.yaml": "services:\n  web:\n    image: nginx\n    ports:\n      - \"8080:80\"\n", "README.md": "# Publish nginx through the load balancer\n" });
  const [file, setFile] = useState("default.conf");
  const [secs, setSecs] = useState(38 * 60);
  useEffect(() => { if (vm !== "on") return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, [vm]);
  const timer = `${String(Math.floor(secs / 3600)).padStart(2, "0")}h${String(Math.floor(secs / 60) % 60).padStart(2, "0")}m`;

  const exec = (cmd: string) => setE((x) => run(x, cmd));
  const send = (text: string) => {
    if (/^\$|^(docker|curl|lb|ls|pwd|whoami|clear)\b/.test(text)) {
      if (vm !== "on") {
        setE((x) => ({ ...x, msgs: [...x.msgs, m({ from: "you", text }), m({ from: "guide", tone: "hint", text: plan === "pro" ? <>Commands run on your VM. Launch it first with <b>Launch VM</b> at the top.</> : <>Commands need a running VM, which comes with Pro. You can keep reading the guide and asking me questions for free.</> })] }));
        if (plan !== "pro") setUpgrade(true);
        return;
      }
      exec(text); setTab(embedded ? "canvas" : "terminal"); return;
    }
    setE((x) => ({ ...x, msgs: [...x.msgs, m({ from: "you", text })] }));
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setE((x) => {
        const step = Math.min(x.checks, HINTS.length - 1);
        const ans = /hint|stuck|help|how/i.test(text) ? HINTS[step] : /why|502|bad gateway/i.test(text) ? "A 502 means the load balancer reached the VM but nothing answered on the port it targets. nginx is published on 8080, so the LB must target 8080." : `Good question. For this step: ${STEP_TEXT[step]}`;
        return { ...x, msgs: [...x.msgs, m({ from: "guide", tone: /hint|stuck|help|how/i.test(text) ? "hint" : undefined, text: ans })] };
      });
    }, 700);
  };
  const next = ["$ docker run -d -p 8080:80 nginx", "$ curl -sI localhost:8080", e.lbTarget === 8080 ? "$ curl -sI https://66dbf3.lb.poridhi.io" : (e.status.lb === "failing" ? "$ lb target 8080" : "$ curl -sI https://66dbf3.lb.poridhi.io"), "$ docker compose up -d --scale web=3"][Math.min(e.checks, 3)];

  const rail: RailItem[] = useMemo(() => [
    { id: "a", title: "Bridge vs host networks", meta: "Class · done", status: "done", href: "/app/learn/class?m=docker-networking-and-storage" },
    { id: "b", title: "Volumes vs bind mounts", meta: "Reading · done", status: "done", href: "/app/learn/class?m=docker-networking-and-storage" },
    { id: "c", title: labs["publish-nginx-lb"].title, meta: `Lab · ${e.checks} / 4 checks`, status: "current", active: true, href: "/app/lab" },
    { id: "d", title: labs["persist-postgres"].title, meta: "Lab · ~35 min", status: "todo", href: "/app/lab/launch?lab=persist-postgres" },
    { id: "e", title: "Networking quick check", meta: "Quiz · 6 questions", status: "todo", href: "/app/learn/check" },
    { id: "f", title: "Explain Docker volumes", meta: "AI interview · Pro", status: "todo", href: "/app/interview" },
    { id: "g", title: "Module exam", meta: "Unlocks at 6 / 7", status: "locked" },
  ], [e.checks]);

  const Gate = (
    <div className="pd-hatch" style={{ height: "100%", minHeight: 360, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, display: "grid", gap: 12, justifyItems: "center", textAlign: "center", padding: 28, borderRadius: "var(--puku-radius-panel, 12px)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)" }}>
        <span style={{ width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--dashboard-hover)" }}><Ico d={vm === "booting" ? "M12 3a9 9 0 1 0 9 9" : plan === "pro" ? "M12 3v8M7 6.5a7 7 0 1 0 10 0" : "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4"} size={20} /></span>
        <b style={{ fontSize: 18 }}>{vm === "booting" ? "Booting lab-01…" : plan === "pro" ? "Your VM is off" : "VM access is part of Pro"}</b>
        <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>{vm === "booting" ? "Ubuntu 22.04 · 2 vCPU · 4 GB. Ready in a few seconds." : plan === "pro" ? "Launch it to use the terminal, IDE, database, load balancer and cloud tray. Time counts only while it runs." : "The guide is free to read. Upgrade to launch a real VM and unlock the terminal, IDE, database, load balancer and cloud tray."}</span>
        {vm !== "booting" && <button type="button" onClick={launch} className="puku-btn puku-btn-default pd-glow-btn" style={{ height: 40, padding: "0 18px", border: 0, borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, cursor: "pointer" }}>{plan === "pro" ? "Launch VM" : "Upgrade to launch VM"}</button>}
        {vm !== "booting" && <button type="button" onClick={() => setTab("guide")} style={{ border: 0, background: "transparent", color: "var(--dashboard-text)", textDecoration: "underline", fontSize: 13, cursor: "pointer" }}>Keep reading the guide</button>}
      </div>
    </div>
  );
  const live = vm === "on";
  const tabs = [
    { id: "guide", label: "Guide", icon: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4", body: <Guide checks={e.checks} /> },
    { id: "canvas", label: "Canvas", icon: "M4 6h6v6H4zM14 12h6v6h-6zM10 9h4v6", body: live ? <Canvas status={e.status} /> : Gate },
    { id: "terminal", label: "Terminal", icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17", body: live ? <Terminal lines={e.term} onRun={exec} suggestions={[next.replace(/^\$ /, "")]} /> : Gate },
    { id: "editor", label: "Editor", icon: "M8 8l-4 4 4 4M16 8l4 4-4 4", body: live ? <Editor files={files} active={file} setActive={setFile} onChange={(f, v) => setFiles((x) => ({ ...x, [f]: v }))} /> : Gate },
    { id: "preview", label: "Preview", icon: "M3 12h18M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18", body: live ? <Preview status={e.status} lbTarget={e.lbTarget} /> : Gate },
  ];
  const tool = (href: string, label: string, d: string) => live
    ? <Link key={label} href={href} aria-label={label} title={label} style={iconBtn}><Ico d={d} /></Link>
    : <button key={label} type="button" aria-label={`${label} (needs a running VM)`} title={`${label} · launch the VM first`} onClick={launch} style={{ ...iconBtn, opacity: 0.4 }}><Ico d={d} /></button>;
  const actions = (
    <>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, whiteSpace: "nowrap" }}><span style={{ width: 7, height: 7, borderRadius: 999, background: live ? "var(--dashboard-success)" : vm === "booting" ? "var(--dashboard-warning)" : "var(--dashboard-muted)" }} />{live ? "VM on" : vm === "booting" ? "Booting…" : "VM off"}</span>
      {tool("/app/lab/ide", "IDE", "M8 8l-4 4 4 4M16 8l4 4-4 4")}
      {tool("/app/lab/database", "Database", "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3")}
      {tool("/app/lab/expose", "Load balancer", "M12 4v6M12 10l-6 8M12 10l6 8")}
      {tool("/app/lab/cloud-tray", "Cloud tray", "M7 18a5 5 0 0 1-.9-9.9A6 6 0 0 1 17.6 7 4.5 4.5 0 0 1 17 18z")}
      {live
        ? <button type="button" onClick={() => setVm("off")} aria-label="Stop VM" title="Stop VM (saves your time)" style={{ ...iconBtn, color: "var(--dashboard-danger)" }}><Ico d="M12 3v8M7 6.5a7 7 0 1 0 10 0" /></button>
        : vm !== "booting" && <button type="button" onClick={launch} className="puku-btn puku-btn-default pd-glow-btn" style={{ height: 32, padding: "0 14px", border: 0, borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>{plan === "pro" ? "Launch VM" : "Go Pro to launch"}</button>}
    </>
  );
  const Upgrade = upgrade && (
    <div role="dialog" aria-modal="true" aria-label="Upgrade to Pro" onClick={() => setUpgrade(false)} style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(0,0,0,.5)" }}>
      <div onClick={(ev) => ev.stopPropagation()} style={{ width: "min(440px, calc(100% - 32px))", display: "grid", gap: 14, padding: 24, borderRadius: 12, background: "var(--dashboard-panel)", color: "var(--dashboard-text)", border: "1px solid var(--dashboard-border)" }}>
        <b style={{ fontSize: 20 }}>Launch real VMs with Pro</b>
        <span style={{ fontSize: 14, lineHeight: 1.55, color: "var(--dashboard-muted)" }}>Guides stay free. Pro adds 40 hours of VM time a month, plus the terminal, IDE, databases, load balancer and cloud tray in every lab.</span>
        <div style={{ display: "grid", gap: 6, fontSize: 14 }}>{["Ubuntu VM in ~30 seconds", "Terminal, IDE, databases, load balancer", "AI guide, interviews and exams", "Time counts only while the VM runs"].map((x) => <span key={x}>✓ {x}</span>)}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Link href="/pricing" style={{ height: 40, display: "inline-flex", alignItems: "center", padding: "0 14px", borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", color: "var(--dashboard-text)", textDecoration: "none", fontSize: 14 }}>See pricing</Link>
          <button type="button" onClick={() => { setPlan("pro"); setUpgrade(false); }} className="puku-btn puku-btn-default pd-glow-btn" style={{ height: 40, padding: "0 16px", border: 0, borderRadius: "var(--puku-radius)", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontWeight: 600, cursor: "pointer" }}>Start Pro · ৳1,500 / month</button>
        </div>
      </div>
    </div>
  );

  const ws = (
    <Workspace height={embedded ? "100%" : undefined} back="/app/roadmap/milestone-1?ms=1&mod=docker-networking-and-storage&item=2" crumb="Milestone 1 · Docker networking & storage" title={labs["publish-nginx-lb"].title}
      progress={{ done: e.checks, total: 4, label: "checks" }} timer={live ? timer : undefined} railTitle="This module" rail={rail}
      tab={tab} setTab={setTab} tabs={tabs} actions={embedded ? undefined : actions}
      thread={<Thread msgs={e.msgs} typing={typing} composer={<Composer placeholder="Ask the guide, or type a command ($ …)" onSend={send} chips={[{ label: next, value: next }, { label: "Give me a hint", value: "hint" }, { label: "Why a 502?", value: "Why a 502?" }]} />} />} />
  );
  if (!embedded) return <>{ws}{Upgrade}</>;
  return embedded ? <div className="pd-ws-embed" style={{ height: 640, borderRadius: "var(--puku-radius-panel)", overflow: "hidden", border: "1px solid var(--dashboard-border)", boxShadow: "0 40px 80px -48px rgba(0,0,0,.45)" }}>{ws}</div> : ws;
}
