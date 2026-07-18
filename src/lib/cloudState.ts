import { ACHIEVEMENTS_STORAGE_KEY } from '@/hooks/useAchievements';
import { DNA_IMPACT_STORAGE_KEY } from '@/hooks/useDnaImpactHistory';
import { EXAMS_STORAGE_KEY } from '@/hooks/useExams';
import { LEARNING_STORAGE_KEY } from '@/hooks/useLearning';
import { WEEKLY_CHALLENGES_STORAGE_KEY } from '@/hooks/useWeeklyChallenges';
import { dispatchLocalStorageChange } from '@/lib/localStorageEvents';

export const THEME_STORAGE_KEY = 'coffeemind_theme';
export const LANGUAGE_STORAGE_KEY = 'coffeemind_language';
export const RECIPE_TEMPLATES_STORAGE_KEY = 'coffeemind:recipe-templates:v1';
export const PREFERENCES_UPDATED_AT_KEY = 'coffeemind:preferences-updated-at:v2';
export const RECIPE_TEMPLATES_UPDATED_AT_KEY = 'coffeemind:recipe-templates-updated-at:v2';

export const CLOUD_STATE_TABLE = 'user_app_state';

export type CloudStateKey =
  | 'achievements'
  | 'weekly_challenges'
  | 'exams'
  | 'learning'
  | 'dna_impacts'
  | 'preferences'
  | 'recipe_templates';

export type CloudStateRow = {
  state_key: CloudStateKey;
  state_value: unknown;
  updated_at?: string;
};

export type PreferenceState = {
  version: 1;
  theme: 'light' | 'dark' | 'system';
  language: 'ru' | 'en' | 'system';
  updatedAt: string;
};

export type RecipeTemplateState = {
  version: 1;
  templates: Array<Record<string, unknown>>;
  updatedAt: string;
};

const STORAGE_KEY_BY_STATE: Partial<Record<CloudStateKey, string>> = {
  achievements: ACHIEVEMENTS_STORAGE_KEY,
  weekly_challenges: WEEKLY_CHALLENGES_STORAGE_KEY,
  exams: EXAMS_STORAGE_KEY,
  learning: LEARNING_STORAGE_KEY,
  dna_impacts: DNA_IMPACT_STORAGE_KEY,
};

export const MONITORED_LOCAL_KEYS = new Set([
  ...Object.values(STORAGE_KEY_BY_STATE),
  THEME_STORAGE_KEY,
  LANGUAGE_STORAGE_KEY,
  RECIPE_TEMPLATES_STORAGE_KEY,
]);

export function stateKeyForLocalKey(localKey: string): CloudStateKey | null {
  const matched = Object.entries(STORAGE_KEY_BY_STATE)
    .find(([, value]) => value === localKey)?.[0] as CloudStateKey | undefined;
  if (matched) return matched;
  if (localKey === THEME_STORAGE_KEY || localKey === LANGUAGE_STORAGE_KEY) return 'preferences';
  if (localKey === RECIPE_TEMPLATES_STORAGE_KEY) return 'recipe_templates';
  return null;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function validTheme(value: string | null): PreferenceState['theme'] {
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

function validLanguage(value: string | null): PreferenceState['language'] {
  return value === 'ru' || value === 'en' || value === 'system' ? value : 'system';
}

export function readLocalCloudState(stateKey: CloudStateKey): unknown {
  if (typeof window === 'undefined') return null;

  const directStorageKey = STORAGE_KEY_BY_STATE[stateKey];
  if (directStorageKey) return safeParse(localStorage.getItem(directStorageKey), null);

  if (stateKey === 'preferences') {
    return {
      version: 1,
      theme: validTheme(localStorage.getItem(THEME_STORAGE_KEY)),
      language: validLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)),
      updatedAt: localStorage.getItem(PREFERENCES_UPDATED_AT_KEY) || '',
    } satisfies PreferenceState;
  }

  if (stateKey === 'recipe_templates') {
    return {
      version: 1,
      templates: safeParse<Array<Record<string, unknown>>>(localStorage.getItem(RECIPE_TEMPLATES_STORAGE_KEY), []),
      updatedAt: localStorage.getItem(RECIPE_TEMPLATES_UPDATED_AT_KEY) || '',
    } satisfies RecipeTemplateState;
  }

  return null;
}

export function writeLocalCloudState(stateKey: CloudStateKey, value: unknown) {
  if (typeof window === 'undefined' || value == null) return;

  const directStorageKey = STORAGE_KEY_BY_STATE[stateKey];
  if (directStorageKey) {
    localStorage.setItem(directStorageKey, JSON.stringify(value));
    dispatchLocalStorageChange(directStorageKey, value);
    return;
  }

  if (stateKey === 'preferences') {
    const state = value as PreferenceState;
    const theme = validTheme(state.theme);
    const language = validLanguage(state.language);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    if (state.updatedAt) localStorage.setItem(PREFERENCES_UPDATED_AT_KEY, state.updatedAt);
    dispatchLocalStorageChange(THEME_STORAGE_KEY, theme);
    dispatchLocalStorageChange(LANGUAGE_STORAGE_KEY, language);
    return;
  }

  if (stateKey === 'recipe_templates') {
    const state = value as RecipeTemplateState;
    const templates = Array.isArray(state.templates) ? state.templates.slice(0, 5) : [];
    localStorage.setItem(RECIPE_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    if (state.updatedAt) localStorage.setItem(RECIPE_TEMPLATES_UPDATED_AT_KEY, state.updatedAt);
    dispatchLocalStorageChange(RECIPE_TEMPLATES_STORAGE_KEY, templates);
  }
}

function earlierIso(a?: string | null, b?: string | null): string {
  if (!a) return b || new Date().toISOString();
  if (!b) return a;
  return a <= b ? a : b;
}

function laterIso(a?: string | null, b?: string | null): string {
  if (!a) return b || '';
  if (!b) return a;
  return a >= b ? a : b;
}

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function mergeAchievements(localValue: unknown, remoteValue: unknown) {
  const local = asRecord(localValue);
  const remote = asRecord(remoteValue);
  const localUnlocked = asRecord(local.unlocked);
  const remoteUnlocked = asRecord(remote.unlocked);
  const unlocked: Record<string, any> = {};

  new Set([...Object.keys(remoteUnlocked), ...Object.keys(localUnlocked)]).forEach((id) => {
    const a = asRecord(remoteUnlocked[id]);
    const b = asRecord(localUnlocked[id]);
    unlocked[id] = {
      unlockedAt: earlierIso(a.unlockedAt, b.unlockedAt),
      seen: Boolean(a.seen || b.seen),
    };
  });

  return {
    version: 1,
    initialized: Boolean(local.initialized || remote.initialized || Object.keys(unlocked).length),
    unlocked,
  };
}

function mergeWeeklyChallenges(localValue: unknown, remoteValue: unknown) {
  const local = asRecord(localValue);
  const remote = asRecord(remoteValue);
  const localCompleted = asRecord(local.completed);
  const remoteCompleted = asRecord(remote.completed);
  const completed: Record<string, any> = {};

  new Set([...Object.keys(remoteCompleted), ...Object.keys(localCompleted)]).forEach((id) => {
    const a = asRecord(remoteCompleted[id]);
    const b = asRecord(localCompleted[id]);
    completed[id] = {
      ...a,
      ...b,
      instanceId: b.instanceId || a.instanceId || id,
      completedAt: earlierIso(a.completedAt, b.completedAt),
      claimedAt: a.claimedAt || b.claimedAt ? earlierIso(a.claimedAt, b.claimedAt) : null,
      seen: Boolean(a.seen || b.seen),
    };
  });

  return {
    version: 1,
    initialized: Boolean(local.initialized || remote.initialized || Object.keys(completed).length),
    completed,
  };
}

function mergeExams(localValue: unknown, remoteValue: unknown) {
  const local = asRecord(localValue);
  const remote = asRecord(remoteValue);
  const map = new Map<string, any>();
  [...(Array.isArray(remote.attempts) ? remote.attempts : []), ...(Array.isArray(local.attempts) ? local.attempts : [])]
    .forEach((attempt) => {
      if (!attempt?.id) return;
      const current = map.get(attempt.id);
      if (!current || String(attempt.completedAt || '') >= String(current.completedAt || '')) map.set(attempt.id, attempt);
    });
  const rewardedWeeks = new Set<string>();
  const normalized = [...map.values()]
    .sort((a, b) => String(a.completedAt).localeCompare(String(b.completedAt)))
    .map((attempt) => {
      if (!attempt.rewarded || !attempt.weekKey) return attempt;
      if (rewardedWeeks.has(attempt.weekKey)) return { ...attempt, rewarded: false, rewardPoints: 0 };
      rewardedWeeks.add(attempt.weekKey);
      return attempt;
    });

  return {
    version: 1,
    attempts: normalized.sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt))).slice(0, 50),
  };
}

function mergeLearning(localValue: unknown, remoteValue: unknown) {
  const local = asRecord(localValue);
  const remote = asRecord(remoteValue);
  const localCompleted = asRecord(local.completed);
  const remoteCompleted = asRecord(remote.completed);
  const completed: Record<string, any> = {};

  new Set([...Object.keys(remoteCompleted), ...Object.keys(localCompleted)]).forEach((id) => {
    const a = asRecord(remoteCompleted[id]);
    const b = asRecord(localCompleted[id]);
    completed[id] = {
      completedAt: earlierIso(a.completedAt, b.completedAt),
      checkpointCorrect: Boolean(a.checkpointCorrect || b.checkpointCorrect),
    };
  });

  return {
    version: 1,
    completed,
    lastOpenedLessonId: local.lastOpenedLessonId || remote.lastOpenedLessonId || null,
  };
}

function mergeDnaImpacts(localValue: unknown, remoteValue: unknown) {
  const map = new Map<string, any>();
  [...(Array.isArray(remoteValue) ? remoteValue : []), ...(Array.isArray(localValue) ? localValue : [])]
    .forEach((snapshot) => {
      if (!snapshot?.tastingId) return;
      const current = map.get(snapshot.tastingId);
      if (!current || String(snapshot.createdAt || '') >= String(current.createdAt || '')) map.set(snapshot.tastingId, snapshot);
    });
  return [...map.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 120);
}

function mergePreferences(localValue: unknown, remoteValue: unknown): PreferenceState {
  const local = asRecord(localValue) as PreferenceState;
  const remote = asRecord(remoteValue) as PreferenceState;
  if (!remote.updatedAt) return {
    version: 1,
    theme: validTheme(local.theme),
    language: validLanguage(local.language),
    updatedAt: local.updatedAt || new Date().toISOString(),
  };
  if (!local.updatedAt || remote.updatedAt > local.updatedAt) return {
    version: 1,
    theme: validTheme(remote.theme),
    language: validLanguage(remote.language),
    updatedAt: remote.updatedAt,
  };
  return {
    version: 1,
    theme: validTheme(local.theme),
    language: validLanguage(local.language),
    updatedAt: local.updatedAt,
  };
}

function mergeRecipeTemplates(localValue: unknown, remoteValue: unknown): RecipeTemplateState {
  const local = asRecord(localValue) as RecipeTemplateState;
  const remote = asRecord(remoteValue) as RecipeTemplateState;
  const localTemplates = Array.isArray(local.templates) ? local.templates : [];
  const remoteTemplates = Array.isArray(remote.templates) ? remote.templates : [];
  const preferredFirst = remote.updatedAt && (!local.updatedAt || remote.updatedAt > local.updatedAt)
    ? [...remoteTemplates, ...localTemplates]
    : [...localTemplates, ...remoteTemplates];
  const seen = new Set<string>();
  const templates = preferredFirst.filter((template: any) => {
    const id = String(template?.id || '');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, 5);
  return {
    version: 1,
    templates,
    updatedAt: laterIso(local.updatedAt, remote.updatedAt) || new Date().toISOString(),
  };
}

export function mergeCloudState(stateKey: CloudStateKey, localValue: unknown, remoteValue: unknown): unknown {
  if (localValue == null) return remoteValue;
  if (remoteValue == null) return localValue;

  switch (stateKey) {
    case 'achievements': return mergeAchievements(localValue, remoteValue);
    case 'weekly_challenges': return mergeWeeklyChallenges(localValue, remoteValue);
    case 'exams': return mergeExams(localValue, remoteValue);
    case 'learning': return mergeLearning(localValue, remoteValue);
    case 'dna_impacts': return mergeDnaImpacts(localValue, remoteValue);
    case 'preferences': return mergePreferences(localValue, remoteValue);
    case 'recipe_templates': return mergeRecipeTemplates(localValue, remoteValue);
    default: return localValue;
  }
}

export const CLOUD_STATE_KEYS: CloudStateKey[] = [
  'achievements',
  'weekly_challenges',
  'exams',
  'learning',
  'dna_impacts',
  'preferences',
  'recipe_templates',
];
