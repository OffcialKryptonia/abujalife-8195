import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const transferGameMoneyToPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({
      recipientId: z.string().uuid(),
      amount: z.number().int().positive().max(10_000_000),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    if (data.recipientId === context.userId) {
      throw new Error("Game Money transfers must be player-to-player.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: recipient } = await supabaseAdmin
      .from("players")
      .select("user_id,name")
      .eq("user_id", data.recipientId)
      .maybeSingle();

    if (!recipient) throw new Error("That player could not be found.");

    const { data: sender } = await supabaseAdmin
      .from("players")
      .select("game_money")
      .eq("user_id", context.userId)
      .gte("game_money", data.amount)
      .maybeSingle();

    if (!sender) throw new Error("Not enough Game Money.");

    const { data: debited, error: debitError } = await supabaseAdmin
      .from("players")
      .update({
        game_money: sender.game_money - data.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", context.userId)
      .gte("game_money", data.amount)
      .select("game_money")
      .maybeSingle();

    if (debitError || !debited) throw new Error("Transfer could not be completed.");

    const { data: credited, error: creditError } = await supabaseAdmin
      .from("players")
      .update({
        game_money: (await supabaseAdmin.from("players").select("game_money").eq("user_id", recipient.user_id).single()).data?.game_money + data.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", recipient.user_id)
      .select("game_money")
      .maybeSingle();

    if (creditError || !credited) {
      await supabaseAdmin
        .from("players")
        .update({ game_money: sender.game_money, updated_at: new Date().toISOString() })
        .eq("user_id", context.userId);
      throw new Error("Transfer could not be completed.");
    }

    const now = new Date().toISOString();
    await supabaseAdmin.from("transactions").insert([
      {
        user_id: context.userId,
        amount: -data.amount,
        label: `Game Money sent to ${recipient.name}`,
        kind: "game_money_transfer",
        currency: "GAME_MONEY",
        created_at: now,
      },
      {
        user_id: recipient.user_id,
        amount: data.amount,
        label: "Game Money received",
        kind: "game_money_transfer",
        currency: "GAME_MONEY",
        created_at: now,
      },
    ]);

    return {
      ok: true,
      amount: data.amount,
      recipientId: recipient.user_id,
      recipientName: recipient.name,
      balance: credited.game_money,
    };
  });
