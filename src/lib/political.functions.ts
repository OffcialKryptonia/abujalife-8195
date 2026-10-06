import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ABUJA_POLITICAL_OFFICES } from "@/game/abuja-life";
const officeById = (officeId: string) => ABUJA_POLITICAL_OFFICES.find((o) => o.id === officeId);
const activeWindow = (openAt: string | null, closeAt: string | null, now = Date.now()) => {
  if (!openAt || !closeAt) return true;
  const start = Date.parse(openAt), end = Date.parse(closeAt);
  return Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end;
};


const id = z.string().min(1).max(80);

async function dbFor(context: any) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getPoliticalState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await dbFor(context);
    const [{ data: profile }, { data: elections }] = await Promise.all([
      db.from("political_profiles").select("*").eq("user_id", context.userId).maybeSingle(),
      db.from("elections").select("*").eq("city", "abuja").order("created_at", { ascending: false }).limit(20),
    ]);
    const ids = (elections ?? []).map((e: any) => e.id);
    const { data: candidates } = ids.length ? await db.from("election_candidates").select("id,election_id,user_id,party,manifesto,votes,status").in("election_id", ids).eq("status", "approved") : { data: [] as any[] };
    return { profile: profile ?? null, elections: elections ?? [], candidates: candidates ?? [], offices: ABUJA_POLITICAL_OFFICES };
  });

export const registerPoliticalCandidate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ electionId: z.string().uuid(), officeId: id, party: z.string().trim().min(2).max(60), manifesto: z.string().trim().min(20).max(1200) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await dbFor(context);
    const { data: election } = await db.from("elections").select("*").eq("id", data.electionId).single();
    const office = officeById(data.officeId);
    if (!office || !office.elected || office.appointment) throw new Error("This office is not contestable in AbujaLife.");
    if (!election || election.city !== "abuja" || election.office_id !== data.officeId) throw new Error("This election is not available for this office.");
    if (election.status !== "registration" || !activeWindow(election.registration_opens_at, election.registration_closes_at)) throw new Error("Candidate registration is closed.");
    const { error } = await db.from("election_candidates").insert({ election_id: data.electionId, user_id: context.userId, party: data.party, manifesto: data.manifesto });
    if (error) throw new Error(error.message);
    await db.from("political_profiles").upsert({ user_id: context.userId, party: data.party, manifesto: data.manifesto, updated_at: new Date().toISOString() });
    return { ok: true };
  });

export const voteInElection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ electionId: z.string().uuid(), candidateId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await dbFor(context);
    const { data: election } = await db.from("elections").select("status,voting_opens_at,voting_closes_at").eq("id", data.electionId).single();
    if (!election || election.status !== "voting" || !activeWindow(election.voting_opens_at, election.voting_closes_at)) throw new Error("Voting is not open.");
    const { data: candidate } = await db.from("election_candidates").select("id,election_id,status").eq("id", data.candidateId).single();
    if (!candidate || candidate.election_id !== data.electionId || candidate.status !== "approved") throw new Error("That candidate is not valid for this election.");
    const { error } = await db.from("election_votes").insert({ election_id: data.electionId, voter_id: context.userId, candidate_id: data.candidateId });
    if (error) throw new Error(error.code === "23505" ? "You have already voted in this election." : error.message);
    const { data: current } = await db.from("election_candidates").select("votes").eq("id", data.candidateId).single();
    if (!current) throw new Error("Candidate record disappeared.");
    await db.from("election_candidates").update({ votes: current.votes + 1 }).eq("id", data.candidateId).eq("election_id", data.electionId);
    return { ok: true };
  });
