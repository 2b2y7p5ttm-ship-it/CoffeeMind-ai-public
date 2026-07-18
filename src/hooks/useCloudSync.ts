import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Tasting } from '@/hooks/useTastings';
import type { BookRating } from '@/hooks/useBooks';
import type { UserProfile } from '@/hooks/useProfile';
import { resolveSyncedProfileName } from '@/lib/profileIdentity';
import {
  CLOUD_STATE_KEYS,
  CLOUD_STATE_TABLE,
  mergeCloudState,
  MONITORED_LOCAL_KEYS,
  readLocalCloudState,
  writeLocalCloudState,
  type CloudStateKey,
} from '@/lib/cloudState';
import { LOCAL_STORAGE_EVENT, type LocalStorageChangeDetail } from '@/lib/localStorageEvents';

const TASTINGS_KEY = 'coffee_journal_tastings';
const BOOKS_KEY = 'coffeemind_book_ratings';
const PROFILE_KEY = 'coffee_journal_profile';

export type CloudSyncStatus = 'local' | 'loading' | 'synced' | 'syncing' | 'error';

export type CloudSyncSnapshot = {
  status: CloudSyncStatus;
  lastError: string | null;
};

let cloudSyncSnapshot: CloudSyncSnapshot = {
  status: 'local',
  lastError: null,
};

const cloudSyncListeners = new Set<() => void>();

function publishCloudSync(patch: Partial<CloudSyncSnapshot>) {
  const nextSnapshot = { ...cloudSyncSnapshot, ...patch };
  if (
    nextSnapshot.status === cloudSyncSnapshot.status
    && nextSnapshot.lastError === cloudSyncSnapshot.lastError
  ) return;

  cloudSyncSnapshot = nextSnapshot;
  cloudSyncListeners.forEach((listener) => listener());
}

function subscribeCloudSync(listener: () => void) {
  cloudSyncListeners.add(listener);
  return () => cloudSyncListeners.delete(listener);
}

function getCloudSyncSnapshot() {
  return cloudSyncSnapshot;
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: { key, value } }));
}

function tastingToRow(t: Tasting, userId: string) {
  return {
    id: t.id,
    user_id: userId,
    created_at: t.createdAt,
    updated_at: t.updatedAt || t.createdAt,
    coffee_name: t.coffeeName,
    country: t.country,
    region: t.region,
    farm: t.farm,
    variety: t.variety,
    processing: t.processing || t.process || '',
    roaster: t.roaster,
    roast_date: t.roastDate,
    producer: t.producer || '',
    washing_station: t.washingStation || '',
    elevation_meters: t.elevationMeters || '',
    harvest_year: t.harvestYear || '',
    lot_number: t.lotNumber || '',
    brew_method: t.brewMethod || t.brewingMethod || '',
    dose_grams: t.doseGrams || t.dose || '',
    beverage_weight_grams: t.beverageWeightGrams || t.yield || '',
    brew_time_seconds: t.brewTimeSeconds || t.time || '',
    water_temperature_celsius: t.waterTemperatureCelsius || t.temperature || '',
    grinder_model: t.grinderModel || t.grinder || '',
    grind_setting: t.grindSetting || '',
    water_name: t.waterName || '',
    water_tds_ppm: t.waterTdsPpm || '',
    bloom_seconds: t.bloomSeconds || '',
    dry_aroma: t.dryAroma || t.aroma || '',
    wet_aroma: t.wetAroma || '',
    first_impression: t.firstImpression || t.flavor || '',
    aroma_score: t.aromaScore ?? 5,
    flavor_score: t.flavorScore ?? 5,
    acidity: t.acidity,
    sweetness: t.sweetness,
    bitterness: t.bitterness,
    body: t.body,
    balance: t.balance,
    clean_cup: t.cleanCup,
    aftertaste: t.aftertaste ?? t.aftertasteScore ?? 0,
    top_three_descriptors: t.topThreeDescriptors || [],
    additional_descriptors: t.additionalDescriptors || t.flavorDescriptors || [],
    notes: t.notes,
    overall_score: t.overallScore,
    favorite: Boolean(t.favorite),
    photo_url: t.photoUrl || '',
    photos: t.photos || [],
  };
}

function rowToTasting(row: Record<string, any>): Tasting {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    coffeeName: row.coffee_name || '',
    country: row.country || '',
    region: row.region || '',
    farm: row.farm || '',
    variety: row.variety || '',
    processing: row.processing || '',
    roaster: row.roaster || '',
    roastDate: row.roast_date || '',
    producer: row.producer || '',
    washingStation: row.washing_station || '',
    elevationMeters: row.elevation_meters || '',
    harvestYear: row.harvest_year || '',
    lotNumber: row.lot_number || '',
    brewMethod: row.brew_method || '',
    doseGrams: row.dose_grams || '',
    beverageWeightGrams: row.beverage_weight_grams || '',
    brewTimeSeconds: row.brew_time_seconds || '',
    waterTemperatureCelsius: row.water_temperature_celsius || '',
    grinderModel: row.grinder_model || '',
    grindSetting: row.grind_setting || '',
    waterName: row.water_name || '',
    waterTdsPpm: row.water_tds_ppm || '',
    bloomSeconds: row.bloom_seconds || '',
    dryAroma: row.dry_aroma || '',
    wetAroma: row.wet_aroma || '',
    firstImpression: row.first_impression || '',
    aromaScore: row.aroma_score ?? 5,
    flavorScore: row.flavor_score ?? 5,
    acidity: row.acidity ?? 5,
    sweetness: row.sweetness ?? 5,
    bitterness: row.bitterness ?? 5,
    body: row.body ?? 5,
    balance: row.balance ?? 5,
    cleanCup: row.clean_cup ?? 5,
    aftertaste: row.aftertaste ?? 5,
    topThreeDescriptors: row.top_three_descriptors || [],
    additionalDescriptors: row.additional_descriptors || [],
    notes: row.notes || '',
    overallScore: row.overall_score ?? 0,
    favorite: Boolean(row.favorite),
    photoUrl: row.photo_url || '',
    photos: row.photos || [],
  };
}

function bookToRow(book: BookRating, userId: string) {
  return {
    id: book.id,
    user_id: userId,
    created_at: book.createdAt,
    updated_at: book.updatedAt || book.createdAt,
    title: book.title,
    author: book.author,
    status: book.status,
    rating: book.rating,
    mood: book.mood,
    quote: book.quote,
    notes: book.notes,
    paired_coffee_id: book.pairedCoffeeId || null,
    paired_coffee_name: book.pairedCoffeeName || '',
    favorite: Boolean(book.favorite),
  };
}

function rowToBook(row: Record<string, any>): BookRating {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
    title: row.title || '',
    author: row.author || '',
    status: row.status || 'finished',
    rating: row.rating ?? 8,
    mood: row.mood || '',
    quote: row.quote || '',
    notes: row.notes || '',
    pairedCoffeeId: row.paired_coffee_id || '',
    pairedCoffeeName: row.paired_coffee_name || '',
    favorite: Boolean(row.favorite),
  };
}

function mergeById<T extends { id: string; createdAt: string; updatedAt?: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  [...remote, ...local].forEach((item) => {
    const current = map.get(item.id);
    if (!current) {
      map.set(item.id, item);
      return;
    }
    const currentDate = new Date(current.updatedAt || current.createdAt).getTime();
    const itemDate = new Date(item.updatedAt || item.createdAt).getTime();
    if (itemDate >= currentDate) map.set(item.id, item);
  });
  return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


function cloudStateMigrationMessage(error: any): string {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  if (code === '42P01' || message.includes(CLOUD_STATE_TABLE)) {
    return 'Cloud progress sync is not configured. Run supabase/cloud-sync-2.sql in Supabase SQL Editor.';
  }
  return message || 'Cloud progress sync failed';
}

function mergeRemoteAppState(rows: Array<Record<string, any>>) {
  const remoteMap = new Map<CloudStateKey, unknown>();
  rows.forEach((row) => {
    if (CLOUD_STATE_KEYS.includes(row.state_key as CloudStateKey)) {
      remoteMap.set(row.state_key as CloudStateKey, row.state_value);
    }
  });

  return CLOUD_STATE_KEYS.map((stateKey) => ({
    stateKey,
    value: mergeCloudState(stateKey, readLocalCloudState(stateKey), remoteMap.get(stateKey)),
  }));
}

function cloudStateRowsForUpsert(userId: string, entries?: Array<{ stateKey: CloudStateKey; value: unknown }>) {
  const now = new Date().toISOString();
  const source = entries ?? CLOUD_STATE_KEYS.map((stateKey) => ({ stateKey, value: readLocalCloudState(stateKey) }));
  return source
    .filter((entry) => entry.value != null)
    .map((entry) => ({
      user_id: userId,
      state_key: entry.stateKey,
      state_value: entry.value,
      updated_at: now,
    }));
}

export function useCloudSyncEngine() {
  const { user, configured } = useAuth();
  const setStatus = (status: CloudSyncStatus) => publishCloudSync({ status });
  const setLastError = (lastError: string | null) => publishCloudSync({ lastError });
  const suppressRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!supabase || !user) {
      setLastError(null);
      setStatus('local');
      return;
    }

    let cancelled = false;

    const fullSync = async () => {
      setStatus('loading');
      setLastError(null);
      try {
        const [tastingsResult, booksResult, profileResult, appStateResult] = await Promise.all([
          supabase.from('tastings').select('*').order('created_at', { ascending: false }),
          supabase.from('book_ratings').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from(CLOUD_STATE_TABLE).select('state_key,state_value,updated_at').eq('user_id', user.id),
        ]);
        if (tastingsResult.error) throw tastingsResult.error;
        if (booksResult.error) throw booksResult.error;
        if (profileResult.error) throw profileResult.error;
        if (appStateResult.error) throw new Error(cloudStateMigrationMessage(appStateResult.error));
        if (cancelled) return;

        const localTastings = readLocal<Tasting[]>(TASTINGS_KEY, []);
        const localBooks = readLocal<BookRating[]>(BOOKS_KEY, []);
        const localProfile = readLocal<UserProfile>(PROFILE_KEY, { name: '' });
        const remoteTastings = (tastingsResult.data || []).map(rowToTasting);
        const remoteBooks = (booksResult.data || []).map(rowToBook);
        const mergedTastings = mergeById(localTastings, remoteTastings);
        const mergedBooks = mergeById(localBooks, remoteBooks);
        const mergedAppState = mergeRemoteAppState(appStateResult.data || []);
        const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '';
        const mergedProfile: UserProfile = {
          ...localProfile,
          ...(profileResult.data ? {
            avatarColor: profileResult.data.avatar_color || localProfile.avatarColor,
            joinedAt: profileResult.data.created_at || localProfile.joinedAt,
          } : {}),
          name: resolveSyncedProfileName({
            localName: localProfile.name,
            remoteName: profileResult.data?.name,
            metadataName,
            email: user.email,
          }),
        };

        suppressRef.current = true;
        writeLocal(TASTINGS_KEY, mergedTastings);
        writeLocal(BOOKS_KEY, mergedBooks);
        writeLocal(PROFILE_KEY, mergedProfile);
        mergedAppState.forEach(({ stateKey, value }) => writeLocalCloudState(stateKey, value));

        await Promise.all([
          mergedTastings.length
            ? supabase.from('tastings').upsert(mergedTastings.map((t) => tastingToRow(t, user.id)))
            : Promise.resolve({ error: null }),
          mergedBooks.length
            ? supabase.from('book_ratings').upsert(mergedBooks.map((b) => bookToRow(b, user.id)))
            : Promise.resolve({ error: null }),
          supabase.from('profiles').upsert({
            id: user.id,
            name: mergedProfile.name,
            avatar_color: mergedProfile.avatarColor || '#D9A35F',
          }),
          supabase.from(CLOUD_STATE_TABLE).upsert(
            cloudStateRowsForUpsert(user.id, mergedAppState),
            { onConflict: 'user_id,state_key' },
          ),
        ]).then((results) => {
          const error = results.find((result: any) => result.error)?.error;
          if (error) throw error;
        });

        setStatus('synced');
        window.setTimeout(() => { suppressRef.current = false; }, 0);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Cloud sync failed';
        console.warn('CoffeeMind cloud sync:', error);
        setLastError(message);
        setStatus('error');
        suppressRef.current = false;
      }
    };

    void fullSync();

    const syncLocalState = async () => {
      if (suppressRef.current || !supabase) return;
      setStatus('syncing');
      setLastError(null);
      try {
        const tastings = readLocal<Tasting[]>(TASTINGS_KEY, []);
        const books = readLocal<BookRating[]>(BOOKS_KEY, []);
        const profile = readLocal<UserProfile>(PROFILE_KEY, { name: '' });

        const [remoteTastingIds, remoteBookIds] = await Promise.all([
          supabase.from('tastings').select('id'),
          supabase.from('book_ratings').select('id'),
        ]);
        if (remoteTastingIds.error) throw remoteTastingIds.error;
        if (remoteBookIds.error) throw remoteBookIds.error;

        const localTastingIds = new Set(tastings.map((item) => item.id));
        const localBookIds = new Set(books.map((item) => item.id));
        const deletedTastingIds = (remoteTastingIds.data || []).map((item) => item.id).filter((id) => !localTastingIds.has(id));
        const deletedBookIds = (remoteBookIds.data || []).map((item) => item.id).filter((id) => !localBookIds.has(id));

        const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '';
        const syncedName = resolveSyncedProfileName({
          localName: profile.name,
          metadataName,
          email: user.email,
        });
        const operations: PromiseLike<any>[] = [
          supabase.from('profiles').upsert({ id: user.id, name: syncedName, avatar_color: profile.avatarColor || '#D9A35F' }),
          supabase.from(CLOUD_STATE_TABLE).upsert(
            cloudStateRowsForUpsert(user.id),
            { onConflict: 'user_id,state_key' },
          ),
        ];
        if (tastings.length) operations.push(supabase.from('tastings').upsert(tastings.map((t) => tastingToRow(t, user.id))));
        if (books.length) operations.push(supabase.from('book_ratings').upsert(books.map((b) => bookToRow(b, user.id))));
        if (deletedTastingIds.length) operations.push(supabase.from('tastings').delete().in('id', deletedTastingIds));
        if (deletedBookIds.length) operations.push(supabase.from('book_ratings').delete().in('id', deletedBookIds));

        const results = await Promise.all(operations);
        const error = results.find((result: any) => result.error)?.error;
        if (error) throw error;
        setStatus('synced');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Cloud sync failed';
        console.warn('CoffeeMind cloud sync:', error);
        setLastError(message);
        setStatus('error');
      }
    };

    const syncableKeys = new Set([TASTINGS_KEY, BOOKS_KEY, PROFILE_KEY, ...MONITORED_LOCAL_KEYS]);
    const onLocalChange = (event: Event) => {
      if (suppressRef.current) return;
      const detail = (event as CustomEvent<LocalStorageChangeDetail>).detail;
      if (detail?.key && !syncableKeys.has(detail.key)) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => void syncLocalState(), 700);
    };
    const onResume = () => {
      if (document.visibilityState === 'visible' && !suppressRef.current) void fullSync();
    };

    window.addEventListener(LOCAL_STORAGE_EVENT, onLocalChange);
    window.addEventListener('online', onResume);
    document.addEventListener('visibilitychange', onResume);
    return () => {
      cancelled = true;
      window.removeEventListener(LOCAL_STORAGE_EVENT, onLocalChange);
      window.removeEventListener('online', onResume);
      document.removeEventListener('visibilitychange', onResume);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [user?.id, configured]);

}

export function useCloudSync(): CloudSyncSnapshot {
  return useSyncExternalStore(
    subscribeCloudSync,
    getCloudSyncSnapshot,
    getCloudSyncSnapshot,
  );
}
