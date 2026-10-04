import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applyAction, GameRuleError, type GameAction, type PlayerState } from "@/game/rules";
import { backgroundById, BACKGROUNDS } from "@/game/content";

const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("work") }),
  z.object({ type: z.literal("eat"), foodId: z.string().max(40) }),
  z.object({ type: z.literal("rest") }),
  z.object({ type: z.literal("travel"), to: z.enum(["maitama", "asokoro", "wuse2", "garki", "jabi", "gwarinpa", "kubwa", "lugbe"]) }),
  z.object({ type: z.literal("applyJob"), jobId: z.string().max(40) }),
  z.object({ type: z.literal("quitJob") }),
  z.object({ type: z.literal("moveHome"), homeId: z.string().max(40) }),
  z.object({ type: z.literal("deposit"), amount: z.number().int().positive().max(1e10) }),
  z.object({ type: z.literal("withdraw"), amount: z.number().int().positive().max(1e10) }),
  z.object({ type: z.literal("hangout"), hangoutId: z.string().max(40) }),
]);

export const performAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => actionSchema.parse(d) as GameAction)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("players").select("*").eq("user_id", context.userId).maybeSingle();
    if (error || !row) return { ok: false as const, message: "Create your character first." };
    let result;
    try {
      result = applyAction(row as PlayerState, data);
    } catch (e) {
      if (e instanceof GameRuleError) return { ok: false as const, message: e.message };
      throw e;
    }
    const n = result.next;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: upErr } = await supabaseAdmin.from("players").update({
      district: n.district, cash: n.cash, bank: n.bank, hunger: n.hunger, energy: n.energy,
      happiness: n.happiness, xp: n.xp, reputation: n.reputation, job_id: n.job_id,
      career_xp: n.career_xp, shifts: n.shifts, home_id: n.home_id, game_minutes: n.game_minutes,
      updated_at: new Date().toISOString(),
    }).eq("user_id", context.userId);
    if (upErr) { console.error(upErr); return { ok: false as const, message: "Couldn't save. Try again." }; }
    if (result.tx?.length) {
      await supabaseAdmin.from("transactions").insert(result.tx.map((t) => ({ ...t, user_id: context.userId })));
    }
    return { ok: true as const, message: result.message };
  });

const createSchema = z.object({
  name: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N} .'-]+$/u),
  gender: z.enum(["male", "female"]),
  skin: z.enum(["1", "2", "3", "4"]),
  outfit: z.enum(["agbada", "kaftan", "ankara", "corporate", "street"]),
  background: z.enum(BACKGROUNDS.map((b) => b.id) as [string, ...string[]]),
});

export const createCharacter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    const bg = backgroundById(data.background);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin.from("players").select("user_id").eq("user_id", context.userId).maybeSingle();
    if (existing) return { ok: false as const, message: "You already have a character." };
    const { error } = await supabaseAdmin.from("players").insert({
      user_id: context.userId, name: data.name, gender: data.gender, skin: data.skin, outfit: data.outfit,
      background: bg.id, cash: bg.cash, bank: bg.bank, xp: bg.xp, reputation: bg.rep,
    });
    if (error) { console.error(error); return { ok: false as const, message: "Couldn't create character." }; }
    await supabaseAdmin.from("transactions").insert({ user_id: context.userId, amount: bg.cash + bg.bank, label: `Starting funds — ${bg.name}`, kind: "start" });
    return { ok: true as const, message: "Welcome to Abuja!" };
  });
