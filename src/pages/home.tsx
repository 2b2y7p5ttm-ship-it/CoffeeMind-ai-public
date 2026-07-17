import { type ReactNode, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Coffee,
  Filter,
  Globe2,
  Heart,
  Leaf,
  LogIn,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Undo2,
  UserPlus,
  X,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { JournalTastingCard } from '@/components/journal/JournalTastingCard';
import { JournalPreview } from '@/components/journal/JournalPreview';
import { tastingSearchText } from '@/lib/journal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const DELETE_DELAY_MS = 5_000;
const PAGE_SIZE = 36;
const SCROLL_STORAGE_KEY = 'coffeemind:journal-scroll-y';

interface JournalFilters {
  favorites: boolean;
  highScore: boolean;
  country: string;
  processing: string;
  method: string;
}

const DEFAULT_FILTERS: JournalFilters = {
  favorites: false,
  highScore: false,
  country: '',
  processing: '',
  method: '',
};

function toGenitiveName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLocaleLowerCase('ru-RU');

  const irregular: Record<string, string> = {
    павел: 'Павла',
    лев: 'Льва',
    пётр: 'Петра',
    петр: 'Петра',
    илля: 'Ильи',
  };
  if (irregular[lower]) return irregular[lower];

  const last = trimmed.slice(-1);
  const stem = trimmed.slice(0, -1);

  if (last === 'а' || last === 'А') return `${stem}ы`;
  if (last === 'я' || last === 'Я') return `${stem}и`;
  if (last === 'й' || last === 'Й') return `${stem}я`;
  if (last === 'ь' || last === 'Ь') return `${stem}я`;
  if (/[бвгджзклмнпрстфхцчшщБВГДЖЗКЛМНПРСТФХЦЧШЩ]$/.test(trimmed)) return `${trimmed}а`;

  return trimmed;
}

function groupTitle(date: Date): string {
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  if (isThisWeek(date, { weekStartsOn: 1 })) return 'На этой неделе';
  return format(date, 'LLLL yyyy', { locale: ru });
}

function pluralizeChapters(value: number): string {
  const modulo100 = value % 100;
  const modulo10 = value % 10;
  if (modulo100 >= 11 && modulo100 <= 14) return `${value} глав`;
  if (modulo10 === 1) return `${value} глава`;
  if (modulo10 >= 2 && modulo10 <= 4) return `${value} главы`;
  return `${value} глав`;
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right, 'ru'));
}

interface FilterGroupProps {
  icon: ReactNode;
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

function FilterGroup({ icon, label, options, selected, onSelect }: FilterGroupProps) {
  return (
    <div className="cm-journal-filter-group">
      <div className="cm-journal-filter-group-title">
        {icon}
        <span>{label}</span>
      </div>
      {options.length ? (
        <div className="cm-journal-filter-options" role="list">
          {options.map((option) => {
            const isSelected = option === selected;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                className={isSelected ? 'is-active' : ''}
                onClick={() => onSelect(isSelected ? '' : option)}
              >
                {isSelected && <Check size={13} />}
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="cm-journal-filter-empty">Пока нет данных для этого фильтра</p>
      )}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { tastings, updateTasting, deleteTasting } = useTastings();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const [filters, setFilters] = useLocalStorage<JournalFilters>('coffeemind_journal_filters_v3', DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase('ru-RU'));
  const [showFilters, setShowFilters] = useState(false);
  const [preview, setPreview] = useState<Tasting | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Tasting | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const pendingDeleteRef = useRef<Tasting | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const deleteTastingRef = useRef(deleteTasting);

  useEffect(() => {
    deleteTastingRef.current = deleteTasting;
  }, [deleteTasting]);

  useEffect(() => {
    const savedScroll = Number(window.sessionStorage.getItem(SCROLL_STORAGE_KEY) || 0);
    const restoreFrame = window.requestAnimationFrame(() => {
      if (savedScroll > 0) window.scrollTo({ top: savedScroll, behavior: 'auto' });
    });

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        window.sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(restoreFrame);
      window.sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => () => {
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    if (pendingDeleteRef.current) deleteTastingRef.current(pendingDeleteRef.current.id);
  }, []);

  const nickname = useMemo(() => {
    if (!user) return '';
    const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : '';
    const profileName = profile.name?.trim() || '';
    const emailName = user.email?.split('@')[0] || 'пользователя';
    return metadataName || (profileName && profileName !== 'Роман' ? profileName : '') || emailName;
  }, [profile.name, user]);
  const journalOwner = useMemo(() => toGenitiveName(nickname), [nickname]);

  const filterOptions = useMemo(() => ({
    countries: uniqueValues(tastings.map((tasting) => tasting.country)),
    processings: uniqueValues(tastings.map((tasting) => tasting.processing || tasting.process)),
    methods: uniqueValues(tastings.map((tasting) => tasting.brewMethod || tasting.brewingMethod)),
  }), [tastings]);

  const searchIndex = useMemo(() => tastings.map((tasting) => ({
    tasting,
    searchText: tastingSearchText(tasting),
  })), [tastings]);

  const filtered = useMemo(() => searchIndex
    .filter(({ tasting, searchText }) => {
      if (pendingDelete?.id === tasting.id) return false;
      if (deferredQuery && !searchText.includes(deferredQuery)) return false;
      if (filters.favorites && !tasting.favorite) return false;
      if (filters.highScore && Number(tasting.overallScore || 0) < 85) return false;
      if (filters.country && tasting.country !== filters.country) return false;
      if (filters.processing && (tasting.processing || tasting.process || '') !== filters.processing) return false;
      if (filters.method && (tasting.brewMethod || tasting.brewingMethod || '') !== filters.method) return false;
      return true;
    })
    .map(({ tasting }) => tasting), [deferredQuery, filters, pendingDelete?.id, searchIndex]);

  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [deferredQuery, filters.country, filters.favorites, filters.highScore, filters.method, filters.processing]);

  const visibleTastings = useMemo(() => filtered.slice(0, visibleLimit), [filtered, visibleLimit]);
  const remainingCount = Math.max(0, filtered.length - visibleTastings.length);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || remainingCount <= 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleLimit((current) => Math.min(current + PAGE_SIZE, filtered.length));
      }
    }, { rootMargin: '320px 0px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length, remainingCount]);

  const grouped = useMemo(() => {
    const result: { title: string; items: Tasting[] }[] = [];
    visibleTastings.forEach((tasting) => {
      const title = groupTitle(parseISO(tasting.createdAt));
      const last = result[result.length - 1];
      if (last?.title === title) last.items.push(tasting);
      else result.push({ title, items: [tasting] });
    });
    return result;
  }, [visibleTastings]);

  const activeFilterCount = Number(filters.favorites)
    + Number(filters.highScore)
    + Number(Boolean(filters.country))
    + Number(Boolean(filters.processing))
    + Number(Boolean(filters.method));
  const hasActiveFilters = activeFilterCount > 0;
  const hasSearchOrFilters = Boolean(deferredQuery) || hasActiveFilters;

  const updateFilters = useCallback((patch: Partial<JournalFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setQuery('');
  }, [setFilters]);

  const share = async (tasting: Tasting) => {
    const text = `${tasting.coffeeName} — ${tasting.overallScore}/100\n${[tasting.country, tasting.processing || tasting.process].filter(Boolean).join(' · ')}`;
    if (navigator.share) await navigator.share({ title: tasting.coffeeName, text }).catch(() => undefined);
    else await navigator.clipboard?.writeText(text);
  };

  const queueDelete = useCallback((tasting: Tasting) => {
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);

    const previousPending = pendingDeleteRef.current;
    if (previousPending && previousPending.id !== tasting.id) {
      deleteTastingRef.current(previousPending.id);
    }

    pendingDeleteRef.current = tasting;
    setPendingDelete(tasting);
    deleteTimerRef.current = window.setTimeout(() => {
      deleteTastingRef.current(tasting.id);
      if (pendingDeleteRef.current?.id === tasting.id) {
        pendingDeleteRef.current = null;
        setPendingDelete(null);
      }
      deleteTimerRef.current = null;
    }, DELETE_DELAY_MS);
  }, []);

  const undoDelete = useCallback(() => {
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    deleteTimerRef.current = null;
    pendingDeleteRef.current = null;
    setPendingDelete(null);
  }, []);

  return (
    <main className="cm-journal min-h-full pb-32 iphone-safe-top">
      <header className="cm-journal-header px-4 pt-3">
        <div>
          <p className="cm-journal-eyebrow">Мой кофейный путь</p>
          <h1>{user ? `Журнал ${journalOwner}` : 'Журнал'}</h1>
          <p>{tastings.length ? `${pluralizeChapters(tastings.length)} о вкусе` : 'Первая глава ещё впереди'}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          type="button"
          className={`cm-journal-filter ${showFilters || hasActiveFilters ? 'is-active' : ''}`}
          onClick={() => setShowFilters((value) => !value)}
          aria-label="Открыть фильтры"
          aria-expanded={showFilters}
        >
          <Filter size={18} />
          {activeFilterCount > 0 && <span className="cm-journal-filter-badge">{activeFilterCount}</span>}
        </motion.button>
      </header>

      {!authLoading && !user && (
        <section className="px-4 mt-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-1 rounded-[24px] border border-primary/20 bg-card/75 p-4 shadow-sm backdrop-blur-xl"
          >
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
          </motion.div>
        </section>
      )}

      <section className="cm-journal-tools px-4 mt-4">
        <div className="cm-journal-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Страна, обработка, вкус, метод…"
            aria-label="Поиск по журналу"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={17} /></button>
          ) : (
            <SlidersHorizontal size={16} className="opacity-45" />
          )}
        </div>

        {tastings.length > 0 && (
          <div className="cm-journal-quick-filters" aria-label="Быстрые фильтры">
            <button
              type="button"
              className={!hasActiveFilters ? 'is-active' : ''}
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Все
            </button>
            <button
              type="button"
              className={filters.favorites ? 'is-active' : ''}
              aria-pressed={filters.favorites}
              onClick={() => updateFilters({ favorites: !filters.favorites })}
            >
              <Heart size={14} fill={filters.favorites ? 'currentColor' : 'none'} />
              Избранное
            </button>
            <button
              type="button"
              className={filters.highScore ? 'is-active' : ''}
              aria-pressed={filters.highScore}
              onClick={() => updateFilters({ highScore: !filters.highScore })}
            >
              <Star size={14} fill={filters.highScore ? 'currentColor' : 'none'} />
              85+
            </button>
            <button
              type="button"
              className={showFilters ? 'is-active' : ''}
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={14} />
              Ещё
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
          </div>
        )}

        <AnimatePresence initial={false}>
          {showFilters && tastings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="cm-journal-filter-panel"
            >
              <div className="cm-journal-filter-panel-head">
                <div>
                  <p>Точные фильтры</p>
                  <span>{filtered.length} из {tastings.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasActiveFilters && (
                    <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="cm-journal-filter-reset">
                      <RotateCcw size={14} />
                      Сбросить
                    </button>
                  )}
                  <button type="button" onClick={() => setShowFilters(false)} className="cm-journal-filter-close" aria-label="Закрыть фильтры">
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              <FilterGroup
                icon={<Globe2 size={15} />}
                label="Страна"
                options={filterOptions.countries}
                selected={filters.country}
                onSelect={(country) => updateFilters({ country })}
              />
              <FilterGroup
                icon={<Leaf size={15} />}
                label="Обработка"
                options={filterOptions.processings}
                selected={filters.processing}
                onSelect={(processing) => updateFilters({ processing })}
              />
              <FilterGroup
                icon={<Coffee size={15} />}
                label="Метод"
                options={filterOptions.methods}
                selected={filters.method}
                onSelect={(method) => updateFilters({ method })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {hasActiveFilters && (
          <div className="cm-journal-active-filters">
            {filters.country && <button type="button" onClick={() => updateFilters({ country: '' })}>{filters.country}<X size={12} /></button>}
            {filters.processing && <button type="button" onClick={() => updateFilters({ processing: '' })}>{filters.processing}<X size={12} /></button>}
            {filters.method && <button type="button" onClick={() => updateFilters({ method: '' })}>{filters.method}<X size={12} /></button>}
          </div>
        )}
      </section>

      {tastings.length === 0 ? (
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="cm-journal-empty mx-4 mt-6">
          <div className="cm-journal-empty-icon"><Coffee size={27} /></div>
          <p className="cm-journal-eyebrow">Пока здесь тихо</p>
          <h2>Сохрани первую чашку</h2>
          <p>Добавь первую дегустацию и начни собирать собственную историю вкуса.</p>
          <button onClick={() => navigate('/add')} className="cm-primary-action mt-6"><Sparkles size={18} />Добавить дегустацию</button>
        </motion.section>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="cm-no-results mx-4 mt-7">
          <div className="cm-no-results-icon"><Search size={22} /></div>
          <p>Совпадений нет</p>
          <span>Измени запрос или убери часть фильтров.</span>
          <button type="button" onClick={resetFilters}><RotateCcw size={14} />Сбросить поиск и фильтры</button>
        </motion.div>
      ) : (
        <div className="px-4 mt-7 space-y-8">
          {hasSearchOrFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cm-journal-results-summary">
              Найдено: <strong>{filtered.length}</strong>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {grouped.map((group, groupIndex) => (
              <motion.section
                key={group.title}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: groupIndex * 0.035 }}
                className="cm-journal-group"
              >
                <div className="cm-journal-section-head"><h2>{group.title}</h2><span>{group.items.length}</span></div>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((tasting, index) => (
                      <motion.div
                        key={tasting.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -24, scale: 0.96 }}
                        transition={{ delay: index * 0.018, duration: 0.26 }}
                      >
                        <JournalTastingCard
                          tasting={tasting}
                          searchQuery={deferredQuery}
                          onOpen={() => navigate(`/tasting/${tasting.id}`)}
                          onEdit={() => navigate(`/tasting/${tasting.id}/edit`)}
                          onDelete={() => queueDelete(tasting)}
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

          {remainingCount > 0 && (
            <div ref={loadMoreRef} className="cm-journal-load-more">
              <button type="button" onClick={() => setVisibleLimit((current) => Math.min(current + PAGE_SIZE, filtered.length))}>
                Показать ещё {Math.min(PAGE_SIZE, remainingCount)}
              </button>
              <span>Осталось {remainingCount}</span>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            key={pendingDelete.id}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            className="cm-journal-undo"
            role="status"
            aria-live="polite"
          >
            <div className="min-w-0">
              <strong>Дегустация удалена</strong>
              <span>{pendingDelete.coffeeName || 'Без названия'}</span>
            </div>
            <button type="button" onClick={undoDelete}><Undo2 size={15} />Отменить</button>
            <div className="cm-journal-undo-progress" />
          </motion.div>
        )}
      </AnimatePresence>

      <JournalPreview tasting={preview} onClose={() => setPreview(null)} onOpen={() => { if (preview) navigate(`/tasting/${preview.id}`); setPreview(null); }} />
    </main>
  );
}
