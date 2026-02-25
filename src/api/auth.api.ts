import api from './client';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api
      .post<AuthResponse>('/auth/register', data, {
        skipAuthRefresh: true,
        skipErrorToast: true,
      })
      .then((r) => r.data),

  login: (data: LoginPayload) =>
    api
      .post<AuthResponse>('/auth/login', data, {
        skipAuthRefresh: true,
        skipErrorToast: true,
      })
      .then((r) => r.data),

  refresh: (refreshToken: string) =>
    api
      .post<AuthResponse>(
        '/auth/refresh',
        { refreshToken },
        { skipAuthRefresh: true, skipErrorToast: true },
      )
      .then((r) => r.data),

  logout: (refreshToken: string) =>
    api
      .post('/auth/logout', { refreshToken }, { skipAuthRefresh: true })
      .then((r) => r.data),
};
