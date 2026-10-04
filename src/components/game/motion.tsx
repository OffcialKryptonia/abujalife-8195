/**
 * Lightweight animation primitives for AbujaLife. CSS transforms/opacity only;
 * reduced-motion and hidden-tab pausing are handled globally in styles.css.
 */
import { useEffect, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { useAnimatedNumber, useDelta } from "@/hooks/use-animated-number";
import { formatNaira } from "@/game/rules";
import { PlayerCharacter, type Look, type Pose } from "./PlayerCharacter";
import { cn } from "@/lib/utils";

/** Short vibration where the browser supports it (Android Chrome); no-op elsewhere. */
export function haptic(ms = 8) {
  try { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms); } catch { /* ignore */ }
}

/** Adds html.anim-paused while the tab is hidden so infinite loops stop costing battery. */
export function useAnimationPauseWhenHidden() {
  useEffect(() => {
    const on = () => document.documentElement.classList.toggle("anim-paused", document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
}

export function ButtonPress({ className, onClick, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} onClick={(e) => { haptic(); onClick?.(e); }} className={cn("transition-transform duration-150 ease-out active:scale-[0.94]", className)}>
      {children}
    </button>
  );
}

export function MoneyCountUp({ value, className }: { value: number; className?: string }) {
  const v = useAnimatedNumber(value, 700);
  return <span className={cn("tabular-nums", className)}>{formatNaira(v)}</span>;
}

/** Wraps any stat display; pulses when the value changes and glows when critical. */
export function StatPulse({ value, critical, children }: { value: number; critical?: boolean; children: ReactNode }) {
  const d = useDelta(value);
  return <span key={d?.k ?? 0} className={cn("inline-block", d && "animate-coin", critical && "animate-critical")}>{children}</span>;
}

export function FloatingNotification({ children, style, tone = "good" }: { children: ReactNode; style?: CSSProperties; tone?: "good" | "bad" | "info" }) {
  return (
    <span style={style} className={cn("pointer-events-none inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-black shadow-lg animate-float-up",
      tone === "good" ? "bg-success text-surface" : tone === "bad" ? "bg-destructive text-destructive-foreground" : "bg-gold-gradient text-gold-foreground")}>{children}</span>
  );
}

export function ModalSheetTransition({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-surface/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={cn("glass w-full max-w-md rounded-t-[32px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-surface-foreground animate-sheet-up", className)} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/** Character pose shorthands (SVG <g>, place inside an <svg>). */
export const CharacterIdle = (p: { look: Look; scale?: number }) => <PlayerCharacter look={p.look} pose="idle" scale={p.scale ?? 1} />;
export const CharacterWalk = (p: { look: Look; scale?: number }) => <PlayerCharacter look={p.look} pose="walk" scale={p.scale ?? 1} />;
export const CharacterAction = (p: { look: Look; action: Exclude<Pose, "idle" | "walk">; scale?: number }) => <PlayerCharacter look={p.look} pose={p.action} scale={p.scale ?? 1} />;
