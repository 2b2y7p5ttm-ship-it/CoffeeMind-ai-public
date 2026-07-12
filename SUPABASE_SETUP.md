# CoffeeMind Cloud — подключение Supabase

## 1. Создай проект Supabase

Создай новый проект и дождись завершения подготовки базы.

## 2. Создай таблицы и RLS

Открой **SQL Editor**, вставь содержимое `supabase/schema.sql` и нажми **Run**.

## 3. Скопируй API-настройки

В настройках проекта Supabase найди:

- Project URL
- Publishable key (или legacy anon key)

Создай локальный файл `.env.local` по примеру `.env.example`.

## 4. Добавь переменные в Vercel

Vercel → Project → Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Применить для Production, Preview и Development. Затем сделай новый production deploy.

## 5. Настрой URL авторизации

Supabase → Authentication → URL Configuration:

- Site URL: публичная ссылка CoffeeMind на Vercel
- Redirect URLs: добавь эту же ссылку и локальный `http://localhost:5173/**`

## Поведение миграции

При первом входе приложение объединяет локальные и облачные записи по ID и загружает результат в Supabase. После этого изменения дегустаций, книг и профиля синхронизируются автоматически.
