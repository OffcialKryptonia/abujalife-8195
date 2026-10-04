import { createFileRoute, Link } from "@tanstack/react-router";
import { Bed, Briefcase, Utensils, PartyPopper } from "lucide-react";
import { useGameAction, usePlayer } from "@/hooks/use-player";
import { Avatar, Panel, StatBar } from "@/components/game/ui";
import { districtById, foodsForDistrict, homeById, jobById, HANGOUTS } from "@/game/content";
import { formatNaira, levelFromXp, xpForLevel } from "@/game/rules";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/play/")({
  head: () => ({ meta: [{ title: "Home — AbujaLife" }, { name: "description", content: "Your daily life in Abuja." }, { property: "og:title", content: "Home — AbujaLife" }, { property: "og:description", content: "Your daily life in Abuja." }] }),
  component: HomeScreen,
});

function HomeScreen() {
  const p = usePlayer().data!;
  const act = useGameAction();
  const level = levelFromXp(p.xp);
  const progress = ((p.xp - xpForLevel(level)) / (xpForLevel(level + 1) - xpForLevel(level))) * 100;
  const job = jobById(p.job_id);
  const home = homeById(p.home_id);
  const here = districtById(p.district);
  const foods = foodsForDistrict(p.district);
  const spot = HANGOUTS.find((h) => h.district === p.district);
  const atHome = p.district === home.district;
  const atWork = job && p.district === job.district;

  const tip = !job ? { text: "You need income. Find a job on the board.", to: "/play/work" as const, cta: "Job board" }
    : p.hunger < 25 ? { text: "You're getting hungry. Grab food nearby.", to: null, cta: "" }
    : p.energy < 25 ? { text: atHome ? "You're exhausted. Rest at home." : `You're exhausted. Head home to ${districtById(home.district).name}.`, to: atHome ? null : "/play/map" as const, cta: "Open map" }
    : !atWork ? { text: `Your shift is in ${districtById(job.district).name}.`, to: "/play/map" as const, cta: "Travel" }
    : { text: "Ready to work. Every shift builds experience.", to: null, cta: "" };

  return (
    <div className="space-y-4">
      <Panel className="bg-surface-gradient border-0 text-surface-foreground">
        <div className="flex items-center gap-4">
          <Avatar name={p.name} skin={p.skin} size={64} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold">{p.name}</h1>
            <p className="text-sm text-surface-foreground/70">{job ? job.title : "Unemployed"} · {home.name}</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="rounded-full bg-gold px-2 py-0.5 font-bold text-gold-foreground">LV {level}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-foreground/15"><div className="h-full bg-gold" style={{ width: `${progress}%` }} /></div>
              <span className="text-surface-foreground/60">{p.reputation} rep</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-surface-foreground/10 p-3"><p className="text-surface-foreground/60">Cash</p><p className="font-display text-lg font-semibold">{formatNaira(p.cash)}</p></div>
          <div className="rounded-xl bg-surface-foreground/10 p-3"><p className="text-surface-foreground/60">Bank</p><p className="font-display text-lg font-semibold">{formatNaira(p.bank)}</p></div>
        </div>
      </Panel>

      <Panel>
        <div className="grid gap-3">
          <StatBar label="Hunger" value={p.hunger} tone="hunger" />
          <StatBar label="Energy" value={p.energy} tone="energy" />
          <StatBar label="Happiness" value={p.happiness} tone="happy" />
        </div>
      </Panel>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gold/50 bg-accent p-4 text-sm text-accent-foreground">
        <span>{tip.text}</span>
        {tip.to && <Link to={tip.to} className="shrink-0 font-semibold underline">{tip.cta}</Link>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="default" className="h-auto flex-col gap-1 py-4" disabled={!atWork || act.isPending} onClick={() => act.mutate({ type: "work" })}>
          <Briefcase className="size-5" /> Work shift {job && <span className="text-xs opacity-80">+{formatNaira(job.pay)}</span>}
        </Button>
        <Button variant="secondary" className="h-auto flex-col gap-1 py-4" disabled={!atHome || act.isPending} onClick={() => act.mutate({ type: "rest" })}>
          <Bed className="size-5" /> Sleep <span className="text-xs opacity-70">{atHome ? `+${home.restEnergy} energy` : "Not at home"}</span>
        </Button>
      </div>

      <Panel>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><Utensils className="size-4 text-primary" />Eat in {here.name}</h2>
        <ul className="divide-y">
          {foods.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-2.5">
              <div><p className="font-medium">{f.name}</p><p className="text-xs text-muted-foreground">+{f.hunger} hunger · +{f.happy} happy</p></div>
              <Button size="sm" variant="outline" disabled={act.isPending || p.cash < f.price} onClick={() => act.mutate({ type: "eat", foodId: f.id })}>{formatNaira(f.price)}</Button>
            </li>
          ))}
        </ul>
      </Panel>

      {spot && (
        <Panel>
          <h2 className="mb-1 flex items-center gap-2 font-semibold"><PartyPopper className="size-4 text-primary" />{spot.name}</h2>
          <p className="mb-3 text-sm text-muted-foreground">+{spot.happy} happiness · +{spot.rep} reputation · 3 hours</p>
          <Button variant="outline" disabled={act.isPending || p.cash < spot.price} onClick={() => act.mutate({ type: "hangout", hangoutId: spot.id })}>Go out · {formatNaira(spot.price)}</Button>
        </Panel>
      )}
    </div>
  );
}
