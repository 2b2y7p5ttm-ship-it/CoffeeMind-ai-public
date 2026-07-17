import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';
import { canonicalizeProcessing } from '@/lib/processingI18n';
import { canonicalizeBrewMethod } from '@/lib/brewMethodI18n';
import type { Tasting } from '@/hooks/useTastings';

export type TasteArchetype = {
  id: 'fruit-explorer' | 'sweet-classic' | 'floral-hunter' | 'acid-seeker' | 'terroir-collector' | 'balanced-observer';
  title: string;
  subtitle: string;
  emoji: string;
  confidence: number;
};

export type RankedPreference = {
  name: string;
  count: number;
  share: number;
  averageScore: number;
};

export type TasteProfile = {
  sampleSize: number;
  maturity: number;
  maturityLabel: string;
  archetype: TasteArchetype;
  averages: {
    acidity: number;
    sweetness: number;
    body: number;
    aftertaste: number;
    balance: number;
    bitterness: number;
    overallScore: number;
  };
  topDescriptors: RankedPreference[];
  topCountries: RankedPreference[];
  topProcesses: RankedPreference[];
  topMethods: RankedPreference[];
  diversityIndex: number;
  flavorFamilies: Array<{ id: FlavorFamilyId; name: string; value: number }>;
};

type AppLanguage = 'ru' | 'en';
type FlavorFamilyId = 'berries' | 'citrus' | 'tropical' | 'floral' | 'sweet' | 'chocolate' | 'nuts' | 'spice';

const FAMILY_DEFINITIONS: Array<{ id: FlavorFamilyId; ru: string; en: string; keywords: string[] }> = [
  { id: 'berries', ru: 'Ягоды', en: 'Berries', keywords: ['клубник', 'земляник', 'малин', 'черник', 'ежевик', 'смородин', 'вишн', 'ягод', 'strawberry', 'raspberry', 'blueberry', 'blackberry', 'currant', 'cherry', 'berry'] },
  { id: 'citrus', ru: 'Цитрусы', en: 'Citrus', keywords: ['лимон', 'лайм', 'апельсин', 'грейпфрут', 'бергамот', 'мандарин', 'цитрус', 'lemon', 'lime', 'orange', 'grapefruit', 'bergamot', 'mandarin', 'citrus'] },
  { id: 'tropical', ru: 'Тропики', en: 'Tropical fruit', keywords: ['манго', 'ананас', 'маракуй', 'папай', 'банан', 'тропич', 'mango', 'pineapple', 'passion fruit', 'papaya', 'banana', 'tropical'] },
  { id: 'floral', ru: 'Цветы', en: 'Florals', keywords: ['жасмин', 'роза', 'лаванд', 'цветоч', 'гибискус', 'jasmine', 'rose', 'lavender', 'floral', 'hibiscus'] },
  { id: 'sweet', ru: 'Сладость', en: 'Sweetness', keywords: ['карамел', 'мёд', 'мед', 'ванил', 'сахар', 'ирис', 'марципан', 'caramel', 'honey', 'vanilla', 'sugar', 'toffee', 'marzipan'] },
  { id: 'chocolate', ru: 'Шоколад', en: 'Chocolate', keywords: ['шоколад', 'какао', 'брауни', 'chocolate', 'cocoa', 'cacao', 'brownie'] },
  { id: 'nuts', ru: 'Орехи', en: 'Nuts', keywords: ['орех', 'фундук', 'миндал', 'арахис', 'nut', 'hazelnut', 'almond', 'peanut', 'walnut'] },
  { id: 'spice', ru: 'Специи', en: 'Spices', keywords: ['кориц', 'гвоздик', 'перец', 'пряност', 'кардамон', 'cinnamon', 'clove', 'pepper', 'spice', 'cardamom'] },
];

function n(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function avg(values: number[]): number {
  return values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : 0;
}

function normalize(value?: string): string {
  return (value || '').trim().toLocaleLowerCase('ru-RU');
}

function descriptors(tasting: Tasting): string[] {
  return [...(tasting.topThreeDescriptors || []), ...(tasting.additionalDescriptors || []), ...(tasting.flavorDescriptors || [])]
    .map((value) => value.trim())
    .filter(Boolean);
}

function rankBy<T extends Tasting>(tastings: T[], getter: (tasting: T) => string | undefined, limit = 5): RankedPreference[] {
  const buckets = new Map<string, { name: string; count: number; scores: number[] }>();
  for (const tasting of tastings) {
    const raw = getter(tasting)?.trim();
    if (!raw) continue;
    const key = normalize(raw);
    const bucket = buckets.get(key) || { name: raw, count: 0, scores: [] };
    bucket.count += 1;
    bucket.scores.push(n(tasting.overallScore));
    buckets.set(key, bucket);
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count || avg(b.scores) - avg(a.scores))
    .slice(0, limit)
    .map((item) => ({
      name: item.name,
      count: item.count,
      share: tastings.length ? Math.round((item.count / tastings.length) * 100) : 0,
      averageScore: avg(item.scores),
    }));
}

function rankDescriptors(tastings: Tasting[], limit = 10): RankedPreference[] {
  const buckets = new Map<string, { name: string; count: number; scores: number[] }>();
  for (const tasting of tastings) {
    const unique = new Map<string, string>();
    for (const descriptor of descriptors(tasting)) unique.set(normalize(descriptor), descriptor);
    for (const [key, label] of unique) {
      const bucket = buckets.get(key) || { name: label, count: 0, scores: [] };
      bucket.count += 1;
      bucket.scores.push(n(tasting.overallScore));
      buckets.set(key, bucket);
    }
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count || avg(b.scores) - avg(a.scores))
    .slice(0, limit)
    .map((item) => ({
      name: item.name,
      count: item.count,
      share: tastings.length ? Math.round((item.count / tastings.length) * 100) : 0,
      averageScore: avg(item.scores),
    }));
}

function buildFlavorFamilies(tastings: Tasting[], language: AppLanguage): Array<{ id: FlavorFamilyId; name: string; value: number }> {
  const counts = new Map<FlavorFamilyId, number>(FAMILY_DEFINITIONS.map((family) => [family.id, 0]));
  let totalMatches = 0;
  for (const tasting of tastings) {
    for (const descriptor of descriptors(tasting)) {
      const normalized = normalize(descriptor);
      for (const family of FAMILY_DEFINITIONS) {
        if (family.keywords.some((keyword) => normalized.includes(keyword))) {
          counts.set(family.id, (counts.get(family.id) || 0) + 1);
          totalMatches += 1;
          break;
        }
      }
    }
  }
  return FAMILY_DEFINITIONS
    .map((family) => ({
      id: family.id,
      name: language === 'ru' ? family.ru : family.en,
      value: totalMatches ? Math.round(((counts.get(family.id) || 0) / totalMatches) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

function chooseArchetype(profile: Omit<TasteProfile, 'archetype'>, language: AppLanguage): TasteArchetype {
  const family = profile.flavorFamilies[0];
  const uniqueCountries = new Set(profile.topCountries.map((item) => item.name)).size;
  const candidates: Array<{ score: number; archetype: Omit<TasteArchetype, 'confidence'> }> = [
    {
      score: (family?.id === 'berries' || family?.id === 'tropical' ? family.value + 25 : 0) + profile.averages.sweetness * 2,
      archetype: { id: 'fruit-explorer', title: language === 'ru' ? 'Исследователь фруктов' : 'Fruit Explorer', subtitle: language === 'ru' ? 'Яркие, сочные и фруктовые чашки — твоя территория.' : 'Bright, juicy, fruit-forward cups are your territory.', emoji: '🍓' },
    },
    {
      score: (family?.id === 'chocolate' || family?.id === 'nuts' || family?.id === 'sweet' ? family.value + 25 : 0) + profile.averages.body * 2,
      archetype: { id: 'sweet-classic', title: language === 'ru' ? 'Сладкая классика' : 'Sweet Classic', subtitle: language === 'ru' ? 'Ты ценишь сладость, баланс и плотную текстуру.' : 'You value sweetness, balance, and a rich texture.', emoji: '🍫' },
    },
    {
      score: (family?.id === 'floral' ? family.value + 35 : 0) + profile.averages.acidity,
      archetype: { id: 'floral-hunter', title: language === 'ru' ? 'Охотник за цветами' : 'Floral Hunter', subtitle: language === 'ru' ? 'Тебя привлекают тонкие, чайные и цветочные профили.' : 'You are drawn to delicate, tea-like, floral profiles.', emoji: '🌸' },
    },
    {
      score: profile.averages.acidity * 5 + Math.max(0, profile.averages.acidity - profile.averages.bitterness) * 3,
      archetype: { id: 'acid-seeker', title: language === 'ru' ? 'Искатель кислотности' : 'Acid Seeker', subtitle: language === 'ru' ? 'Ты ищешь живую кислотность и сложную структуру чашки.' : 'You seek vivid acidity and a complex cup structure.', emoji: '⚡' },
    },
    {
      score: profile.diversityIndex * 0.7 + uniqueCountries * 6,
      archetype: { id: 'terroir-collector', title: language === 'ru' ? 'Коллекционер терруаров' : 'Terroir Collector', subtitle: language === 'ru' ? 'Тебе важны происхождение, различия и исследование новых регионов.' : 'Origin, contrast, and discovering new regions matter to you.', emoji: '🌍' },
    },
    {
      score: profile.averages.balance * 4 + profile.averages.aftertaste * 2,
      archetype: { id: 'balanced-observer', title: language === 'ru' ? 'Наблюдатель баланса' : 'Balanced Observer', subtitle: language === 'ru' ? 'Ты ищешь гармонию и оцениваешь чашку целиком.' : 'You look for harmony and judge the cup as a whole.', emoji: '⚖️' },
    },
  ];
  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];
  const runnerUp = candidates[1];
  const confidence = Math.max(45, Math.min(96, Math.round(55 + (winner.score - runnerUp.score) * 1.8 + profile.sampleSize)));
  return { ...winner.archetype, confidence };
}

export function buildTasteProfile(tastings: Tasting[], language: AppLanguage = 'ru'): TasteProfile {
  const sampleSize = tastings.length;
  const maturity = Math.min(100, Math.round((sampleSize / 20) * 100));
  const maturityLabel = language === 'ru'
    ? sampleSize < 5
      ? 'Первые сигналы'
      : sampleSize < 10
        ? 'Профиль формируется'
        : sampleSize < 20
          ? 'Устойчивые закономерности'
          : 'Coffee DNA сформировано'
    : sampleSize < 5
      ? 'First signals'
      : sampleSize < 10
        ? 'Profile taking shape'
        : sampleSize < 20
          ? 'Stable patterns'
          : 'Coffee DNA complete';

  const allDescriptors = tastings.flatMap(descriptors).map(normalize).filter(Boolean);
  const uniqueSignals = new Set([
    ...tastings.map((t) => normalize(canonicalizeCountry(t.country))).filter(Boolean),
    ...tastings.map((t) => normalize(t.processing || t.process)).filter(Boolean),
    ...allDescriptors,
  ]).size;
  const diversityIndex = sampleSize ? Math.min(100, Math.round((uniqueSignals / Math.max(sampleSize * 2.5, 1)) * 100)) : 0;

  const base: Omit<TasteProfile, 'archetype'> = {
    sampleSize,
    maturity,
    maturityLabel,
    averages: {
      acidity: avg(tastings.map((t) => n(t.acidity))),
      sweetness: avg(tastings.map((t) => n(t.sweetness))),
      body: avg(tastings.map((t) => n(t.body))),
      aftertaste: avg(tastings.map((t) => n(t.aftertaste || t.aftertasteScore, 5))),
      balance: avg(tastings.map((t) => n(t.balance, 5))),
      bitterness: avg(tastings.map((t) => n(t.bitterness))),
      overallScore: avg(tastings.map((t) => n(t.overallScore))),
    },
    topDescriptors: rankDescriptors(tastings),
    topCountries: rankBy(tastings, (t) => canonicalizeCountry(t.country)),
    topProcesses: rankBy(tastings, (t) => canonicalizeProcessing(t.processing || t.process || '')),
    topMethods: rankBy(tastings, (t) => canonicalizeBrewMethod(t.brewMethod || t.brewingMethod || '')),
    diversityIndex,
    flavorFamilies: buildFlavorFamilies(tastings, language),
  };

  return { ...base, archetype: chooseArchetype(base, language) };
}
