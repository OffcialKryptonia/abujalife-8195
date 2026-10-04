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
