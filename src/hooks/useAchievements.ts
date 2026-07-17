import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTastings } from '@/hooks/useTastings';
import { ACHIEVEMENTS, AchievementId, buildAchievementProgress } from '@/lib/achievements';

export const ACHIEVEMENTS_STORAGE_KEY = 'coffeemind_achievements_v1';

export interface AchievementUnlockRecord {
  unlockedAt: string;
  seen: boolean;
}

interface AchievementStore {
  version: 1;
  initialized: boolean;
  unlocked: Partial<Record<AchievementId, AchievementUnlockRecord>>;
}

const EMPTY_STORE: AchievementStore = {
  version: 1,
  initialized: false,
  unlocked: {},
};

export function useAchievements(options: { track?: boolean } = {}) {
  const { track = false } = options;
  const { tastings } = useTastings();
  const [store, setStore] = useLocalStorage<AchievementStore>(ACHIEVEMENTS_STORAGE_KEY, EMPTY_STORE);
  const progress = useMemo(() => buildAchievementProgress(tastings), [tastings]);

  useEffect(() => {
    if (!track) return;

    const currentlyUnlocked = progress.filter((item) => item.unlocked);

    if (!store.initialized) {
      const baseline = Object.fromEntries(
        currentlyUnlocked.map((item) => [item.id, { unlockedAt: new Date().toISOString(), seen: true }]),
      ) as Partial<Record<AchievementId, AchievementUnlockRecord>>;

      setStore({ version: 1, initialized: true, unlocked: baseline });
      return;
    }

    const missing = currentlyUnlocked.filter((item) => !store.unlocked[item.id]);
    if (!missing.length) return;

    const now = Date.now();
    setStore((current) => {
      const nextUnlocked = { ...current.unlocked };
      missing.forEach((item, index) => {
        if (!nextUnlocked[item.id]) {
          nextUnlocked[item.id] = {
            unlockedAt: new Date(now + index).toISOString(),
            seen: false,
          };
        }
      });
      return { version: 1, initialized: true, unlocked: nextUnlocked };
    });
  }, [progress, setStore, store.initialized, store.unlocked, track]);

  const markSeen = useCallback((id: AchievementId) => {
    setStore((current) => {
      const record = current.unlocked[id];
      if (!record || record.seen) return current;
      return {
        ...current,
        unlocked: {
          ...current.unlocked,
          [id]: { ...record, seen: true },
        },
      };
    });
  }, [setStore]);

  const progressWithDates = useMemo(() => progress.map((item) => {
    const record = store.unlocked[item.id];
    const permanentlyUnlocked = item.unlocked || Boolean(record);
    return {
      ...item,
      current: permanentlyUnlocked ? Math.max(item.current, item.target) : item.current,
      ratio: permanentlyUnlocked ? 1 : item.ratio,
      unlocked: permanentlyUnlocked,
      unlockedAt: record?.unlockedAt ?? null,
      seen: record?.seen ?? true,
    };
  }), [progress, store.unlocked]);

  const unlocked = progressWithDates.filter((item) => item.unlocked);
  const pending = unlocked
    .filter((item) => !item.seen)
    .sort((a, b) => String(a.unlockedAt).localeCompare(String(b.unlockedAt)))[0] ?? null;
  const totalPoints = unlocked.reduce((sum, item) => sum + item.rewardPoints, 0);
  const availablePoints = ACHIEVEMENTS.reduce((sum, item) => sum + item.rewardPoints, 0);

  return {
    achievements: progressWithDates,
    unlockedCount: unlocked.length,
    totalCount: ACHIEVEMENTS.length,
    totalPoints,
    availablePoints,
    pendingAchievement: pending,
    markSeen,
  };
}
