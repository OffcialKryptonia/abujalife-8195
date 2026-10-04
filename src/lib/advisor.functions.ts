import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PLACES, districtById, jobById, MENU } from "@/game/content";

const input = z.object({ goal: z.string().trim().min(2).max(200), budget: z.number().int().min(0).max(1e9) });

export interface Advice { ok: true; title: string; why: string; steps: string[]; placeId: string | null; placeName: string | null; cost: number }
type Fail = { ok: false; message: string };

function statusOf(e: unknown): number | undefined {
  const x = e as { statusCode?: number; status?: number; cause?: { statusCode?: number } };
  return x?.statusCode ?? x?.status ?? x?.cause?.statusCode;
}

export const recommendActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => input.parse(d))
  .handler(async ({ data, context }): Promise<Advice | Fail> => {
    const { data: p } = await context.supabase.from("players").select("*").eq("user_id", context.userId).maybeSingle();
    if (!p) return { ok: false, message: "Create your character first." };
    const mins = p.game_minutes as number;
    const hour = Math.floor((mins % 1440) / 60);
    const day = Math.floor(mins / 1440) + 1;
    const job = jobById(p.job_id);
    const affordable = PLACES.filter((pl) => (pl.activity?.cost ?? 0) <= Math.max(data.budget, 0));
    const places = affordable.slice(0, 40).map((pl) => ({
      id: pl.id, name: pl.name, cat: pl.cat, district: districtById(pl.district).name, hours: pl.hours ?? "always",
      activity: pl.activity ? { label: pl.activity.label, cost: pl.activity.cost, minutes: pl.activity.minutes } : null,
    }));
    const ctx = {
      time: `Day ${day}, ${String(hour).padStart(2, "0")}:00`,
      district: districtById(p.district).name,
      cash: p.cash, bank: p.bank,
      needs: { hunger: p.hunger, energy: p.energy, happiness: p.happiness, hygiene: p.hygiene, social: p.social },
      job: job ? { title: job.title, employer: job.employer, district: districtById(job.district).name, pay: job.pay } : null,
      food: MENU.slice(0, 6).map((m) => ({ name: m.name, price: m.price })),
      places,
    };
    const system = "You are the AbujaLife in-game life coach for a Nigerian life simulator set in virtual Abuja. Recommend exactly ONE concrete, doable next activity using only the provided places/food. Respect the budget in naira, the virtual time (places may be closed), and urgent needs (any need under 30 comes first). Reply with ONLY compact JSON: {\"title\": string (under 8 words), \"why\": string (one warm sentence, may use light Nigerian English), \"steps\": string[] (2-4 short in-game steps), \"placeId\": string or null (must be an id from places), \"cost\": number}.";
    const prompt = `Player goal: ${data.goal}\nBudget: ₦${data.budget}\nState: ${JSON.stringify(ctx)}`;
    let text: string;
    try {
      const { askAdvisorModel } = await import("./advisor.server");
      text = await askAdvisorModel(system, prompt);
    } catch (e) {
      const s = statusOf(e);
      console.error("advisor error", s, e);
      if (s === 429) return { ok: false, message: "The coach is busy right now. Try again in a minute." };
      if (s === 402) return { ok: false, message: "AI credits have run out. Add credits in Settings → Plans & credits." };
      if (s === 403) return { ok: false, message: "AI access is blocked for this workspace right now." };
      return { ok: false, message: "The coach couldn't answer. Try again shortly." };
    }
    try {
      const j = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Partial<{ title: string; why: string; steps: unknown; placeId: string | null; cost: number }>;
      const place = PLACES.find((pl) => pl.id === j.placeId) ?? null;
      return {
        ok: true,
        title: String(j.title ?? "Try this next").slice(0, 80),
        why: String(j.why ?? "").slice(0, 300),
        steps: (Array.isArray(j.steps) ? j.steps : []).slice(0, 4).map((s) => String(s).slice(0, 120)),
        placeId: place?.id ?? null, placeName: place?.name ?? null,
        cost: Math.max(0, Math.round(Number(j.cost) || 0)),
      };
    } catch {
      return { ok: false, message: "The coach gave an unclear answer. Try again." };
    }
  });
