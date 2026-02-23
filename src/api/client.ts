import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = '/api';

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → try refresh, then retry once
let refreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    
    // Handle 401 with refresh token
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
      if (refreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((t) => {
            original.headers.Authorization = `Bearer ${t}`;
            resolve(api(original));
          });
        });
      }
      refreshing = true;
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken });
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        refreshQueue.forEach((fn) => fn(newToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        refreshing = false;
      }
    }

    // Show error toast for non-401 errors (unless explicitly silenced)
    if (!original?.skipErrorToast) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'An error occurred';
      if (err.response?.status === 403) {
        toast.error('Access denied');
      } else if (err.response?.status === 404) {
        toast.error('Resource not found');
      } else if (err.response?.status === 500) {
        toast.error('Server error. Please try again.');
      } else if (err.response?.status >= 400) {
        toast.error(message);
      } else if (!navigator.onLine) {
        toast.error('No internet connection');
      }
    }

    return Promise.reject(err);
  },
);

export default api;
