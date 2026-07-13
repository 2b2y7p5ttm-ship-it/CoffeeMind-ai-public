import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Coffee, Filter, LogIn, Search, SlidersHorizontal, Sparkles, UserPlus, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { JournalTastingCard } from '@/components/journal/JournalTastingCard';
import { JournalPreview } from '@/components/journal/JournalPreview';
import { tastingSearchText } from '@/lib/journal';
import { useAuth } from '@/contexts/AuthContext';

function groupTitle(date: Date): string {
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'На этой неделе';
  return format(date, 'LLLL yyyy', { locale: ru });
}

export default function Home() {
  const [, navigate] = useLocation();
  const { tastings, updateTasting, deleteTasting } = useTastings();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [preview, setPreview] = useState<Tasting | null>(null);

  const filtered = useMemo(() => tastings.filter((tasting) => {
    const matches = !query.trim() || tastingSearchText(tasting).includes(query.trim().toLowerCase());
    return matches && (!onlyFavorites || tasting.favorite);
  }), [tastings, query, onlyFavorites]);

  const grouped = useMemo(() => {
    const result: { title: string; items: Tasting[] }[] = [];
    filtered.forEach((tasting) => {
      const title = groupTitle(parseISO(tasting.createdAt));
      const last = result[result.length - 1];
      if (last?.title === title) last.items.push(tasting);
      else result.push({ title, items: [tasting] });
    });
    return result;
  }, [filtered]);

  const share = async (tasting: Tasting) => {
    const text = `${tasting.coffeeName} — ${tasting.overallScore}/100\n${[tasting.country, tasting.processing || tasting.process].filter(Boolean).join(' · ')}`;
    if (navigator.share) await navigator.share({ title: tasting.coffeeName, text }).catch(() => undefined);
    else await navigator.clipboard?.writeText(text);
  };

  const remove = (tasting: Tasting) => {
    if (window.confirm(`Удалить «${tasting.coffeeName}»?`)) deleteTasting(tasting.id);
  };

  return (
    <main className="cm-journal min-h-full pb-32 iphone-safe-top">
      <header className="cm-journal-header px-4 pt-3">
        <div>
          <p className="cm-journal-eyebrow">Мой кофейный путь</p>
          <h1>Журнал</h1>
          <p>{tastings.length ? `${tastings.length} ${tastings.length === 1 ? 'глава' : 'глав'} о вкусе` : 'Первая глава ещё впереди'}</p>
        </div>
        <motion.button whileTap={{ scale: .88 }} className={`cm-journal-filter ${onlyFavorites ? 'is-active' : ''}`} onClick={() => setOnlyFavorites((value) => !value)} aria-label="Только избранное">
          <Filter size={18} />
        </motion.button>
      </header>

      <section className="px-4 mt-5">
        {!authLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-[24px] border border-primary/20 bg-card/75 p-4 shadow-sm backdrop-blur-xl"
          >
            {user?.email ? (
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Cloud size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] uppercase tracking-[0.16em] text-primary">Аккаунт подключён</span>
                  <span className="mt-1 block truncate text-sm font-semibold text-foreground">{user.email}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Управление аккаунтом и синхронизацией</span>
                </span>
                <span className="text-xl text-muted-foreground">›</span>
              </button>
            ) : (
              <>
                <div className="mb-3">
                  <p className="text-sm font-semibold text-foreground">Сохрани записи на всех устройствах</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Создай аккаунт или войди, чтобы включить облачную синхронизацию.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => navigate('/account?mode=signup')}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-sm font-bold text-primary-foreground"
                  >
                    <UserPlus size={17} />
                    Регистрация
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => navigate('/account?mode=login')}
                    className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground"
                  >
                    <LogIn size={17} />
                    Войти
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}

        <div className="cm-journal-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Страна, обработка, вкус, метод…" />
          {query && <button onClick={() => setQuery('')}><X size={17} /></button>}
          {!query && <SlidersHorizontal size={16} className="opacity-45" />}
        </div>
      </section>

      {tastings.length === 0 ? (
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="cm-journal-empty mx-4 mt-6">
          <div className="cm-journal-empty-icon"><Coffee size={27} /></div>
          <p className="cm-journal-eyebrow">Новая история</p>
          <h2>Сохрани первую чашку</h2>
          <p>Через время эти записи станут картой того, как менялся твой вкус.</p>
          <button onClick={() => navigate('/add')} className="cm-primary-action mt-6"><Sparkles size={18} />Начать дегустацию</button>
        </motion.section>
      ) : (
        <div className="px-4 mt-7 space-y-8">
          <AnimatePresence mode="popLayout">
            {grouped.map((group, groupIndex) => (
              <motion.section key={group.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIndex * .05 }}>
                <div className="cm-journal-section-head"><h2>{group.title}</h2><span>{group.items.length}</span></div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((tasting, index) => (
                      <motion.div key={tasting.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ delay: index * .025 }}>
                        <JournalTastingCard
                          tasting={tasting}
                          onOpen={() => navigate(`/tasting/${tasting.id}`)}
                          onEdit={() => navigate(`/tasting/${tasting.id}/edit`)}
                          onDelete={() => remove(tasting)}
                          onFavorite={() => updateTasting(tasting.id, { favorite: !tasting.favorite })}
                          onShare={() => share(tasting)}
                          onPreview={() => setPreview(tasting)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && <div className="cm-no-results"><Search size={22} /><p>Ничего не найдено</p><button onClick={() => { setQuery(''); setOnlyFavorites(false); }}>Сбросить фильтры</button></div>}
        </div>
      )}

      <JournalPreview tasting={preview} onClose={() => setPreview(null)} onOpen={() => { if (preview) navigate(`/tasting/${preview.id}`); setPreview(null); }} />
    </main>
  );
}
