import type { AppLanguage } from '@/contexts/LanguageContext';
import type { Tasting } from '@/hooks/useTastings';
import { BREW_METHOD_VALUES, canonicalizeBrewMethod, localizeBrewMethod } from '@/lib/brewMethodI18n';
import { COUNTRY_VALUES, canonicalizeCountry, localizeCountry } from '@/lib/coffeeReferenceI18n';
import { PROCESSING_VALUES, canonicalizeProcessing, localizeProcessing } from '@/lib/processingI18n';
import { localizeFlavor } from '@/lib/tastingI18n';
import { buildTasteProfile, type TasteProfile } from './tasteProfile';

export type DnaPeriod = 'all' | '90d' | '30d';
export type DnaMetricKey = 'acidity' | 'sweetness' | 'body' | 'aftertaste' | 'balance' | 'overallScore' | 'diversity';

export type DnaMetricDelta = {
  key: DnaMetricKey;
  current: number;
  previous: number;
  delta: number;
};

export type DnaComparison = {
  activeTastings: Tasting[];
  currentWindow: Tasting[];
  previousWindow: Tasting[];
  currentProfile: TasteProfile;
  previousProfile: TasteProfile | null;
  deltas: DnaMetricDelta[];
};

export type InfluentialTasting = {
  tasting: Tasting;
  influence: number;
  reasons: string[];
};

export type ExplorationGap = {
  id: string;
  kind: 'country' | 'processing' | 'method' | 'flavor';
  title: string;
  value: string;
  description: string;
};

export type NextCoffeeRecommendation = {
  country: string;
  processing: string;
  method: string;
  focus: string;
  rationale: string;
};

const DAY = 24 * 60 * 60 * 1000;
const CORE_COUNTRIES = ['Ethiopia', 'Kenya', 'Colombia', 'Brazil', 'Rwanda', 'Indonesia', 'Costa Rica', 'Guatemala', 'Panama', 'Burundi'];
const CORE_PROCESSES = PROCESSING_VALUES.filter((value) => value !== 'Other');

function timestamp(tasting: Tasting): number {
  const parsed = Date.parse(tasting.createdAt);
  return Number.isFinite(parsed) ? parsed : 0;
}

function newestFirst(tastings: Tasting[]): Tasting[] {
  return [...tastings].sort((a, b) => timestamp(b) - timestamp(a));
}

function normalize(value?: string): string {
  return (value || '').trim().toLocaleLowerCase('ru-RU');
}

function descriptors(tasting: Tasting): string[] {
  return [...(tasting.topThreeDescriptors || []), ...(tasting.additionalDescriptors || []), ...(tasting.flavorDescriptors || [])]
    .map((value) => value.trim())
    .filter(Boolean);
}

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function filterTastingsByPeriod(tastings: Tasting[], period: DnaPeriod, now = Date.now()): Tasting[] {
  const sorted = newestFirst(tastings);
  if (period === 'all') return sorted;
  const duration = period === '30d' ? 30 * DAY : 90 * DAY;
  return sorted.filter((tasting) => timestamp(tasting) >= now - duration);
}

function comparisonWindows(tastings: Tasting[], period: DnaPeriod, now = Date.now()): { current: Tasting[]; previous: Tasting[] } {
  const sorted = newestFirst(tastings);

  if (period === 'all') {
    const windowSize = Math.min(6, Math.floor(sorted.length / 2));
    if (windowSize < 2) return { current: sorted, previous: [] };
    return {
      current: sorted.slice(0, windowSize),
      previous: sorted.slice(windowSize, windowSize * 2),
    };
  }

  const duration = period === '30d' ? 30 * DAY : 90 * DAY;
  const currentStart = now - duration;
  const previousStart = now - duration * 2;

  return {
    current: sorted.filter((tasting) => timestamp(tasting) >= currentStart),
    previous: sorted.filter((tasting) => timestamp(tasting) >= previousStart && timestamp(tasting) < currentStart),
  };
}

export function buildDnaComparison(tastings: Tasting[], period: DnaPeriod, language: AppLanguage, now = Date.now()): DnaComparison {
  const activeTastings = filterTastingsByPeriod(tastings, period, now);
  const windows = comparisonWindows(tastings, period, now);
  const currentProfile = buildTasteProfile(windows.current.length ? windows.current : activeTastings, language);
  const previousProfile = windows.previous.length >= 2 ? buildTasteProfile(windows.previous, language) : null;

  const deltas: DnaMetricDelta[] = previousProfile
    ? [
        ['acidity', currentProfile.averages.acidity, previousProfile.averages.acidity],
        ['sweetness', currentProfile.averages.sweetness, previousProfile.averages.sweetness],
        ['body', currentProfile.averages.body, previousProfile.averages.body],
        ['aftertaste', currentProfile.averages.aftertaste, previousProfile.averages.aftertaste],
        ['balance', currentProfile.averages.balance, previousProfile.averages.balance],
        ['overallScore', currentProfile.averages.overallScore, previousProfile.averages.overallScore],
        ['diversity', currentProfile.diversityIndex, previousProfile.diversityIndex],
      ].map(([key, current, previous]) => ({
        key: key as DnaMetricKey,
        current: Number(current),
        previous: Number(previous),
        delta: round(Number(current) - Number(previous)),
      }))
    : [];

  return {
    activeTastings,
    currentWindow: windows.current,
    previousWindow: windows.previous,
    currentProfile,
    previousProfile,
    deltas,
  };
}

export function buildInfluentialTastings(tastings: Tasting[], profile: TasteProfile, language: AppLanguage): InfluentialTasting[] {
  if (!tastings.length) return [];

  const topCountry = normalize(profile.topCountries[0]?.name);
  const topProcess = normalize(canonicalizeProcessing(profile.topProcesses[0]?.name || ''));
  const topMethod = normalize(canonicalizeBrewMethod(profile.topMethods[0]?.name || ''));
  const topDescriptors = new Set(profile.topDescriptors.slice(0, 6).map((item) => normalize(item.name)));
  const averageScore = profile.averages.overallScore;
  const countryCounts = new Map<string, number>();

  tastings.forEach((tasting) => {
    const key = normalize(canonicalizeCountry(tasting.country));
    if (key) countryCounts.set(key, (countryCounts.get(key) || 0) + 1);
  });

  const scored = newestFirst(tastings).map((tasting, index) => {
    let raw = Math.max(0, Number(tasting.overallScore || 0) - averageScore) * 1.4;
    const reasons: string[] = [];
    const country = normalize(canonicalizeCountry(tasting.country));
    const process = normalize(canonicalizeProcessing(tasting.processing || tasting.process || ''));
    const method = normalize(canonicalizeBrewMethod(tasting.brewMethod || tasting.brewingMethod || ''));
    const matchedDescriptors = descriptors(tasting).filter((descriptor) => topDescriptors.has(normalize(descriptor)));

    if (country && country === topCountry) {
      raw += 3.2;
      reasons.push(language === 'ru' ? 'укрепила любимое происхождение' : 'reinforced your favorite origin');
    }
    if (process && process === topProcess) {
      raw += 2.7;
      reasons.push(language === 'ru' ? 'подтвердила предпочтение обработки' : 'confirmed your processing preference');
    }
    if (method && method === topMethod) {
      raw += 1.8;
      reasons.push(language === 'ru' ? 'повлияла на основной метод' : 'shaped your primary brew method');
    }
    if (matchedDescriptors.length) {
      raw += Math.min(3.6, matchedDescriptors.length * 1.2);
      const names = matchedDescriptors.slice(0, 2).map((item) => localizeFlavor(item, language)).join(', ');
      reasons.push(language === 'ru' ? `усилила ноты: ${names}` : `reinforced notes: ${names}`);
    }
    if (Number(tasting.overallScore || 0) >= averageScore + 1) {
      raw += 2.3;
      reasons.push(language === 'ru' ? 'получила оценку выше твоего среднего' : 'scored above your average');
    }
    if (country && countryCounts.get(country) === 1) {
      raw += 1.4;
      reasons.push(language === 'ru' ? 'расширила географию профиля' : 'expanded your origin map');
    }

    raw += Math.max(0, 1.2 - index * 0.08);

    return { tasting, raw, reasons: reasons.slice(0, 2) };
  });

  const max = Math.max(...scored.map((item) => item.raw), 1);
  return scored
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 4)
    .map((item) => ({
      tasting: item.tasting,
      influence: Math.max(28, Math.round((item.raw / max) * 100)),
      reasons: item.reasons.length
        ? item.reasons
        : [language === 'ru' ? 'добавила новый сигнал в Coffee DNA' : 'added a new signal to your Coffee DNA'],
    }));
}

function pickUntried(values: readonly string[], tried: Set<string>): string | undefined {
  return values.find((value) => !tried.has(normalize(value)));
}

export function buildExplorationGaps(tastings: Tasting[], profile: TasteProfile, language: AppLanguage): ExplorationGap[] {
  const triedCountries = new Set(tastings.map((tasting) => normalize(canonicalizeCountry(tasting.country))).filter(Boolean));
  const triedProcesses = new Set(tastings.map((tasting) => normalize(canonicalizeProcessing(tasting.processing || tasting.process || ''))).filter(Boolean));
  const triedMethods = new Set(tastings.map((tasting) => normalize(canonicalizeBrewMethod(tasting.brewMethod || tasting.brewingMethod || ''))).filter(Boolean));

  const country = pickUntried(CORE_COUNTRIES, triedCountries) || CORE_COUNTRIES.find((value) => normalize(value) !== normalize(profile.topCountries[0]?.name)) || 'Rwanda';
  const processing = pickUntried(CORE_PROCESSES, triedProcesses) || 'Honey';
  const method = pickUntried(BREW_METHOD_VALUES, triedMethods) || 'AeroPress';
  const flavor = [...profile.flavorFamilies].sort((a, b) => a.value - b.value)[0];

  const gaps: ExplorationGap[] = [
    {
      id: `country-${country}`,
      kind: 'country',
      title: language === 'ru' ? 'Новое происхождение' : 'New origin',
      value: localizeCountry(country, language),
      description: language === 'ru' ? 'Добавит новый терруарный сигнал и повысит разнообразие DNA.' : 'Adds a new terroir signal and increases DNA diversity.',
    },
    {
      id: `processing-${processing}`,
      kind: 'processing',
      title: language === 'ru' ? 'Новая обработка' : 'New process',
      value: localizeProcessing(processing, language),
      description: language === 'ru' ? 'Поможет отделить влияние обработки от происхождения и сорта.' : 'Helps separate processing influence from origin and variety.',
    },
    {
      id: `method-${method}`,
      kind: 'method',
      title: language === 'ru' ? 'Другой способ заваривания' : 'Different brew method',
      value: localizeBrewMethod(method, language),
      description: language === 'ru' ? 'Покажет, какие свойства кофе сохраняются при смене рецепта.' : 'Shows which coffee traits remain stable when the recipe changes.',
    },
    ...(flavor
      ? [{
          id: `flavor-${flavor.id}`,
          kind: 'flavor' as const,
          title: language === 'ru' ? 'Слабо исследованная семья' : 'Underexplored family',
          value: flavor.name,
          description: language === 'ru' ? `Сейчас эта семья занимает только ${flavor.value}% вкусовых сигналов.` : `This family currently represents only ${flavor.value}% of your flavor signals.`,
        }]
      : []),
  ];

  return gaps.slice(0, 4);
}

const ARCHETYPE_COUNTRIES: Record<TasteProfile['archetype']['id'], string[]> = {
  'fruit-explorer': ['Kenya', 'Rwanda', 'Ethiopia', 'Burundi'],
  'sweet-classic': ['Brazil', 'Guatemala', 'Colombia', 'Costa Rica'],
  'floral-hunter': ['Ethiopia', 'Panama', 'Rwanda', 'Kenya'],
  'acid-seeker': ['Kenya', 'Ethiopia', 'Colombia', 'Rwanda'],
  'terroir-collector': ['Indonesia', 'Yemen', 'Burundi', 'Costa Rica'],
  'balanced-observer': ['Colombia', 'Costa Rica', 'Guatemala', 'Brazil'],
};

const ARCHETYPE_PROCESS: Record<TasteProfile['archetype']['id'], string[]> = {
  'fruit-explorer': ['Natural', 'Anaerobic', 'Honey'],
  'sweet-classic': ['Honey', 'Natural', 'Washed'],
  'floral-hunter': ['Washed', 'Honey', 'Natural'],
  'acid-seeker': ['Washed', 'Honey', 'Anaerobic'],
  'terroir-collector': ['Wet-Hulled', 'Natural', 'Washed'],
  'balanced-observer': ['Washed', 'Honey', 'Natural'],
};

export function buildNextCoffeeRecommendation(tastings: Tasting[], profile: TasteProfile, language: AppLanguage): NextCoffeeRecommendation {
  const triedCountries = new Set(tastings.map((tasting) => normalize(canonicalizeCountry(tasting.country))).filter(Boolean));
  const triedProcesses = new Set(tastings.map((tasting) => normalize(canonicalizeProcessing(tasting.processing || tasting.process || ''))).filter(Boolean));

  const countryCandidates = ARCHETYPE_COUNTRIES[profile.archetype.id];
  const country = countryCandidates.find((value) => !triedCountries.has(normalize(value))) || countryCandidates[0];
  const processCandidates = ARCHETYPE_PROCESS[profile.archetype.id];
  const processing = processCandidates.find((value) => !triedProcesses.has(normalize(value))) || processCandidates[0];
  const method = canonicalizeBrewMethod(profile.topMethods[0]?.name || 'V60');
  const leastFamily = [...profile.flavorFamilies].sort((a, b) => a.value - b.value)[0];
  const focus = leastFamily?.name || (language === 'ru' ? 'новые вкусовые дескрипторы' : 'new flavor descriptors');

  return {
    country: localizeCountry(country, language),
    processing: localizeProcessing(processing, language),
    method: localizeBrewMethod(method, language),
    focus,
    rationale: language === 'ru'
      ? `Рекомендация сохраняет знакомый способ заваривания, но меняет происхождение и обработку. Так новый результат будет легче сравнить с уже сформированным профилем.`
      : 'This recommendation keeps a familiar brew method while changing origin and processing, making the result easier to compare with your established profile.',
  };
}
