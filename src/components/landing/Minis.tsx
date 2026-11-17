"use client";
import { useState } from "react";
import RankBadge from "./RankBadge";
import { Check, S, mono } from "./ui";

/** Small live UI snippets for the capability and proof grids (render.com-style visuals). */
const box: React.CSSProperties = { width: "100%", borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", background: "var(--dashboard-main)", padding: S(3), fontSize: 12, display: "grid", gap: S(2) };
const m: React.CSSProperties = { ...mono, fontSize: 11.5, lineHeight: 1.6 };
const dot = (c: string) => <span style={{ width: 7, height: 7, borderRadius: 999, background: c, flexShrink: 0 }} />;

export const MINIS: Record<string, React.ReactNode> = {
  "VS Code in the browser": (
    <div style={{ ...box, ...m, gap: 0 }}>
      <span style={{ color: "var(--dashboard-muted)" }}>1 <span style={{ color: "var(--dashboard-text)" }}>server</span> {"{"}</span>
      <span style={{ color: "var(--dashboard-muted)" }}>2 {"  "}<span style={{ color: "var(--dashboard-text)" }}>listen</span> 8080;</span>
      <span style={{ color: "var(--dashboard-muted)" }}>3 {"  "}<span style={{ color: "var(--dashboard-text)" }}>root</span> /usr/share/nginx;</span>
      <span style={{ color: "var(--dashboard-muted)" }}>4 {"}"}</span>
    </div>
  ),
  "Multiple terminals": (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S(2) }}>
      {[["lab-01", "$ docker ps", "nginx Up"], ["lab-02", "$ curl :8080", "200 OK"]].map(([h, a, b]) => (
        <div key={h} style={{ ...box, ...m, gap: 0 }}><span style={{ color: "var(--dashboard-muted)" }}>{h}</span><span>{a}</span><span style={{ color: "var(--dashboard-success)" }}>{b}</span></div>
      ))}
    </div>
  ),
  "Load balancer": (
    <div style={{ ...box, gridTemplateColumns: "auto 1fr auto", alignItems: "center", ...m }}>
      <span>:80</span><span style={{ height: 1, background: "var(--dashboard-text)" }} /><span>lab-01:8080</span>
      <span style={{ gridColumn: "1 / -1", display: "flex", gap: S(2), alignItems: "center", color: "var(--dashboard-success)" }}>{dot("var(--dashboard-success)")}healthy · 38 ms</span>
    </div>
  ),
  "Databases on demand": (
    <div style={{ display: "flex", gap: S(2), flexWrap: "wrap" }}>
      {[["Postgres 16", true], ["MongoDB 8", false], ["Redis 7", true]].map(([n, on]) => (
        <span key={n as string} style={{ ...box, width: "auto", display: "inline-flex", alignItems: "center", gap: S(2), padding: `${S(2)}px ${S(3)}px` }}>{dot(on ? "var(--dashboard-success)" : "var(--dashboard-muted)")}{n}</span>
      ))}
    </div>
  ),
  "Cloud tray": (
    <div style={box}>
      {[["EC2 · t3.micro", true], ["S3 · lab-artifacts", true], ["IAM role · lab", false]].map(([n, on]) => (
        <span key={n as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>{n}<span aria-hidden style={{ width: 26, height: 14, borderRadius: 999, background: on ? "var(--dashboard-text)" : "var(--dashboard-border)", position: "relative" }}><span style={{ position: "absolute", top: 2, left: on ? 14 : 2, width: 10, height: 10, borderRadius: 999, background: "var(--dashboard-main)" }} /></span></span>
      ))}
    </div>
  ),
  "Expose ports": (
    <div style={{ ...box, gridTemplateColumns: "1fr auto", alignItems: "center", ...m }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://66dbf3.lb.poridhi.io</span>
      <span style={{ padding: "2px 8px", borderRadius: 4, background: "var(--dashboard-hover)" }}>Copy</span>
    </div>
  ),
  "Credentials": <Reveal />,
  "Files and snapshots": (
    <div style={{ ...box, ...m, gap: 0 }}>
      <span>▾ ~/lab</span><span>{"  "}▸ nginx/</span><span>{"  "}default.conf</span><span style={{ color: "var(--dashboard-muted)" }}>{"  "}snapshot · 2 min ago</span>
    </div>
  ),
  "Checks in the VM": (
    <div style={box}>{["nginx is running", "Port 8080 answers", "Public URL answers"].map((x, i) => <span key={x} style={{ display: "flex", gap: S(2), alignItems: "center", color: i < 2 ? "var(--dashboard-text)" : "var(--dashboard-muted)" }}>{i < 2 ? <Check /> : dot("var(--dashboard-muted)")}{x}</span>)}</div>
  ),
  "AI-graded exams": (
    <div style={{ ...box, gridTemplateColumns: "auto 1fr", alignItems: "center", gap: S(3) }}>
      <svg width="54" height="54" viewBox="0 0 36 36" aria-label="85 out of 100"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--dashboard-border)" strokeWidth="3" /><circle cx="18" cy="18" r="15" fill="none" stroke="var(--dashboard-text)" strokeWidth="3" strokeDasharray="80 100" strokeLinecap="round" transform="rotate(-90 18 18)" /><text x="18" y="21" textAnchor="middle" fontSize="9" fill="var(--dashboard-text)" fontFamily="var(--font-mono)">85</text></svg>
      <span style={{ display: "grid", gap: 2 }}><b>Q4 · Load balancer</b><span style={{ color: "var(--dashboard-muted)" }}>Rubric: 4 of 5 criteria</span></span>
    </div>
  ),
  "Verified certificates": (
    <div style={{ ...box, gridTemplateColumns: "auto 1fr", alignItems: "center", gap: S(3) }}>
      <RankBadge rank="Engineer" size={36} />
      <span style={{ display: "grid", gap: 2 }}><b>Linux, Scripting &amp; Containers</b><span style={{ ...m, color: "var(--dashboard-muted)" }}>ID PRD-7FQR-91 · verified</span></span>
    </div>
  ),
  "Public portfolio": (
    <div style={{ ...box, gridTemplateColumns: "auto 1fr", alignItems: "center", gap: S(3) }}>
      <span style={{ width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--dashboard-hover)", fontWeight: 600 }}>RA</span>
      <span style={{ display: "grid", gap: 2 }}><b>Rahim Ahmed</b><span style={{ color: "var(--dashboard-muted)" }}>142 labs · 2 certificates · Lean hire</span></span>
    </div>
  ),
  "Interview signal": (
    <div style={{ ...box, gridTemplateColumns: "repeat(5, 1fr)", alignItems: "end", height: 78 }}>
      {[70, 85, 55, 90, 65].map((h, i) => <span key={i} style={{ height: `${h}%`, borderRadius: 3, background: h >= 80 ? "var(--dashboard-text)" : "var(--dashboard-border)" }} />)}
    </div>
  ),
  "Ranks you earn": (
    <div style={{ display: "flex", gap: S(1), justifyContent: "center" }}>
      {["Intern", "Junior", "Engineer", "Senior", "Staff"].map((r, i) => <RankBadge key={r} rank={r} size={32} locked={i > 2} />)}
    </div>
  ),
  "Leaderboard": (
    <div style={box}>{[["1", "Nusrat J.", "2,410"], ["2", "Arif H.", "2,180"], ["7", "You", "1,240"]].map(([n, who, xp]) => <span key={n} style={{ display: "flex", gap: S(2), fontWeight: who === "You" ? 600 : 400 }}><span style={{ ...m, width: 14 }}>{n}</span>{who}<span style={{ ...m, marginLeft: "auto" }}>{xp}</span></span>)}</div>
  ),
  "TA sessions": (
    <div style={{ display: "flex", gap: S(2), flexWrap: "wrap" }}>{["Mon 10:00", "Tue 15:30", "Wed 19:00"].map((t, i) => <span key={t} style={{ ...box, width: "auto", padding: `${S(2)}px ${S(3)}px`, background: i === 1 ? "var(--dashboard-text)" : "var(--dashboard-main)", color: i === 1 ? "var(--dashboard-main)" : "var(--dashboard-text)" }}>{t}</span>)}</div>
  ),
};

function Reveal() {
  const [on, setOn] = useState(false);
  return (
    <div style={{ ...box, gridTemplateColumns: "1fr auto", alignItems: "center", ...m }}>
      <span>{on ? "pdh_x9Lr2Qe8vT7Q2a" : "pdh_••••••••••7Q2a"}</span>
      <button type="button" onClick={(e) => { e.preventDefault(); setOn(!on); }} style={{ padding: "2px 8px", borderRadius: 4, border: 0, background: "var(--dashboard-hover)", color: "var(--dashboard-text)", cursor: "pointer", ...m }}>{on ? "Hide" : "Reveal"}</button>
    </div>
  );
}
