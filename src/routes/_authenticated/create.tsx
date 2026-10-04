import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createCharacter } from "@/lib/game.functions";
import { ACCESSORIES, BACKGROUNDS, FACES, HAIRS, OUTFITS, SHOES } from "@/game/content";
import { formatNaira } from "@/game/rules";
import { CharacterPortrait, type Pose } from "@/components/game/PlayerCharacter";
import { haptic } from "@/components/game/motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Create your character — AbujaLife" },
      { name: "description", content: "Choose your look and life background before arriving in Abuja." },
      { property: "og:title", content: "Create your character — AbujaLife" },
      { property: "og:description", content: "Choose your look and life background." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreateCharacter,
});

const START_OUTFITS = ["street", "ankara", "kaftan", "corporate", "senator", "agbada", "asooke"] as const;
type OutfitId = (typeof START_OUTFITS)[number];
const SKINS = [["1", "Light"], ["2", "Honey"], ["3", "Cocoa"], ["4", "Ebony"]] as const;
const TABS = ["Body", "Hair", "Face", "Outfit", "Extras"] as const;
const POSES: Pose[] = ["idle", "cheer", "walk", "phone"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={() => { haptic(); onClick(); }} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-semibold transition-all active:scale-95", on ? "bg-gold-gradient text-gold-foreground shadow-gold" : "glass text-surface-foreground/80")}>{children}</button>
  );
}

function CreateCharacter() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [skin, setSkin] = useState<"1" | "2" | "3" | "4">("3");
  const [outfit, setOutfit] = useState<OutfitId>("ankara");
  const [hair, setHair] = useState<string>("fade");
  const [face, setFace] = useState<string>("calm");
  const [shoes, setShoes] = useState<string>("sneakers");
  const [accessory, setAcc] = useState<string>("none");
  const [background, setBackground] = useState("graduate");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Body");
  const [pi, setPi] = useState(0);
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createCharacter);
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => { const t = setInterval(() => setPi((i) => (i + 1) % POSES.length), 2600); return () => clearInterval(t); }, []);

  async function submit() {
    if (name.trim().length < 2) { toast.error("Pick a name (2+ letters)."); return; }
    setBusy(true);
    try {
      const res = await create({ data: { name: name.trim(), gender, skin, outfit, background, hair, face, shoes, accessory } });
      if (!res.ok) { toast.error(res.message); if (res.message.includes("already")) navigate({ to: "/play" }); return; }
      await qc.invalidateQueries({ queryKey: ["player"] });
      toast.success(res.message);
      navigate({ to: "/play" });
    } catch {
      toast.error("Check your details and try again.");
    } finally { setBusy(false); }
  }

  const look = { skin, gender, outfit, hair, face, shoes, accessory };

  return (
    <main className="min-h-screen bg-surface-gradient px-4 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))] text-surface-foreground">
      <div className="mx-auto max-w-xl space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">New resident</p>
          <h1 className="text-2xl font-semibold">Who's arriving in Abuja?</h1>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-surface-foreground/10 bg-[radial-gradient(90%_70%_at_50%_30%,var(--primary),transparent_75%)] shadow-[0_30px_60px_-25px_oklch(0_0_0/0.8)]">
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,oklch(0_0_0/0.35))]" />
          <div className="relative grid place-items-center pt-2">
            <CharacterPortrait look={look} pose={POSES[pi] ?? "idle"} size={150} />
          </div>
          <div className="relative -mt-4 pb-3 text-center">
            <p className="font-display text-xl font-semibold">{name || "Your name"}</p>
            <p className="text-xs text-surface-foreground/60">{OUTFITS.find((o) => o.id === outfit)?.name} · {BACKGROUNDS.find((b) => b.id === background)?.name}</p>
          </div>
        </div>

        <input maxLength={24} placeholder="Your name, e.g. Amaka Bello" value={name} onChange={(e) => setName(e.target.value)}
          className="glass h-12 w-full rounded-2xl px-4 text-base text-surface-foreground placeholder:text-surface-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold" />

        <div className="glass flex gap-1 rounded-2xl p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("h-10 flex-1 rounded-xl text-xs font-bold transition-all", tab === t ? "bg-gold-gradient text-gold-foreground shadow-gold" : "text-surface-foreground/65")}>{t}</button>
          ))}
        </div>

        <div key={tab} className="grid grid-cols-2 gap-2 animate-rise sm:grid-cols-3">
          {tab === "Body" && <>
            {(["male", "female"] as const).map((g) => <Chip key={g} on={gender === g} onClick={() => { setGender(g); if (g === "female" && hair === "fade") setHair("braids"); if (g === "male" && hair === "braids") setHair("fade"); }}>{g === "male" ? "Masculine" : "Feminine"}</Chip>)}
            {SKINS.map(([id, n]) => <Chip key={id} on={skin === id} onClick={() => setSkin(id)}><span className="size-5 rounded-full ring-2 ring-surface-foreground/20" style={{ background: `var(--skin-${id})` }} />{n}</Chip>)}
          </>}
          {tab === "Hair" && HAIRS.map((h) => <Chip key={h.id} on={hair === h.id} onClick={() => setHair(h.id)}>{h.name}</Chip>)}
          {tab === "Face" && FACES.map((f) => <Chip key={f.id} on={face === f.id} onClick={() => setFace(f.id)}>{f.name}</Chip>)}
          {tab === "Outfit" && START_OUTFITS.map((o) => { const it = OUTFITS.find((x) => x.id === o)!; return <Chip key={o} on={outfit === o} onClick={() => setOutfit(o)}><span className="size-4 rounded-full" style={{ background: it.color }} />{it.name}</Chip>; })}
          {tab === "Extras" && <>
            {SHOES.map((s) => <Chip key={s.id} on={shoes === s.id} onClick={() => setShoes(s.id)}>{s.name}</Chip>)}
            {ACCESSORIES.map((a) => <Chip key={a.id} on={accessory === a.id} onClick={() => setAcc(a.id)}>{a.name}</Chip>)}
          </>}
        </div>

        <section className="space-y-2 pt-2">
          <h2 className="text-sm font-semibold">Life background</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} onClick={() => { haptic(); setBackground(b.id); }} className={cn("rounded-[22px] p-4 text-left transition-all active:scale-[0.98]", background === b.id ? "bg-surface-foreground/15 ring-2 ring-gold" : "glass")}>
                <p className="font-semibold">{b.name}</p>
                <p className="mt-1 text-xs text-surface-foreground/65">{b.story}</p>
                <p className="mt-2 text-xs font-bold text-gold">{formatNaira(b.cash + b.bank)} · {b.perk}</p>
              </button>
            ))}
          </div>
        </section>

        <button disabled={busy} onClick={submit} className="relative h-14 w-full overflow-hidden rounded-[20px] bg-gold-gradient font-display text-base font-bold text-gold-foreground shadow-gold transition-transform active:scale-[0.98] disabled:opacity-60">
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.5),transparent)] animate-shine" />
          {busy ? "Arriving…" : "Arrive in Abuja"}
        </button>
      </div>
    </main>
  );
}
