"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { catalog, type Item, type Kind } from "@/data/catalog";

const FILTERS: ("All" | Kind)[] = ["All", "Track", "Lab", "Lab guide", "AI practice"];
const LABEL: Record<string, string> = { All: "All", Track: "Tracks", Lab: "Labs", "Lab guide": "Lab guides", "AI practice": "AI practice" };

function Icon({ kind }: { kind: Kind }) {
  const dark = kind === "Lab" || kind === "Lab guide";
  const bg = kind === "Track" ? "linear-gradient(150deg,#1E2144,#424894)" : kind === "AI practice" ? "var(--color-blue-50)" : "#0E0E0E";
  const stroke = kind === "AI practice" ? "#333874" : "#FFFFFF";
  return (
    <div style={{ width: 44, height: 44, borderRadius: 6, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {kind === "Track" && (<><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6" /></>)}
        {dark && kind === "Lab" && (<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 10l3 2.5L7 15M12.5 15H17" /></>)}
        {kind === "Lab guide" && (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>)}
        {kind === "AI practice" && (<><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 3v-3a2 2 0 0 1-2-2z" /><path d="M9 9v3M12 7.5v6M15 9v3" /></>)}
      </svg>
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (<>{text.slice(0, i)}<span style={{ color: "var(--color-blue-700)" }}>{text.slice(i, i + q.length)}</span>{text.slice(i + q.length)}</>);
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
    return catalog.filter((i) => !t || `${i.title} ${i.meta} ${i.topic}`.toLowerCase().includes(t));
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
      style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 6, cursor: "pointer", background: idx === active ? "var(--color-blue-50)" : "transparent", transition: "background .12s" }}>
      <Icon kind={i.kind} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 16, fontWeight: 600, lineHeight: "20px", color: "var(--color-ink)" }}>
          <span><Highlight text={i.title} q={q.trim()} /></span>
          {i.pro && <span style={{ background: "var(--color-grey-900)", color: "#fff", fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4 }}>Pro</span>}
          {i.isNew && <span style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>New</span>}
        </div>
        <div style={{ fontSize: 13, lineHeight: "16px", color: "var(--color-ink-3)" }}>{i.meta}</div>
      </div>
      {i.time && <div style={{ color: "#C4401A", fontSize: 13, fontWeight: 500 }}>{i.time}</div>}
      {(isBest || idx === active) && <div style={{ border: "1px solid var(--color-line)", background: "#fff", borderRadius: 4, padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-2)" }}>↵</div>}
    </div>
  );
  const head = (t: string) => <div style={{ padding: "16px 10px 6px", fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-ink-3)" }}>{t}</div>;

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(14,14,14,.55)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", paddingTop: "12vh", paddingInline: 16, fontFamily: "var(--font-sans)" }}>
          <motion.div initial={{ y: 16, scale: 0.98, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 8, scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search"
            style={{ width: "min(760px, 100%)", maxHeight: "76vh", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid var(--color-line)", borderRadius: 6, boxShadow: "0 40px 80px -32px rgba(0,0,0,.5)", overflow: "hidden", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, height: 64, padding: "0 20px", borderBottom: "1px solid var(--color-line)", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.4-4.4" /></svg>
              <input ref={input} value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey}
                placeholder="Search tracks, labs, guides…" aria-label="Search"
                style={{ flex: 1, border: 0, outline: 0, fontSize: 19, lineHeight: "24px", color: "var(--color-ink)", fontFamily: "inherit", background: "transparent" }} />
              <button onClick={onClose} style={{ border: "1px solid var(--color-line)", borderRadius: 4, padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-3)", background: "#fff", cursor: "pointer" }}>esc</button>
            </div>
            <div style={{ display: "flex", gap: 8, padding: "12px 20px", borderBottom: "1px solid var(--color-line)", flexWrap: "wrap", flexShrink: 0 }}>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => { setFilter(f); setActive(0); input.current?.focus(); }}
                  style={{ border: 0, cursor: "pointer", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", background: filter === f ? "var(--color-grey-900)" : "var(--color-surface)", color: filter === f ? "#fff" : "var(--color-ink-2)" }}>
                  {LABEL[f]} · {counts[f] ?? 0}
                </button>
              ))}
            </div>
            <div style={{ padding: 10, overflowY: "auto" }} data-lenis-prevent>
              {!best && <div style={{ padding: 28, textAlign: "center", color: "var(--color-ink-3)", fontSize: 14 }}>No results for “{q}”. Try “docker”, “kubernetes” or “interview”.</div>}
              {best && (<>{head("Best match")}{row(best, 0, true)}</>)}
              {rest.length > 0 && (<>{head(filter === "All" ? "More results" : LABEL[filter])}{rest.map((i, k) => row(i, k + 1))}</>)}
              {head("Quick actions")}
              <div style={{ display: "flex", gap: 8, padding: "4px 10px 10px", flexWrap: "wrap" }}>
                {[["›_", "Open a blank K8s playground", "/app/lab"], ["Q&A", "Kubernetes mock interview", "/app/practice"]].map(([ic, t, h]) => (
                  <button key={t} onClick={() => { onClose(); router.push(h); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid var(--color-line)", borderRadius: 6, background: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "var(--color-ink)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink-3)" }}>{ic}</span>{t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, height: 44, padding: "0 20px", background: "var(--color-white-100)", borderTop: "1px solid var(--color-line)", fontSize: 12, color: "var(--color-ink-3)", flexShrink: 0 }}>
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
