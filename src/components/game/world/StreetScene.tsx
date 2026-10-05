import { memo } from "react";
import { lightFor } from "@/components/game/DayNightLighting";
import type { Destination, Weather } from "@/game/destinations";

/** Lightweight SVG/CSS Abuja street: parallax buildings, road, cars, pedestrians, signage, weather. Used for travel and arrival scenes. */
export const StreetScene = memo(function StreetScene({ dest, hour, weather, moving, crowd = 60 }: { dest: Destination; hour: number; weather: Weather; moving: boolean; crowd?: number }) {
  const L = lightFor(hour);
  const night = L.phase === "night" || L.phase === "dusk";
  const scene = dest.scene;
  const rain = weather === "rain" || weather === "heavy_rain";
  const sp = moving ? 1 : 0; // parallax runs only while travelling
  const bTone = scene === "market" ? ["oklch(0.62 0.07 60)", "oklch(0.55 0.06 40)", "oklch(0.7 0.05 85)"] : scene === "civic" ? ["oklch(0.8 0.02 90)", "oklch(0.72 0.03 85)", "oklch(0.65 0.02 80)"] : scene === "lakeside" ? ["oklch(0.7 0.04 200)", "oklch(0.78 0.03 90)", "oklch(0.6 0.05 160)"] : ["oklch(0.42 0.03 250)", "oklch(0.5 0.02 230)", "oklch(0.36 0.03 270)"];
  const buildings = Array.from({ length: 12 }, (_, i) => ({ x: i * 70, w: 50 + ((i * 37) % 25), h: 70 + ((i * 53) % 90), c: bTone[i % 3]! }));
  const neon = ["oklch(0.72 0.25 350)", "oklch(0.8 0.18 200)", "oklch(0.85 0.17 90)", "oklch(0.7 0.22 300)"];
  const walkers = Math.max(2, Math.round(crowd / 14));
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(180deg, ${L.sky[0]}, ${L.sky[1]})` }}>
      {/* sun / moon */}
      <div className="absolute right-[14%] top-[8%] size-10 rounded-full" style={{ background: night ? "oklch(0.95 0.02 90)" : "oklch(0.95 0.12 90)", boxShadow: `0 0 40px ${night ? "oklch(0.9 0.03 250/.6)" : "oklch(0.95 0.15 90/.8)"}` }} />
      {weather === "harmattan" && <div className="absolute inset-0 bg-[oklch(0.85_0.05_70/.35)]" />}
      {/* far skyline (Aso Rock silhouette for civic/upscale) */}
      <svg className="absolute bottom-[38%] h-[22%] w-[200%]" viewBox="0 0 1600 100" preserveAspectRatio="none" style={{ animation: `scroll-x ${40}s linear infinite`, animationPlayState: sp ? "running" : "paused" }}>
        {[0, 800].map((o) => <path key={o} transform={`translate(${o} 0)`} d={scene === "civic" || scene === "upscale" ? "M0 100 L0 70 L120 60 L200 20 L260 10 L330 30 L380 55 L520 65 L600 40 L700 60 L800 70 L800 100Z" : "M0 100 L0 60 L60 60 L60 40 L110 40 L110 55 L190 55 L190 25 L230 25 L230 50 L330 50 L330 35 L400 35 L400 60 L520 60 L520 30 L560 30 L560 55 L680 55 L680 45 L800 45 L800 100Z"} fill={night ? "oklch(0.22 0.04 260)" : "oklch(0.55 0.04 200 / .6)"} />)}
      </svg>
      {/* near buildings */}
      <div className="absolute bottom-[30%] h-[40%] w-[200%]" style={{ animation: "scroll-x 14s linear infinite", animationPlayState: sp ? "running" : "paused" }}>
        <svg className="h-full w-full" viewBox="0 0 1680 200" preserveAspectRatio="none">
          {[0, 840].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              {buildings.map((b, i) => (
                <g key={i}>
                  <rect x={b.x} y={200 - b.h} width={b.w} height={b.h} fill={b.c} />
                  {Array.from({ length: Math.floor(b.h / 22) }, (_, r) => [0, 1, 2].map((c) => <rect key={`${r}-${c}`} x={b.x + 7 + c * 14} y={200 - b.h + 8 + r * 22} width="8" height="10" fill={night ? ((r + c + i) % 3 ? "oklch(0.88 0.13 85)" : "oklch(0.3 0.03 250)") : "oklch(0.8 0.04 220 / .7)"} />))}
                  {night && (scene === "nightlife" ? i % 2 === 0 : i % 4 === 0) && <rect x={b.x + 4} y={200 - b.h - 10} width={b.w - 8} height="8" rx="2" fill={neon[i % 4]} className="animate-[glow-pulse_2s_ease-in-out_infinite]" style={{ filter: `drop-shadow(0 0 6px ${neon[i % 4]})` }} />}
                  {scene === "civic" && i === 5 && <g><path d={`M${b.x + b.w / 2 - 20} ${200 - b.h} q20 -34 40 0z`} fill="oklch(0.78 0.12 85)" /><rect x={b.x - 6} y={200 - b.h - 40} width="5" height="40" fill="oklch(0.85 0.02 90)" /><rect x={b.x + b.w + 1} y={200 - b.h - 40} width="5" height="40" fill="oklch(0.85 0.02 90)" /></g>}
                  {scene === "market" && <path d={`M${b.x} ${200 - 28} l${b.w} 0 l-6 10 l-${b.w - 12} 0z`} fill={i % 2 ? "oklch(0.6 0.18 25)" : "oklch(0.6 0.14 150)"} />}
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {/* trees & poles */}
      <div className="absolute bottom-[28%] h-[16%] w-[200%]" style={{ animation: "scroll-x 7s linear infinite", animationPlayState: sp ? "running" : "paused" }}>
        <svg className="h-full w-full" viewBox="0 0 1600 80" preserveAspectRatio="none">
          {Array.from({ length: 16 }, (_, i) => i % 3 === 0
            ? <g key={i}><rect x={i * 100 + 30} y="10" width="3" height="70" fill="oklch(0.3 0.02 60)" />{night && <circle cx={i * 100 + 31} cy="10" r="8" fill="oklch(0.9 0.14 85 / .8)" />}</g>
            : <g key={i}><rect x={i * 100 + 48} y="45" width="5" height="35" fill="oklch(0.35 0.05 60)" /><circle cx={i * 100 + 50} cy="38" r="18" fill={scene === "lakeside" ? "oklch(0.5 0.12 150)" : "oklch(0.42 0.1 145)"} /></g>)}
        </svg>
      </div>
      {/* sidewalk + road */}
      <div className="absolute inset-x-0 bottom-[22%] h-[7%] bg-[oklch(0.62_0.02_80)]" />
      <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background: rain ? "linear-gradient(180deg, oklch(0.3 0.02 250), oklch(0.22 0.02 250))" : "oklch(0.3 0.01 250)" }}>
        <div className="absolute inset-x-0 top-1/2 h-1 w-[200%] -translate-y-1/2" style={{ backgroundImage: "repeating-linear-gradient(90deg, oklch(0.92 0.12 90) 0 30px, transparent 30px 60px)", animation: "scroll-x 1.2s linear infinite", animationPlayState: sp ? "running" : "paused" }} />
        {scene === "lakeside" && <div className="absolute -top-[4%] right-0 h-2 w-1/2 bg-[oklch(0.6_0.1_220)]" />}
      </div>
      {/* pedestrians on sidewalk */}
      {Array.from({ length: walkers }, (_, i) => (
        <span key={i} className="absolute bottom-[23%] block" style={{ left: `${(i * 37) % 100}%`, animation: `walk-x ${10 + (i % 4) * 3}s linear ${-i * 2}s infinite`, animationDirection: i % 2 ? "reverse" : "normal" }}>
          <svg width="10" height="22" viewBox="0 0 10 22">
            <circle cx="5" cy="3" r="2.6" fill="oklch(0.42 0.07 50)" />
            <rect x="2" y="6" width="6" height="9" rx="2" fill={neon[(i + 1) % 4]!.replace("0.25", "0.12").replace("0.22", "0.12")} />
            <rect x="2.5" y="14" width="2" height="7" fill="oklch(0.25 0.02 250)" className="origin-top animate-[pc-leg_.6s_ease-in-out_infinite]" />
            <rect x="5.5" y="14" width="2" height="7" fill="oklch(0.25 0.02 250)" className="origin-top animate-[pc-leg_.6s_ease-in-out_infinite_reverse]" />
            {rain && <path d="M0 4 q5 -7 10 0z" fill="oklch(0.55 0.18 25)" />}
          </svg>
        </span>
      ))}
      {/* passing cars (opposite lane) */}
      {Array.from({ length: night && scene === "nightlife" ? 4 : 2 }, (_, i) => (
        <span key={i} className="absolute bottom-[13%] block" style={{ animation: `car-pass ${moving ? 2.2 + i : 6 + i * 2}s linear ${-i * 1.3}s infinite` }}>
          <svg width="54" height="22" viewBox="0 0 54 22">
            <path d="M4 14 q2 -8 12 -9 l18 0 q8 1 14 9 l2 4 l-48 0z" fill={["oklch(0.25 0.01 250)", "oklch(0.85 0.17 90)", "oklch(0.92 0.01 250)", "oklch(0.5 0.15 25)"][i % 4]} />
            <rect x="15" y="7" width="22" height="6" rx="1.5" fill="oklch(0.7 0.05 230 / .8)" />
            <circle cx="14" cy="18" r="3.5" fill="oklch(0.15 0 0)" /><circle cx="40" cy="18" r="3.5" fill="oklch(0.15 0 0)" />
            {night && <rect x="0" y="13" width="5" height="2" fill="oklch(0.95 0.1 90)" />}
          </svg>
        </span>
      ))}
      {night && <div className="pointer-events-none absolute inset-0" style={{ background: L.tint, opacity: L.tintOpacity * 0.8, mixBlendMode: "multiply" }} />}
      {rain && <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "repeating-linear-gradient(105deg, transparent 0 9px, oklch(0.9 0.02 240 / .55) 9px 10px)", backgroundSize: "40px 40px", animation: `rain-fall ${weather === "heavy_rain" ? 0.25 : 0.45}s linear infinite` }} />}
    </div>
  );
});
