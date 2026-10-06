import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMe, useProfiles, useGameAction, isOnline } from "@/hooks/use-player";
import { destinationFor, liveState, placesIn, weatherFor, WEATHER_LABEL } from "@/game/destinations";
import { formatGameTime, formatNaira, isOpen } from "@/game/rules";
import { StreetScene } from "@/components/game/world/StreetScene";
import { VenueScene } from "@/components/game/world/VenueScene";
import { WUSE2_VENUES, venueById } from "@/game/venues";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/place/$districtId")({
  validateSearch: z.object({ venue: z.string().optional() }),
  head: () => ({ meta: [{ title: "Destination — AbujaLife" }, { name: "description", content: "Live a part of Abuja: people, venues and events." }, { property: "og:title", content: "Destination — AbujaLife" }, { property: "og:description", content: "Live different parts of Abuja." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PlaceScreen,
});

function PlaceScreen() {
  const { districtId } = Route.useParams();
  const { venue: venueParam } = Route.useSearch();
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
  const venue = dest.district === "wuse2" ? venueById(venueParam) : undefined;
  const venuePlace = venue ? places.find((place) => place.id === venue.activityId) : undefined;
  const look = { skin: p.skin, gender: p.gender, outfit: p.outfit, hair: p.hair, accessory: p.accessory, face: p.face, shoes: p.shoes };
  return (
    <div className="-mx-3 -mt-3 pb-32">
      <div className={cn("relative overflow-hidden", venue ? "h-[42vh] min-h-80" : "h-[46vh] min-h-72")}>
        {venue ? <VenueScene venue={venue} look={look} hour={t.hour} /> : <StreetScene dest={dest} hour={t.hour} weather={weather} moving={false} crowd={st.crowd} />}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[oklch(0_0_0/.6)] to-transparent p-4 text-[oklch(0.97_0.01_90)]">
          <h1 className="text-3xl font-semibold">{venue?.name ?? dest.name}</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">{venue?.address ?? dest.subtitle}</p>
          <p className="mt-1 text-sm opacity-85">{venue?.tagline ?? st.mood}</p>
        </div>
      </div>
      <div className="space-y-4 px-3 pt-3">
        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          {[`${t.weekday} ${t.clock}`, WEATHER_LABEL[weather], `Crowd ${st.crowd}%`, `Traffic ${st.traffic}%`, `Nightlife ${st.nightlife}%`, `${players.length} players here`].map((x) => <span key={x} className="rounded-full bg-surface-foreground/10 px-2.5 py-1">{x}</span>)}
        </div>
        {st.special && <div className="rounded-2xl bg-gold-gradient p-3 text-gold-foreground shadow-gold"><p className="text-[10px] font-bold uppercase tracking-widest">Happening now</p><p className="font-semibold">{st.special}</p></div>}
        {!here && <Link to="/play/map" search={{ district: dest.district }} className="block rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground">You're not here yet — travel from the map</Link>}
        {dest.district === "wuse2" && <section aria-label="Wuse 2 destinations">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">Wuse 2 experiences</h2>
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">{WUSE2_VENUES.map((item) => <Link key={item.id} to="/play/place/$districtId" params={{ districtId }} search={{ venue: item.id }} className={cn("shrink-0 rounded-full border px-3 py-2 text-xs font-semibold", venue?.id === item.id ? "border-gold bg-gold/15 text-gold" : "border-border bg-surface/70")}>{item.name}</Link>)}</div>
        </section>}
        {venue && venuePlace && <section className="glass rounded-md p-3">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-gold">{venuePlace.cat} · {venuePlace.activity?.hours?.[0]}:00–{(venuePlace.activity?.hours?.[1] ?? 0) % 24}:00</p><p className="mt-1 text-sm text-surface-foreground/75">{st.crowd > 55 ? "The room is lively tonight." : "A relaxed crowd is settling in."} {players.length} players nearby.</p></div><span aria-label={`${st.crowd} percent crowd`} className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">{st.crowd}% crowd</span></div>
          <Button className="mt-3 w-full" disabled={!here || !isOpen(venuePlace.activity?.hours, t.hour) || act.isPending || p.cash < (venuePlace.activity?.cost ?? 0)} onClick={() => act.mutate({ type: "visit", placeId: venuePlace.id })}>{!isOpen(venuePlace.activity?.hours, t.hour) ? "Closed now" : `${venuePlace.activity?.label ?? "Join in"} · ${venuePlace.activity?.cost ? formatNaira(venuePlace.activity.cost) : "Free"}`}</Button>
        </section>}
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">Around you</h2>
          <ul className="space-y-1 text-sm text-surface-foreground/80">{st.ambient.map((a) => <li key={a}>· {a}</li>)}</ul>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-gold">Things to do</h2>
          <div className="grid gap-2">
            {places.filter((pl) => !venue || pl.id !== venue.activityId).map((pl) => { const open = isOpen(pl.hours, t.hour); const a = pl.activity!; return (
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
