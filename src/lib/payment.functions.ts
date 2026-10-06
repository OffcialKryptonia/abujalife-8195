import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const productId = z.string().regex(/^gm_[a-z0-9_]+$/);
const providerSchema = z.enum(["korapay", "pocketfi"]);

async function adminDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createGameMoneyCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ productId, provider: providerSchema, customerName: z.string().trim().max(100).optional(), customerEmail: z.string().email().optional(), phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminDb();
    const { data: authUser } = await context.supabase.auth.getUser();
    const customerEmail = data.customerEmail ?? authUser?.user?.email ?? "player@example.com";
    const { data: product } = await db.from("game_currency_products").select("*").eq("id", data.productId).eq("active", true).single();
    if (!product) throw new Error("Game Money pack is unavailable.");
    const reference = `AL-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await db.from("payment_orders").insert({ user_id: context.userId, provider: data.provider, product_id: product.id, reference, amount_ngn: product.price_ngn, game_money: product.game_money });
    if (error) throw new Error(error.message);

    if (data.provider === "korapay") {
      const secret = process.env.KORAPAY_SECRET_KEY;
      if (!secret) return { ok: true, reference, provider: "korapay", checkoutUrl: null, configured: false };
      const response = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: product.price_ngn, currency: "NGN", reference, merchant_bears_cost: true, customer: { name: data.customerName ?? "AbujaLife Player", email: customerEmail }, metadata: { game: "abujalife", product: product.id }, notification_url: process.env.KORAPAY_WEBHOOK_URL, redirect_url: process.env.KORAPAY_REDIRECT_URL }),
      });
      const payload = await response.json() as any;
      if (!response.ok || !payload?.status) throw new Error(payload?.message ?? "Korapay checkout could not be initialized.");
      await db.from("payment_orders").update({ provider_reference: payload.data?.reference ?? reference, provider_payload: payload }).eq("reference", reference);
      return { ok: true, reference, provider: "korapay", checkoutUrl: payload.data?.checkout_url ?? null, configured: true };
    }

    const pocketKey = process.env.POCKETFI_SECRET_KEY;
    const pocketBusiness = process.env.POCKETFI_BUSINESS_ID;
    const pocketEndpoint = process.env.POCKETFI_CHECKOUT_ENDPOINT ?? "https://api.pocketfi.ng/api/v1/checkout/request";
    if (!pocketKey || !pocketBusiness || !data.phone) return { ok: true, reference, provider: "pocketfi", checkoutUrl: null, configured: false };
    const names = (data.customerName ?? "AbujaLife Player").trim().split(/\s+/);
    const response = await fetch(pocketEndpoint, { method: "POST", headers: { Authorization: `Bearer ${pocketKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ first_name: names[0] ?? "Player", last_name: names.slice(1).join(" ") || "Player", phone: data.phone, business_id: pocketBusiness, email: customerEmail, redirect_link: process.env.POCKETFI_REDIRECT_URL, amount: String(product.price_ngn), reference }) });
    const payload = await response.json() as any;
    if (!response.ok || payload?.status !== "success") throw new Error(payload?.message ?? "PocketFi checkout could not be initialized.");
    await db.from("payment_orders").update({ provider_reference: payload.payment_id ?? reference, provider_payload: payload }).eq("reference", reference);
    return { ok: true, reference, provider: "pocketfi", checkoutUrl: payload.payment_link ?? null, configured: true };
  });

export const verifyKorapayGameMoney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ reference: z.string().min(8).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const secret = process.env.KORAPAY_SECRET_KEY;
    if (!secret) throw new Error("Korapay is not configured on the server.");
    const db = await adminDb();
    const { data: order } = await db.from("payment_orders").select("*").eq("reference", data.reference).eq("user_id", context.userId).single();
    if (!order) throw new Error("Payment order not found.");
    if (order.status === "paid") return { ok: true, credited: false, gameMoney: order.game_money };
    const response = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(data.reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
    const payload = await response.json() as any;
    const paid = payload?.status === true && payload?.data?.status === "success";
    if (!paid) return { ok: false, status: payload?.data?.status ?? "pending" };
    const { data: player } = await db.from("players").select("game_money").eq("user_id", context.userId).single();
    if (!player) throw new Error("Player not found.");
    const { data: claimed } = await db.from("payment_orders").update({ status: "paid", provider_payload: payload, paid_at: new Date().toISOString() }).eq("id", order.id).eq("status", "pending").select("id").maybeSingle();
    if (!claimed) return { ok: true, credited: false, gameMoney: order.game_money };
    await db.from("players").update({ game_money: player.game_money + order.game_money, updated_at: new Date().toISOString() }).eq("user_id", context.userId);
    await db.from("transactions").insert({ user_id: context.userId, amount: order.game_money, label: `Game Money purchase — ${order.product_id}`, kind: "game_money", currency: "GAME_MONEY" });
    return { ok: true, credited: true, gameMoney: order.game_money };
  });


export const verifyPocketFiGameMoney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ reference: z.string().min(8).max(120), paymentId: z.string().min(4).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.POCKETFI_SECRET_KEY;
    const endpoint = process.env.POCKETFI_CONFIRM_ENDPOINT ?? "https://api.pocketfi.ng/api/v1/checkout/confirm";
    if (!key) throw new Error("PocketFi is not configured on the server.");
    const db = await adminDb();
    const { data: order } = await db.from("payment_orders").select("*").eq("reference", data.reference).eq("user_id", context.userId).single();
    if (!order) throw new Error("Payment order not found.");
    if (order.status === "paid") return { ok: true, credited: false, gameMoney: order.game_money };
    const response = await fetch(endpoint, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ payment_id: data.paymentId }) });
    const payload = await response.json() as any;
    if (!response.ok || payload?.status !== "success") return { ok: false, status: payload?.status ?? "pending" };
    const { data: player } = await db.from("players").select("game_money").eq("user_id", context.userId).single();
    if (!player) throw new Error("Player not found.");
    const { data: claimed } = await db.from("payment_orders").update({ status: "paid", provider_reference: data.paymentId, provider_payload: payload, paid_at: new Date().toISOString() }).eq("id", order.id).eq("status", "pending").select("id").maybeSingle();
    if (!claimed) return { ok: true, credited: false, gameMoney: order.game_money };
    await db.from("players").update({ game_money: player.game_money + order.game_money, updated_at: new Date().toISOString() }).eq("user_id", context.userId);
    await db.from("transactions").insert({ user_id: context.userId, amount: order.game_money, label: `Game Money purchase — ${order.product_id}`, kind: "game_money", currency: "GAME_MONEY" });
    return { ok: true, credited: true, gameMoney: order.game_money };
  });
