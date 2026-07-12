import { useCloudSync } from '@/hooks/useCloudSync';

export function CloudSyncBridge() {
  useCloudSync();
  return null;
}
