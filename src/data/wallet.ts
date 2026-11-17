import { seed } from "./seed";

/** Coins and time-bank minutes for the seeded student, kept in localStorage so redeeming sticks across pages. */
export type Wallet = { coins: number; minutes: number; history: { when: string; what: string; delta: number }[] };
const KEY = "pd-wallet";
export const RATE = { coins: 1000, minutes: 120 }; // 1,000 coins = 2 h

export function getWallet(): Wallet {
  if (typeof window !== "undefined") {
    try { const w = JSON.parse(localStorage.getItem(KEY) ?? "null"); if (w && typeof w.coins === "number") return w; } catch {}
  }
  return { coins: seed.coins, minutes: seed.timeBank.minutes, history: [] };
}
export function redeem(coins: number): Wallet {
  const w = getWallet();
  if (coins <= 0 || coins > w.coins || coins % 500) return w;
  const minutes = (coins / RATE.coins) * RATE.minutes;
  const next: Wallet = { coins: w.coins - coins, minutes: w.minutes + minutes, history: [{ when: "Just now", what: `Redeemed ${coins.toLocaleString()} coins`, delta: minutes }, ...w.history] };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("pd-wallet", { detail: next }));
  return next;
}
export const fmtMinutes = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`.replace(/^0h /, "");
export const fmtBank = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
export const openRedeem = () => window.dispatchEvent(new Event("pd-redeem"));
