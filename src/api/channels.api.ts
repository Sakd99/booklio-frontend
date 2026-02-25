import api from './client';

export const channelsApi = {
  list: () => api.get('/channels').then((r) => r.data),

  get: (id: string) => api.get(`/channels/${id}`).then((r) => r.data),

  // --- OAuth channels (one-click) ---

  connectInstagram: () =>
    api.post('/channels/instagram/connect').then((r) => r.data),

  connectTikTok: () =>
    api.post('/channels/tiktok/connect').then((r) => r.data),

  // WhatsApp Embedded Signup - returns { appId, configId, state }
  connectWhatsApp: () =>
    api.post('/channels/whatsapp/connect').then((r) => r.data),

  // WhatsApp callback - sends code + IDs from FB SDK to backend
  whatsappCallback: (data: {
    code: string;
    wabaId: string;
    phoneNumberId: string;
    state: string;
  }) => api.post('/channels/whatsapp/callback', data).then((r) => r.data),

  // Messenger OAuth - returns { url }
  connectMessenger: () =>
    api.post('/channels/messenger/connect').then((r) => r.data),

  // Get stored pages list after Messenger OAuth callback
  getMessengerPages: (key: string) =>
    api.get(`/channels/messenger/pages?key=${key}`).then((r) => r.data),

  // Select a page to connect as Messenger channel
  messengerSelectPage: (data: { pagesKey: string; pageId: string }) =>
    api.post('/channels/messenger/select-page', data).then((r) => r.data),

  // --- Telegram (token-based) ---

  connectTelegram: (data: { botToken: string; botName?: string }) =>
    api.post('/channels/telegram/connect', data).then((r) => r.data),

  // --- Utility ---

  healthCheck: (id: string) =>
    api.post(`/channels/${id}/health-check`).then((r) => r.data),

  reconnect: (id: string) =>
    api.post(`/channels/${id}/reconnect`).then((r) => r.data),

  disconnect: (id: string) =>
    api.delete(`/channels/${id}`).then((r) => r.data),

  updateMode: (id: string, aiMode: string) =>
    api.patch(`/channels/${id}/mode`, { aiMode }).then((r) => r.data),
};
