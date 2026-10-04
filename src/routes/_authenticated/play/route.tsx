import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { MapPin, Clock } from "lucide-react";
import { usePlayer } from "@/hooks/use-player";
import { BottomNav } from "@/components/game/ui";
import { districtById } from "@/game/content";
import { formatGameTime, formatNaira } from "@/game/rules";

export const Route = createFileRoute("/_authenticated/play")({
  component: PlayLayout,
});

function PlayLayout() {
  const { data: player, isLoading, error } = usePlayer();
  if (isLoading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading Abuja…</div>;
  if (error) return <div className="grid min-h-screen place-items-center text-destructive">Couldn't load your life. Refresh to retry.</div>;
  if (!player) return <Navigate to="/create" />;
  const t = formatGameTime(player.game_minutes);

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="hidden w-60 shrink-0 bg-surface p-5 md:block">
        <p className="mb-8 font-display text-lg font-semibold text-surface-foreground">Abuja<span className="text-gold">Life</span></p>
        <BottomNav />
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background/90 px-4 py-2.5 text-sm backdrop-blur">
          <span className="flex items-center gap-1.5 font-medium"><MapPin className="size-4 text-primary" />{districtById(player.district).name}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4" />Day {t.day} · {t.clock}</span>
          <span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground">{formatNaira(player.cash)}</span>
        </header>
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 md:pb-10">
          <Outlet />
        </main>
      </div>
      <div className="md:hidden"><BottomNav /></div>
    </div>
  );
}
