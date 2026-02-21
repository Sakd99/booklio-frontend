import api from './client';

export const automationsApi = {
  list: () => api.get('/automations').then((r) => r.data),

  get: (id: string) => api.get(`/automations/${id}`).then((r) => r.data),

  create: (data: any) => api.post('/automations', data).then((r) => r.data),

  update: (id: string, data: any) => api.patch(`/automations/${id}`, data).then((r) => r.data),

  toggle: (id: string) => api.patch(`/automations/${id}/toggle`).then((r) => r.data),

  remove: (id: string) => api.delete(`/automations/${id}`).then((r) => r.data),
};
