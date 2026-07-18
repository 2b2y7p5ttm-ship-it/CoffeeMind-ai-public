import type { Tasting } from '@/hooks/useTastings';
import { dispatchLocalStorageChange } from '@/lib/localStorageEvents';
import { RECIPE_TEMPLATES_STORAGE_KEY, RECIPE_TEMPLATES_UPDATED_AT_KEY } from '@/lib/cloudState';
import { canonicalizeBrewMethod } from '@/lib/brewMethodI18n';

export type TastingMode = 'quick' | 'professional';

export interface RecipeTemplate {
  id: string;
  method: string;
  doseGrams: string;
  beverageWeightGrams: string;
  brewTimeSeconds: string;
  waterTemperatureCelsius: string;
  bloomSeconds: string;
  targetRatio: string;
  custom?: boolean;
}

export interface RecentTastingValues {
  coffees: string[];
  roasters: string[];
  countries: string[];
  processes: string[];
  brewMethods: string[];
  grinders: string[];
  grindSettings: string[];
  waters: string[];
}

export const BUILT_IN_RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'v60-balanced',
    method: 'V60',
    doseGrams: '20',
    beverageWeightGrams: '300',
    brewTimeSeconds: '180',
    waterTemperatureCelsius: '94',
    bloomSeconds: '45',
    targetRatio: '15',
  },
  {
    id: 'aeropress-classic',
    method: 'AeroPress',
    doseGrams: '15',
    beverageWeightGrams: '225',
    brewTimeSeconds: '120',
    waterTemperatureCelsius: '90',
    bloomSeconds: '30',
    targetRatio: '15',
  },
  {
    id: 'espresso-modern',
    method: 'Espresso',
    doseGrams: '18',
    beverageWeightGrams: '36',
    brewTimeSeconds: '28',
    waterTemperatureCelsius: '93',
    bloomSeconds: '',
    targetRatio: '2',
  },
  {
    id: 'chemex-clean',
    method: 'Chemex',
    doseGrams: '30',
    beverageWeightGrams: '500',
    brewTimeSeconds: '270',
    waterTemperatureCelsius: '94',
    bloomSeconds: '45',
    targetRatio: '16.7',
  },
  {
    id: 'french-press',
    method: 'French Press',
    doseGrams: '30',
    beverageWeightGrams: '450',
    brewTimeSeconds: '240',
    waterTemperatureCelsius: '93',
    bloomSeconds: '',
    targetRatio: '15',
  },
];

const CUSTOM_RECIPE_STORAGE_KEY = RECIPE_TEMPLATES_STORAGE_KEY;

function uniqueRecent(values: Array<string | undefined>, limit = 5) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const value = raw?.trim();
    if (!value) continue;
    const key = value.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
    if (result.length >= limit) break;
  }

  return result;
}

export function getRecentTastingValues(tastings: Tasting[]): RecentTastingValues {
  const ordered = [...tastings].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return {
    coffees: uniqueRecent(ordered.map((item) => item.coffeeName)),
    roasters: uniqueRecent(ordered.map((item) => item.roaster)),
    countries: uniqueRecent(ordered.map((item) => item.country)),
    processes: uniqueRecent(ordered.map((item) => item.processing || item.process)),
    brewMethods: uniqueRecent(ordered.map((item) => canonicalizeBrewMethod(item.brewMethod || item.brewingMethod || ''))),
    grinders: uniqueRecent(ordered.map((item) => item.grinderModel || item.grinder)),
    grindSettings: uniqueRecent(ordered.map((item) => item.grindSetting)),
    waters: uniqueRecent(ordered.map((item) => item.waterName)),
  };
}

function normalizedCoffeeKey(value: string) {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function findPreviousBrew(
  tastings: Tasting[],
  coffeeName: string,
  roaster: string,
  excludeId?: string,
): Tasting | undefined {
  const coffeeKey = normalizedCoffeeKey(coffeeName);
  const roasterKey = normalizedCoffeeKey(roaster);
  if (!coffeeKey) return undefined;

  return [...tastings]
    .filter((item) => {
      if (item.id === excludeId) return false;
      if (normalizedCoffeeKey(item.coffeeName) !== coffeeKey) return false;
      if (roasterKey && normalizedCoffeeKey(item.roaster) && normalizedCoffeeKey(item.roaster) !== roasterKey) return false;
      return true;
    })
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

export function calculateRatio(dose: string, beverageWeight: string): number | null {
  const doseValue = Number(dose.replace(',', '.'));
  const beverageValue = Number(beverageWeight.replace(',', '.'));
  if (!Number.isFinite(doseValue) || !Number.isFinite(beverageValue) || doseValue <= 0 || beverageValue <= 0) return null;
  return beverageValue / doseValue;
}

export function calculateBeverageWeight(dose: string, targetRatio: string): string | null {
  const doseValue = Number(dose.replace(',', '.'));
  const ratioValue = Number(targetRatio.replace(',', '.'));
  if (!Number.isFinite(doseValue) || !Number.isFinite(ratioValue) || doseValue <= 0 || ratioValue <= 0) return null;
  const result = doseValue * ratioValue;
  return Number.isInteger(result) ? String(result) : result.toFixed(1);
}

export function readCustomRecipeTemplates(): RecipeTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_RECIPE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecipeTemplate[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.method).slice(0, 5) : [];
  } catch (error) {
    console.warn('Failed to read custom recipe templates:', error);
    return [];
  }
}

export function writeCustomRecipeTemplates(templates: RecipeTemplate[]) {
  try {
    const nextTemplates = templates.slice(0, 5);
    window.localStorage.setItem(CUSTOM_RECIPE_STORAGE_KEY, JSON.stringify(nextTemplates));
    window.localStorage.setItem(RECIPE_TEMPLATES_UPDATED_AT_KEY, new Date().toISOString());
    dispatchLocalStorageChange(CUSTOM_RECIPE_STORAGE_KEY, nextTemplates);
  } catch (error) {
    console.warn('Failed to save custom recipe templates:', error);
  }
}

export function recipeFromTasting(tasting: Tasting): RecipeTemplate {
  const ratio = calculateRatio(
    tasting.doseGrams || tasting.dose || '',
    tasting.beverageWeightGrams || tasting.yield || '',
  );

  return {
    id: `history-${tasting.id}`,
    method: canonicalizeBrewMethod(tasting.brewMethod || tasting.brewingMethod || 'V60'),
    doseGrams: tasting.doseGrams || tasting.dose || '',
    beverageWeightGrams: tasting.beverageWeightGrams || tasting.yield || '',
    brewTimeSeconds: tasting.brewTimeSeconds || tasting.time || '',
    waterTemperatureCelsius: tasting.waterTemperatureCelsius || tasting.temperature || '',
    bloomSeconds: tasting.bloomSeconds || '',
    targetRatio: ratio ? ratio.toFixed(1) : '',
  };
}
