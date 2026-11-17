"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { notes as seed, type Note } from "@/data/entities";

/**
 * Notes, restructured as a three-pane reader:
 *  Me nav │ library (courses → modules, filters, tags) │ note list (search, sort) │ reader
 * Filtering lives in one place (the library) instead of two chip rows; the list stays scannable
 * and the reader gets the full height. Everything uses design-system tokens (light + dark).
 */
const COURSES: { id: Note["course"]; label: string; modules?: { id: Note["module"]; label: string }[] }[] = [
  { id: "devops", label: "DevOps & Cloud", modules: [{ id: "M1", label: "M1 · Linux" }, { id: "M2", label: "M2 · Docker" }, { id: "M3", label: "M3 · Kubernetes" }] },
  { id: "k8s", label: "Kubernetes & AWS", modules: [{ id: "M2", label: "M2 · EKS security" }] },
  { id: "go", label: "Backend with Go", modules: [{ id: "M1", label: "M1 · Concurrency" }] },
  { id: "lab", label: "Lab notes" },
];
const ME = [["Profile", "/app/me"], ["Time bank & coins", "/app/me/time-bank"], ["Certificates", "/app/me/certificates"], ["Subscription", "/app/me/subscription"], ["Settings", "/app/me/settings"], ["Progress", "/app/me/progress"], ["Lab history", "/app/me/lab-history"], ["Notes", "/app/me/notes"], ["Schedule", "/app/me/schedule"], ["Support", "/app/me/support"]];
const AGO = ["2 days ago", "5 days ago", "1 week ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago", "1 month ago"];

const T = { muted: "var(--dashboard-muted)", border: "1px solid var(--dashboard-border)", r: "var(--puku-radius)" };
const eyebrow: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: T.muted };
const Svg = ({ d, s = 16 }: { d: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;

function Row({ on, onClick, children, n, indent = 0 }: { on: boolean; onClick: () => void; children: React.ReactNode; n?: number; indent?: number }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="pd-rail-item" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", height: 34, padding: `0 10px 0 ${10 + indent}px`, border: 0, borderRadius: T.r, background: on ? "var(--dashboard-hover)" : "transparent", color: "var(--dashboard-text)", font: `${on ? 600 : 400} 14px/1 var(--font-sans)`, cursor: "pointer", textAlign: "left" }}>
      <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>
      {n != null && <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.muted }}>{n}</span>}
    </button>
  );
}

export default function NotesView() {
  const [all, setAll] = useState<Note[]>(seed);
  const [course, setCourse] = useState<Note["course"] | "all">("all");
  const [mod, setMod] = useState<Note["module"] | null>(null);
  const [hl, setHl] = useState(false);
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [sel, setSel] = useState(seed[0]?.card);

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    const r = all.filter((n) => (course === "all" || n.course === course) && (!mod || n.module === mod) && (!hl || n.highlight) && (!tag || n.tags.includes(tag)) && (!k || `${n.title} ${n.body} ${n.highlight ?? ""} ${n.tags.join(" ")}`.toLowerCase().includes(k)));
    return sort === "new" ? r : [...r].reverse();
  }, [all, course, mod, hl, tag, q, sort]);
  const cur = list.find((n) => n.card === sel) ?? list[0];
  const tags = useMemo(() => [...new Set(all.flatMap((n) => n.tags))], [all]);
  const count = (c: Note["course"], m?: Note["module"]) => all.filter((n) => n.course === c && (!m || n.module === m)).length;
  const pick = (c: Note["course"] | "all", m: Note["module"] | null = null) => { setCourse(c); setMod(m); };
  const scope = course === "all" ? "All notes" : `${COURSES.find((c) => c.id === course)?.label}${mod ? ` · ${COURSES.find((c) => c.id === course)?.modules?.find((x) => x.id === mod)?.label}` : ""}`;

  const exportMd = () => {
    const md = list.map((n) => `## ${n.title}${n.at ? ` (${n.at})` : ""}\n\n${n.highlight ? `> ${n.highlight}\n\n` : ""}${n.body}\n\n${n.tags.join(" ")}\n`).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([`# Notes · ${scope}\n\n${md}`], { type: "text/markdown" })); a.download = "poridhi-notes.md"; a.click();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px 256px 440px minmax(0,1fr)", minHeight: "calc(100dvh - 64px)", background: "var(--dashboard-main)", color: "var(--dashboard-text)", fontFamily: "var(--font-sans)" }}>
      {/* Me nav */}
      <nav aria-label="Account" style={{ borderRight: T.border, background: "var(--dashboard-sidebar)", padding: 16, display: "grid", alignContent: "start", gap: 2 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "4px 6px 16px" }}>
          <span style={{ width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--dashboard-hover)", border: T.border, fontWeight: 600, fontSize: 13 }}>RA</span>
          <span style={{ display: "grid" }}><b style={{ fontSize: 14 }}>Rahim Ahmed</b><span style={{ fontSize: 12, color: T.muted }}>PRO · Engineer #7</span></span>
        </div>
        {ME.map(([l, h]) => <Link key={h} href={h} aria-current={l === "Notes" ? "page" : undefined} className="pd-rail-item" style={{ height: 34, display: "flex", alignItems: "center", padding: "0 10px", borderRadius: T.r, fontSize: 14, textDecoration: "none", color: "var(--dashboard-text)", background: l === "Notes" ? "var(--dashboard-hover)" : "transparent", fontWeight: l === "Notes" ? 600 : 400 }}>{l}</Link>)}
      </nav>

      {/* Library */}
      <aside aria-label="Library" style={{ borderRight: T.border, padding: 16, display: "grid", alignContent: "start", gap: 20 }}>
        <div style={{ display: "grid", gap: 2 }}>
          <span style={{ ...eyebrow, padding: "0 10px 6px" }}>Library</span>
          <Row on={course === "all" && !hl} onClick={() => { pick("all"); setHl(false); }} n={all.length}>All notes</Row>
          <Row on={hl} onClick={() => setHl(!hl)} n={all.filter((n) => n.highlight).length}>With highlight</Row>
        </div>
        <div style={{ display: "grid", gap: 2 }}>
          <span style={{ ...eyebrow, padding: "0 10px 6px" }}>Courses</span>
          {COURSES.map((c) => (
            <div key={c.id} style={{ display: "grid", gap: 2 }}>
              <Row on={course === c.id && !mod} onClick={() => pick(c.id)} n={count(c.id)}>{c.label}</Row>
              {course === c.id && c.modules?.map((m) => <Row key={m.id} indent={14} on={mod === m.id} onClick={() => pick(c.id, m.id)} n={count(c.id, m.id)}>{m.label}</Row>)}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ ...eyebrow, padding: "0 10px" }}>Tags</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 6px" }}>
            {tags.map((t) => <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)} style={{ height: 26, padding: "0 10px", borderRadius: 999, border: T.border, background: tag === t ? "var(--dashboard-accent)" : "transparent", color: tag === t ? "var(--dashboard-accent-ink)" : "var(--dashboard-text)", fontSize: 12, cursor: "pointer" }}>{t}</button>)}
          </div>
        </div>
      </aside>

      {/* List */}
      <section aria-label="Notes" style={{ borderRight: T.border, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ padding: 16, borderBottom: T.border, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-.02em" }}>{scope}</h1>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: T.muted }}>{list.length} notes</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 10px", border: T.border, borderRadius: T.r, color: T.muted }}>
              <Svg d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes" aria-label="Search notes" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--dashboard-text)", fontSize: 14 }} />
            </label>
            <button type="button" onClick={() => setSort(sort === "new" ? "old" : "new")} aria-label="Toggle sort order" style={{ height: 36, padding: "0 12px", border: T.border, borderRadius: T.r, background: "transparent", color: "var(--dashboard-text)", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>{sort === "new" ? "Newest" : "Oldest"} ↕</button>
          </div>
        </header>
        <div style={{ overflowY: "auto", flex: 1 }} data-lenis-prevent>
          {list.length === 0 && <div className="pd-hatch" style={{ margin: 16, padding: 32, borderRadius: T.r, border: T.border, textAlign: "center", color: T.muted, fontSize: 14 }}>No notes match. Clear a filter or save one from a lesson transcript.</div>}
          {list.map((n) => {
            const on = n.card === cur?.card;
            return (
              <button key={n.card} type="button" onClick={() => setSel(n.card)} aria-current={on ? "true" : undefined} style={{ display: "grid", gap: 6, width: "100%", textAlign: "left", padding: "14px 16px", border: 0, borderBottom: T.border, borderLeft: `2px solid ${on ? "var(--dashboard-text)" : "transparent"}`, background: on ? "var(--dashboard-hover)" : "transparent", color: "var(--dashboard-text)", cursor: "pointer" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <b style={{ fontSize: 14, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.title}</b>
                  <span style={{ fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{AGO[all.indexOf(n) % AGO.length]}</span>
                </span>
                <span style={{ fontSize: 13, lineHeight: 1.45, color: T.muted, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.highlight ? `“${n.highlight}”` : n.body}</span>
                <span style={{ display: "flex", gap: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: T.muted }}>
                  <span>{n.course === "lab" ? "LAB" : `${n.module}`}</span>{n.at && <span>▶ {n.at}</span>}<span>{n.tags.join(" ")}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Reader */}
      <article aria-label="Note" style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 24px", borderBottom: T.border }}>
          <span style={{ ...eyebrow, flex: 1 }}>{cur?.meta ?? ""}</span>
          <button type="button" onClick={exportMd} style={{ height: 32, padding: "0 12px", border: T.border, borderRadius: T.r, background: "transparent", color: "var(--dashboard-text)", fontSize: 13, cursor: "pointer" }}>Export .md</button>
          {cur && <button type="button" aria-label="Delete note" onClick={() => setAll((a) => a.filter((x) => x.card !== cur.card))} style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: T.border, borderRadius: T.r, background: "transparent", color: "var(--dashboard-text)", cursor: "pointer" }}><Svg d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></button>}
        </div>
        {cur ? (
          <div style={{ padding: "32px 40px", display: "grid", gap: 24, maxWidth: 760, alignContent: "start" }}>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 600, letterSpacing: "-.03em" }}>{cur.title}</h2>
            {cur.at && cur.m ? (
              <Link href={`/app/learn/class?m=${cur.m}&t=${cur.at}`} className="pd-hatch" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: T.r, border: T.border, textDecoration: "none", color: "var(--dashboard-text)" }}>
                <span style={{ width: 40, height: 40, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)" }}><Svg d="M8 5v14l11-7z" /></span>
                <span style={{ display: "grid" }}><b style={{ fontSize: 14 }}>Jump to {cur.at} in the lesson</b><span style={{ fontSize: 13, color: T.muted }}>Opens the video and transcript at this moment</span></span>
              </Link>
            ) : cur.course === "lab" ? (
              <Link href="/app/me/lab-history" style={{ display: "flex", alignItems: "center", gap: 10, padding: 16, borderRadius: T.r, border: T.border, textDecoration: "none", color: "var(--dashboard-text)", fontSize: 14 }}><Svg d="M3 4h18v16H3zM7 10l3 2.5L7 15" />Open the lab run this note came from →</Link>
            ) : null}
            {cur.highlight && <blockquote style={{ margin: 0, padding: "4px 0 4px 16px", borderLeft: "3px solid #B0B3FC", fontSize: 17, lineHeight: 1.55 }}>“{cur.highlight}”</blockquote>}
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>{cur.body}</p>
            <div style={{ display: "flex", gap: 6 }}>{cur.tags.map((t) => <button key={t} type="button" onClick={() => setTag(t)} style={{ height: 28, padding: "0 12px", borderRadius: 999, border: T.border, background: "var(--dashboard-hover)", color: "var(--dashboard-text)", fontSize: 13, cursor: "pointer" }}>{t}</button>)}</div>
          </div>
        ) : <div className="pd-hatch" style={{ margin: 24, flex: 1, borderRadius: T.r, border: T.border, display: "grid", placeItems: "center", color: T.muted }}>Select a note</div>}
      </article>
    </div>
  );
}
