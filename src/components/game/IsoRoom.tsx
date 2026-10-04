import { useMemo, useState } from "react";
import { itemById, type FurnitureItem, type Home } from "@/game/content";
import { fits, itemDims, type FurnitureRow } from "@/game/rules";
import { Figure } from "./ui";

const TW = 56, TH = 28, WALL = 120, PAD = 16;
const shade = (c: string, pct: number) => `color-mix(in oklch, ${c} ${pct}%, black)`;
const lighten = (c: string, pct: number) => `color-mix(in oklch, ${c} ${pct}%, white)`;
type Pt = [number, number];
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
      <polygon points={pts([d, c, up(c, h), up(d, h)])} style={{ fill: shade(color, 78) }} />
      <polygon points={pts([c, b, up(b, h), up(c, h)])} style={{ fill: shade(color, 62) }} />
      <polygon points={pts([up(a, h), up(b, h), up(c, h), up(d, h)])} style={{ fill: color }} />
    </g>
  );
}

export function ItemArt({ it, A, B, C, D, active }: { it: FurnitureItem; A: Pt; B: Pt; C: Pt; D: Pt; active?: boolean }) {
  const h = it.h, col = it.color;
  const top = (z: number): Pt[] => [up(A, z), up(B, z), up(C, z), up(D, z)];
  const center = lerp(A, C, 0.5);
  switch (it.shape) {
    case "rug":
      return <g><polygon points={pts(top(1))} style={{ fill: col }} /><polygon points={pts([lerp(A, C, 0.2), lerp(B, D, 0.2), lerp(A, C, 0.8), lerp(B, D, 0.8)])} fill="none" style={{ stroke: lighten(col, 50) }} strokeWidth="2" strokeDasharray="4 3" /></g>;
    case "bed": {
      const t = top(h);
      return (
        <g>
          <Box A={A} B={B} C={C} D={D} h={h} color={shade(col, 70)} />
          <polygon points={pts([lerp(t[0]!, t[1]!, 0.32), t[1]!, t[2]!, lerp(t[3]!, t[2]!, 0.32)])} style={{ fill: col }} />
          <polygon points={pts([lerp(t[0]!, t[3]!, 0.12), lerp(lerp(t[0]!, t[1]!, 0.27), lerp(t[3]!, t[2]!, 0.27), 0.12), lerp(lerp(t[0]!, t[1]!, 0.27), lerp(t[3]!, t[2]!, 0.27), 0.88), lerp(t[0]!, t[3]!, 0.88)].map((p) => up(p, 4)))} style={{ fill: lighten(col, 20) }} />
        </g>
      );
    }
    case "seat": {
      const backB = lerp(A, D, 0.3), backC = lerp(B, C, 0.3);
      return <g><Box A={A} B={B} C={C} D={D} h={h * 0.5} color={col} /><Box A={A} B={B} C={backC} D={backB} h={h} color={shade(col, 90)} /></g>;
    }
    case "table": {
      const legs = [A, B, C, D].map((p) => lerp(p, center, 0.15));
      return <g>{legs.map((l, i) => <line key={i} x1={l[0]} y1={l[1]} x2={l[0]} y2={l[1] - h} style={{ stroke: shade(col, 60) }} strokeWidth="3" />)}<Box A={A} B={B} C={C} D={D} h={5} z={h - 5} color={col} /></g>;
    }
    case "tv": {
      const a2 = lerp(A, D, 0.55), b2 = lerp(B, C, 0.55);
      const f = [D, C].map((p) => p);
      return (
        <g>
          <Box A={a2} B={b2} C={C} D={D} h={h} color={col} />
          <polygon points={pts([up(f[0]!, 5), up(f[1]!, 5), up(f[1]!, h - 4), up(f[0]!, h - 4)].map((p, i) => [p[0] + (i % 3 === 0 ? 4 : -4), p[1]] as Pt))} style={{ fill: active ? "oklch(0.75 0.12 220)" : "oklch(0.3 0.04 250)" }} />
        </g>
      );
    }
    case "plant":
      return <g><Box A={lerp(A, center, 0.4)} B={lerp(B, center, 0.4)} C={lerp(C, center, 0.4)} D={lerp(D, center, 0.4)} h={12} color="oklch(0.55 0.1 40)" />{[[0, -26, 11], [-7, -18, 8], [7, -20, 8]].map(([dx, dy, r], i) => <circle key={i} cx={center[0] + dx!} cy={center[1] + dy!} r={r} style={{ fill: i ? shade(col, 85) : col }} />)}</g>;
    case "lamp":
      return <g><line x1={center[0]} y1={center[1]} x2={center[0]} y2={center[1] - h} style={{ stroke: shade(col, 60) }} strokeWidth="3" /><ellipse cx={center[0]} cy={center[1]} rx="9" ry="4" style={{ fill: shade(col, 50) }} /><path d={`M${center[0] - 10} ${center[1] - h + 6} L${center[0] + 10} ${center[1] - h + 6} L${center[0] + 6} ${center[1] - h - 8} L${center[0] - 6} ${center[1] - h - 8} Z`} style={{ fill: col }} /><circle cx={center[0]} cy={center[1] - h} r="18" fill="oklch(0.9 0.15 90)" opacity="0.18" /></g>;
    case "bath": {
      const t = top(h);
      return <g><Box A={A} B={B} C={C} D={D} h={h} color={col} /><polygon points={pts([lerp(t[0]!, t[2]!, 0.15), lerp(t[1]!, t[3]!, 0.15), lerp(t[0]!, t[2]!, 0.85), lerp(t[1]!, t[3]!, 0.85)])} style={{ fill: "oklch(0.7 0.1 220)" }} /></g>;
    }
    default:
      return <g><Box A={A} B={B} C={C} D={D} h={h} color={col} /><line x1={lerp(D, C, 0.5)[0]} y1={lerp(D, C, 0.5)[1] - h * 0.2} x2={lerp(D, C, 0.5)[0]} y2={lerp(D, C, 0.5)[1] - h * 0.85} style={{ stroke: shade(col, 50) }} strokeWidth="1.5" /></g>;
  }
}

/** Standalone isometric preview of one catalogue item. */
export function ItemPreview({ it, size = 120 }: { it: FurnitureItem; size?: number }) {
  const iso = (x: number, y: number): Pt => [60 + ((x - y) * 30) / 2, 70 + ((x + y) * 15) / 2 - (it.w + it.d) * 7];
  const k = 30 / TW;
  const scaled = { ...it, h: it.h * k * 1.3 };
  return (
    <svg viewBox="0 0 120 100" width={size} height={(size * 100) / 120}>
      <ellipse cx="60" cy="78" rx="44" ry="12" className="fill-surface-foreground/10" />
      <ItemArt it={scaled} A={iso(0, 0)} B={iso(it.w, 0)} C={iso(it.w, it.d)} D={iso(0, it.d)} />
    </svg>
  );
}

export interface IsoRoomProps {
  home: Home; furniture: FurnitureRow[]; hour: number;
  avatar?: { skin: string; outfit: string; gender: string; at: Pt } | null;
  selected?: string | null; placing?: { row: FurnitureRow } | null; activeUid?: string | null;
  onItem?: (row: FurnitureRow) => void; onTile?: (x: number, y: number) => void;
}

export function IsoRoom({ home, furniture, hour, avatar, selected, placing, activeUid, onItem, onTile }: IsoRoomProps) {
  const n = home.size;
  const iso = useMemo(() => makeIso(n), [n]);
  const [hover, setHover] = useState<Pt | null>(null);
  const W = n * TW + PAD * 2, H = n * TH + WALL + PAD * 2 + 10;
  const night = hour >= 19 || hour < 6, dusk = hour >= 17 && hour < 19;
  const sky = night ? "oklch(0.25 0.06 265)" : dusk ? "oklch(0.72 0.13 50)" : hour < 9 ? "oklch(0.82 0.08 70)" : "oklch(0.82 0.08 220)";

  const placed = furniture.filter((r) => r.p && itemById(r.i));
  const others = placing ? placed.filter((r) => r.u !== placing.row.u) : placed;
  const drawables = [
    ...others.map((r) => { const d = itemDims(r); const it = itemById(r.i)!; return { key: r.u, depth: it.shape === "rug" ? -1 : r.x + r.y + d.w + d.d, r }; }),
    ...(avatar ? [{ key: "avatar", depth: avatar.at[0] + avatar.at[1] + 1.5, r: null as FurnitureRow | null }] : []),
  ].sort((a, b) => a.depth - b.depth);

  const ghost = placing && hover ? { ...placing.row, x: hover[0], y: hover[1], p: true } : null;
  const ghostOk = ghost ? fits(furniture, n, ghost) : false;

  const wallR = [iso(0, 0), iso(n, 0), up(iso(n, 0), WALL), up(iso(0, 0), WALL)];
  const wallL = [iso(0, n), iso(0, 0), up(iso(0, 0), WALL), up(iso(0, n), WALL)];
  const win = (t0: number, t1: number) => [lerp(iso(0, 0), iso(n, 0), t0), lerp(iso(0, 0), iso(n, 0), t1)].flatMap((p) => [up(p, 35), up(p, 90)]);
  const w = win(0.35, 0.6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full touch-manipulation select-none" role="img" aria-label={`${home.name} interior`}>
      <polygon points={pts(wallL)} style={{ fill: shade(home.wall, 85) }} />
      <polygon points={pts(wallR)} style={{ fill: home.wall }} />
      <polygon points={pts([w[0]!, w[2]!, w[3]!, w[1]!])} style={{ fill: sky, stroke: shade(home.wall, 60) }} strokeWidth="4" />
      {night && <circle cx={lerp(w[0]!, w[2]!, 0.7)[0]} cy={lerp(w[0]!, w[2]!, 0.7)[1] - 10} r="5" fill="oklch(0.95 0.03 90)" />}
      <line x1={lerp(w[0]!, w[2]!, 0.5)[0]} y1={lerp(w[0]!, w[2]!, 0.5)[1]} x2={lerp(w[1]!, w[3]!, 0.5)[0]} y2={lerp(w[1]!, w[3]!, 0.5)[1]} style={{ stroke: shade(home.wall, 60) }} strokeWidth="3" />
      <polygon points={pts([iso(0, 0), iso(n, 0), up(iso(n, 0), 6), up(iso(0, 0), 6)])} style={{ fill: shade(home.wall, 55) }} />
      <polygon points={pts([iso(0, n), iso(0, 0), up(iso(0, 0), 6), up(iso(0, n), 6)])} style={{ fill: shade(home.wall, 50) }} />
      {Array.from({ length: n * n }, (_, i) => {
        const x = i % n, y = Math.floor(i / n);
        const inGhost = ghost && x >= ghost.x && y >= ghost.y && x < ghost.x + itemDims(ghost).w && y < ghost.y + itemDims(ghost).d;
        return (
          <polygon key={i} points={pts([iso(x, y), iso(x + 1, y), iso(x + 1, y + 1), iso(x, y + 1)])}
            style={{ fill: inGhost ? (ghostOk ? "oklch(0.7 0.15 150 / 0.75)" : "oklch(0.6 0.2 27 / 0.7)") : (x + y) % 2 ? home.floor : shade(home.floor, 92) }}
            stroke={placing ? "oklch(1 0 0 / 0.35)" : "oklch(0 0 0 / 0.06)"} strokeWidth="1"
            onPointerEnter={() => placing && setHover([x, y])}
            onClick={() => { if (placing) { setHover([x, y]); onTile?.(x, y); } }} />
        );
      })}
      {drawables.map((d) => {
        if (!d.r) {
          const [ax, ay] = avatar!.at; const p = iso(ax + 0.5, ay + 0.5);
          return <g key="avatar" style={{ transform: `translate(${p[0]}px, ${p[1]}px)`, transition: "transform .7s ease-in-out" }}><Figure skin={avatar!.skin} outfit={avatar!.outfit} gender={avatar!.gender} x={0} y={0} scale={0.9} /></g>;
        }
        const r = d.r; const it = itemById(r.i)!; const { w: dw, d: dd } = itemDims(r);
        return (
          <g key={d.key} onClick={(e) => { e.stopPropagation(); if (!placing) onItem?.(r); }} className="cursor-pointer" style={{ filter: selected === r.u ? "drop-shadow(0 0 6px oklch(0.8 0.14 85))" : undefined }}>
            <ItemArt it={it} A={iso(r.x, r.y)} B={iso(r.x + dw, r.y)} C={iso(r.x + dw, r.y + dd)} D={iso(r.x, r.y + dd)} active={activeUid === r.u} />
          </g>
        );
      })}
      {ghost && (() => { const it = itemById(ghost.i)!; const { w: gw, d: gd } = itemDims(ghost); return <g opacity="0.6" pointerEvents="none"><ItemArt it={it} A={iso(ghost.x, ghost.y)} B={iso(ghost.x + gw, ghost.y)} C={iso(ghost.x + gw, ghost.y + gd)} D={iso(ghost.x, ghost.y + gd)} /></g>; })()}
      {night && <rect x="0" y="0" width={W} height={H} fill="oklch(0.2 0.08 265)" opacity="0.22" pointerEvents="none" />}
    </svg>
  );
}
