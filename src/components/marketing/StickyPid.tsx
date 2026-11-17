"use client";
import { useEffect } from "react";
import { stickyIn } from "@/components/motion/stickyIn";

/** Makes design layers (by Paper id) stick to the top while their parent section scrolls. */
export default function StickyPid({ pid, top = 88 }: { pid: string | string[]; top?: number }) {
  const key = ([] as string[]).concat(pid).join(",");
  useEffect(() => {
    const undo = key.split(",").map((p) => {
      const el = document.querySelector<HTMLElement>(`[data-pid="${p}"]`);
      return el?.parentElement ? stickyIn(el, el.parentElement, top) : () => {};
    });
    return () => undo.forEach((u) => u());
  }, [key, top]);
  return null;
}
