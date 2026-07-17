import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTastings } from '@/hooks/useTastings';
import {
  buildCurrentChallenges,
  ChallengeKind,
  getDaysLeftInWeek,
  WeeklyChallengeId,
} from '@/lib/weeklyChallenges';

export const WEEKLY_CHALLENGES_STORAGE_KEY = 'coffeemind_weekly_challenges_v1';

export interface ChallengeCompletionRecord {
  instanceId: string;
  challengeId: WeeklyChallengeId;
  kind: ChallengeKind;
  periodKey: string;
  weekKey: string;
  completedAt: string;
  rewardPoints: number;
  claimedAt: string | null;
  seen: boolean;
}

interface WeeklyChallengeStore {
  version: 1;
  initialized: boolean;
  completed: Record<string, ChallengeCompletionRecord>;
}

const EMPTY_STORE: WeeklyChallengeStore = {
  version: 1,
  initialized: false,
  completed: {},
};

export interface WeeklyChallengeHistoryItem {
  weekKey: string;
  completedCount: number;
  claimedCount: number;
  earnedPoints: number;
}

export function useWeeklyChallenges(options: { track?: boolean } = {}) {
  const { track = false } = options;
  const { tastings } = useTastings();
  const [store, setStore] = useLocalStorage<WeeklyChallengeStore>(WEEKLY_CHALLENGES_STORAGE_KEY, EMPTY_STORE);
  const challenges = useMemo(() => buildCurrentChallenges(tastings), [tastings]);

  useEffect(() => {
    if (!track) return;
    const completedNow = challenges.filter((challenge) => challenge.completed);

    if (!store.initialized) {
      const baseline = { ...store.completed };
      const now = Date.now();
      completedNow.forEach((challenge, index) => {
        baseline[challenge.instanceId] = baseline[challenge.instanceId] ?? {
          instanceId: challenge.instanceId,
          challengeId: challenge.id,
          kind: challenge.kind,
          periodKey: challenge.periodKey,
          weekKey: challenge.weekKey,
          completedAt: new Date(now + index).toISOString(),
          rewardPoints: challenge.rewardPoints,
          claimedAt: null,
          seen: true,
        };
      });
      setStore({ version: 1, initialized: true, completed: baseline });
      return;
    }

    const missing = completedNow.filter((challenge) => !store.completed[challenge.instanceId]);
    if (!missing.length) return;

    const now = Date.now();
    setStore((current) => {
      const next = { ...current.completed };
      missing.forEach((challenge, index) => {
        next[challenge.instanceId] = next[challenge.instanceId] ?? {
          instanceId: challenge.instanceId,
          challengeId: challenge.id,
          kind: challenge.kind,
          periodKey: challenge.periodKey,
          weekKey: challenge.weekKey,
          completedAt: new Date(now + index).toISOString(),
          rewardPoints: challenge.rewardPoints,
          claimedAt: null,
          seen: false,
        };
      });
      return { version: 1, initialized: true, completed: next };
    });
  }, [challenges, setStore, store.completed, store.initialized, track]);

  const challengeState = useMemo(() => challenges.map((challenge) => {
    const record = store.completed[challenge.instanceId];
    const completed = challenge.completed || Boolean(record);
    return {
      ...challenge,
      completed,
      current: completed ? Math.max(challenge.current, challenge.target) : challenge.current,
      ratio: completed ? 1 : challenge.ratio,
      completedAt: record?.completedAt ?? null,
      claimedAt: record?.claimedAt ?? null,
      seen: record?.seen ?? true,
    };
  }), [challenges, store.completed]);

  const claimReward = useCallback((instanceId: string) => {
    setStore((current) => {
      const record = current.completed[instanceId];
      if (!record || record.claimedAt) return current;
      return {
        ...current,
        completed: {
          ...current.completed,
          [instanceId]: { ...record, claimedAt: new Date().toISOString(), seen: true },
        },
      };
    });
  }, [setStore]);

  const markSeen = useCallback((instanceId: string) => {
    setStore((current) => {
      const record = current.completed[instanceId];
      if (!record || record.seen) return current;
      return {
        ...current,
        completed: {
          ...current.completed,
          [instanceId]: { ...record, seen: true },
        },
      };
    });
  }, [setStore]);

  const pendingChallenge = challengeState
    .filter((challenge) => challenge.completed && !challenge.seen)
    .sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt)))[0] ?? null;

  const dailyChallenge = challengeState.find((challenge) => challenge.kind === 'daily') ?? null;
  const weeklyChallenges = challengeState.filter((challenge) => challenge.kind === 'weekly');
  const weeklyCompleted = weeklyChallenges.filter((challenge) => challenge.completed).length;
  const weeklyClaimed = weeklyChallenges.filter((challenge) => challenge.claimedAt).length;
  const currentWeekKey = weeklyChallenges[0]?.weekKey ?? dailyChallenge?.weekKey ?? '';
  const currentWeekPoints = Object.values(store.completed)
    .filter((record) => record.weekKey === currentWeekKey && record.claimedAt)
    .reduce((sum, record) => sum + record.rewardPoints, 0);
  const totalPoints = Object.values(store.completed)
    .filter((record) => record.claimedAt)
    .reduce((sum, record) => sum + record.rewardPoints, 0);

  const history = useMemo<WeeklyChallengeHistoryItem[]>(() => {
    const byWeek = new Map<string, WeeklyChallengeHistoryItem>();
    Object.values(store.completed).forEach((record) => {
      const current = byWeek.get(record.weekKey) ?? {
        weekKey: record.weekKey,
        completedCount: 0,
        claimedCount: 0,
        earnedPoints: 0,
      };
      current.completedCount += 1;
      if (record.claimedAt) {
        current.claimedCount += 1;
        current.earnedPoints += record.rewardPoints;
      }
      byWeek.set(record.weekKey, current);
    });
    return [...byWeek.values()].sort((a, b) => b.weekKey.localeCompare(a.weekKey)).slice(0, 8);
  }, [store.completed]);

  return {
    dailyChallenge,
    weeklyChallenges,
    weeklyCompleted,
    weeklyClaimed,
    currentWeekPoints,
    totalPoints,
    daysLeft: getDaysLeftInWeek(),
    history,
    pendingChallenge,
    claimReward,
    markSeen,
  };
}
