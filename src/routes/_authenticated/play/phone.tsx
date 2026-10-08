import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Coins, Lock } from "lucide-react";
import { haptic } from "@/components/game/motion";
import { challengeForDay } from "@/game/rules";
import { z } from "zod";
import {
  ArrowLeft, Briefcase, Car, CarFront, Gamepad2, HeartPulse, Home, Landmark, LineChart, MessageCircle, Newspaper,
  Radio, Settings, Shield, Shirt, Sparkles, Trophy, Utensils, Users, CalendarDays, Battery, Signal, UserRound,
} from "lucide-react";
import { useMe } from "@/hooks/use-player";
import { formatGameTime } from "@/game/rules";
import * as A from "@/components/game/phone/apps";
import { GameMoneyApp } from "@/components/game/phone/game-money-app";
import { FeedApp, MessagesApp, PeopleApp, ProfileView } from "@/components/game/phone/social";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/play/phone")({
  validateSearch: z.object({ app: z.string().optional() }),
  head: () => ({ meta: [{ title: "Phone — AbujaLife" }, { name: "description", content: "Your AbujaLife smartphone: jobs, bank, rides, feed, messages and more." }, { property: "og:title", content: "Phone — AbujaLife" }, { property: "og:description", content: "Your AbujaLife smartphone." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PhoneScreen,
});

const APPS = [
  { id: "jobs", name: "Jobs", icon: Briefcase, tone: "bg-primary" },
  { id: "messages", name: "Messages", icon: MessageCircle, tone: "bg-success" },
  { id: "bank", name: "Game Money", icon: Coins, tone: "bg-gold" },
  { id: "ride", name: "AbujaRide", icon: Car, tone: "bg-gold" },
  { id: "homes", name: "AbujaHomes", icon: Home, tone: "bg-hygiene" },
  { id: "motors", name: "AbujaMotors", icon: CarFront, tone: "bg-destructive" },
  { id: "boutique", name: "Boutique", icon: Shirt, tone: "bg-social" },
  { id: "health", name: "Health", icon: HeartPulse, tone: "bg-destructive" },
  { id: "invest", name: "Invest", icon: LineChart, tone: "bg-success" },
  { id: "feed", name: "AbujaFeed", icon: Sparkles, tone: "bg-gold-gradient" },
  { id: "news", name: "AbujaNews", icon: Newspaper, tone: "bg-muted-foreground" },
  { id: "radio", name: "AbujaRadio", icon: Radio, tone: "bg-hunger" },
  { id: "sports", name: "AbujaSports", icon: Trophy, tone: "bg-primary" },
  { id: "games", name: "Games", icon: Gamepad2, tone: "bg-social" },
  { id: "eats", name: "AbujaEats", icon: Utensils, tone: "bg-hunger" },
  { id: "events", name: "AbujaEvents", icon: CalendarDays, tone: "bg-gold" },
  { id: "gov", name: "AbujaGov", icon: Landmark, tone: "bg-success" },
  { id: "police", name: "AbujaPolice", icon: Shield, tone: "bg-surface" },
  { id: "people", name: "People", icon: Users, tone: "bg-hygiene" },
  { id: "profile", name: "Me", icon: UserRound, tone: "bg-accent-foreground" },
  { id: "settings", name: "Settings", icon: Settings, tone: "bg-muted-foreground" },
] as const;
const DOCK = ["messages", "feed", "bank", "ride"];

function PhoneScreen() {
  const p = useMe();
  const { app } = Route.useSearch();
  const navigate = useNavigate({ from: "/play/phone" });
  const [viewing, setViewing] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const t = formatGameTime(p.game_minutes);
  const open = (id?: string) => { haptic(); setViewing(null); navigate({ search: id ? { app: id } : {} }); };
  const meta = APPS.find((a) => a.id === app);
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  useEffect(() => { if (!app && !sessionStorage.getItem("al_unlocked")) setLocked(true); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const unlock = () => { haptic(12); setUnlocking(true); sessionStorage.setItem("al_unlocked", "1"); setTimeout(() => { setLocked(false); setUnlocking(false); }, 430); };
  const badges: Record<string, number> = { jobs: p.job_id ? 0 : 1, feed: 3, messages: 1, events: p.last_challenge_day < t.day ? 1 : 0 };
  void challengeForDay;
  const openProfile = (id: string) => setViewing(id);
  const message = (id: string) => { setChatWith(id); setViewing(null); navigate({ search: { app: "messages" } }); };

  const body = () => {
    if (viewing) return <ProfileView id={viewing} onMessage={message} />;
    switch (app) {
      case "jobs": return <A.JobsApp />;
      case "messages": return <MessagesApp key={chatWith ?? "list"} initialPeer={chatWith} />;
      case "bank": return <GameMoneyApp />;
      case "ride": return <A.RideApp />;
      case "homes": return <A.HomesApp />;
      case "motors": return <A.MotorsApp />;
      case "boutique": return <A.BoutiqueApp />;
      case "health": return <A.HealthApp />;
      case "invest": return <A.InvestApp />;
      case "feed": return <FeedApp openProfile={openProfile} />;
      case "news": return <A.NewsApp />;
      case "radio": return <A.RadioApp />;
      case "sports": return <A.SportsApp />;
      case "games": return <A.GamesApp />;
      case "eats": return <A.EatsApp />;
      case "events": return <A.EventsApp />;
      case "gov": return <A.GovApp />;
      case "police": return <A.PoliceApp />;
      case "people": return <PeopleApp openProfile={openProfile} />;
      case "profile": return <A.ProfileApp />;
      case "settings": return <A.SettingsApp />;
      default: return null;
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[400px] rounded-[2.6rem] border-[10px] border-surface bg-surface shadow-[0_30px_80px_-20px_oklch(0_0_0/0.7)] ring-1 ring-surface-foreground/15">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-surface" />
        <div className="relative flex h-[calc(100dvh-220px)] min-h-[520px] flex-col overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_20%_10%,var(--gold)_-40%,transparent_45%),radial-gradient(circle_at_90%_90%,var(--primary),var(--surface)_70%)]">
          <div className="relative z-30 flex items-center justify-between px-6 pb-1 pt-2.5 text-[11px] font-bold text-surface-foreground">
            <span>{t.clock.replace(/ (AM|PM)/, "")}</span>
            <span className="flex items-center gap-1"><Signal className="size-3" />AbjNet 5G<span className="ml-1 tabular-nums">{Math.max(12, p.energy)}%</span><Battery className="size-4" /></span>
          </div>
          {locked && (
            <button onClick={unlock} aria-label="Unlock phone" className={cn("absolute inset-0 z-20 flex flex-col items-center bg-[radial-gradient(circle_at_50%_25%,var(--primary),var(--surface)_75%)] pt-20 text-surface-foreground", unlocking && "animate-unlock")}>
              <Lock className="mb-3 size-5 opacity-70" />
              <p className="font-display text-6xl font-semibold tracking-tight">{t.clock.replace(/ (AM|PM)/, "")}</p>
              <p className="text-sm opacity-70">{t.weekday} · Day {t.day}</p>
              <div className="mt-8 w-[85%] space-y-2">
                {[["AbujaFeed", "3 new posts trending in Abuja"], ["Jobs", p.job_id ? "Your shift is waiting" : "New openings near you"], ["Game Money", "Your wallet is ready"]].map(([a, m], i) => (
                  <div key={a} className="rounded-2xl bg-surface-foreground/12 p-3 text-left backdrop-blur animate-rise" style={{ animationDelay: `${150 + i * 90}ms` }}><p className="text-[10px] font-bold uppercase tracking-wider text-gold">{a}</p><p className="text-sm">{m}</p></div>
                ))}
              </div>
              <div className="flex-1" />
              <p className="mb-3 text-xs font-semibold opacity-70 animate-pulse">Tap to unlock</p>
              <span className="mb-3 h-1.5 w-28 rounded-full bg-surface-foreground/70" />
            </button>
          )}
          {meta || viewing ? (
            <div key={viewing ?? app} className="flex min-h-0 flex-1 flex-col bg-card text-card-foreground animate-app-launch">
              <div className="flex items-center gap-2 border-b px-3 py-2.5">
                <button onClick={() => (viewing ? setViewing(null) : open())} aria-label="Back" className="grid size-8 place-items-center rounded-full bg-muted"><ArrowLeft className="size-4" /></button>
                {meta && !viewing && <span className={cn("grid size-7 place-items-center rounded-lg text-surface-foreground", meta.tone)}><meta.icon className="size-4" /></span>}
                <h2 className="text-base font-semibold">{viewing ? "Profile" : meta?.name}</h2>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{body()}</div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col px-4">
              <div className="py-4 text-center text-surface-foreground">
                <p className="font-display text-5xl font-semibold tracking-tight">{t.clock.replace(/ (AM|PM)/, "")}</p>
                <p className="text-sm opacity-75">{t.weekday} · Day {t.day} · Abuja</p>
              </div>
              <Button variant="ghost" onClick={() => open("bank")} className="mb-4 flex h-auto w-full items-center justify-between rounded-3xl bg-surface-foreground/12 p-3 text-surface-foreground backdrop-blur animate-rise hover:bg-surface-foreground/20 hover:text-surface-foreground">
                <div><p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Game Money</p><p className="font-display text-lg font-bold">Open your wallet</p></div>
                <div className="text-right"><p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Today</p><p className="text-xs font-semibold">{p.job_id ? "Shift available" : "Find a job"}</p></div>
              </Button>
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {APPS.filter((a) => !DOCK.includes(a.id)).map((a, i) => (
                  <button key={a.id} onClick={() => open(a.id)} className="relative flex flex-col items-center gap-1 transition-transform active:scale-90 animate-rise" style={{ animationDelay: `${i * 25}ms` }}>
                    <AppIcon a={a} badge={badges[a.id]} />
                    <span className="max-w-full truncate text-[10px] font-semibold text-surface-foreground">{a.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <div className="mb-3 grid grid-cols-4 gap-2 rounded-3xl bg-surface-foreground/15 p-2.5 backdrop-blur">
                {APPS.filter((a) => DOCK.includes(a.id)).map((a) => (
                  <button key={a.id} onClick={() => open(a.id)} aria-label={a.name} className="relative flex justify-center transition-transform active:scale-90"><AppIcon a={a} badge={badges[a.id]} /></button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppIcon({ a, badge }: { a: (typeof APPS)[number]; badge?: number | undefined }) {
  return (
    <span className={cn("relative grid size-14 place-items-center overflow-hidden rounded-[18px] text-surface-foreground shadow-[0_8px_18px_-8px_oklch(0_0_0/0.7)] ring-1 ring-surface-foreground/15", a.tone)}>
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,oklch(1_0_0/0.28),transparent)]" />
      <a.icon className="relative size-6 drop-shadow" strokeWidth={2.2} />
      {!!badge && <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground ring-2 ring-surface">{badge}</span>}
    </span>
  );
}