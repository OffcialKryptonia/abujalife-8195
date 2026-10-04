import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { createCharacter } from "@/lib/game.functions";
import { BACKGROUNDS } from "@/game/content";
import { formatNaira } from "@/game/rules";
import { Avatar } from "@/components/game/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Create your character — AbujaLife" },
      { name: "description", content: "Choose your look and life background before arriving in Abuja." },
      { property: "og:title", content: "Create your character — AbujaLife" },
      { property: "og:description", content: "Choose your look and life background." },
    ],
  }),
  component: CreateCharacter,
});

const OUTFITS = ["agbada", "kaftan", "ankara", "corporate", "street"] as const;
const SKINS = ["1", "2", "3", "4"] as const;
const skinBg = { "1": "bg-skin-1", "2": "bg-skin-2", "3": "bg-skin-3", "4": "bg-skin-4" };

function CreateCharacter() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [skin, setSkin] = useState<(typeof SKINS)[number]>("2");
  const [outfit, setOutfit] = useState<(typeof OUTFITS)[number]>("ankara");
  const [background, setBackground] = useState("graduate");
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createCharacter);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function submit() {
    if (name.trim().length < 2) { toast.error("Pick a name (2+ letters)."); return; }
    setBusy(true);
    try {
      const res = await create({ data: { name: name.trim(), gender, skin, outfit, background } });
      if (!res.ok) { toast.error(res.message); if (res.message.includes("already")) navigate({ to: "/play" }); return; }
      await qc.invalidateQueries({ queryKey: ["player"] });
      toast.success(res.message);
      navigate({ to: "/play" });
    } catch {
      toast.error("Check your details and try again.");
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <div className="flex items-center gap-4 rounded-3xl bg-surface-gradient p-5 text-surface-foreground animate-rise">
          <Avatar name={name || "You"} skin={skin} size={72} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">New resident</p>
            <h1 className="text-2xl font-semibold">{name || "Your name"}</h1>
            <p className="text-sm capitalize text-surface-foreground/70">{gender} · {outfit}</p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="font-semibold">Name</h2>
          <Input maxLength={24} placeholder="e.g. Chidi Bello" value={name} onChange={(e) => setName(e.target.value)} />
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Look</h2>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className={cn("flex-1 rounded-xl border py-2.5 text-sm font-medium capitalize", gender === g && "border-primary bg-secondary")}>{g}</button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            {SKINS.map((s) => (
              <button key={s} aria-label={`Skin tone ${s}`} onClick={() => setSkin(s)} className={cn("size-10 rounded-full ring-offset-2 ring-offset-background", skinBg[s], skin === s && "ring-2 ring-primary")} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {OUTFITS.map((o) => (
              <button key={o} onClick={() => setOutfit(o)} className={cn("rounded-full border px-4 py-1.5 text-sm capitalize", outfit === o && "border-primary bg-secondary")}>{o}</button>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold">Life background</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {BACKGROUNDS.map((b) => (
              <button key={b.id} onClick={() => setBackground(b.id)} className={cn("rounded-2xl border bg-card p-4 text-left shadow-card transition", background === b.id && "border-primary ring-2 ring-primary/30")}>
                <p className="font-semibold">{b.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.story}</p>
                <p className="mt-3 text-xs font-medium text-primary">{formatNaira(b.cash + b.bank)} · {b.perk}</p>
              </button>
            ))}
          </div>
        </section>

        <Button size="lg" className="w-full" disabled={busy} onClick={submit}>{busy ? "Arriving…" : "Arrive in Abuja"}</Button>
      </div>
    </main>
  );
}
