"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { examQuestions } from "@/data/entities";
import { track } from "@/data/roadmap";

/**
 * Exam intro: the module lesson list in the left bar is replaced with exam context —
 * which milestone it certifies, readiness, the ten questions (tool, level, points), attempts and rules.
 */
const muted = "var(--dashboard-muted)", border = "1px solid var(--dashboard-border)";
const eyebrow: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: muted };
const LV: Record<string, string> = { Beginner: "var(--dashboard-success)", Medium: "var(--dashboard-warning)", Hard: "var(--dashboard-danger)" };

function Panel() {
  const ms = track.milestones[0];
  const done = ms.modules.filter((m) => m.status === "done").length;
  const total = examQuestions.reduce((a, q) => a + q.points, 0);
  return (
    <div style={{ display: "grid", gap: 20, padding: "24px 20px", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      <div style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 13, color: muted }}>Milestone 1 · Milestone exam</span>
        <b style={{ fontSize: 17, lineHeight: 1.3 }}>{ms.title}</b>
        <span style={{ fontSize: 13, color: muted }}>Certifies: {ms.certificate}</span>
      </div>

      <div style={{ display: "grid", gap: 8, padding: 14, borderRadius: 10, border, background: "var(--dashboard-hover)" }}>
        <span style={eyebrow}>Readiness</span>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span>Modules finished</span><b>{done} / {ms.modules.length}</b></div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--dashboard-border)" }}><div style={{ width: `${(done / ms.modules.length) * 100}%`, height: "100%", borderRadius: 2, background: "var(--dashboard-success)" }} /></div>
        <span style={{ fontSize: 12, color: muted, lineHeight: 1.45 }}>You can take the exam any time. Finishing the modules first raises your pass odds.</span>
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}><span style={eyebrow}>Questions · {total} pts</span><span style={{ fontSize: 12, color: muted }}>pick any order</span></div>
        {examQuestions.map((q) => (
          <Link key={q.n} href={`/app/exam/q4/instructions?q=${q.n}`} className="pd-rail-item" style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", alignItems: "center", gap: 10, padding: "8px 8px", borderRadius: 8, textDecoration: "none", color: "inherit" }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", border, fontFamily: "var(--font-mono)", fontSize: 12 }}>{q.n}</span>
            <span style={{ display: "grid", minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</span>
              <span style={{ fontSize: 12, color: muted, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 999, background: LV[q.level] }} />{q.level} · {q.tool}</span>
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: muted }}>{q.points}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <span style={eyebrow}>Attempts</span>
        <div style={{ display: "flex", gap: 6 }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--dashboard-border)" }} />)}</div>
        <span style={{ fontSize: 12, color: muted }}>5 of 5 left · best attempt counts</span>
      </div>

      <div style={{ display: "grid", gap: 6, fontSize: 13, color: muted, lineHeight: 1.45 }}>
        <span style={eyebrow}>Rules</span>
        <span>· Docs and man pages allowed</span><span>· Puku AI is off during the exam</span><span>· Exam time doesn&apos;t use your Time Bank</span>
      </div>

      <Link href="/app/roadmap/milestone-1?ms=1" style={{ fontSize: 13, color: "var(--dashboard-text)" }}>← Back to milestone 1</Link>
    </div>
  );
}

export default function ExamSidebar() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const find = () => {
      const label = Array.from(document.querySelectorAll<HTMLElement>("[data-pid]")).find((e) => !e.children.length && /^Milestone 1 · Module \d+ of \d+$/.test(e.textContent?.trim() ?? ""));
      let side = label?.parentElement ?? null;
      while (side && side.getBoundingClientRect().height < window.innerHeight * 0.5) side = side.parentElement;
      if (!side) return false;
      Array.from(side.children).forEach((c) => ((c as HTMLElement).style.display = "none"));
      Object.assign(side.style, { padding: "0", overflowY: "auto" });
      const slot = document.createElement("div");
      side.appendChild(slot);
      setHost(slot);
      return true;
    };
    if (find()) return;
    const t = setTimeout(find, 300);
    return () => clearTimeout(t);
  }, []);
  return host ? createPortal(<Panel />, host) : null;
}
