import { Link } from "@tanstack/react-router";
import { Home, Map, Briefcase, Building2, Landmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

const skinClass: Record<string, string> = { "1": "bg-skin-1", "2": "bg-skin-2", "3": "bg-skin-3", "4": "bg-skin-4" };

export function Avatar({ name, skin, size = 56 }: { name: string; skin: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-full font-display font-semibold text-surface-foreground ring-2 ring-gold ring-offset-2 ring-offset-background", skinClass[skin] ?? "bg-skin-2")}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function StatBar({ label, value, tone }: { label: string; value: number; tone: "hunger" | "energy" | "happy" }) {
  const toneClass = { hunger: "bg-hunger", energy: "bg-energy", happy: "bg-happy" }[tone];
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500", toneClass, value < 20 && "animate-pulse")} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border bg-card p-4 shadow-card animate-rise", className)}>{children}</section>;
}

export function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
    </header>
  );
}

const NAV = [
  { to: "/play", label: "Home", icon: Home, exact: true },
  { to: "/play/map", label: "Map", icon: Map },
  { to: "/play/work", label: "Work", icon: Briefcase },
  { to: "/play/housing", label: "Homes", icon: Building2 },
  { to: "/play/bank", label: "Bank", icon: Landmark },
  { to: "/play/profile", label: "Me", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 backdrop-blur md:static md:border-0 md:bg-transparent">
      <ul className="mx-auto flex max-w-xl justify-between px-2 py-1.5 md:flex-col md:gap-1 md:p-0">
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: "exact" in rest }}
              className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-medium text-surface-foreground/60 transition-colors md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm"
              activeProps={{ className: "!text-gold md:bg-surface-foreground/10" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
