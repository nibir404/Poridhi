"use client";
import { useEffect, useState } from "react";
import { track, type Status } from "./roadmap";

/**
 * Manual completion. Learners can mark any unlocked item done (or undo it). Overrides persist in
 * localStorage and are applied onto the seed `track` in place, so every count, dot and percentage
 * derived from it follows automatically. A module whose items are all done becomes done.
 */
const KEY = "pd-progress";
const EV = "pd-progress";
type Over = Record<string, "done" | "todo">;
const orig = new Map<object, Status>();

const read = (): Over => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
export const itemKey = (modSlug: string, idx: number) => `${modSlug}:${idx}`;

export function applyProgress() {
  if (typeof window === "undefined") return;
  const o = read();
  track.milestones.forEach((ms) => ms.modules.forEach((m) => {
    if (!orig.has(m)) orig.set(m, m.status);
    m.items.forEach((it, i) => {
      if (!orig.has(it)) orig.set(it, it.status);
      const base = orig.get(it)!;
      const v = o[itemKey(m.slug, i)];
      it.status = v === "done" ? "done" : v === "todo" && base === "done" ? "todo" : base;
    });
    const base = orig.get(m)!;
    m.status = m.items.every((it) => it.status === "done") ? "done" : base === "done" ? "current" : base;
  }));
}

export function setItemDone(modSlug: string, idx: number, done: boolean) {
  const o = read();
  o[itemKey(modSlug, idx)] = done ? "done" : "todo";
  localStorage.setItem(KEY, JSON.stringify(o));
  applyProgress();
  window.dispatchEvent(new Event(EV));
}

/** Generic completion for content outside the roadmap data (e.g. a class screen). */
export const isDone = (key: string) => typeof window !== "undefined" && read()[key] === "done";
export function setDone(key: string, done: boolean) {
  const o = read(); o[key] = done ? "done" : "todo";
  localStorage.setItem(KEY, JSON.stringify(o)); window.dispatchEvent(new Event(EV));
}

/** Re-render on any progress change; returns a version number. */
export function useProgress() {
  const [v, setV] = useState(0);
  useEffect(() => {
    applyProgress(); setV((x) => x + 1);
    const f = () => setV((x) => x + 1);
    window.addEventListener(EV, f); window.addEventListener("storage", () => { applyProgress(); f(); });
    return () => window.removeEventListener(EV, f);
  }, []);
  return v;
}
