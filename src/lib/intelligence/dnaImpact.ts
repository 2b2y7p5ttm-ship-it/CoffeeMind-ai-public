import type { AppLanguage } from '@/contexts/LanguageContext';
import type { Tasting } from '@/hooks/useTastings';
import { canonicalizeBrewMethod } from '@/lib/brewMethodI18n';
import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';
import { canonicalizeProcessing } from '@/lib/processingI18n';
import { buildTasteProfile, type TasteArchetype } from './tasteProfile';

export type DnaImpactMetricKey =
  | 'acidity'
  | 'sweetness'
  | 'body'
  | 'aftertaste'
  | 'balance'
  | 'overallScore'
  | 'diversity';

export type DnaImpactMetric = {
  key: DnaImpactMetricKey;
  before: number;
  after: number;
  delta: number;
};

export type DnaImpactSignalKind = 'country' | 'processing' | 'method' | 'flavor';

export type DnaImpactSignal = {
  id: string;
  kind: DnaImpactSignalKind;
  value: string;
  isNew: boolean;
};

export type DnaImpactSnapshot = {
  version: 1;
  tastingId: string;
  createdAt: string;
  beforeTastingCount: number;
  afterTastingCount: number;
  metrics: DnaImpactMetric[];
  signals: DnaImpactSignal[];
  strongestMetric: DnaImpactMetricKey;
  beforeArchetypeId: TasteArchetype['id'] | null;
  afterArchetypeId: TasteArchetype['id'];
};

function normalize(value?: string): string {
  return (value || '').trim().toLocaleLowerCase('ru-RU');
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function descriptors(tasting: Tasting): string[] {
  return [
    ...(tasting.topThreeDescriptors || []),
    ...(tasting.additionalDescriptors || []),
    ...(tasting.flavorDescriptors || []),
  ]
    .map((value) => value.trim())
    .filter(Boolean);
}

function uniqueSignals(values: DnaImpactSignal[]): DnaImpactSignal[] {
  const seen = new Set<string>();
  return values.filter((signal) => {
    const key = `${signal.kind}:${normalize(signal.value)}`;
    if (!signal.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildDnaImpactSnapshot(
  tastingsBefore: Tasting[],
  tasting: Tasting,
  language: AppLanguage = 'ru',
): DnaImpactSnapshot {
  const beforeProfile = buildTasteProfile(tastingsBefore, language);
  const afterProfile = buildTasteProfile([tasting, ...tastingsBefore], language);

  const metrics: DnaImpactMetric[] = [
    ['acidity', beforeProfile.averages.acidity, afterProfile.averages.acidity],
    ['sweetness', beforeProfile.averages.sweetness, afterProfile.averages.sweetness],
    ['body', beforeProfile.averages.body, afterProfile.averages.body],
    ['aftertaste', beforeProfile.averages.aftertaste, afterProfile.averages.aftertaste],
    ['balance', beforeProfile.averages.balance, afterProfile.averages.balance],
    ['overallScore', beforeProfile.averages.overallScore, afterProfile.averages.overallScore],
    ['diversity', beforeProfile.diversityIndex, afterProfile.diversityIndex],
  ].map(([key, before, after]) => ({
    key: key as DnaImpactMetricKey,
    before: Number(before),
    after: Number(after),
    delta: round(Number(after) - Number(before)),
  }));

  const previousCountries = new Set(
    tastingsBefore.map((item) => normalize(canonicalizeCountry(item.country))).filter(Boolean),
  );
  const previousProcesses = new Set(
    tastingsBefore
      .map((item) => normalize(canonicalizeProcessing(item.processing || item.process || '')))
      .filter(Boolean),
  );
  const previousMethods = new Set(
    tastingsBefore
      .map((item) => normalize(canonicalizeBrewMethod(item.brewMethod || item.brewingMethod || '')))
      .filter(Boolean),
  );
  const previousDescriptors = new Set(
    tastingsBefore.flatMap(descriptors).map(normalize).filter(Boolean),
  );

  const country = canonicalizeCountry(tasting.country);
  const processing = canonicalizeProcessing(tasting.processing || tasting.process || '');
  const method = canonicalizeBrewMethod(tasting.brewMethod || tasting.brewingMethod || '');

  const signals = uniqueSignals([
    ...(country
      ? [{
          id: `country:${normalize(country)}`,
          kind: 'country' as const,
          value: country,
          isNew: !previousCountries.has(normalize(country)),
        }]
      : []),
    ...(processing
      ? [{
          id: `processing:${normalize(processing)}`,
          kind: 'processing' as const,
          value: processing,
          isNew: !previousProcesses.has(normalize(processing)),
        }]
      : []),
    ...(method
      ? [{
          id: `method:${normalize(method)}`,
          kind: 'method' as const,
          value: method,
          isNew: !previousMethods.has(normalize(method)),
        }]
      : []),
    ...descriptors(tasting).map((descriptor) => ({
      id: `flavor:${normalize(descriptor)}`,
      kind: 'flavor' as const,
      value: descriptor,
      isNew: !previousDescriptors.has(normalize(descriptor)),
    })),
  ]).sort((a, b) => Number(b.isNew) - Number(a.isNew));

  const strongestMetric = [...metrics]
    .sort((a, b) => {
      const aMagnitude = a.key === 'diversity' ? Math.abs(a.delta) / 10 : Math.abs(a.delta);
      const bMagnitude = b.key === 'diversity' ? Math.abs(b.delta) / 10 : Math.abs(b.delta);
      return bMagnitude - aMagnitude;
    })[0]?.key || 'diversity';

  return {
    version: 1,
    tastingId: tasting.id,
    createdAt: new Date().toISOString(),
    beforeTastingCount: tastingsBefore.length,
    afterTastingCount: tastingsBefore.length + 1,
    metrics,
    signals,
    strongestMetric,
    beforeArchetypeId: tastingsBefore.length ? beforeProfile.archetype.id : null,
    afterArchetypeId: afterProfile.archetype.id,
  };
}

export function getImpactMetric(snapshot: DnaImpactSnapshot, key: DnaImpactMetricKey): DnaImpactMetric | undefined {
  return snapshot.metrics.find((metric) => metric.key === key);
}
