<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AbujaLife — architecture rules

- Game content lives as typed static data in `src/game/content.ts`; pure rules in `src/game/rules.ts` — keeps balancing separate from UI and server.
- All player-state writes go through `performAction`/`createCharacter` server functions using the admin client; players/transactions tables are read-only to clients via RLS — prevents cheating.
- Signed-in game screens live under `src/routes/_authenticated/play/` with a shared layout that redirects to `/create` when no character exists.
- Game visuals are hand-built SVG + CSS keyframes (PlayerCharacter poses, IsoRoom, DayNightLighting) — no 3D engine or remote assets, keeps it light on mobile networks.
- AI features (life coach) call Lovable AI Gateway only from server functions (`src/lib/advisor.functions.ts` → `advisor.server.ts`), with game context built server-side from the player row — keeps the key private and prompts untamperable.
- Admin dashboard at `/admin` (`src/routes/_authenticated/admin.tsx`); roles live in `user_roles` + `has_role()`, and every admin server fn in `src/lib/admin.functions.ts` verifies the admin role before loading the service client — UI gating alone is never trusted.
- Real-world map uses Leaflet + OpenStreetMap tiles, lazy-loaded client-side only in `RealAbujaMap` — keeps SSR safe and the game bundle small.
