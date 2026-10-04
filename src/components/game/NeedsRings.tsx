import { Droplets, Smile, Users, Utensils, Zap } from "lucide-react";
import { useAnimatedNumber, useDelta } from "@/hooks/use-animated-number";
import { cn } from "@/lib/utils";

export const NEEDS = [
  { key: "hunger", label: "Hunger", icon: Utensils, stroke: "var(--hunger)", cls: "text-hunger" },
  { key: "energy", label: "Energy", icon: Zap, stroke: "var(--energy)", cls: "text-energy" },
  { key: "happiness", label: "Happy", icon: Smile, stroke: "var(--happy)", cls: "text-happy" },
  { key: "social", label: "Social", icon: Users, stroke: "var(--social)", cls: "text-social" },
  { key: "hygiene", label: "Hygiene", icon: Droplets, stroke: "var(--hygiene)", cls: "text-hygiene" },
] as const;
export type NeedKey = (typeof NEEDS)[number]["key"];

function Ring({ value, stroke, icon: Icon, label, cls }: { value: number; stroke: string; icon: typeof Zap; label: string; cls: string }) {
  const shown = useAnimatedNumber(value, 800);
  const delta = useDelta(value);
  const c = 2 * Math.PI * 15;
  const critical = value < 20, low = value < 40;
  return (
    <div className="relative flex flex-col items-center" title={`${label} ${value}`} aria-label={`${label} ${value} of 100`}>
      <div className={cn("relative size-11 rounded-full bg-surface/60 shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]", critical && "animate-critical")}>
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.2" className="stroke-surface-foreground/10" />
          <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3.2" strokeLinecap="round"
            style={{ stroke: critical ? "var(--destructive)" : stroke, strokeDasharray: c, strokeDashoffset: c * (1 - shown / 100), filter: `drop-shadow(0 0 3px ${critical ? "var(--destructive)" : stroke})` }} />
        </svg>
        <Icon className={cn("absolute inset-0 m-auto size-[17px]", critical ? "text-destructive" : cls, low && "opacity-90")} strokeWidth={2.4} />
        {delta && <span key={delta.k} className={cn("pointer-events-none absolute -top-3 left-1/2 rounded-full px-1.5 text-[10px] font-black animate-delta", delta.v > 0 ? "bg-success text-surface" : "bg-destructive text-destructive-foreground")}>{delta.v > 0 ? "+" : ""}{delta.v}</span>}
      </div>
      <span className={cn("mt-0.5 font-display text-[10px] font-bold tabular-nums", critical ? "text-destructive" : "text-surface-foreground/75")}>{Math.round(shown)}</span>
    </div>
  );
}

export function NeedsRings({ stats }: { stats: Record<NeedKey, number> }) {
  return (
    <div className="flex gap-1.5">
      {NEEDS.map((n) => <Ring key={n.key} value={stats[n.key]} stroke={n.stroke} icon={n.icon} label={n.label} cls={n.cls} />)}
    </div>
  );
}
