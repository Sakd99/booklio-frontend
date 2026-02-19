import api from './client';

export const adminApi = {
  getMetrics: () => api.get('/admin/metrics').then((r) => r.data),

  listPlans: () => api.get('/admin/plans').then((r) => r.data),

  listTenants: (page = 1, limit = 20) =>
    api.get(`/admin/tenants?page=${page}&limit=${limit}`).then((r) => r.data),

  getTenant: (id: string) =>
    api.get(`/admin/tenants/${id}`).then((r) => r.data),

  assignPlan: (tenantId: string, plan: string) =>
    api.post(`/admin/tenants/${tenantId}/plan`, { plan }).then((r) => r.data),

  activateTenant: (id: string) =>
    api.patch(`/admin/tenants/${id}/activate`).then((r) => r.data),

  deactivateTenant: (id: string) =>
    api.patch(`/admin/tenants/${id}/deactivate`).then((r) => r.data),
};
