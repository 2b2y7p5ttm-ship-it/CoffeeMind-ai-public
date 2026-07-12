# CoffeeMind Admin Analytics v1

## 1. Add yourself as owner

1. Register or sign in to CoffeeMind with the email you will use as owner.
2. Open `supabase/admin-analytics.sql`.
3. Replace `OWNER_EMAIL@example.com` with that exact email.
4. Copy the entire SQL file into Supabase → SQL Editor → New query.
5. Click **Run**.

The SQL creates a protected admin list and three server-side RPC functions. Ordinary users cannot query global user data.

## 2. Verify locally

```powershell
npm.cmd install --registry=https://registry.npmjs.org/ --no-audit --no-fund
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Open CoffeeMind and go to:

`Настройки → Панель владельца`

The menu row only appears for an authenticated user present in `public.app_admins`.

## 3. Publish through Git

Copy the changed files into your current repository, then run:

```powershell
git add .
git commit -m "Add owner analytics dashboard"
git push
```

Vercel will deploy automatically.

## Files added or changed

- `src/pages/admin.tsx`
- `src/hooks/useAdminAccess.ts`
- `src/App.tsx`
- `src/pages/settings.tsx`
- `supabase/admin-analytics.sql`
- `ADMIN_SETUP.md`
