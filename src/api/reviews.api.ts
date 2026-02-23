import { api } from './client';

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  channel: string | null;
  isPublic: boolean;
  createdAt: string;
  appointmentId: string;
}

export interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  avgRating: number;
}

export interface ReviewStats {
  total: number;
  avgRating: number;
  distribution: { star: number; count: number }[];
}

export const reviewsApi = {
  list: (page = 1, limit = 20): Promise<ReviewsResponse> =>
    api.get('/reviews', { params: { page, limit } }).then((r) => r.data),

  stats: (): Promise<ReviewStats> =>
    api.get('/reviews/stats').then((r) => r.data),

  togglePublic: (id: string, isPublic: boolean): Promise<Review> =>
    api.patch(`/reviews/${id}/visibility`, { isPublic }).then((r) => r.data),
};
