import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { usePlayer } from "@/hooks/use-player";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, Panel } from "@/components/game/ui";
import { backgroundById, homeById, jobById } from "@/game/content";
import { formatGameTime, formatNaira, levelFromXp } from "@/game/rules";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/play/profile")({
  head: () => ({ meta: [{ title: "Profile — AbujaLife" }, { name: "description", content: "Your AbujaLife character and progress." }, { property: "og:title", content: "Profile — AbujaLife" }, { property: "og:description", content: "Your character and progress." }] }),
  component: ProfileScreen,
});

function ProfileScreen() {
  const p = usePlayer().data!;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const net = p.cash + p.bank;
  const stats = [
    ["Level", levelFromXp(p.xp)], ["XP", p.xp], ["Reputation", p.reputation], ["Net worth", formatNaira(net)],
    ["Career XP", p.career_xp], ["Days lived", formatGameTime(p.game_minutes).day],
  ];
  const badges = [
    { name: "First Shift", got: p.career_xp > 0 },
    { name: "Moved Up", got: p.home_id !== "kubwa_room" },
    { name: "Half a Million", got: net >= 500000 },
    { name: "Known Face", got: p.reputation >= 50 },
    { name: "Millionaire", got: net >= 1000000 },
  ];

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-4">
      <Panel className="flex flex-col items-center text-center">
        <Avatar name={p.name} skin={p.skin} size={88} />
        <h1 className="mt-3 text-2xl font-semibold">{p.name}</h1>
        <p className="text-sm capitalize text-muted-foreground">{backgroundById(p.background).name} · {p.outfit}</p>
        <p className="mt-1 text-sm">{jobById(p.job_id)?.title ?? "Unemployed"} · {homeById(p.home_id).name}</p>
      </Panel>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(([k, v]) => (
          <Panel key={k} className="p-3 text-center"><p className="text-xs text-muted-foreground">{k}</p><p className="font-display font-semibold">{v}</p></Panel>
        ))}
      </div>
      <Panel>
        <h2 className="mb-3 font-semibold">Achievements</h2>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b.name} className={b.got ? "rounded-full bg-gold-gradient px-3 py-1 text-sm font-medium text-gold-foreground" : "rounded-full border px-3 py-1 text-sm text-muted-foreground"}>{b.name}</span>
          ))}
        </div>
      </Panel>
      <Button variant="outline" className="w-full" onClick={signOut}>Sign out</Button>
    </div>
  );
}
