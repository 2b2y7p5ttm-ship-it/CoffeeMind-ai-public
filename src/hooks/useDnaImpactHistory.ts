import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { DnaImpactSnapshot } from '@/lib/intelligence/dnaImpact';

export const DNA_IMPACT_STORAGE_KEY = 'coffeemind_dna_impact_history_v1';
const MAX_HISTORY_ITEMS = 120;

export function useDnaImpactHistory() {
  const [history, setHistory] = useLocalStorage<DnaImpactSnapshot[]>(DNA_IMPACT_STORAGE_KEY, []);

  const recordImpact = useCallback((snapshot: DnaImpactSnapshot) => {
    setHistory((current) => [
      snapshot,
      ...current.filter((item) => item.tastingId !== snapshot.tastingId),
    ].slice(0, MAX_HISTORY_ITEMS));
  }, [setHistory]);

  const getImpact = useCallback(
    (tastingId: string) => history.find((item) => item.tastingId === tastingId),
    [history],
  );

  const removeImpact = useCallback((tastingId: string) => {
    setHistory((current) => current.filter((item) => item.tastingId !== tastingId));
  }, [setHistory]);

  return { history, recordImpact, getImpact, removeImpact };
}
