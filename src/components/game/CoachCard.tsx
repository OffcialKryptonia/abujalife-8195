import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Compass, Loader2, MapPin, Sparkles } from "lucide-react";
import { recommendActivity, type Advice } from "@/lib/advisor.functions";
import { formatNaira } from "@/game/rules";

/** AI life coach: player shares a goal + budget, gets one actionable AbujaLife activity. */
export function CoachCard({ cash }: { cash: number }) {
  const ask = useServerFn(recommendActivity);
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState(String(Math.min(cash, 5000)));
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: () => ask({ data: { goal, budget: Math.max(0, Math.floor(Number(budget) || 0)) } }),
    onSuccess: (r) => { if (r.ok) { setAdvice(r); setErr(null); } else { setErr(r.message); } },
    onError: () => setErr("Couldn't reach the coach. Check your connection."),
  });
  return (
    <section className="glass rounded-3xl p-4 text-surface-foreground animate-rise">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground shadow-gold"><Compass className="size-5" /></span>
        <div><h2 className="font-display text-sm font-semibold">Abuja Life Coach</h2><p className="text-[11px] text-surface-foreground/60">AI-powered · tell it what you want today</p></div>
      </div>
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (goal.trim().length >= 2 && !m.isPending) m.mutate(); }}>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={200} placeholder="e.g. Save for a bigger flat, make friends…" aria-label="Your goal"
          className="h-11 w-full rounded-2xl border border-surface-foreground/10 bg-surface/60 px-3 text-sm placeholder:text-surface-foreground/40 focus:border-gold focus:outline-none" />
        <div className="flex gap-2">
          <label className="flex h-11 flex-1 items-center gap-1 rounded-2xl border border-surface-foreground/10 bg-surface/60 px-3 text-sm">
            <span className="font-bold text-gold">₦</span>
            <input value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} inputMode="numeric" aria-label="Budget in naira" className="w-full bg-transparent focus:outline-none" />
          </label>
          <button type="submit" disabled={m.isPending || goal.trim().length < 2} className="flex h-11 items-center gap-1.5 rounded-2xl bg-gold-gradient px-4 text-sm font-bold text-gold-foreground shadow-gold transition-transform active:scale-95 disabled:opacity-50">
            {m.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{m.isPending ? "Thinking" : "Advise me"}
          </button>
        </div>
      </form>
      {err && <p role="alert" className="mt-3 rounded-2xl bg-destructive/15 px-3 py-2 text-xs text-destructive-foreground">{err}</p>}
      {advice && !m.isPending && (
        <div className="mt-3 rounded-2xl border border-gold/30 bg-surface/50 p-3 animate-rise">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-sm font-semibold">{advice.title}</p>
            {advice.cost > 0 && <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">{formatNaira(advice.cost)}</span>}
          </div>
          {advice.why && <p className="mt-1 text-xs text-surface-foreground/70">{advice.why}</p>}
          {advice.steps.length > 0 && <ol className="mt-2 space-y-1 text-xs">{advice.steps.map((s, i) => <li key={i} className="flex gap-2"><span className="grid size-4 shrink-0 place-items-center rounded-full bg-gold text-[9px] font-black text-gold-foreground">{i + 1}</span>{s}</li>)}</ol>}
          {advice.placeId && <Link to="/play/map" search={{ place: advice.placeId }} className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground transition-transform active:scale-95"><MapPin className="size-4" />Go to {advice.placeName}</Link>}
        </div>
      )}
    </section>
  );
}
