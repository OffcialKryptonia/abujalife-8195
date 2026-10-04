import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets, Eye, Moon, Plus, Smile, Sun, Sunrise, Sunset, Users, Utensils, Volume2, VolumeX, Wifi, Zap } from "lucide-react";
import { useMe, useProfiles, isOnline } from "@/hooks/use-player";
import { districtById } from "@/game/content";
import { formatGameTime, formatNaira, levelFromXp, mood } from "@/game/rules";
import { getSoundPref, setSound } from "@/lib/sound";
import { Avatar } from "./ui";
import { cn } from "@/lib/utils";

const NEEDS = [
  { key: "hunger", label: "Hunger", icon: Utensils, cls: "text-hunger", stroke: "var(--hunger)" },
  { key: "energy", label: "Energy", icon: Zap, cls: "text-energy", stroke: "var(--energy)" },
  { key: "happiness", label: "Happy", icon: Smile, cls: "text-happy", stroke: "var(--happy)" },
  { key: "social", label: "Social", icon: Users, cls: "text-social", stroke: "var(--social)" },
  { key: "hygiene", label: "Hygiene", icon: Droplets, cls: "text-hygiene", stroke: "var(--hygiene)" },
] as const;

function NeedRing({ value, stroke, icon: Icon, label, cls }: { value: number; stroke: string; icon: typeof Zap; label: string; cls: string }) {
  const c = 2 * Math.PI * 15;
  return (
    <div className="flex flex-col items-center gap-0.5" title={`${label} ${value}`}>
      <div className={cn("relative size-10", value < 20 && "animate-pulse")}>
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" className="stroke-surface-foreground/15" />
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.5" strokeLinecap="round" style={{ stroke, strokeDasharray: c, strokeDashoffset: c * (1 - value / 100), transition: "stroke-dashoffset .6s" }} />
        </svg>
        <Icon className={cn("absolute inset-0 m-auto size-4", cls)} />
      </div>
      <span className="text-[9px] font-bold text-surface-foreground/70">{value}</span>
    </div>
  );
}

export function Hud() {
  const p = useMe();
  const { data: profiles } = useProfiles();
  const t = formatGameTime(p.game_minutes);
  const m = mood(p);
  const [sound, setS] = useState(false);
  useEffect(() => setS(getSoundPref()), []);
  const online = profiles?.filter(isOnline).length ?? 1;
  const PhaseIcon = { morning: Sunrise, afternoon: Sun, evening: Sunset, night: Moon }[t.phase];

  return (
    <header className="sticky top-0 z-30 border-b border-surface-foreground/10 bg-surface/90 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-surface-foreground backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <Link to="/play/phone" search={{ app: "profile" }} className="relative">
          <Avatar name={p.name} skin={p.skin} size={38} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-gold px-1.5 text-[9px] font-black text-gold-foreground">{levelFromXp(p.xp)}</span>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <PhaseIcon className="size-3.5 text-gold" />
            <span>{t.weekday} · Day {t.day}</span>
            <span className="text-surface-foreground/60">{t.clock}</span>
          </div>
          <p className="truncate text-[11px] text-surface-foreground/60">{districtById(p.district).name} · {m.emoji} {m.label}</p>
        </div>
        <button aria-label={sound ? "Mute sound" : "Turn on sound"} onClick={() => { setSound(!sound); setS(!sound); }} className="grid size-8 place-items-center rounded-full bg-surface-foreground/10">
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-60" />}
        </button>
        <div className="flex items-center rounded-full bg-gold-gradient pl-3 text-gold-foreground shadow-gold">
          <span className="font-display text-sm font-bold">{formatNaira(p.cash)}</span>
          <Link to="/play/phone" search={{ app: "bank" }} aria-label="Add money" className="ml-1.5 grid size-7 place-items-center rounded-full bg-surface text-gold"><Plus className="size-4" /></Link>
        </div>
      </div>
      <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between gap-2">
        <div className="flex flex-col gap-1 text-[10px] font-semibold text-surface-foreground/70">
          <span className="flex items-center gap-1"><Wifi className="size-3 text-success" />{online} online</span>
          <span className="flex items-center gap-1"><Eye className="size-3 text-gold" />{p.visits} visits</span>
        </div>
        <div className="flex gap-2.5">
          {NEEDS.map((n) => <NeedRing key={n.key} value={p[n.key]} stroke={n.stroke} icon={n.icon} label={n.label} cls={n.cls} />)}
        </div>
      </div>
    </header>
  );
}
