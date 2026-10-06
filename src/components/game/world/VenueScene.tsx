import { useId } from "react";
import { PlayerCharacter } from "@/components/game/PlayerCharacter";
import type { VenueExperience } from "@/game/venues";

/** Small, original illustrated interiors; interaction and rewards remain owned by game rules. */
export function VenueScene({ venue, look, hour }: { venue: VenueExperience; look: { skin: string; gender: string; outfit: string; hair: string; accessory: string; face: string; shoes: string }; hour: number }) {
  const uid = useId().replaceAll(":", "");
  const dark = hour >= 19 || hour < 5;
  const tiles = Array.from({ length: 9 }, (_, i) => i);
  return (
    <div className="relative isolate h-full min-h-72 overflow-hidden bg-surface" aria-label={`${venue.name} interior`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklch,var(--gold)_20%,transparent),transparent_65%)]" />
      <svg className="absolute inset-0 size-full" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Original illustrated ${venue.mood} room`}>
        <defs>
          <linearGradient id={`wall-${uid}`} x2="0" y2="1"><stop stopColor={dark ? "var(--surface)" : "var(--secondary)"} /><stop offset="1" stopColor={dark ? "var(--background)" : "var(--muted)"} /></linearGradient>
          <linearGradient id={`floor-${uid}`} x2="0" y2="1"><stop stopColor="var(--secondary)" /><stop offset="1" stopColor="var(--background)" /></linearGradient>
          <radialGradient id={`light-${uid}`}><stop stopColor="var(--gold)" stopOpacity=".4" /><stop offset="1" stopColor="var(--gold)" stopOpacity="0" /></radialGradient>
        </defs>
        <path d="M0 0h400v205H0z" fill={`url(#wall-${uid})`} />
        <path d="M0 205 200 150l200 55v115H0z" fill={`url(#floor-${uid})`} />
        <path d="m0 205 200-55 200 55" fill="none" stroke="var(--border)" strokeWidth="3" />
        {venue.mood === "dance" && <g className="venue-lights">{tiles.map((i) => <path key={i} d={`M${134 + (i % 3) * 45} ${235 + Math.floor(i / 3) * 19}h40v16h-40z`} fill={i % 3 === 0 ? "var(--gold)" : i % 3 === 1 ? "var(--primary)" : "var(--success)"} opacity=".82" />)}<path d="M245 84h118v60H245z" fill="var(--surface)" stroke="var(--gold)" strokeWidth="3" /><path d="M258 95h90v30h-90z" fill="var(--primary)" /><circle cx="275" cy="127" r="5" fill="var(--gold)" /><circle cx="330" cy="127" r="5" fill="var(--gold)" /><path d="M268 144v22m72-22v22" stroke="var(--gold)" strokeWidth="4" /></g>}
        {venue.mood === "rooftop" && <g><path d="M24 81h352v6H24z" fill="var(--gold)" /><path d="M42 87v63m316-63v63" stroke="var(--border)" strokeWidth="4" /><path d="M65 62q0-24 22-24t22 24z" fill="var(--primary)" /><circle cx="300" cy="56" r="23" fill="var(--gold)" opacity=".85" /><path d="M38 158h320" stroke="var(--border)" strokeWidth="3" /></g>}
        {venue.mood === "cafe" && <g><path d="M28 70h344v85H28z" fill="var(--card)" stroke="var(--border)" strokeWidth="3" /><path d="M45 86h125v48H45zm184 0h125v48H229z" fill="var(--primary)" opacity=".25" /><path d="M98 194h202v12H98zm14 12v35m174-35v35" stroke="var(--gold)" strokeWidth="6" /><path d="M275 187q10-16 20 0m-14-8q8-13 16 0" fill="none" stroke="var(--success)" strokeWidth="3" /></g>}
        {venue.mood === "kitchen" && <g><path d="M40 88h320v65H40z" fill="var(--card)" stroke="var(--border)" strokeWidth="3" /><path d="M55 100h290v18H55z" fill="var(--gold)" opacity=".5" /><path d="M72 154v42m256-42v42" stroke="var(--border)" strokeWidth="5" /><circle cx="128" cy="125" r="14" fill="var(--success)" /><circle cx="200" cy="125" r="14" fill="var(--gold)" /><circle cx="272" cy="125" r="14" fill="var(--destructive)" /></g>}
        {venue.mood === "mixer" && <g><path d="M35 67h330v88H35z" fill="var(--card)" stroke="var(--border)" strokeWidth="3" /><path d="M58 88h284v44H58z" fill="var(--primary)" opacity=".28" /><path d="M80 191h240m-215 0v40m190-40v40" stroke="var(--gold)" strokeWidth="5" /><circle cx="200" cy="105" r="16" fill="var(--gold)" /><path d="M200 121v28m0-18-18 14m18-14 18 14" stroke="var(--gold)" strokeWidth="4" /></g>}
        <ellipse cx="196" cy="254" rx="30" ry="7" fill="var(--foreground)" opacity=".2" />
        <g className="venue-guest"><svg x="170" y="167" width="54" height="92" viewBox="-17 -84 34 84"><PlayerCharacter look={look} pose={venue.mood === "dance" ? "cheer" : "idle"} /></svg></g>
        <path d="M0 216h400" stroke="var(--border)" strokeOpacity=".5" />
        <ellipse cx={venue.mood === "dance" ? 200 : 320} cy="95" rx="100" ry="80" fill={`url(#light-${uid})`} className="venue-glow" />
      </svg>
      {venue.mood === "dance" && <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_52%_74%,color-mix(in_oklch,var(--gold)_15%,transparent),transparent_38%)] animate-pulse" />}
    </div>
  );
}