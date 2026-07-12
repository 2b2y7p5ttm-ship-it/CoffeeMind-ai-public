import { useLocalStorage } from './useLocalStorage';

export interface Tasting {
  id: string;
  createdAt: string;
  updatedAt?: string;

  // ── Coffee info ───────────────────────────────────────────────────────────
  coffeeName: string;
  country: string;
  region: string;
  farm: string;
  variety: string;
  processing: string;
  roaster: string;
  roastDate: string;

  // ── Brewing ───────────────────────────────────────────────────────────────
  brewMethod: string;
  doseGrams: string;
  beverageWeightGrams: string;
  brewTimeSeconds: string;
  waterTemperatureCelsius: string;

  // ── Sensory text ──────────────────────────────────────────────────────────
  dryAroma: string;
  wetAroma: string;
  firstImpression: string;

  // ── Scores 1–10 ───────────────────────────────────────────────────────────
  acidity: number;
  sweetness: number;
  bitterness: number;
  body: number;
  balance: number;
  cleanCup: number;
  aftertaste: number;

  // ── Flavor ────────────────────────────────────────────────────────────────
  topThreeDescriptors: string[];
  additionalDescriptors: string[];
  notes: string;
  overallScore: number;

  // ── Meta ──────────────────────────────────────────────────────────────────
  favorite?: boolean;
  photoUrl?: string;
  photos?: { type: string; url: string }[];

  // ── Legacy backward-compat (old schema) ───────────────────────────────────
  process?: string;
  brewingMethod?: string;
  dose?: string;
  yield?: string;
  time?: string;
  temperature?: string;
  grinder?: string;
  aroma?: string;
  flavor?: string;
  aftertasteScore?: number;
  flavorDescriptors?: string[];
}

function createTastingId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `tasting-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useTastings() {
  const [tastings, setTastings] = useLocalStorage<Tasting[]>('coffee_journal_tastings', []);

  const addTasting = (tasting: Omit<Tasting, 'id' | 'createdAt'>) => {
    const newTasting: Tasting = {
      ...tasting,
      id: createTastingId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTastings((prev) => [newTasting, ...prev]);
    return newTasting;
  };

  const updateTasting = (id: string, patch: Partial<Tasting>) => {
    setTastings((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)));
  };

  const deleteTasting = (id: string) => {
    setTastings((prev) => prev.filter((t) => t.id !== id));
  };

  const getTasting = (id: string) => tastings.find((t) => t.id === id);

  return { tastings, addTasting, updateTasting, deleteTasting, getTasting };
}
