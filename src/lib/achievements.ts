import type { Tasting } from '@/hooks/useTastings';
import { canonicalizeBrewMethod } from '@/lib/brewMethodI18n';
import { canonicalizeCountry } from '@/lib/coffeeReferenceI18n';
import { canonicalizeProcessing } from '@/lib/processingI18n';

export type AchievementCategory = 'journey' | 'origins' | 'quality' | 'methods' | 'processing' | 'consistency' | 'sensory';

export type AchievementId =
  | 'first'
  | 'five'
  | 'twentyFive'
  | 'century'
  | 'world'
  | 'worldTen'
  | 'high'
  | 'perfect'
  | 'method'
  | 'methodAll'
  | 'natural'
  | 'processExplorer'
  | 'streakThree'
  | 'streakSeven'
  | 'flavorLibrary';

export interface AchievementDefinition {
  id: AchievementId;
  category: AchievementCategory;
  icon: string;
  target: number;
  rewardPoints: number;
  metric: (tastings: Tasting[]) => number;
}

function getProcessing(tasting: Tasting): string {
  return canonicalizeProcessing(tasting.processing || tasting.process || '');
}

function getBrewMethod(tasting: Tasting): string {
  return canonicalizeBrewMethod(tasting.brewMethod || tasting.brewingMethod || '');
}

function getUniqueCountries(tastings: Tasting[]): number {
  return new Set(
    tastings
      .map((tasting) => canonicalizeCountry(tasting.country || ''))
      .filter(Boolean),
  ).size;
}

function getUniqueMethods(tastings: Tasting[]): number {
  return new Set(tastings.map(getBrewMethod).filter(Boolean)).size;
}

function getUniqueProcesses(tastings: Tasting[]): number {
  return new Set(tastings.map(getProcessing).filter(Boolean)).size;
}

function getUniqueDescriptors(tastings: Tasting[]): number {
  const values = tastings.flatMap((tasting) => [
    ...(tasting.topThreeDescriptors || []),
    ...(tasting.additionalDescriptors || []),
    ...(tasting.flavorDescriptors || []),
  ]);

  return new Set(values.map((value) => value.trim().toLocaleLowerCase()).filter(Boolean)).size;
}

export function calculateTastingStreak(tastings: Pick<Tasting, 'createdAt'>[]): number {
  if (!tastings.length) return 0;

  const days = [...new Set(tastings.map((tasting) => tasting.createdAt.slice(0, 10)))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;

  let streak = 0;
  let expected = days[0];
  for (const day of days) {
    if (day !== expected) break;
    streak += 1;
    const date = new Date(`${expected}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    expected = date.toISOString().slice(0, 10);
  }
  return streak;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'first', category: 'journey', icon: '☕', target: 1, rewardPoints: 10, metric: (tastings) => tastings.length },
  { id: 'five', category: 'journey', icon: '🌱', target: 5, rewardPoints: 20, metric: (tastings) => tastings.length },
  { id: 'twentyFive', category: 'journey', icon: '📚', target: 25, rewardPoints: 50, metric: (tastings) => tastings.length },
  { id: 'century', category: 'journey', icon: '💯', target: 100, rewardPoints: 150, metric: (tastings) => tastings.length },
  { id: 'world', category: 'origins', icon: '🌍', target: 5, rewardPoints: 40, metric: getUniqueCountries },
  { id: 'worldTen', category: 'origins', icon: '🧭', target: 10, rewardPoints: 80, metric: getUniqueCountries },
  { id: 'high', category: 'quality', icon: '⭐', target: 1, rewardPoints: 40, metric: (tastings) => tastings.filter((item) => item.overallScore >= 90).length },
  { id: 'perfect', category: 'quality', icon: '💎', target: 1, rewardPoints: 80, metric: (tastings) => tastings.filter((item) => item.overallScore >= 95).length },
  { id: 'method', category: 'methods', icon: '⚗️', target: 4, rewardPoints: 40, metric: getUniqueMethods },
  { id: 'methodAll', category: 'methods', icon: '🧪', target: 8, rewardPoints: 90, metric: getUniqueMethods },
  { id: 'natural', category: 'processing', icon: '🫐', target: 3, rewardPoints: 30, metric: (tastings) => tastings.filter((item) => getProcessing(item) === 'Natural').length },
  { id: 'processExplorer', category: 'processing', icon: '🧬', target: 5, rewardPoints: 70, metric: getUniqueProcesses },
  { id: 'streakThree', category: 'consistency', icon: '🔥', target: 3, rewardPoints: 30, metric: calculateTastingStreak },
  { id: 'streakSeven', category: 'consistency', icon: '⚡', target: 7, rewardPoints: 70, metric: calculateTastingStreak },
  { id: 'flavorLibrary', category: 'sensory', icon: '🎨', target: 25, rewardPoints: 60, metric: getUniqueDescriptors },
] as const;

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  ratio: number;
  unlocked: boolean;
}

export function buildAchievementProgress(tastings: Tasting[]): AchievementProgress[] {
  return ACHIEVEMENTS.map((achievement) => {
    const current = Math.max(0, achievement.metric(tastings));
    return {
      ...achievement,
      current,
      ratio: Math.min(current / achievement.target, 1),
      unlocked: current >= achievement.target,
    };
  });
}
