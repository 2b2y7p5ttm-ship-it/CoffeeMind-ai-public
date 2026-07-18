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
import { FlavorWheel } from '@/components/FlavorWheel';
import { CURATED_PHOTOS, flavorChipStyle, countryToFlag, getCardPhoto } from '@/lib/coffeeUtils';
import { localizeFlavor, useTastingCopy } from '@/lib/tastingI18n';
import { localizeProcessing } from '@/lib/processingI18n';
import { BREW_METHOD_VALUES, canonicalizeBrewMethod, localizeBrewMethod } from '@/lib/brewMethodI18n';
import { COUNTRY_VALUES, VARIETY_VALUES, canonicalizeCountry, canonicalizeVariety, localizeCountry, localizeVariety } from '@/lib/coffeeReferenceI18n';
import { useDnaImpactHistory } from '@/hooks/useDnaImpactHistory';
import { buildDnaImpactSnapshot } from '@/lib/intelligence/dnaImpact';

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
    country: canonicalizeCountry(tasting.country || ''),
    region: tasting.region || '',
    farm: tasting.farm || '',
    variety: canonicalizeVariety(tasting.variety || ''),
    processing: tasting.processing || tasting.process || 'Washed',
    roastDate: tasting.roastDate || '',
    producer: tasting.producer || '',
    washingStation: tasting.washingStation || '',
    elevationMeters: tasting.elevationMeters || '',
    harvestYear: tasting.harvestYear || '',
    lotNumber: tasting.lotNumber || '',
    brewMethod: canonicalizeBrewMethod(tasting.brewMethod || tasting.brewingMethod || 'V60'),
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

const STEP_ICONS = [Coffee, Droplets, Wind, Sparkles, NotebookPen, Brain] as const;
const PROCESS_OPTIONS = ['Washed', 'Natural', 'Honey', 'Anaerobic', 'Infused', 'Wet-Hulled', 'Other'];
const BREW_METHODS = [...BREW_METHOD_VALUES];

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
  const { copy } = useTastingCopy();
  const meta = copy.wizard.steps[step - 1];
  const Icon = STEP_ICONS[step - 1];
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

function PillRow({ options, value, onChange, getLabel = (option) => option }: { options: string[]; value: string; onChange: (v: string) => void; getLabel?: (option: string) => string }) {
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
          {getLabel(opt)}
        </button>
      ))}
    </div>
  );
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const { copy } = useTastingCopy();
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
        placeholder={tags.length === 0 ? placeholder : copy.wizard.addMore}
        className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none min-w-[100px]"
      />
    </div>
  );
}

// ─── Step 1 — Coffee ──────────────────────────────────────────────────────────

function Step1({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const { copy, language } = useTastingCopy();
  return (
    <div className="space-y-5">
      <CoachHint title={copy.wizard.coffeeTipTitle}>
        {copy.wizard.coffeeTip}
      </CoachHint>

      <Field label={copy.wizard.coffeeName}>
        <Input value={d.coffeeName} onChange={(e) => u({ coffeeName: e.target.value })}
          placeholder={copy.wizard.placeholders.coffeeName} autoFocus
          className={`${inputCls} text-[18px] font-serif h-14`}
          data-testid="input-coffee-name" />
      </Field>

      <Field label={copy.wizard.roaster}>
        <Input value={d.roaster} onChange={(e) => u({ roaster: e.target.value })}
          placeholder={copy.wizard.placeholders.roaster} className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={copy.wizard.country}>
          <Input value={localizeCountry(d.country, language)} onChange={(e) => u({ country: canonicalizeCountry(e.target.value) })}
            placeholder={copy.wizard.placeholders.country} className={inputCls} list="coffeemind-country-options" />
          <datalist id="coffeemind-country-options">
            {COUNTRY_VALUES.map((country) => <option key={country} value={localizeCountry(country, language)} />)}
          </datalist>
        </Field>
        <Field label={copy.wizard.region}>
          <Input value={d.region} onChange={(e) => u({ region: e.target.value })}
            placeholder={copy.wizard.placeholders.region} className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={copy.wizard.farm}>
          <Input value={d.farm} onChange={(e) => u({ farm: e.target.value })}
            placeholder={copy.wizard.placeholders.farm} className={inputCls} />
        </Field>
        <Field label={copy.wizard.variety}>
          <Input value={localizeVariety(d.variety, language)} onChange={(e) => u({ variety: canonicalizeVariety(e.target.value) })}
            placeholder={copy.wizard.placeholders.variety} className={inputCls} list="coffeemind-variety-options" />
          <datalist id="coffeemind-variety-options">
            {VARIETY_VALUES.map((variety) => <option key={variety} value={localizeVariety(variety, language)} />)}
          </datalist>
        </Field>
      </div>

      <div className="coffee-panel rounded-[22px] p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{copy.wizard.extendedBean}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label={copy.wizard.producer}>
            <Input value={d.producer} onChange={(e) => u({ producer: e.target.value })}
              placeholder={copy.wizard.placeholders.producer} className={inputCls} />
          </Field>
          <Field label={copy.wizard.washingStation}>
            <Input value={d.washingStation} onChange={(e) => u({ washingStation: e.target.value })}
              placeholder={copy.wizard.placeholders.washingStation} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label={copy.wizard.elevation}>
            <Input value={d.elevationMeters} onChange={(e) => u({ elevationMeters: e.target.value })}
              placeholder={copy.wizard.placeholders.elevation} inputMode="numeric" className={inputCls} />
          </Field>
          <Field label={copy.wizard.harvest}>
            <Input value={d.harvestYear} onChange={(e) => u({ harvestYear: e.target.value })}
              placeholder={copy.wizard.placeholders.harvest} inputMode="numeric" className={inputCls} />
          </Field>
          <Field label={copy.wizard.lot}>
            <Input value={d.lotNumber} onChange={(e) => u({ lotNumber: e.target.value })}
              placeholder={copy.wizard.placeholders.lot} className={inputCls} />
          </Field>
        </div>
      </div>

      <Field label={copy.wizard.processing}>
        <PillRow
          options={PROCESS_OPTIONS}
          value={d.processing}
          onChange={(v) => u({ processing: v })}
          getLabel={(value) => localizeProcessing(value, language)}
        />
      </Field>

      <Field label={copy.wizard.roastDate}>
        <Input type="date" value={d.roastDate} onChange={(e) => u({ roastDate: e.target.value })}
          className={`${inputCls} text-[13px]`} />
      </Field>
    </div>
  );
}

// ─── Step 2 — Brewing ─────────────────────────────────────────────────────────

function Step2({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const { copy, language } = useTastingCopy();
  const ratio = d.doseGrams && d.beverageWeightGrams && Number(d.doseGrams) > 0
    ? (Number(d.beverageWeightGrams) / Number(d.doseGrams)).toFixed(1)
    : null;

  return (
    <div className="space-y-5">
      <CoachHint title={copy.wizard.recipeTipTitle}>
        {copy.wizard.recipeTip}
      </CoachHint>

      <Field label={copy.wizard.brewMethod}>
        <PillRow options={BREW_METHODS} value={d.brewMethod} onChange={(v) => u({ brewMethod: v })} getLabel={(method) => localizeBrewMethod(method, language)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={copy.wizard.dose}>
          <Input value={d.doseGrams} onChange={(e) => u({ doseGrams: e.target.value })}
            placeholder={copy.wizard.placeholders.dose} inputMode="decimal" className={inputCls} />
        </Field>
        <Field label={copy.wizard.yield}>
          <Input value={d.beverageWeightGrams} onChange={(e) => u({ beverageWeightGrams: e.target.value })}
            placeholder={copy.wizard.placeholders.yield} inputMode="decimal" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={copy.wizard.time}>
          <Input value={d.brewTimeSeconds} onChange={(e) => u({ brewTimeSeconds: e.target.value })}
            placeholder={copy.wizard.placeholders.time} inputMode="numeric" className={inputCls} />
        </Field>
        <Field label={copy.wizard.temperature}>
          <Input value={d.waterTemperatureCelsius} onChange={(e) => u({ waterTemperatureCelsius: e.target.value })}
            placeholder={copy.wizard.placeholders.temperature} inputMode="decimal" className={inputCls} />
        </Field>
      </div>

      <div className="coffee-panel rounded-[22px] p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{copy.wizard.equipment}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label={copy.wizard.grinder}>
            <Input value={d.grinderModel} onChange={(e) => u({ grinderModel: e.target.value })}
              placeholder={copy.wizard.placeholders.grinder} className={inputCls} />
          </Field>
          <Field label={copy.wizard.grindSetting}>
            <Input value={d.grindSetting} onChange={(e) => u({ grindSetting: e.target.value })}
              placeholder={copy.wizard.placeholders.grindSetting} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label={copy.wizard.water}>
            <Input value={d.waterName} onChange={(e) => u({ waterName: e.target.value })}
              placeholder={copy.wizard.placeholders.water} className={inputCls} />
          </Field>
          <Field label="TDS, ppm">
            <Input value={d.waterTdsPpm} onChange={(e) => u({ waterTdsPpm: e.target.value })}
              placeholder={copy.wizard.placeholders.waterTds} inputMode="numeric" className={inputCls} />
          </Field>
          <Field label={copy.wizard.bloom}>
            <Input value={d.bloomSeconds} onChange={(e) => u({ bloomSeconds: e.target.value })}
              placeholder={copy.wizard.placeholders.bloom} inputMode="numeric" className={inputCls} />
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
            <span className="text-[12px] text-muted-foreground font-medium">{copy.wizard.brewRatio}</span>
            <span className="font-serif text-primary text-xl">1 : {ratio}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 3 — Sensory ─────────────────────────────────────────────────────────

function Step3({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const { copy } = useTastingCopy();
  return (
    <div className="space-y-6">
      <CoachHint title={copy.wizard.sensoryTipTitle}>
        {copy.wizard.sensoryTip}
      </CoachHint>

      <div className="space-y-4">
        <Field label={copy.wizard.dryAroma}>
          <Input value={d.dryAroma} onChange={(e) => u({ dryAroma: e.target.value })}
            placeholder={copy.wizard.placeholders.dryAroma} className={inputCls} />
        </Field>
        <Field label={copy.wizard.wetAroma}>
          <Input value={d.wetAroma} onChange={(e) => u({ wetAroma: e.target.value })}
            placeholder={copy.wizard.placeholders.wetAroma} className={inputCls} />
        </Field>
        <Field label={copy.wizard.firstImpression}>
          <Input value={d.firstImpression} onChange={(e) => u({ firstImpression: e.target.value })}
            placeholder={copy.wizard.placeholders.firstImpression} className={inputCls} />
        </Field>
      </div>

      <div className="coffee-panel rounded-[24px] p-5 space-y-7">
        <ScoreSlider label={copy.metrics.aroma} value={d.aromaScore} onChange={(v) => u({ aromaScore: v })} />
        <ScoreSlider label={copy.metrics.flavor} value={d.flavorScore} onChange={(v) => u({ flavorScore: v })} />
        <ScoreSlider label={copy.metrics.acidity} value={d.acidity} onChange={(v) => u({ acidity: v })} />
        <ScoreSlider label={copy.metrics.sweetness} value={d.sweetness} onChange={(v) => u({ sweetness: v })} />
        <ScoreSlider label={copy.metrics.body} value={d.body} onChange={(v) => u({ body: v })} />
        <ScoreSlider label={copy.metrics.bitterness} value={d.bitterness} onChange={(v) => u({ bitterness: v })} />
        <ScoreSlider label={copy.metrics.balance} value={d.balance} onChange={(v) => u({ balance: v })} />
        <ScoreSlider label={copy.metrics.cleanCup} value={d.cleanCup} onChange={(v) => u({ cleanCup: v })} />
        <ScoreSlider label={copy.metrics.aftertaste} value={d.aftertaste} onChange={(v) => u({ aftertaste: v })} />
      </div>

      <div className="coffee-panel rounded-[24px] p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{copy.wizard.cupProfile}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{copy.wizard.cupProfileHint}</p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-semibold">LIVE</span>
        </div>
        <FlavorRadar
          compact
          size={250}
          metrics={[
            { label: copy.metrics.aroma, value: d.aromaScore },
            { label: copy.metrics.flavor, value: d.flavorScore },
            { label: copy.metrics.acidity, value: d.acidity },
            { label: copy.metrics.sweetness, value: d.sweetness },
            { label: copy.metrics.body, value: d.body },
            { label: copy.metrics.balance, value: d.balance },
            { label: copy.metrics.clean, value: d.cleanCup },
            { label: copy.metrics.aftertaste, value: d.aftertaste },
          ]}
        />
      </div>

      <div className="bg-primary/[0.07] border border-primary/20 rounded-[24px] p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{copy.wizard.finalScore}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{copy.wizard.finalScoreHint}</p>
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
            {copy.wizard.calculate}
          </button>
        </div>
        <ScoreSlider label={copy.wizard.overallScore} value={d.overallScore}
          onChange={(v) => u({ overallScore: v })} min={50} max={100} large />
      </div>
    </div>
  );
}

// ─── Step 4 — Flavor ──────────────────────────────────────────────────────────

function Step4({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const { copy, language } = useTastingCopy();
  const MAX = 3;

  return (
    <div className="space-y-5">
      <CoachHint title={copy.wizard.flavorTipTitle}>
        {copy.wizard.flavorTip}
      </CoachHint>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-foreground">{copy.wizard.mainNotes}</p>
          <p className="text-muted-foreground text-[12px] mt-0.5">{copy.wizard.mainNotesHint}</p>
        </div>
        <motion.span
          key={d.topThreeDescriptors.length}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`flex-shrink-0 text-[12px] font-bold px-3 py-1 rounded-full ${d.topThreeDescriptors.length === MAX ? 'bg-primary/20 text-primary' : 'bg-card text-muted-foreground'}`}
        >
          {d.topThreeDescriptors.length} / {MAX}
        </motion.span>
      </div>

      <AnimatePresence>
        {d.topThreeDescriptors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 p-3 bg-card/40 border border-white/[0.07] rounded-2xl overflow-hidden"
          >
            {d.topThreeDescriptors.map((descriptor, index) => {
              const { bg, text, ring } = flavorChipStyle(descriptor);
              return (
                <button
                  key={descriptor}
                  type="button"
                  onClick={() => u({ topThreeDescriptors: d.topThreeDescriptors.filter((item) => item !== descriptor) })}
                  className={`${bg} ${text} ${ring} ring-1 flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full`}
                >
                  <span className="text-[9px] opacity-55">{index + 1}</span>
                  {localizeFlavor(descriptor, language)}
                  <X size={9} strokeWidth={2.5} className="opacity-50 ml-0.5" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <FlavorWheel
        selected={d.topThreeDescriptors}
        onChange={(next) => u({ topThreeDescriptors: next })}
        maxSelected={MAX}
      />

      <div className="border-t border-white/[0.05] pt-5">
        <Field label={copy.wizard.customDescriptors}>
          <TagInput
            tags={d.additionalDescriptors}
            onChange={(v) => u({ additionalDescriptors: v })}
            placeholder={copy.wizard.descriptorPlaceholder}
          />
          <p className="text-[10px] text-muted-foreground/40 mt-1.5">{copy.wizard.descriptorHint}</p>
        </Field>
      </div>
    </div>
  );
}

// ─── Step 5 — Notes & Photo ───────────────────────────────────────────────────

function Step5({ d, u }: { d: WizardData; u: (p: Partial<WizardData>) => void }) {
  const { copy } = useTastingCopy();
  return (
    <div className="space-y-6">
      <CoachHint title={copy.wizard.notesTipTitle}>
        {copy.wizard.notesTip}
      </CoachHint>

      <Field label={copy.wizard.tastingNotes}>
        <Textarea
          value={d.notes}
          onChange={(e) => u({ notes: e.target.value })}
          placeholder={copy.wizard.notesPlaceholder}
          className="bg-card/60 border-white/[0.08] focus-visible:ring-primary/40 min-h-[120px] resize-none rounded-xl text-[16px]"
        />
      </Field>

      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/50 mb-3">{copy.wizard.cardPhoto}</p>
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
            {copy.wizard.removePhoto}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 6 — Summary ─────────────────────────────────────────────────────────

function Step6({ d, onSave, isSaving, saveError, saveLabel }: { d: WizardData; onSave: () => void; isSaving: boolean; saveError: string; saveLabel: string }) {
  const { copy, language } = useTastingCopy();
  const flag = countryToFlag(d.country);
  const photo = d.photoUrl || getCardPhoto('preview');
  const scoreColor = d.overallScore >= 90 ? 'text-emerald-300' : d.overallScore >= 80 ? 'text-amber-300' : 'text-foreground/70';
  const ratio = d.doseGrams && d.beverageWeightGrams && Number(d.doseGrams) > 0
    ? `1:${(Number(d.beverageWeightGrams) / Number(d.doseGrams)).toFixed(1)}`
    : null;
  const allDescriptors = [...d.topThreeDescriptors, ...d.additionalDescriptors];

  return (
    <div className="space-y-5 pb-4">
      <CoachHint title={copy.wizard.summaryTipTitle}>
        {copy.wizard.summaryTip}
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
              {d.country && <span className="text-[10px] font-medium text-white/80">{localizeCountry(d.country, language)}</span>}
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl px-3 py-1.5 border border-white/10">
            <span className={`text-xl font-serif font-semibold leading-none ${scoreColor}`}>{d.overallScore}</span>
                <span className="text-[7px] uppercase tracking-widest text-white/35 mt-0.5">pts</span>
          </div>
          <div className="absolute left-4 right-4 bottom-4">
            <h3 className="font-serif text-[1.65rem] font-medium text-foreground">{d.coffeeName || copy.wizard.untitled}</h3>
            {d.roaster && <p className="text-[12px] text-white/60 mt-0.5">{d.roaster}</p>}
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          <div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {d.processing && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20">
                  {localizeProcessing(d.processing, language)}
                </span>
              )}
              {d.brewMethod && (
                <span className="inline-flex items-center gap-1 bg-white/5 text-muted-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
                  {localizeBrewMethod(d.brewMethod, language)}
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
              { label: copy.metrics.aroma, v: d.aromaScore }, { label: copy.metrics.flavor, v: d.flavorScore },
              { label: copy.metrics.acidity, v: d.acidity }, { label: copy.metrics.sweetness, v: d.sweetness },
              { label: copy.metrics.body, v: d.body }, { label: copy.metrics.bitterness, v: d.bitterness },
              { label: copy.metrics.balance, v: d.balance }, { label: copy.metrics.aftertaste, v: d.aftertaste },
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
                return <span key={desc} className={`${bg} ${text} ${ring} text-[11px] font-medium px-2.5 py-1 rounded-full ring-1`}>{localizeFlavor(desc, language)}</span>;
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
        {isSaving ? copy.wizard.saving : saveLabel}
      </motion.button>

      {saveError && (
        <p role="alert" className="text-center text-[12px] text-red-400 px-3">{saveError}</p>
      )}

      <p className="text-center text-[10px] text-muted-foreground/25 pb-2">{copy.wizard.localSave}</p>
    </div>
  );
}

// ─── Wizard shell ─────────────────────────────────────────────────────────────

export default function AddTasting() {
  const { copy, language } = useTastingCopy();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const [, setLocation] = useLocation();
  const { tastings, addTasting, updateTasting, getTasting } = useTastings();
  const { recordImpact } = useDnaImpactHistory();
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
        country: canonicalizeCountry(data.country),
        region: data.region,
        farm: data.farm,
        variety: canonicalizeVariety(data.variety),
        processing: data.processing,
        roastDate: data.roastDate,
        producer: data.producer,
        washingStation: data.washingStation,
        elevationMeters: data.elevationMeters,
        harvestYear: data.harvestYear,
        lotNumber: data.lotNumber,
        brewMethod: canonicalizeBrewMethod(data.brewMethod),
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
        recordImpact(buildDnaImpactSnapshot(tastings, saved, language));
        setLocation(`/tasting/${saved.id}/dna-impact`);
      }
    } catch (error) {
      console.error('Failed to save tasting:', error);
      setSaveError(copy.wizard.saveError);
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
      case 6: return <Step6 d={data} onSave={handleSave} isSaving={isSaving} saveError={saveError} saveLabel={isEditing ? copy.wizard.saveChanges : copy.wizard.saveTasting} />;
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
            {isEditing ? copy.wizard.editing : copy.wizard.newTasting}
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
              {step === 5 ? copy.wizard.review : copy.wizard.continue}
              {canGoNext && <ChevronRight size={17} />}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
