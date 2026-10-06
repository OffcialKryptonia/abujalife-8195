import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bed, Briefcase, Check, Droplets, Hammer, MapPin, Move, Package, RotateCw, Shirt, Smartphone, Sparkles, Star, Trash2, Trophy, Utensils, X, Moon, Shield } from "lucide-react";
import { useGameAction, useMe } from "@/hooks/use-player";
import { IsoRoom, ItemPreview, wardrobeSpot, type Pt } from "@/components/game/IsoRoom";
import type { Pose } from "@/components/game/PlayerCharacter";
import { FloatingStatFeedback, InteractionBubble, type StatChip } from "@/components/game/feedback";
import { LookEditor } from "@/components/game/LookEditor";
import { CoachCard } from "@/components/game/CoachCard";
import { lightFor } from "@/components/game/DayNightLighting";
import { Stars } from "@/components/game/ui";
import { districtById, homeById, itemById, jobById, PLACES, type FurnitureItem } from "@/game/content";
import { challengeForDay, findSpot, formatGameTime, formatNaira, homeComfort, isOpen, itemDims, type FurnitureRow } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AbujaLifeHub } from "@/components/game/AbujaLifeHub";

export const Route = createFileRoute("/_authenticated/play/")({
  head: () => ({ meta: [{ title: "Home — AbujaLife" }, { name: "description", content: "Live in your Abuja home: sleep, cook, shower and furnish." }, { property: "og:title", content: "Home — AbujaLife" }, { property: "og:description", content: "Your home in virtual Abuja." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: HomeScreen,
});

const EFFECTS: [string, string][] = [["hunger", "Hunger"], ["energy", "Energy"], ["happy", "Happy"], ["hygiene", "Hygiene"], ["social", "Social"], ["xp", "XP"]];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function poseFor(it: FurnitureItem): Pose {
  if (it.shape === "bed") return "sleep";
  if (it.shape === "seat") return it.cat === "Bathroom" ? "sit" : "sit";
  if (it.cat === "Kitchen") return "eat";
  if (it.cat === "Bathroom") return "wash";
  if (it.cat === "Work") return "phone";
  if (it.cat === "Entertainment") return it.shape === "tv" ? "idle" : "cheer";
  return "idle";
}

function chipsFor(it: FurnitureItem): StatChip[] {
  const u = it.use!; const out: StatChip[] = [];
  for (const [k, l] of EFFECTS) { const v = u[k as keyof typeof u] as number | undefined; if (v) out.push({ label: l, v: `${v > 0 ? "+" : ""}${v}`, good: v > 0 }); }
  if (u.cost) out.push({ label: "", v: `−${formatNaira(u.cost)}`, good: false });
  if (u.earn) out.push({ label: "", v: `+${formatNaira(u.earn)}`, good: true });
  return out;
}

function HomeScreen() {
  const p = useMe();
  const act = useGameAction();
  const navigate = useNavigate();
  const home = homeById(p.home_id);
  const t = formatGameTime(p.game_minutes);
  const minute = p.game_minutes % 60;
  const light = lightFor(t.hour);
  const atHome = p.district === home.district;
  const job = jobById(p.job_id);
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [placing, setPlacing] = useState<{ row: FurnitureRow } | null>(null);
  const [avatarAt, setAvatarAt] = useState<Pt | null>(null);
  const [avatarZ, setAvatarZ] = useState(0);
  const [avatarDepth, setAvatarDepth] = useState<number | undefined>(undefined);
  const [flip, setFlip] = useState(false);
  const [pose, setPose] = useState<Pose | null>(null);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [fx, setFx] = useState<{ k: number; at: Pt; z: number; items: StatChip[] } | null>(null);
  const [lookOpen, setLookOpen] = useState(false);
  const [incident, setIncident] = useState(false);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const busy = useRef(false);

  const selRow = p.furniture.find((r) => r.u === sel) ?? null;
  const selItem = selRow ? itemById(selRow.i) : null;
  const bubbleRow = p.furniture.find((r) => r.u === bubble) ?? null;
  const stored = p.furniture.filter((r) => !r.p);
  const comfort = homeComfort(p.furniture);
  const placedCount = p.furniture.filter((r) => r.p).length;

  const defaultAt = useMemo<Pt>(() => {
    const spot = findSpot(p.furniture, home.size, { u: "_av", i: "plastic_chair", x: 0, y: 0, r: 0, p: false });
    return spot ? [spot.x + 0.5, spot.y + 0.5] : [home.size / 2, home.size - 0.5];
  }, [p.furniture, home.size]);
  const at = avatarAt ?? defaultAt;
  const idlePose: Pose = p.energy < 25 ? "tired" : p.happiness < 30 ? "sad" : "idle";

  useEffect(() => { if (!fx) return; const id = setTimeout(() => setFx(null), 2400); return () => clearTimeout(id); }, [fx]);

  const screenX = (q: Pt) => q[0] - q[1];
  function walkTo(target: Pt) {
    setFlip(screenX(target) < screenX(at));
    setAvatarAt(target); setAvatarZ(0); setAvatarDepth(undefined);
  }

  async function use(row: FurnitureRow) {
    if (busy.current) return;
    const it = itemById(row.i); if (!it?.use) return;
    busy.current = true; setBubble(null); setSel(null);
    const { w, d } = itemDims(row);
    const n = home.size;
    const front: Pt = [Math.min(n - 0.5, row.x + w + 0.45), Math.min(n - 0.5, row.y + d / 2)];
    const alt: Pt = [Math.min(n - 0.5, row.x + w / 2), Math.min(n - 0.5, row.y + d + 0.45)];
    const approach = row.x + w >= n ? alt : front;
    walkTo(approach); setPose("walk");
    const req = act.mutateAsync({ type: "useItem", uid: row.u }).catch(() => null);
    await wait(900);
    const ps = poseFor(it);
    if (ps === "sleep" || ps === "sit") {
      setAvatarAt([row.x + w / 2, row.y + d / 2]); setAvatarZ(ps === "sleep" ? it.h + 2 : it.h * 0.5); setAvatarDepth(row.x + row.y + w + d + 0.01);
    }
    setFlip(ps === "sit" ? false : flip);
    setPose(ps); setActiveUid(row.u);
    const [res] = await Promise.all([req, wait(ps === "sleep" ? 2600 : 1900)]);
    setActiveUid(null);
    if (res?.ok) {
      setFx({ k: Date.now(), at: approach, z: 0, items: chipsFor(it) });
      setAvatarAt(approach); setAvatarZ(0); setAvatarDepth(undefined);
      setPose("cheer"); await wait(1100);
    } else { setAvatarAt(approach); setAvatarZ(0); setAvatarDepth(undefined); }
    setPose(null); busy.current = false;
  }

  async function openWardrobe() {
    if (busy.current) return;
    busy.current = true; setBubble(null); setSel(null);
    const w = wardrobeSpot(home.size);
    walkTo(w.front); setPose("walk");
    await wait(900);
    setFlip(true); setWardrobeOpen(true); setPose("wash");
    setFx({ k: Date.now(), at: w.front, z: 0, items: [{ label: "wardrobe", v: "Open", good: true }] });
    await wait(1100);
    setPose(null); busy.current = false;
    setLookOpen(true);
  }

  function openPhone() {
    setPose("phone");
    setTimeout(() => navigate({ to: "/play/phone" }), 650);
  }

  function placeAt(x: number, y: number) {
    if (placing) {
      act.mutate({ type: "placeItem", uid: placing.row.u, x, y, r: placing.row.r }, { onSuccess: (res) => { if (res.ok) { setPlacing(null); setSel(null); } } });
      return;
    }
    if (!edit && atHome && !busy.current) { setBubble(null); walkTo([x + 0.5, y + 0.5]); setPose("walk"); setTimeout(() => setPose(null), 900); }
  }

  // Contextual floating cards, aware of the time of day.
  const challenge = challengeForDay(t.day);
  const claimed = p.last_challenge_day >= t.day;
  const nearby = PLACES.find((pl) => pl.district === p.district && pl.cat === "Events" && isOpen(pl.hours, t.hour));
  const robberyRiskDistricts = ["kubwa", "utako", "wuse", "garki", "lugbe", "apo", "lokogoma", "galadimawa"] as const;
  const incidentSeed = (t.day * 17 + Math.floor(p.game_minutes / 180) * 7 + p.district.length) % 23;
  const robberyWindow = robberyRiskDistricts.includes(p.district as typeof robberyRiskDistricts[number]) && incidentSeed === 3 && p.cash >= 500;
  const findUse = (pred: (it: FurnitureItem) => boolean) => p.furniture.find((r) => r.p && itemById(r.i)?.use && pred(itemById(r.i)!));
  const kitchen = findUse((i) => i.cat === "Kitchen");
  const bath = findUse((i) => i.cat === "Bathroom" && i.shape !== "seat");
  const bed = findUse((i) => i.shape === "bed");
  const cards: { icon: typeof Bed; title: string; sub: string; tone: string; onClick?: () => void; to?: string; search?: Record<string, string> }[] = [];
  if (p.hunger < 45) cards.push(kitchen && atHome ? { icon: Utensils, title: "Eat something", sub: itemById(kitchen.i)!.verb!, tone: "bg-hunger", onClick: () => use(kitchen) } : { icon: Utensils, title: "Eat something", sub: "Order on AbujaEats", tone: "bg-hunger", to: "/play/phone", search: { app: "eats" } });
  if ((t.hour >= 22 || t.hour < 5 || p.energy < 35) && bed && atHome) cards.push({ icon: Moon, title: t.hour >= 22 || t.hour < 5 ? "Time for bed" : "Take a nap", sub: itemById(bed.i)!.name, tone: "bg-energy", onClick: () => use(bed) });
  if ((p.hygiene < 45 || (t.hour >= 5 && t.hour < 9)) && bath && atHome) cards.push({ icon: Droplets, title: t.hour < 9 ? "Morning freshen-up" : "Freshen up", sub: itemById(bath.i)!.verb!, tone: "bg-hygiene", onClick: () => use(bath) });
  if (!claimed) cards.push({ icon: Trophy, title: "Daily challenge", sub: `${challenge.desc} · ${formatNaira(challenge.cash)}`, tone: "bg-gold", onClick: () => act.mutate({ type: "claimChallenge" }, { onSuccess: (r) => { if (r.ok) { setPose("cheer"); setTimeout(() => setPose(null), 1500); } } }) });
  if (!job) cards.push({ icon: Briefcase, title: "Find a job", sub: "Open Jobs on your phone", tone: "bg-primary", to: "/play/phone", search: { app: "jobs" } });
  else if (job.district !== p.district) cards.push({ icon: Briefcase, title: "Go to work", sub: `${job.employer}, ${districtById(job.district).name}`, tone: "bg-primary", to: "/play/map", search: { district: job.district } });
  if (nearby) cards.push({ icon: Sparkles, title: "Happening nearby", sub: nearby.name, tone: "bg-social", to: "/play/map", search: { place: nearby.id } });
  if (robberyWindow && !incident) cards.push({ icon: Shield, title: "Street incident", sub: "You feel someone following you", tone: "bg-destructive", onClick: () => setIncident(true) });

  const avatarPose = pose ?? idlePose;
  const ticker = [
    `🚕 Keke traffic easing on ${districtById(p.district).name} roads`,
    nearby ? `🎉 ${nearby.name} is live right now` : "🎶 AbujaRadio is playing Afrobeats",
    t.hour < 12 ? "☕ Akara & pap spots are open nearby" : t.hour < 18 ? "🛍️ Wuse Market crowds are building" : "🌙 Suya spots are busy tonight",
    job ? `💼 ${job.employer} has a shift open` : "💼 3 new jobs posted on your phone",
    "📈 Invest app: markets ticked up today",
  ];

  return (
    <div className="space-y-3">
      {/* header */}
      <div className="flex items-center gap-2 text-surface-foreground">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold"><MapPin className="size-3" />{districtById(home.district).name}</p>
          <h1 className="truncate text-lg font-semibold leading-tight">{home.name.split(",")[0]}</h1>
          <div className="mt-1 flex gap-1.5 text-[10px] font-bold text-surface-foreground/70">
            <span className="flex items-center gap-1 rounded-full bg-surface-foreground/8 px-2 py-0.5"><Star className="size-3 fill-gold text-gold" />{comfort}</span>
            <span className="rounded-full bg-surface-foreground/8 px-2 py-0.5">{placedCount} items</span>
            <span className="rounded-full bg-surface-foreground/8 px-2 py-0.5">{home.size}×{home.size}</span>
          </div>
        </div>
        <button onClick={() => setLookOpen(true)} aria-label="Change your look" className="glass grid size-10 place-items-center rounded-2xl transition-transform active:scale-90"><Shirt className="size-4 text-gold" /></button>
        {atHome && (
          <button onClick={() => { setEdit(!edit); setPlacing(null); setSel(null); setBubble(null); }} className={cn("flex h-10 items-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition-all active:scale-95", edit ? "bg-gold-gradient text-gold-foreground shadow-gold" : "glass")}>
            {edit ? <><Check className="size-4" />Done</> : <><Hammer className="size-4 text-gold" />Edit</>}
          </button>
        )}
      </div>

      {/* scene */}
      <div className="relative overflow-hidden rounded-[30px] border border-surface-foreground/10 shadow-[0_30px_60px_-25px_oklch(0_0_0/0.8)] transition-[background] duration-1000" style={{ background: light.backdrop }}>
        <IsoRoom
          home={home} furniture={p.furniture} hour={t.hour} minute={minute} selected={edit ? sel : bubble} placing={placing} activeUid={activeUid} hotspots={!edit && atHome}
          avatar={atHome && !edit ? { skin: p.skin, outfit: p.outfit, gender: p.gender, hair: p.hair, accessory: p.accessory, face: p.face, shoes: p.shoes, at, pose: avatarPose, z: avatarZ, flip, depth: avatarDepth } : null}
          onItem={(r) => {
            if (edit) { setSel(r.u === sel ? null : r.u); return; }
            const it = itemById(r.i);
            if (!it?.use) { setSel(r.u); return; }
            setBubble(r.u === bubble ? null : r.u);
          }}
          onTile={placeAt}
          onWardrobe={!edit && atHome ? openWardrobe : undefined} wardrobeOpen={wardrobeOpen}
          overlay={(project) => (
            <>
              {bubbleRow && !edit && (() => { const it = itemById(bubbleRow.i)!; const { w, d } = itemDims(bubbleRow); return (
                <InteractionBubble style={project(bubbleRow.x + w / 2, bubbleRow.y + d / 2, it.h + 26)} title={it.name}
                  actions={[{ label: it.verb ?? "Use", sub: `${it.use!.minutes >= 60 ? `${it.use!.minutes / 60}h` : `${it.use!.minutes}m`}${it.use!.cost ? ` · ${formatNaira(it.use!.cost)}` : ""}`, onClick: () => use(bubbleRow), disabled: act.isPending }]}
                  onInfo={() => { setSel(bubbleRow.u); setBubble(null); }} onClose={() => setBubble(null)} />
              ); })()}
              {fx && <FloatingStatFeedback key={fx.k} items={fx.items} style={project(fx.at[0], fx.at[1], 95)} />}
            </>
          )}
        />
        {/* in-scene chips */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-surface/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-foreground backdrop-blur">
          <span className={cn("size-1.5 rounded-full", light.phase === "night" ? "bg-social" : "bg-gold")} />{light.phase} · {t.clock}
        </div>
        {atHome && !edit && (
          <button onClick={openPhone} aria-label="Open phone" className="glass absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3 text-xs font-bold text-surface-foreground transition-transform active:scale-90">
            <span className="grid size-7 place-items-center rounded-full bg-gold-gradient text-gold-foreground"><Smartphone className="size-4" /></span>Phone
          </button>
        )}
        {!atHome && (
          <div className="absolute inset-0 grid place-items-center bg-surface/60 p-6 text-center text-surface-foreground backdrop-blur-[3px]">
            <div className="animate-rise">
              <MapPin className="mx-auto mb-2 size-7 text-gold" />
              <p className="font-display text-lg font-semibold">You're out in {districtById(p.district).name}</p>
              <p className="mb-3 text-sm text-surface-foreground/70">Head home to {districtById(home.district).name} to use your furniture.</p>
              <Button className="bg-gold-gradient text-gold-foreground shadow-gold" onClick={() => act.mutate({ type: "travel", to: home.district })} disabled={act.isPending}>Ride home</Button>
            </div>
          </div>
        )}
        {placing && (
          <div className="glass absolute inset-x-3 top-3 flex items-center justify-between gap-2 rounded-2xl p-2 pl-3 text-sm text-surface-foreground animate-rise">
            <span className="text-xs">Tap a tile to place <b>{itemById(placing.row.i)!.name}</b></span>
            <div className="flex gap-1">
              <Button size="icon" variant="secondary" aria-label="Rotate" onClick={() => setPlacing({ row: { ...placing.row, r: (placing.row.r + 1) % 4 } })}><RotateCw className="size-4" /></Button>
              <Button size="icon" variant="ghost" aria-label="Cancel" onClick={() => setPlacing(null)}><X className="size-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {incident && robberyWindow && (
        <div className="glass rounded-2xl border border-destructive/30 p-3 text-surface-foreground animate-rise">
          <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive text-destructive-foreground"><Shield className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-semibold">Robbery situation</p><p className="text-xs text-surface-foreground/70">Someone has confronted you on the street. Try to get away or accept the loss.</p><div className="mt-2 flex gap-2"><Button size="sm" variant="destructive" disabled={act.isPending} onClick={() => { setIncident(false); act.mutate({ type: "robbery" }); }}>Get away</Button><Button size="sm" variant="outline" onClick={() => setIncident(false)}>Ignore</Button></div></div></div>
        </div>
      )}
      {!edit && <CityTicker items={ticker} />}
      {!edit && <AbujaLifeHub look={{ skin: p.skin, gender: p.gender, outfit: p.outfit, hair: p.hair, accessory: p.accessory, face: p.face, shoes: p.shoes }} cash={p.cash} reputation={p.reputation} />}
      {!edit && <CoachCard cash={p.cash} />}

      {!edit && cards.length > 0 && (
        <div className="scrollbar-none -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1">
          {cards.map((c, i) => {
            const inner = (
              <>
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl text-surface shadow-[0_6px_16px_-6px_currentColor]", c.tone)}><c.icon className="size-5" /></span>
                <span className="min-w-0 text-left"><span className="block font-display text-[13px] font-bold">{c.title}</span><span className="block truncate text-[11px] text-surface-foreground/60">{c.sub}</span></span>
              </>
            );
            const cls = "glass flex w-56 shrink-0 snap-start items-center gap-2.5 rounded-[20px] p-2.5 text-surface-foreground transition-transform active:scale-95 animate-rise";
            return c.to
              ? <Link key={c.title} to={c.to} search={(c.search ?? {}) as never} className={cls} style={{ animationDelay: `${i * 60}ms` }}>{inner}</Link>
              : <button key={c.title} onClick={c.onClick} disabled={act.isPending} className={cls} style={{ animationDelay: `${i * 60}ms` }}>{inner}</button>;
          })}
        </div>
      )}

      {job && job.district === p.district && !edit && (
        <button className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-gold-gradient font-display text-[15px] font-bold text-gold-foreground shadow-gold transition-transform active:scale-[0.98] disabled:opacity-60" disabled={act.isPending}
          onClick={() => act.mutate({ type: "work" }, { onSuccess: (r) => { if (r.ok) { setPose("cheer"); setTimeout(() => setPose(null), 1500); } } })}>
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.5),transparent)] animate-shine" />
          <Briefcase className="size-5" />Work at {job.employer} · +{formatNaira(job.pay)}
        </button>
      )}

      {edit && (
        <div className="glass rounded-[22px] p-3 text-surface-foreground animate-rise">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Package className="size-4 text-gold" />Storage ({stored.length})</h2>
            <Link to="/play/buy" className="rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-gold-foreground">Shop</Link>
          </div>
          {stored.length === 0 ? <p className="text-xs text-surface-foreground/60">Tap furniture in the room to move, rotate, store or sell it.</p> : (
            <div className="scrollbar-none flex gap-2 overflow-x-auto">
              {stored.map((r) => { const it = itemById(r.i)!; return (
                <button key={r.u} onClick={() => setPlacing({ row: r })} className={cn("w-24 shrink-0 rounded-2xl bg-surface-foreground/8 p-1 transition-transform active:scale-95", placing?.row.u === r.u && "ring-2 ring-gold")}>
                  <ItemPreview it={it} size={88} /><span className="block truncate text-[11px] font-semibold">{it.name}</span>
                </button>
              ); })}
            </div>
          )}
        </div>
      )}

      {selRow && selItem && !placing && (
        <div className="glass fixed inset-x-3 bottom-28 z-40 mx-auto max-w-md rounded-[28px] p-4 text-surface-foreground shadow-[0_20px_50px_-15px_oklch(0_0_0/0.7)] animate-rise">
          <div className="flex gap-3">
            <div className="rounded-2xl bg-surface-foreground/8"><ItemPreview it={selItem} size={84} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between"><h3 className="font-semibold">{selItem.name}</h3><button aria-label="Close" onClick={() => setSel(null)}><X className="size-4 opacity-60" /></button></div>
              <p className="text-xs text-surface-foreground/70"><Stars n={selItem.quality} /> · Comfort +{selItem.comfort}</p>
              {selItem.use && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {chipsFor(selItem).map((c) => <span key={c.v + c.label} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", c.good ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>{c.v} {c.label}</span>)}
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
            <Button className="mt-3 w-full bg-gold-gradient text-gold-foreground shadow-gold" disabled={act.isPending || !atHome} onClick={() => use(selRow)}>{selItem.verb} · {selItem.use.minutes >= 60 ? `${selItem.use.minutes / 60}h` : `${selItem.use.minutes}m`}</Button>
          ) : <p className="mt-3 text-center text-xs text-surface-foreground/60">Decorative — adds comfort, which improves your sleep.</p>}
        </div>
      )}

      {lookOpen && <LookEditor p={p} onClose={() => { setLookOpen(false); setWardrobeOpen(false); setPose("cheer"); setTimeout(() => setPose(null), 1200); }} />}
    </div>
  );
}

function CityTicker({ items }: { items: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % items.length); }, 5000); return () => clearInterval(id); }, [items.length]);
  return (
    <div className="glass flex items-center gap-2 overflow-hidden rounded-full py-1.5 pl-1.5 pr-3 text-surface-foreground">
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-gradient px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-gold-foreground"><span className="size-1.5 rounded-full bg-destructive animate-pulse" />Abuja live</span>
      <span key={i} className="truncate text-[11px] font-semibold animate-rise">{items[i]}</span>
    </div>
  );
}
