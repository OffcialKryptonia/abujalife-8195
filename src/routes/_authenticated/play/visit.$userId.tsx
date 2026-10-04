import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-player";
import { IsoRoom } from "@/components/game/IsoRoom";
import { homeById } from "@/game/content";
import { formatGameTime, homeComfort, type FurnitureRow } from "@/game/rules";

export const Route = createFileRoute("/_authenticated/play/visit/$userId")({
  head: () => ({ meta: [{ title: "Visiting a home — AbujaLife" }, { name: "description", content: "Visit another player's home in AbujaLife." }, { property: "og:title", content: "Visiting a home — AbujaLife" }, { property: "og:description", content: "See how other Abujans live." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: VisitScreen,
});

type Visit = { name: string; skin: string; outfit: string; gender: string; home_id: string; furniture: FurnitureRow[]; visits: number };

function VisitScreen() {
  const { userId } = Route.useParams();
  const me = useMe();
  const { data, isLoading } = useQuery({
    queryKey: ["visit", userId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("visit_home", { _target: userId });
      if (error) throw error;
      return data as unknown as Visit | null;
    },
  });
  if (isLoading) return <p className="p-8 text-center text-surface-foreground/70">Knocking on the door…</p>;
  if (!data) return <p className="p-8 text-center text-surface-foreground/70">Nobody lives here.</p>;
  const home = homeById(data.home_id);
  return (
    <div className="space-y-3 text-surface-foreground">
      <Link to="/play/phone" search={{ app: "people" }} className="inline-flex items-center gap-1 text-sm font-semibold text-gold"><ArrowLeft className="size-4" />Back</Link>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Visiting</p>
        <h1 className="text-xl font-semibold">{data.name}'s {home.name}</h1>
        <p className="flex items-center gap-1 text-xs text-surface-foreground/60"><Eye className="size-3" />{data.visits} visits · Comfort {homeComfort(data.furniture)}</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-surface-foreground/10">
        <IsoRoom home={home} furniture={data.furniture} hour={formatGameTime(me.game_minutes).hour} avatar={{ skin: data.skin, outfit: data.outfit, gender: data.gender, at: [Math.floor(home.size / 2) + 0.5, home.size - 0.5] }} />
      </div>
    </div>
  );
}
