import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Building2, Map, Wallet } from "lucide-react";
import hero from "@/assets/abuja-hero.jpg";
import { DISTRICTS } from "@/game/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AbujaLife — Your Life. Your Abuja." },
      { name: "description", content: "Build a life in a living virtual Abuja: work, earn naira, rent homes from Kubwa to Maitama and rise through the city." },
      { property: "og:title", content: "AbujaLife — Your Life. Your Abuja." },
      { property: "og:description", content: "A Nigerian life-simulation game. Start in Kubwa. End in Asokoro." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Map, title: "8 real districts", body: "Ride from Kubwa to Maitama. Every area has its own prices, food and vibe." },
  { icon: Briefcase, title: "12 careers", body: "Keke rider to corporate lawyer. Level up to unlock better pay." },
  { icon: Building2, title: "Climb the property ladder", body: "Single room today, lake-view apartment tomorrow." },
  { icon: Wallet, title: "A real naira economy", body: "Cash, bank, rent, transport — every choice costs something." },
];

function Landing() {
  return (
    <main className="min-h-screen bg-surface text-surface-foreground">
      <section className="relative min-h-[92vh] overflow-hidden">
        <img src={hero} alt="Golden-hour aerial view of Abuja with Aso Rock" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col px-5 py-6">
          <nav className="flex items-center justify-between">
            <span className="font-display text-lg font-semibold">Abuja<span className="text-gold">Life</span></span>
            <Link to="/auth" className="rounded-full border border-surface-foreground/30 px-4 py-1.5 text-sm font-medium backdrop-blur">Sign in</Link>
          </nav>
          <div className="mt-auto max-w-2xl pb-10 animate-rise">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">Nigerian life simulator</p>
            <h1 className="text-5xl font-semibold leading-[1.02] md:text-7xl">Your Life.<br />Your Abuja.</h1>
            <p className="mt-4 max-w-md text-base text-surface-foreground/80">Arrive with little. Hustle, earn, rent, and rise — from a single room in Kubwa to a mansion in Asokoro.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/auth" className="rounded-full bg-gold-gradient px-7 py-3.5 font-semibold text-gold-foreground shadow-gold transition-transform hover:scale-[1.02]">Start your life</Link>
              <Link to="/play" className="rounded-full border border-surface-foreground/30 px-7 py-3.5 font-semibold backdrop-blur">Continue</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-surface-foreground/10 bg-surface-gradient p-5">
              <Icon className="size-6 text-gold" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-surface-foreground/70">{body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-semibold">The city is the game.</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <span key={d.id} className="rounded-full border border-surface-foreground/15 px-4 py-2 text-sm">
              {d.name} <span className="text-gold">{"★".repeat(d.tier)}</span>
            </span>
          ))}
        </div>
      </section>
      <footer className="border-t border-surface-foreground/10 py-6 text-center text-xs text-surface-foreground/50">AbujaLife · Live it. Build it. Own your story.</footer>
    </main>
  );
}
