import api from './client';

export interface CreateBookingPayload {
  serviceId: string;
  customerName: string;
  customerContact: string;
  startsAt: string;
  notes?: string;
}

export interface BookingFilters {
  status?: string;
  serviceId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const bookingsApi = {
  list: (filters?: BookingFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.serviceId) params.set('serviceId', filters.serviceId);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    return api.get(`/bookings?${params}`).then((r) => r.data);
  },

  get: (id: string) => api.get(`/bookings/${id}`).then((r) => r.data),

  create: (data: CreateBookingPayload) =>
    api.post('/bookings', data).then((r) => r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data),
};
