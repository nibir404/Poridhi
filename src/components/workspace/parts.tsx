"use client";
import { useEffect, useRef, useState } from "react";
import { Ico } from "./Workspace";

/* ---------------- Thread ---------------- */
export type Msg =
  | { id: number; from: "guide" | "you" | "ai" | "system"; text: React.ReactNode; tone?: "ok" | "err" | "hint" }
  | { id: number; from: "check"; text: string; ok: boolean }
  | { id: number; from: "code"; text: string };

const AV: Record<string, { label: string; bg: string; fg: string }> = {
  guide: { label: "P", bg: "var(--dashboard-text)", fg: "var(--dashboard-main)" },
  ai: { label: "AI", bg: "var(--dashboard-text)", fg: "var(--dashboard-main)" },
  you: { label: "RA", bg: "var(--dashboard-hover)", fg: "var(--dashboard-text)" },
};

export function Thread({ msgs, composer, header, typing }: { msgs: Msg[]; composer: React.ReactNode; header?: React.ReactNode; typing?: boolean }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.length, typing]);
  return (
    <>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 20px 8px" }} data-lenis-prevent>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: 16 }}>
          {header}
          {msgs.map((m) => {
            if (m.from === "check") return (
              <div key={m.id} role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--puku-radius)", border: `1px solid ${m.ok ? "color-mix(in srgb, var(--dashboard-success) 40%, var(--dashboard-border))" : "color-mix(in srgb, var(--dashboard-danger) 40%, var(--dashboard-border))"}`, background: m.ok ? "color-mix(in srgb, var(--dashboard-success) 8%, transparent)" : "color-mix(in srgb, var(--dashboard-danger) 8%, transparent)", fontSize: 14 }}>
                <span style={{ color: m.ok ? "var(--dashboard-success)" : "var(--dashboard-danger)" }}><Ico d={m.ok ? "M6 12l4 4 8-8" : "M6 6l12 12M18 6L6 18"} /></span>{m.text}
              </div>
            );
            if (m.from === "code") return <pre key={m.id} style={{ margin: 0, padding: 12, borderRadius: "var(--puku-radius)", background: "var(--dashboard-sidebar)", border: "1px solid var(--dashboard-border)", fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap" }}>{m.text}</pre>;
            if (m.from === "system") return <div key={m.id} style={{ textAlign: "center", fontSize: 12, color: "var(--dashboard-muted)" }}>{m.text}</div>;
            const you = m.from === "you";
            const a = AV[m.from];
            return (
              <div key={m.id} style={{ display: "flex", gap: 12, flexDirection: you ? "row-reverse" : "row", alignItems: "flex-start" }}>
                <span aria-hidden style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0, background: a.bg, color: a.fg, fontSize: 11, fontWeight: 700 }}>{a.label}</span>
                <div style={{ maxWidth: "85%", padding: you ? "10px 14px" : "2px 0", borderRadius: 12, background: you ? "var(--dashboard-hover)" : "transparent", fontSize: 15, lineHeight: 1.6, color: m.tone === "err" ? "var(--dashboard-danger)" : "var(--dashboard-text)" }}>
                  {m.tone === "hint" && <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-warning)", marginBottom: 4 }}>Hint</span>}
                  {m.text}
                </div>
              </div>
            );
          })}
          {typing && <div aria-live="polite" style={{ display: "flex", gap: 6, paddingLeft: 40 }}>{[0, 1, 2].map((i) => <span key={i} className="pd-typing" style={{ width: 6, height: 6, borderRadius: 999, background: "var(--dashboard-muted)", animationDelay: `${i * 0.15}s` }} />)}</div>}
          <div ref={end} />
        </div>
      </div>
      <div style={{ padding: "8px 20px 16px" }}><div style={{ maxWidth: 720, margin: "0 auto" }}>{composer}</div></div>
    </>
  );
}

export function Composer({ placeholder, onSend, chips, disabled, mic }: { placeholder: string; onSend: (t: string) => void; chips?: { label: string; value: string }[]; disabled?: boolean; mic?: { on: boolean; toggle: () => void } }) {
  const [v, setV] = useState("");
  const send = (t = v) => { if (!t.trim() || disabled) return; onSend(t.trim()); setV(""); };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {chips && chips.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {chips.map((c) => <button key={c.label} type="button" onClick={() => send(c.value)} disabled={disabled} style={{ height: 30, padding: "0 10px", borderRadius: 999, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", color: "var(--dashboard-text)", fontSize: 13, cursor: "pointer", fontFamily: c.value.startsWith("$") ? "var(--font-mono)" : "var(--font-sans)" }}>{c.label}</button>)}
        </div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: 8, borderRadius: 12, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)" }}>
        <textarea value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={placeholder} aria-label={placeholder} rows={1} disabled={disabled}
          style={{ flex: 1, resize: "none", minHeight: 36, maxHeight: 160, padding: "8px 6px", border: 0, outline: 0, background: "transparent", color: "var(--dashboard-text)", font: "400 15px/1.5 var(--font-sans)" }} />
        {mic && <button type="button" onClick={mic.toggle} aria-pressed={mic.on} aria-label={mic.on ? "Stop speaking" : "Speak your answer"} style={{ width: 36, height: 36, borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", background: mic.on ? "var(--dashboard-danger)" : "transparent", color: mic.on ? "#fff" : "var(--dashboard-text)", display: "grid", placeItems: "center", cursor: "pointer" }}><Ico d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3" /></button>}
        <button type="submit" aria-label="Send" disabled={disabled || !v.trim()} style={{ width: 36, height: 36, borderRadius: "var(--puku-radius)", border: 0, background: v.trim() ? "var(--dashboard-accent)" : "var(--dashboard-hover)", color: v.trim() ? "var(--dashboard-accent-ink)" : "var(--dashboard-muted)", display: "grid", placeItems: "center", cursor: v.trim() ? "pointer" : "default" }}><Ico d="M5 12h14M13 6l6 6-6 6" /></button>
      </form>
    </div>
  );
}

/* ---------------- Terminal ---------------- */
export type TermLine = { text: string; tone?: "ok" | "err" | "dim" | "cmd" };
export function Terminal({ lines, onRun, prompt = "poridhian@lab-01:~$", suggestions }: { lines: TermLine[]; onRun: (cmd: string) => void; prompt?: string; suggestions?: string[] }) {
  const [v, setV] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [lines.length]);
  return (
    <div onClick={() => input.current?.focus()} style={{ minHeight: "100%", padding: 14, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7, background: "var(--dashboard-main)", cursor: "text" }}>
      {lines.map((l, i) => <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", color: l.tone === "ok" ? "var(--dashboard-success)" : l.tone === "err" ? "var(--dashboard-danger)" : l.tone === "dim" ? "var(--dashboard-muted)" : "var(--dashboard-text)" }}>{l.tone === "cmd" ? <><span style={{ color: "var(--dashboard-success)" }}>{prompt}</span> {l.text}</> : l.text}</div>)}
      <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onRun(v.trim()); setV(""); } }} style={{ display: "flex", gap: 8 }}>
        <span style={{ color: "var(--dashboard-success)", whiteSpace: "nowrap" }}>{prompt}</span>
        <input ref={input} value={v} onChange={(e) => setV(e.target.value)} aria-label="Terminal input" spellCheck={false} autoComplete="off" placeholder={suggestions?.[0] ? `try: ${suggestions[0]}` : ""}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "var(--dashboard-text)", font: "inherit" }} />
      </form>
      <div ref={end} />
    </div>
  );
}

/* ---------------- Editor ---------------- */
export function Editor({ files, active, setActive, onChange }: { files: Record<string, string>; active: string; setActive: (f: string) => void; onChange: (f: string, v: string) => void }) {
  const text = files[active] ?? "";
  const lines = text.split("\n").length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", height: "100%" }}>
      <nav aria-label="Files" style={{ borderRight: "1px solid var(--dashboard-border)", padding: 8, display: "grid", gap: 2, alignContent: "start", background: "var(--dashboard-sidebar)" }}>
        {Object.keys(files).map((f) => <button key={f} type="button" onClick={() => setActive(f)} aria-current={f === active ? "true" : undefined} style={{ textAlign: "left", height: 28, padding: "0 8px", borderRadius: "var(--puku-radius)", border: 0, background: f === active ? "var(--dashboard-hover)" : "transparent", color: "var(--dashboard-text)", fontFamily: "var(--font-mono)", fontSize: 12.5, cursor: "pointer" }}>{f}</button>)}
      </nav>
      <div style={{ display: "grid", gridTemplateColumns: "44px minmax(0, 1fr)", fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: "21px", background: "var(--dashboard-main)" }}>
        <div aria-hidden style={{ padding: "12px 8px", textAlign: "right", color: "var(--dashboard-muted)", userSelect: "none" }}>{Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}</div>
        <textarea value={text} onChange={(e) => onChange(active, e.target.value)} spellCheck={false} aria-label={`Edit ${active}`}
          style={{ resize: "none", border: 0, outline: 0, padding: "12px 12px", background: "transparent", color: "var(--dashboard-text)", font: "inherit", lineHeight: "21px", minHeight: "100%", whiteSpace: "pre", overflow: "auto" }} />
      </div>
    </div>
  );
}

/* ---------------- Whiteboard ---------------- */
export type Box = { id: string; x: number; y: number; label: string };
export function Whiteboard({ boxes, setBoxes, edges }: { boxes: Box[]; setBoxes: (b: Box[]) => void; edges: [string, string][] }) {
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const byId = Object.fromEntries(boxes.map((b) => [b.id, b]));
  const move = (e: React.PointerEvent) => {
    const d = drag.current, el = area.current; if (!d || !el) return;
    const r = el.getBoundingClientRect();
    setBoxes(boxes.map((b) => (b.id === d.id ? { ...b, x: Math.max(0, e.clientX - r.left - d.dx), y: Math.max(0, e.clientY - r.top - d.dy) } : b)));
  };
  return (
    <div ref={area} onPointerMove={move} onPointerUp={() => (drag.current = null)} style={{ position: "relative", minHeight: "100%", height: 520, backgroundImage: "radial-gradient(var(--dashboard-border) 1px, transparent 1px)", backgroundSize: "16px 16px", touchAction: "none" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} aria-hidden>
        <defs><marker id="pd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--dashboard-muted)" /></marker></defs>
        {edges.map(([a, b]) => byId[a] && byId[b] && <line key={a + b} x1={byId[a].x + 60} y1={byId[a].y + 20} x2={byId[b].x + 60} y2={byId[b].y + 20} stroke="var(--dashboard-muted)" strokeWidth="1.4" markerEnd="url(#pd-arrow)" />)}
      </svg>
      {boxes.map((b) => (
        <button key={b.id} type="button" onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); drag.current = { id: b.id, dx: e.clientX - r.left, dy: e.clientY - r.top }; (e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId); }}
          style={{ position: "absolute", left: b.x, top: b.y, width: 120, height: 40, borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-text)", background: "var(--dashboard-panel)", color: "var(--dashboard-text)", fontSize: 13, fontWeight: 500, cursor: "grab" }}>{b.label}</button>
      ))}
      <span style={{ position: "absolute", left: 12, bottom: 10, fontSize: 12, color: "var(--dashboard-muted)" }}>Drag boxes to arrange · the interviewer can see your board</span>
    </div>
  );
}
