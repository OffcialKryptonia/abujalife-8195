import { useId, type ReactNode } from "react";
import { outfitById } from "@/game/content";
import { spriteFor } from "@/game/sprites";

/**
 * AbujaLife avatar v2 — original vector Nigerian character with shaded volumes,
 * outlined silhouette and procedural (CSS-transform) animation states.
 * Feet sit at (0,0). A registered sprite sheet (see game/sprites.ts) replaces the vector art transparently.
 */
export type Pose = "idle" | "walk" | "sit" | "sleep" | "eat" | "phone" | "cheer" | "tired" | "sad" | "wash";
/** Friendly aliases for the animation states used across the game. */
export const POSE = { idle: "idle", walk: "walk", sit: "sit", sleep: "sleep", eat: "eat", usePhone: "phone", interact: "wash", happy: "cheer", tired: "tired", sad: "sad" } as const satisfies Record<string, Pose>;
export interface Look { skin: string; gender: string; outfit: string; hair?: string | null | undefined; accessory?: string | null | undefined; face?: string | null | undefined; shoes?: string | null | undefined }

const skinOf = (s: string) => `var(--skin-${["1", "2", "3", "4"].includes(s) ? s : "3"})`;
const mix = (c: string, p: number, w = "black") => `color-mix(in oklch, ${c} ${p}%, ${w})`;
const HAIR = "oklch(0.16 0.012 40)";
const HAIR_HI = "oklch(0.32 0.02 45)";
const GOLD = "var(--gold)";
const OUT = "oklch(0.14 0.02 40 / 0.55)";
const SW = 0.7;
const o0 = (x: number, y: number) => ({ transformOrigin: `${x}px ${y}px` });

interface Seg { s: number; e: number; cls?: string | undefined; eCls?: string | undefined; delay?: string | undefined }

function Hand({ skin, skinD }: { skin: string; skinD: string }) {
  return (
    <g>
      <path d="M-2.9 10.6 Q-3.4 14.6 0 15.2 Q3.4 14.6 2.9 10.6 Z" fill={skin} stroke={OUT} strokeWidth={SW} />
      <ellipse cx="2.6" cy="11.8" rx="1" ry="1.8" fill={skin} stroke={OUT} strokeWidth="0.5" transform="rotate(-20 2.6 11.8)" />
      <path d="M-1.6 14.2 L-1.6 15 M0 14.4 L0 15.2" stroke={skinD} strokeWidth="0.5" />
    </g>
  );
}

function Arm({ seg, sleeve, short, skin, skinD, prop, watch, wide, uid }: { seg: Seg; sleeve: string; short: boolean; skin: string; skinD: string; prop?: ReactNode; watch?: boolean; wide?: string | undefined; uid: string }) {
  const upper = short ? `url(#sk${uid})` : sleeve;
  return (
    <g transform={`rotate(${seg.s})`}>
      <g className={seg.cls} style={{ ...o0(0, 0), animationDelay: seg.delay }}>
        {wide && <path d="M-3.5 -2 Q-8 8 -6 17 L5.5 15 Q5.5 4 3.5 -2 Z" fill={wide} stroke={OUT} strokeWidth={SW} />}
        <path d="M-3 -1 Q-3.2 7 -2.5 13 L2.5 13 Q3.2 7 3 -1 Q0 -3.4 -3 -1Z" fill={upper} stroke={OUT} strokeWidth={SW} />
        {short && <path d="M-3.4 -1.6 Q-3.6 3 -3.2 6 L3.2 6 Q3.6 3 3.4 -1.6 Q0 -4 -3.4 -1.6Z" fill={sleeve} stroke={OUT} strokeWidth={SW} />}
        <path d="M1.2 0 Q2 6 1.6 12" stroke="black" strokeOpacity="0.14" strokeWidth="1.6" fill="none" />
        <g transform={`translate(0 12) rotate(${seg.e})`}>
          <g className={seg.eCls} style={o0(0, 0)}>
            <path d="M-2.6 -0.6 Q-2.6 6 -2.1 11 L2.1 11 Q2.6 6 2.6 -0.6Z" fill={short ? `url(#sk${uid})` : sleeve} stroke={OUT} strokeWidth={SW} />
            {!short && <path d="M-2.7 8.2 L2.7 8.2 L2.4 10 L-2.4 10Z" fill={mix(typeof sleeve === "string" && !sleeve.startsWith("url") ? sleeve : "oklch(0.5 0.05 60)", 80)} />}
            {watch && <rect x="-2.8" y="9.2" width="5.6" height="2" rx="0.8" fill={GOLD} stroke={OUT} strokeWidth="0.4" />}
            <Hand skin={skin} skinD={skinD} />
            {prop}
          </g>
        </g>
      </g>
    </g>
  );
}

function Leg({ hip, knee, cls, delay, fill, shoe, kind = "loafers", skin }: { hip: number; knee: number; cls?: string | undefined; delay?: string; fill: string; shoe: string; kind?: string; skin: string }) {
  return (
    <g transform={`rotate(${hip})`}>
      <g className={cls} style={{ ...o0(0, 0), animationDelay: delay }}>
        <path d="M-3.4 -1 Q-3.4 7 -2.9 13 L2.9 13 Q3.4 7 3.4 -1Z" fill={fill} stroke={OUT} strokeWidth={SW} />
        <g transform={`translate(0 12) rotate(${knee})`}>
          <path d="M-2.9 -0.5 Q-2.8 6 -2.5 11.2 L2.5 11.2 Q2.8 6 2.9 -0.5Z" fill={fill} stroke={OUT} strokeWidth={SW} />
          <path d="M1.4 0 L1.2 10.5" stroke="black" strokeOpacity="0.15" strokeWidth="1.4" />
          {(kind === "palm" || kind === "heels") && <rect x="-2.2" y="10" width="4.4" height="2.4" fill={skin} />}
          {kind === "boots" && <path d="M-3.1 6 L3.1 6 L3.1 11 L-3.1 11Z" fill={shoe} stroke={OUT} strokeWidth={SW} />}
          {/* shoe */}
          <path d={kind === "heels" ? "M-2.6 10.6 Q-3 12.6 -1.6 13.2 L5.2 13.6 Q5.8 12.8 4 11.6 L2.6 10.6Z" : "M-3 10.4 Q-3.6 13.4 -2.4 13.8 L5.6 13.8 Q6.6 12.6 4.6 11.4 L2.8 10.4Z"} fill={shoe} stroke={OUT} strokeWidth={SW} />
          {kind !== "heels" && <rect x="-2.8" y="13.4" width="8.6" height="1.3" rx="0.6" fill={kind === "sneakers" ? "oklch(0.98 0 0)" : "oklch(0.15 0.02 40)"} stroke={OUT} strokeWidth="0.4" />}
          {kind === "heels" && <rect x="-2.4" y="13" width="1.2" height="2.8" fill={shoe} />}
          {kind === "sneakers" && <path d="M-1.6 12.2 L4 12.2 M0 11 L1.2 12.2" stroke="var(--gold)" strokeWidth="0.8" />}
          {kind === "palm" && <path d="M-2.6 11.6 Q1.4 9.6 5 11.6" stroke="oklch(0.55 0.12 40)" strokeWidth="1.7" fill="none" />}
          <path d="M-1.6 11.2 Q1 10.8 3 11.4" stroke="white" strokeOpacity="0.25" strokeWidth="0.6" fill="none" />
        </g>
      </g>
    </g>
  );
}

const ARMS: Record<Pose, { r: Seg; l: Seg }> = {
  idle: { r: { s: -7, e: 10 }, l: { s: -7, e: 10 } },
  walk: { r: { s: 0, e: 14, cls: "pc-arm" }, l: { s: 0, e: 14, cls: "pc-arm", delay: "-0.35s" } },
  sit: { r: { s: 20, e: 55 }, l: { s: 20, e: 55 } },
  sleep: { r: { s: 4, e: 0 }, l: { s: 4, e: 0 } },
  eat: { r: { s: -45, e: 120, eCls: "pc-eat" }, l: { s: 25, e: 70 } },
  phone: { r: { s: -20, e: 140 }, l: { s: 22, e: 85 } },
  cheer: { r: { s: -160, e: -12, cls: "pc-wave" }, l: { s: -160, e: -12, cls: "pc-wave", delay: "-0.3s" } },
  tired: { r: { s: 2, e: 2 }, l: { s: 2, e: 2 } },
  sad: { r: { s: 8, e: 30 }, l: { s: 8, e: 30 } },
  wash: { r: { s: -30, e: 125, eCls: "pc-scrub" }, l: { s: -30, e: 125, eCls: "pc-scrub", delay: "-0.25s" } },
};

function SpriteFigure({ look, pose }: { look: Look; pose: Pose }) {
  const s = spriteFor(look.gender, look.outfit)!;
  const p = s.poses[pose] ?? s.poses.idle!;
  const k = s.height / s.frameH;
  return (
    <g transform={`scale(${k}) translate(${-s.anchor[0]} ${-s.anchor[1]})`}>
      <svg width={s.frameW} height={s.frameH} viewBox={`0 0 ${s.frameW} ${s.frameH}`} overflow="hidden">
        <image href={s.url} x="0" y={-p.row * s.frameH} width={s.frameW * p.frames} height={s.frameH * 20}
          style={{ animation: `pc-sprite ${p.frames / p.fps}s steps(${p.frames}) infinite`, ["--sprite-w" as string]: `${-s.frameW * p.frames}px` }} />
      </svg>
    </g>
  );
}

export function PlayerCharacter({ look, pose = "idle", x = 0, y = 0, scale = 1 }: { look: Look; pose?: Pose; x?: number; y?: number; scale?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const P = pose;
  if (spriteFor(look.gender, look.outfit)) {
    return <g transform={`translate(${x} ${y}) scale(${scale})`}><ellipse rx="13" ry="4.6" fill="black" opacity="0.24" /><SpriteFigure look={look} pose={P} /></g>;
  }
  const skin = skinOf(look.skin);
  const skinD = mix(skin, 76);
  const skinL = mix(skin, 82, "white");
  const o = outfitById(look.outfit);
  const cloth = o.color;
  const clothD = mix(cloth, 70);
  const clothL = mix(cloth, 80, "white");
  const fem = look.gender === "female";
  const hair = look.hair ?? (fem ? "braids" : "fade");
  const acc = look.accessory ?? "none";
  const robe = ["agbada", "kaftan", "senator"].includes(o.id);
  const wrapper = fem && ["ankara", "asooke", "kaftan"].includes(o.id);
  const patterned = o.id === "ankara" || o.id === "asooke";
  const topFill = patterned ? `url(#pat${uid})` : `url(#cl${uid})`;
  const trouserBase = o.id === "street" ? "oklch(0.42 0.08 255)" : o.id === "corporate" ? cloth : robe ? mix(cloth, 82) : patterned ? cloth : "oklch(0.26 0.02 250)";
  const trousers = patterned ? `url(#pat${uid})` : trouserBase;
  const face = look.face ?? "calm";
  const shoeKind = look.shoes ?? (o.id === "street" ? "sneakers" : "loafers");
  const shoe = { sneakers: "oklch(0.95 0.01 90)", loafers: "oklch(0.34 0.07 45)", palm: "oklch(0.4 0.09 40)", heels: "oklch(0.22 0.04 20)", boots: "oklch(0.3 0.045 50)" }[shoeKind] ?? "oklch(0.22 0.025 40)";
  const lowered = P === "sit" ? 11 : 0;
  const armsFront = P === "eat" || P === "phone" || P === "cheer" || P === "wash";
  const headTilt = P === "phone" ? 10 : P === "tired" ? 14 : P === "sad" ? 11 : P === "cheer" ? -6 : 0;
  const slump = P === "tired" ? 5 : P === "sad" ? 2 : 0;
  const arms = ARMS[P];
  const legsSit = P === "sit";
  const walk = P === "walk";
  const bodyCls = walk ? "pc-bob" : P === "cheer" ? "pc-jump" : P === "tired" ? "pc-sway" : undefined;
  const hem = legsSit ? 18 : 9;
  const torsoPath = robe
    ? `M-10 -53.5 Q-13 -50 -12.4 -44 Q-12.6 -30 -${o.id === "agbada" ? 15 : 12.5} -${hem} Q0 -${hem - 2} ${o.id === "agbada" ? 15 : 12.5} -${hem} Q12.6 -30 12.4 -44 Q13 -50 10 -53.5 Q0 -56.5 -10 -53.5Z`
    : fem
      ? "M-8.6 -53.5 Q-11.4 -51 -10.6 -46 Q-10.4 -42 -7.8 -39 Q-9.8 -32 -9.4 -25 Q0 -24 9.4 -25 Q9.8 -32 7.8 -39 Q10.4 -42 10.6 -46 Q11.4 -51 8.6 -53.5 Q0 -56.5 -8.6 -53.5Z"
      : "M-10 -53.5 Q-12.8 -51 -12 -45 Q-11.4 -36 -9.9 -25 Q0 -24 9.9 -25 Q11.4 -36 12 -45 Q12.8 -51 10 -53.5 Q0 -56.5 -10 -53.5Z";
  const lip = mix(skin, 62, "oklch(0.42 0.12 15)");
  const mouth = P === "cheer" ? <><path d="M-3.4 -59.8 Q0 -54.8 3.4 -59.8 Z" fill="oklch(0.28 0.08 20)" /><path d="M-2.6 -59.6 L2.6 -59.6 L2.2 -58.6 L-2.2 -58.6Z" fill="white" /></>
    : P === "eat" ? <ellipse cx="0" cy="-58.8" rx="1.8" ry="1.4" className="pc-chew" style={o0(0, -58.8)} fill="oklch(0.3 0.08 20)" />
    : P === "sad" || P === "tired" ? <path d="M-2.6 -58.4 Q0 -60.2 2.6 -58.4" stroke={lip} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    : <><path d="M-3 -59.4 Q-1.5 -60.4 0 -59.8 Q1.5 -60.4 3 -59.4 Q0 -59 -3 -59.4Z" fill={lip} /><path d="M-2.8 -59.3 Q0 -57 2.8 -59.3 Q0 -58.6 -2.8 -59.3Z" fill={mix(lip, 85, "white")} /></>;
  const closed = P === "sleep";
  const halfLid = P === "tired";
  const ex = 3.7, ey = -65.6;

  const armShort = o.id === "street";
  const wide = o.id === "agbada" ? `url(#cl${uid})` : undefined;
  const armL = <g transform="translate(-10.4 -51) scale(-1 1)"><Arm uid={uid} seg={arms.l} sleeve={topFill} short={armShort} skin={`url(#sk${uid})`} skinD={skinD} wide={wide}
    prop={P === "eat" ? <g transform="translate(0 15)"><path d="M-6.5 -1 L6.5 -1 Q5.5 5 0 5 Q-5.5 5 -6.5 -1Z" fill="oklch(0.94 0.02 85)" stroke={OUT} strokeWidth="0.5" /><ellipse cx="0" cy="-1" rx="6.5" ry="1.7" fill="oklch(0.62 0.17 40)" /><circle cx="-2" cy="-1.6" r="1.2" fill="oklch(0.9 0.05 90)" /></g> : null} /></g>;
  const armR = <g transform="translate(10.4 -51)"><Arm uid={uid} seg={arms.r} sleeve={topFill} short={armShort} skin={`url(#sk${uid})`} skinD={skinD} watch={acc === "watch"} wide={wide}
    prop={P === "phone" ? <g transform="translate(0 12.5) rotate(-30)"><rect x="-3.2" y="-5.4" width="6.4" height="10.8" rx="1.5" fill="oklch(0.16 0.02 250)" stroke={OUT} strokeWidth="0.4" /><rect x="-2.4" y="-4.4" width="4.8" height="8.4" rx="0.8" fill="oklch(0.8 0.1 200)" className="anim-flicker" /></g>
      : P === "eat" ? <path d="M0 12.5 L0 4 M-1.2 3.5 Q0 1 1.2 3.5" stroke="oklch(0.85 0.01 90)" strokeWidth="1.1" fill="none" /> : null} /></g>;

  const hairCap = "M-10.2 -66 Q-11.2 -79.5 0 -80 Q11.2 -79.5 10.2 -66 Q8.4 -73 0 -74 Q-8.4 -73 -10.2 -66Z";

  const figure = (
    <g transform={`translate(0 ${lowered})`}>
      <g className={bodyCls} style={o0(0, 0)}>
        <defs>
          <pattern id={`pat${uid}`} width="7" height="7" patternUnits="userSpaceOnUse">
            <rect width="7" height="7" fill={cloth} />
            {o.id === "asooke"
              ? <><rect y="0" width="7" height="1.4" fill={clothL} /><rect y="3.5" width="7" height="0.8" fill={clothD} /></>
              : <><circle cx="3.5" cy="3.5" r="1.8" fill="oklch(0.8 0.13 82)" /><circle cx="3.5" cy="3.5" r="0.7" fill="oklch(0.5 0.15 30)" /><circle cx="0" cy="0" r="1.2" fill="oklch(0.4 0.09 180)" /><circle cx="7" cy="7" r="1.2" fill="oklch(0.4 0.09 180)" /></>}
          </pattern>
          <linearGradient id={`cl${uid}`} x1="0" x2="1" y1="0" y2="0.3">
            <stop offset="0" stopColor={clothL} /><stop offset="0.45" stopColor={cloth} /><stop offset="1" stopColor={clothD} />
          </linearGradient>
          <linearGradient id={`sk${uid}`} x1="0" x2="1">
            <stop offset="0" stopColor={skinL} /><stop offset="0.5" stopColor={skin} /><stop offset="1" stopColor={skinD} />
          </linearGradient>
          <radialGradient id={`hd${uid}`} cx="0.38" cy="0.35" r="0.75">
            <stop offset="0" stopColor={skinL} /><stop offset="0.55" stopColor={skin} /><stop offset="1" stopColor={skinD} />
          </radialGradient>
          <linearGradient id={`sh${uid}`} x1="0" x2="1">
            <stop offset="0.5" stopColor="black" stopOpacity="0" /><stop offset="1" stopColor="black" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id={`hr${uid}`} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor={HAIR_HI} /><stop offset="0.5" stopColor={HAIR} />
          </linearGradient>
        </defs>
        {/* legs */}
        <g transform="translate(-3.6 -26)"><Leg hip={legsSit ? -82 : 0} knee={legsSit ? 82 : 0} cls={walk ? "pc-leg" : undefined} delay="-0.35s" fill={patterned ? trousers : mix(trouserBase, 86)} shoe={mix(shoe, 85)} kind={shoeKind} skin={skin} /></g>
        <g transform="translate(3.6 -26)"><Leg hip={legsSit ? -78 : 0} knee={legsSit ? 78 : 0} cls={walk ? "pc-leg" : undefined} fill={trousers} shoe={shoe} kind={shoeKind} skin={skin} /></g>
        {!robe && !wrapper && <path d="M-9.9 -27.5 L9.9 -27.5 L9.7 -25 L-9.7 -25Z" fill={o.id === "corporate" ? "oklch(0.18 0.02 40)" : mix(trouserBase, 70)} stroke={OUT} strokeWidth="0.5" />}
        {wrapper && !legsSit && <><path d="M-9.5 -31 L9.5 -31 L11.8 -4 Q0 -2 -11.8 -4Z" fill={topFill} stroke={OUT} strokeWidth={SW} /><path d="M-9.5 -31 L9.5 -31 L11.8 -4 Q0 -2 -11.8 -4Z" fill={`url(#sh${uid})`} /><path d="M-3 -30 Q-2 -17 -5 -4" stroke={clothD} strokeWidth="0.7" fill="none" /></>}
        <g transform={`rotate(${slump} 0 -26)`}>
          <g className={P === "idle" || P === "phone" || P === "sad" ? "pc-breathe" : undefined} style={o0(0, -26)}>
            {!armsFront && armL}
            <path d={torsoPath} fill={topFill} stroke={OUT} strokeWidth={SW} />
            <path d={torsoPath} fill={`url(#sh${uid})`} />
            {/* fabric folds */}
            <path d="M-5 -44 Q-6 -36 -4.5 -28 M5.5 -42 Q6.4 -34 5 -28" stroke={clothD} strokeOpacity="0.55" strokeWidth="0.6" fill="none" />
            {fem && !robe && <path d="M-6 -47 Q-3 -43.5 0 -46 Q3 -43.5 6 -47" stroke={clothD} strokeOpacity="0.5" strokeWidth="0.6" fill="none" />}
            {o.id === "corporate" && <><path d="M-4.4 -54 L0 -43 L4.4 -54Z" fill="oklch(0.97 0.005 90)" /><path d="M-1 -51 L1 -51 L1.7 -40 L0 -37.5 L-1.7 -40Z" fill={GOLD} /><path d="M-4.6 -53.6 L-1.4 -40 L-6 -46Z M4.6 -53.6 L1.4 -40 L6 -46Z" fill={clothD} /><circle cx="0" cy="-33" r="0.7" fill={GOLD} /><circle cx="0" cy="-29.5" r="0.7" fill={GOLD} /></>}
            {(o.id === "senator" || o.id === "agbada" || o.id === "kaftan") && <><path d="M-4 -54 Q0 -49.5 4 -54" stroke={GOLD} strokeWidth="1.2" fill="none" /><path d="M0 -50 L0 -32" stroke={GOLD} strokeWidth="1" strokeDasharray="1.5 1.5" /><path d="M-3.5 -48 Q-6 -44 -4.5 -40 M3.5 -48 Q6 -44 4.5 -40" stroke={GOLD} strokeOpacity="0.6" strokeWidth="0.6" fill="none" /></>}
            {o.id === "agbada" && <path d="M-7 -47 Q0 -37 7 -47 Q4 -42 0 -40.5 Q-4 -42 -7 -47Z" fill={GOLD} opacity="0.85" />}
            {o.id === "street" && <><path d="M-4 -54 Q0 -50.6 4 -54" stroke={clothD} strokeWidth="1.4" fill="none" /><rect x="-3.4" y="-46" width="6.8" height="4.4" rx="1" fill={GOLD} opacity="0.9" /><path d="M-2 -44 L2 -44" stroke={clothD} strokeWidth="0.6" /></>}
            {!armsFront && armR}
            {/* neck */}
            <path d="M-2.9 -59 L-3.2 -52.6 Q0 -51 3.2 -52.6 L2.9 -59Z" fill={skinD} stroke={OUT} strokeWidth="0.5" />
            {acc === "chain" && <><path d="M-5 -53.5 Q0 -44.5 5 -53.5" stroke={GOLD} strokeWidth="1.3" fill="none" /><circle cx="0" cy="-47.6" r="1.4" fill={GOLD} /></>}
            {acc === "beads" && [-5, -3.2, -1.1, 1.1, 3.2, 5].map((bx, i) => <circle key={i} cx={bx} cy={-53 + Math.abs(bx) * -0.25 + 2.6} r="1.2" fill="oklch(0.6 0.19 30)" stroke={OUT} strokeWidth="0.3" />)}
            {/* head */}
            <g transform={`rotate(${headTilt} 0 -57)`}>
              <g className={P === "idle" || P === "sad" ? "pc-head" : undefined} style={o0(0, -57)}>
                {hair === "afro" && <><circle cx="0" cy="-71" r="15" fill={`url(#hr${uid})`} stroke={OUT} strokeWidth={SW} />{[[-7, -80], [5, -82], [9, -72], [-10, -70]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.2" fill={HAIR_HI} opacity="0.35" />)}</>}
                {hair === "locs" && [-11.5, -9.5, 9.5, 11.5, -7, 7].map((lx, i) => <rect key={i} x={lx - 1.4} y="-73" width="2.8" height={i > 3 ? 14 : 20} rx="1.4" fill={i % 2 ? HAIR_HI : HAIR} stroke={OUT} strokeWidth="0.4" />)}
                {hair === "braids" && [-1, 1].map((sd) => <g key={sd}><path d={`M${sd * 9.6} -70 Q${sd * 11.5} -58 ${sd * 10.4} -46`} stroke={HAIR} strokeWidth="3.2" fill="none" strokeLinecap="round" /><path d={`M${sd * 9.6} -66 l${sd * 1.6} 1.6 M${sd * 10.2} -60 l${sd * 1.6} 1.6 M${sd * 10.4} -54 l${sd * 1.6} 1.6`} stroke={HAIR_HI} strokeWidth="0.6" /><circle cx={sd * 10.4} cy="-45.4" r="1" fill={GOLD} /></g>)}
                {hair === "bun" && <circle cx="0" cy="-81" r="5.8" fill={`url(#hr${uid})`} stroke={OUT} strokeWidth={SW} />}
                {/* ears */}
                {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 9.8} cy="-65" rx="2.2" ry="3" fill={skinD} stroke={OUT} strokeWidth="0.5" /><path d={`M${sd * 9.9} -66.4 q${sd * 0.9} 1.4 0 2.8`} stroke={mix(skin, 60)} strokeWidth="0.6" fill="none" /></g>)}
                {acc === "earrings" && <><circle cx="-10" cy="-61.4" r="1.5" fill={GOLD} stroke={OUT} strokeWidth="0.3" /><circle cx="10" cy="-61.4" r="1.5" fill={GOLD} stroke={OUT} strokeWidth="0.3" /></>}
                {/* face shape with jaw + chin */}
                <path d="M-9.4 -67.5 Q-9.8 -78 0 -78 Q9.8 -78 9.4 -67.5 Q9.2 -60.5 5.2 -56.8 Q2.6 -54.8 0 -54.8 Q-2.6 -54.8 -5.2 -56.8 Q-9.2 -60.5 -9.4 -67.5Z" fill={`url(#hd${uid})`} stroke={OUT} strokeWidth={SW} />
                <path d="M4 -58 Q7.6 -61 8.4 -66" stroke="black" strokeOpacity="0.12" strokeWidth="2.2" fill="none" />
                {/* eyes */}
                {closed
                  ? <path d={`M${-ex - 1.8} ${ey} q1.8 1.5 3.6 0 M${ex - 1.8} ${ey} q1.8 1.5 3.6 0`} stroke="oklch(0.18 0.02 40)" strokeWidth="1" fill="none" strokeLinecap="round" />
                  : <g className="pc-blink" style={o0(0, ey)}>
                      {[-ex, ex].map((cx) => <g key={cx}>
                        <ellipse cx={cx} cy={ey} rx="2.1" ry="1.55" fill="oklch(0.97 0.01 90)" stroke={OUT} strokeWidth="0.35" />
                        <circle cx={cx + 0.25} cy={ey + 0.05} r="1.25" fill="oklch(0.28 0.05 45)" />
                        <circle cx={cx + 0.25} cy={ey + 0.05} r="0.7" fill="oklch(0.1 0.01 40)" />
                        <circle cx={cx + 0.7} cy={ey - 0.5} r="0.42" fill="white" />
                        <path d={`M${cx - 2.3} ${ey - 0.6} Q${cx} ${ey - 2.4} ${cx + 2.3} ${ey - 0.6}`} stroke="oklch(0.12 0.02 40)" strokeWidth={fem ? 0.95 : 0.7} fill="none" strokeLinecap="round" />
                        {fem && <path d={`M${cx + (cx > 0 ? 2.2 : -2.2)} ${ey - 0.7} l${cx > 0 ? 0.9 : -0.9} -0.8`} stroke="oklch(0.12 0.02 40)" strokeWidth="0.6" />}
                      </g>)}
                      {face === "bright" && <path d="M-6 -67.6 l-0.8 -0.9 M6 -67.6 l0.8 -0.9" stroke="oklch(0.16 0.02 40)" strokeWidth="0.6" />}
                      {halfLid && <><path d={`M${-ex - 2.3} ${ey - 1.8} L${-ex + 2.3} ${ey - 1.8} L${-ex + 2.3} ${ey + 0.1} Q${-ex} ${ey - 0.6} ${-ex - 2.3} ${ey + 0.1}Z`} fill={skin} /><path d={`M${ex - 2.3} ${ey - 1.8} L${ex + 2.3} ${ey - 1.8} L${ex + 2.3} ${ey + 0.1} Q${ex} ${ey - 0.6} ${ex - 2.3} ${ey + 0.1}Z`} fill={skin} /></>}
                    </g>}
                {/* brows */}
                <path d={P === "sad" || P === "tired" ? "M-6 -69 L-2 -70.4 M2 -70.4 L6 -69" : P === "cheer" ? "M-6 -70.6 Q-4 -72.4 -2 -71 M2 -71 Q4 -72.4 6 -70.6" : "M-6 -69.6 Q-4 -71.2 -1.9 -70.2 M1.9 -70.2 Q4 -71.2 6 -69.6"} stroke={HAIR} strokeWidth={face === "bold" ? 1.9 : fem ? 0.9 : 1.3} fill="none" strokeLinecap="round" />
                {/* nose — broad, soft */}
                <path d="M-0.2 -66 Q0.6 -63.5 0.9 -62.6" stroke={skinL} strokeOpacity="0.6" strokeWidth="0.7" fill="none" />
                <path d="M-2 -62.2 Q-2.6 -61 -1.2 -60.9 Q0 -60.3 1.2 -60.9 Q2.6 -61 2 -62.2" stroke={skinD} strokeWidth="0.9" fill="none" strokeLinecap="round" />
                {mouth}
                {face === "beard" && <path d="M-8.8 -64 Q-8.4 -55.6 0 -54.2 Q8.4 -55.6 8.8 -64 Q6.4 -58 3.6 -58.8 Q0 -57.6 -3.6 -58.8 Q-6.4 -58 -8.8 -64Z M-3.4 -60.6 Q0 -61.8 3.4 -60.6 L3 -60 Q0 -61 -3 -60Z" fill={HAIR} opacity="0.92" />}
                {face === "dimples" && <><path d="M-5 -59.6 q0.4 0.8 0 1.4 M5 -59.6 q-0.4 0.8 0 1.4" stroke={skinD} strokeWidth="0.6" fill="none" /></>}
                {(P === "cheer" || fem) && <><ellipse cx="-6" cy="-61.6" rx="1.8" ry="1.1" fill="oklch(0.6 0.15 20)" opacity={P === "cheer" ? 0.35 : 0.18} /><ellipse cx="6" cy="-61.6" rx="1.8" ry="1.1" fill="oklch(0.6 0.15 20)" opacity={P === "cheer" ? 0.35 : 0.18} /></>}
                {/* hair front */}
                {hair === "fade" && <><path d="M-9.8 -67 Q-11 -78.6 0 -79 Q11 -78.6 9.8 -67 Q9.4 -71.6 6.2 -72.8 Q0 -74.4 -6.2 -72.8 Q-9.4 -71.6 -9.8 -67Z" fill={`url(#hr${uid})`} stroke={OUT} strokeWidth="0.5" /><path d="M-9.4 -67 L-9.6 -64 M9.4 -67 L9.6 -64" stroke={HAIR} strokeOpacity="0.5" strokeWidth="1.4" /><path d="M-4 -77 Q0 -78 4 -77" stroke={HAIR_HI} strokeWidth="0.6" fill="none" /></>}
                {hair === "low" && <path d="M-9.6 -68 Q-9 -78.4 0 -78.6 Q9 -78.4 9.6 -68 Q0 -74 -9.6 -68Z" fill={HAIR} opacity="0.7" />}
                {hair === "afro" && <path d="M-10.2 -65 Q-9 -74.5 0 -75.5 Q9 -74.5 10.2 -65 Q7 -71.4 0 -72 Q-7 -71.4 -10.2 -65Z" fill={`url(#hr${uid})`} />}
                {(hair === "locs" || hair === "bun" || hair === "braids") && <path d={hairCap} fill={`url(#hr${uid})`} stroke={OUT} strokeWidth="0.5" />}
                {hair === "braids" && [-6, -2, 2, 6].map((bx) => <path key={bx} d={`M${bx * 0.8} -79 Q${bx} -76 ${bx * 1.25} -72.6`} stroke={HAIR_HI} strokeWidth="0.7" fill="none" />)}
                {hair === "gele" && <><path d="M-12.5 -66 Q-17 -80 -4 -86 Q7 -91 16 -80 Q17.5 -72 12.5 -66 Q0 -72.5 -12.5 -66Z" fill={o.id === "asooke" ? cloth : GOLD} stroke={OUT} strokeWidth={SW} /><path d="M-8 -74 Q2 -84 13 -77 M-5 -69.5 Q4 -78 12 -71 M-10 -79 Q-2 -86 6 -85" stroke={mix(o.id === "asooke" ? cloth : "oklch(0.78 0.13 82)", 68)} strokeWidth="1.1" fill="none" /><path d="M13 -82 Q22 -88 19 -76 Z" fill={o.id === "asooke" ? clothD : mix("oklch(0.78 0.13 82)", 80)} stroke={OUT} strokeWidth="0.5" /></>}
                {acc === "fila" && <><path d="M-10.4 -70 Q-10 -82 2 -82 Q11.4 -81 10.4 -70 Q0 -73.6 -10.4 -70Z" fill={`url(#cl${uid})`} stroke={OUT} strokeWidth={SW} /><path d="M-9 -73 Q0 -76 9.5 -73" stroke={GOLD} strokeWidth="0.8" fill="none" /></>}
                {acc === "glasses" && <g stroke="oklch(0.14 0.01 40)" strokeWidth="0.9" fill="oklch(0.8 0.05 220 / 0.22)"><rect x="-6.8" y="-67.8" width="5.6" height="4.4" rx="1.6" /><rect x="1.2" y="-67.8" width="5.6" height="4.4" rx="1.6" /><path d="M-1.2 -66 L1.2 -66 M-6.8 -66.6 L-9.4 -67.4 M6.8 -66.6 L9.4 -67.4" /></g>}
              </g>
            </g>
            {armsFront && armL}
            {armsFront && armR}
          </g>
        </g>
      </g>
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx={P === "sleep" ? 30 : 14} ry={P === "sleep" ? 6 : 4.8} fill="black" opacity="0.28" className={walk ? "pc-shadow" : undefined} />
      {P === "sleep"
        ? <g transform="translate(0 34) rotate(-90 0 -40)">
            {figure}
            <rect x="-14" y="-40" width="28" height="42" rx="7" fill="oklch(0.88 0.04 85)" stroke={OUT} strokeWidth={SW} />
            <rect x="-14" y="-40" width="28" height="5" rx="2.5" fill="oklch(0.95 0.02 85)" />
            <path d="M-10 -28 Q0 -25 10 -28 M-10 -16 Q0 -13 10 -16" stroke="oklch(0.75 0.04 85)" strokeWidth="0.7" fill="none" />
          </g>
        : figure}
      {P === "sleep" && [0, 1, 2].map((i) => <text key={i} x={-22 + i * 5} y={-44 - i * 6} className="pc-zzz font-display" style={{ animationDelay: `${i * 0.6}s`, fill: "var(--surface-foreground)" }} fontSize={7 + i * 2} fontWeight="700">z</text>)}
      {P === "wash" && [[-14, -60], [13, -70], [-9, -82], [16, -52], [0, -88]].map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r={2 + (i % 3)} fill="oklch(0.95 0.03 220 / 0.6)" stroke="oklch(1 0 0 / 0.8)" strokeWidth="0.6" className="pc-bubble" style={{ animationDelay: `${i * 0.25}s` }} />)}
      {P === "cheer" && [[-18, -84], [18, -88], [0, -98]].map(([sx, sy], i) => <path key={i} d={`M${sx} ${sy! - 4} L${sx! + 1.2} ${sy! - 1.2} L${sx! + 4} ${sy} L${sx! + 1.2} ${sy! + 1.2} L${sx} ${sy! + 4} L${sx! - 1.2} ${sy! + 1.2} L${sx! - 4} ${sy} L${sx! - 1.2} ${sy! - 1.2}Z`} fill={GOLD} className="pc-spark" style={{ animationDelay: `${i * 0.2}s`, transformBox: "fill-box", transformOrigin: "center" }} />)}
      {P === "tired" && <text x="8" y="-84" fontSize="9" className="pc-zzz" style={{ fill: "var(--surface-foreground)" }}>…</text>}
    </g>
  );
}

/** Standalone avatar preview (HTML), e.g. for the wardrobe or profile. */
export function CharacterPortrait({ look, pose = "idle", size = 160, className }: { look: Look; pose?: Pose; size?: number; className?: string }) {
  return (
    <svg viewBox="-40 -105 80 112" width={size} height={size * 1.4} className={className} aria-label="Your character">
      <PlayerCharacter look={look} pose={pose} />
    </svg>
  );
}
