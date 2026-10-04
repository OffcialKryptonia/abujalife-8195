import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Armchair, Bath, Bed, Briefcase, ChefHat, Crown, Eye, Flower2, RotateCw, ShoppingBag, Tv, X } from "lucide-react";
import { playerQueryKey, useGameAction, useMe, type Player } from "@/hooks/use-player";
import { IsoRoom, ItemPreview } from "@/components/game/IsoRoom";
import { SparkleBurst } from "@/components/game/feedback";
import { Stars } from "@/components/game/ui";
import { FURNITURE, FURNITURE_CATS, homeById, type FurnitureCat, type FurnitureItem } from "@/game/content";
import { fits, formatGameTime, formatNaira } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/buy")({
  head: () => ({ meta: [{ title: "Furniture Shop — AbujaLife" }, { name: "description", content: "Buy beds, kitchens, bathrooms, sofas and luxury pieces for your Abuja home." }, { property: "og:title", content: "Furniture Shop — AbujaLife" }, { property: "og:description", content: "Furnish your Abuja home." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: BuyScreen,
});

const ICONS: Record<FurnitureCat, typeof Bed> = { Sleep: Bed, Kitchen: ChefHat, Bathroom: Bath, Comfort: Armchair, Entertainment: Tv, Work: Briefcase, Decoration: Flower2, Luxury: Crown };
const EFFECTS: [string, string][] = [["hunger", "Hunger"], ["energy", "Energy"], ["happy", "Happy"], ["hygiene", "Hygiene"], ["social", "Social"], ["xp", "XP"]];
const RARITY = [
  { name: "Basic", cls: "bg-muted text-muted-foreground", glow: "transparent" },
  { name: "Basic", cls: "bg-muted text-muted-foreground", glow: "transparent" },
  { name: "Standard", cls: "bg-happy text-surface", glow: "var(--happy)" },
  { name: "Premium", cls: "bg-hygiene text-surface", glow: "var(--hygiene)" },
  { name: "Luxury", cls: "bg-social text-surface", glow: "var(--social)" },
  { name: "Signature", cls: "bg-gold-gradient text-gold-foreground", glow: "var(--gold)" },
];

function PlacementPreview({ it, p, onClose }: { it: FurnitureItem; p: Player; onClose: () => void }) {
  const act = useGameAction();
  const qc = useQueryClient();
  const home = homeById(p.home_id);
  const [r, setR] = useState(0);
  const [spot, setSpot] = useState<[number, number] | null>(null);
  const [busy, setBusy] = useState(false);
  const row = { u: "_preview", i: it.id, x: spot?.[0] ?? 0, y: spot?.[1] ?? 0, r, p: true };
  const ok = spot ? fits(p.furniture, home.size, row) : false;
  const funds = p.cash + p.bank;

  async function buy() {
    setBusy(true);
    const before = new Set(p.furniture.map((f) => f.u));
    const res = await act.mutateAsync({ type: "buyItem", itemId: it.id }).catch(() => null);
    if (res?.ok && spot && ok) {
      await qc.refetchQueries({ queryKey: playerQueryKey });
      const fresh = qc.getQueryData<Player>(playerQueryKey);
      const added = fresh?.furniture.find((f) => !before.has(f.u) && f.i === it.id);
      if (added) await act.mutateAsync({ type: "placeItem", uid: added.u, x: spot[0], y: spot[1], r }).catch(() => null);
    }
    setBusy(false);
    if (res?.ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-surface/70 backdrop-blur-sm animate-screen-in" onClick={onClose}>
      <div className="glass w-full max-w-lg rounded-t-[32px] animate-sheet-up p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-surface-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Try it in your room</p><h2 className="text-lg font-semibold">{it.name}</h2></div>
          <button aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-surface-foreground/10"><X className="size-4" /></button>
        </div>
        <div className="overflow-hidden rounded-3xl bg-[radial-gradient(120%_80%_at_50%_0%,var(--primary),var(--surface))]">
          <IsoRoom home={home} furniture={p.furniture} hour={formatGameTime(p.game_minutes).hour} placing={{ row }} onTile={(x, y) => setSpot([x, y])} />
        </div>
        <p className="mt-2 text-center text-xs text-surface-foreground/65">{spot ? (ok ? "Looks good here. Snapped to the grid." : "Doesn't fit there — try another tile or rotate.") : "Tap a tile to preview where it goes."}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" size="icon" className="h-12 w-12 shrink-0" aria-label="Rotate" onClick={() => setR((r + 1) % 4)}><RotateCw className="size-5" /></Button>
          <Button className="h-12 flex-1 bg-gold-gradient text-base text-gold-foreground shadow-gold" disabled={busy || funds < it.price || (!!spot && !ok)} onClick={buy}>
            <ShoppingBag className="size-5" />{funds < it.price ? "Can't afford" : spot ? "Buy & place" : "Buy"} · {formatNaira(it.price)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BuyScreen() {
  const p = useMe();
  const act = useGameAction();
  const [cat, setCat] = useState<FurnitureCat>("Sleep");
  const [preview, setPreview] = useState<FurnitureItem | null>(null);
  const [bought, setBought] = useState<string | null>(null);
  const items = FURNITURE.filter((f) => f.cat === cat && f.price > 0);
  const funds = p.cash + p.bank;
  const owned = (id: string) => p.furniture.filter((r) => r.i === id).length;

  return (
    <div>
      <div className="mb-3 flex items-end justify-between text-surface-foreground">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Buy mode</p>
          <h1 className="text-xl font-semibold">Furniture shop</h1>
        </div>
        <Link to="/play" className="glass rounded-full px-3 py-1.5 text-xs font-bold">Back home</Link>
      </div>
      <div className="scrollbar-none -mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1">
        {FURNITURE_CATS.map((c) => { const I = ICONS[c]; const on = c === cat; return (
          <button key={c} onClick={() => setCat(c)} className={cn("flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all active:scale-95", on ? "-translate-y-0.5 bg-gold-gradient text-gold-foreground shadow-gold" : "glass text-surface-foreground/75")}>
            <I key={String(on)} className={cn("size-4", on && "animate-nav-pop")} />{c}
          </button>
        ); })}
      </div>
      <div className="glass mb-3 flex items-center justify-between rounded-2xl px-3 py-2 text-xs text-surface-foreground">
        <span className="text-surface-foreground/65">Spending power</span>
        <span className="font-display text-sm font-bold text-gold">{formatNaira(funds)}</span>
      </div>
      <div key={cat} className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((it, i) => {
          const rar = RARITY[it.quality] ?? RARITY[1]!;
          const afford = funds >= it.price;
          return (
            <article key={it.id} className="group relative flex flex-col overflow-hidden rounded-[22px] border border-surface-foreground/10 bg-card p-2.5 shadow-card animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="relative grid place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_75%,var(--accent),var(--muted))]" style={{ boxShadow: `inset 0 -20px 40px -20px ${rar.glow}` }}>
                <div className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105"><ItemPreview it={it} size={128} /></div>
                <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider", rar.cls)}>{rar.name}</span>
                {owned(it.id) > 0 && <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">×{owned(it.id)}</span>}
                <button onClick={() => setPreview(it)} aria-label={`Preview ${it.name} in your room`} className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-surface/80 text-surface-foreground backdrop-blur transition-transform active:scale-90"><Eye className="size-4" /></button>
                {bought === it.id && <SparkleBurst />}
              </div>
              <h3 className="mt-2 text-[13px] font-semibold leading-tight">{it.name}</h3>
              <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground"><Stars n={it.quality} /><span>{it.w}×{it.d} · +{it.comfort} comfort</span></div>
              {it.use && <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground"><b className="text-foreground">{it.verb}</b> {EFFECTS.filter(([k]) => it.use![k as keyof typeof it.use]).map(([k, l]) => `${(it.use![k as keyof typeof it.use] as number) > 0 ? "+" : ""}${it.use![k as keyof typeof it.use]} ${l}`).join(" · ")}</p>}
              <div className="flex-1" />
              <button disabled={act.isPending || !afford} onClick={() => act.mutate({ type: "buyItem", itemId: it.id }, { onSuccess: (r) => { if (r.ok) { setBought(it.id); setTimeout(() => setBought(null), 1000); } } })}
                className={cn("mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-xl font-display text-xs font-bold transition-transform active:scale-95 disabled:opacity-50", afford ? "bg-gold-gradient text-gold-foreground shadow-gold" : "bg-muted text-muted-foreground")}>
                {afford ? <><ShoppingBag className="size-3.5" />{formatNaira(it.price)}</> : `Need ${formatNaira(it.price)}`}
              </button>
            </article>
          );
        })}
      </div>
      {preview && <PlacementPreview it={preview} p={p} onClose={() => setPreview(null)} />}
    </div>
  );
}
