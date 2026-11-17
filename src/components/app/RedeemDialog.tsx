"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getWallet, redeem, RATE, fmtBank } from "@/data/wallet";

/** Redeem coins for lab time: pick an amount, confirm, see the new balance. Opened by any "Redeem" action. */
export default function RedeemDialog() {
  const [open, setOpen] = useState(false);
  const [w, setW] = useState(getWallet);
  const [amount, setAmount] = useState(1000);
  const [done, setDone] = useState<null | { coins: number; minutes: number }>(null);

  useEffect(() => {
    const o = () => { setW(getWallet()); setDone(null); setAmount(Math.min(1000, Math.floor(getWallet().coins / 500) * 500)); setOpen(true); };
    window.addEventListener("pd-redeem", o);
    if (window.location.hash === "#redeem") o();
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("pd-redeem", o); window.removeEventListener("keydown", k); };
  }, []);

  const max = Math.floor(w.coins / 500) * 500;
  const gain = (amount / RATE.coins) * RATE.minutes;
  const step = (d: number) => setAmount((a) => Math.min(max, Math.max(500, a + d)));
  const confirm = () => { const n = redeem(amount); setDone({ coins: amount, minutes: gain }); setW(n); };
  const btn = (primary: boolean, disabled = false): React.CSSProperties => ({ flex: 1, height: 40, borderRadius: 6, border: primary ? 0 : "1px solid var(--color-line)", background: disabled ? "var(--color-surface)" : primary ? "var(--dashboard-accent)" : "transparent", color: disabled ? "var(--color-ink-3)" : primary ? "var(--dashboard-accent-ink)" : "var(--color-ink)", font: `${primary ? 600 : 400} 14px/18px var(--font-sans)`, cursor: disabled ? "not-allowed" : "pointer" });

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="redeem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(14,14,14,.55)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", padding: 16, fontFamily: "var(--font-sans)" }}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="redeem-title" initial={{ y: 12, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 8, scale: 0.98 }} onClick={(e) => e.stopPropagation()}
            style={{ width: "min(420px, 100%)", padding: 24, borderRadius: 12, background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-line)", boxShadow: "0 40px 80px -32px rgba(0,0,0,.5)" }}>
            {!done ? (
              <>
                <h2 id="redeem-title" style={{ margin: 0, font: "600 20px/26px var(--font-sans)" }}>Redeem coins for lab time</h2>
                <p style={{ margin: "6px 0 0", font: "400 14px/20px var(--font-sans)", color: "var(--color-ink-2)" }}>1,000 coins = 2 h of VM time. Time only counts while a lab is running.</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, font: "400 13px/18px var(--font-sans)", color: "var(--color-ink-3)" }}>
                  <span>You have {w.coins.toLocaleString()} coins</span><span>Bank {fmtBank(w.minutes)}</span>
                </div>
                {max < 500 ? (
                  <p style={{ marginTop: 16, padding: 14, borderRadius: 6, background: "var(--color-surface)", font: "400 14px/20px var(--font-sans)" }}>You need at least 500 coins. Finish labs and modules to earn more.</p>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                      <button aria-label="Fewer coins" onClick={() => step(-500)} style={{ width: 40, height: 40, borderRadius: 6, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink)", fontSize: 18, cursor: "pointer" }}>−</button>
                      <div style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 6, background: "var(--color-surface)" }}>
                        <div style={{ font: "600 22px/28px var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>{amount.toLocaleString()} coins</div>
                        <div style={{ font: "400 13px/18px var(--font-sans)", color: "var(--dashboard-success)" }}>+{fmtBank(gain)} lab time</div>
                      </div>
                      <button aria-label="More coins" onClick={() => step(500)} style={{ width: 40, height: 40, borderRadius: 6, border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-ink)", fontSize: 18, cursor: "pointer" }}>+</button>
                    </div>
                    <input type="range" min={500} max={max} step={500} value={amount} onChange={(e) => setAmount(+e.target.value)} aria-label="Coins to redeem" style={{ width: "100%", marginTop: 14, accentColor: "var(--dashboard-accent)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, font: "400 13px/18px var(--font-sans)" }}>
                      <span style={{ color: "var(--color-ink-3)" }}>After redeeming</span>
                      <span>{(w.coins - amount).toLocaleString()} coins · {fmtBank(w.minutes + gain)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button style={btn(false)} onClick={() => setOpen(false)}>Cancel</button>
                  <button style={btn(true, max < 500)} disabled={max < 500} onClick={confirm}>Redeem {max >= 500 ? amount.toLocaleString() : ""}</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center", background: "var(--dashboard-success)", color: "var(--color-bg)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 12l4 4 8-8" /></svg>
                </div>
                <h2 id="redeem-title" style={{ margin: "14px 0 0", font: "600 20px/26px var(--font-sans)" }}>+{fmtBank(done.minutes)} added to your bank</h2>
                <p style={{ margin: "6px 0 0", font: "400 14px/20px var(--font-sans)", color: "var(--color-ink-2)" }}>You now have {w.coins.toLocaleString()} coins and {fmtBank(w.minutes)} of lab time.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button style={btn(false)} onClick={() => setOpen(false)}>Done</button>
                  <button style={btn(true)} onClick={() => { setOpen(false); window.location.assign("/app/lab/launch"); }}>Launch a lab</button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
