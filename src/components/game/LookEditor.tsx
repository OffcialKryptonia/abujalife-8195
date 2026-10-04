import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { ACCESSORIES, HAIRS, OUTFITS } from "@/game/content";
import { updateLook } from "@/lib/game.functions";
import { playerQueryKey, type Player } from "@/hooks/use-player";
import { CharacterPortrait, type Pose } from "./PlayerCharacter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POSES: Pose[] = ["idle", "cheer", "phone", "walk", "eat"];

function Chips<T extends string>({ label, value, options, onPick, render }: { label: string; value: T; options: readonly { id: T; name: string }[]; onPick: (v: T) => void; render?: (id: T) => React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">{label}</p>
      <div className="scrollbar-none -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {options.map((o) => (
          <button key={o.id} onClick={() => onPick(o.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95", value === o.id ? "border-gold bg-gold-gradient text-gold-foreground shadow-gold" : "border-surface-foreground/15 bg-surface-foreground/5 text-surface-foreground/80")}>
            {render?.(o.id)}{o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LookEditor({ p, onClose }: { p: Player; onClose: () => void }) {
  const [skin, setSkin] = useState(p.skin);
  const [gender, setGender] = useState(p.gender);
  const [hair, setHair] = useState(p.hair);
  const [accessory, setAcc] = useState(p.accessory);
  const [pi, setPi] = useState(0);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(updateLook);
  const qc = useQueryClient();
  useEffect(() => { const t = setInterval(() => setPi((i) => (i + 1) % POSES.length), 2200); return () => clearInterval(t); }, []);
  const outfit = OUTFITS.find((o) => o.id === p.outfit)?.name ?? "";

  async function submit() {
    setSaving(true);
    const res = await save({ data: { skin: skin as "1", gender: gender as "male", hair, accessory } }).catch(() => ({ ok: false as const }));
    setSaving(false);
    if (res.ok) { toast.success("Looking sharp!"); await qc.invalidateQueries({ queryKey: playerQueryKey }); onClose(); }
    else toast.error("Couldn't save your look.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-surface/70 backdrop-blur-sm animate-screen-in" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-t-[32px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-surface-foreground" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">Wardrobe</p><h2 className="text-lg font-semibold">Your look</h2></div>
          <button aria-label="Close" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-surface-foreground/10"><X className="size-4" /></button>
        </div>
        <div className="relative mb-3 grid place-items-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_35%,var(--primary),transparent_70%)]">
          <CharacterPortrait look={{ skin, gender, outfit: p.outfit, hair, accessory }} pose={POSES[pi] ?? "idle"} size={130} />
          <span className="absolute bottom-2 rounded-full bg-surface/70 px-2.5 py-0.5 text-[10px] font-semibold">Wearing {outfit} · buy more in Boutique</span>
        </div>
        <div className="space-y-3">
          <Chips label="Skin tone" value={skin} options={["1", "2", "3", "4"].map((id, i) => ({ id, name: ["Light", "Honey", "Cocoa", "Ebony"][i]! }))} onPick={setSkin} render={(id) => <span className="size-3.5 rounded-full ring-1 ring-surface-foreground/30" style={{ background: `var(--skin-${id})` }} />} />
          <Chips label="Presentation" value={gender} options={[{ id: "male", name: "Masculine" }, { id: "female", name: "Feminine" }]} onPick={setGender} />
          <Chips label="Hair" value={hair} options={HAIRS} onPick={setHair} />
          <Chips label="Accessory" value={accessory} options={ACCESSORIES} onPick={setAcc} />
        </div>
        <Button className="mt-4 h-12 w-full bg-gold-gradient text-base text-gold-foreground shadow-gold" disabled={saving} onClick={submit}>{saving ? "Saving…" : "Save look"}</Button>
      </div>
    </div>
  );
}
