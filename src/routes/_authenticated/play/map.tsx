import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Building2, Bus, Car, Clock, HeartPulse, Landmark, Megaphone, PartyPopper, ShoppingBag, Users, Utensils, X, Home as HomeIcon, Navigation } from "lucide-react";
import { z } from "zod";
import { useGameAction, useMe, useProfiles, isOnline } from "@/hooks/use-player";
import { AbujaWorld, WORLD_H, WORLD_W } from "@/components/game/AbujaWorld";
import { DISTRICTS, HOMES, JOBS, PLACES, districtById, homeById, jobById, vehicleById, type DistrictId, type PlaceCat, type Place } from "@/game/content";
import { formatGameTime, formatNaira, isOpen, levelFromXp, travelCost } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/map")({
  validateSearch: z.object({ place: z.string().optional(), district: z.string().optional() }),
  head: () => ({ meta: [{ title: "Abuja Map — AbujaLife" }, { name: "description", content: "Explore a living Abuja: districts, food, jobs, events and landmarks." }, { property: "og:title", content: "Abuja Map — AbujaLife" }, { property: "og:description", content: "Explore a living virtual Abuja." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MapScreen,
});

type Filter = "Moving" | PlaceCat;
const FILTERS: { id: Filter; icon: typeof Car }[] = [
  { id: "Moving", icon: Car }, { id: "Ads", icon: Megaphone }, { id: "Homes", icon: HomeIcon }, { id: "Food", icon: Utensils }, { id: "Jobs", icon: Briefcase },
  { id: "Events", icon: PartyPopper }, { id: "Shopping", icon: ShoppingBag }, { id: "Transport", icon: Bus }, { id: "Health", icon: HeartPulse }, { id: "Government", icon: Landmark },
];
const CAT_ICON: Record<PlaceCat, typeof Car> = Object.fromEntries(FILTERS.filter((f) => f.id !== "Moving").map((f) => [f.id, f.icon])) as Record<PlaceCat, typeof Car>;
const CAT_TONE: Record<PlaceCat, string> = { Food: "bg-hunger", Jobs: "bg-primary", Homes: "bg-hygiene", Shopping: "bg-social", Transport: "bg-muted-foreground", Health: "bg-destructive", Government: "bg-success", Events: "bg-gold", Ads: "bg-accent-foreground" };

type Point = Place & { jobId?: string; homeId?: string };
const S = 1.6; // render scale (px per world unit)

function MapScreen() {
  const p = useMe();
  const act = useGameAction();
  const search = Route.useSearch();
  const { data: profiles } = useProfiles();
  const t = formatGameTime(p.game_minutes);
  const [filters, setFilters] = useState<Set<Filter>>(new Set(["Moving", "Food", "Events", "Jobs", "Homes"]));
  const [selPlace, setSelPlace] = useState<string | null>(search.place || null);
  const [selDistrict, setSelDistrict] = useState<string | null>(search.district ?? (search.place ? null : null));
  const [vehicle, setVehicle] = useState<string | undefined>(undefined);
  const scroller = useRef<HTMLDivElement>(null);

  const points = useMemo<Point[]>(() => [
    ...PLACES,
    ...JOBS.map((j, i) => { const d = districtById(j.district); return { id: "job_" + j.id, jobId: j.id, name: j.employer, cat: "Jobs" as const, district: j.district, x: d.x - 22 + (i % 3) * 14, y: d.y - 20, desc: `${j.title} · ${formatNaira(j.pay)}/shift · ${j.hours}h · Level ${j.minLevel}+` }; }),
    ...HOMES.map((h) => { const d = districtById(h.district); return { id: "home_" + h.id, homeId: h.id, name: h.name, cat: "Homes" as const, district: h.district, x: d.x + 24, y: d.y + 8, desc: `${h.size}×${h.size} interior · Rent ${formatNaira(h.rent)} · Level ${h.minLevel}+` }; }),
  ], []);

  const focus = selPlace ? points.find((x) => x.id === selPlace) : null;
  const focusD = focus ? districtById(focus.district) : selDistrict ? districtById(selDistrict) : null;

  useEffect(() => {
    const el = scroller.current; if (!el) return;
    const target = focus ?? districtById(search.district ?? p.district);
    el.scrollTo({ left: target.x * S - el.clientWidth / 2, top: target.y * S - el.clientHeight / 2, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (f: Filter) => setFilters((s) => { const n = new Set(s); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  const nearby = (d: string) => (profiles ?? []).filter((x) => x.district === d && isOnline(x)).length;
  const jobOf = focus?.jobId ? jobById(focus.jobId) : undefined;
  const homeOf = focus?.homeId ? homeById(focus.homeId) : undefined;
  const here = focusD?.id === p.district;
  const trip = focusD && !here ? travelCost(p.district, focusD.id, vehicle) : null;
  const level = levelFromXp(p.xp);

  return (
    <div className="-mx-3 -mt-3">
      <div className="scrollbar-none sticky top-[104px] z-20 flex gap-1.5 overflow-x-auto bg-gradient-to-b from-surface to-transparent px-3 pb-3 pt-2">
        {FILTERS.map(({ id, icon: I }) => (
          <button key={id} onClick={() => toggle(id)} className={cn("flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold", filters.has(id) ? "border-gold bg-gold text-gold-foreground" : "border-surface-foreground/20 bg-surface/80 text-surface-foreground/70")}>
            <I className="size-3.5" />{id}
          </button>
        ))}
      </div>

      <div ref={scroller} className="scrollbar-none relative h-[calc(100dvh-190px)] overflow-auto overscroll-contain">
        <div className="relative" style={{ width: WORLD_W * S, height: WORLD_H * S }}>
          <AbujaWorld hour={t.hour} moving={filters.has("Moving")} />
          {DISTRICTS.map((d) => (
            <button key={d.id} onClick={() => { setSelDistrict(d.id); setSelPlace(null); }} aria-label={d.name}
              className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: d.x * S, top: d.y * S }}>
              {d.id === p.district && <span className="absolute inset-0 m-auto size-8 rounded-full bg-gold animate-ping-soft" />}
              <span className={cn("relative grid size-8 place-items-center rounded-full border-2 text-[10px] font-black shadow-card", d.id === p.district ? "border-surface bg-gold text-gold-foreground" : "border-surface-foreground bg-surface text-surface-foreground", selDistrict === d.id && "ring-4 ring-gold/50")}>
                {d.id === p.district ? "YOU" : nearby(d.id) || <Navigation className="size-3.5" />}
              </span>
            </button>
          ))}
          {points.filter((x) => filters.has(x.cat)).map((x) => {
            const I = CAT_ICON[x.cat]; const open = isOpen(x.hours, t.hour);
            return (
              <button key={x.id} onClick={() => { setSelPlace(x.id); setSelDistrict(null); }} aria-label={x.name}
                className={cn("absolute flex -translate-x-1/2 -translate-y-full flex-col items-center transition-transform", selPlace === x.id && "z-10 scale-125", !open && "opacity-55")} style={{ left: x.x * S, top: x.y * S }}>
                <span className={cn("grid size-7 place-items-center rounded-full border-2 border-surface text-surface shadow-card", CAT_TONE[x.cat])}><I className="size-3.5" /></span>
                <span className="-mt-0.5 size-0 border-x-4 border-t-[6px] border-x-transparent border-t-surface" />
                {x.cat === "Events" && open && <span className="absolute -top-4 whitespace-nowrap rounded-full bg-surface px-1.5 text-[9px] font-bold text-gold">LIVE</span>}
              </button>
            );
          })}
        </div>
      </div>

      {(focus || focusD) && focusD && (
        <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-3xl border bg-card p-4 shadow-[0_20px_50px_-15px_oklch(0_0_0/0.5)] animate-rise" key={focus?.id ?? focusD.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{focus ? `${focus.cat} · ${focusD.name}` : `District · ${"★".repeat(focusD.tier)}`}</p>
              <h2 className="text-lg font-semibold leading-tight">{focus?.name ?? focusD.name}</h2>
            </div>
            <button aria-label="Close" onClick={() => { setSelPlace(null); setSelDistrict(null); }}><X className="size-5 text-muted-foreground" /></button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{focus?.desc ?? focusD.tagline}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"><Users className="size-3" />{nearby(focusD.id)} players nearby</span>
            {focus?.hours && <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", isOpen(focus.hours, t.hour) ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}><Clock className="size-3" />{isOpen(focus.hours, t.hour) ? "Open" : "Closed"} · {focus.hours[0]}:00–{focus.hours[1] % 24}:00</span>}
            {!focus && focusD.landmarks.map((l) => <span key={l} className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">{l}</span>)}
          </div>
          {!focus && (
            <div className="scrollbar-none mt-2 flex gap-1.5 overflow-x-auto">
              {points.filter((x) => x.district === focusD.id && x.cat !== "Jobs" && x.cat !== "Homes").map((x) => <button key={x.id} onClick={() => setSelPlace(x.id)} className="shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold">{x.name}</button>)}
            </div>
          )}

          {!here && trip && (
            <div className="mt-3">
              {p.vehicles.length > 0 && (
                <div className="mb-2 flex gap-1.5">
                  {[undefined, ...p.vehicles].map((v) => <button key={v ?? "ride"} onClick={() => setVehicle(v)} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", vehicle === v && "border-primary bg-primary text-primary-foreground")}>{v ? vehicleById(v)?.name : "AbujaRide"}</button>)}
                </div>
              )}
              <Button className="w-full" disabled={act.isPending || p.cash < trip.price} onClick={() => act.mutate({ type: "travel", to: focusD.id as DistrictId, vehicle })}>
                <Navigation className="size-4" />Travel here · {trip.price ? formatNaira(trip.price) : "Free"} · {trip.minutes} min
              </Button>
            </div>
          )}
          {here && focus?.activity && (
            <Button className="mt-3 w-full" disabled={act.isPending || p.cash < (focus.activity.cost ?? 0) || !isOpen(focus.hours, t.hour)} onClick={() => act.mutate({ type: "visit", placeId: focus.id })}>
              {focus.activity.label} · {focus.activity.cost ? formatNaira(focus.activity.cost) : "Free"}
            </Button>
          )}
          {here && !focus && <p className="mt-3 text-center text-sm font-semibold text-primary">You are here. Tap a spot to explore.</p>}
          {jobOf && (
            p.job_id === jobOf.id
              ? (here ? <Button className="mt-2 w-full" variant="secondary" disabled={act.isPending} onClick={() => act.mutate({ type: "work" })}>Work shift · +{formatNaira(jobOf.pay)}</Button> : <p className="mt-2 text-center text-xs text-muted-foreground">This is your workplace.</p>)
              : <Button className="mt-2 w-full" variant="secondary" disabled={act.isPending || level < jobOf.minLevel} onClick={() => act.mutate({ type: "applyJob", jobId: jobOf.id })}>{level < jobOf.minLevel ? `Needs level ${jobOf.minLevel}` : `Apply as ${jobOf.title}`}</Button>
          )}
          {homeOf && (
            p.home_id === homeOf.id ? <p className="mt-2 text-center text-xs font-semibold text-primary">Your current home.</p>
              : <Button className="mt-2 w-full" variant="secondary" disabled={act.isPending || level < homeOf.minLevel || p.cash + p.bank < homeOf.rent} onClick={() => act.mutate({ type: "moveHome", homeId: homeOf.id })}>{level < homeOf.minLevel ? `Needs level ${homeOf.minLevel}` : `Move in · ${formatNaira(homeOf.rent)}`}</Button>
          )}
          {focus?.cat === "Ads" && <Link to="/play/phone" search={{ app: focus.id === "ad_motors" ? "motors" : focus.id === "ad_homes" ? "homes" : "bank" }} className="mt-3 block rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground">Open on phone</Link>}
          {focus?.cat === "Transport" && <Link to="/play/phone" search={{ app: "ride" }} className="mt-3 block rounded-xl border py-2 text-center text-sm font-semibold"><Building2 className="mr-1 inline size-4" />Open AbujaRide</Link>}
        </div>
      )}
    </div>
  );
}
