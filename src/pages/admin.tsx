import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Coffee,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { supabase } from '@/lib/supabase';

type DailyPoint = {
  day: string;
  registrations: number;
};

type DashboardData = {
  total_users: number;
  users_today: number;
  users_7d: number;
  users_30d: number;
  active_7d: number;
  total_tastings: number;
  total_books: number;
  avg_tastings_per_user: number;
  registration_series: DailyPoint[];
};

type RecentUser = {
  id: string;
  email: string | null;
  name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  tasting_count: number;
  book_count: number;
};

const emptyDashboard: DashboardData = {
  total_users: 0,
  users_today: 0,
  users_7d: 0,
  users_30d: 0,
  active_7d: 0,
  total_tastings: 0,
  total_books: 0,
  avg_tastings_per_user: 0,
  registration_series: [],
};

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[22px] border border-white/[0.07] bg-card/70 p-4"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <Icon size={18} className="text-primary" />
        </div>
        {note && <span className="text-[10px] text-muted-foreground/50">{note}</span>}
      </div>
      <p className="font-serif text-[2rem] leading-none text-foreground">{value}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/55">{label}</p>
    </motion.div>
  );
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTimeAgo(value: string | null) {
  if (!value) return 'не входил';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн назад`;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: accessLoading } = useAdminAccess();
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const maxRegistrations = useMemo(
    () => Math.max(1, ...dashboard.registration_series.map((point) => point.registrations)),
    [dashboard.registration_series],
  );

  async function loadData() {
    if (!supabase || !isAdmin) return;
    setLoading(true);
    setError('');

    const [dashboardResult, usersResult] = await Promise.all([
      supabase.rpc('coffeemind_admin_dashboard'),
      supabase.rpc('coffeemind_admin_recent_users', { p_limit: 12 }),
    ]);

    if (dashboardResult.error || usersResult.error) {
      const message = dashboardResult.error?.message || usersResult.error?.message || 'Не удалось загрузить аналитику';
      setError(message);
      setLoading(false);
      return;
    }

    const payload = dashboardResult.data as DashboardData | null;
    setDashboard(payload ?? emptyDashboard);
    setRecentUsers((usersResult.data ?? []) as RecentUser[]);
    setLoading(false);
  }

  useEffect(() => {
    if (isAdmin) void loadData();
    else if (!accessLoading) setLoading(false);
  }, [isAdmin, accessLoading]);

  const waiting = authLoading || accessLoading;

  if (waiting) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-8 text-center">
        <div>
          <RefreshCw className="mx-auto mb-4 animate-spin text-primary" size={26} />
          <p className="text-sm text-muted-foreground">Проверяем доступ…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background px-7 text-center">
        <div className="max-w-sm rounded-[28px] border border-white/[0.07] bg-card/70 p-7">
          <ShieldAlert className="mx-auto mb-4 text-primary" size={32} />
          <h1 className="font-serif text-2xl text-foreground">Доступ закрыт</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Панель владельца доступна только аккаунтам, добавленным в список администраторов Supabase.
          </p>
          <button
            onClick={() => setLocation('/settings')}
            className="mt-6 h-11 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Вернуться в настройки
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-28">
      <header className="sticky top-0 z-20 border-b border-white/[0.04] bg-background/90 px-4 pb-5 pt-12 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setLocation('/settings')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-card/70 text-muted-foreground"
            >
              <ArrowLeft size={19} />
            </motion.button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary/70">Owner only</p>
              <h1 className="font-serif text-[1.65rem] leading-none text-foreground">CoffeeMind Admin</h1>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => void loadData()}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-card/70 text-muted-foreground disabled:opacity-50"
            aria-label="Обновить аналитику"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        </div>
      </header>

      <main className="space-y-6 px-4 pt-5">
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section>
          <div className="mb-3 flex items-end justify-between px-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">Аудитория</p>
              <h2 className="mt-1 font-serif text-xl text-foreground">Пользователи</h2>
            </div>
            <span className="text-[11px] text-muted-foreground/45">обновляется вручную</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Users} label="Всего" value={dashboard.total_users} />
            <MetricCard icon={UserPlus} label="Сегодня" value={dashboard.users_today} />
            <MetricCard icon={CalendarDays} label="За 7 дней" value={dashboard.users_7d} />
            <MetricCard icon={TrendingUp} label="За 30 дней" value={dashboard.users_30d} />
            <MetricCard icon={Activity} label="Активны 7 дней" value={dashboard.active_7d} />
            <MetricCard
              icon={Coffee}
              label="Чашек на пользователя"
              value={dashboard.avg_tastings_per_user.toFixed(1)}
            />
          </div>
        </section>

        <section>
          <div className="mb-3 px-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">Контент</p>
            <h2 className="mt-1 font-serif text-xl text-foreground">Активность в приложении</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Coffee} label="Дегустации" value={dashboard.total_tastings} />
            <MetricCard icon={BookOpen} label="Книги" value={dashboard.total_books} />
          </div>
        </section>

        <section className="rounded-[24px] border border-white/[0.07] bg-card/65 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">Рост</p>
              <h2 className="mt-1 font-serif text-xl text-foreground">Регистрации за 14 дней</h2>
            </div>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="flex h-36 items-end gap-1.5">
            {dashboard.registration_series.map((point) => {
              const height = Math.max(6, (point.registrations / maxRegistrations) * 100);
              return (
                <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <div
                    title={`${point.day}: ${point.registrations}`}
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary/35 to-primary transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-muted-foreground/40">
                    {new Date(`${point.day}T00:00:00`).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 px-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">Последние</p>
            <h2 className="mt-1 font-serif text-xl text-foreground">Новые пользователи</h2>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-card/65 divide-y divide-white/[0.05]">
            {loading ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">Загружаем пользователей…</div>
            ) : recentUsers.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">Пока нет зарегистрированных пользователей</div>
            ) : (
              recentUsers.map((recentUser) => (
                <div key={recentUser.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {recentUser.name || recentUser.email || 'Пользователь CoffeeMind'}
                      </p>
                      {recentUser.email && recentUser.name && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground/55">{recentUser.email}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground/45">{formatTimeAgo(recentUser.last_sign_in_at)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/45">
                    <span>Регистрация: {formatDate(recentUser.created_at)}</span>
                    <span>{recentUser.tasting_count} чашек · {recentUser.book_count} книг</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
