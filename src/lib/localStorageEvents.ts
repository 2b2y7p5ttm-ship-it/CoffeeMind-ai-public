export const LOCAL_STORAGE_EVENT = 'coffeemind:local-storage-change';

export type LocalStorageChangeDetail<T = unknown> = {
  key: string;
  value: T;
};

export function dispatchLocalStorageChange<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<LocalStorageChangeDetail<T>>(LOCAL_STORAGE_EVENT, {
      detail: { key, value },
    }),
  );
}
