import client from './client';

export const aiSettingsApi = {
  get: () => client.get('/ai-settings').then((r) => r.data),

  update: (data: {
    businessDesc?: string;
    aiTone?: string;
    customPrompt?: string;
    language?: string;
    autoReply?: boolean;
    greetingMsg?: string;
    fallbackMsg?: string;
    engagementGoals?: string[];
  }) => client.put('/ai-settings', data).then((r) => r.data),

  addFaq: (question: string, answer: string) =>
    client.post('/ai-settings/faq', { question, answer }).then((r) => r.data),

  removeFaq: (index: number) =>
    client.delete(`/ai-settings/faq/${index}`).then((r) => r.data),

  test: (message: string) =>
    client.post('/ai-settings/test', { message }).then((r) => r.data),
};
