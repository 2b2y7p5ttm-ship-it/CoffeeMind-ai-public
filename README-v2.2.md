# CoffeeMind AI v2.2 — Public Launch

CoffeeMind AI is now prepared as a share-ready PWA.

## Product direction

This version is designed for multiple independent users:

- coffee tasting journal;
- AI Coach after tastings;
- Taste DNA profile;
- book ratings and reading notes;
- coffee + book pairing;
- local backup / restore through Data Vault.

## Removed from public product

The private creator workflow is no longer part of the public app:

- no video scripts;
- no Coffee + Book Studio;
- no storyboard flow;
- no publishing status pipeline.

## Data model for public sharing

In v2.2 each user keeps their own data locally in their browser/device.
Opening the same public link does not mix journals between users.

Important localStorage keys:

- `coffee_journal_tastings`
- `coffee_journal_profile`
- `coffeemind_book_ratings`
- `coffeemind_welcome_seen`

## New pages

- `/welcome` — public onboarding and first-use explanation;
- `/share` — copy/share public link and explain user data isolation;
- `/install` — iPhone PWA installation guide;
- `/backup` — export/import local journal data.

## Next milestone

v2.3 should prepare deployment:

- Vercel or Netlify configuration;
- production domain;
- landing copy;
- basic analytics;
- optional Supabase Auth plan for cross-device sync.
