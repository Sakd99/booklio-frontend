import client from './client';

export const conversationsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    channelId?: string;
    state?: string;
    active?: boolean;
  }) => client.get('/conversations', { params }).then((r) => r.data),

  getById: (id: string) =>
    client.get(`/conversations/${id}`).then((r) => r.data),

  sendReply: (id: string, text: string) =>
    client.post(`/conversations/${id}/reply`, { text }).then((r) => r.data),

  toggleAi: (id: string, isActive: boolean) =>
    client.patch(`/conversations/${id}`, { isActive }).then((r) => r.data),
};
