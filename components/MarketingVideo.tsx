"use client";
import { useEffect, useState } from "react";
export default function MarketingVideo({ src, poster, className, label = "BDFX introduction" }: { src: string; poster: string; className?: string; label?: string }) {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlay(!preference.matches && !connection?.saveData);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return <video src={play ? src : undefined} poster={poster} className={className} autoPlay={play} muted loop playsInline preload="none" aria-label={label} />;
}
