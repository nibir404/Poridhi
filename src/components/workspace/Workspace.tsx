"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeSwitch from "@/components/theme/ThemeSwitch";
import AccountMenu from "@/components/app/AccountMenu";

/**
 * Claude / Codex-style workspace shared by the lab, AI interview and AI exam.
 * ┌──────────────── task bar (the single header) ────────────────┐
 * │ rail │ thread (conversation + composer) ║ artifact pane (tabs) │
 * Rail collapses; the split between thread and artifact is draggable (and keyboard-resizable).
 * Everything uses design-system tokens, so it follows light and dark.
 */
export type Tab = { id: string; label: string; icon: string; body: React.ReactNode };
export type RailItem = { id: string; title: string; meta?: string; href?: string; active?: boolean; status?: "done" | "current" | "todo" | "locked" };

export const Ico = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
export const iconBtn: React.CSSProperties = { width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "var(--puku-radius)", border: 0, background: "transparent", color: "var(--dashboard-text)", cursor: "pointer" };

function Dot({ s }: { s?: RailItem["status"] }) {
  const c = s === "done" ? "var(--dashboard-success)" : s === "current" ? "var(--dashboard-text)" : "var(--dashboard-border)";
  return <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: s === "todo" || s === "locked" ? "transparent" : c, border: `1.5px solid ${c}` }} />;
}

export default function Workspace(props: {
  back: string; crumb: string; title: string;
  progress?: { done: number; total: number; label?: string };
  timer?: string; timerTone?: "ok" | "warn";
  railTitle: string; railAction?: { label: string; href: string }; rail: RailItem[];
  thread: React.ReactNode; tabs: Tab[]; tab: string; setTab: (id: string) => void;
  actions?: React.ReactNode; height?: string; onTour?: () => void;
}) {
  const [railOpen, setRailOpen] = useState(true);
  const [split, setSplit] = useState(0.46); // thread share of the main area
  const [account, setAccount] = useState<DOMRect | null>(null);
  const main = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const f = () => setNarrow(window.innerWidth < 900);
    f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f);
  }, []);

  const down = (e: React.PointerEvent) => {
    const el = main.current; if (!el) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const move = (ev: PointerEvent) => setSplit(Math.max(0.28, Math.min(0.72, (ev.clientX - r.left) / r.width)));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); document.body.style.cursor = ""; };
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  const key = (e: React.KeyboardEvent) => { if (e.key === "ArrowLeft") setSplit((s) => Math.max(0.28, s - 0.03)); if (e.key === "ArrowRight") setSplit((s) => Math.min(0.72, s + 0.03)); };
  const active = props.tabs.find((t) => t.id === props.tab) ?? props.tabs[0];

  return (
    <div className="pd-ws" style={{ height: props.height ?? "100dvh", display: "grid", gridTemplateRows: "56px minmax(0, 1fr)", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      {/* Task bar */}
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 12px", borderBottom: "1px solid var(--dashboard-border)", background: "var(--dashboard-sidebar)" }}>
        <Link href={props.back} aria-label="Back" style={{ ...iconBtn, background: "var(--dashboard-hover)", textDecoration: "none" }}><Ico d="M15 5l-7 7 7 7" /></Link>
        <button type="button" aria-label={railOpen ? "Hide sidebar" : "Show sidebar"} aria-pressed={railOpen} onClick={() => setRailOpen(!railOpen)} style={iconBtn}><Ico d="M3 4h18v16H3zM9 4v16" /></button>
        <div style={{ display: "grid", minWidth: 0 }}>
          <span style={{ fontSize: 12, color: "var(--dashboard-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{props.crumb}</span>
          <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{props.title}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {props.progress && (
            <span data-tour="progress" aria-label={`${props.progress.done} of ${props.progress.total} ${props.progress.label ?? "done"}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 32, padding: "0 12px", borderRadius: "var(--puku-radius)", background: "var(--dashboard-hover)" }}>
              <span style={{ display: "flex", gap: 3 }}>{Array.from({ length: props.progress.total }, (_, i) => <span key={i} style={{ width: 14, height: 4, borderRadius: 2, background: i < props.progress!.done ? "var(--dashboard-success)" : "var(--dashboard-border)" }} />)}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{props.progress.done} / {props.progress.total}</span>
            </span>
          )}
          {props.timer && <span data-tour="timer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 13 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: props.timerTone === "warn" ? "var(--dashboard-warning)" : "var(--dashboard-success)" }} />{props.timer}</span>}
          <span data-tour="actions" style={{ display: "contents" }}>{props.actions}</span>
          {props.onTour && <button type="button" onClick={props.onTour} aria-label="Take the tour" title="Take the tour" style={iconBtn}><Ico d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01" /></button>}
          <ThemeSwitch inline />
          <button type="button" aria-label="Account menu" onClick={(e) => { e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); setAccount((a) => (a ? null : r)); }} style={{ ...iconBtn, borderRadius: 999, border: "1px solid var(--dashboard-border)", background: "var(--dashboard-hover)", fontSize: 12, fontWeight: 600 }}>RA</button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: `${railOpen && !narrow ? "248px" : "0px"} minmax(0, 1fr)`, minHeight: 0, transition: "grid-template-columns .2s var(--puku-ease)" }}>
        {/* Rail */}
        <aside data-tour="rail" aria-label={props.railTitle} style={{ overflow: "hidden", borderRight: railOpen && !narrow ? "1px solid var(--dashboard-border)" : 0, background: "var(--dashboard-sidebar)", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: 12, display: "grid", gap: 8 }}>
            {props.railAction && <Link href={props.railAction.href} className="puku-btn puku-btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", borderRadius: "var(--puku-radius)", border: "1px solid var(--dashboard-border)", color: "var(--dashboard-text)", textDecoration: "none", fontSize: 13, fontWeight: 500 }}><Ico d="M12 5v14M5 12h14" size={14} />{props.railAction.label}</Link>}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--dashboard-muted)", padding: "8px 4px 0" }}>{props.railTitle}</span>
          </div>
          <nav style={{ overflowY: "auto", padding: "0 8px 12px", display: "grid", gap: 2, alignContent: "start" }} data-lenis-prevent>
            {props.rail.map((r) => {
              const inner = (
                <>
                  <Dot s={r.status} />
                  <span style={{ display: "grid", minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: r.active ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: r.status === "locked" ? "var(--dashboard-muted)" : "var(--dashboard-text)" }}>{r.title}</span>
                    {r.meta && <span style={{ fontSize: 12, color: "var(--dashboard-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.meta}</span>}
                  </span>
                </>
              );
              const st: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: "var(--puku-radius)", background: r.active ? "var(--dashboard-hover)" : "transparent", textDecoration: "none", color: "inherit" };
              return r.href ? <Link key={r.id} href={r.href} aria-current={r.active ? "page" : undefined} className="pd-rail-item" style={st}>{inner}</Link> : <div key={r.id} style={st}>{inner}</div>;
            })}
          </nav>
        </aside>

        {/* Thread ║ artifact */}
        <div ref={main} style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : `minmax(0, ${split}fr) 6px minmax(0, ${1 - split}fr)`, gridTemplateRows: narrow ? "minmax(0, 1fr) minmax(0, 1fr)" : undefined, minHeight: 0 }}>
          <section data-tour="thread" aria-label="Conversation" style={{ minHeight: 0, display: "flex", flexDirection: "column" }}>{props.thread}</section>
          {!narrow && <div role="separator" aria-orientation="vertical" aria-label="Resize panes" tabIndex={0} onPointerDown={down} onKeyDown={key} onDoubleClick={() => setSplit(0.46)} className="pd-resizer" style={{ width: 6 }} />}
          <section aria-label="Workspace" style={{ minHeight: 0, display: "flex", flexDirection: "column", borderLeft: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)" }}>
            <div data-tour="tabs" role="tablist" aria-label="Workspace tools" style={{ display: "flex", gap: 2, padding: 6, borderBottom: "1px solid var(--dashboard-border)", overflowX: "auto" }}>
              {props.tabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={t.id === active.id} onClick={() => props.setTab(t.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px", borderRadius: "var(--puku-radius)", border: 0, background: t.id === active.id ? "var(--dashboard-hover)" : "transparent", color: t.id === active.id ? "var(--dashboard-text)" : "var(--dashboard-muted)", font: `${t.id === active.id ? 600 : 500} 13px/1 var(--font-sans)`, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Ico d={t.icon} size={14} />{t.label}
                </button>
              ))}
            </div>
            <div role="tabpanel" style={{ flex: 1, minHeight: 0, overflow: "auto" }} data-lenis-prevent>{active.body}</div>
          </section>
        </div>
      </div>
      <AccountMenu anchor={account} onClose={() => setAccount(null)} />
    </div>
  );
}
