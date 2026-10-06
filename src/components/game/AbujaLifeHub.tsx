import { Link } from "@tanstack/react-router";
import { GraduationCap, Landmark, Plane, Shield, Sparkles, Trophy, CarFront } from "lucide-react";
import { CharacterPortrait } from "@/components/game/PlayerCharacter";
import { ABUJA_INSTITUTIONS, ABUJA_POLITICAL_OFFICES, ABUJA_VEHICLES } from "@/game/abuja-life";
import { formatNaira } from "@/game/rules";
import { cn } from "@/lib/utils";

type Props = { look: Parameters<typeof CharacterPortrait>[0]["look"]; cash: number; reputation: number; className?: string };

export function AbujaLifeHub({ look, cash, reputation, className }: Props) {
  const luxury = ABUJA_VEHICLES.filter((v) => v.tier === "luxury" || v.tier === "aviation");
  return (
    <section className={cn("al-hub overflow-hidden rounded-[28px] border border-white/10", className)}>
      <div className="relative min-h-[190px] overflow-hidden px-4 pb-4 pt-3 sm:px-5">
        <div className="al-hub-grid" />
        <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-primary-foreground/60">AbujaLife</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white">Your life. Your city.</h2>
            <p className="mt-1 max-w-[260px] text-xs leading-5 text-white/60">Build a career, study, travel in style, meet people and shape Abuja.</p>
          </div>
          <div className="al-avatar-frame shrink-0">
            <CharacterPortrait look={look} size={104} className="drop-shadow-2xl" />
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-4 gap-2">
          <HubStat icon={Sparkles} label="Rep" value={`${reputation}`} />
          <HubStat icon={CarFront} label="Mobility" value="12+" />
          <HubStat icon={GraduationCap} label="Schools" value={`${ABUJA_INSTITUTIONS.length}`} />
          <HubStat icon={Landmark} label="Offices" value={`${ABUJA_POLITICAL_OFFICES.length}`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-black/20 p-3">
        <HubLink to="/play/education" icon={GraduationCap} title="Education" sub="Campus · hostel · student life" />
        <HubLink to="/play/politics" icon={Landmark} title="Politics" sub="Parties · campaigns · elections" />
        <HubLink to="/play/phone" search={{ app: "motors" }} icon={CarFront} title="Motorlife" sub={`${luxury.length} luxury & aviation assets`} />
        <HubLink to="/play/map" icon={Plane} title="Travel Abuja" sub="Districts · transport · destinations" />
      </div>
      <div className="border-t border-white/10 px-3 py-3">
        <div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Ambition ladder</p><span className="text-[10px] font-bold text-primary">{formatNaira(cash)}</span></div>
        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-white/60">
          <span className="rounded-xl bg-white/5 px-2 py-2">Citizen</span><span className="rounded-xl bg-white/5 px-2 py-2">Executive</span><span className="rounded-xl bg-white/5 px-2 py-2">Power player</span>
        </div>
      </div>
    </section>
  );
}

function HubStat({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return <div className="rounded-xl border border-white/8 bg-white/5 px-2 py-2"><Icon className="mb-1 size-3 text-primary"/><p className="text-[9px] text-white/45">{label}</p><p className="text-xs font-black text-white">{value}</p></div>;
}
function HubLink({ to, search, icon: Icon, title, sub }: { to: string; search?: Record<string, string>; icon: typeof Sparkles; title: string; sub: string }) {
  return <Link to={to as any} search={search as any} className="group rounded-2xl border border-white/8 bg-white/[0.045] p-3 transition hover:bg-white/[0.08] active:scale-[.98]"><Icon className="size-4 text-primary"/><p className="mt-2 text-xs font-black text-white">{title}</p><p className="mt-0.5 text-[10px] leading-4 text-white/45">{sub}</p></Link>;
}
