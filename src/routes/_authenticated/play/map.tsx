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
import { lightFor } from "@/components/game/DayNightLighting";
import { PlayerCharacter } from "@/components/game/PlayerCharacter";
import { haptic } from "@/components/game/motion";

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

  useEffect(() => {
    const el = scroller.current; const tg = focus ?? focusD; if (!el || !tg) return;
    el.scrollTo({ left: tg.x * S - el.clientWidth / 2, top: tg.y * S - el.clientHeight / 3, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selPlace, selDistrict]);

  const toggle = (f: Filter) => setFilters((s) => { const n = new Set(s); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  const nearby = (d: string) => (profiles ?? []).filter((x) => x.district === d && isOnline(x)).length;
  const jobOf = focus?.jobId ? jobById(focus.jobId) : undefined;
  const homeOf = focus?.homeId ? homeById(focus.homeId) : undefined;
  const here = focusD?.id === p.district;
  const trip = focusD && !here ? travelCost(p.district, focusD.id, vehicle) : null;
  const level = levelFromXp(p.xp);

  const light = lightFor(t.hour);
  const FocusIcon = focus ? CAT_ICON[focus.cat] : Navigation;

  return (
    <div className="-mx-3 -mt-3">
      <div className="scrollbar-none sticky top-[118px] z-20 flex gap-1.5 overflow-x-auto bg-gradient-to-b from-surface/90 to-transparent px-3 pb-3 pt-2">
        {FILTERS.map(({ id, icon: I }) => { const on = filters.has(id); return (
          <button key={id} onClick={() => { haptic(); toggle(id); }} aria-pressed={on} className={cn("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-bold transition-all duration-300 active:scale-90", on ? "bg-gold-gradient text-gold-foreground shadow-gold" : "glass text-surface-foreground/70")}>
            <I key={String(on)} className={cn("size-3.5", on && "animate-nav-pop")} />{id}
          </button>
        ); })}
      </div>

      <div ref={scroller} className="scrollbar-none relative h-[calc(100dvh-200px)] overflow-auto overscroll-contain">
        <div className="relative" style={{ width: WORLD_W * S, height: WORLD_H * S }}>
          <AbujaWorld hour={t.hour} moving={filters.has("Moving")} />
          <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000" style={{ background: light.tint, opacity: light.tintOpacity * 0.9, mixBlendMode: "multiply" }} />
          {DISTRICTS.map((d, i) => {
            const me = d.id === p.district; const sel = selDistrict === d.id;
            return (
              <button key={d.id} onClick={() => { haptic(); setSelDistrict(d.id); setSelPlace(null); }} aria-label={d.name}
                className={cn("absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform duration-300", sel && "z-10 scale-110")} style={{ left: d.x * S, top: d.y * S }}>
                {me ? (
                  <span className="relative grid place-items-center">
                    <span className="absolute size-12 rounded-full bg-gold/60 animate-ping-soft" />
                    <span className="relative grid size-11 place-items-center overflow-hidden rounded-full border-[3px] border-gold bg-surface shadow-gold animate-bob">
                      <svg viewBox="-17 -84 34 34" className="size-full"><PlayerCharacter look={{ skin: p.skin, gender: p.gender, outfit: p.outfit, hair: p.hair, accessory: p.accessory, face: p.face, shoes: p.shoes }} /></svg>
                    </span>
                  </span>
                ) : (
                  <span className={cn("relative grid size-8 place-items-center rounded-full border-2 border-surface-foreground/80 bg-surface text-[10px] font-black text-surface-foreground shadow-card", sel && "ring-4 ring-gold/60")}>
                    {nearby(d.id) || <Navigation className="size-3.5" />}
                  </span>
                )}
                <span className="mt-1 whitespace-nowrap rounded-full bg-surface/85 px-2 py-0.5 font-display text-[10px] font-bold text-surface-foreground shadow-card backdrop-blur animate-rise" style={{ animationDelay: `${i * 35}ms` }}>{d.name}</span>
              </button>
            );
          })}
          {points.filter((x) => filters.has(x.cat)).map((x) => {
            const I = CAT_ICON[x.cat]; const open = isOpen(x.hours, t.hour);
            return (
              <button key={x.id} onClick={() => { haptic(); setSelPlace(x.id); setSelDistrict(null); }} aria-label={x.name}
                className={cn("absolute flex -translate-x-1/2 -translate-y-full flex-col items-center transition-transform duration-300 animate-rise", selPlace === x.id && "z-10 scale-150", !open && "opacity-55")} style={{ left: x.x * S, top: x.y * S }}>
                <span className={cn("grid size-7 place-items-center rounded-full border-2 border-surface text-surface shadow-card", CAT_TONE[x.cat])}><I className="size-3.5" /></span>
                <span className="-mt-0.5 size-0 border-x-4 border-t-[6px] border-x-transparent border-t-surface" />
                {x.cat === "Events" && open && <span className="absolute -top-4 whitespace-nowrap rounded-full bg-surface px-1.5 text-[9px] font-bold text-gold animate-pulse">LIVE</span>}
              </button>
            );
          })}
        </div>
      </div>

      {(focus || focusD) && focusD && (
        <div className="glass fixed inset-x-3 bottom-28 z-40 mx-auto max-w-md overflow-hidden rounded-[28px] text-surface-foreground shadow-[0_24px_60px_-15px_oklch(0_0_0/0.75)] animate-rise" key={focus?.id ?? focusD.id}>
          <div className={cn("relative h-20 overflow-hidden", focus ? CAT_TONE[focus.cat] : "bg-primary")}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(1_0_0/0.35),transparent_55%),linear-gradient(180deg,transparent,oklch(0_0_0/0.45))]" />
            <svg viewBox="0 0 400 80" className="absolute inset-x-0 bottom-0 h-12 w-full opacity-40" preserveAspectRatio="none"><path d="M0 80 L0 50 L30 50 L30 30 L60 30 L60 45 L95 45 L95 20 L120 20 L120 40 L160 40 L170 25 L190 40 L230 40 L230 15 L255 15 L255 45 L300 45 L300 32 L340 32 L350 50 L400 50 L400 80Z" fill="black" /></svg>
            <FocusIcon className="absolute right-5 top-3 size-12 text-surface/40" />
          </div>
          <div className="p-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold">{focus ? `${focus.cat} · ${focusD.name}` : `District · ${"★".repeat(focusD.tier)}`}</p>
              <h2 className="text-lg font-semibold leading-tight">{focus?.name ?? focusD.name}</h2>
            </div>
            <button aria-label="Close" className="grid size-9 place-items-center rounded-full bg-surface-foreground/10" onClick={() => { setSelPlace(null); setSelDistrict(null); }}><X className="size-4" /></button>
          </div>
          <p className="mt-1 text-sm text-surface-foreground/70">{focus?.desc ?? focusD.tagline}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-surface-foreground/10 px-2 py-0.5"><Users className="size-3" />{nearby(focusD.id)} players nearby</span>
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
              <Button className="h-12 w-full bg-gold-gradient text-gold-foreground shadow-gold" disabled={act.isPending || p.cash < trip.price} onClick={() => act.mutate({ type: "travel", to: focusD.id as DistrictId, vehicle })}>
                <Navigation className="size-4" />Travel here · {trip.price ? formatNaira(trip.price) : "Free"} · {trip.minutes} min
              </Button>
            </div>
          )}
          {here && focus?.activity && (
            <Button className="mt-3 h-12 w-full bg-gold-gradient text-gold-foreground shadow-gold" disabled={act.isPending || p.cash < (focus.activity.cost ?? 0) || !isOpen(focus.hours, t.hour)} onClick={() => act.mutate({ type: "visit", placeId: focus.id })}>
              {focus.activity.label} · {focus.activity.cost ? formatNaira(focus.activity.cost) : "Free"}
            </Button>
          )}
          {here && !focus && <p className="mt-3 text-center text-sm font-semibold text-primary">You are here. Tap a spot to explore.</p>}
          {jobOf && (
            p.job_id === jobOf.id
              ? (here ? <Button className="mt-2 w-full" variant="secondary" disabled={act.isPending} onClick={() => act.mutate({ type: "work" })}>Work shift · +{formatNaira(jobOf.pay)}</Button> : <p className="mt-2 text-center text-xs text-surface-foreground/70">This is your workplace.</p>)
              : <Button className="mt-2 w-full" variant="secondary" disabled={act.isPending || level < jobOf.minLevel} onClick={() => act.mutate({ type: "applyJob", jobId: jobOf.id })}>{level < jobOf.minLevel ? `Needs level ${jobOf.minLevel}` : `Apply as ${jobOf.title}`}</Button>
          )}
          {homeOf && (
            p.home_id === homeOf.id ? <p className="mt-2 text-center text-xs font-semibold text-primary">Your current home.</p>
              : <Button className="mt-2 w-full" variant="secondary" disabled={act.isPending || level < homeOf.minLevel || p.cash + p.bank < homeOf.rent} onClick={() => act.mutate({ type: "moveHome", homeId: homeOf.id })}>{level < homeOf.minLevel ? `Needs level ${homeOf.minLevel}` : `Move in · ${formatNaira(homeOf.rent)}`}</Button>
          )}
          {focus?.cat === "Ads" && <Link to="/play/phone" search={{ app: focus.id === "ad_motors" ? "motors" : focus.id === "ad_homes" ? "homes" : "bank" }} className="mt-3 block rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground">Open on phone</Link>}
          {focus?.cat === "Transport" && <Link to="/play/phone" search={{ app: "ride" }} className="mt-3 block rounded-xl border py-2 text-center text-sm font-semibold"><Building2 className="mr-1 inline size-4" />Open AbujaRide</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
