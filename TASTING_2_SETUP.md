# CoffeeMind — Tasting 2.0 (increment 1)

## Added

- Extended bean passport: producer, washing station, elevation, harvest, lot.
- Repeatable recipe: grinder, grind setting, water, TDS, blooming.
- Sensory scores for aroma and flavor.
- One-tap calculated overall score based on eight sensory attributes.
- Extended tasting detail view.
- Backward-compatible local storage and Supabase mapping.

## Deploy

1. Run `supabase/tasting-2-migration.sql` in Supabase SQL Editor.
2. Run `npm.cmd run typecheck`.
3. Run `npm.cmd run build`.
4. Commit and push:

```powershell
git add .
git commit -m "Add Tasting 2.0 increment 1"
git push
```

The migration is additive and does not delete or rewrite existing tastings.
