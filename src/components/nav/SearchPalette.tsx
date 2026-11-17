"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { catalog, type Item, type Kind } from "@/data/catalog";
import { ItemIcon } from "@/data/itemIcon";

const PAGES: [string, string][] = [["Dashboard", "/app"], ["Roadmap", "/app/roadmap"], ["Lab library", "/labs"], ["Career tracks", "/courses"], ["AI interview", "/app/interview"], ["Milestone exam", "/app/exam"], ["Notes", "/app/me/notes"], ["Time bank & coins", "/app/me/time-bank"], ["Leaderboard", "/app/leaderboard"], ["Settings", "/app/me/settings"], ["Support", "/app/me/support"], ["Pricing", "/pricing"]];
const FILTERS: ("All" | Kind)[] = ["All", "Track", "Lab", "Lab guide", "AI practice"];
const LABEL: Record<string, string> = { All: "All", Track: "Tracks", Lab: "Labs", "Lab guide": "Lab guides", "AI practice": "AI practice" };

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (<>{text.slice(0, i)}<mark style={{ background: "color-mix(in oklab, #B0B3FC 45%, transparent)", color: "inherit", borderRadius: 3, padding: "0 1px" }}>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>);
}

export default function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) { setActive(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    const words = t.split(/\s+/).filter(Boolean);
    return catalog.filter((i) => { const h = `${i.title} ${i.meta} ${i.topic} ${i.kind}`.toLowerCase(); return words.every((w) => h.includes(w)); })
      .sort((a, b) => Number(b.title.toLowerCase().startsWith(t)) - Number(a.title.toLowerCase().startsWith(t)));
  }, [q]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: matches.length };
    matches.forEach((m) => (c[m.kind] = (c[m.kind] ?? 0) + 1));
    return c;
  }, [matches]);
  const list = filter === "All" ? matches : matches.filter((m) => m.kind === filter);
  const best = list[0];
  const rest = list.slice(1, 9);
  const flat: Item[] = best ? [best, ...rest] : [];

  const openItem = (i?: Item) => { if (!i) return; onClose(); router.push(i.href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); openItem(flat[active]); }
    else if (e.key === "Tab") { e.preventDefault(); setFilter((f) => FILTERS[(FILTERS.indexOf(f) + (e.shiftKey ? FILTERS.length - 1 : 1)) % FILTERS.length]); setActive(0); }
    else if (e.key === "Escape") onClose();
  };

  const row = (i: Item, idx: number, isBest = false) => (
    <div key={i.title} onMouseEnter={() => setActive(idx)} onClick={() => openItem(i)}
      style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 6, cursor: "pointer", background: idx === active ? "var(--dashboard-hover)" : "transparent", transition: "background .12s" }}>
      <ItemIcon item={i} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 16, fontWeight: 600, lineHeight: "20px", color: "var(--dashboard-text)" }}>
          <span><Highlight text={i.title} q={q.trim()} /></span>
          {i.pro && <span style={{ background: "var(--dashboard-accent)", color: "var(--dashboard-panel)", fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4 }}>Pro</span>}
          {i.isNew && <span style={{ background: "var(--dashboard-accent)", color: "var(--dashboard-accent-ink)", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>New</span>}
        </div>
        <div style={{ fontSize: 13, lineHeight: "16px", color: "var(--dashboard-muted)" }}>{i.meta}</div>
      </div>
      {i.time && <div style={{ color: "var(--dashboard-warning)", fontSize: 13, fontWeight: 500 }}>{i.time}</div>}
      {(isBest || idx === active) && <div style={{ border: "1px solid var(--dashboard-border)", background: "var(--dashboard-panel)", borderRadius: 4, padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--dashboard-text)" }}>↵</div>}
    </div>
  );
  const head = (t: string) => <div style={{ padding: "16px 10px 6px", fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--dashboard-muted)" }}>{t}</div>;

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(14,14,14,.55)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", paddingTop: "12vh", paddingInline: 16, fontFamily: "var(--font-sans)" }}>
          <motion.div initial={{ y: 16, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 8, scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search"
            style={{ width: "min(760px, 100%)", maxHeight: "76vh", display: "flex", flexDirection: "column", background: "var(--dashboard-panel)", border: "1px solid var(--dashboard-border)", borderRadius: 12, boxShadow: "0 40px 80px -32px rgba(0,0,0,.5)", overflow: "hidden", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 64, padding: "0 20px", borderBottom: "1px solid var(--dashboard-border)", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dashboard-text)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.4-4.4" /></svg>
              <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
                placeholder="Search tracks, labs, guides…" aria-label="Search"
                style={{ flex: 1, border: 0, outline: 0, fontSize: 19, lineHeight: "24px", color: "var(--dashboard-text)", fontFamily: "inherit", background: "transparent" }} />
              <button onClick={onClose} style={{ border: "1px solid var(--dashboard-border)", borderRadius: 4, padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--dashboard-muted)", background: "var(--dashboard-panel)", cursor: "pointer" }}>esc</button>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderBottom: "1px solid var(--dashboard-border)", flexWrap: "wrap", flexShrink: 0 }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => { setFilter(f); setActive(0); input.current?.focus(); }}
                  style={{ border: 0, cursor: "pointer", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: filter === f ? "var(--dashboard-accent)" : "var(--dashboard-hover)", color: filter === f ? "var(--dashboard-panel)" : "var(--dashboard-text)" }}>
                  {LABEL[f]} · {counts[f] ?? 0}
                </button>
              ))}
            </div>
            <div style={{ padding: 10, overflowY: "auto" }} data-lenis-prevent>
              {!best && <div style={{ padding: 28, textAlign: "center", color: "var(--dashboard-muted)", fontSize: 14 }}>No results for “{q}”. Try “docker”, “kubernetes” or “interview”.</div>}
              {best && (<>{head("Best match")}{row(best, 0, true)}</>)}
              {rest.length > 0 && (<>{head(filter === "All" ? "More results" : LABEL[filter])}{rest.map((i, k) => row(i, k + 1))}</>)}
              {(() => { const t = q.trim().toLowerCase(); const pg = t ? PAGES.filter(([l]) => l.toLowerCase().includes(t)) : []; return pg.length > 0 && (<>{head("Go to")}
                <div style={{ display: "flex", gap: 8, padding: "4px 10px 6px", flexWrap: "wrap" }}>{pg.map(([l, h]) => <button key={h} onClick={() => { onClose(); router.push(h); }} style={{ padding: "8px 12px", border: "1px solid var(--dashboard-border)", borderRadius: 8, background: "var(--dashboard-panel)", color: "var(--dashboard-text)", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>{l} →</button>)}</div></>); })()}
              {head("Quick actions")}
              <div style={{ display: "flex", gap: 8, padding: "4px 10px 10px", flexWrap: "wrap" }}>
                {[["›_", "Open a lab", "/app/lab/launch"], ["Q&A", "Start an AI interview", "/app/interview"], ["✓", "Milestone exam", "/app/exam"]].map(([ic, t, h]) => (
                  <button key={t} onClick={() => { onClose(); router.push(h); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid var(--dashboard-border)", borderRadius: 6, background: "var(--dashboard-panel)", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "var(--dashboard-text)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--dashboard-muted)" }}>{ic}</span>{t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, height: 44, padding: "0 20px", background: "var(--dashboard-sidebar)", borderTop: "1px solid var(--dashboard-border)", fontSize: 12, color: "var(--dashboard-muted)", flexShrink: 0 }}>
              <span><span style={{ fontFamily: "var(--font-mono)" }}>↑↓</span> navigate</span>
              <span><span style={{ fontFamily: "var(--font-mono)" }}>↵</span> open</span>
              <span><span style={{ fontFamily: "var(--font-mono)" }}>tab</span> filter</span>
              <span style={{ marginLeft: "auto" }} className="pd-hide-sm">Searches tracks, labs, guides and commands</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
