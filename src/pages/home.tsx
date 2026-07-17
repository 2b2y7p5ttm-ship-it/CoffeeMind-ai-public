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
import { enUS, ru } from 'date-fns/locale';
import { useTastings, Tasting } from '@/hooks/useTastings';
import { JournalTastingCard } from '@/components/journal/JournalTastingCard';
import { JournalPreview } from '@/components/journal/JournalPreview';
import { tastingSearchText } from '@/lib/journal';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLanguage, type AppLanguage } from '@/contexts/LanguageContext';
import { localizeProcessing } from '@/lib/processingI18n';

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

function groupTitle(date: Date, language: AppLanguage): string {
  if (isToday(date)) return language === 'ru' ? 'Сегодня' : 'Today';
  if (isYesterday(date)) return language === 'ru' ? 'Вчера' : 'Yesterday';
  if (isThisWeek(date, { weekStartsOn: 1 })) return language === 'ru' ? 'На этой неделе' : 'This week';
  return format(date, 'LLLL yyyy', { locale: language === 'ru' ? ru : enUS });
}

function pluralizeChapters(value: number, language: AppLanguage): string {
  if (language === 'en') return `${value} ${value === 1 ? 'chapter' : 'chapters'} of taste`;
  const modulo100 = value % 100;
  const modulo10 = value % 10;
  if (modulo100 >= 11 && modulo100 <= 14) return `${value} глав о вкусе`;
  if (modulo10 === 1) return `${value} глава о вкусе`;
  if (modulo10 >= 2 && modulo10 <= 4) return `${value} главы о вкусе`;
  return `${value} глав о вкусе`;
}

function uniqueValues(values: Array<string | undefined>, locale: string): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right, locale));
}

interface FilterGroupProps {
  icon: ReactNode;
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  formatOption?: (value: string) => string;
}

function FilterGroup({ icon, label, options, selected, onSelect, formatOption = (value) => value }: FilterGroupProps) {
  const { t } = useLanguage();
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
                {formatOption(option)}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="cm-journal-filter-empty">{t('journal.noFilterData')}</p>
      )}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { language, locale, t } = useLanguage();
  const { tastings, updateTasting, deleteTasting } = useTastings();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const [filters, setFilters] = useLocalStorage<JournalFilters>('coffeemind_journal_filters_v3', DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase(locale));
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
    const emailName = user.email?.split('@')[0] || (language === 'ru' ? 'пользователя' : 'user');
    return metadataName || (profileName && profileName !== 'Роман' ? profileName : '') || emailName;
  }, [language, profile.name, user]);
  const journalOwner = useMemo(() => language === 'ru' ? toGenitiveName(nickname) : nickname, [language, nickname]);

  const filterOptions = useMemo(() => ({
    countries: uniqueValues(tastings.map((tasting) => tasting.country), locale),
    processings: uniqueValues(tastings.map((tasting) => tasting.processing || tasting.process), locale),
    methods: uniqueValues(tastings.map((tasting) => tasting.brewMethod || tasting.brewingMethod), locale),
  }), [locale, tastings]);

  const searchIndex = useMemo(() => tastings.map((tasting) => ({
    tasting,
    searchText: `${tastingSearchText(tasting)} ${localizeProcessing(tasting.processing || tasting.process, language).toLocaleLowerCase(locale)}`,
  })), [language, locale, tastings]);

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
      const title = groupTitle(parseISO(tasting.createdAt), language);
      const last = result[result.length - 1];
      if (last?.title === title) last.items.push(tasting);
      else result.push({ title, items: [tasting] });
    });
    return result;
  }, [language, visibleTastings]);

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
    const text = `${tasting.coffeeName} — ${tasting.overallScore}/100\n${[tasting.country, localizeProcessing(tasting.processing || tasting.process, language)].filter(Boolean).join(' · ')}`;
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
          <p className="cm-journal-eyebrow">{t('journal.eyebrow')}</p>
          <h1>{user ? t('journal.ownerTitle', { name: journalOwner }) : t('journal.title')}</h1>
          <p>{tastings.length ? pluralizeChapters(tastings.length, language) : t('journal.firstChapter')}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          type="button"
          className={`cm-journal-filter ${showFilters || hasActiveFilters ? 'is-active' : ''}`}
          onClick={() => setShowFilters((value) => !value)}
          aria-label={t('journal.openFilters')}
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
              <p className="text-sm font-semibold text-foreground">{t('journal.authTitle')}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('journal.authText')}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => navigate('/account?mode=signup')}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-sm font-bold text-primary-foreground"
              >
                <UserPlus size={17} />
                {t('journal.signUp')}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => navigate('/account?mode=login')}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-3 text-sm font-semibold text-foreground"
              >
                <LogIn size={17} />
                {t('journal.signIn')}
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
            placeholder={t('journal.searchPlaceholder')}
            aria-label={t('journal.searchLabel')}
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label={t('journal.clearSearch')}><X size={17} /></button>
          ) : (
            <SlidersHorizontal size={16} className="opacity-45" />
          )}
        </div>

        {tastings.length > 0 && (
          <div className="cm-journal-quick-filters" aria-label={t('journal.quickFilters')}>
            <button
              type="button"
              className={!hasActiveFilters ? 'is-active' : ''}
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              {t('journal.all')}
            </button>
            <button
              type="button"
              className={filters.favorites ? 'is-active' : ''}
              aria-pressed={filters.favorites}
              onClick={() => updateFilters({ favorites: !filters.favorites })}
            >
              <Heart size={14} fill={filters.favorites ? 'currentColor' : 'none'} />
              {t('journal.favorites')}
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
              {t('journal.more')}
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
                  <p>{t('journal.preciseFilters')}</p>
                  <span>{filtered.length} {t('journal.of')} {tastings.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasActiveFilters && (
                    <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="cm-journal-filter-reset">
                      <RotateCcw size={14} />
                      {t('journal.reset')}
                    </button>
                  )}
                  <button type="button" onClick={() => setShowFilters(false)} className="cm-journal-filter-close" aria-label={t('journal.closeFilters')}>
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              <FilterGroup
                icon={<Globe2 size={15} />}
                label={t('journal.country')}
                options={filterOptions.countries}
                selected={filters.country}
                onSelect={(country) => updateFilters({ country })}
              />
              <FilterGroup
                icon={<Leaf size={15} />}
                label={t('journal.processing')}
                options={filterOptions.processings}
                selected={filters.processing}
                onSelect={(processing) => updateFilters({ processing })}
                formatOption={(processing) => localizeProcessing(processing, language)}
              />
              <FilterGroup
                icon={<Coffee size={15} />}
                label={t('journal.method')}
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
            {filters.processing && <button type="button" onClick={() => updateFilters({ processing: '' })}>{localizeProcessing(filters.processing, language)}<X size={12} /></button>}
            {filters.method && <button type="button" onClick={() => updateFilters({ method: '' })}>{filters.method}<X size={12} /></button>}
          </div>
        )}
      </section>

      {tastings.length === 0 ? (
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="cm-journal-empty mx-4 mt-6">
          <div className="cm-journal-empty-icon"><Coffee size={27} /></div>
          <p className="cm-journal-eyebrow">{t('journal.emptyEyebrow')}</p>
          <h2>{t('journal.emptyTitle')}</h2>
          <p>{t('journal.emptyText')}</p>
          <button onClick={() => navigate('/add')} className="cm-primary-action mt-6"><Sparkles size={18} />{t('journal.addTasting')}</button>
        </motion.section>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="cm-no-results mx-4 mt-7">
          <div className="cm-no-results-icon"><Search size={22} /></div>
          <p>{t('journal.noResults')}</p>
          <span>{t('journal.noResultsText')}</span>
          <button type="button" onClick={resetFilters}><RotateCcw size={14} />{t('journal.resetSearch')}</button>
        </motion.div>
      ) : (
        <div className="px-4 mt-7 space-y-8">
          {hasSearchOrFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cm-journal-results-summary">
              {t('journal.found')} <strong>{filtered.length}</strong>
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
                {t('journal.showMore', { count: Math.min(PAGE_SIZE, remainingCount) })}
              </button>
              <span>{t('journal.remaining', { count: remainingCount })}</span>
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
              <strong>{t('journal.deleted')}</strong>
              <span>{pendingDelete.coffeeName || t('journal.untitled')}</span>
            </div>
            <button type="button" onClick={undoDelete}><Undo2 size={15} />{t('journal.undo')}</button>
            <div className="cm-journal-undo-progress" />
          </motion.div>
        )}
      </AnimatePresence>

      <JournalPreview tasting={preview} onClose={() => setPreview(null)} onOpen={() => { if (preview) navigate(`/tasting/${preview.id}`); setPreview(null); }} />
    </main>
  );
}
