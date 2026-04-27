export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationsInboxState {
  loading: boolean;
  data: NotificationItem[];
  error: string | null;
  page: number;
  hasMore: boolean;
}
