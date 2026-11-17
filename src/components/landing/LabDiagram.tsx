"use client";
import { useEffect, useState } from "react";
import { S, mono } from "./ui";

/**
 * Hero product visual (render.com style): a lab environment drawn as a service diagram, with a
 * live terminal that types the lab's commands and flips node statuses as checks pass.
 * Native components on design-system tokens; loops; static under reduced motion.
 */
type Status = "live" | "booting" | "failing" | "idle";
type Node = { id: string; name: string; kind: string; x: number; y: number; icon: string };
const NODES: Node[] = [
  { id: "browser", name: "Browser", kind: "public URL", x: 0, y: 1, icon: "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0-18" },
  { id: "lb", name: "Load balancer", kind: ":80 → :8080", x: 1, y: 1, icon: "M12 4v6M6 20v-4l6-6 6 6v4M6 20h.01M12 20h.01M18 20h.01" },
  { id: "vm", name: "lab-01", kind: "Ubuntu 22.04 VM", x: 2, y: 0, icon: "M3 4h18v16H3zM7 10l3 2.5L7 15M12.5 15H17" },
  { id: "nginx", name: "nginx", kind: "container :8080", x: 2, y: 1, icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9z" },
  { id: "db", name: "postgres", kind: "volume pgdata", x: 2, y: 2, icon: "M5 6c0-1.7 3-3 7-3s7 1.3 7 3v12c0 1.7-3 3-7 3s-7-1.3-7-3zM5 6c0 1.7 3 3 7 3s7-1.3 7-3M5 12c0 1.7 3 3 7 3s7-1.3 7-3" },
];
const EDGES: [string, string][] = [["browser", "lb"], ["lb", "nginx"], ["vm", "nginx"], ["nginx", "db"]];

const SCRIPT: { line: string; tone?: "ok" | "err" | "dim"; at: number; set?: Partial<Record<string, Status>>; check?: number }[] = [
  { line: "poridhian@lab-01:~$ docker run -d -p 8080:80 nginx", at: 0, set: { vm: "live", nginx: "booting" } },
  { line: "a91f3c2e7b10d4e6", tone: "dim", at: 1 },
  { line: "✓ Check 1 · nginx is running", tone: "ok", at: 2, set: { nginx: "live" }, check: 1 },
  { line: "poridhian@lab-01:~$ curl -sI localhost:8080", at: 3 },
  { line: "HTTP/1.1 200 OK", tone: "ok", at: 4, check: 2 },
  { line: "poridhian@lab-01:~$ curl -sI https://66dbf3.lb.poridhi.io", at: 5, set: { lb: "booting", browser: "booting" } },
  { line: "HTTP/1.1 502 Bad Gateway", tone: "err", at: 6, set: { lb: "failing" } },
  { line: "→ retarget the load balancer to :8080", tone: "dim", at: 7 },
  { line: "HTTP/1.1 200 OK", tone: "ok", at: 8, set: { lb: "live", browser: "live", db: "live" }, check: 3 },
  { line: "✓ Check 3 · public URL answers", tone: "ok", at: 9 },
];

const pill = (s: Status): React.CSSProperties => ({
  ...mono, fontSize: 11, height: 20, padding: "0 7px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 5,
  background: s === "live" ? "color-mix(in srgb, var(--dashboard-success) 16%, transparent)" : s === "failing" ? "color-mix(in srgb, var(--dashboard-danger) 16%, transparent)" : s === "booting" ? "color-mix(in srgb, var(--dashboard-warning) 16%, transparent)" : "var(--dashboard-hover)",
  color: s === "live" ? "var(--dashboard-success)" : s === "failing" ? "var(--dashboard-danger)" : s === "booting" ? "var(--dashboard-warning)" : "var(--dashboard-muted)",
});
const label: Record<Status, string> = { live: "Live", booting: "Starting", failing: "502", idle: "Idle" };

export default function LabDiagram() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(SCRIPT.length); return; }
    const t = setInterval(() => setStep((s) => (s >= SCRIPT.length + 3 ? 0 : s + 1)), 900);
    return () => clearInterval(t);
  }, []);
  const shown = SCRIPT.slice(0, Math.min(step, SCRIPT.length));
  const status: Record<string, Status> = { browser: "idle", lb: "idle", vm: "booting", nginx: "idle", db: "idle" };
  let checks = 0;
  shown.forEach((s) => { Object.assign(status, s.set ?? {}); if (s.check) checks = s.check; });

  const CW = 196, CH = 64, GX = 64, GY = 26;
  const pos = (n: Node) => ({ left: n.x * (CW + GX), top: n.y * (CH + GY) });
  const W = 3 * CW + 2 * GX, H = 3 * CH + 2 * GY;
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="pd-labdiagram" style={{ borderRadius: "var(--puku-radius-panel)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", overflow: "hidden", boxShadow: "0 40px 80px -48px rgba(0,0,0,.45)" }}>
      {/* Window bar */}
      <div style={{ display: "flex", alignItems: "center", gap: S(3), height: 44, padding: `0 ${S(4)}px`, borderBottom: "1px solid var(--dashboard-border)", fontSize: 13, color: "var(--dashboard-muted)" }}>
        <span style={{ color: "var(--dashboard-text)", fontWeight: 600 }}>Milestone 1</span><span aria-hidden>›</span><span>Lab: Publish nginx through the load balancer</span>
        <span style={{ marginLeft: "auto", ...pill(checks >= 3 ? "live" : "booting") }}>{checks} / 4 checks</span>
        <span style={{ ...mono, fontSize: 12 }}>00h38m</span>
      </div>
      <div className="pd-ld-body" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)" }}>
        {/* Diagram */}
        <div style={{ position: "relative", padding: S(8), backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: "16px 16px", overflow: "auto" }}>
          <div style={{ position: "relative", width: W, height: H, margin: "0 auto" }}>
            <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
              {EDGES.map(([a, b]) => {
                const A = pos(byId[a]), B = pos(byId[b]);
                const x1 = A.left + CW, y1 = A.top + CH / 2, x2 = B.left, y2 = B.top + CH / 2;
                const vertical = byId[a].x === byId[b].x;
                const d = vertical ? `M${A.left + CW / 2},${A.top + (B.top > A.top ? CH : 0)} L${B.left + CW / 2},${B.top + (B.top > A.top ? 0 : CH)}` : `M${x1},${y1} C${x1 + 40},${y1} ${x2 - 40},${y2} ${x2},${y2}`;
                const live = status[a] === "live" && status[b] === "live";
                const bad = status[a] === "failing" || status[b] === "failing";
                return <path key={a + b} d={d} fill="none" stroke={bad ? "var(--dashboard-danger)" : live ? "var(--dashboard-text)" : "var(--dashboard-muted)"} strokeWidth={live ? 1.6 : 1.2} strokeDasharray={live ? undefined : "4 4"} className={live ? "pd-flow" : undefined} />;
              })}
            </svg>
            {NODES.map((n) => {
              const p = pos(n), s = status[n.id];
              return (
                <div key={n.id} style={{ position: "absolute", ...p, width: CW, height: CH, display: "flex", alignItems: "center", gap: S(3), padding: `0 ${S(3)}px`, borderRadius: "var(--puku-radius)", border: `1px solid ${s === "failing" ? "var(--dashboard-danger)" : "var(--dashboard-border)"}`, background: "var(--dashboard-main)", transition: "border-color .3s" }}>
                  <span style={{ width: 32, height: 32, borderRadius: "var(--puku-radius)", display: "grid", placeItems: "center", background: "var(--dashboard-hover)", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={n.icon} /></svg>
                  </span>
                  <span style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{n.name}</span>
                    <span style={{ ...mono, fontSize: 11, color: "var(--dashboard-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.kind}</span>
                  </span>
                  <span style={pill(s)}>{label[s]}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Terminal */}
        <div style={{ borderLeft: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)", display: "flex", flexDirection: "column", minHeight: 300 }}>
          <div style={{ display: "flex", gap: S(1), padding: `${S(2)}px ${S(3)}px`, borderBottom: "1px solid var(--dashboard-border)" }}>
            {["Term 1", "Term 2", "IDE"].map((t, i) => <span key={t} style={{ ...mono, fontSize: 12, height: 28, display: "inline-flex", alignItems: "center", padding: `0 ${S(3)}px`, borderRadius: "var(--puku-radius)", background: i === 0 ? "var(--dashboard-hover)" : "transparent", color: i === 0 ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}>{t}</span>)}
          </div>
          <div aria-live="polite" style={{ ...mono, fontSize: 12.5, lineHeight: 1.75, padding: S(4), flex: 1 }}>
            {shown.map((s, i) => (
              <div key={i} className="pd-term-line" style={{ color: s.tone === "ok" ? "var(--dashboard-success)" : s.tone === "err" ? "var(--dashboard-danger)" : s.tone === "dim" ? "var(--dashboard-muted)" : "var(--dashboard-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.line}</div>
            ))}
            <span className="pd-caret">▍</span>
          </div>
        </div>
      </div>
    </div>
  );
}
