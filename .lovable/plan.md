# AbujaLife World Experience V2 — First Playable Social-to-Venue Slice

## Goal
Extend the existing AbujaLife systems into one complete, persistent loop: discover a friend → chat/share a Wuse 2 location → choose transport → watch or skip travel → arrive in the district → enter an original venue scene → complete a saved activity with its existing economy/stat consequences.

## Build sequence
1. **Social core:** Add mutual friend requests and accepted-friend views without replacing follows. Add group conversations alongside existing direct messages. Make location sharing a structured, tappable chat item that opens the existing Map at that district. Show saved location and recent activity honestly; do not present save timestamps as live presence.
2. **Travel connection:** Preserve the illustrated and OpenStreetMap maps. Expand the selected-destination panel into a destination preview with taxi, keke, bus, and walk options and clear fare/time/energy impact. Execute the current server-authoritative travel action once, then hand off to the existing `TravelSequence`; Skip and normal arrival both land at the destination without repeating a charge or clock advance.
3. **Wuse 2 venue slice:** Add typed venue content for the named Abuja social destinations and original, fictionalized scene layouts (no borrowed logos or interiors). Let players enter/leave a venue, encounter the existing AbujaLife NPC/content, and trigger affordable activities through existing server-validated game actions.
4. **Verification:** Exercise friend request, direct and group chat, location sharing, Map preview, each transport mode, skip/watch, venue entry/activity, persisted player state, and mobile layouts around 390×844, 393×852, and 430×932. Run the project’s existing tests, strict type check, and preview build checks; fix regressions found.

## Technical notes
- Keep static world/venue data separate from pure rules and UI.
- Add only the schema needed for friend requests and group chat, with explicit grants and narrow RLS; preserve current auth, follows, direct messages, player rows, and game-action authority.
- Use authenticated server functions for privileged social writes; use existing authenticated client reads where RLS permits.
- Keep money transfers, broad live-presence claims, and expansion beyond the first district/venue slice out of scope until this loop is verified.
