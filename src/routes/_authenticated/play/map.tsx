import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGameAction, usePlayer } from "@/hooks/use-player";
import { PageTitle, Panel } from "@/components/game/ui";
import { DISTRICTS, homeById, jobById, type DistrictId } from "@/game/content";
import { formatNaira, travelCost } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/map")({
  head: () => ({ meta: [{ title: "Abuja Map — AbujaLife" }, { name: "description", content: "Travel between Abuja's districts." }, { property: "og:title", content: "Abuja Map — AbujaLife" }, { property: "og:description", content: "Travel between Abuja's districts." }] }),
  component: MapScreen,
});

function MapScreen() {
  const p = usePlayer().data!;
  const act = useGameAction();
  const [sel, setSel] = useState<DistrictId>(p.district as DistrictId);
  const d = DISTRICTS.find((x) => x.id === sel)!;
  const t = travelCost(p.district, sel);
  const homeD = homeById(p.home_id).district;
  const jobD = jobById(p.job_id)?.district;

  return (
    <div>
      <PageTitle eyebrow="Explore" title="The city" />
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface-gradient shadow-card md:aspect-[4/3]">
        <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
          {DISTRICTS.flatMap((a, i) => DISTRICTS.slice(i + 1).filter((b) => Math.hypot(a.x - b.x, a.y - b.y) < 32).map((b) => (
            <line key={a.id + b.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-gold" strokeWidth="0.4" strokeDasharray="1 1" />
          )))}
        </svg>
        {DISTRICTS.map((x) => (
          <button key={x.id} onClick={() => setSel(x.id)} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x.x}%`, top: `${x.y}%` }}>
            <span className={cn("mx-auto block rounded-full border-2 border-surface-foreground/60 transition-all", x.id === p.district ? "size-5 bg-gold shadow-gold" : "size-3.5 bg-surface-foreground/40", x.id === sel && "ring-4 ring-gold/40")} />
            <span className="mt-1 block whitespace-nowrap text-[11px] font-semibold text-surface-foreground">
              {x.name}{x.id === homeD ? " 🏠" : ""}{x.id === jobD ? " 💼" : ""}
            </span>
          </button>
        ))}
      </div>

      <Panel className="mt-4" key={sel}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{d.name} <span className="text-gold">{"★".repeat(d.tier)}</span></h2>
            <p className="text-sm text-muted-foreground">{d.tagline}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{d.landmarks.join(" · ")}</p>
        {sel === p.district ? (
          <p className="mt-4 text-sm font-medium text-primary">You are here.</p>
        ) : (
          <Button className="mt-4 w-full" disabled={act.isPending || p.cash < t.price} onClick={() => act.mutate({ type: "travel", to: sel })}>
            Take a ride · {formatNaira(t.price)} · {t.minutes} min
          </Button>
        )}
      </Panel>
    </div>
  );
}
