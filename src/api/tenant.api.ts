import api from './client';

export const tenantApi = {
  getProfile: () => api.get('/tenant/profile').then((r) => r.data),

  updateProfile: (data: { name?: string; email?: string; phone?: string; timezone?: string }) =>
    api.patch('/tenant/profile', data).then((r) => r.data),

  getUsage: () => api.get('/tenant/usage').then((r) => r.data),

  getMembers: () => api.get('/tenant/members').then((r) => r.data),
};
