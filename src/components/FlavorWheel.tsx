import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, Search, Star, X } from 'lucide-react';

export interface FlavorWheelProps {
  selected: string[];
  onChange: (next: string[]) => void;
  maxSelected?: number;
}

type FlavorGroup = {
  id: string;
  label: string;
  emoji: string;
  classes: {
    panel: string;
    border: string;
    text: string;
    active: string;
  };
  families: Array<{
    label: string;
    descriptors: string[];
  }>;
};

const FLAVOR_GROUPS: FlavorGroup[] = [
  {
    id: 'floral', label: 'Цветочные', emoji: '🌸',
    classes: { panel: 'bg-fuchsia-950/45', border: 'border-fuchsia-700/25', text: 'text-fuchsia-200', active: 'bg-fuchsia-500/20 text-fuchsia-100 ring-fuchsia-400/45' },
    families: [
      { label: 'Белые цветы', descriptors: ['Жасмин', 'Цветок апельсина', 'Жимолость', 'Бузина'] },
      { label: 'Садовые цветы', descriptors: ['Роза', 'Лаванда', 'Ромашка', 'Фиалка'] },
      { label: 'Чайные', descriptors: ['Бергамот', 'Чёрный чай', 'Зелёный чай', 'Улун'] },
    ],
  },
  {
    id: 'berry', label: 'Ягоды', emoji: '🫐',
    classes: { panel: 'bg-violet-950/45', border: 'border-violet-700/25', text: 'text-violet-200', active: 'bg-violet-500/20 text-violet-100 ring-violet-400/45' },
    families: [
      { label: 'Красные ягоды', descriptors: ['Клубника', 'Малина', 'Красная смородина', 'Клюква'] },
      { label: 'Тёмные ягоды', descriptors: ['Черника', 'Ежевика', 'Чёрная смородина', 'Виноград'] },
      { label: 'Косточковые', descriptors: ['Вишня', 'Черешня', 'Слива', 'Абрикос'] },
    ],
  },
  {
    id: 'fruit', label: 'Фрукты', emoji: '🍑',
    classes: { panel: 'bg-rose-950/45', border: 'border-rose-700/25', text: 'text-rose-200', active: 'bg-rose-500/20 text-rose-100 ring-rose-400/45' },
    families: [
      { label: 'Тропические', descriptors: ['Манго', 'Ананас', 'Маракуйя', 'Папайя', 'Личи'] },
      { label: 'Косточковые', descriptors: ['Персик', 'Нектарин', 'Абрикос', 'Слива'] },
      { label: 'Садовые', descriptors: ['Яблоко', 'Груша', 'Айва', 'Виноград'] },
      { label: 'Сухофрукты', descriptors: ['Изюм', 'Финик', 'Инжир', 'Чернослив'] },
    ],
  },
  {
    id: 'citrus', label: 'Цитрусы', emoji: '🍋',
    classes: { panel: 'bg-yellow-950/40', border: 'border-yellow-700/25', text: 'text-yellow-200', active: 'bg-yellow-500/20 text-yellow-100 ring-yellow-400/45' },
    families: [
      { label: 'Сладкие цитрусы', descriptors: ['Апельсин', 'Мандарин', 'Клементин', 'Помело'] },
      { label: 'Яркие цитрусы', descriptors: ['Лимон', 'Лайм', 'Грейпфрут', 'Юдзу'] },
      { label: 'Кислые и винные', descriptors: ['Гибискус', 'Тамаринд', 'Красное вино', 'Яблочная кислота'] },
    ],
  },
  {
    id: 'sweet', label: 'Сладкие', emoji: '🍯',
    classes: { panel: 'bg-amber-950/45', border: 'border-amber-700/25', text: 'text-amber-200', active: 'bg-amber-500/20 text-amber-100 ring-amber-400/45' },
    families: [
      { label: 'Сахара', descriptors: ['Мёд', 'Тростниковый сахар', 'Коричневый сахар', 'Патока', 'Кленовый сироп'] },
      { label: 'Кондитерские', descriptors: ['Карамель', 'Ириска', 'Ваниль', 'Зефир', 'Печенье'] },
      { label: 'Ферментированные', descriptors: ['Ром', 'Коньяк', 'Красное вино', 'Сидр'] },
    ],
  },
  {
    id: 'cocoa', label: 'Орехи и какао', emoji: '🍫',
    classes: { panel: 'bg-orange-950/40', border: 'border-orange-700/25', text: 'text-orange-200', active: 'bg-orange-500/20 text-orange-100 ring-orange-400/45' },
    families: [
      { label: 'Орехи', descriptors: ['Фундук', 'Миндаль', 'Грецкий орех', 'Арахис', 'Макадамия'] },
      { label: 'Какао', descriptors: ['Какао', 'Молочный шоколад', 'Тёмный шоколад', 'Какао-нибсы'] },
      { label: 'Выпечка', descriptors: ['Печенье', 'Бриошь', 'Тост', 'Солод'] },
    ],
  },
  {
    id: 'spice', label: 'Специи', emoji: '🌶️',
    classes: { panel: 'bg-red-950/40', border: 'border-red-700/25', text: 'text-red-200', active: 'bg-red-500/20 text-red-100 ring-red-400/45' },
    families: [
      { label: 'Тёплые специи', descriptors: ['Корица', 'Гвоздика', 'Кардамон', 'Мускатный орех', 'Бадьян'] },
      { label: 'Пряные', descriptors: ['Чёрный перец', 'Имбирь', 'Анис', 'Шафран'] },
    ],
  },
  {
    id: 'green', label: 'Зелёные и травяные', emoji: '🌿',
    classes: { panel: 'bg-emerald-950/40', border: 'border-emerald-700/25', text: 'text-emerald-200', active: 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/45' },
    families: [
      { label: 'Свежие', descriptors: ['Мята', 'Базилик', 'Лемонграсс', 'Эвкалипт'] },
      { label: 'Растительные', descriptors: ['Томат', 'Горох', 'Свежая трава', 'Оливка'] },
      { label: 'Древесные', descriptors: ['Кедр', 'Сандал', 'Табак', 'Кожа'] },
    ],
  },
];

const FAVORITES_KEY = 'coffeemind:flavor-favorites:v1';
const FREQUENCY_KEY = 'coffeemind:flavor-frequency:v1';

function readStringArray(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function readFrequency(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(FREQUENCY_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('ru-RU');

export function FlavorWheel({ selected, onChange, maxSelected = 3 }: FlavorWheelProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => readStringArray(FAVORITES_KEY));
  const [frequency, setFrequency] = useState<Record<string, number>>(() => readFrequency());

  const activeGroup = FLAVOR_GROUPS.find((group) => group.id === activeGroupId) ?? null;
  const allDescriptors = useMemo(() => {
    const values = FLAVOR_GROUPS.flatMap((group) => group.families.flatMap((family) => family.descriptors));
    return Array.from(new Set(values));
  }, []);

  const searchResults = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    return allDescriptors.filter((descriptor) => normalize(descriptor).includes(needle)).slice(0, 24);
  }, [allDescriptors, query]);

  const suggested = useMemo(() => {
    const candidates = Array.from(new Set([...favorites, ...Object.keys(frequency)]));
    return candidates
      .sort((a, b) => {
        const favoriteDelta = Number(favorites.includes(b)) - Number(favorites.includes(a));
        return favoriteDelta || (frequency[b] || 0) - (frequency[a] || 0);
      })
      .slice(0, 8);
  }, [favorites, frequency]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggle = (descriptor: string) => {
    if (selected.includes(descriptor)) {
      onChange(selected.filter((item) => item !== descriptor));
      return;
    }
    if (selected.length >= maxSelected) return;

    const next = [...selected, descriptor];
    onChange(next);
    const nextFrequency = { ...frequency, [descriptor]: (frequency[descriptor] || 0) + 1 };
    setFrequency(nextFrequency);
    localStorage.setItem(FREQUENCY_KEY, JSON.stringify(nextFrequency));
  };

  const toggleFavorite = (descriptor: string) => {
    setFavorites((current) => current.includes(descriptor)
      ? current.filter((item) => item !== descriptor)
      : [...current, descriptor]);
  };

  const descriptorButton = (descriptor: string, tone?: FlavorGroup['classes']) => {
    const isSelected = selected.includes(descriptor);
    const isDisabled = !isSelected && selected.length >= maxSelected;
    const isFavorite = favorites.includes(descriptor);

    return (
      <div key={descriptor} className="relative">
        <motion.button
          type="button"
          onClick={() => toggle(descriptor)}
          disabled={isDisabled}
          whileTap={!isDisabled ? { scale: 0.94 } : undefined}
          className={`min-h-11 w-full flex items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left ring-1 transition-all ${
            isSelected
              ? (tone?.active || 'bg-primary/20 text-primary ring-primary/45')
              : isDisabled
              ? 'bg-card/25 text-muted-foreground/25 ring-white/5 cursor-not-allowed'
              : 'bg-card/55 text-foreground/80 ring-white/[0.08] hover:ring-white/20'
          }`}
        >
          <span className="flex items-center gap-2 text-[13px] font-medium">
            {isSelected && <Check size={13} strokeWidth={3} />}
            {descriptor}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => { event.stopPropagation(); toggleFavorite(descriptor); }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(descriptor);
              }
            }}
            className={`p-1 -mr-1 rounded-full ${isFavorite ? 'text-amber-300' : 'text-muted-foreground/30'}`}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} />
          </span>
        </motion.button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/45" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти вкус: бергамот, клубника…"
          className="w-full h-12 rounded-2xl bg-card/60 border border-white/[0.08] pl-10 pr-10 text-[14px] outline-none focus:border-primary/35 focus:ring-2 focus:ring-primary/15"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/45">
            <X size={15} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {query ? (
          <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">Результаты поиска</p>
            {searchResults.length ? (
              <div className="grid grid-cols-2 gap-2">{searchResults.map((descriptor) => descriptorButton(descriptor))}</div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-card/35 px-4 py-5 text-center text-[12px] text-muted-foreground">Ничего не найдено. Добавь свой дескриптор ниже.</div>
            )}
          </motion.div>
        ) : activeGroup ? (
          <motion.div key={activeGroup.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-4">
            <button type="button" onClick={() => setActiveGroupId(null)} className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
              <ChevronLeft size={16} /> Все категории
            </button>
            <div className={`rounded-[24px] border p-4 ${activeGroup.classes.panel} ${activeGroup.classes.border}`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeGroup.emoji}</span>
                <div>
                  <p className={`font-serif text-xl ${activeGroup.classes.text}`}>{activeGroup.label}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">Выбери до {maxSelected} главных нот</p>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {activeGroup.families.map((family) => (
                <section key={family.label}>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-semibold mb-2">{family.label}</p>
                  <div className="grid grid-cols-2 gap-2">{family.descriptors.map((descriptor) => descriptorButton(descriptor, activeGroup.classes))}</div>
                </section>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="groups" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} className="space-y-5">
            {suggested.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={12} className="text-amber-300" fill="currentColor" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">Избранное и частые</p>
                </div>
                <div className="grid grid-cols-2 gap-2">{suggested.map((descriptor) => descriptorButton(descriptor))}</div>
              </section>
            )}
            <section>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-2">Вкусовые группы</p>
              <div className="grid grid-cols-2 gap-3">
                {FLAVOR_GROUPS.map((group) => {
                  const count = group.families.reduce((sum, family) => sum + family.descriptors.length, 0);
                  const selectedInGroup = group.families.flatMap((family) => family.descriptors).filter((descriptor) => selected.includes(descriptor)).length;
                  return (
                    <motion.button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveGroupId(group.id)}
                      whileTap={{ scale: 0.96 }}
                      className={`relative min-h-[116px] rounded-[24px] border p-4 text-left overflow-hidden ${group.classes.panel} ${group.classes.border}`}
                    >
                      <span className="text-2xl">{group.emoji}</span>
                      <p className={`mt-2 text-[13px] leading-tight font-semibold ${group.classes.text}`}>{group.label}</p>
                      <p className="mt-1 text-[9px] text-white/30">{count} дескрипторов</p>
                      {selectedInGroup > 0 && (
                        <span className="absolute top-3 right-3 min-w-6 h-6 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">{selectedInGroup}</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
