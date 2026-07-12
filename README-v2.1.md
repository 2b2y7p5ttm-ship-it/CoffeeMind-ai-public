# CoffeeMind AI v2.1 — Share-ready local journals + book ratings

This version prepares CoffeeMind AI for sharing with other people.

## Product change

- Coffee + Book Studio was removed from navigation and source.
- Added Book Ratings: each user can rate books, write notes, track reading status and optionally pair a book with a coffee tasting.
- Each user keeps their own private local journal in their own browser/device through localStorage.
- Data Vault now exports/imports tastings, profile and book ratings.

## How sharing works now

If you deploy this PWA and share the public link, every person who opens it gets their own local data store on their device. Their tastings and books do not mix with yours.

This is the safest no-backend MVP.

## Next step for real accounts

For true multi-device accounts and sync, add Supabase:

- Auth: email magic links or Google/Apple login.
- Tables: profiles, tastings, book_ratings.
- Row Level Security: each row belongs to auth.uid().

Suggested tables are in `supabase/schema.sql`.
