import { api } from './client';

export const billingApi = {
  createCheckout: (planId: string) =>
    api.post<{ url: string }>('/billing/checkout', { planId }).then((r) => r.data),

  createPortal: () =>
    api.post<{ url: string }>('/billing/portal').then((r) => r.data),
};
