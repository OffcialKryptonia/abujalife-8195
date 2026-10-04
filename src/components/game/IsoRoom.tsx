import { useMemo, useState, type ReactNode } from "react";
import { itemById, type FurnitureItem, type Home } from "@/game/content";
import { fits, itemDims, type FurnitureRow } from "@/game/rules";
import { PlayerCharacter, type Look, type Pose } from "./PlayerCharacter";
import { DayNightLighting, lightFor } from "./DayNightLighting";

const TW = 56, TH = 28, WALL = 130, PAD = 18;
const shade = (c: string, pct: number) => `color-mix(in oklch, ${c} ${pct}%, black)`;
const lighten = (c: string, pct: number) => `color-mix(in oklch, ${c} ${pct}%, white)`;
export type Pt = [number, number];
const pts = (a: Pt[]) => a.map((p) => p.join(",")).join(" ");
const up = (p: Pt, h: number): Pt => [p[0], p[1] - h];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function makeIso(n: number) {
  const ox = (n * TW) / 2 + PAD, oy = WALL + PAD;
  return (x: number, y: number): Pt => [ox + ((x - y) * TW) / 2, oy + ((x + y) * TH) / 2];
}

function Box({ A, B, C, D, h, color, z = 0 }: { A: Pt; B: Pt; C: Pt; D: Pt; h: number; color: string; z?: number }) {
  const [a, b, c, d] = [up(A, z), up(B, z), up(C, z), up(D, z)];
  return (
    <g>
      <polygon points={pts([d, c, up(c, h), up(d, h)])} style={{ fill: shade(color, 80) }} />
      <polygon points={pts([c, b, up(b, h), up(c, h)])} style={{ fill: shade(color, 64) }} />
      <polygon points={pts([up(a, h), up(b, h), up(c, h), up(d, h)])} style={{ fill: lighten(color, 92) }} />
      <polyline points={pts([up(d, h), up(c, h), up(b, h)])} fill="none" style={{ stroke: lighten(color, 60) }} strokeWidth="0.8" opacity="0.7" />
    </g>
  );
}

/** Furniture art with personality: idle motion, active-state effects and night glow. */
export function ItemArt({ it, A, B, C, D, active, night }: { it: FurnitureItem; A: Pt; B: Pt; C: Pt; D: Pt; active?: boolean | undefined; night?: boolean | undefined }) {
  const h = it.h, col = it.color;
  const top = (z: number): Pt[] => [up(A, z), up(B, z), up(C, z), up(D, z)];
  const center = lerp(A, C, 0.5);
  const steam = active && (it.cat === "Kitchen" || it.cat === "Bathroom") && (
    <g pointerEvents="none">{[0, 1, 2].map((i) => <circle key={i} cx={center[0] - 6 + i * 6} cy={center[1] - h - 6} r="4" fill="oklch(1 0 0 / 0.7)" className="anim-steam" style={{ animationDelay: `${i * 0.5}s` }} />)}</g>
  );
  switch (it.shape) {
    case "rug": {
      const inner = (k: number) => [lerp(A, C, k), lerp(B, D, k), lerp(A, C, 1 - k), lerp(B, D, 1 - k)];
      return <g><polygon points={pts(top(1))} style={{ fill: col }} /><polygon points={pts(inner(0.14))} fill="none" style={{ stroke: lighten(col, 45) }} strokeWidth="2" /><polygon points={pts(inner(0.3))} style={{ fill: shade(col, 85) }} /><polygon points={pts(inner(0.42))} fill="none" style={{ stroke: "var(--gold)" }} strokeWidth="1.2" strokeDasharray="3 3" /></g>;
    }
    case "bed": {
      const t = top(h);
      const pillowA = lerp(t[0]!, t[3]!, 0.12), pillowB = lerp(lerp(t[0]!, t[1]!, 0.27), lerp(t[3]!, t[2]!, 0.27), 0.12);
      const pillowC = lerp(lerp(t[0]!, t[1]!, 0.27), lerp(t[3]!, t[2]!, 0.27), 0.88), pillowD = lerp(t[0]!, t[3]!, 0.88);
      return (
        <g>
          <Box A={A} B={B} C={C} D={D} h={h} color={shade(col, 62)} />
          <polygon points={pts([up(A, h), up(D, h), up(D, h + 22), up(A, h + 22)])} style={{ fill: shade(col, 55) }} />
          <polygon points={pts([lerp(t[0]!, t[1]!, 0.32), t[1]!, t[2]!, lerp(t[3]!, t[2]!, 0.32)].map((p) => up(p, 2)))} style={{ fill: col }} />
          <polygon points={pts([lerp(t[0]!, t[1]!, 0.32), lerp(t[0]!, t[1]!, 0.42), lerp(t[3]!, t[2]!, 0.42), lerp(t[3]!, t[2]!, 0.32)].map((p) => up(p, 3)))} style={{ fill: lighten(col, 55) }} />
          <polygon points={pts([pillowA, pillowB, pillowC, pillowD].map((p) => up(p, 5)))} style={{ fill: "oklch(0.96 0.01 85)" }} />
        </g>
      );
    }
    case "seat": {
      const backB = lerp(A, D, 0.3), backC = lerp(B, C, 0.3);
      return <g><Box A={A} B={B} C={C} D={D} h={h * 0.5} color={col} /><Box A={A} B={B} C={backC} D={backB} h={h} color={shade(col, 88)} />{it.w > 1 && <circle cx={lerp(lerp(A, C, 0.5), D, 0.3)[0]} cy={lerp(lerp(A, C, 0.5), D, 0.3)[1] - h * 0.5 - 4} r="4" style={{ fill: "var(--gold)" }} opacity="0.85" />}</g>;
    }
    case "table": {
      const legs = [A, B, C, D].map((p) => lerp(p, center, 0.15));
      return <g>{legs.map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[0]} y2={l[1] - h} style={{ stroke: shade(col, 60) }} strokeWidth="3" />)}<Box A={A} B={B} C={C} D={D} h={5} z={h - 5} color={col} /><ellipse cx={center[0]} cy={center[1] - h - 3} rx="6" ry="3" fill="oklch(0.95 0.01 85)" /><ellipse cx={center[0]} cy={center[1] - h - 4} rx="4" ry="1.8" fill="oklch(0.62 0.17 40)" /></g>;
    }
    case "tv": {
      const a2 = lerp(A, D, 0.55), b2 = lerp(B, C, 0.55);
      const screen = [up(D, 5), up(C, 5), up(C, h - 4), up(D, h - 4)].map((p, i) => [p[0] + (i % 3 === 0 ? 4 : -4), p[1]] as Pt);
      return (
        <g>
          <Box A={a2} B={b2} C={C} D={D} h={h} color={col} />
          <polygon points={pts(screen)} style={{ fill: active ? "oklch(0.72 0.13 210)" : "oklch(0.24 0.03 250)" }} className={active ? "anim-flicker" : undefined} />
          {!active && <polygon points={pts([screen[0]!, lerp(screen[0]!, screen[1]!, 0.4), lerp(screen[3]!, screen[2]!, 0.2)])} fill="oklch(1 0 0 / 0.08)" />}
          {active && <polygon points={pts([screen[0]!, screen[1]!, lerp(screen[1]!, C, 3), lerp(screen[0]!, D, 3)])} fill="oklch(0.8 0.12 210 / 0.18)" pointerEvents="none" />}
          <circle cx={screen[1]![0] - 3} cy={screen[1]![1] - 3} r="1.2" fill={active ? "oklch(0.75 0.17 145)" : "oklch(0.6 0.2 27)"} />
        </g>
      );
    }
    case "plant":
      return <g><Box A={lerp(A, center, 0.4)} B={lerp(B, center, 0.4)} C={lerp(C, center, 0.4)} D={lerp(D, center, 0.4)} h={12} color="oklch(0.55 0.1 40)" /><g className="anim-sway">{[[0, -28, 11], [-8, -19, 8], [8, -21, 8], [-3, -36, 7]].map(([dx, dy, r], i) => <circle key={i} cx={center[0] + dx!} cy={center[1] + dy!} r={r} style={{ fill: i % 2 ? shade(col, 82) : col }} />)}<circle cx={center[0] + 3} cy={center[1] - 31} r="3" style={{ fill: lighten(col, 70) }} opacity="0.6" /></g></g>;
    case "lamp":
      return <g><line x1={center[0]} y1={center[1]} x2={center[0]} y2={center[1] - h} style={{ stroke: shade(col, 60) }} strokeWidth="3" /><ellipse cx={center[0]} cy={center[1]} rx="9" ry="4" style={{ fill: shade(col, 50) }} /><path d={`M${center[0] - 10} ${center[1] - h + 6} L${center[0] + 10} ${center[1] - h + 6} L${center[0] + 6} ${center[1] - h - 8} L${center[0] - 6} ${center[1] - h - 8} Z`} style={{ fill: night ? lighten(col, 40) : col }} /><circle cx={center[0]} cy={center[1] - h} r={night ? 34 : 18} fill="oklch(0.9 0.15 85)" opacity={night ? 0.32 : 0.14} className="anim-glow" pointerEvents="none" /></g>;
    case "bath": {
      const t = top(h);
      return <g><Box A={A} B={B} C={C} D={D} h={h} color={col} /><polygon points={pts([lerp(t[0]!, t[2]!, 0.15), lerp(t[1]!, t[3]!, 0.15), lerp(t[0]!, t[2]!, 0.85), lerp(t[1]!, t[3]!, 0.85)])} style={{ fill: "oklch(0.72 0.1 220)" }} className={active ? "anim-flicker" : undefined} />{steam}</g>;
    }
    default:
      return (
        <g>
          <Box A={A} B={B} C={C} D={D} h={h} color={col} />
          {it.shape === "tall" && <line x1={lerp(D, C, 0.5)[0]} y1={lerp(D, C, 0.5)[1] - h * 0.55} x2={lerp(D, C, 0.5)[0]} y2={lerp(D, C, 0.5)[1] - h * 0.95} style={{ stroke: shade(col, 50) }} strokeWidth="1.5" />}
          <line x1={lerp(D, C, 0.75)[0]} y1={lerp(D, C, 0.75)[1] - h * 0.25} x2={lerp(D, C, 0.75)[0]} y2={lerp(D, C, 0.75)[1] - h * 0.5} style={{ stroke: shade(col, 45) }} strokeWidth="1.5" strokeLinecap="round" />
          {it.cat === "Work" && <polygon points={pts([up(lerp(D, C, 0.2), h + 2), up(lerp(D, C, 0.8), h + 2), up(lerp(lerp(D, C, 0.8), lerp(A, B, 0.8), 0.5), h + 18), up(lerp(lerp(D, C, 0.2), lerp(A, B, 0.2), 0.5), h + 18)])} style={{ fill: active ? "oklch(0.7 0.12 200)" : "oklch(0.25 0.03 250)" }} className={active ? "anim-flicker" : undefined} />}
          {steam}
        </g>
      );
  }
}

/** Standalone isometric preview of one catalogue item. */
export function ItemPreview({ it, size = 120, rotate = 0 }: { it: FurnitureItem; size?: number; rotate?: number }) {
  const w = rotate % 2 ? it.d : it.w, d = rotate % 2 ? it.w : it.d;
  const iso = (x: number, y: number): Pt => [60 + ((x - y) * 30) / 2, 72 + ((x + y) * 15) / 2 - (w + d) * 7];
  const scaled = { ...it, h: it.h * (30 / TW) * 1.3 };
  return (
    <svg viewBox="0 0 120 100" width={size} height={(size * 100) / 120}>
      <ellipse cx="60" cy="80" rx="44" ry="11" fill="black" opacity="0.14" />
      <ItemArt it={scaled} A={iso(0, 0)} B={iso(w, 0)} C={iso(w, d)} D={iso(0, d)} />
    </svg>
  );
}

export interface RoomAvatar extends Look { at: Pt; pose?: Pose | undefined; z?: number | undefined; flip?: boolean | undefined; depth?: number | undefined }
export type Project = (x: number, y: number, z?: number) => { left: string; top: string };

export interface IsoRoomProps {
  home: Home; furniture: FurnitureRow[]; hour: number; minute?: number | undefined;
  avatar?: RoomAvatar | null | undefined;
  selected?: string | null | undefined; placing?: { row: FurnitureRow } | null | undefined; activeUid?: string | null | undefined;
  hotspots?: boolean | undefined;
  onItem?: ((row: FurnitureRow) => void) | undefined; onTile?: ((x: number, y: number) => void) | undefined;
  overlay?: ((project: Project) => ReactNode) | undefined;
  onWardrobe?: (() => void) | undefined; wardrobeOpen?: boolean | undefined;
}

/** Built-in wardrobe footprint, flush against the left wall. */
export function wardrobeSpot(n: number) { const y0 = n * 0.45, y1 = n * 0.7; return { x0: 0, x1: 0.55, y0, y1, front: [0.95, (y0 + y1) / 2] as Pt }; }

export function IsoRoom({ home, furniture, hour, minute = 0, avatar, selected, placing, activeUid, hotspots, onItem, onTile, overlay, onWardrobe, wardrobeOpen }: IsoRoomProps) {
  const n = home.size;
  const iso = useMemo(() => makeIso(n), [n]);
  const [hover, setHover] = useState<Pt | null>(null);
  const W = n * TW + PAD * 2, H = n * TH + WALL + PAD * 2 + 10;
  const light = lightFor(hour);
  const night = light.phase === "night";
  const project: Project = (x, y, z = 0) => { const p = up(iso(x, y), z); return { left: `${(p[0] / W) * 100}%`, top: `${(p[1] / H) * 100}%` }; };

  const placed = furniture.filter((r) => r.p && itemById(r.i));
  const others = placing ? placed.filter((r) => r.u !== placing.row.u) : placed;
  const plantAt = useMemo<Pt | null>(() => {
    for (const [x, y] of [[n - 1, n - 1], [n - 1, 0], [0, n - 1], [Math.floor(n / 2), n - 1]] as Pt[]) {
      if (fits(furniture.filter((r) => r.p), n, { u: "_plant", i: "plastic_chair", x, y, r: 0, p: true })) return [x + 0.5, y + 0.5];
    }
    return null;
  }, [furniture, n]);
  const drawables = [
    ...(plantAt ? [{ key: "plant", depth: plantAt[0] + plantAt[1] + 0.5, r: null as FurnitureRow | null }] : []),
    ...others.map((r) => { const d = itemDims(r); const it = itemById(r.i)!; return { key: r.u, depth: it.shape === "rug" ? -1 : r.x + r.y + d.w + d.d, r }; }),
    ...(avatar ? [{ key: "avatar", depth: avatar.depth ?? avatar.at[0] + avatar.at[1] + 1, r: null as FurnitureRow | null }] : []),
  ].sort((a, b) => a.depth - b.depth);

  const ghost = placing && hover ? { ...placing.row, x: hover[0], y: hover[1], p: true } : null;
  const ghostOk = ghost ? fits(furniture, n, ghost) : false;

  const wallR: Pt[] = [iso(0, 0), iso(n, 0), up(iso(n, 0), WALL), up(iso(0, 0), WALL)];
  const wallL: Pt[] = [iso(0, n), iso(0, 0), up(iso(0, 0), WALL), up(iso(0, n), WALL)];
  const onR = (t: number, h: number) => up(lerp(iso(0, 0), iso(n, 0), t), h);
  const onL = (t: number, h: number) => up(lerp(iso(0, 0), iso(0, n), t), h);
  const wt0 = 0.38, wt1 = 0.66;
  const winPts = [onR(wt0, 40), onR(wt1, 40), onR(wt1, 100), onR(wt0, 100)];
  const beam = [iso(wt0 * n, 0.05), iso(wt1 * n, 0.05), iso(wt1 * n + 1.4, Math.min(n, 3.6)), iso(wt0 * n + 1.4, Math.min(n, 3.6))];
  const clock = onL(0.72, 92);
  const hAng = ((hour % 12) + minute / 60) * 30, mAng = minute * 6;
  const lamps = placed.filter((r) => itemById(r.i)!.shape === "lamp");

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-manipulation select-none" role="img" aria-label={`${home.name} interior`}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={light.sky[0]} /><stop offset="1" stopColor={light.sky[1]} /></linearGradient>
          <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="black" stopOpacity="0.18" /><stop offset="0.6" stopColor="black" stopOpacity="0" /></linearGradient>
          <radialGradient id="floorLight" cx="0.55" cy="0.3" r="0.8"><stop offset="0" stopColor="white" stopOpacity={night ? 0 : 0.12} /><stop offset="1" stopColor="black" stopOpacity="0.22" /></radialGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor={light.beamColor} stopOpacity={light.beam} /><stop offset="1" stopColor={light.beamColor} stopOpacity="0" /></linearGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.55" r="0.75"><stop offset="0.6" stopColor="black" stopOpacity="0" /><stop offset="1" stopColor="black" stopOpacity="0.35" /></radialGradient>
          <radialGradient id="lampGlow"><stop offset="0" stopColor="oklch(0.92 0.13 85)" stopOpacity="0.55" /><stop offset="1" stopColor="oklch(0.92 0.13 85)" stopOpacity="0" /></radialGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>

        {/* walls */}
        <polygon points={pts(wallL)} style={{ fill: shade(home.wall, 86) }} />
        <polygon points={pts(wallR)} style={{ fill: home.wall }} />
        <polygon points={pts(wallL)} fill="url(#wallShade)" />
        <polygon points={pts(wallR)} fill="url(#wallShade)" />
        <polygon points={pts([iso(0, n), iso(0, 0), up(iso(0, 0), 34), up(iso(0, n), 34)])} style={{ fill: shade(home.wall, 76) }} />
        <polygon points={pts([iso(0, 0), iso(n, 0), up(iso(n, 0), 34), up(iso(0, 0), 34)])} style={{ fill: shade(home.wall, 84) }} />
        <polyline points={pts([up(iso(0, n), 34), up(iso(0, 0), 34), up(iso(n, 0), 34)])} fill="none" style={{ stroke: lighten(home.wall, 60) }} strokeWidth="2" />
        <line x1={iso(0, 0)[0]} y1={iso(0, 0)[1]} x2={iso(0, 0)[0]} y2={iso(0, 0)[1] - WALL} style={{ stroke: shade(home.wall, 70) }} strokeWidth="1" />

        {/* window */}
        <polygon points={pts(winPts)} fill="url(#sky)" style={{ stroke: shade(home.wall, 55) }} strokeWidth="5" strokeLinejoin="round" />
        {night ? <>
          <circle cx={lerp(winPts[0]!, winPts[2]!, 0.7)[0]} cy={lerp(winPts[0]!, winPts[2]!, 0.7)[1] - 12} r="5" fill="oklch(0.95 0.03 90)" />
          {[0.2, 0.45, 0.62, 0.3].map((t, i) => <circle key={i} cx={lerp(winPts[0]!, winPts[1]!, t)[0]} cy={lerp(winPts[0]!, winPts[1]!, t)[1] - 20 - i * 9} r="0.9" fill="white" className="anim-glow" style={{ animationDelay: `${i * 0.7}s` }} />)}
        </> : <>
          <circle cx={lerp(winPts[0]!, winPts[2]!, 0.3)[0]} cy={lerp(winPts[0]!, winPts[2]!, 0.3)[1] - 14} r="7" fill={light.phase === "day" ? "oklch(0.97 0.08 95)" : "oklch(0.88 0.14 60)"} opacity="0.9" />
          <path d={`M${lerp(winPts[0]!, winPts[1]!, 0.05)[0]} ${lerp(winPts[0]!, winPts[1]!, 0.05)[1] - 4} l10 -10 l8 5 l12 -14 l9 9 l10 -4 l8 8`} fill="none" style={{ stroke: "oklch(0.45 0.06 150 / 0.7)" }} strokeWidth="5" strokeLinejoin="round" />
        </>}
        <line x1={lerp(winPts[0]!, winPts[1]!, 0.5)[0]} y1={lerp(winPts[0]!, winPts[1]!, 0.5)[1]} x2={lerp(winPts[3]!, winPts[2]!, 0.5)[0]} y2={lerp(winPts[3]!, winPts[2]!, 0.5)[1]} style={{ stroke: shade(home.wall, 55) }} strokeWidth="3" />
        <polygon points={pts([onR(wt0 - 0.03, 38), onR(wt1 + 0.03, 38), onR(wt1 + 0.03, 33), onR(wt0 - 0.03, 33)])} style={{ fill: lighten(home.wall, 70) }} />
        <polygon className="anim-curtain" points={pts([onR(wt0 - 0.07, 108), onR(wt0 + 0.02, 108), onR(wt0 + 0.0, 38), onR(wt0 - 0.08, 34)])} style={{ fill: "var(--primary)" }} opacity="0.92" />
        <polygon className="anim-curtain" points={pts([onR(wt1 - 0.02, 108), onR(wt1 + 0.07, 108), onR(wt1 + 0.08, 34), onR(wt1, 38)])} style={{ fill: "var(--primary)", animationDelay: "-2s" }} opacity="0.92" />
        <polyline points={pts([onR(wt0 - 0.09, 110), onR(wt1 + 0.09, 110)])} style={{ stroke: "var(--gold)" }} strokeWidth="2.5" strokeLinecap="round" />

        {/* wall art: Aso Rock at dusk */}
        <g>
          <polygon points={pts([onL(0.22, 98), onL(0.48, 98), onL(0.48, 58), onL(0.22, 58)])} style={{ fill: "var(--gold)" }} />
          <polygon points={pts([onL(0.235, 95), onL(0.465, 95), onL(0.465, 61), onL(0.235, 61)])} style={{ fill: "oklch(0.32 0.07 160)" }} />
          <polygon points={pts([onL(0.235, 61), onL(0.28, 76), onL(0.33, 84), onL(0.4, 80), onL(0.44, 70), onL(0.465, 61)])} style={{ fill: "oklch(0.55 0.07 50)" }} />
          <circle cx={onL(0.41, 88)[0]} cy={onL(0.41, 88)[1]} r="3" style={{ fill: "var(--gold)" }} />
        </g>
        {/* wall clock reads game time */}
        <g transform={`translate(${clock[0]} ${clock[1]}) skewY(-26.57)`}>
          <circle r="11" fill="oklch(0.97 0.01 85)" style={{ stroke: "oklch(0.3 0.04 160)" }} strokeWidth="2" />
          <line x1="0" y1="0" x2={Math.sin((hAng * Math.PI) / 180) * 5.5} y2={-Math.cos((hAng * Math.PI) / 180) * 5.5} stroke="oklch(0.2 0.03 160)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="0" y1="0" x2={Math.sin((mAng * Math.PI) / 180) * 8} y2={-Math.cos((mAng * Math.PI) / 180) * 8} stroke="oklch(0.2 0.03 160)" strokeWidth="1.1" strokeLinecap="round" />
          <circle r="1.2" style={{ fill: "var(--gold)" }} />
        </g>

        {/* lived-in details: door, shelf with books + plant, family photos, outlet, AC unit */}
        <g pointerEvents="none">
          <polygon points={pts([onL(0.8, 6), onL(0.96, 6), onL(0.96, 92), onL(0.8, 92)])} style={{ fill: "oklch(0.4 0.07 50)", stroke: shade(home.wall, 50) }} strokeWidth="3" />
          <polygon points={pts([onL(0.82, 14), onL(0.94, 14), onL(0.94, 48), onL(0.82, 48)])} fill="black" opacity="0.12" />
          <polygon points={pts([onL(0.82, 54), onL(0.94, 54), onL(0.94, 86), onL(0.82, 86)])} fill="black" opacity="0.12" />
          <circle cx={onL(0.93, 50)[0]} cy={onL(0.93, 50)[1]} r="1.8" style={{ fill: "var(--gold)" }} />
          {[0.08, 0.15].map((t, i) => <polygon key={i} points={pts([onL(t, 84 - i * 8), onL(t + 0.08, 84 - i * 8), onL(t + 0.08, 66 - i * 8), onL(t, 66 - i * 8)])} style={{ fill: "oklch(0.25 0.03 50)", stroke: "oklch(0.95 0.01 85)" }} strokeWidth="1.5" />)}
          <polygon points={pts([onL(0.09, 82), onL(0.15, 82), onL(0.15, 68), onL(0.09, 68)])} fill="oklch(0.6 0.08 60)" opacity="0.8" />
          <polygon points={pts([onR(0.78, 78), onR(0.96, 78), onR(0.96, 74), onR(0.78, 74)])} style={{ fill: "oklch(0.42 0.06 55)" }} />
          {[0.79, 0.81, 0.83, 0.85, 0.87].map((t, i) => <polygon key={t} points={pts([onR(t, 78), onR(t + 0.016, 78), onR(t + 0.016, 90 + (i % 3) * 2), onR(t, 90 + (i % 3) * 2)])} style={{ fill: ["oklch(0.5 0.13 30)", "oklch(0.45 0.08 160)", "oklch(0.75 0.12 85)", "oklch(0.35 0.06 250)", "oklch(0.6 0.1 140)"][i] }} />)}
          <g className="anim-leaf"><path d={`M${onR(0.92, 78)[0]} ${onR(0.92, 78)[1]} q-6 -10 -2 -16 M${onR(0.92, 78)[0]} ${onR(0.92, 78)[1]} q5 -9 8 -12 M${onR(0.92, 78)[0]} ${onR(0.92, 78)[1]} q0 -12 1 -18`} stroke="oklch(0.5 0.12 150)" strokeWidth="2.6" fill="none" strokeLinecap="round" /></g>
          <polygon points={pts([onR(0.9, 78), onR(0.94, 78), onR(0.935, 82), onR(0.905, 82)])} fill="oklch(0.6 0.1 40)" />
          <polygon points={pts([onR(0.08, 112), onR(0.3, 112), onR(0.3, 100), onR(0.08, 100)])} fill="oklch(0.96 0.005 90)" style={{ stroke: "oklch(0.8 0.01 90)" }} strokeWidth="1" />
          <polyline points={pts([onR(0.1, 102), onR(0.28, 102)])} stroke="oklch(0.75 0.01 90)" strokeWidth="1" />
          <circle cx={onR(0.27, 108)[0]} cy={onR(0.27, 108)[1]} r="1" fill={light.phase === "night" ? "oklch(0.7 0.2 145)" : "oklch(0.7 0.15 145)"} className="anim-glow" />
          <rect x={onR(0.2, 14)[0] - 2} y={onR(0.2, 14)[1] - 3} width="4" height="5" rx="1" fill="oklch(0.95 0.01 90)" />
        </g>



        {/* floor */}
        {Array.from({ length: n * n }, (_, i) => {
          const x = i % n, y = Math.floor(i / n);
          const gd = ghost ? itemDims(ghost) : null;
          const inGhost = ghost && gd && x >= ghost.x && y >= ghost.y && x < ghost.x + gd.w && y < ghost.y + gd.d;
          return (
            <g key={i} onPointerEnter={() => placing && setHover([x, y])} onClick={() => { if (placing) setHover([x, y]); onTile?.(x, y); }}>
              <polygon points={pts([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)])}
                style={{ fill: inGhost ? (ghostOk ? "oklch(0.72 0.15 150 / 0.8)" : "oklch(0.6 0.2 27 / 0.75)") : (x * 3 + y) % 4 === 0 ? shade(home.floor, 94) : (x + y) % 2 ? home.floor : shade(home.floor, 97) }}
                stroke={placing ? "oklch(1 0 0 / 0.4)" : "oklch(0 0 0 / 0.07)"} strokeWidth="1" />
              {!placing && [0.34, 0.67].map((k) => <line key={k} x1={iso(x, y + k)[0]} y1={iso(x, y + k)[1]} x2={iso(x + 1, y + k)[0]} y2={iso(x + 1, y + k)[1]} stroke="oklch(0 0 0 / 0.06)" strokeWidth="0.8" pointerEvents="none" />)}
            </g>
          );
        })}
        <polygon points={pts([iso(0, 0), iso(n, 0), iso(n, n), iso(0, n)])} fill="url(#floorLight)" pointerEvents="none" />
        <polygon points={pts(beam)} fill="url(#beam)" pointerEvents="none" style={{ mixBlendMode: "screen" }} />
        {light.beam > 0.2 && [0, 1, 2, 3, 4].map((i) => { const p = lerp(lerp(beam[0]!, beam[1]!, (i * 0.23) % 1), lerp(beam[3]!, beam[2]!, (i * 0.23) % 1), 0.3 + (i % 3) * 0.2); return <circle key={i} cx={p[0]} cy={p[1] - 20} r="1.1" fill="white" className="anim-mote" style={{ animationDelay: `${i * 1.2}s` }} pointerEvents="none" />; })}
        <polygon points={pts([iso(0, 0), iso(n, 0), up(iso(n, 0), 6), up(iso(0, 0), 6)])} style={{ fill: shade(home.wall, 55) }} />
        <polygon points={pts([iso(0, n), iso(0, 0), up(iso(0, 0), 6), up(iso(0, n), 6)])} style={{ fill: shade(home.wall, 50) }} />

        {/* woven floor mat + potted plant in the back corner give the room a lived-in base */}
        {!placed.some((r) => itemById(r.i)!.shape === "rug") && <g pointerEvents="none" opacity="0.85">
          <polygon points={pts([iso(n * 0.3, n * 0.35), iso(n * 0.7, n * 0.35), iso(n * 0.7, n * 0.7), iso(n * 0.3, n * 0.7)])} style={{ fill: "oklch(0.55 0.1 45)" }} />
          <polygon points={pts([iso(n * 0.34, n * 0.39), iso(n * 0.66, n * 0.39), iso(n * 0.66, n * 0.66), iso(n * 0.34, n * 0.66)])} fill="none" style={{ stroke: "var(--gold)" }} strokeWidth="1.5" strokeDasharray="4 3" />
        </g>}
        {/* built-in wardrobe: tap to change outfit */}
        {(() => { const w = wardrobeSpot(n); const h = 92; const A = iso(w.x0, w.y0), B = iso(w.x1, w.y0), C = iso(w.x1, w.y1), D = iso(w.x0, w.y1);
          const f0 = iso(w.x1, w.y0), f1 = iso(w.x1, w.y1); const mid = lerp(f0, f1, 0.5);
          return (
            <g onClick={(e) => { e.stopPropagation(); if (!placing) onWardrobe?.(); }} className={onWardrobe && !placing ? "cursor-pointer" : undefined} style={{ filter: wardrobeOpen ? "drop-shadow(0 0 7px oklch(0.8 0.14 85))" : undefined, transition: "filter .2s" }}>
              <Box A={A} B={B} C={C} D={D} h={h} color="oklch(0.42 0.07 50)" />
              {wardrobeOpen ? <>
                <polygon points={pts([up(f0, 6), up(f1, 6), up(f1, h - 6), up(f0, h - 6)])} fill="oklch(0.16 0.02 40)" />
                {[0.15, 0.3, 0.45, 0.6, 0.75, 0.88].map((t, i) => { const p = up(lerp(f0, f1, t), h - 16); return <path key={t} d={`M${p[0]} ${p[1]} l-4 6 l0 30 l8 0 l0 -30 z`} fill={["oklch(0.55 0.15 30)", "var(--gold)", "oklch(0.45 0.1 160)", "oklch(0.35 0.08 250)", "oklch(0.7 0.12 85)", "oklch(0.5 0.14 350)"][i]} className="anim-leaf" style={{ animationDelay: `${i * 0.3}s` }} />; })}
                <polygon points={pts([up(f0, 6), up(lerp(f0, f1, 0.5), 6), [lerp(f0, f1, 0.5)[0] + 14, up(lerp(f0, f1, 0.5), 6)[1] + 8], [f0[0] + 14, up(f0, 6)[1] + 8]].map((q) => q as Pt).concat([]))} fill="none" />
              </> : <>
                <polyline points={pts([up(mid, 6), up(mid, h - 6)])} stroke="oklch(0.25 0.04 50)" strokeWidth="1.2" />
                {[0.42, 0.58].map((t) => { const p = up(lerp(f0, f1, t), h * 0.5); return <circle key={t} cx={p[0]} cy={p[1]} r="1.8" style={{ fill: "var(--gold)" }} />; })}
                {hotspots && !placing && (() => { const tc = up(mid, h + 14); return <g pointerEvents="none"><circle cx={tc[0]} cy={tc[1]} r="5" fill="none" style={{ stroke: "var(--gold)" }} strokeWidth="1.5" className="anim-hotspot" /><circle cx={tc[0]} cy={tc[1]} r="3.2" style={{ fill: "var(--gold)" }} /></g>; })()}
              </>}
            </g>
          ); })()}

        {/* contact shadows */}
        <g filter="url(#soft)" pointerEvents="none">
          {others.map((r) => { const it = itemById(r.i)!; if (it.shape === "rug") return null; const { w: dw, d: dd } = itemDims(r); const s = [iso(r.x + 0.1, r.y + 0.1), iso(r.x + dw + 0.25, r.y + 0.1), iso(r.x + dw + 0.25, r.y + dd + 0.25), iso(r.x + 0.1, r.y + dd + 0.25)]; return <polygon key={r.u} points={pts(s)} fill="black" opacity={night ? 0.18 : 0.28} />; })}
        </g>

        {drawables.map((d) => {
          if (!d.r && d.key === "plant") {
            const c = iso(plantAt![0], plantAt![1]);
            return (
              <g key="plant" pointerEvents="none">
                <ellipse cx={c[0]} cy={c[1]} rx="10" ry="4.5" fill="black" opacity="0.25" />
                <path d={`M${c[0] - 7} ${c[1] - 14} L${c[0] + 7} ${c[1] - 14} L${c[0] + 5} ${c[1]} L${c[0] - 5} ${c[1]}Z`} fill="oklch(0.55 0.11 40)" />
                <g className="anim-leaf">{[-20, -8, 6, 18, 0].map((ang, i) => <ellipse key={i} cx={c[0]} cy={c[1] - 28} rx="3.8" ry="13" fill={i % 2 ? "oklch(0.5 0.13 150)" : "oklch(0.42 0.11 155)"} transform={`rotate(${ang * 2.2} ${c[0]} ${c[1] - 14})`} />)}</g>
              </g>
            );
          }
          if (!d.r) {
            const a = avatar!; const p = up(iso(a.at[0], a.at[1]), a.z ?? 0);
            return (
              <g key="avatar" style={{ transform: `translate(${p[0]}px, ${p[1]}px)`, transition: "transform .85s cubic-bezier(.45,.05,.35,1)" }} pointerEvents="none">
                <g style={{ transform: a.flip ? "scaleX(-1)" : "none", transition: "transform .2s" }}>
                  <PlayerCharacter look={a} pose={a.pose ?? "idle"} scale={1.2} />
                </g>
              </g>
            );
          }
          const r = d.r; const it = itemById(r.i)!; const { w: dw, d: dd } = itemDims(r);
          const usable = hotspots && !!it.use && !placing;
          const tc = up(lerp(iso(r.x, r.y), iso(r.x + dw, r.y + dd), 0.5), it.h + 16);
          return (
            <g key={d.key} onClick={(e) => { e.stopPropagation(); if (!placing) onItem?.(r); }} className="cursor-pointer" style={{ filter: selected === r.u ? "drop-shadow(0 0 6px oklch(0.8 0.14 85))" : undefined, transition: "filter .2s" }}>
              <ItemArt it={it} A={iso(r.x, r.y)} B={iso(r.x + dw, r.y)} C={iso(r.x + dw, r.y + dd)} D={iso(r.x, r.y + dd)} active={activeUid === r.u} night={night} />
              {usable && activeUid !== r.u && <g pointerEvents="none"><circle cx={tc[0]} cy={tc[1]} r="5" fill="none" style={{ stroke: "var(--gold)" }} strokeWidth="1.5" className="anim-hotspot" /><circle cx={tc[0]} cy={tc[1]} r="3.2" style={{ fill: "var(--gold)" }} /></g>}
            </g>
          );
        })}
        {ghost && (() => { const it = itemById(ghost.i)!; const { w: gw, d: gd } = itemDims(ghost); return <g opacity="0.65" pointerEvents="none"><ItemArt it={it} A={iso(ghost.x, ghost.y)} B={iso(ghost.x + gw, ghost.y)} C={iso(ghost.x + gw, ghost.y + gd)} D={iso(ghost.x, ghost.y + gd)} /></g>; })()}

        <DayNightLighting light={light} w={W} h={H} />
        {light.lampBoost > 0 && lamps.map((r) => { const it = itemById(r.i)!; const c = up(lerp(iso(r.x, r.y), iso(r.x + 1, r.y + 1), 0.5), it.h); return <circle key={r.u} cx={c[0]} cy={c[1]} r={90} fill="url(#lampGlow)" opacity={light.lampBoost} style={{ mixBlendMode: "screen" }} pointerEvents="none" />; })}
      </svg>
      {overlay && <div className="pointer-events-none absolute inset-0">{overlay(project)}</div>}
    </div>
  );
}
