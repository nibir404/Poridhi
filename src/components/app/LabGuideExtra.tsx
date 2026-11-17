"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

/** Lab launch: richer left column under the four steps — outcomes, prerequisites, tools, common errors, related. */
const muted = "var(--dashboard-muted)", border = "1px solid var(--dashboard-border)";
const eyebrow: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: muted };
const card: React.CSSProperties = { display: "grid", gap: 8, padding: 14, borderRadius: 10, border };

function Extra() {
  return (
    <div style={{ display: "grid", gap: 18, marginTop: 24, color: "var(--dashboard-text)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
      <div style={card}>
        <span style={eyebrow}>What you&apos;ll learn</span>
        {["Publish a container port and prove it answers locally", "Read a 502 and trace it to the wrong target port", "Point a load balancer at the right port and health check", "Scale replicas behind one public URL"].map((x) => <span key={x} style={{ display: "flex", gap: 8, lineHeight: 1.45 }}><span style={{ color: "var(--dashboard-success)" }}>✓</span>{x}</span>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["~40 min", "Estimated"], ["Beginner", "Level"], ["4 auto-checks", "Graded live"], ["+40 XP · +20 coins", "On completion"]].map(([v, k]) => (
          <div key={k} style={{ ...card, gap: 2, padding: 12 }}><span style={{ fontSize: 15, fontWeight: 600, fontStyle: "normal" }}>{v}</span><span style={{ fontSize: 12, color: muted }}>{k}</span></div>
        ))}
      </div>

      <div style={card}>
        <span style={eyebrow}>Before you start</span>
        <Link href="/app/learn/class?m=docker-networking-and-storage" style={{ color: "inherit", display: "flex", justifyContent: "space-between" }}><span>Bridge vs host networks</span><span style={{ color: "var(--dashboard-success)" }}>done</span></Link>
        <Link href="/app/learn/class?m=docker-networking-and-storage" style={{ color: "inherit", display: "flex", justifyContent: "space-between" }}><span>Volumes vs bind mounts</span><span style={{ color: "var(--dashboard-success)" }}>done</span></Link>
      </div>

      <div style={card}>
        <span style={eyebrow}>Tools in this lab</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Ubuntu 22.04", "Docker 27", "nginx 1.27", "Load balancer", "curl", "VS Code"].map((t) => <span key={t} style={{ padding: "4px 10px", borderRadius: 999, background: "var(--dashboard-hover)", fontSize: 12 }}>{t}</span>)}</div>
      </div>

      <div style={card}>
        <span style={eyebrow}>Common errors</span>
        {[["502 Bad Gateway", "The LB targets :80 but nginx is published on :8080."], ["port is already allocated", "Another container holds 8080. docker ps, then stop it."], ["connection refused", "The container exited. Check docker logs."]].map(([e, f]) => (
          <div key={e} style={{ display: "grid", gap: 2 }}><code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{e}</code><span style={{ fontSize: 13, color: muted, lineHeight: 1.45 }}>{f}</span></div>
        ))}
      </div>

      <div style={card}>
        <span style={eyebrow}>Next in this module</span>
        <Link href="/app/lab/launch?lab=persist-postgres" style={{ color: "inherit" }}>Lab · Persist Postgres with volumes →</Link>
        <Link href="/app/learn/check" style={{ color: "inherit" }}>Quiz · Networking quick check →</Link>
      </div>
    </div>
  );
}

export default function LabGuideExtra() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const find = () => {
      const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-pid]")).find((e) => !e.children.length && e.textContent?.trim() === "Scale to 3 replicas");
      let list = steps?.parentElement ?? null;
      while (list && !list.textContent?.includes("Pull and run nginx")) list = list.parentElement;
      if (!list?.parentElement) return false;
      const slot = document.createElement("div");
      list.after(slot);
      setHost(slot);
      return true;
    };
    if (find()) return;
    const t = setTimeout(find, 300);
    return () => clearTimeout(t);
  }, []);
  return host ? createPortal(<Extra />, host) : null;
}
