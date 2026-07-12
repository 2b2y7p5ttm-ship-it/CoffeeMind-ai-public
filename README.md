# CoffeeMind AI

CoffeeMind AI is a mobile-first PWA for coffee tastings, Taste DNA and book ratings.

## What this public version includes

- Coffee tasting journal
- AI Coach after each tasting
- Taste DNA profile
- Book ratings and notes
- Data Vault export/import
- PWA install flow for iPhone and Android

## What this public version does not include

- Video scripts
- Content studio
- Publishing workflow for social media

## Local development

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 3000 --strictPort
```

## Production build

```bash
npm run build
```

The production output is generated in `dist`.

## Deploy settings

### Vercel

- Framework preset: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` handles SPA routing and PWA headers.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`

The included `netlify.toml` handles SPA routing and PWA headers.
