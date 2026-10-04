import { Link } from "@tanstack/react-router";
import { Home, Map, ShoppingBag, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { outfitById } from "@/game/content";

const skinClass: Record<string, string> = { "1": "bg-skin-1", "2": "bg-skin-2", "3": "bg-skin-3", "4": "bg-skin-4" };
export const skinVar = (skin: string) => `var(--skin-${["1", "2", "3", "4"].includes(skin) ? skin : "2"})`;

export function Avatar({ name, skin, size = 56, className }: { name: string; skin: string; size?: number; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className={cn("grid shrink-0 place-items-center rounded-full font-display font-semibold text-surface-foreground ring-2 ring-gold ring-offset-2 ring-offset-surface", skinClass[skin] ?? "bg-skin-2", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

/** Original stylised standing figure used in scenes. Renders inside an <svg>. */
export function Figure({ skin, outfit, gender, x, y, scale = 1, bob = true }: { skin: string; outfit: string; gender: string; x: number; y: number; scale?: number; bob?: boolean }) {
  const cloth = outfitById(outfit).color;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="13" ry="5" fill="black" opacity="0.18" />
      <g className={bob ? "animate-bob" : undefined}>
        <rect x="-6" y="-22" width="5" height="20" rx="2" fill="oklch(0.25 0.02 250)" />
        <rect x="1" y="-22" width="5" height="20" rx="2" fill="oklch(0.25 0.02 250)" />
        <path d={gender === "female" ? "M-11 -22 L11 -22 L8 -50 L-8 -50 Z" : "M-10 -20 L10 -20 L10 -50 L-10 -50 Z"} fill={cloth} />
        <rect x="-14" y="-49" width="5" height="22" rx="2.5" fill={skinVar(skin)} />
        <rect x="9" y="-49" width="5" height="22" rx="2.5" fill={skinVar(skin)} />
        <path d="M-10 -50 L10 -50 L7 -44 L-7 -44 Z" fill="black" opacity="0.12" />
        <circle cx="0" cy="-60" r="10" fill={skinVar(skin)} />
        {gender === "female"
          ? <path d="M-11 -62 Q0 -78 11 -62 Q12 -70 6 -72 Q0 -76 -6 -72 Q-12 -70 -11 -62 Z" fill="oklch(0.6 0.15 30)" />
          : <path d="M-10 -63 Q0 -74 10 -63 Q9 -70 0 -71 Q-9 -70 -10 -63 Z" fill="oklch(0.15 0.01 50)" />}
      </g>
    </g>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border bg-card p-4 shadow-card animate-rise", className)}>{children}</section>;
}

export function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
      <h1 className="text-xl font-semibold text-surface-foreground">{title}</h1>
    </header>
  );
}

const NAV = [
  { to: "/play", label: "Home", icon: Home, exact: true },
  { to: "/play/buy", label: "Buy", icon: ShoppingBag, exact: false },
  { to: "/play/map", label: "Map", icon: Map, exact: false },
  { to: "/play/phone", label: "Phone", icon: Smartphone, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <ul className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-1 rounded-full border border-surface-foreground/10 bg-surface/90 p-1.5 shadow-[0_20px_40px_-12px_oklch(0_0_0/0.6)] backdrop-blur-xl">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-surface-foreground/55 transition-all"
              activeProps={{ className: "!text-gold-foreground bg-gold-gradient shadow-gold" }}
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

export function Stars({ n }: { n: number }) {
  return <span className="text-gold">{"★".repeat(n)}<span className="opacity-25">{"★".repeat(5 - n)}</span></span>;
}
