import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, MapPin, Moon, Plus, Sun, Sunrise, Sunset, Volume2, VolumeX, Wifi } from "lucide-react";
import { useMe, useProfiles, isOnline } from "@/hooks/use-player";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { districtById } from "@/game/content";
import { formatGameTime, formatNaira, levelFromXp, mood, xpForLevel } from "@/game/rules";
import { getSoundPref, setSound } from "@/lib/sound";
import { NeedsRings } from "./NeedsRings";
import { PlayerCharacter } from "./PlayerCharacter";
import { cn } from "@/lib/utils";

function LevelAvatar({ p }: { p: ReturnType<typeof useMe> }) {
  const lvl = levelFromXp(p.xp);
  const lo = xpForLevel(lvl), hi = xpForLevel(lvl + 1);
  const prog = useAnimatedNumber(Math.min(1, (p.xp - lo) / Math.max(1, hi - lo)), 900);
  const c = 2 * Math.PI * 23;
  return (
    <Link to="/play/phone" search={{ app: "profile" }} className="relative grid size-[54px] shrink-0 place-items-center" aria-label={`Level ${lvl} profile`}>
      <svg viewBox="0 0 50 50" className="absolute inset-0 -rotate-90">
        <circle cx="25" cy="25" r="23" fill="none" strokeWidth="3" className="stroke-surface-foreground/12" />
        <circle cx="25" cy="25" r="23" fill="none" strokeWidth="3" strokeLinecap="round" style={{ stroke: "var(--gold)", strokeDasharray: c, strokeDashoffset: c * (1 - prog), filter: "drop-shadow(0 0 3px var(--gold))" }} />
      </svg>
      <div className="size-[44px] overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_30%,var(--primary),var(--surface))]">
        <svg viewBox="-17 -84 34 34" className="size-full"><CharacterPortraitInner p={p} /></svg>
      </div>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-surface bg-gold-gradient px-1.5 font-display text-[10px] font-black leading-4 text-gold-foreground shadow-gold">{lvl}</span>
    </Link>
  );
}

function CharacterPortraitInner({ p }: { p: ReturnType<typeof useMe> }) {
  return <PlayerCharacter look={{ skin: p.skin, gender: p.gender, outfit: p.outfit, hair: p.hair, accessory: p.accessory }} pose="idle" />;
}

function Wallet({ cash }: { cash: number }) {
  const shown = useAnimatedNumber(cash, 700);
  const [bump, setBump] = useState(0);
  useEffect(() => setBump((b) => b + 1), [cash]);
  return (
    <div key={bump} className="relative flex items-center overflow-hidden rounded-full bg-gold-gradient py-0.5 pl-1 text-gold-foreground shadow-gold animate-coin">
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.45),transparent)] animate-shine" />
      <span className="grid size-6 place-items-center rounded-full bg-surface/15 font-display text-xs font-black">₦</span>
      <span className="px-1.5 font-display text-sm font-bold tabular-nums">{formatNaira(shown).slice(1)}</span>
      <Link to="/play/phone" search={{ app: "bank" }} aria-label="Add money" className="mr-0.5 grid size-7 place-items-center rounded-full bg-surface text-gold transition-transform active:scale-90"><Plus className="size-4" strokeWidth={3} /></Link>
    </div>
  );
}

export function GameHUD() {
  const p = useMe();
  const { data: profiles } = useProfiles();
  const t = formatGameTime(p.game_minutes);
  const m = mood(p);
  const [sound, setS] = useState(false);
  useEffect(() => setS(getSoundPref()), []);
  const online = profiles?.filter(isOnline).length ?? 1;
  const PhaseIcon = { morning: Sunrise, afternoon: Sun, evening: Sunset, night: Moon }[t.phase];

  return (
    <header className="glass sticky top-0 z-30 rounded-b-[28px] border-t-0 px-3 pb-2.5 pt-[max(0.6rem,env(safe-area-inset-top))] text-surface-foreground shadow-[0_18px_40px_-20px_oklch(0_0_0/0.7)]">
      <div className="mx-auto flex max-w-3xl items-center gap-2.5">
        <LevelAvatar p={p} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn("grid size-5 place-items-center rounded-full", t.phase === "night" ? "bg-night text-surface-foreground" : "bg-gold/20 text-gold")}><PhaseIcon className="size-3" /></span>
            <span className="font-display text-[15px] font-bold tabular-nums leading-none">{t.clock}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-foreground/50">{t.weekday.slice(0, 3)} · D{t.day}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-surface-foreground/65">
            <MapPin className="size-3 shrink-0 text-gold" /><span className="truncate">{districtById(p.district).name}</span>
            <span className="shrink-0 rounded-full bg-surface-foreground/10 px-1.5 leading-4">{m.emoji} {m.label}</span>
          </div>
        </div>
        <Wallet cash={p.cash} />
      </div>
      <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 rounded-full bg-surface-foreground/8 px-2 py-0.5 text-[10px] font-bold text-surface-foreground/75"><span className="relative flex size-1.5"><span className="absolute inset-0 rounded-full bg-success animate-ping-soft" /><span className="size-1.5 rounded-full bg-success" /></span><Wifi className="size-3" />{online}</span>
          <span className="flex items-center gap-1 rounded-full bg-surface-foreground/8 px-2 py-0.5 text-[10px] font-bold text-surface-foreground/75"><Eye className="size-3 text-gold" />{p.visits}</span>
        </div>
        <NeedsRings stats={p} />
        <button aria-label={sound ? "Mute sound" : "Turn on sound"} onClick={() => { setSound(!sound); setS(!sound); }} className="grid size-9 place-items-center rounded-full bg-surface-foreground/10 transition-transform active:scale-90">
          {sound ? <Volume2 className="size-4 text-gold" /> : <VolumeX className="size-4 opacity-60" />}
        </button>
      </div>
    </header>
  );
}

export const Hud = GameHUD;
