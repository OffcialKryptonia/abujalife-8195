import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function adminClient(ctx: Ctx) {
  const { data: ok } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!ok) throw new Error("Forbidden: admins only");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminClient(context);
    const since = new Date(Date.now() - 20 * 60_000).toISOString();
    const day = new Date(Date.now() - 86_400_000).toISOString();
    const count = async (t: string, f?: (q: any) => any) => {
      let q = db.from(t as any).select("*", { count: "exact", head: true });
      if (f) q = f(q);
      const { count } = await q;
      return count ?? 0;
    };
    const [players, online, newPlayers, posts, messages, openReports, txDay] = await Promise.all([
      count("players"),
      count("players", (q) => q.gte("updated_at", since)),
      count("players", (q) => q.gte("created_at", day)),
      count("posts"),
      count("messages"),
      count("reports", (q) => q.eq("status", "open")),
      count("transactions", (q) => q.gte("created_at", day)),
    ]);
    const { data: money } = await db.from("players").select("cash, bank, district, job_id").limit(5000);
    const economy = (money ?? []).reduce((a: number, p: any) => a + p.cash + p.bank, 0);
    const districts: Record<string, number> = {};
    let employed = 0;
    for (const p of money ?? []) { districts[p.district] = (districts[p.district] ?? 0) + 1; if (p.job_id) employed++; }
    return { players, online, newPlayers, posts, messages, openReports, txDay, economy, employed, districts };
  });

export const listPlayers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ search: z.string().max(60).default("") }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    let q = db.from("players").select("user_id,name,district,cash,bank,usd_cash,usd_bank,xp,reputation,job_id,home_id,energy,hunger,happiness,updated_at,created_at").order("updated_at", { ascending: false }).limit(200);
    if (data.search) q = q.ilike("name", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const { data: roles } = await db.from("user_roles").select("user_id, role");
    return (rows ?? []).map((r: any) => ({ ...r, roles: (roles ?? []).filter((x: any) => x.user_id === r.user_id).map((x: any) => x.role) }));
  });

export const updatePlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({
    userId: z.string().uuid(),
    cash: z.number().int().min(0).max(1e10),
    bank: z.number().int().min(0).max(1e10),
    usdCash: z.number().int().min(0).max(1e10),
    usdBank: z.number().int().min(0).max(1e10),
    xp: z.number().int().min(0).max(1e9),
    reputation: z.number().int().min(-1e6).max(1e6),
    reason: z.string().max(80).default("Admin adjustment"),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    const { data: before } = await db.from("players").select("cash,bank,usd_cash,usd_bank").eq("user_id", data.userId).single();
    const { error } = await db.from("players").update({ cash: data.cash, bank: data.bank, usd_cash: data.usdCash, usd_bank: data.usdBank, xp: data.xp, reputation: data.reputation }).eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    const delta = before ? data.cash + data.bank - before.cash - before.bank : 0;
    if (delta !== 0) await db.from("transactions").insert({ user_id: data.userId, amount: delta, label: data.reason, kind: "admin" });
    return { ok: true };
  });

export const setRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ userId: z.string().uuid(), role: z.enum(["admin", "moderator"]), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    if (!data.grant && data.userId === context.userId && data.role === "admin") throw new Error("You can't remove your own admin role.");
    const { error } = data.grant
      ? await db.from("user_roles").upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" })
      : await db.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminClient(context);
    const { data: reports } = await db.from("reports").select("*").order("created_at", { ascending: false }).limit(200);
    const ids = new Set<string>();
    (reports ?? []).forEach((r: any) => { ids.add(r.reporter_id); if (r.target_user) ids.add(r.target_user); });
    const postIds = (reports ?? []).map((r: any) => r.post_id).filter(Boolean);
    const [{ data: names }, { data: posts }] = await Promise.all([
      db.from("players").select("user_id,name").in("user_id", [...ids]),
      postIds.length ? db.from("posts").select("id,body").in("id", postIds) : Promise.resolve({ data: [] as any[] }),
    ]);
    const nm = Object.fromEntries((names ?? []).map((n: any) => [n.user_id, n.name]));
    const pb = Object.fromEntries((posts ?? []).map((p: any) => [p.id, p.body]));
    return (reports ?? []).map((r: any) => ({ ...r, reporter: nm[r.reporter_id] ?? "Unknown", target: r.target_user ? nm[r.target_user] ?? "Unknown" : null, postBody: r.post_id ? pb[r.post_id] ?? null : null }));
  });

export const resolveReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid(), status: z.enum(["open", "resolved", "dismissed"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    await db.from("reports").update({ status: data.status }).eq("id", data.id);
    return { ok: true };
  });

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminClient(context);
    const { data: posts } = await db.from("posts").select("*").order("created_at", { ascending: false }).limit(200);
    const { data: names } = await db.from("players").select("user_id,name").in("user_id", [...new Set((posts ?? []).map((p: any) => p.user_id))]);
    const nm = Object.fromEntries((names ?? []).map((n: any) => [n.user_id, n.name]));
    return (posts ?? []).map((p: any) => ({ ...p, author: nm[p.user_id] ?? "Unknown" }));
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    await db.from("post_likes").delete().eq("post_id", data.id);
    await db.from("post_comments").delete().eq("post_id", data.id);
    await db.from("posts").update({ shared_post_id: null }).eq("shared_post_id", data.id);
    const { error } = await db.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminClient(context);
    const { data: tx } = await db.from("transactions").select("*").order("created_at", { ascending: false }).limit(300);
    const { data: names } = await db.from("players").select("user_id,name").in("user_id", [...new Set((tx ?? []).map((t: any) => t.user_id))]);
    const nm = Object.fromEntries((names ?? []).map((n: any) => [n.user_id, n.name]));
    return (tx ?? []).map((t: any) => ({ ...t, player: nm[t.user_id] ?? "Unknown" }));
  });

export const listElections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await adminClient(context);
    const { data, error } = await db.from("elections").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createElection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ title: z.string().trim().min(4).max(120), city: z.string().default("abuja"), officeId: z.string().min(2).max(60), registrationOpensAt: z.string().datetime().nullable(), registrationClosesAt: z.string().datetime().nullable(), votingOpensAt: z.string().datetime().nullable(), votingClosesAt: z.string().datetime().nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    const { data: row, error } = await db.from("elections").insert({ title: data.title, city: data.city, office_id: data.officeId, status: "draft", registration_opens_at: data.registrationOpensAt, registration_closes_at: data.registrationClosesAt, voting_opens_at: data.votingOpensAt, voting_closes_at: data.votingClosesAt, created_by: context.userId }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const setElectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ electionId: z.string().uuid(), status: z.enum(["draft", "registration", "campaign", "voting", "counting", "completed", "cancelled"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adminClient(context);
    const { error } = await db.from("elections").update({ status: data.status }).eq("id", data.electionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
