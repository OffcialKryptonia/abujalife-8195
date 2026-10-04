import { createFileRoute } from "@tanstack/react-router";
import { useGameAction, usePlayer } from "@/hooks/use-player";
import { PageTitle, Panel } from "@/components/game/ui";
import { districtById, HOMES } from "@/game/content";
import { formatNaira, levelFromXp } from "@/game/rules";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/play/housing")({
  head: () => ({ meta: [{ title: "Property — AbujaLife" }, { name: "description", content: "Rent better homes across Abuja." }, { property: "og:title", content: "Property — AbujaLife" }, { property: "og:description", content: "Rent better homes across Abuja." }] }),
  component: HousingScreen,
});

function HousingScreen() {
  const p = usePlayer().data!;
  const act = useGameAction();
  const level = levelFromXp(p.xp);
  const wealth = p.cash + p.bank;

  return (
    <div className="space-y-3">
      <PageTitle eyebrow="Property" title="Listings" />
      <p className="text-sm text-muted-foreground">Rent is paid upfront for the year — from your bank first, then cash. Better homes restore more energy and boost reputation.</p>
      {HOMES.map((h) => {
        const current = h.id === p.home_id;
        const locked = level < h.minLevel;
        return (
          <Panel key={h.id} className={current ? "border-primary ring-2 ring-primary/20" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{h.name}</h3>
                <p className="text-xs text-muted-foreground">{districtById(h.district).name} · +{h.restEnergy} energy per sleep · prestige {h.prestige}</p>
              </div>
              <span className="whitespace-nowrap font-display font-semibold text-primary">{h.rent ? formatNaira(h.rent) : "Starter"}</span>
            </div>
            <div className="mt-3">
              {current ? <span className="text-sm font-medium text-primary">Your home</span>
                : locked ? <span className="text-sm text-muted-foreground">Level {h.minLevel} required</span>
                : <Button size="sm" disabled={act.isPending || wealth < h.rent} onClick={() => act.mutate({ type: "moveHome", homeId: h.id })}>{wealth < h.rent ? `Need ${formatNaira(h.rent - wealth)} more` : "Move in"}</Button>}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}
