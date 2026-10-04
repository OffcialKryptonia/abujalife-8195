import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useGameAction, usePlayer } from "@/hooks/use-player";
import { PageTitle, Panel } from "@/components/game/ui";
import { districtById, jobById, JOBS } from "@/game/content";
import { formatNaira, levelFromXp } from "@/game/rules";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/play/work")({
  head: () => ({ meta: [{ title: "Jobs — AbujaLife" }, { name: "description", content: "Find work and grow your career in Abuja." }, { property: "og:title", content: "Jobs — AbujaLife" }, { property: "og:description", content: "Find work and grow your career." }] }),
  component: WorkScreen,
});

function WorkScreen() {
  const p = usePlayer().data!;
  const act = useGameAction();
  const level = levelFromXp(p.xp);
  const job = jobById(p.job_id);

  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Career" title="Job board" />
      {job && (
        <Panel className="border-primary/40">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current job</p>
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="text-sm text-muted-foreground">{job.employer} · {districtById(job.district).name}</p>
          <p className="mt-2 text-sm">{p.shifts} shifts worked · loyalty bonus +{Math.min(p.shifts, 50)}%</p>
          <div className="mt-3 flex gap-2">
            <Button disabled={act.isPending || p.district !== job.district} onClick={() => act.mutate({ type: "work" })}>
              {p.district === job.district ? "Work shift" : "Travel to work first"}
            </Button>
            <Button variant="ghost" disabled={act.isPending} onClick={() => act.mutate({ type: "quitJob" })}>Resign</Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {JOBS.map((j) => {
          const locked = level < j.minLevel;
          return (
            <Panel key={j.id} className={locked ? "opacity-60" : ""}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{j.title}</h3>
                  <p className="text-xs text-muted-foreground">{j.employer} · {districtById(j.district).name}</p>
                </div>
                <span className="font-display font-semibold text-primary">{formatNaira(j.pay)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{j.hours}h shift · −{j.energy} energy · +{j.xp} XP</p>
              {p.job_id === j.id ? (
                <p className="mt-3 text-sm font-medium text-primary">Your job</p>
              ) : locked ? (
                <p className="mt-3 flex items-center gap-1 text-sm"><Lock className="size-3.5" />Level {j.minLevel} required</p>
              ) : (
                <Button size="sm" variant="outline" className="mt-3" disabled={act.isPending} onClick={() => act.mutate({ type: "applyJob", jobId: j.id })}>Apply</Button>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
