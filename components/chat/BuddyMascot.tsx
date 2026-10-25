"use client";
import { useEffect, useRef } from "react";
import styles from "./BuddyMascot.module.css";

export default function BuddyMascot({ concerned = false }: { concerned?: boolean }) {
  const face = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0, x = 0, y = 0;
    const look = () => {
      frame = 0;
      const node = face.current;
      if (!node) return;
      const bounds = node.getBoundingClientRect();
      node.style.setProperty("--look-x", Math.max(-3, Math.min(3, (x - bounds.left - bounds.width / 2) / 90)) + "px");
      node.style.setProperty("--look-y", Math.max(-2, Math.min(2, (y - bounds.top - bounds.height / 2) / 100)) + "px");
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX; y = event.clientY;
      if (!frame) frame = requestAnimationFrame(look);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(frame); };
  }, []);
  return <span ref={face} className={styles.mascot} data-concerned={concerned} aria-hidden="true">
    <span className={styles.antenna} />
    <span className={styles.head}><span className={styles.visor}><span className={styles.eye} /><span className={styles.eye} /><span className={styles.smile} /></span></span>
    <span className={styles.body}>BDFX</span><span className={styles.shadow} />
  </span>;
}
