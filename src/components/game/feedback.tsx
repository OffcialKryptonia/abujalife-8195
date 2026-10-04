import { useLocation } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatChip { label: string; v: string; good: boolean }

/** Chips that rise out of the game world after an action. */
export function FloatingStatFeedback({ items, style }: { items: StatChip[]; style: CSSProperties }) {
  return (
    <div className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1" style={style}>
      {items.map((c, i) => (
        <span key={c.label} className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 font-display text-[11px] font-black shadow-lg animate-float-up",
          c.good ? "bg-success text-surface" : "bg-destructive text-destructive-foreground")} style={{ animationDelay: `${i * 140}ms` }}>
          {c.v} {c.label}
        </span>
      ))}
    </div>
  );
}

/** Contextual action bubble anchored above a tapped object. */
export function InteractionBubble({ title, actions, onInfo, onClose, style }: { title: string; actions: { label: string; sub?: string; onClick: () => void; disabled?: boolean }[]; onInfo?: () => void; onClose: () => void; style: CSSProperties }) {
  return (
    <div className="pointer-events-auto absolute z-10 animate-pop" style={{ ...style, transform: "translate(-50%,-100%)" }}>
      <div className="glass relative flex items-center gap-1 rounded-2xl p-1 pl-2.5 text-surface-foreground shadow-[0_12px_30px_-8px_oklch(0_0_0/0.7)]">
        <span className="max-w-24 truncate text-[11px] font-semibold text-surface-foreground/70">{title}</span>
        {actions.map((a) => (
          <button key={a.label} disabled={a.disabled} onClick={a.onClick} className="rounded-xl bg-gold-gradient px-3 py-1.5 text-left text-gold-foreground shadow-gold transition-transform active:scale-95 disabled:opacity-50">
            <span className="block font-display text-xs font-bold leading-tight">{a.label}</span>
            {a.sub && <span className="block text-[9px] font-semibold opacity-75">{a.sub}</span>}
          </button>
        ))}
        {onInfo && <button aria-label="Details" onClick={onInfo} className="grid size-7 place-items-center rounded-full bg-surface-foreground/10"><Info className="size-3.5" /></button>}
        <button aria-label="Close" onClick={onClose} className="grid size-7 place-items-center rounded-full"><X className="size-3.5 opacity-60" /></button>
        <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-surface/80" />
      </div>
    </div>
  );
}

/** Keyed wrapper that animates screen changes between Home / Buy / Map / Phone. */
export function GameTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <div key={pathname} className="animate-screen-in">{children}</div>;
}

export function SparkleBurst() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2">
      {[0, 45, 90, 135].map((r) => <span key={r} className="absolute size-16 animate-sparkle" style={{ rotate: `${r}deg`, background: "conic-gradient(from 0deg, transparent 0 40%, var(--gold) 45% 55%, transparent 60%)", clipPath: "polygon(50% 0, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0 50%, 44% 44%)" }} />)}
    </span>
  );
}
