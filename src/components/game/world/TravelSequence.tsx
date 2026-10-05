import { useEffect, useState } from "react";
import { StreetScene } from "./StreetScene";
import type { Destination, Weather } from "@/game/destinations";

/** Travel cinematic: destination card → moving street → dialogue → arrival. Skippable at any stage. */
export function TravelSequence({ from, dest, hour, weather, modeName, onDone }: { from: string; dest: Destination; hour: number; weather: Weather; modeName: string; onDone: () => void }) {
  const [t, setT] = useState(0); // 0..1
  const [arriving, setArriving] = useState(false);
  const DUR = 7000;
  useEffect(() => {
    if (arriving) { const id = setTimeout(onDone, 1400); return () => clearTimeout(id); }
    const start = performance.now(); let raf = 0;
    const tick = (n: number) => { const v = Math.min(1, (n - start) / DUR); setT(v); if (v >= 1) setArriving(true); else raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [arriving, onDone]);
  const line = dest.travelLines[Math.min(dest.travelLines.length - 1, Math.floor(t * dest.travelLines.length))];
  return (
    <div className="fixed inset-0 z-[60] bg-surface text-surface-foreground" role="dialog" aria-label={`Travelling to ${dest.name}`}>
      <StreetScene dest={dest} hour={hour} weather={weather} moving={!arriving} crowd={70} />
      {/* player vehicle */}
      <div className="absolute bottom-[4%] left-[18%] animate-[travel-bounce_.5s_ease-in-out_infinite]">
        <svg width="96" height="40" viewBox="0 0 96 40"><path d="M6 26 q4 -14 22 -16 l34 0 q14 2 26 16 l2 6 l-86 0z" fill="oklch(0.82 0.16 85)" /><rect x="28" y="13" width="38" height="10" rx="2" fill="oklch(0.6 0.05 230)" /><circle cx="26" cy="32" r="6" fill="oklch(0.15 0 0)" /><circle cx="72" cy="32" r="6" fill="oklch(0.15 0 0)" /><rect x="88" y="24" width="6" height="3" fill="oklch(0.95 0.1 90)" /></svg>
      </div>
      <div className="absolute inset-x-4 top-[max(env(safe-area-inset-top),1rem)] mx-auto max-w-md rounded-2xl bg-[oklch(0_0_0/.55)] p-4 text-[oklch(0.97_0.01_90)] backdrop-blur animate-rise">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Travelling to · {modeName}</p>
        <h2 className="text-2xl font-semibold">{dest.name}</h2>
        <p className="text-xs opacity-70">{from} → {dest.name}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[oklch(1_0_0/.2)]"><div className="h-full bg-gold-gradient" style={{ width: `${t * 100}%` }} /></div>
      </div>
      {!arriving && <p key={line} className="absolute inset-x-6 top-[42%] mx-auto max-w-sm rounded-2xl bg-[oklch(0_0_0/.5)] px-4 py-2 text-center text-sm font-semibold text-[oklch(0.97_0.01_90)] animate-rise">{line}</p>}
      {arriving && (
        <div className="absolute inset-0 grid place-items-center bg-[oklch(0_0_0/.55)] text-center text-[oklch(0.97_0.01_90)] animate-rise">
          <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Arriving at</p><h2 className="text-4xl font-semibold">{dest.name}</h2><p className="mt-1 text-sm uppercase tracking-widest opacity-80">{dest.subtitle}</p><p className="mt-3 text-sm italic opacity-80">{dest.arrivalLine}</p></div>
        </div>
      )}
      {!arriving && <button onClick={() => setArriving(true)} className="absolute bottom-[max(env(safe-area-inset-bottom),1.25rem)] right-4 rounded-full bg-[oklch(0_0_0/.6)] px-5 py-2.5 text-sm font-bold text-[oklch(0.97_0.01_90)] backdrop-blur active:scale-95">SKIP ›</button>}
    </div>
  );
}
