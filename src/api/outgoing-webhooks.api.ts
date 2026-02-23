import { api } from './client';

export interface OutgoingWebhook {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  isActive: boolean;
  lastCalledAt: string | null;
  lastStatus: number | null;
  createdAt: string;
}

export const outgoingWebhooksApi = {
  list: (): Promise<OutgoingWebhook[]> =>
    api.get('/outgoing-webhooks').then((r) => r.data),

  create: (data: { name: string; url: string; secret?: string; events: string[] }): Promise<OutgoingWebhook> =>
    api.post('/outgoing-webhooks', data).then((r) => r.data),

  update: (id: string, data: Partial<OutgoingWebhook>): Promise<OutgoingWebhook> =>
    api.put(`/outgoing-webhooks/${id}`, data).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/outgoing-webhooks/${id}`).then((r) => r.data),

  test: (id: string): Promise<{ status: number; ok: boolean }> =>
    api.post(`/outgoing-webhooks/${id}/test`).then((r) => r.data),
};
