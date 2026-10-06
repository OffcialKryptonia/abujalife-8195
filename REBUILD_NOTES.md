# AbujaLife Rebuild Notes

This pass intentionally extends the existing game instead of replacing it.

## New foundations
- `src/game/abuja-life.ts`: Abuja-first mobility, tertiary institutions, political offices and city roadmap.
- `src/components/game/AbujaLifeHub.tsx`: premium home hub for the new life systems.
- `src/routes/_authenticated/play/education.tsx`: tertiary education world entry point.
- `src/routes/_authenticated/play/politics.tsx`: FCT politics/election entry point.
- `src/lib/political.functions.ts`: candidate registration and voting server functions.
- `src/lib/payment.functions.ts`: Game Money checkout/verification adapters.
- `drizzle/migrations/0008_abuja_life_expansion.sql`: institutions, elections, candidates, political profiles, Game Money products and payment orders.

## Environment variables
Korapay:
- `KORAPAY_SECRET_KEY`
- `KORAPAY_WEBHOOK_URL`
- `KORAPAY_REDIRECT_URL`

PocketFi:
- `POCKETFI_SECRET_KEY`
- `POCKETFI_BUSINESS_ID`
- `POCKETFI_REDIRECT_URL`
- Optional endpoint overrides: `POCKETFI_CHECKOUT_ENDPOINT`, `POCKETFI_CONFIRM_ENDPOINT`

Secrets must remain server-side. Game Money is credited only after server verification.

## Important product rule
Real-money Game Money must not directly determine election outcomes. Political influence remains a gameplay system based on reputation, relationships, campaign activity and voting.

## Validation
All TypeScript/TSX source files in this archive were parsed successfully with TypeScript 5.8.3. Full dependency installation/build was not completed in this environment because package installation timed out; run the project's Bun install/build in Lovable or a local environment before production deployment.
