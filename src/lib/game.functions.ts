import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applyAction, GameRuleError, type GameAction, type PlayerState } from "@/game/rules";
import { ACCESSORY_IDS, backgroundById, BACKGROUNDS, DISTRICT_IDS, HAIR_IDS, FACE_IDS, SHOE_IDS } from "@/game/content";
import { creditAuthoritativeGameMoney, debitAuthoritativeGameMoney, getAuthoritativeGameMoney } from "@/lib/game-economy.server";

const id = z.string().max(40);
const amount = z.number().int().positive().max(1e10);
const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("work") }),
  z.object({ type: z.literal("visit"), placeId: id }),
  z.object({ type: z.literal("order"), menuId: id }),
  z.object({ type: z.literal("travel"), to: z.enum(DISTRICT_IDS), vehicle: id.optional(), mode: z.enum(["taxi", "keke", "bus", "walk"]).optional() }),
  z.object({ type: z.literal("applyJob"), jobId: id }),
  z.object({ type: z.literal("quitJob") }),
  z.object({ type: z.literal("moveHome"), homeId: id }),
  z.object({ type: z.literal("deposit"), amount }),
  z.object({ type: z.literal("withdraw"), amount }),
  z.object({ type: z.literal("useItem"), uid: id }),
  z.object({ type: z.literal("buyItem"), itemId: id }),
  z.object({ type: z.literal("placeItem"), uid: id, x: z.number().int().min(0).max(20), y: z.number().int().min(0).max(20), r: z.number().int().min(0).max(3) }),
  z.object({ type: z.literal("storeItem"), uid: id }),
  z.object({ type: z.literal("sellItem"), uid: id }),
  z.object({ type: z.literal("buyVehicle"), vehicleId: id }),
  z.object({ type: z.literal("buyOutfit"), outfitId: id }),
  z.object({ type: z.literal("claimChallenge") }),
  z.object({ type: z.literal("invest"), amount }),
  z.object({ type: z.literal("cashOut") }),
  z.object({ type: z.literal("playGame"), gameId: id }),
]);

export const performAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => actionSchema.parse(d) as GameAction)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("players").select("*").eq("user_id", context.userId).maybeSingle();
    if (error || !row) return { ok: false as const, message: "Create your character first." };
    const canonicalBalance = await getAuthoritativeGameMoney(context.userId);
    const ruleState = { ...(row as unknown as PlayerState), cash: canonicalBalance, bank: 0 };

    let result;
    try {
      result = applyAction(ruleState, data, { uid: crypto.randomUUID().slice(0, 8) });
    } catch (e) {
      if (e instanceof GameRuleError) return { ok: false as const, message: e.message };
      throw e;
    }
    const n = result.next;
    const startingBalance = canonicalBalance;
    const endingBalance = n.cash;
    const netMoneyDelta = endingBalance - startingBalance;
    const actionReference = crypto.randomUUID();
    const originalUpdatedAt = row.updated_at;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Settle Game Money first. If the player save later loses an optimistic
    // concurrency check, the wallet mutation is explicitly compensated.
    if (netMoneyDelta > 0) {
      await creditAuthoritativeGameMoney(
        context.userId,
        netMoneyDelta,
        "game_action",
        actionReference,
        result.message,
        { action: data.type },
      );
    } else if (netMoneyDelta < 0) {
      await debitAuthoritativeGameMoney(
        context.userId,
        Math.abs(netMoneyDelta),
        "game_action",
        actionReference,
        result.message,
        { action: data.type },
      );
    }

    const { data: savedRows, error: upErr } = await supabaseAdmin
      .from("players")
      .update({
        district: n.district, cash: 0, bank: 0, hunger: n.hunger, energy: n.energy,
        happiness: n.happiness, xp: n.xp, reputation: n.reputation, job_id: n.job_id,
        career_xp: n.career_xp, shifts: n.shifts, home_id: n.home_id, game_minutes: n.game_minutes,
        hygiene: n.hygiene, social: n.social, outfit: n.outfit, furniture: n.furniture as never, vehicles: n.vehicles as never,
        last_challenge_day: n.last_challenge_day, invest_amount: n.invest_amount, invest_start: n.invest_start, has_nin: n.has_nin,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", context.userId)
      .eq("updated_at", originalUpdatedAt)
      .select("user_id");

    if (upErr || !savedRows?.length) {
      // Another player-state mutation won the race. Never leave the wallet
      // changed for an action whose corresponding state update did not commit.
      try {
        if (netMoneyDelta > 0) {
          await debitAuthoritativeGameMoney(
            context.userId,
            netMoneyDelta,
            "game_action_compensation",
            actionReference,
            "Compensation after concurrent player-state update conflict",
            { action: data.type, compensates: actionReference },
          );
        } else if (netMoneyDelta < 0) {
          await creditAuthoritativeGameMoney(
            context.userId,
            Math.abs(netMoneyDelta),
            "game_action_compensation",
            actionReference,
            "Compensation after concurrent player-state update conflict",
            { action: data.type, compensates: actionReference },
          );
        }
      } catch (compensationError) {
        console.error("Game Money compensation failed", { compensationError, actionReference, userId: context.userId });
      }
      console.error("Player save lost optimistic concurrency race", { upErr, actionReference, userId: context.userId });
      return { ok: false as const, message: "That action conflicted with another update. Nothing was charged; please try again." };
    }

    return { ok: true as const, message: result.message };
  });

const createSchema = z.object({
  name: z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N} .'-]+$/u),
  gender: z.enum(["male", "female"]),
  skin: z.enum(["1", "2", "3", "4"]),
  outfit: z.enum(["agbada", "kaftan", "ankara", "corporate", "street", "senator", "asooke"]),
  background: z.enum(BACKGROUNDS.map((b) => b.id) as [string, ...string[]]),
  hair: z.enum(HAIR_IDS).optional(),
  accessory: z.enum(ACCESSORY_IDS).optional(),
  face: z.enum(FACE_IDS).optional(),
  shoes: z.enum(SHOE_IDS).optional(),
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
      background: bg.id, hair: data.hair ?? (data.gender === "female" ? "braids" : "fade"), accessory: data.accessory ?? "none", face: data.face ?? "calm", shoes: data.shoes ?? "sneakers", cash: 0, bank: 0, xp: bg.xp, reputation: bg.rep,
    });
    if (error) { console.error(error); return { ok: false as const, message: "Couldn't create character." }; }
    if (bg.cash + bg.bank > 0) {
      try {
        await creditAuthoritativeGameMoney(context.userId, bg.cash + bg.bank, "character_start", crypto.randomUUID(), `Starting funds — ${bg.name}`, { background: bg.id });
      } catch (creditError) {
        await supabaseAdmin.from("players").delete().eq("user_id", context.userId);
        console.error(creditError);
        return { ok: false as const, message: "Couldn't initialize your Game Money wallet." };
      }
    }
    return { ok: true as const, message: "Welcome to Abuja!" };
  });

const lookSchema = z.object({
  skin: z.enum(["1", "2", "3", "4"]),
  gender: z.enum(["male", "female"]),
  hair: z.enum(HAIR_IDS),
  accessory: z.enum(ACCESSORY_IDS),
  face: z.enum(FACE_IDS),
  shoes: z.enum(SHOE_IDS),
});

/** Cosmetic look changes are free; validated against the catalogue server-side. */
export const updateLook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => lookSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("players").update({ ...data, updated_at: new Date().toISOString() }).eq("user_id", context.userId);
    if (error) { console.error(error); return { ok: false as const }; }
    return { ok: true as const };
  });
