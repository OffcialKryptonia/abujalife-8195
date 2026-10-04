import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  ArrowLeft, Banknote, Briefcase, Car, CarFront, Gamepad2, HeartPulse, Home, Landmark, LineChart, MessageCircle, Newspaper,
  Radio, Settings, Shield, Shirt, Sparkles, Trophy, Utensils, Users, CalendarDays, Battery, Signal, UserRound,
} from "lucide-react";
import { useMe } from "@/hooks/use-player";
import { formatGameTime } from "@/game/rules";
import * as A from "@/components/game/phone/apps";
import { FeedApp, MessagesApp, PeopleApp, ProfileView } from "@/components/game/phone/social";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/phone")({
  validateSearch: z.object({ app: z.string().optional() }),
  head: () => ({ meta: [{ title: "Phone — AbujaLife" }, { name: "description", content: "Your AbujaLife smartphone: jobs, bank, rides, feed, messages and more." }, { property: "og:title", content: "Phone — AbujaLife" }, { property: "og:description", content: "Your AbujaLife smartphone." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PhoneScreen,
});

const APPS = [
  { id: "jobs", name: "Jobs", icon: Briefcase, tone: "bg-primary" },
  { id: "messages", name: "Messages", icon: MessageCircle, tone: "bg-success" },
  { id: "bank", name: "AbujaBank", icon: Banknote, tone: "bg-surface" },
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
  const open = (id?: string) => { setViewing(null); navigate({ search: id ? { app: id } : {} }); };
  const meta = APPS.find((a) => a.id === app);
  const openProfile = (id: string) => setViewing(id);
  const message = (id: string) => { setChatWith(id); setViewing(null); navigate({ search: { app: "messages" } }); };

  const body = () => {
    if (viewing) return <ProfileView id={viewing} onMessage={message} />;
    switch (app) {
      case "jobs": return <A.JobsApp />;
      case "messages": return <MessagesApp key={chatWith ?? "list"} initialPeer={chatWith} />;
      case "bank": return <A.BankApp />;
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
          <div className="flex items-center justify-between px-6 pb-1 pt-2.5 text-[11px] font-bold text-surface-foreground">
            <span>{t.clock.replace(/ (AM|PM)/, "")}</span>
            <span className="flex items-center gap-1"><Signal className="size-3" />MTN-ish<Battery className="size-4" /></span>
          </div>
          {meta || viewing ? (
            <div className="flex min-h-0 flex-1 flex-col bg-card text-card-foreground animate-rise">
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
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {APPS.filter((a) => !DOCK.includes(a.id)).map((a) => (
                  <button key={a.id} onClick={() => open(a.id)} className="flex flex-col items-center gap-1 transition-transform active:scale-90">
                    <span className={cn("grid size-14 place-items-center rounded-2xl text-surface-foreground shadow-card ring-1 ring-surface-foreground/10", a.tone)}><a.icon className="size-6" /></span>
                    <span className="max-w-full truncate text-[10px] font-semibold text-surface-foreground">{a.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <div className="mb-3 grid grid-cols-4 gap-2 rounded-3xl bg-surface-foreground/15 p-2.5 backdrop-blur">
                {APPS.filter((a) => DOCK.includes(a.id)).map((a) => (
                  <button key={a.id} onClick={() => open(a.id)} aria-label={a.name} className="flex justify-center active:scale-90"><span className={cn("grid size-14 place-items-center rounded-2xl text-surface-foreground", a.tone)}><a.icon className="size-6" /></span></button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
