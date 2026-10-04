import { useEffect, useRef, useState } from "react";

/** Smoothly tweens a number toward its target with rAF; jumps instantly for reduced-motion users. */
export function useAnimatedNumber(value: number, ms = 650) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    if (reduce || start === value) { from.current = value; setShown(value); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 3);
      const v = start + (value - start) * e;
      from.current = v; setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

/** Returns the last change in value (for "+12" flashes) and a key that changes each time. */
export function useDelta(value: number) {
  const prev = useRef(value);
  const [d, setD] = useState<{ v: number; k: number } | null>(null);
  useEffect(() => {
    const diff = Math.round(value - prev.current);
    prev.current = value;
    if (diff !== 0) setD({ v: diff, k: Date.now() });
  }, [value]);
  return d;
}
