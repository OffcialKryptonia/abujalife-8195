import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Armchair, Bath, Bed, Briefcase, ChefHat, Crown, Flower2, Tv } from "lucide-react";
import { useGameAction, useMe } from "@/hooks/use-player";
import { ItemPreview } from "@/components/game/IsoRoom";
import { PageTitle, Stars } from "@/components/game/ui";
import { FURNITURE, FURNITURE_CATS, homeById, type FurnitureCat } from "@/game/content";
import { formatNaira } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/buy")({
  head: () => ({ meta: [{ title: "Furniture Catalogue — AbujaLife" }, { name: "description", content: "Buy beds, kitchens, bathrooms, sofas and luxury pieces for your Abuja home." }, { property: "og:title", content: "Furniture Catalogue — AbujaLife" }, { property: "og:description", content: "Furnish your Abuja home." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: BuyScreen,
});

const ICONS: Record<FurnitureCat, typeof Bed> = { Sleep: Bed, Kitchen: ChefHat, Bathroom: Bath, Comfort: Armchair, Entertainment: Tv, Work: Briefcase, Decoration: Flower2, Luxury: Crown };
const EFFECTS: [string, string][] = [["hunger", "Hunger"], ["energy", "Energy"], ["happy", "Happy"], ["hygiene", "Hygiene"], ["social", "Social"], ["xp", "XP"]];

function BuyScreen() {
  const p = useMe();
  const act = useGameAction();
  const [cat, setCat] = useState<FurnitureCat>("Sleep");
  const items = FURNITURE.filter((f) => f.cat === cat && f.price > 0);
  const funds = p.cash + p.bank;
  const owned = (id: string) => p.furniture.filter((r) => r.i === id).length;

  return (
    <div>
      <div className="flex items-end justify-between">
        <PageTitle eyebrow="Buy mode" title="Furniture catalogue" />
        <Link to="/play" className="mb-3 text-xs font-semibold text-gold underline">Back to {homeById(p.home_id).name.split(",")[0]}</Link>
      </div>
      <div className="scrollbar-none -mx-3 mb-3 flex gap-2 overflow-x-auto px-3">
        {FURNITURE_CATS.map((c) => { const I = ICONS[c]; return (
          <button key={c} onClick={() => setCat(c)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors", c === cat ? "border-gold bg-gold-gradient text-gold-foreground" : "border-surface-foreground/15 bg-surface-foreground/5 text-surface-foreground/75")}>
            <I className="size-4" />{c}
          </button>
        ); })}
      </div>
      <p className="mb-3 text-xs text-surface-foreground/60">Spending power {formatNaira(funds)} (cash + bank). Purchases are delivered and placed in your home automatically.</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((it) => (
          <article key={it.id} className="flex flex-col rounded-2xl border bg-card p-3 shadow-card animate-rise">
            <div className="relative grid place-items-center rounded-xl bg-[radial-gradient(circle_at_50%_70%,var(--accent),var(--muted))]">
              <ItemPreview it={it} size={130} />
              {owned(it.id) > 0 && <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Owned ×{owned(it.id)}</span>}
            </div>
            <h3 className="mt-2 text-sm font-semibold leading-tight">{it.name}</h3>
            <p className="text-[11px] text-muted-foreground">{it.w}×{it.d} tiles · {Math.round(it.h * 2.5)}cm tall</p>
            <p className="text-[11px]"><Stars n={it.quality} /> <span className="text-muted-foreground">Comfort +{it.comfort}</span></p>
            {it.use && <p className="mt-1 text-[11px] text-muted-foreground">{it.verb}: {EFFECTS.filter(([k]) => it.use![k as keyof typeof it.use]).map(([k, l]) => `${(it.use![k as keyof typeof it.use] as number) > 0 ? "+" : ""}${it.use![k as keyof typeof it.use]} ${l}`).join(", ")}{it.use.earn ? `, +${formatNaira(it.use.earn)}` : ""}</p>}
            <div className="flex-1" />
            <Button size="sm" className="mt-2 w-full" disabled={act.isPending || funds < it.price} onClick={() => act.mutate({ type: "buyItem", itemId: it.id })}>
              {funds < it.price ? "Can't afford" : "Buy"} · {formatNaira(it.price)}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
