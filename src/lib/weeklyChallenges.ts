import type { Tasting } from '@/hooks/useTastings';
import { canonicalizeBrewMethod } from '@/lib/brewMethodI18n';
import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';
import { canonicalizeProcessing } from '@/lib/processingI18n';

export type ChallengeKind = 'daily' | 'weekly';
export type WeeklyChallengeId =
  | 'dailyTasting'
  | 'weeklyTastings'
  | 'originExplorer'
  | 'methodExplorer'
  | 'processExplorer'
  | 'qualityFocus'
  | 'descriptorPractice';

export interface ChallengePeriod {
  key: string;
  weekKey: string;
  start: Date;
  end: Date;
}

export interface WeeklyChallengeProgress {
  id: WeeklyChallengeId;
  instanceId: string;
  kind: ChallengeKind;
  icon: string;
  target: number;
  current: number;
  ratio: number;
  rewardPoints: number;
  periodKey: string;
  weekKey: string;
  completed: boolean;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeekPeriod(reference = new Date()): ChallengePeriod {
  const day = startOfLocalDay(reference);
  const mondayOffset = (day.getDay() + 6) % 7;
  const start = new Date(day);
  start.setDate(start.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const weekKey = localDateKey(start);
  return { key: weekKey, weekKey, start, end };
}

export function getDayPeriod(reference = new Date()): ChallengePeriod {
  const start = startOfLocalDay(reference);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    key: localDateKey(start),
    weekKey: getWeekPeriod(reference).weekKey,
    start,
    end,
  };
}

export function getDaysLeftInWeek(reference = new Date()): number {
  const { end } = getWeekPeriod(reference);
  return Math.max(1, Math.ceil((end.getTime() - reference.getTime()) / 86_400_000));
}

function inPeriod(tasting: Tasting, period: ChallengePeriod): boolean {
  const created = new Date(tasting.createdAt);
  return Number.isFinite(created.getTime()) && created >= period.start && created < period.end;
}

function unique(values: string[]): number {
  return new Set(values.map((value) => value.trim()).filter(Boolean)).size;
}

function descriptors(tasting: Tasting): string[] {
  return [
    ...(tasting.topThreeDescriptors || []),
    ...(tasting.additionalDescriptors || []),
    ...(tasting.flavorDescriptors || []),
  ];
}

function seedForWeek(weekKey: string): number {
  return weekKey.split('-').reduce((sum, value) => sum + Number(value || 0), 0);
}

function createProgress(
  id: WeeklyChallengeId,
  kind: ChallengeKind,
  period: ChallengePeriod,
  icon: string,
  target: number,
  rewardPoints: number,
  current: number,
): WeeklyChallengeProgress {
  const safeCurrent = Math.max(0, current);
  return {
    id,
    instanceId: `${kind}:${period.key}:${id}`,
    kind,
    icon,
    target,
    current: safeCurrent,
    ratio: Math.min(safeCurrent / target, 1),
    rewardPoints,
    periodKey: period.key,
    weekKey: period.weekKey,
    completed: safeCurrent >= target,
  };
}

export function buildCurrentChallenges(tastings: Tasting[], reference = new Date()): WeeklyChallengeProgress[] {
  const week = getWeekPeriod(reference);
  const day = getDayPeriod(reference);
  const weekTastings = tastings.filter((tasting) => inPeriod(tasting, week));
  const dayTastings = tastings.filter((tasting) => inPeriod(tasting, day));
  const previousCount = tastings.filter((tasting) => new Date(tasting.createdAt) < week.start).length;

  const weeklyTastingTarget = previousCount < 5 ? 2 : previousCount < 25 ? 3 : 5;
  const descriptorTarget = previousCount < 10 ? 6 : 12;

  const definitions: Record<Exclude<WeeklyChallengeId, 'dailyTasting'>, WeeklyChallengeProgress> = {
    weeklyTastings: createProgress('weeklyTastings', 'weekly', week, '☕', weeklyTastingTarget, 35, weekTastings.length),
    originExplorer: createProgress(
      'originExplorer',
      'weekly',
      week,
      '🌍',
      previousCount < 15 ? 2 : 3,
      45,
      unique(weekTastings.map((item) => canonicalizeCountry(item.country || ''))),
    ),
    methodExplorer: createProgress(
      'methodExplorer',
      'weekly',
      week,
      '⚗️',
      previousCount < 20 ? 2 : 3,
      45,
      unique(weekTastings.map((item) => canonicalizeBrewMethod(item.brewMethod || item.brewingMethod || ''))),
    ),
    processExplorer: createProgress(
      'processExplorer',
      'weekly',
      week,
      '🧬',
      previousCount < 20 ? 2 : 3,
      45,
      unique(weekTastings.map((item) => canonicalizeProcessing(item.processing || item.process || ''))),
    ),
    qualityFocus: createProgress(
      'qualityFocus',
      'weekly',
      week,
      '⭐',
      1,
      40,
      weekTastings.filter((item) => Number(item.overallScore) >= 88).length,
    ),
    descriptorPractice: createProgress(
      'descriptorPractice',
      'weekly',
      week,
      '🎨',
      descriptorTarget,
      50,
      unique(weekTastings.flatMap(descriptors).map((value) => value.toLocaleLowerCase())),
    ),
  };

  const rotatingIds: Array<Exclude<WeeklyChallengeId, 'dailyTasting' | 'weeklyTastings'>> = [
    'originExplorer',
    'methodExplorer',
    'processExplorer',
    'qualityFocus',
    'descriptorPractice',
  ];
  const seed = seedForWeek(week.weekKey) % rotatingIds.length;
  const chosen = Array.from({ length: 3 }, (_, index) => rotatingIds[(seed + index) % rotatingIds.length]);

  return [
    createProgress('dailyTasting', 'daily', day, '🌤️', 1, 10, dayTastings.length),
    definitions.weeklyTastings,
    ...chosen.map((id) => definitions[id]),
  ];
}
