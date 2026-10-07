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
- Destination experiences use typed venue data in `src/game/venues.ts` and reusable SVG/CSS scenes in `src/components/game/world/VenueScene.tsx` — venue presentation stays extensible without duplicating game rules or save logic.
- Social interactions use additive Lovable Cloud tables with participant-scoped RLS, while established direct chat and player-action APIs remain intact — social expansion cannot bypass ownership or game authority.
- Multi-row social creation is performed by a single authenticated database function — related records must commit together to avoid orphaned game-world state.
- Game Money lives in game_wallets/game_money_ledger and changes only through locked, idempotent database functions (credit/debit service-role only; transfer caller-bound) — players.cash/bank are transitional until gameplay migrates.
