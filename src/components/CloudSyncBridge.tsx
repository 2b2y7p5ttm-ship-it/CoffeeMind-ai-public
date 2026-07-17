import { useCloudSyncEngine } from '@/hooks/useCloudSync';

export function CloudSyncBridge() {
  useCloudSyncEngine();
  return null;
}
