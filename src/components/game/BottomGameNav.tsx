import { Link, useLocation } from "@tanstack/react-router";
import { Home, Map, ShoppingBag, Smartphone } from "lucide-react";
import { useMe } from "@/hooks/use-player";
import { challengeForDay, formatGameTime } from "@/game/rules";
import { cn } from "@/lib/utils";
import { haptic } from "./motion";

const NAV = [
  { to: "/play", label: "Home", icon: Home, exact: true },
  { to: "/play/buy", label: "Buy", icon: ShoppingBag, exact: false },
  { to: "/play/map", label: "Map", icon: Map, exact: false },
  { to: "/play/phone", label: "Phone", icon: Smartphone, exact: false },
] as const;

export function BottomGameNav() {
  const p = useMe();
  const { pathname } = useLocation();
  const day = formatGameTime(p.game_minutes).day;
  void challengeForDay;
  const badges: Record<string, number> = {
    "/play": p.last_challenge_day < day ? 1 : 0,
    "/play/phone": p.job_id ? 0 : 1,
  };
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="glass pointer-events-auto flex w-full max-w-sm items-center justify-between gap-1 rounded-[28px] p-1.5 shadow-[0_24px_50px_-14px_oklch(0_0_0/0.75),inset_0_1px_0_oklch(1_0_0/0.08)]">
        {NAV.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to || pathname === `${to}/` : pathname.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link to={to} activeOptions={{ exact }} aria-label={label} onClick={() => haptic(10)}
                className={cn("relative flex flex-col items-center gap-0.5 rounded-[22px] px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-90",
                  active ? "-translate-y-1.5 bg-gold-gradient text-gold-foreground shadow-gold" : "text-surface-foreground/55")}>
                <Icon key={String(active)} className={cn("size-5", active && "animate-nav-pop")} strokeWidth={active ? 2.6 : 2} />
                {label}
                {!!badges[to] && !active && <span className="absolute right-[22%] top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground ring-2 ring-surface animate-pop" style={{ transform: "none" }}>{badges[to]}</span>}
                {active && <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-gold" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
