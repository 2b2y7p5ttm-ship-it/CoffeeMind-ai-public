# CoffeeMind AI v2.4 — Public Launch / Deploy-ready

This release is prepared for sharing CoffeeMind AI with other people by publishing it to a public HTTPS URL.

## Added in v2.4

- Root-level project structure for direct GitHub/Vercel/Netlify deployment.
- `vercel.json` for Vercel SPA rewrites and PWA headers.
- `netlify.toml` for Netlify build settings, redirects and PWA headers.
- `public/_redirects` fallback for SPA routes.
- Standard Vite production output: `dist`.
- Clean README and deployment guide.
- Version updated to `0.2.4`.

## Public product rules

CoffeeMind AI public version includes:

- personal coffee tasting journal;
- book ratings and notes;
- Taste DNA;
- AI Coach;
- Data Vault export/import;
- PWA installation on iPhone and Android.

CoffeeMind AI public version excludes:

- video scripts;
- content studio;
- creator publishing workflow.

## Data privacy note

Until cloud accounts are added, CoffeeMind AI stores data locally on each user's device/browser. This keeps journals separate by default, but users must export backups if they want to move devices.
