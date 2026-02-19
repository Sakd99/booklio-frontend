import api from './client';

export const channelsApi = {
  list: () => api.get('/channels').then((r) => r.data),

  get: (id: string) => api.get(`/channels/${id}`).then((r) => r.data),

  connectInstagram: () =>
    api.post('/channels/instagram/connect').then((r) => r.data),

  connectTikTok: () =>
    api.post('/channels/tiktok/connect').then((r) => r.data),

  healthCheck: (id: string) =>
    api.post(`/channels/${id}/health-check`).then((r) => r.data),

  reconnect: (id: string) =>
    api.post(`/channels/${id}/reconnect`).then((r) => r.data),

  disconnect: (id: string) =>
    api.delete(`/channels/${id}`).then((r) => r.data),
};
