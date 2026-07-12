import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Coffee, Droplets, Wind, Sparkles, NotebookPen, Brain } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTastings } from '@/hooks/useTastings';
import type { Tasting } from '@/hooks/useTastings';
import { ScoreSlider } from '@/components/ScoreSlider';
import { FlavorRadar } from '@/components/FlavorRadar';
import { CURATED_PHOTOS, flavorChipStyle, countryToFlag, getCardPhoto } from '@/lib/coffeeUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardData {
  // Step 1 — Coffee
  coffeeName: string; roaster: string; country: string; region: string;
  farm: string; variety: string; processing: string; roastDate: string;
  producer: string; washingStation: string; elevationMeters: string; harvestYear: string; lotNumber: string;
  // Step 2 — Brewing
  brewMethod: string; doseGrams: string; beverageWeightGrams: string;
  brewTimeSeconds: string; waterTemperatureCelsius: string;
  grinderModel: string; grindSetting: string; waterName: string; waterTdsPpm: string; bloomSeconds: string;
  // Step 3 — Sensory
  dryAroma: string; wetAroma: string; firstImpression: string;
  aromaScore: number; flavorScore: number;
  acidity: number; sweetness: number; bitterness: number;
  body: number; balance: number; cleanCup: number; aftertaste: number;
  overallScore: number;
  // Step 4 — Flavor
  topThreeDescriptors: string[];
  additionalDescriptors: string[];
  // Step 5 — Notes & Photo
  notes: string;
  photoUrl: string;
}

const DEFAULT: WizardData = {
  coffeeName: '', roaster: '', country: '', region: '',
  farm: '', variety: '', processing: 'Washed', roastDate: '',
  producer: '', washingStation: '', elevationMeters: '', harvestYear: '', lotNumber: '',
  brewMethod: 'V60', doseGrams: '', beverageWeightGrams: '',
  brewTimeSeconds: '', waterTemperatureCelsius: '',
  grinderModel: '', grindSetting: '', waterName: '', waterTdsPpm: '', bloomSeconds: '',
  dryAroma: '', wetAroma: '', firstImpression: '',
  aromaScore: 7, flavorScore: 7,
  acidity: 6, sweetness: 7, bitterness: 4, body: 6,
  balance: 7, cleanCup: 7, aftertaste: 7, overallScore: 85,
  topThreeDescriptors: [], additionalDescriptors: [],
  notes: '', photoUrl: '',
};

function tastingToWizardData(tasting: Tasting): WizardData {
  return {
    coffeeName: tasting.coffeeName || '',
    roaster: tasting.roaster || '',
    country: tasting.country || '',
    region: tasting.region || '',
    farm: tasting.farm || '',
    variety: tasting.variety || '',
    processing: tasting.processing || tasting.process || 'Washed',
    roastDate: tasting.roastDate || '',
    producer: tasting.producer || '',
    washingStation: tasting.washingStation || '',
    elevationMeters: tasting.elevationMeters || '',
    harvestYear: tasting.harvestYear || '',
    lotNumber: tasting.lotNumber || '',
    brewMethod: tasting.brewMethod || tasting.brewingMethod || 'V60',
    doseGrams: tasting.doseGrams || tasting.dose || '',
    beverageWeightGrams: tasting.beverageWeightGrams || tasting.yield || '',
    brewTimeSeconds: tasting.brewTimeSeconds || tasting.time || '',
    waterTemperatureCelsius: tasting.waterTemperatureCelsius || tasting.temperature || '',
    grinderModel: tasting.grinderModel || tasting.grinder || '',
    grindSetting: tasting.grindSetting || '',
    waterName: tasting.waterName || '',
    waterTdsPpm: tasting.waterTdsPpm || '',
    bloomSeconds: tasting.bloomSeconds || '',
    dryAroma: tasting.dryAroma || tasting.aroma || '',
    wetAroma: tasting.wetAroma || '',
    firstImpression: tasting.firstImpression || tasting.flavor || '',
    aromaScore: Number(tasting.aromaScore) || 7,
    flavorScore: Number(tasting.flavorScore) || 7,
    acidity: Number(tasting.acidity) || 6,
    sweetness: Number(tasting.sweetness) || 7,
    bitterness: Number(tasting.bitterness) || 4,
    body: Number(tasting.body) || 6,
    balance: Number(tasting.balance) || 7,
    cleanCup: Number(tasting.cleanCup) || 7,
    aftertaste: Number(tasting.aftertaste) || tasting.aftertasteScore || 7,
    overallScore: Number(tasting.overallScore) || 85,
    topThreeDescriptors: tasting.topThreeDescriptors?.length
      ? tasting.topThreeDescriptors
      : (tasting.flavorDescriptors || []).slice(0, 3),
    additionalDescriptors: tasting.additionalDescriptors || [],
    notes: tasting.notes || '',
    photoUrl: tasting.photoUrl || '',
  };
}

const DRAFT_STORAGE_KEY = 'coffeemind:tasting-draft:v1';

interface TastingDraftSnapshot {
  data: WizardData;
  step: number;
  updatedAt: string;
}

function readTastingDraft(storageKey = DRAFT_STORAGE_KEY): TastingDraftSnapshot | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<TastingDraftSnapshot>;
    if (!parsed.data || typeof parsed.step !== 'number') return null;

    return {
      data: { ...DEFAULT, ...parsed.data },
      step: Math.min(6, Math.max(1, parsed.step)),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Failed to restore tasting draft:', error);
    return null;
  }
}

function writeTastingDraft(data: WizardData, step: number, storageKey = DRAFT_STORAGE_KEY) {
  try {
    const snapshot: TastingDraftSnapshot = {
      data,
      step,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Failed to save tasting draft:', error);
  }
}

function clearTastingDraft(storageKey = DRAFT_STORAGE_KEY) {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Failed to clear tasting draft:', error);
  }
}

const STEP_META = [
  { title: 'Кофе', eyebrow: 'Паспорт зерна', hint: 'Сохрани происхождение, обработку и обжарщика.', icon: Coffee },
  { title: 'Рецепт', eyebrow: 'Переменные', hint: 'Запиши рецепт так, чтобы его можно было повторить.', icon: Droplets },
  { title: 'Сенсорика', eyebrow: 'Оценка чашки', hint: 'Сначала ощущения, потом цифры. Так запись получается точнее.', icon: Wind },
  { title: 'Вкус', eyebrow: 'Дескрипторы', hint: 'Выбери три главных вкуса. Это ядро твоей вкусовой памяти.', icon: Sparkles },
  { title: 'Заметки', eyebrow: 'Контекст', hint: 'Добавь мысль, рецепт на будущее или фото карточки.', icon: NotebookPen },
  { title: 'Итог', eyebrow: 'Проверка', hint: 'После сохранения CoffeeMind откроет AI Coach.', icon: Brain },
] as const;
const PROCESS_OPTIONS = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Infused', 'Wet-Hulled', 'Other'];
const BREW_METHODS = ['V60', 'Espresso', 'AeroPress', 'Chemex', 'French Press', 'Kalita Wave', 'Moka Pot', 'Cold Brew', 'Clever Dripper'];

// ─── SCA Flavor Wheel ─────────────────────────────────────────────────────────

const SCA_WHEEL = [
  { id: 'floral',   label: 'Floral',       emoji: '🌸', bg: 'bg-purple-950/60',  border: 'border-purple-800/30',  text: 'text-purple-300',  descriptors: ['Jasmine', 'Rose', 'Chamomile', 'Lavender', 'Orange Blossom', 'Elderflower'] },
  { id: 'fruity',   label: 'Fruity',       emoji: '🍒', bg: 'bg-rose-950/60',    border: 'border-rose-800/30',    text: 'text-rose-300',    descriptors: ['Blueberry', 'Strawberry', 'Cherry', 'Peach', 'Mango', 'Pineapple', 'Orange', 'Lemon', 'Passionfruit', 'Apricot', 'Plum'] },
  { id: 'sweet',    label: 'Sweet',        emoji: '🍯', bg: 'bg-amber-950/60',   border: 'border-amber-800/30',   text: 'text-amber-300',   descriptors: ['Caramel', 'Honey', 'Toffee', 'Brown Sugar', 'Vanilla', 'Maple', 'Molasses'] },
  { id: 'nutty',    label: 'Nutty & Cocoa',emoji: '🥜', bg: 'bg-orange-950/60',  border: 'border-orange-800/30',  text: 'text-orange-300',  descriptors: ['Hazelnut', 'Almond', 'Walnut', 'Dark Chocolate', 'Milk Chocolate', 'Cocoa', 'Peanut Butter'] },
  { id: 'spice',    label: 'Spice',        emoji: '🌶', bg: 'bg-red-950/60',     border: 'border-red-800/30',     text: 'text-red-300',     descriptors: ['Cinnamon', 'Clove', 'Black Pepper', 'Cardamom', 'Star Anise', 'Nutmeg'] },
  { id: 'roasted',  label: 'Roasted',      emoji: '🔥', bg: 'bg-stone-900/60',   border: 'border-stone-700/30',   text: 'text-stone-300',   descriptors: ['Smoky', 'Tobacco', 'Cedar', 'Leather', 'Dark Roast', 'Ash'] },
  { id: 'herbal',   label: 'Herbal & Tea', emoji: '🌿', bg: 'bg-emerald-950/60', border: 'border-emerald-800/30', text: 'text-emerald-300', descriptors: ['Black Tea', 'Green Tea', 'Bergamot', 'Mint', 'Basil', 'Chamomile Tea'] },
  { id: 'citrus',   label: 'Citrus & Sour',emoji: '🍋', bg: 'bg-yellow-950/60',  border: 'border-yellow-800/30',  text: 'text-yellow-300',  descriptors: ['Grapefruit', 'Lime', 'Lemon Zest', 'Tamarind', 'Hibiscus', 'Red Wine'] },
];

// ─── Animation ────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir < 0 ? '60%' : '-60%', opacity: 0 }),
};
const slideTransition = { type: 'spring' as const, stiffness: 380, damping: 38 };

// ─── Primitives ───────────────────────────────────────────────────────────────

const inputCls = 'bg-card/60 border-white/[0.08] focus-visible:ring-primary/40 h-12 rounded-xl text-[14px]';

function StepIntro({ step }: { step: number }) {
  const meta = STEP_META[step - 1];
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="coffee-panel rounded-[24px] p-4 mb-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">{meta.eyebrow}</p>
          <h2 className="font-serif text-[1.55rem] leading-tight text-foreground">{meta.title}</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mt-1.5">{meta.hint}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CoachHint({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-primary/[0.07] border border-primary/20 rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">{title}</p>
      <div className="text-[13px] text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50">{label}</p>
      {children}
    </div>
  );
}

function PillRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all active:scale-95 ${
            value === opt
              ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_14px_rgba(217,163,95,0.2)]'
              : 'bg-card/50 text-muted-foreground border-white/[0.08] hover:border-white/20 hover:text-foreground'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, '');
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); }
    if (e.key === 'Backspace' && !input && tags.length > 0) onChange(tags.slice(0, -1));
  };

  return (
    <div className="flex flex-wrap gap-1.5 p-3 bg-card/60 border border-white/[0.08] rounded-xl min-h-[48px] items-center">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 bg-white/[0.08] text-foreground text-[12px] font-medium px-2.5 py-1 rounded-full">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="opacity-50 hover:opacity-100 ml-0.5">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input.trim() && add(input)}
        placeholder={tags.length === 0 ? placeholder : '+ add more'}
        className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none min-w-[100px]"
      />
    </div>
  );
}

// ─── Step 1 — Coffee ──────────────────────────────────────────────────────────

function Step1({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-5">
      <CoachHint title="Совет CoffeeMind">
        Название кофе обязательно, остальное можно заполнить позже. Но страна, обработка и обжарщик сделают аналитику намного полезнее.
      </CoachHint>

      <Field label="Название кофе *">
        <Input value={d.coffeeName} onChange={(e) => u({ coffeeName: e.target.value })}
          placeholder="e.g. Kochere Natural" autoFocus
          className={`${inputCls} text-[18px] font-serif h-14`}
          data-testid="input-coffee-name" />
      </Field>

      <Field label="Обжарщик">
        <Input value={d.roaster} onChange={(e) => u({ roaster: e.target.value })}
          placeholder="e.g. Onyx Coffee Lab" className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Страна">
          <Input value={d.country} onChange={(e) => u({ country: e.target.value })}
            placeholder="Ethiopia" className={inputCls} />
        </Field>
        <Field label="Регион">
          <Input value={d.region} onChange={(e) => u({ region: e.target.value })}
            placeholder="Yirgacheffe" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ферма">
          <Input value={d.farm} onChange={(e) => u({ farm: e.target.value })}
            placeholder="Kochere Station" className={inputCls} />
        </Field>
        <Field label="Разновидность">
          <Input value={d.variety} onChange={(e) => u({ variety: e.target.value })}
            placeholder="Heirloom" className={inputCls} />
        </Field>
      </div>

      <div className="coffee-panel rounded-[22px] p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Расширенный паспорт зерна</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Производитель">
            <Input value={d.producer} onChange={(e) => u({ producer: e.target.value })}
              placeholder="Smallholders" className={inputCls} />
          </Field>
          <Field label="Станция обработки">
            <Input value={d.washingStation} onChange={(e) => u({ washingStation: e.target.value })}
              placeholder="Kochere" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Высота, м">
            <Input value={d.elevationMeters} onChange={(e) => u({ elevationMeters: e.target.value })}
              placeholder="1950" inputMode="numeric" className={inputCls} />
          </Field>
          <Field label="Урожай">
            <Input value={d.harvestYear} onChange={(e) => u({ harvestYear: e.target.value })}
              placeholder="2025" inputMode="numeric" className={inputCls} />
          </Field>
          <Field label="Лот">
            <Input value={d.lotNumber} onChange={(e) => u({ lotNumber: e.target.value })}
              placeholder="LOT-24" className={inputCls} />
          </Field>
        </div>
      </div>

      <Field label="Обработка">
        <PillRow options={PROCESS_OPTIONS} value={d.processing} onChange={(v) => u({ processing: v })} />
      </Field>

      <Field label="Дата обжарки">
        <Input type="date" value={d.roastDate} onChange={(e) => u({ roastDate: e.target.value })}
          className={`${inputCls} text-[13px]`} />
      </Field>
    </div>
  );
}

// ─── Step 2 — Brewing ─────────────────────────────────────────────────────────

function Step2({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const ratio = d.doseGrams && d.beverageWeightGrams && Number(d.doseGrams) > 0
    ? (Number(d.beverageWeightGrams) / Number(d.doseGrams)).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      <CoachHint title="Рецепт для повторения">
        Записывай рецепт как лабораторную заметку: доза, выход, время и температура помогут понять, почему чашка получилась именно такой.
      </CoachHint>

      <Field label="Метод приготовления *">
        <PillRow options={BREW_METHODS} value={d.brewMethod} onChange={(v) => u({ brewMethod: v })} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Доза (г)">
          <Input value={d.doseGrams} onChange={(e) => u({ doseGrams: e.target.value })}
            placeholder="20" inputMode="decimal" className={inputCls} />
        </Field>
        <Field label="Выход напитка (г)">
          <Input value={d.beverageWeightGrams} onChange={(e) => u({ beverageWeightGrams: e.target.value })}
            placeholder="300" inputMode="decimal" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Время (сек)">
          <Input value={d.brewTimeSeconds} onChange={(e) => u({ brewTimeSeconds: e.target.value })}
            placeholder="200" inputMode="numeric" className={inputCls} />
        </Field>
        <Field label="Температура воды (°C)">
          <Input value={d.waterTemperatureCelsius} onChange={(e) => u({ waterTemperatureCelsius: e.target.value })}
            placeholder="94" inputMode="decimal" className={inputCls} />
        </Field>
      </div>

      <div className="coffee-panel rounded-[22px] p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Оборудование и вода</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Кофемолка">
            <Input value={d.grinderModel} onChange={(e) => u({ grinderModel: e.target.value })}
              placeholder="Comandante C40" className={inputCls} />
          </Field>
          <Field label="Настройка помола">
            <Input value={d.grindSetting} onChange={(e) => u({ grindSetting: e.target.value })}
              placeholder="24 clicks" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Вода">
            <Input value={d.waterName} onChange={(e) => u({ waterName: e.target.value })}
              placeholder="TWW" className={inputCls} />
          </Field>
          <Field label="TDS, ppm">
            <Input value={d.waterTdsPpm} onChange={(e) => u({ waterTdsPpm: e.target.value })}
              placeholder="90" inputMode="numeric" className={inputCls} />
          </Field>
          <Field label="Блуминг, сек">
            <Input value={d.bloomSeconds} onChange={(e) => u({ bloomSeconds: e.target.value })}
              placeholder="45" inputMode="numeric" className={inputCls} />
          </Field>
        </div>
      </div>

      <AnimatePresence>
        {ratio && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="bg-primary/[0.07] border border-primary/20 rounded-2xl px-4 py-3 flex justify-between items-center"
          >
            <span className="text-[12px] text-muted-foreground font-medium">Брю-рейшио</span>
            <span className="font-serif text-primary text-xl">1 : {ratio}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 3 — Sensory ─────────────────────────────────────────────────────────

function Step3({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <CoachHint title="Порядок дегустации">
        Сначала зафиксируй сухой аромат, затем аромат после заваривания, и только потом ставь оценки. Так меньше риска подогнать вкус под цифры.
      </CoachHint>

      <div className="space-y-4">
        <Field label="Сухой аромат">
          <Input value={d.dryAroma} onChange={(e) => u({ dryAroma: e.target.value })}
            placeholder="Jasmine, blueberry, dark chocolate…" className={inputCls} />
        </Field>
        <Field label="Влажный аромат">
          <Input value={d.wetAroma} onChange={(e) => u({ wetAroma: e.target.value })}
            placeholder="Blueberry jam, wine, florals…" className={inputCls} />
        </Field>
        <Field label="Первое впечатление">
          <Input value={d.firstImpression} onChange={(e) => u({ firstImpression: e.target.value })}
            placeholder="Bright and fruity with a juicy mouthfeel…" className={inputCls} />
        </Field>
      </div>

      <div className="coffee-panel rounded-[24px] p-5 space-y-7">
        <ScoreSlider label="Аромат" value={d.aromaScore} onChange={(v) => u({ aromaScore: v })} />
        <ScoreSlider label="Вкус" value={d.flavorScore} onChange={(v) => u({ flavorScore: v })} />
        <ScoreSlider label="Кислотность" value={d.acidity} onChange={(v) => u({ acidity: v })} />
        <ScoreSlider label="Сладость" value={d.sweetness} onChange={(v) => u({ sweetness: v })} />
        <ScoreSlider label="Тело" value={d.body} onChange={(v) => u({ body: v })} />
        <ScoreSlider label="Горечь" value={d.bitterness} onChange={(v) => u({ bitterness: v })} />
        <ScoreSlider label="Баланс" value={d.balance} onChange={(v) => u({ balance: v })} />
        <ScoreSlider label="Чистота чашки" value={d.cleanCup} onChange={(v) => u({ cleanCup: v })} />
        <ScoreSlider label="Послевкусие" value={d.aftertaste} onChange={(v) => u({ aftertaste: v })} />
      </div>

      <div className="coffee-panel rounded-[24px] p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Профиль чашки</p>
            <p className="text-[12px] text-muted-foreground mt-1">Диаграмма обновляется сразу при изменении оценок.</p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-semibold">LIVE</span>
        </div>
        <FlavorRadar
          compact
          size={250}
          metrics={[
            { label: 'Аромат', value: d.aromaScore },
            { label: 'Вкус', value: d.flavorScore },
            { label: 'Кислотность', value: d.acidity },
            { label: 'Сладость', value: d.sweetness },
            { label: 'Тело', value: d.body },
            { label: 'Баланс', value: d.balance },
            { label: 'Чистота', value: d.cleanCup },
            { label: 'Послевкусие', value: d.aftertaste },
          ]}
        />
      </div>

      <div className="bg-primary/[0.07] border border-primary/20 rounded-[24px] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Итоговый балл</p>
            <p className="text-[12px] text-muted-foreground mt-1">Можно выставить вручную или рассчитать из сенсорного профиля.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const values = [d.aromaScore, d.flavorScore, d.acidity, d.sweetness, d.body, d.balance, d.cleanCup, d.aftertaste];
              const average = values.reduce((sum, value) => sum + value, 0) / values.length;
              u({ overallScore: Math.round(50 + average * 5) });
            }}
            className="px-3 py-2 rounded-full border border-primary/25 bg-primary/10 text-primary text-[11px] font-semibold whitespace-nowrap"
          >
            Рассчитать
          </button>
        </div>
        <ScoreSlider label="Общая оценка" value={d.overallScore}
          onChange={(v) => u({ overallScore: v })} min={50} max={100} large />
      </div>
    </div>
  );
}

// ─── Step 4 — Flavor ──────────────────────────────────────────────────────────

function Step4({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const MAX = 3;
  const selected = d.topThreeDescriptors;

  const toggle = (descriptor: string) => {
    if (selected.includes(descriptor)) {
      u({ topThreeDescriptors: selected.filter((x) => x !== descriptor) });
    } else if (selected.length < MAX) {
      u({ topThreeDescriptors: [...selected, descriptor] });
    }
  };

  const category = activeCategory ? SCA_WHEEL.find((c) => c.id === activeCategory) : null;

  return (
    <div className="space-y-5">
      <CoachHint title="Правило трех дескрипторов">
        Выбери не самые красивые слова, а самые главные. Один дескриптор может отвечать за аромат, второй за вкус, третий за послевкусие.
      </CoachHint>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Три главных дескриптора</p>
          <p className="text-muted-foreground text-[12px] mt-0.5">Выбери категорию и отметь до 3 вкусов.</p>
        </div>
        <motion.span
          key={selected.length}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`flex-shrink-0 text-[12px] font-bold px-3 py-1 rounded-full ${selected.length === MAX ? 'bg-primary/20 text-primary' : 'bg-card text-muted-foreground'}`}
        >
          {selected.length} / {MAX}
        </motion.span>
      </div>

      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 p-3 bg-card/40 border border-white/[0.07] rounded-xl overflow-hidden"
          >
            {selected.map((s) => {
              const { bg, text, ring } = flavorChipStyle(s);
              return (
                <button key={s} type="button" onClick={() => toggle(s)}
                  className={`${bg} ${text} ${ring} ring-1 flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full`}>
                  <Check size={10} strokeWidth={3} />
                  {s}
                  <X size={9} strokeWidth={2.5} className="opacity-50 ml-0.5" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {category ? (
          <motion.div key="descriptors"
            initial={{ x: '30%', opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-30%', opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="space-y-4"
          >
            <button type="button" onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={16} />
              <span className="text-[13px] font-medium">Назад к категориям</span>
            </button>

            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${category.bg} ${category.border}`}>
              <span className="text-3xl">{category.emoji}</span>
              <h3 className={`font-serif text-xl font-medium ${category.text}`}>{category.label}</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {category.descriptors.map((descriptor) => {
                const isSelected = selected.includes(descriptor);
                const isDisabled = !isSelected && selected.length >= MAX;
                return (
                  <motion.button key={descriptor} type="button" onClick={() => toggle(descriptor)}
                    disabled={isDisabled}
                    whileTap={!isDisabled ? { scale: 0.91 } : undefined}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium ring-1 transition-all ${
                      isSelected
                        ? `${category.bg} ${category.text} ${category.border} shadow-md`
                        : isDisabled
                        ? 'bg-card/20 text-muted-foreground/25 ring-white/5 cursor-not-allowed'
                        : 'bg-card/50 text-muted-foreground ring-white/[0.08] hover:ring-white/25 hover:text-foreground'
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                    {descriptor}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="categories"
            initial={{ x: '-30%', opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: '30%', opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="grid grid-cols-2 gap-3"
          >
            {SCA_WHEEL.map((cat) => (
              <motion.button key={cat.id} type="button" onClick={() => setActiveCategory(cat.id)}
                whileTap={{ scale: 0.95 }}
                className={`${cat.bg} border ${cat.border} rounded-[22px] p-4 flex flex-col items-start gap-2 text-left hover:brightness-110 transition-all`}>
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-[13px] font-semibold ${cat.text} leading-tight`}>{cat.label}</span>
                <span className="text-[9px] text-white/25 font-medium">{cat.descriptors.length} flavors</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-white/[0.05] pt-5">
        <Field label="Дополнительные дескрипторы">
          <TagInput
            tags={d.additionalDescriptors}
            onChange={(v) => u({ additionalDescriptors: v })}
            placeholder="Введи вкус и нажми Enter…"
          />
          <p className="text-[10px] text-muted-foreground/40 mt-1.5">Нажимай Enter или запятую после каждого дескриптора.</p>
        </Field>
      </div>
    </div>
  );
}

// ─── Step 5 — Notes & Photo ───────────────────────────────────────────────────

function Step5({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <CoachHint title="Что писать в заметках">
        Контекст часто важнее длинного описания: что удивило, что хочется проверить в рецепте, как чашка менялась после остывания.
      </CoachHint>

      <Field label="Заметки дегустации">
        <Textarea
          value={d.notes}
          onChange={(e) => u({ notes: e.target.value })}
          placeholder="Опиши контекст, что удивило, что хочется изменить в рецепте в следующий раз…"
          className="bg-card/60 border-white/[0.08] focus-visible:ring-primary/40 min-h-[120px] resize-none rounded-xl text-[16px]"
        />
      </Field>

      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-3">Фото карточки</p>
        <div className="grid grid-cols-3 gap-2">
          {CURATED_PHOTOS.map((photoId) => {
            const url = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=240&q=70`;
            const isSelected = d.photoUrl === url;
            return (
              <motion.button key={photoId} type="button" onClick={() => u({ photoUrl: isSelected ? '' : url })}
                whileTap={{ scale: 0.94 }}
                className={`relative aspect-square rounded-xl overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'ring-1 ring-white/[0.08] hover:ring-white/25'
                }`}
              >
                <img src={url} alt="Coffee" className="w-full h-full object-cover" loading="lazy" />
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                      <div className="bg-primary rounded-full p-1.5">
                        <Check size={13} className="text-primary-foreground" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
        {d.photoUrl && (
          <button type="button" onClick={() => u({ photoUrl: '' })}
            className="mt-2 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            Убрать фото
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 6 — Summary ─────────────────────────────────────────────────────────

function Step6({ d, onSave, isSaving, saveError, saveLabel = 'Сохранить дегустацию' }: { d: WizardData; onSave: () => void; isSaving: boolean; saveError: string; saveLabel?: string }) {
  const flag = countryToFlag(d.country);
  const photo = d.photoUrl || getCardPhoto('preview');
  const scoreColor = d.overallScore >= 90 ? 'text-emerald-300' : d.overallScore >= 80 ? 'text-amber-300' : 'text-foreground/70';
  const ratio = d.doseGrams && d.beverageWeightGrams && Number(d.doseGrams) > 0
    ? `1:${(Number(d.beverageWeightGrams) / Number(d.doseGrams)).toFixed(1)}`
    : null;
  const allDescriptors = [...d.topThreeDescriptors, ...d.additionalDescriptors];

  return (
    <div className="space-y-5 pb-4">
      <CoachHint title="Следующий шаг">
        Проверь запись. После сохранения CoffeeMind откроет AI Coach и задаст вопросы, которые помогут точнее описать эту чашку.
      </CoachHint>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] overflow-hidden bg-card border border-white/[0.06] shadow-[0_8px_44px_rgba(0,0,0,0.42)]"
      >
        {/* Photo */}
        <div className="relative h-56 overflow-hidden bg-muted">
          <img src={photo} alt={d.coffeeName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/45 via-45% to-black/10" />
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/50 to-transparent" />
          {flag && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
              <span className="text-base leading-none">{flag}</span>
              {d.country && <span className="text-[10px] font-medium text-white/80">{d.country}</span>}
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10">
            <span className={`text-xl font-serif font-semibold leading-none ${scoreColor}`}>{d.overallScore}</span>
                <span className="text-[7px] uppercase tracking-widest text-white/35 mt-0.5">pts</span>
          </div>
          <div className="absolute left-4 right-4 bottom-4">
            <h3 className="font-serif text-[1.65rem] font-medium text-foreground">{d.coffeeName || 'Без названия'}</h3>
            {d.roaster && <p className="text-[12px] text-white/60 mt-0.5">{d.roaster}</p>}
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {d.processing && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20">
                  {d.processing}
                </span>
              )}
              {d.brewMethod && (
                <span className="inline-flex items-center gap-1 bg-white/5 text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                  {d.brewMethod}
                </span>
              )}
              {ratio && (
                <span className="inline-flex items-center gap-1 bg-white/5 text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                  {ratio} ratio
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            {([
              { label: 'Аромат', v: d.aromaScore }, { label: 'Вкус', v: d.flavorScore },
              { label: 'Кислотность', v: d.acidity }, { label: 'Сладость', v: d.sweetness },
              { label: 'Тело', v: d.body }, { label: 'Горечь', v: d.bitterness },
              { label: 'Баланс', v: d.balance }, { label: 'Послевкусие', v: d.aftertaste },
            ] as { label: string; v: number }[]).map(({ label, v }) => (
              <div key={label}>
                <div className="flex justify-between text-[9px] mb-1">
                  <span className="text-muted-foreground/55 uppercase tracking-wide font-medium">{label}</span>
                  <span className="text-primary font-serif">{v}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full" style={{ width: `${v * 10}%` }} />
                </div>
              </div>
            ))}
          </div>

          {allDescriptors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {d.topThreeDescriptors.map((desc) => {
                const { bg, text, ring } = flavorChipStyle(desc);
                return <span key={desc} className={`${bg} ${text} ${ring} text-[11px] font-medium px-2.5 py-1 rounded-full ring-1`}>{desc}</span>;
              })}
              {d.additionalDescriptors.map((desc) => (
                <span key={desc} className="bg-white/5 text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-full ring-1 ring-white/10">{desc}</span>
              ))}
            </div>
          )}

          {d.notes && (
            <p className="text-[12px] text-muted-foreground/70 italic border-l-2 border-primary/30 pl-3 leading-relaxed">{d.notes}</p>
          )}
        </div>
      </motion.div>

      <motion.button type="button" onClick={onSave} disabled={isSaving} whileTap={{ scale: 0.97 }}
        className="w-full bg-primary text-primary-foreground h-14 rounded-full font-semibold text-[15px] shadow-[0_4px_28px_rgba(217,163,95,0.3)]"
        data-testid="btn-save-tasting"
      >
        {isSaving ? 'Сохраняем…' : saveLabel}
      </motion.button>

      {saveError && (
        <p role="alert" className="text-center text-[12px] text-red-400 px-3">{saveError}</p>
      )}

      <p className="text-center text-[10px] text-muted-foreground/25 pb-2">Сохраняется локально на этом устройстве</p>
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

export default function AddTasting() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const [, setLocation] = useLocation();
  const { addTasting, updateTasting, getTasting } = useTastings();
  const existingTasting = id ? getTasting(id) : undefined;
  const draftStorageKey = id ? `${DRAFT_STORAGE_KEY}:edit:${id}` : DRAFT_STORAGE_KEY;
  const initialDraft = useRef<TastingDraftSnapshot | null>(readTastingDraft(draftStorageKey));
  const [step, setStep] = useState(initialDraft.current?.step ?? 1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<WizardData>(
    initialDraft.current?.data ?? (existingTasting ? tastingToWizardData(existingTasting) : DEFAULT),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const keyboardScrollTimerRef = useRef<number | null>(null);
  const viewportFrameRef = useRef<number | null>(null);
  const stableViewportHeightRef = useRef<number>(window.innerHeight);
  const keyboardOpenRef = useRef(false);
  const lastKeyboardInsetRef = useRef(0);
  const dataRef = useRef(data);
  const stepRef = useRef(step);

  const update = useCallback((patch: Partial<WizardData>) => setData((prev) => ({ ...prev, ...patch })), []);

  useEffect(() => {
    dataRef.current = data;
    stepRef.current = step;
    const timeoutId = window.setTimeout(() => writeTastingDraft(data, step, draftStorageKey), 250);
    return () => window.clearTimeout(timeoutId);
  }, [data, step]);

  useEffect(() => {
    const persistImmediately = () => writeTastingDraft(dataRef.current, stepRef.current, draftStorageKey);
    const isTextEntryElement = (element: Element | null) =>
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement ||
      (element instanceof HTMLElement && element.isContentEditable);

    const applyKeyboardState = (nextOpen: boolean) => {
      if (keyboardOpenRef.current === nextOpen) return;
      keyboardOpenRef.current = nextOpen;
      setIsKeyboardOpen(nextOpen);
    };

    const updateViewportMetrics = () => {
      if (viewportFrameRef.current !== null) cancelAnimationFrame(viewportFrameRef.current);

      viewportFrameRef.current = requestAnimationFrame(() => {
        const visualViewport = window.visualViewport;
        const visibleHeight = visualViewport?.height ?? window.innerHeight;
        const visibleTop = visualViewport?.offsetTop ?? 0;
        const heightDifference = stableViewportHeightRef.current - visibleHeight;
        const viewportReduced = heightDifference > 160;

        if (!viewportReduced) {
          const nextStableHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);
          if (Math.abs(nextStableHeight - stableViewportHeightRef.current) > 2) {
            stableViewportHeightRef.current = nextStableHeight;
            document.documentElement.style.setProperty('--app-height', `${Math.round(nextStableHeight)}px`);
          }
        }

        const rawInset = viewportReduced
          ? Math.max(0, stableViewportHeightRef.current - visibleHeight - visibleTop)
          : 0;
        const nextInset = rawInset < 24 ? 0 : Math.round(rawInset);

        // Mobile keyboards report several tiny intermediate viewport sizes while
        // animating. Ignore those micro changes so the form does not shake.
        if (Math.abs(nextInset - lastKeyboardInsetRef.current) > 10 || nextInset === 0) {
          lastKeyboardInsetRef.current = nextInset;
          document.documentElement.style.setProperty('--keyboard-inset', `${nextInset}px`);
        }

        applyKeyboardState(isTextEntryElement(document.activeElement) || viewportReduced);
        viewportFrameRef.current = null;
      });
    };

    const bringFocusedFieldAboveKeyboard = (target: Element | null) => {
      if (!(target instanceof HTMLElement)) return;
      if (keyboardScrollTimerRef.current !== null) window.clearTimeout(keyboardScrollTimerRef.current);

      // Wait until the native keyboard finishes its opening animation. We scroll
      // once per focus change, never on every viewport event or keystroke.
      keyboardScrollTimerRef.current = window.setTimeout(() => {
        const scroller = contentScrollRef.current;
        if (!scroller || document.activeElement !== target) return;

        const targetRect = target.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const visualBottom = window.visualViewport
          ? window.visualViewport.offsetTop + window.visualViewport.height
          : window.innerHeight;
        const desiredBottom = Math.min(scrollerRect.bottom, visualBottom) - 20;
        const desiredTop = Math.max(scrollerRect.top, window.visualViewport?.offsetTop ?? 0) + 18;

        let delta = 0;
        if (targetRect.bottom > desiredBottom) delta = targetRect.bottom - desiredBottom;
        else if (targetRect.top < desiredTop) delta = targetRect.top - desiredTop;

        if (Math.abs(delta) > 18) {
          scroller.scrollBy({ top: delta, behavior: 'smooth' });
        }
      }, 360);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (!isTextEntryElement(target)) return;
      applyKeyboardState(true);
      updateViewportMetrics();
      bringFocusedFieldAboveKeyboard(target);
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        const viewportReduced = window.visualViewport
          ? stableViewportHeightRef.current - window.visualViewport.height > 160
          : false;
        applyKeyboardState(isTextEntryElement(document.activeElement) || viewportReduced);
        updateViewportMetrics();
      }, 140);
    };

    const restoreViewport = () => {
      updateViewportMetrics();
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistImmediately();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        return;
      }

      requestAnimationFrame(restoreViewport);
      window.setTimeout(restoreViewport, 220);
    };

    document.documentElement.style.setProperty('--app-height', `${Math.round(stableViewportHeightRef.current)}px`);
    updateViewportMetrics();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('pagehide', persistImmediately);
    window.addEventListener('pageshow', restoreViewport);
    window.addEventListener('resize', updateViewportMetrics);
    window.addEventListener('orientationchange', restoreViewport);
    window.visualViewport?.addEventListener('resize', updateViewportMetrics);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('pagehide', persistImmediately);
      window.removeEventListener('pageshow', restoreViewport);
      window.removeEventListener('resize', updateViewportMetrics);
      window.removeEventListener('orientationchange', restoreViewport);
      window.visualViewport?.removeEventListener('resize', updateViewportMetrics);
      if (keyboardScrollTimerRef.current !== null) window.clearTimeout(keyboardScrollTimerRef.current);
      if (viewportFrameRef.current !== null) cancelAnimationFrame(viewportFrameRef.current);
      document.documentElement.style.removeProperty('--app-height');
      document.documentElement.style.removeProperty('--keyboard-inset');
    };
  }, []);

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 6)); };
  const goBack = () => {
    if (step === 1) { setLocation(isEditing && id ? `/tasting/${id}` : '/'); return; }
    setDirection(-1); setStep((s) => s - 1);
  };

  const canGoNext = step === 1 ? data.coffeeName.trim().length > 0 : true;

  const handleSave = () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const payload = {
        coffeeName: data.coffeeName,
        roaster: data.roaster,
        country: data.country,
        region: data.region,
        farm: data.farm,
        variety: data.variety,
        processing: data.processing,
        roastDate: data.roastDate,
        producer: data.producer,
        washingStation: data.washingStation,
        elevationMeters: data.elevationMeters,
        harvestYear: data.harvestYear,
        lotNumber: data.lotNumber,
        brewMethod: data.brewMethod,
        doseGrams: data.doseGrams,
        beverageWeightGrams: data.beverageWeightGrams,
        brewTimeSeconds: data.brewTimeSeconds,
        waterTemperatureCelsius: data.waterTemperatureCelsius,
        grinderModel: data.grinderModel,
        grindSetting: data.grindSetting,
        waterName: data.waterName,
        waterTdsPpm: data.waterTdsPpm,
        bloomSeconds: data.bloomSeconds,
        dryAroma: data.dryAroma,
        wetAroma: data.wetAroma,
        firstImpression: data.firstImpression,
        aromaScore: data.aromaScore,
        flavorScore: data.flavorScore,
        acidity: data.acidity,
        sweetness: data.sweetness,
        bitterness: data.bitterness,
        body: data.body,
        balance: data.balance,
        cleanCup: data.cleanCup,
        aftertaste: data.aftertaste,
        overallScore: data.overallScore,
        topThreeDescriptors: data.topThreeDescriptors,
        additionalDescriptors: data.additionalDescriptors,
        notes: data.notes,
        photoUrl: data.photoUrl,
        photos: existingTasting?.photos || [],
        favorite: existingTasting?.favorite || false,
      };

      clearTastingDraft(draftStorageKey);

      if (isEditing && id) {
        updateTasting(id, payload);
        setLocation(`/tasting/${id}`);
      } else {
        const saved = addTasting(payload);
        setLocation(`/coach/${saved.id}`);
      }
    } catch (error) {
      console.error('Failed to save tasting:', error);
      setSaveError('Не удалось сохранить дегустацию. Обнови страницу и попробуй ещё раз.');
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 d={data} u={update} />;
      case 2: return <Step2 d={data} u={update} />;
      case 3: return <Step3 d={data} u={update} />;
      case 4: return <Step4 d={data} u={update} />;
      case 5: return <Step5 d={data} u={update} />;
      case 6: return <Step6 d={data} onSave={handleSave} isSaving={isSaving} saveError={saveError} saveLabel={isEditing ? 'Сохранить изменения' : 'Сохранить дегустацию'} />;
      default: return null;
    }
  };

  return (
    <div className={`flex flex-col bg-background overflow-hidden iphone-wizard ${isKeyboardOpen ? 'iphone-wizard--keyboard' : ''}`} style={{ height: 'var(--app-height, 100dvh)' }}>
      {/* Header */}
      <header className="px-4 iphone-safe-top pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
        <motion.button onClick={goBack} whileTap={{ scale: 0.88 }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-card/60 border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
          data-testid="btn-wizard-back">
          {step === 1 ? <X size={17} /> : <ChevronLeft size={20} />}
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.h1 key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="text-[10px] uppercase tracking-widest font-bold text-primary">
            {isEditing ? 'Редактирование' : 'Новая дегустация'}
          </motion.h1>
        </AnimatePresence>

        <div className="bg-card/60 border border-white/[0.08] rounded-full px-3 py-1">
          <span className="text-[12px] font-bold text-muted-foreground tabular-nums">
            {step}<span className="text-muted-foreground/35"> / 6</span>
          </span>
        </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div key={i}
              animate={{ width: i + 1 === step ? 20 : 6, backgroundColor: i + 1 <= step ? 'hsl(33 62% 61%)' : 'rgba(255,255,255,0.07)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
        <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
            animate={{ width: `${(step / 6) * 100}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div key={step} custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={slideTransition}
            ref={contentScrollRef}
            className={`absolute inset-0 overflow-y-auto overscroll-contain ${isKeyboardOpen ? 'keyboard-scroll-active' : ''}`}>
            <div
              className={`px-4 pt-4 ${isKeyboardOpen ? '' : 'pb-12'}`}
              style={isKeyboardOpen ? { paddingBottom: 'calc(var(--keyboard-inset, 0px) + 24px)' } : undefined}
            >
              <StepIntro step={step} />
              {renderStep()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer — hidden while the mobile keyboard is open */}
      <AnimatePresence initial={false}>
        {step < 6 && !isKeyboardOpen && (
          <motion.div
            key="wizard-footer"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="px-4 py-4 iphone-footer-safe border-t border-white/[0.05] bg-background/88 backdrop-blur-sm flex-shrink-0"
          >
            <motion.button type="button" onClick={goNext} disabled={!canGoNext}
              whileTap={canGoNext ? { scale: 0.97 } : undefined}
              className={`w-full h-12 rounded-full font-semibold text-[15px] flex items-center justify-center gap-1.5 transition-all ${
                canGoNext
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(217,163,95,0.2)] hover:brightness-110'
                  : 'bg-card/50 text-muted-foreground/35 cursor-not-allowed'
              }`}
              data-testid="btn-wizard-next">
              {step === 5 ? 'Проверить' : 'Продолжить'}
              {canGoNext && <ChevronRight size={17} />}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
