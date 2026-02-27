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
    industry?: string;
    websiteUrl?: string;
  }) => client.put('/ai-settings', data).then((r) => r.data),

  addFaq: (question: string, answer: string) =>
    client.post('/ai-settings/faq', { question, answer }).then((r) => r.data),

  updateFaq: (index: number, question: string, answer: string) =>
    client.put(`/ai-settings/faq/${index}`, { question, answer }).then((r) => r.data),

  removeFaq: (index: number) =>
    client.delete(`/ai-settings/faq/${index}`).then((r) => r.data),

  uploadDocuments: (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return client.post('/ai-settings/documents', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  removeDocument: (index: number) =>
    client.delete(`/ai-settings/documents/${index}`).then((r) => r.data),

  test: (message: string) =>
    client.post('/ai-settings/test', { message }).then((r) => r.data),
};
