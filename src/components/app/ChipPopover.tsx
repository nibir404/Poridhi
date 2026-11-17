"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { seed } from "@/data/seed";
import { getWallet, openRedeem } from "@/data/wallet";

export type Chip = "bank" | "streak";

const fmt = (min: number) => `${Math.floor(Math.abs(min) / 60) ? `${Math.floor(Math.abs(min) / 60)}h ` : ""}${Math.abs(min) % 60}m`;
const I = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
const HOURGLASS = "M7 3h10M7 21h10M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l2.4-2.3A4 4 0 0 0 16 6.5V3M8 21v-3.5a4 4 0 0 1 1.6-3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21";
const FLAME = "M12 21a6 6 0 0 0 6-6c0-4-3-5.5-3.5-9-2 1.5-3 3.5-3 5.5-1-.5-1.8-1.5-2-2.8C7.6 10.4 6 12.4 6 15a6 6 0 0 0 6 6z";

/** Time bank and streak flows, opened from the app-bar chips. */
export default function ChipPopover({ chip, anchor, onClose }: { chip: Chip | null; anchor: DOMRect | null; onClose: () => void }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chip) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const click = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) onClose(); };
    window.addEventListener("keydown", key);
    const t = setTimeout(() => window.addEventListener("click", click), 0);
    return () => { clearTimeout(t); window.removeEventListener("keydown", key); window.removeEventListener("click", click); };
  }, [chip, onClose]);
  const go = (h: string) => { onClose(); router.push(h); };

  const head = (t: string) => <div style={{ font: "500 11px/14px var(--font-sans)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-ink-3)", margin: "16px 0 8px" }}>{t}</div>;
  const btn = (primary: boolean): React.CSSProperties => ({ flex: 1, height: 40, borderRadius: 6, border: primary ? 0 : "1px solid var(--color-line)", background: primary ? "var(--dashboard-accent)" : "transparent", color: primary ? "var(--dashboard-accent-ink)" : "var(--color-ink)", font: `${primary ? 600 : 400} 14px/18px var(--font-sans)`, cursor: "pointer" });
  const minutes = getWallet().minutes;

  return (
    <AnimatePresence>
      {chip && anchor && (
        <motion.div ref={box} role="dialog" aria-label={chip === "bank" ? "Time bank" : "Streak"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }}
          style={{ position: "fixed", top: anchor.bottom + 8, left: Math.min(anchor.left, window.innerWidth - 376), zIndex: 160, width: 360, padding: 18, background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-line)", borderRadius: 12, boxShadow: "0 24px 48px -24px rgba(0,0,0,.45)", fontFamily: "var(--font-sans)" }}>
          {chip === "bank" ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 6, display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--dashboard-warning) 16%, var(--color-bg))", color: "var(--dashboard-warning)" }}><I d={HOURGLASS} size={20} /></span>
                <div>
                  <div style={{ font: "400 12px/16px var(--font-sans)", color: "var(--color-ink-3)" }}>Time bank</div>
                  <div style={{ font: "600 24px/28px var(--font-sans)" }}>{fmt(minutes)}</div>
                </div>
              </div>
              <p style={{ margin: "12px 0 0", font: "400 13px/19px var(--font-sans)", color: "var(--color-ink-2)" }}>{seed.bank.rule}</p>
              {head("How you earn time")}
              <div style={{ display: "grid", gap: 6 }}>
                {seed.bank.earn.map((e) => (
                  <div key={e.what} style={{ display: "flex", justifyContent: "space-between", font: "400 13px/18px var(--font-sans)" }}><span>{e.what}</span><span style={{ color: "var(--dashboard-success)", fontWeight: 600 }}>{e.gives}</span></div>
                ))}
              </div>
              {head("Recent")}
              <div style={{ display: "grid", gap: 6 }}>
                {[...getWallet().history, ...seed.bank.activity].slice(0, 4).map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, font: "400 13px/18px var(--font-sans)" }}>
                    <span style={{ color: "var(--color-ink-3)", width: 78, flexShrink: 0 }}>{a.when}</span>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.what}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: a.delta > 0 ? "var(--dashboard-success)" : "var(--color-ink)" }}>{a.delta > 0 ? "+" : "−"}{fmt(a.delta)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button style={btn(false)} onClick={() => go("/app/me/time-bank")}>Open time bank</button>
                <button style={btn(true)} onClick={() => { onClose(); openRedeem(); }}>Redeem coins</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 6, display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--dashboard-warning) 16%, var(--color-bg))", color: "var(--dashboard-warning)" }}><I d={FLAME} size={20} /></span>
                <div>
                  <div style={{ font: "400 12px/16px var(--font-sans)", color: "var(--color-ink-3)" }}>Current streak · best {seed.streak.best} days</div>
                  <div style={{ font: "600 24px/28px var(--font-sans)" }}>{seed.streakDays} days</div>
                </div>
              </div>
              {head("This week")}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {seed.streak.week.map((d) => (
                  <div key={d.d} style={{ display: "grid", justifyItems: "center", gap: 6 }}>
                    <span aria-label={`${d.d}: ${d.done ? "done" : d.today ? "today, not yet" : "missed"}`} style={{ width: 30, height: 30, borderRadius: 999, display: "grid", placeItems: "center", background: d.done ? "var(--dashboard-warning)" : "transparent", border: d.done ? 0 : `2px ${d.today ? "dashed" : "solid"} var(--color-line)`, color: d.done ? "var(--color-bg)" : "var(--color-ink-3)" }}>
                      {d.done ? <I d={FLAME} size={14} /> : null}
                    </span>
                    <span style={{ font: "400 11px/14px var(--font-sans)", color: d.today ? "var(--color-ink)" : "var(--color-ink-3)", fontWeight: d.today ? 600 : 400 }}>{d.d}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: "14px 0 0", font: "400 13px/19px var(--font-sans)", color: "var(--color-ink-2)" }}>{seed.streak.today}</p>
              <div style={{ marginTop: 12, padding: 12, borderRadius: 6, background: "var(--color-surface)", display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 13px/18px var(--font-sans)" }}><span>Next reward at {seed.streak.next.at} days</span><span style={{ fontWeight: 600, color: "var(--dashboard-success)" }}>{seed.streak.next.reward}</span></div>
                <div role="progressbar" aria-valuenow={seed.streakDays} aria-valuemax={seed.streak.next.at} style={{ height: 5, borderRadius: 999, background: "var(--color-line)", overflow: "hidden" }}><div style={{ width: `${(seed.streakDays / seed.streak.next.at) * 100}%`, height: "100%", background: "var(--dashboard-warning)" }} /></div>
                <div style={{ font: "400 12px/16px var(--font-sans)", color: "var(--color-ink-3)" }}>{seed.streak.freezes} streak freeze left · used automatically if you miss a day</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button style={btn(false)} onClick={() => go("/app/me/progress")}>View progress</button>
                <button style={btn(true)} onClick={() => go("/app/lab")}>Keep it going</button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
