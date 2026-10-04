import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase, Hammer, Package, RotateCw, Trash2, Move, Trophy, Utensils, Droplets, Bed, MapPin, Sparkles, X, Check } from "lucide-react";
import { useGameAction, useMe } from "@/hooks/use-player";
import { IsoRoom, ItemPreview } from "@/components/game/IsoRoom";
import { Stars } from "@/components/game/ui";
import { districtById, homeById, itemById, jobById, PLACES } from "@/game/content";
import { challengeForDay, findSpot, formatGameTime, formatNaira, homeComfort, isOpen, itemDims, type FurnitureRow } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/")({
  head: () => ({ meta: [{ title: "Home — AbujaLife" }, { name: "description", content: "Live in your Abuja home: sleep, cook, shower and furnish." }, { property: "og:title", content: "Home — AbujaLife" }, { property: "og:description", content: "Your home in virtual Abuja." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: HomeScreen,
});

const EFFECT_LABELS: [string, string][] = [["hunger", "Hunger"], ["energy", "Energy"], ["happy", "Happy"], ["hygiene", "Hygiene"], ["social", "Social"], ["xp", "XP"], ["rep", "Rep"]];

function HomeScreen() {
  const p = useMe();
  const act = useGameAction();
  const home = homeById(p.home_id);
  const t = formatGameTime(p.game_minutes);
  const atHome = p.district === home.district;
  const job = jobById(p.job_id);
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [placing, setPlacing] = useState<{ row: FurnitureRow } | null>(null);
  const [avatarAt, setAvatarAt] = useState<[number, number] | null>(null);
  const [activeUid, setActiveUid] = useState<string | null>(null);

  const selRow = p.furniture.find((r) => r.u === sel) ?? null;
  const selItem = selRow ? itemById(selRow.i) : null;
  const stored = p.furniture.filter((r) => !r.p);
  const comfort = homeComfort(p.furniture);

  const defaultAt = useMemo<[number, number]>(() => {
    const spot = findSpot(p.furniture, home.size, { u: "_av", i: "plastic_chair", x: 0, y: 0, r: 0, p: false });
    return spot ? [spot.x, spot.y] : [Math.floor(home.size / 2), home.size - 1];
  }, [p.furniture, home.size]);

  const findUse = (pred: (cat: string) => boolean) => p.furniture.find((r) => r.p && itemById(r.i)?.use && pred(itemById(r.i)!.cat));

  function use(row: FurnitureRow) {
    const { w, d } = itemDims(row);
    setAvatarAt([Math.min(home.size - 1, row.x + w), Math.min(home.size - 1, row.y + Math.floor(d / 2))]);
    setActiveUid(row.u);
    act.mutate({ type: "useItem", uid: row.u }, { onSettled: () => setTimeout(() => setActiveUid(null), 2500) });
  }

  function placeAt(x: number, y: number) {
    if (!placing) return;
    act.mutate({ type: "placeItem", uid: placing.row.u, x, y, r: placing.row.r }, { onSuccess: (res) => { if (res.ok) { setPlacing(null); setSel(null); } } });
  }

  // Contextual floating cards
  const challenge = challengeForDay(t.day);
  const claimed = p.last_challenge_day >= t.day;
  const nearby = PLACES.find((pl) => pl.district === p.district && pl.cat === "Events" && isOpen(pl.hours, t.hour));
  const kitchen = findUse((c) => c === "Kitchen");
  const bath = findUse((c) => c === "Bathroom");
  const bed = findUse((c) => c === "Sleep");
  const cards: { icon: typeof Bed; title: string; sub: string; tone: string; onClick?: () => void; to?: string; search?: Record<string, string> }[] = [];
  if (p.hunger < 45) cards.push(kitchen && atHome ? { icon: Utensils, title: "Eat something", sub: itemById(kitchen.i)!.verb!, tone: "bg-hunger", onClick: () => use(kitchen) } : { icon: Utensils, title: "Eat something", sub: "Order on AbujaEats", tone: "bg-hunger", to: "/play/phone", search: { app: "eats" } });
  if (p.hygiene < 45 && bath && atHome) cards.push({ icon: Droplets, title: "Freshen up", sub: itemById(bath.i)!.verb!, tone: "bg-hygiene", onClick: () => use(bath) });
  if (p.energy < 35 && bed && atHome) cards.push({ icon: Bed, title: "Get some sleep", sub: itemById(bed.i)!.name, tone: "bg-energy", onClick: () => use(bed) });
  if (!claimed) cards.push({ icon: Trophy, title: "Daily challenge", sub: `${challenge.desc} · ${formatNaira(challenge.cash)}`, tone: "bg-gold", onClick: () => act.mutate({ type: "claimChallenge" }) });
  if (!job) cards.push({ icon: Briefcase, title: "Find a job", sub: "Open Jobs on your phone", tone: "bg-primary", to: "/play/phone", search: { app: "jobs" } });
  else if (job.district !== p.district) cards.push({ icon: Briefcase, title: "Go to work", sub: `${job.employer}, ${districtById(job.district).name}`, tone: "bg-primary", to: "/play/map", search: { district: job.district } });
  if (nearby) cards.push({ icon: Sparkles, title: "Happening nearby", sub: nearby.name, tone: "bg-social", to: "/play/map", search: { place: nearby.id } });

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between text-surface-foreground">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{districtById(home.district).name}</p>
          <h1 className="text-xl font-semibold">{home.name}</h1>
          <p className="text-xs text-surface-foreground/60">Comfort {comfort} · {p.furniture.filter((r) => r.p).length} items · {home.size}×{home.size} tiles</p>
        </div>
        {atHome && (
          <Button size="sm" variant={edit ? "default" : "secondary"} onClick={() => { setEdit(!edit); setPlacing(null); setSel(null); }}>
            {edit ? <><Check className="size-4" />Done</> : <><Hammer className="size-4" />Edit home</>}
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-surface-foreground/10 bg-[radial-gradient(ellipse_at_top,var(--surface-foreground)_-60%,transparent_70%)] shadow-card">
        <IsoRoom
          home={home} furniture={p.furniture} hour={t.hour} selected={sel} placing={placing} activeUid={activeUid}
          avatar={atHome ? { skin: p.skin, outfit: p.outfit, gender: p.gender, at: avatarAt ?? defaultAt } : null}
          onItem={(r) => setSel(r.u === sel ? null : r.u)} onTile={placeAt}
        />
        {!atHome && (
          <div className="absolute inset-0 grid place-items-center bg-surface/60 p-6 text-center text-surface-foreground backdrop-blur-[2px]">
            <div>
              <MapPin className="mx-auto mb-2 size-7 text-gold" />
              <p className="font-display text-lg font-semibold">You're out in {districtById(p.district).name}</p>
              <p className="mb-3 text-sm text-surface-foreground/70">Head home to {districtById(home.district).name} to use your furniture.</p>
              <Button onClick={() => act.mutate({ type: "travel", to: home.district })} disabled={act.isPending}>Ride home</Button>
            </div>
          </div>
        )}
        {placing && (
          <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2 rounded-2xl bg-surface/90 p-2 pl-3 text-sm text-surface-foreground backdrop-blur">
            <span>Tap a tile to place <b>{itemById(placing.row.i)!.name}</b></span>
            <div className="flex gap-1">
              <Button size="icon" variant="secondary" aria-label="Rotate" onClick={() => setPlacing({ row: { ...placing.row, r: (placing.row.r + 1) % 4 } })}><RotateCw className="size-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => setPlacing(null)}><X className="size-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {!edit && cards.length > 0 && (
        <div className="scrollbar-none -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1">
          {cards.map((c) => {
            const inner = (
              <>
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-surface", c.tone)}><c.icon className="size-5" /></span>
                <span className="min-w-0 text-left"><span className="block text-sm font-semibold">{c.title}</span><span className="block truncate text-xs text-surface-foreground/60">{c.sub}</span></span>
              </>
            );
            const cls = "flex w-60 shrink-0 snap-start items-center gap-3 rounded-2xl border border-surface-foreground/10 bg-surface-foreground/10 p-3 text-surface-foreground backdrop-blur animate-rise";
            return c.to
              ? <Link key={c.title} to={c.to} search={(c.search ?? {}) as never} className={cls}>{inner}</Link>
              : <button key={c.title} onClick={c.onClick} disabled={act.isPending} className={cls}>{inner}</button>;
          })}
        </div>
      )}

      {job && job.district === p.district && !edit && (
        <Button className="h-14 w-full text-base" disabled={act.isPending} onClick={() => act.mutate({ type: "work" })}>
          <Briefcase className="size-5" />Work a shift at {job.employer} · +{formatNaira(job.pay)}
        </Button>
      )}

      {edit && (
        <div className="rounded-2xl border border-surface-foreground/10 bg-surface-foreground/5 p-3 text-surface-foreground">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Package className="size-4 text-gold" />Storage ({stored.length})</h2>
            <Link to="/play/buy" className="text-xs font-semibold text-gold underline">Buy furniture</Link>
          </div>
          {stored.length === 0 ? <p className="text-xs text-surface-foreground/60">Nothing in storage. Tap furniture in the room to move, rotate, store or sell it.</p> : (
            <div className="scrollbar-none flex gap-2 overflow-x-auto">
              {stored.map((r) => { const it = itemById(r.i)!; return (
                <button key={r.u} onClick={() => setPlacing({ row: r })} className={cn("w-24 shrink-0 rounded-xl bg-card p-1 text-card-foreground", placing?.row.u === r.u && "ring-2 ring-gold")}>
                  <ItemPreview it={it} size={88} /><span className="block truncate text-[11px] font-semibold">{it.name}</span>
                </button>
              ); })}
            </div>
          )}
        </div>
      )}

      {selRow && selItem && !placing && (
        <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-3xl border bg-card p-4 shadow-[0_20px_50px_-15px_oklch(0_0_0/0.5)] animate-rise">
          <div className="flex gap-3">
            <div className="rounded-2xl bg-muted"><ItemPreview it={selItem} size={84} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between"><h3 className="font-semibold">{selItem.name}</h3><button aria-label="Close" onClick={() => setSel(null)}><X className="size-4 text-muted-foreground" /></button></div>
              <p className="text-xs text-muted-foreground"><Stars n={selItem.quality} /> · Comfort +{selItem.comfort}</p>
              {selItem.use && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {EFFECT_LABELS.filter(([k]) => selItem.use![k as keyof typeof selItem.use]).map(([k, l]) => { const v = selItem.use![k as keyof typeof selItem.use] as number; return <span key={k} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", v > 0 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive")}>{v > 0 ? "+" : ""}{v} {l}</span>; })}
                  {selItem.use.cost ? <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-accent-foreground">−{formatNaira(selItem.use.cost)}</span> : null}
                  {selItem.use.earn ? <span className="rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-bold">+{formatNaira(selItem.use.earn)}</span> : null}
                </div>
              )}
            </div>
          </div>
          {edit ? (
            <div className="mt-3 grid grid-cols-4 gap-2">
              <Button size="sm" variant="secondary" onClick={() => setPlacing({ row: selRow })}><Move className="size-4" />Move</Button>
              <Button size="sm" variant="secondary" disabled={act.isPending} onClick={() => act.mutate({ type: "placeItem", uid: selRow.u, x: selRow.x, y: selRow.y, r: (selRow.r + 1) % 4 })}><RotateCw className="size-4" />Rotate</Button>
              <Button size="sm" variant="secondary" disabled={act.isPending} onClick={() => { act.mutate({ type: "storeItem", uid: selRow.u }); setSel(null); }}><Package className="size-4" />Store</Button>
              <Button size="sm" variant="destructive" disabled={act.isPending} onClick={() => { act.mutate({ type: "sellItem", uid: selRow.u }); setSel(null); }}><Trash2 className="size-4" />{formatNaira(selItem.price / 2)}</Button>
            </div>
          ) : selItem.use ? (
            <Button className="mt-3 w-full" disabled={act.isPending || !atHome} onClick={() => { use(selRow); setSel(null); }}>{selItem.verb} · {selItem.use.minutes >= 60 ? `${selItem.use.minutes / 60}h` : `${selItem.use.minutes}m`}</Button>
          ) : <p className="mt-3 text-center text-xs text-muted-foreground">Decorative — adds comfort, which improves your sleep.</p>}
        </div>
      )}
    </div>
  );
}
