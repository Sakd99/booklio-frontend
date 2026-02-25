import { api } from './client';

export const aiAssistantApi = {
  chat: (body: {
    message: string;
    mode: string;
    history: { role: string; content: string }[];
    locale: string;
  }) =>
    api.post<{ reply: string }>('/ai-assistant/chat', body).then((r) => r.data),
};
