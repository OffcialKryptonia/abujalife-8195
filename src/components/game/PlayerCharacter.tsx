import { useId, type ReactNode } from "react";
import { outfitById } from "@/game/content";

/** Original AbujaLife stylised character, drawn in SVG with CSS-driven poses. Feet sit at (0,0). */
export type Pose = "idle" | "walk" | "sit" | "sleep" | "eat" | "phone" | "cheer" | "tired" | "sad" | "wash";
export interface Look { skin: string; gender: string; outfit: string; hair?: string | null | undefined; accessory?: string | null | undefined }

const skinOf = (s: string) => `var(--skin-${["1", "2", "3", "4"].includes(s) ? s : "3"})`;
const mix = (c: string, p: number, w = "black") => `color-mix(in oklch, ${c} ${p}%, ${w})`;
const HAIR = "oklch(0.17 0.012 40)";
const HAIR_HI = "oklch(0.3 0.02 45)";
const GOLD = "var(--gold)";
const o0 = (x: number, y: number) => ({ transformOrigin: `${x}px ${y}px` });

interface Seg { s: number; e: number; cls?: string | undefined; eCls?: string | undefined; delay?: string | undefined }

function Arm({ seg, sleeve, short, skin, prop, watch, wide }: { seg: Seg; sleeve: string; short: boolean; skin: string; prop?: ReactNode; watch?: boolean; wide?: string | undefined }) {
  return (
    <g transform={`rotate(${seg.s})`}>
      <g className={seg.cls} style={{ ...o0(0, 0), animationDelay: seg.delay }}>
        {wide && <path d="M-3 -2 Q-7 8 -5 16 L5 14 Q5 4 3 -2 Z" fill={wide} />}
        <rect x="-2.7" y="-1.5" width="5.4" height="14" rx="2.7" fill={short ? skin : sleeve} />
        {short && <rect x="-3" y="-1.5" width="6" height="6.5" rx="2.6" fill={sleeve} />}
        <g transform={`translate(0 12) rotate(${seg.e})`}>
          <g className={seg.eCls} style={o0(0, 0)}>
            <rect x="-2.4" y="-1" width="4.8" height="12.5" rx="2.4" fill={short ? skin : sleeve} />
            {!short && <rect x="-2.4" y="8.5" width="4.8" height="3" rx="1.5" fill={skin} />}
            {watch && <rect x="-2.7" y="8" width="5.4" height="2" rx="0.8" fill={GOLD} />}
            <circle cx="0" cy="12.3" r="3" fill={skin} />
            {prop}
          </g>
        </g>
      </g>
    </g>
  );
}

function Leg({ hip, knee, cls, delay, fill, shoe }: { hip: number; knee: number; cls?: string | undefined; delay?: string; fill: string; shoe: string }) {
  return (
    <g transform={`rotate(${hip})`}>
      <g className={cls} style={{ ...o0(0, 0), animationDelay: delay }}>
        <rect x="-2.8" y="-1" width="5.6" height="13.5" rx="2.6" fill={fill} />
        <g transform={`translate(0 12) rotate(${knee})`}>
          <rect x="-2.6" y="-1" width="5.2" height="13" rx="2.4" fill={fill} />
          <ellipse cx="1.4" cy="13" rx="4" ry="2.3" fill={shoe} />
        </g>
      </g>
    </g>
  );
}

const ARMS: Record<Pose, { r: Seg; l: Seg }> = {
  idle: { r: { s: -6, e: 8 }, l: { s: -6, e: 8 } },
  walk: { r: { s: 0, e: 12, cls: "pc-arm" }, l: { s: 0, e: 12, cls: "pc-arm", delay: "-0.35s" } },
  sit: { r: { s: 18, e: 55 }, l: { s: 18, e: 55 } },
  sleep: { r: { s: 4, e: 0 }, l: { s: 4, e: 0 } },
  eat: { r: { s: -45, e: 120, eCls: "pc-eat" }, l: { s: 25, e: 70 } },
  phone: { r: { s: -20, e: 140 }, l: { s: 22, e: 85 } },
  cheer: { r: { s: -160, e: -12, cls: "pc-wave" }, l: { s: -160, e: -12, cls: "pc-wave", delay: "-0.3s" } },
  tired: { r: { s: 2, e: 2 }, l: { s: 2, e: 2 } },
  sad: { r: { s: 8, e: 30 }, l: { s: 8, e: 30 } },
  wash: { r: { s: -30, e: 125, eCls: "pc-scrub" }, l: { s: -30, e: 125, eCls: "pc-scrub", delay: "-0.25s" } } as { r: Seg; l: Seg },
};

export function PlayerCharacter({ look, pose = "idle", x = 0, y = 0, scale = 1 }: { look: Look; pose?: Pose; x?: number; y?: number; scale?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const skin = skinOf(look.skin);
  const skinD = mix(skin, 78);
  const o = outfitById(look.outfit);
  const cloth = o.color;
  const clothD = mix(cloth, 70);
  const fem = look.gender === "female";
  const hair = look.hair ?? (fem ? "braids" : "fade");
  const acc = look.accessory ?? "none";
  const P = pose;
  const robe = ["agbada", "kaftan", "senator"].includes(o.id);
  const wrapper = fem && ["ankara", "asooke", "kaftan"].includes(o.id);
  const patterned = o.id === "ankara" || o.id === "asooke";
  const topFill = patterned ? `url(#pat${uid})` : cloth;
  const trousers = o.id === "street" ? "oklch(0.4 0.08 255)" : o.id === "corporate" ? cloth : robe ? mix(cloth, 82) : patterned ? `url(#pat${uid})` : "oklch(0.25 0.02 250)";
  const shoe = o.id === "street" ? "oklch(0.95 0.01 90)" : "oklch(0.22 0.025 40)";
  const lowered = P === "sit" ? 11 : 0;
  const armsFront = P === "eat" || P === "phone" || P === "cheer" || P === "wash";
  const headTilt = P === "phone" ? 9 : P === "tired" ? 14 : P === "sad" ? 11 : 0;
  const slump = P === "tired" ? 5 : P === "sad" ? 2 : 0;
  const arms = ARMS[P];
  const legsSit = P === "sit";
  const walk = P === "walk";
  const bodyCls = walk ? "pc-bob" : P === "cheer" ? "pc-jump" : P === "tired" ? "pc-sway" : undefined;
  const torsoPath = robe
    ? `M-10.5 -53 Q-12.5 -34 -${o.id === "agbada" ? 15 : 12.5} -${legsSit ? 18 : 9} L${o.id === "agbada" ? 15 : 12.5} -${legsSit ? 18 : 9} Q12.5 -34 10.5 -53 Q0 -56 -10.5 -53Z`
    : fem
      ? "M-9 -53 Q-10.5 -46 -7.6 -39 Q-9.8 -32 -9.2 -25 L9.2 -25 Q9.8 -32 7.6 -39 Q10.5 -46 9 -53 Q0 -56 -9 -53Z"
      : "M-10.5 -53 Q-11.5 -40 -9.8 -25 L9.8 -25 Q11.5 -40 10.5 -53 Q0 -56 -10.5 -53Z";
  const mouth = P === "cheer" ? <path d="M-3.6 -60.6 Q0 -55.6 3.6 -60.6 Z" fill="oklch(0.3 0.08 20)" />
    : P === "eat" ? <ellipse cx="0" cy="-59.6" rx="1.8" ry="1.4" className="pc-chew" style={o0(0, -59.6)} fill="oklch(0.3 0.08 20)" />
    : P === "sad" || P === "tired" ? <path d="M-2.8 -59 Q0 -61 2.8 -59" stroke="oklch(0.25 0.04 30)" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    : <path d="M-3 -60.6 Q0 -58 3 -60.6" stroke="oklch(0.25 0.04 30)" strokeWidth="1.1" fill="none" strokeLinecap="round" />;
  const closed = P === "sleep";
  const halfLid = P === "tired";

  const armL = <g transform="translate(-10.6 -51) scale(-1 1)"><Arm seg={arms.l} sleeve={topFill} short={o.id === "street"} skin={skin} wide={o.id === "agbada" ? cloth : undefined}
    prop={P === "eat" ? <g transform="translate(0 14)"><path d="M-6 -1 L6 -1 Q5 5 0 5 Q-5 5 -6 -1Z" fill="oklch(0.92 0.02 85)" /><ellipse cx="0" cy="-1" rx="6" ry="1.6" fill="oklch(0.62 0.17 40)" /></g> : null} /></g>;
  const armR = <g transform="translate(10.6 -51)"><Arm seg={arms.r} sleeve={topFill} short={o.id === "street"} skin={skin} watch={acc === "watch"} wide={o.id === "agbada" ? cloth : undefined}
    prop={P === "phone" ? <g transform="translate(0 12) rotate(-30)"><rect x="-3" y="-5" width="6" height="10" rx="1.4" fill="oklch(0.18 0.02 250)" /><rect x="-2.2" y="-4" width="4.4" height="7.6" rx="0.8" fill="oklch(0.8 0.1 200)" className="anim-flicker" /></g>
      : P === "eat" ? <path d="M0 12 L0 4 M-1.2 3.5 Q0 1 1.2 3.5" stroke="oklch(0.85 0.01 90)" strokeWidth="1.1" fill="none" /> : null} /></g>;

  const figure = (
    <g transform={`translate(0 ${lowered})`}>
      <g className={bodyCls} style={o0(0, 0)}>
        <defs>
          <pattern id={`pat${uid}`} width="7" height="7" patternUnits="userSpaceOnUse">
            <rect width="7" height="7" fill={cloth} />
            {o.id === "asooke"
              ? <><rect y="0" width="7" height="1.4" fill={mix(cloth, 70, "white")} /><rect y="3.5" width="7" height="0.8" fill={clothD} /></>
              : <><circle cx="3.5" cy="3.5" r="1.8" fill="oklch(0.8 0.13 82)" /><circle cx="0" cy="0" r="1.2" fill="oklch(0.4 0.09 180)" /><circle cx="7" cy="7" r="1.2" fill="oklch(0.4 0.09 180)" /></>}
          </pattern>
          <linearGradient id={`sh${uid}`} x1="0" x2="1">
            <stop offset="0.45" stopColor="black" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        {/* legs */}
        <g transform="translate(-3.4 -26)"><Leg hip={legsSit ? -82 : 0} knee={legsSit ? 82 : 0} cls={walk ? "pc-leg" : undefined} delay="-0.35s" fill={mix(trousers.startsWith("url") ? cloth : trousers, 88)} shoe={shoe} /></g>
        <g transform="translate(3.4 -26)"><Leg hip={legsSit ? -78 : 0} knee={legsSit ? 78 : 0} cls={walk ? "pc-leg" : undefined} fill={trousers} shoe={shoe} /></g>
        {wrapper && !legsSit && <><path d="M-9.5 -31 L9.5 -31 L11.5 -4 Q0 -2 -11.5 -4Z" fill={topFill} /><path d="M-9.5 -31 L9.5 -31 L11.5 -4 Q0 -2 -11.5 -4Z" fill={`url(#sh${uid})`} /></>}
        <g transform={`rotate(${slump} 0 -26)`}>
          <g className={P === "idle" || P === "phone" || P === "sad" ? "pc-breathe" : undefined} style={o0(0, -26)}>
            {!armsFront && armL}
            <path d={torsoPath} fill={topFill} />
            <path d={torsoPath} fill={`url(#sh${uid})`} />
            {o.id === "corporate" && <><path d="M-4 -53.5 L0 -43 L4 -53.5Z" fill="oklch(0.97 0.005 90)" /><path d="M-1 -51 L1 -51 L1.7 -40 L0 -37.5 L-1.7 -40Z" fill={GOLD} /><path d="M-4 -53 L-1.5 -40 M4 -53 L1.5 -40" stroke={clothD} strokeWidth="1" /></>}
            {(o.id === "senator" || o.id === "agbada" || o.id === "kaftan") && <><path d="M-4 -53.5 Q0 -49 4 -53.5" stroke={GOLD} strokeWidth="1.2" fill="none" /><path d="M0 -50 L0 -34" stroke={GOLD} strokeWidth="1" strokeDasharray="1.5 1.5" /></>}
            {o.id === "agbada" && <path d="M-7 -47 Q0 -38 7 -47 Q4 -42 0 -41 Q-4 -42 -7 -47Z" fill={GOLD} opacity="0.8" />}
            {o.id === "street" && <rect x="-3" y="-46" width="6" height="4" rx="1" fill={GOLD} opacity="0.85" />}
            {!armsFront && armR}
            <rect x="-2.7" y="-58.5" width="5.4" height="6.5" rx="2" fill={skinD} />
            {acc === "chain" && <path d="M-5 -53.5 Q0 -45 5 -53.5" stroke={GOLD} strokeWidth="1.3" fill="none" />}
            {acc === "beads" && [-5, -3.2, -1.1, 1.1, 3.2, 5].map((bx, i) => <circle key={i} cx={bx} cy={-53 + Math.abs(bx) * -0.25 + 2.6} r="1.2" fill="oklch(0.6 0.19 30)" />)}
            {/* head */}
            <g transform={`rotate(${headTilt} 0 -57)`}>
              <g className={P === "idle" || P === "sad" ? "pc-head" : undefined} style={o0(0, -57)}>
                {hair === "afro" && <circle cx="0" cy="-70.5" r="14.5" fill={HAIR} />}
                {hair === "locs" && [-11.5, -9.5, 9.5, 11.5, -7, 7].map((lx, i) => <rect key={i} x={lx - 1.3} y="-73" width="2.6" height={i > 3 ? 14 : 19} rx="1.3" fill={i % 2 ? HAIR_HI : HAIR} />)}
                {hair === "braids" && <><rect x="-11" y="-70" width="3" height="22" rx="1.5" fill={HAIR} /><rect x="8" y="-70" width="3" height="22" rx="1.5" fill={HAIR} /></>}
                {hair === "bun" && <circle cx="0" cy="-80.5" r="5.5" fill={HAIR} />}
                <circle cx="-10.2" cy="-65" r="2.4" fill={skinD} />
                <circle cx="10.2" cy="-65" r="2.4" fill={skinD} />
                {acc === "earrings" && <><circle cx="-10.4" cy="-61.6" r="1.4" fill={GOLD} /><circle cx="10.4" cy="-61.6" r="1.4" fill={GOLD} /></>}
                <ellipse cx="0" cy="-66" rx="10" ry="11" fill={skin} />
                <ellipse cx="3.5" cy="-63" rx="6" ry="7.5" fill="black" opacity="0.07" />
                {/* face */}
                {closed
                  ? <path d="M-5.4 -66 q1.8 1.4 3.6 0 M1.8 -66 q1.8 1.4 3.6 0" stroke="oklch(0.2 0.02 40)" strokeWidth="1" fill="none" />
                  : <g className="pc-blink" style={o0(0, -66)}>
                      <ellipse cx="-3.6" cy="-66" rx="1.35" ry="1.8" fill="oklch(0.16 0.02 40)" />
                      <ellipse cx="3.6" cy="-66" rx="1.35" ry="1.8" fill="oklch(0.16 0.02 40)" />
                      <circle cx="-3.1" cy="-66.6" r="0.45" fill="white" />
                      <circle cx="4.1" cy="-66.6" r="0.45" fill="white" />
                      {halfLid && <><rect x="-5.2" y="-68.2" width="3.2" height="2" fill={skin} /><rect x="2" y="-68.2" width="3.2" height="2" fill={skin} /></>}
                    </g>}
                <path d={P === "sad" || P === "tired" ? "M-5.6 -69.2 L-2 -70.4 M2 -70.4 L5.6 -69.2" : "M-5.6 -70 Q-3.8 -71.4 -2 -70.4 M2 -70.4 Q3.8 -71.4 5.6 -70"} stroke={HAIR} strokeWidth="1.1" fill="none" strokeLinecap="round" />
                <path d="M0.3 -64.6 q1.5 2.2 -0.4 2.8" stroke={skinD} strokeWidth="1" fill="none" />
                {mouth}
                {P === "cheer" && <><circle cx="-6" cy="-62" r="1.6" fill="oklch(0.6 0.15 20)" opacity="0.35" /><circle cx="6" cy="-62" r="1.6" fill="oklch(0.6 0.15 20)" opacity="0.35" /></>}
                {/* hair front */}
                {hair === "fade" && <path d="M-10 -67 Q-11 -77.5 0 -78 Q11 -77.5 10 -67 Q9 -71.5 6 -72.5 Q0 -74 -6 -72.5 Q-9 -71.5 -10 -67Z" fill={HAIR} />}
                {hair === "low" && <path d="M-10 -68 Q0 -79 10 -68 Q0 -73.5 -10 -68Z" fill={HAIR} opacity="0.75" />}
                {hair === "afro" && <path d="M-10.5 -65 Q-9 -74 0 -75 Q9 -74 10.5 -65 Q7 -71 0 -71.5 Q-7 -71 -10.5 -65Z" fill={HAIR} />}
                {(hair === "locs" || hair === "bun") && <path d="M-10.3 -66 Q-11 -78 0 -78.5 Q11 -78 10.3 -66 Q8 -72 0 -73 Q-8 -72 -10.3 -66Z" fill={HAIR} />}
                {hair === "braids" && <><path d="M-10.3 -66 Q-11 -78 0 -78.5 Q11 -78 10.3 -66 Q8 -72 0 -73 Q-8 -72 -10.3 -66Z" fill={HAIR} />{[-5, 0, 5].map((bx) => <path key={bx} d={`M${bx} -77.5 Q${bx * 1.1} -74 ${bx * 1.3} -71.5`} stroke={HAIR_HI} strokeWidth="0.9" fill="none" />)}</>}
                {hair === "gele" && <><path d="M-12.5 -66 Q-17 -80 -4 -86 Q7 -91 16 -80 Q17.5 -72 12.5 -66 Q0 -72.5 -12.5 -66Z" fill={o.id === "asooke" ? cloth : GOLD} /><path d="M-8 -74 Q2 -84 13 -77 M-5 -69.5 Q4 -78 12 -71" stroke={mix(o.id === "asooke" ? cloth : "oklch(0.78 0.13 82)", 70)} strokeWidth="1.2" fill="none" /><path d="M13 -82 Q22 -88 19 -76 Z" fill={o.id === "asooke" ? clothD : mix("oklch(0.78 0.13 82)", 80)} /></>}
                {acc === "fila" && <path d="M-10.5 -70 Q-10 -81 2 -81 Q11 -80 10.5 -70 Q0 -73.5 -10.5 -70Z" fill={cloth} stroke={clothD} strokeWidth="0.6" />}
                {acc === "glasses" && <g stroke="oklch(0.16 0.01 40)" strokeWidth="0.9" fill="oklch(0.8 0.05 220 / 0.25)"><rect x="-6.6" y="-68.2" width="5.4" height="4.2" rx="1.6" /><rect x="1.2" y="-68.2" width="5.4" height="4.2" rx="1.6" /><path d="M-1.2 -66.4 L1.2 -66.4" /></g>}
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
      <ellipse cx="0" cy="0" rx={P === "sleep" ? 30 : 13} ry={P === "sleep" ? 6 : 4.6} fill="black" opacity="0.24" />
      {P === "sleep"
        ? <g transform="translate(0 34) rotate(-90 0 -40)">
            {figure}
            <rect x="-14" y="-40" width="28" height="42" rx="7" fill="oklch(0.88 0.04 85)" />
            <rect x="-14" y="-40" width="28" height="5" rx="2.5" fill="oklch(0.95 0.02 85)" />
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
