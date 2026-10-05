import { createFileRoute, Link } from "@tanstack/react-router";
import { useMe, useProfiles, useGameAction, isOnline } from "@/hooks/use-player";
import { destinationFor, liveState, placesIn, weatherFor, WEATHER_LABEL } from "@/game/destinations";
import { formatGameTime, formatNaira, isOpen } from "@/game/rules";
import { StreetScene } from "@/components/game/world/StreetScene";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/place/$districtId")({
  head: () => ({ meta: [{ title: "Destination — AbujaLife" }, { name: "description", content: "Live a part of Abuja: people, venues and events." }, { property: "og:title", content: "Destination — AbujaLife" }, { property: "og:description", content: "Live different parts of Abuja." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PlaceScreen,
});

function PlaceScreen() {
  const { districtId } = Route.useParams();
  const p = useMe();
  const act = useGameAction();
  const { data: profiles } = useProfiles();
  const dest = destinationFor(districtId);
  const t = formatGameTime(p.game_minutes);
  const weather = weatherFor(p.game_minutes);
  const st = liveState(dest, t.phase, weather, t.weekday);
  const here = p.district === dest.district;
  const players = (profiles ?? []).filter((x) => x.district === dest.district && isOnline(x));
  const places = placesIn(dest.district);
  return (
    <div className="-mx-3 -mt-3 pb-32">
      <div className="relative h-[46vh] min-h-72 overflow-hidden">
        <StreetScene dest={dest} hour={t.hour} weather={weather} moving={false} crowd={st.crowd} />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[oklch(0_0_0/.6)] to-transparent p-4 text-[oklch(0.97_0.01_90)]">
          <h1 className="text-3xl font-semibold">{dest.name}</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">{dest.subtitle}</p>
          <p className="mt-1 text-sm opacity-85">{st.mood}</p>
        </div>
      </div>
      <div className="space-y-4 px-3 pt-3">
        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          {[`${t.weekday} ${t.clock}`, WEATHER_LABEL[weather], `Crowd ${st.crowd}%`, `Traffic ${st.traffic}%`, `Nightlife ${st.nightlife}%`, `${players.length} players here`].map((x) => <span key={x} className="rounded-full bg-surface-foreground/10 px-2.5 py-1">{x}</span>)}
        </div>
        {st.special && <div className="rounded-2xl bg-gold-gradient p-3 text-gold-foreground shadow-gold"><p className="text-[10px] font-bold uppercase tracking-widest">Happening now</p><p className="font-semibold">{st.special}</p></div>}
        {!here && <Link to="/play/map" search={{ district: dest.district }} className="block rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground">You're not here yet — travel from the map</Link>}
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">Around you</h2>
          <ul className="space-y-1 text-sm text-surface-foreground/80">{st.ambient.map((a) => <li key={a}>· {a}</li>)}</ul>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">Things to do</h2>
          <div className="grid gap-2">
            {places.map((pl) => { const open = isOpen(pl.hours, t.hour); const a = pl.activity!; return (
              <div key={pl.id} className={cn("glass rounded-2xl p-3", !open && "opacity-60")}>
                <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-widest text-gold">{pl.cat}{pl.hours ? ` · ${pl.hours[0]}:00–${pl.hours[1] % 24}:00` : ""}</p><p className="font-semibold">{pl.name}</p><p className="text-xs text-surface-foreground/70">{pl.desc}</p></div></div>
                <Button size="sm" className="mt-2 w-full" disabled={!here || !open || act.isPending || p.cash < (a.cost ?? 0)} onClick={() => act.mutate({ type: "visit", placeId: pl.id })}>{open ? `${a.label} · ${a.cost ? formatNaira(a.cost) : "Free"}` : "Closed now"}</Button>
              </div>
            ); })}
            {places.length === 0 && <p className="text-sm text-surface-foreground/60">Quiet area — more venues coming soon.</p>}
          </div>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">People here</h2>
          <div className="grid gap-2">{dest.npcProfiles.slice(0, 4).map((n) => <div key={n.name} className="glass rounded-2xl p-3 text-sm"><p className="font-semibold">{n.name} <span className="text-xs font-normal text-surface-foreground/60">· {n.role}</span></p><p className="italic text-surface-foreground/80">“{n.line}”</p></div>)}</div>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">Local feed</h2>
          <ul className="space-y-1 text-sm">{players.slice(0, 3).map((x) => <li key={x.user_id}>· {x.name} is in {dest.name}</li>)}{dest.feed.map((f) => <li key={f}>· {f}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}
