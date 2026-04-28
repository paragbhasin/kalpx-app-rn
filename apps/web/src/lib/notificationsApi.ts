import { api } from './api';
import type { NotificationItem } from '@kalpx/types';

interface NotificationsResponse {
  results: {
    notifications: NotificationItem[];
    count: number;
  };
}

export async function fetchNotifications(page = 1, limit = 20): Promise<{ items: NotificationItem[]; count: number }> {
  const res = await api.get<NotificationsResponse>(`/notifications/?page=${page}&page_size=${limit}`);
  return {
    items: res.data?.results?.notifications ?? [],
    count: res.data?.results?.count ?? 0,
  };
}

export async function markNotificationsRead(ids: number[]): Promise<void> {
  await api.post('/notifications/mark-read/', { ids });
}
