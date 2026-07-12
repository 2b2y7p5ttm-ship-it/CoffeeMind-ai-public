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
  flavorFamilies: Array<{ name: string; value: number }>;
};

const FAMILY_KEYWORDS: Record<string, string[]> = {
  'Ягоды': ['клубник', 'земляник', 'малин', 'черник', 'ежевик', 'смородин', 'вишн', 'ягод'],
  'Цитрусы': ['лимон', 'лайм', 'апельсин', 'грейпфрут', 'бергамот', 'мандарин', 'цитрус'],
  'Тропики': ['манго', 'ананас', 'маракуй', 'папай', 'банан', 'тропич'],
  'Цветы': ['жасмин', 'роза', 'лаванд', 'цветоч', 'гибискус'],
  'Сладость': ['карамел', 'мёд', 'мед', 'ванил', 'сахар', 'ирис', 'марципан'],
  'Шоколад': ['шоколад', 'какао', 'брауни'],
  'Орехи': ['орех', 'фундук', 'миндал', 'арахис'],
  'Специи': ['кориц', 'гвоздик', 'перец', 'пряност', 'кардамон'],
};

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

function buildFlavorFamilies(tastings: Tasting[]): Array<{ name: string; value: number }> {
  const counts = new Map<string, number>(Object.keys(FAMILY_KEYWORDS).map((name) => [name, 0]));
  let totalMatches = 0;
  for (const tasting of tastings) {
    for (const descriptor of descriptors(tasting)) {
      const normalized = normalize(descriptor);
      for (const [family, keywords] of Object.entries(FAMILY_KEYWORDS)) {
        if (keywords.some((keyword) => normalized.includes(keyword))) {
          counts.set(family, (counts.get(family) || 0) + 1);
          totalMatches += 1;
          break;
        }
      }
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, value: totalMatches ? Math.round((count / totalMatches) * 100) : 0 }))
    .sort((a, b) => b.value - a.value);
}

function chooseArchetype(profile: Omit<TasteProfile, 'archetype'>): TasteArchetype {
  const family = profile.flavorFamilies[0];
  const uniqueCountries = new Set(profile.topCountries.map((item) => item.name)).size;
  const candidates: Array<{ score: number; archetype: Omit<TasteArchetype, 'confidence'> }> = [
    {
      score: (family?.name === 'Ягоды' || family?.name === 'Тропики' ? family.value + 25 : 0) + profile.averages.sweetness * 2,
      archetype: { id: 'fruit-explorer', title: 'Fruit Explorer', subtitle: 'Яркие, сочные и фруктовые чашки — твоя территория.', emoji: '🍓' },
    },
    {
      score: (family?.name === 'Шоколад' || family?.name === 'Орехи' || family?.name === 'Сладость' ? family.value + 25 : 0) + profile.averages.body * 2,
      archetype: { id: 'sweet-classic', title: 'Sweet Classic', subtitle: 'Ты ценишь сладость, баланс и плотную текстуру.', emoji: '🍫' },
    },
    {
      score: (family?.name === 'Цветы' ? family.value + 35 : 0) + profile.averages.acidity,
      archetype: { id: 'floral-hunter', title: 'Floral Hunter', subtitle: 'Тебя привлекают тонкие, чайные и цветочные профили.', emoji: '🌸' },
    },
    {
      score: profile.averages.acidity * 5 + Math.max(0, profile.averages.acidity - profile.averages.bitterness) * 3,
      archetype: { id: 'acid-seeker', title: 'Acid Seeker', subtitle: 'Ты ищешь живую кислотность и сложную структуру чашки.', emoji: '⚡' },
    },
    {
      score: profile.diversityIndex * 0.7 + uniqueCountries * 6,
      archetype: { id: 'terroir-collector', title: 'Terroir Collector', subtitle: 'Тебе важны происхождение, различия и исследование новых регионов.', emoji: '🌍' },
    },
    {
      score: profile.averages.balance * 4 + profile.averages.aftertaste * 2,
      archetype: { id: 'balanced-observer', title: 'Balanced Observer', subtitle: 'Ты ищешь гармонию и оцениваешь чашку целиком.', emoji: '⚖️' },
    },
  ];
  candidates.sort((a, b) => b.score - a.score);
  const winner = candidates[0];
  const runnerUp = candidates[1];
  const confidence = Math.max(45, Math.min(96, Math.round(55 + (winner.score - runnerUp.score) * 1.8 + profile.sampleSize)));
  return { ...winner.archetype, confidence };
}

export function buildTasteProfile(tastings: Tasting[]): TasteProfile {
  const sampleSize = tastings.length;
  const maturity = Math.min(100, Math.round((sampleSize / 20) * 100));
  const maturityLabel = sampleSize < 5
    ? 'Первые сигналы'
    : sampleSize < 10
      ? 'Профиль формируется'
      : sampleSize < 20
        ? 'Устойчивые закономерности'
        : 'Coffee DNA сформировано';

  const allDescriptors = tastings.flatMap(descriptors).map(normalize).filter(Boolean);
  const uniqueSignals = new Set([
    ...tastings.map((t) => normalize(t.country)).filter(Boolean),
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
    topCountries: rankBy(tastings, (t) => t.country),
    topProcesses: rankBy(tastings, (t) => t.processing || t.process),
    topMethods: rankBy(tastings, (t) => t.brewMethod || t.brewingMethod),
    diversityIndex,
    flavorFamilies: buildFlavorFamilies(tastings),
  };

  return { ...base, archetype: chooseArchetype(base) };
}
