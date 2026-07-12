import { useCallback, useEffect, useState } from 'react';

const LOCAL_STORAGE_EVENT = 'coffeemind:local-storage-change';

type LocalStorageChangeDetail<T = unknown> = {
  key: string;
  value: T;
};

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue;

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => readStoredValue(key, initialValue));

  useEffect(() => {
    const syncValue = (nextValue?: T) => {
      setStoredValue(nextValue === undefined ? readStoredValue(key, initialValue) : nextValue);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) syncValue();
    };

    const handleLocalStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<LocalStorageChangeDetail<T>>;
      if (customEvent.detail?.key === key) syncValue(customEvent.detail.value);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(LOCAL_STORAGE_EVENT, handleLocalStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LOCAL_STORAGE_EVENT, handleLocalStorageChange);
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((currentValue: T) => T)) => {
      if (typeof window === 'undefined') return;

      try {
        // Read the latest persisted value first. This prevents separate hook
        // instances from updating stale copies of the same data.
        const currentValue = readStoredValue(key, initialValue);
        const valueToStore = value instanceof Function ? value(currentValue) : value;

        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        setStoredValue(valueToStore);

        // The native "storage" event is not fired in the same browser tab,
        // so notify every other useLocalStorage instance explicitly.
        window.dispatchEvent(
          new CustomEvent<LocalStorageChangeDetail<T>>(LOCAL_STORAGE_EVENT, {
            detail: { key, value: valueToStore },
          }),
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue],
  );

  return [storedValue, setValue] as const;
}
