"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { catalog, exploreLinks, topics } from "@/data/catalog";
import { ItemIcon } from "@/data/itemIcon";

/** Explore mega menu (design O01): sections · topics · items for the hovered topic · featured lab. */
export default function ExploreMenu({ open, onClose, top = 72 }: { open: boolean; onClose: () => void; top?: number }) {
  const router = useRouter();
  const [topic, setTopic] = useState(topics[0]);
  const go = (href: string) => { onClose(); router.push(href); };
  const items = catalog.filter((i) => i.topic === topic).slice(0, 6);

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: "fixed", inset: 0, top, zIndex: 150, background: "rgba(14,14,14,.18)", fontFamily: "var(--font-sans)" }}>
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onClick={(e) => e.stopPropagation()} onMouseLeave={onClose}
            style={{ margin: "12px auto 0", width: "min(1360px, calc(100% - 32px))", display: "flex", background: "var(--color-bg)", border: "1px solid var(--color-line)", borderRadius: 6, boxShadow: "0 32px 64px -32px rgba(14,14,14,.25)", overflow: "hidden", maxHeight: "calc(100vh - 110px)" }}>
            {/* Sections */}
            <div className="pd-explore-col" style={{ width: 300, flexShrink: 0, background: "linear-gradient(170deg,#1E2144,#282B5A)", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "url(/assets/dither-card.svg) right top/480px 280px no-repeat", opacity: 0.12, pointerEvents: "none" }} />
              {Object.entries(exploreLinks).map(([sec, links], si) => (
                <div key={sec} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 4, paddingTop: si ? 16 : 0, borderTop: si ? "1px solid rgba(255,255,255,.1)" : 0 }}>
                  <div style={{ padding: "0 12px 6px", fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-blue-300)" }}>{sec}</div>
                  {links.map((l) => (
                    <button key={l.label} onClick={() => go(l.href)} className="pd-explore-link"
                      style={{ display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 12px", border: 0, borderRadius: 6, background: "transparent", color: "var(--color-blue-100)", fontSize: 15, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                      {l.label}
                      {"isNew" in l && l.isNew && <span style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>New</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            {/* Topics */}
            <div className="pd-explore-col" style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--color-line)", padding: "28px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ padding: "0 12px 10px", fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-ink-3)" }}>Topics</div>
              {topics.map((t) => (
                <button key={t} onMouseEnter={() => setTopic(t)} onFocus={() => setTopic(t)} onClick={() => go("/courses")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 44, padding: "0 12px", border: 0, borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 15, textAlign: "left", background: topic === t ? "var(--color-surface)" : "transparent", color: topic === t ? "var(--color-ink)" : "var(--color-ink-2)", fontWeight: topic === t ? 500 : 400 }}>
                  {t}
                  {topic === t && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>}
                </button>
              ))}
              <button onClick={() => go("/courses")} style={{ marginTop: "auto", height: 44, padding: "0 12px", border: 0, borderTop: "1px solid var(--color-line)", background: "transparent", textAlign: "left", color: "var(--color-accent-text)", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Browse all topics →</button>
            </div>
            {/* Items for topic + featured */}
            <div style={{ flex: 1, display: "flex", gap: 28, padding: 28, minWidth: 0 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-ink-3)" }}>{topic}</span>
                  <button onClick={() => go("/labs")} style={{ border: 0, background: "none", color: "var(--color-accent-text)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={topic} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                    {items.map((i) => (
                      <div key={i.title} onClick={() => go(i.href)} className="pd-explore-item"
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, borderRadius: 6, cursor: "pointer" }}>
                        <ItemIcon item={i} size={40} />
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 15, fontWeight: 600, lineHeight: "18px", color: "var(--color-ink)" }}>
                            {i.title}
                            {i.kind === "Track" && <span style={{ background: "var(--color-blue-50)", color: "var(--color-blue-700)", fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4 }}>Career track</span>}
                            {i.pro && <span style={{ background: "var(--color-grey-900)", color: "var(--color-bg)", fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 4 }}>Pro</span>}
                            {i.isNew && <span style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4 }}>New</span>}
                          </div>
                          <div style={{ fontSize: 13, lineHeight: "16px", color: "var(--color-ink-3)" }}>{i.meta}</div>
                        </div>
                      </div>
                    ))}
                    {!items.length && <div style={{ padding: 12, color: "var(--color-ink-3)", fontSize: 14 }}>New labs for {topic} are coming soon.</div>}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="pd-explore-col" style={{ width: 260, flexShrink: 0, background: "#0E0E0E", borderRadius: 6, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "url(/assets/dither-card.svg) right top/480px 280px no-repeat", opacity: 0.14 }} />
                <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-ember)" }}>Free this week</span>
                  <span style={{ fontSize: 22, fontWeight: 600, lineHeight: "27px", letterSpacing: "-.015em", color: "#fff" }}>Build a VXLAN overlay between two hosts</span>
                  <span style={{ fontSize: 14, lineHeight: "21px", color: "#A5A5A5" }}>5 labs · ~100 min · no Time Bank needed until Sunday</span>
                </div>
                <div style={{ position: "relative", background: "#1A1A1A", borderRadius: 6, padding: 14, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: "19px", color: "#A5A5A5" }}>
                  <div><span style={{ color: "#22B866" }}>$</span> ip link add vxlan0 type vxlan id 42</div>
                  <div><span style={{ color: "#22B866" }}>$</span> ping 10.0.0.2</div>
                  <div style={{ color: "#fff" }}>64 bytes from 10.0.0.2</div>
                </div>
                <button onClick={() => go("/signin")} style={{ position: "relative", height: 40, border: 0, borderRadius: 6, background: "var(--color-accent)", color: "var(--color-on-accent)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Start lab</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
