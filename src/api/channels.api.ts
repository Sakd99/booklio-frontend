import api from './client';

export const channelsApi = {
  list: () => api.get('/channels').then((r) => r.data),

  get: (id: string) => api.get(`/channels/${id}`).then((r) => r.data),

  connectInstagram: () =>
    api.post('/channels/instagram/connect').then((r) => r.data),

  connectTikTok: () =>
    api.post('/channels/tiktok/connect').then((r) => r.data),

  connectWhatsApp: (data: { phoneNumberId: string; accessToken: string; businessName?: string }) =>
    api.post('/channels/whatsapp/connect', data).then((r) => r.data),

  connectTelegram: (data: { botToken: string; botName?: string }) =>
    api.post('/channels/telegram/connect', data).then((r) => r.data),

  connectMessenger: (data: { pageId: string; pageAccessToken: string; pageName?: string }) =>
    api.post('/channels/messenger/connect', data).then((r) => r.data),

  healthCheck: (id: string) =>
    api.post(`/channels/${id}/health-check`).then((r) => r.data),

  reconnect: (id: string) =>
    api.post(`/channels/${id}/reconnect`).then((r) => r.data),

  disconnect: (id: string) =>
    api.delete(`/channels/${id}`).then((r) => r.data),
};
