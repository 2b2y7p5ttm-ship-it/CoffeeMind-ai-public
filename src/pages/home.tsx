import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Flame, Plus, Brain, CalendarDays, Sparkles, BookOpen, Smartphone, Share2, Users } from 'lucide-react';
import { Link } from 'wouter';
import { useTastings } from '@/hooks/useTastings';
import { useProfile } from '@/hooks/useProfile';
import type { Tasting } from '@/hooks/useTastings';
import { TastingCard } from '@/components/TastingCard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 17) return 'Добрый день';
  if (h < 21) return 'Добрый вечер';
  return 'Доброй ночи';
}

function calcStreak(tastings: { createdAt: string }[]): number {
  if (!tastings.length) return 0;
  const days = [...new Set(tastings.map((t) => t.createdAt.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 0;
  let expected = days[0];
  for (const day of days) {
    if (day === expected) {
      streak++;
      const d = new Date(expected + 'T12:00:00Z');
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else break;
  }
  return streak;
}

function getMostCommon(arr: string[]): string {
  if (!arr.length) return '—';
  const counts: Record<string, number> = {};
  arr.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function getTodayLabel(): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date());
}

function getDescriptors(tasting: Tasting): string[] {
  return [
    ...(tasting.topThreeDescriptors || []),
    ...(tasting.additionalDescriptors || []),
    ...(tasting.flavorDescriptors || []),
  ].filter(Boolean);
}

function getTopDescriptor(tastings: Tasting[]): string {
  return getMostCommon(tastings.flatMap(getDescriptors));
}

function getFocusInsight(tastings: Tasting[]): string {
  if (!tastings.length) {
    return 'Начни с первой записи: оцени кислотность, сладость, тело и выбери три главных дескриптора.';
  }
  const latest = tastings[0];
  const descriptor = getTopDescriptor(tastings);
  if (descriptor !== '—') {
    return `Сегодня попробуй уточнить "${descriptor}": это аромат, вкус или послевкусие? Так растет точность дегустатора.`;
  }
  if (latest.acidity >= 8) return 'Последняя чашка была яркой по кислотности. В следующий раз раздели ее на цитрусовую, ягодную, винную или яблочную.';
  return 'Сделай один глоток после остывания и отметь, что изменилось: сладость, тело, чистота или послевкусие.';
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { tastings } = useTastings();
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterProcess, setFilterProcess] = useState<string | null>(null);
  const [filterMethod, setFilterMethod] = useState<string | null>(null);

  const greeting = getGreeting();
  const streak = calcStreak(tastings);

  const stats = useMemo(() => {
    const total = tastings.length;
    const avgScore = total
      ? (tastings.reduce((s, t) => s + t.overallScore, 0) / total).toFixed(1)
      : '—';
    const countries = new Set(tastings.filter((t) => t.country).map((t) => t.country)).size;
    const favProcess = getMostCommon(tastings.map((t) => t.processing || t.process || '').filter(Boolean));
    return { total, avgScore, countries, favProcess };
  }, [tastings]);

  const filtered = useMemo(() => {
    return tastings.filter((t) => {
      const q = query.toLowerCase();
      const matchSearch =
        !q ||
        t.coffeeName.toLowerCase().includes(q) ||
        (t.roaster || '').toLowerCase().includes(q) ||
        (t.country || '').toLowerCase().includes(q);
      const matchProcess = !filterProcess || (t.processing || t.process || '') === filterProcess;
      const matchMethod = !filterMethod || (t.brewMethod || t.brewingMethod || '') === filterMethod;
      return matchSearch && matchProcess && matchMethod;
    });
  }, [tastings, query, filterProcess, filterMethod]);

  const processes = [...new Set(tastings.map((t) => t.processing || t.process || '').filter(Boolean))];
  const methods = [...new Set(tastings.map((t) => t.brewMethod || t.brewingMethod || '').filter(Boolean))];
  const hasFilters = filterProcess !== null || filterMethod !== null;
  const topDescriptor = getTopDescriptor(tastings);
  const focusInsight = getFocusInsight(tastings);

  return (
    <div className="min-h-full bg-background pb-28">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="px-4 iphone-safe-top pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] border border-primary/20 px-3 py-1.5">
            <Sparkles size={13} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">CoffeeMind AI</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            <CalendarDays size={13} className="text-primary/70" />
            {getTodayLabel()}
          </div>
        </div>

        <div className="flex items-start justify-between mb-5">
          <div className="min-w-0 pr-4">
            <p className="text-muted-foreground text-[13px] font-medium mb-1">
              {greeting}, {profile.name}
            </p>
            <h1 className="font-serif text-[2.08rem] font-medium text-foreground leading-[0.98]">
              Твой вкус становится точнее
            </h1>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-shrink-0">
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="flex flex-col items-center coffee-panel backdrop-blur-sm rounded-2xl px-3 py-2.5"
              >
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame size={13} className="fill-orange-400" />
                  <span className="font-bold text-[14px] tabular-nums">{streak}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-semibold mt-0.5">
                  дней
                </span>
              </motion.div>
            )}

            {/* Avatar */}
            <Link href="/profile">
              <motion.div
                whileTap={{ scale: 0.93 }}
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[13px] text-primary-foreground shadow-[0_0_16px_rgba(217,163,95,0.2)] ring-1 ring-white/10"
                style={{ background: profile.avatarColor || '#D9A35F' }}
              >
                {getInitials(profile.name)}
              </motion.div>
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="coffee-panel rounded-[24px] p-4 mb-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Brain size={17} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1.5">Сегодняшний фокус</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{focusInsight}</p>
              {topDescriptor !== '—' && (
                <div className="mt-3 inline-flex rounded-full bg-white/[0.05] border border-white/[0.07] px-3 py-1 text-[11px] text-foreground">
                  Частый дескриптор: <span className="text-primary ml-1">{topDescriptor}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <Link href="/welcome">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.052 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[24px] p-4 mb-4 flex items-center gap-3 bg-white/[0.045] border border-white/[0.075]"
          >
            <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-primary flex-shrink-0">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Публичная версия</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Каждый пользователь получает свой журнал кофе и книг. Данные не смешиваются.</p>
            </div>
          </motion.div>
        </Link>

        <Link href="/share">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.056 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[24px] p-4 mb-4 flex items-center gap-3 bg-primary/[0.075] border border-primary/20"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Share2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Поделиться CoffeeMind</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Скопируй ссылку и отправь друзьям: у них будет собственный локальный журнал.</p>
            </div>
          </motion.div>
        </Link>


        <Link href="/install">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.055 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-[24px] p-4 mb-4 flex items-center gap-3 bg-primary/[0.085] border border-primary/20"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Установить на телефон</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Установи CoffeeMind AI на Android или iPhone как отдельное приложение.</p>
            </div>
          </motion.div>
        </Link>

        <Link href="/books">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            whileTap={{ scale: 0.98 }}
            className="coffee-panel rounded-[24px] p-4 mb-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Книжный журнал</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Оценки книг, настроение чтения и пары с кофе. Без сценариев к роликам.</p>
            </div>
          </motion.div>
        </Link>

        {/* Stats row */}
        {tastings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 gap-2.5 mb-5"
          >
            {[
              { label: 'Дегустации', value: stats.total },
              { label: 'Средний балл', value: stats.avgScore },
              { label: 'Страны', value: stats.countries || '—' },
              { label: 'Обработка', value: stats.favProcess.slice(0, 9) },
            ].map((s) => (
              <div
                key={s.label}
                className="coffee-panel rounded-2xl px-3 py-3"
              >
                <div className="font-serif text-[1.35rem] text-primary leading-none">{s.value}</div>
                <div className="text-[9px] uppercase tracking-wide text-muted-foreground/50 font-semibold mt-1.5 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск кофе, обжарщика…"
              className="w-full h-12 bg-card/60 border border-white/[0.07] rounded-2xl pl-9 pr-10 text-[14px] text-foreground placeholder:text-muted-foreground/35 outline-none focus:border-primary/40 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowFilter(true)}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${
              hasFilters
                ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_16px_rgba(217,163,95,0.25)]'
                : 'bg-card/60 border-white/[0.07] text-muted-foreground hover:text-foreground'
            }`}
          >
            <SlidersHorizontal size={15} />
          </motion.button>
        </motion.div>
      </div>

      {/* ── Journal list ─────────────────────────────────────────────────── */}
      <div className="px-4">
        {tastings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-20 pb-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-card/60 border border-white/[0.06] flex items-center justify-center mb-5 text-4xl">
              ☕
            </div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-2">Журнал ждет первую чашку</h2>
            <p className="text-muted-foreground text-[14px] max-w-[240px] leading-relaxed mb-7">
              Начни сохранять дегустации и строить память вкуса.
            </p>
            <Link href="/add">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground px-7 h-12 rounded-full font-semibold text-[14px] flex items-center gap-2 shadow-[0_4px_24px_rgba(217,163,95,0.3)]"
              >
                <Plus size={18} />
                Первая дегустация
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">
                {filtered.length !== tastings.length
                  ? `${filtered.length} из ${tastings.length}`
                  : `Дегустации · ${tastings.length}`}
              </h2>
              {hasFilters && (
                <button
                  onClick={() => { setFilterProcess(null); setFilterMethod(null); }}
                  className="text-[11px] text-primary font-medium"
                >
                  Сбросить
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-[14px]">
                Ничего не найдено.
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((tasting, i) => (
                  <TastingCard key={tasting.id} tasting={tasting} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Filter bottom sheet ──────────────────────────────────────────── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showFilter && (
            <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilter(false)}
              className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-[1010] flex justify-center"
            >
              <div className="w-full max-w-[430px] max-h-[calc(100dvh-var(--safe-top)-0.75rem)] overflow-y-auto overscroll-contain bg-[#111]/95 backdrop-blur-2xl border-t border-white/[0.07] rounded-t-[32px] px-5 pt-4 iphone-sheet-bottom shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
                <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-5" />
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-xl font-medium">Filter</h3>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                {processes.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/40 mb-2.5">
                      Process
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {processes.map((p) => (
                        <button
                          key={p}
                          onClick={() => setFilterProcess(filterProcess === p ? null : p)}
                          className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                            filterProcess === p
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card/60 text-muted-foreground border-white/10 hover:border-white/20'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {methods.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/40 mb-2.5">
                      Brewing Method
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {methods.map((m) => (
                        <button
                          key={m}
                          onClick={() => setFilterMethod(filterMethod === m ? null : m)}
                          className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                            filterMethod === m
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card/60 text-muted-foreground border-white/10 hover:border-white/20'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowFilter(false)}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-full font-semibold text-[14px] shadow-[0_4px_16px_rgba(217,163,95,0.25)]"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
