import { memo, useMemo } from "react";
import { DISTRICTS, FUTURE_DISTRICTS } from "@/game/content";

export const WORLD_W = 1000, WORLD_H = 750;

// Major roads (world units). Original stylisation, loosely following Abuja's layout.
export const ROADS = [
  "M 0 705 L 185 640 L 365 610 L 485 615 L 630 590 L 720 480",
  "M 60 70 L 175 175 L 340 215 L 440 255 L 545 300 L 640 380",
  "M 175 175 L 240 285 L 255 410 L 365 610",
  "M 255 410 L 355 370 L 470 360 L 640 380 L 820 400 L 1000 470",
  "M 440 125 L 570 180 L 545 300 L 470 360 L 485 625",
  "M 570 180 L 700 250 L 820 400 L 655 480 L 630 610",
  "M 300 30 L 340 215 L 330 300 L 355 370",
  "M 240 285 L 330 300 L 440 255",
  "M 640 380 L 655 480 L 485 615",
];

function rng(seed: number) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

const CAR_COLORS = ["oklch(0.6 0.18 27)", "oklch(0.9 0.01 90)", "oklch(0.25 0.02 250)", "oklch(0.8 0.15 90)", "oklch(0.5 0.12 250)", "oklch(0.55 0.13 150)"];

function useWorld() {
  return useMemo(() => {
    const r = rng(42);
    const buildings: { x: number; y: number; w: number; h: number; roof: boolean; tone: number }[] = [];
    for (const d of DISTRICTS) {
      const count = d.density * 7;
      for (let i = 0; i < count; i++) {
        const a = r() * Math.PI * 2, dist = 10 + r() * 42;
        const tall = d.id === "cbd" ? 30 + r() * 45 : d.tier >= 4 ? 8 + r() * 10 : 8 + r() * 18 * (d.density / 3);
        buildings.push({ x: d.x + Math.cos(a) * dist * 1.3, y: d.y + Math.sin(a) * dist * 0.8, w: 7 + r() * 9, h: tall, roof: d.tier >= 3 && r() > 0.4, tone: r() });
      }
    }
    buildings.sort((a, b) => a.y - b.y);
    const trees = Array.from({ length: 260 }, () => ({ x: r() * WORLD_W, y: r() * WORLD_H, s: 3 + r() * 4 }))
      .filter((t) => DISTRICTS.every((d) => Math.hypot(d.x - t.x, d.y - t.y) > 40));
    const parkTrees = Array.from({ length: 30 }, () => ({ x: 590 + r() * 70, y: 205 + r() * 40, s: 3 + r() * 3 }));
    const peds = DISTRICTS.flatMap((d) => Array.from({ length: d.density }, (_, i) => ({ d, i, dx: (r() - 0.5) * 60, dy: (r() - 0.5) * 30, dur: 8 + r() * 10 })));
    return { buildings, trees: [...trees, ...parkTrees], peds };
  }, []);
}

export const AbujaWorld = memo(function AbujaWorld({ hour, moving }: { hour: number; moving: boolean }) {
  const w = useWorld();
  const night = hour >= 19 || hour < 6;
  const evening = hour >= 17 && hour < 19;
  const morning = hour >= 5 && hour < 9;
  const carsPerRoad = night ? 1 : hour >= 7 && hour <= 9 || hour >= 16 && hour <= 19 ? 4 : 2;

  return (
    <svg viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="land" cx="55%" cy="45%" r="75%"><stop offset="0" style={{ stopColor: "var(--map-land)" }} /><stop offset="1" style={{ stopColor: "var(--map-land-2)" }} /></radialGradient>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="1" /></pattern>
      </defs>
      <rect width={WORLD_W} height={WORLD_H} fill="url(#land)" />
      <rect width={WORLD_W} height={WORLD_H} fill="url(#grid)" />

      {/* Water: river, dam and Jabi Lake */}
      <path d="M 250 0 C 300 40, 360 20, 400 60 S 470 70, 520 0" style={{ fill: "var(--map-water)" }} opacity="0.85" />
      <path d="M 0 520 C 60 500, 100 560, 160 540 S 230 480, 200 455" fill="none" style={{ stroke: "var(--map-water)" }} strokeWidth="6" strokeLinecap="round" />
      <path d="M 195 430 C 190 405, 225 395, 250 410 C 275 425, 270 455, 245 462 C 220 470, 200 455, 195 430 Z" style={{ fill: "var(--map-water)" }} />
      <text x="232" y="438" textAnchor="middle" className="fill-surface-foreground/80 text-[8px] font-semibold italic">Jabi Lake</text>

      {/* Parks */}
      <path d="M 585 200 L 665 205 L 670 250 L 590 248 Z" style={{ fill: "var(--map-park)" }} opacity="0.85" rx="6" />
      <text x="628" y="262" textAnchor="middle" className="fill-surface/80 text-[7px] font-bold">Millennium Park</text>

      {/* Aso Rock */}
      <g>
        <path d="M 860 420 L 880 330 L 905 300 L 935 290 L 960 320 L 985 400 L 970 430 Z" style={{ fill: "var(--map-rock)" }} />
        <path d="M 880 330 L 905 300 L 935 290 L 925 340 L 900 360 Z" style={{ fill: "var(--map-rock-light)" }} />
        <path d="M 935 290 L 960 320 L 950 350 L 925 340 Z" style={{ fill: "var(--map-rock-light)" }} opacity="0.6" />
        <text x="925" y="445" textAnchor="middle" className="fill-surface/80 text-[8px] font-bold">Aso Rock area</text>
      </g>

      {/* Trees */}
      {w.trees.map((t, i) => <circle key={i} cx={t.x} cy={t.y} r={t.s} style={{ fill: "var(--map-tree)" }} opacity="0.75" />)}

      {/* Roads */}
      {ROADS.map((d, i) => <path key={i} d={d} fill="none" style={{ stroke: "var(--map-road)" }} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
      {ROADS.map((d, i) => <path key={"l" + i} d={d} fill="none" style={{ stroke: "var(--map-road-line)" }} strokeWidth="0.8" strokeDasharray="5 6" opacity={night ? 0.9 : 0.6} />)}

      {/* Buildings */}
      {w.buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y - b.h} width={b.w} height={b.h} style={{ fill: b.tone > 0.5 ? "var(--map-bldg)" : "var(--map-bldg-side)" }} />
          <path d={`M ${b.x} ${b.y - b.h} l 4 -3 h ${b.w} l -4 3 Z`} style={{ fill: b.roof ? "var(--map-bldg-roof)" : "var(--map-bldg-side)" }} />
          <path d={`M ${b.x + b.w} ${b.y - b.h} l 4 -3 v ${b.h} l -4 3 Z`} style={{ fill: "var(--map-bldg-side)" }} opacity="0.8" />
          {night && b.h > 10 && Array.from({ length: Math.floor(b.h / 8) }, (_, k) => <rect key={k} x={b.x + 2} y={b.y - b.h + 3 + k * 8} width={b.w - 4} height="2" style={{ fill: "var(--map-window)" }} opacity={(i + k) % 3 ? 0.9 : 0.25} />)}
        </g>
      ))}

      {/* Landmarks */}
      <g transform="translate(600 352)"><circle r="9" cy="-10" style={{ fill: "var(--gold)" }} /><rect x="-9" y="-10" width="18" height="10" style={{ fill: "var(--map-bldg)" }} />{[-16, -12, 12, 16].map((x) => <rect key={x} x={x - 1} y="-26" width="2" height="26" style={{ fill: "var(--map-bldg)" }} />)}</g>
      <g transform="translate(690 355)"><path d="M -12 0 L 0 -34 L 12 0 Z" style={{ fill: "var(--map-bldg)" }} /><path d="M 0 -34 L 12 0 L 6 0 Z" style={{ fill: "var(--map-bldg-side)" }} /><rect x="-0.8" y="-44" width="1.6" height="10" style={{ fill: "var(--map-bldg)" }} /></g>
      <g transform="translate(765 382)"><rect x="-20" y="-8" width="40" height="8" style={{ fill: "var(--map-bldg)" }} /><path d="M -10 -8 A 10 10 0 0 1 10 -8 Z" style={{ fill: "var(--success)" }} /></g>
      {/* Construction cranes */}
      {[[452, 110], [500, 640]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><rect x="-1" y="-40" width="2" height="40" style={{ fill: "var(--gold)" }} /><rect x="-12" y="-40" width="30" height="2" style={{ fill: "var(--gold)" }} /><line x1="14" y1="-38" x2="14" y2="-26" stroke="black" strokeWidth="0.5"><animate attributeName="y2" values="-26;-18;-26" dur="4s" repeatCount="indefinite" /></line></g>)}

      {/* Vehicles */}
      {moving && ROADS.flatMap((d, ri) => Array.from({ length: carsPerRoad }, (_, ci) => {
        const dur = 18 + ((ri * 7 + ci * 5) % 14);
        return (
          <g key={`${ri}-${ci}`}>
            <rect x="-4" y="-2" width="8" height="4" rx="1.2" style={{ fill: CAR_COLORS[(ri + ci) % CAR_COLORS.length] }} />
            {night && <circle cx="5" cy="0" r="3" fill="oklch(0.95 0.1 90)" opacity="0.6" />}
            <animateMotion dur={`${dur}s`} begin={`-${(ci * dur) / carsPerRoad}s`} repeatCount="indefinite" rotate="auto" path={d} keyPoints={ci % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
          </g>
        );
      }))}
      {/* Pedestrians */}
      {moving && !night && w.peds.map((p, i) => (
        <circle key={i} r="1.6" style={{ fill: i % 2 ? "var(--hunger)" : "var(--social)" }}>
          <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" path={`M ${p.d.x + p.dx} ${p.d.y + p.dy} l 18 6 l -6 10 l -12 -16`} />
        </circle>
      ))}

      {/* Labels */}
      {DISTRICTS.map((d) => <text key={d.id} x={d.x} y={d.y + 30} textAnchor="middle" className="fill-surface text-[11px] font-bold" style={{ paintOrder: "stroke", stroke: "var(--surface-foreground)", strokeWidth: 3 }}>{d.name}</text>)}
      {FUTURE_DISTRICTS.map((d) => <g key={d.name} opacity="0.75"><text x={d.x} y={d.y} textAnchor="middle" className="fill-surface-foreground text-[10px] font-bold" style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 3 }}>{d.name}</text><text x={d.x} y={d.y + 11} textAnchor="middle" className="fill-surface-foreground text-[7px]" style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 2 }}>Coming soon</text></g>)}

      {/* Time of day lighting */}
      {night && <rect width={WORLD_W} height={WORLD_H} style={{ fill: "var(--night)" }} opacity="0.5" pointerEvents="none" />}
      {evening && <rect width={WORLD_W} height={WORLD_H} fill="oklch(0.7 0.15 45)" opacity="0.18" pointerEvents="none" />}
      {morning && <rect width={WORLD_W} height={WORLD_H} fill="oklch(0.9 0.08 80)" opacity="0.12" pointerEvents="none" />}
    </svg>
  );
});
