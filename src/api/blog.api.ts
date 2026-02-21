import api from './client';

export const blogApi = {
  listPublished: (page = 1, limit = 10) =>
    api.get(`/blog?page=${page}&limit=${limit}`).then((r) => r.data),

  getBySlug: (slug: string) =>
    api.get(`/blog/${slug}`).then((r) => r.data),
};
