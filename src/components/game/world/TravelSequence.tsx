import { useEffect, useRef, useState } from "react";
import { StreetScene } from "./StreetScene";
import type { Destination, Weather } from "@/game/destinations";
import { PlayerCharacter, type Look } from "@/components/game/PlayerCharacter";
import { Button } from "@/components/ui/button";

/** Travel cinematic: destination card → moving street → dialogue → arrival. Skippable at any stage. */
export function TravelSequence({ from, dest, hour, weather, modeName, look, onDone }: { from: string; dest: Destination; hour: number; weather: Weather; modeName: string; look: Look; onDone: () => void }) {
  const [t, setT] = useState(0); // 0..1
  const [arriving, setArriving] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const DUR = 7000;
  useEffect(() => {
    if (arriving) { const id = setTimeout(() => doneRef.current(), 1400); return () => clearTimeout(id); }
    const start = performance.now(); let raf = 0;
    const tick = (n: number) => { const v = Math.min(1, (n - start) / DUR); setT(v); if (v >= 1) setArriving(true); else raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [arriving]);
  const line = dest.travelLines[Math.min(dest.travelLines.length - 1, Math.floor(t * dest.travelLines.length))];
  const walking = modeName === "Walk";
  return (
    <div className="fixed inset-0 z-[60] bg-surface text-surface-foreground" role="dialog" aria-label={`Travelling to ${dest.name}`}>
      <StreetScene dest={dest} hour={hour} weather={weather} moving={!arriving} crowd={70} />
      {/* Abuja ride or the player's own avatar, depending on the chosen travel mode. */}
      {walking ? <div className="absolute bottom-[8%] left-[30%] h-44 w-24 animate-[travel-bounce_.65s_ease-in-out_infinite]"><svg viewBox="-17 -84 34 84" className="h-full w-full overflow-visible"><PlayerCharacter look={look} pose="walk" /></svg></div> : <div className="absolute bottom-[7%] left-[14%] animate-[travel-bounce_.5s_ease-in-out_infinite]"><svg width="146" height="72" viewBox="0 0 146 72" aria-label="Abuja shared taxi"><path d="M7 48q7-24 30-27h58q20 3 37 27l3 12H5z" fill="var(--gold)" stroke="var(--foreground)" strokeOpacity=".4" strokeWidth="3"/><path d="M42 25h49l15 18H31z" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2"/><path d="M12 48h122v8H12z" fill="var(--success)"/><circle cx="34" cy="58" r="10" fill="var(--background)" stroke="var(--muted-foreground)" strokeWidth="4"/><circle cx="111" cy="58" r="10" fill="var(--background)" stroke="var(--muted-foreground)" strokeWidth="4"/><path d="M135 45h9v7h-9z" fill="var(--gold)"/></svg></div>}
      <div className="absolute inset-x-4 top-[max(env(safe-area-inset-top),1rem)] mx-auto max-w-md rounded-2xl bg-[oklch(0_0_0/.55)] p-4 text-[oklch(0.97_0.01_90)] backdrop-blur animate-rise">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">{walking ? "Trekking to" : `${modeName} to`} · Abuja</p>
        <h2 className="text-2xl font-semibold">{dest.name}</h2>
        <p className="text-xs opacity-70">{from} → {dest.signage[0] ?? dest.name} · {dest.name}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[oklch(1_0_0/.2)]"><div className="h-full bg-gold-gradient" style={{ width: `${t * 100}%` }} /></div>
      </div>
      {!arriving && <p key={line} className="absolute inset-x-6 top-[42%] mx-auto max-w-sm rounded-2xl bg-[oklch(0_0_0/.5)] px-4 py-2 text-center text-sm font-semibold text-[oklch(0.97_0.01_90)] animate-rise">{line}</p>}
      {arriving && (
        <div className="absolute inset-0 grid place-items-center bg-[oklch(0_0_0/.55)] text-center text-[oklch(0.97_0.01_90)] animate-rise">
          <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Arriving at</p><h2 className="text-4xl font-semibold">{dest.name}</h2><p className="mt-1 text-sm uppercase tracking-widest opacity-80">{dest.subtitle}</p><p className="mt-3 text-sm italic opacity-80">{dest.arrivalLine}</p></div>
        </div>
      )}
      {!arriving && <Button onClick={() => setArriving(true)} className="absolute bottom-[max(env(safe-area-inset-bottom),1.25rem)] right-4 rounded-full border border-surface-foreground/20 bg-surface/85 px-6 py-5 text-sm font-bold text-surface-foreground shadow-lg backdrop-blur active:scale-95">Skip travel ›</Button>}
    </div>
  );
}
