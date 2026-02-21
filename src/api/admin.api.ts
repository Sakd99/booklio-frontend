import api from './client';

export const adminApi = {
  getMetrics: () => api.get('/admin/metrics').then((r) => r.data),

  listPlans: () => api.get('/admin/plans').then((r) => r.data),

  createPlan: (data: any) => api.post('/admin/plans', data).then((r) => r.data),

  updatePlan: (id: string, data: any) => api.patch(`/admin/plans/${id}`, data).then((r) => r.data),

  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`).then((r) => r.data),

  listTenants: (page = 1, limit = 20) =>
    api.get(`/admin/tenants?page=${page}&limit=${limit}`).then((r) => r.data),

  getTenant: (id: string) =>
    api.get(`/admin/tenants/${id}`).then((r) => r.data),

  deleteTenant: (id: string) =>
    api.delete(`/admin/tenants/${id}`).then((r) => r.data),

  getTenantChannels: (id: string) =>
    api.get(`/admin/tenants/${id}/channels`).then((r) => r.data),

  getTenantConversations: (id: string, page = 1) =>
    api.get(`/admin/tenants/${id}/conversations?page=${page}`).then((r) => r.data),

  assignPlan: (tenantId: string, plan: string) =>
    api.post(`/admin/tenants/${tenantId}/plan`, { plan }).then((r) => r.data),

  activateTenant: (id: string) =>
    api.patch(`/admin/tenants/${id}/activate`).then((r) => r.data),

  deactivateTenant: (id: string) =>
    api.patch(`/admin/tenants/${id}/deactivate`).then((r) => r.data),

  // Blog management
  listBlogPosts: (page = 1, limit = 20) =>
    api.get(`/admin/blog?page=${page}&limit=${limit}`).then((r) => r.data),

  createBlogPost: (data: any) =>
    api.post('/admin/blog', data).then((r) => r.data),

  updateBlogPost: (id: string, data: any) =>
    api.patch(`/admin/blog/${id}`, data).then((r) => r.data),

  deleteBlogPost: (id: string) =>
    api.delete(`/admin/blog/${id}`).then((r) => r.data),
};
