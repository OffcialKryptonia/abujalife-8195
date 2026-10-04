import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePlayer } from "@/hooks/use-player";
import { BottomNav } from "@/components/game/ui";
import { Hud } from "@/components/game/Hud";
import { getSoundPref, startAmbient } from "@/lib/sound";

export const Route = createFileRoute("/_authenticated/play")({
  component: PlayLayout,
});

function PlayLayout() {
  const { data: player, isLoading, error } = usePlayer();
  useEffect(() => {
    // Browsers require a gesture before audio; resume ambient on first tap if enabled.
    const on = () => { if (getSoundPref()) startAmbient(); };
    window.addEventListener("pointerdown", on, { once: true });
    return () => window.removeEventListener("pointerdown", on);
  }, []);
  if (isLoading) return <div className="grid min-h-screen place-items-center bg-surface font-display text-surface-foreground/70">Entering Abuja…</div>;
  if (error) return <div className="grid min-h-screen place-items-center bg-surface text-destructive">Couldn't load your life. Refresh to retry.</div>;
  if (!player) return <Navigate to="/create" />;

  return (
    <div className="min-h-screen bg-surface-gradient">
      <Hud />
      <main className="mx-auto max-w-3xl px-3 pb-32 pt-3">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
