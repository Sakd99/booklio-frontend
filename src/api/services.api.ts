import api from './client';

export type ServiceType = 'BOOKING' | 'PRODUCT';

export interface Availability {
  dayOfWeek: number; // 0=Sun, 1=Mon...
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface CreateServicePayload {
  type?: ServiceType;
  name: string;
  description?: string;
  durationMinutes?: number;
  bufferMinutes?: number;
  price: number;
  currency?: string;
  availabilities?: Availability[];
}

export const servicesApi = {
  list: () => api.get('/services').then((r) => r.data),

  get: (id: string) => api.get(`/services/${id}`).then((r) => r.data),

  create: (data: CreateServicePayload) =>
    api.post('/services', data).then((r) => r.data),

  update: (id: string, data: Partial<CreateServicePayload>) =>
    api.patch(`/services/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/services/${id}`).then((r) => r.data),

  getSlots: (id: string, date: string) =>
    api.get(`/services/${id}/slots?date=${date}`).then((r) => r.data),
};
