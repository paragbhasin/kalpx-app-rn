import { AUTH_KEYS, type StorageAdapter } from '@kalpx/api-client';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function getOrCreateGuestUUID(storage: StorageAdapter): Promise<string> {
  let uuid = await storage.getItem(AUTH_KEYS.guestUUID);
  if (!uuid) {
    uuid = generateUUID();
    await storage.setItem(AUTH_KEYS.guestUUID, uuid);
  }
  return uuid;
}
