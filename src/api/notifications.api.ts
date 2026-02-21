import api from './client';

export const notificationsApi = {
  list: (page = 1, limit = 20) =>
    api.get(`/notifications?page=${page}&limit=${limit}`).then((r) => r.data),

  unreadCount: () =>
    api.get('/notifications/unread-count').then((r) => r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),
};
