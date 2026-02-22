import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  exp: number;
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

function decodeUser(token: string): AuthUser | null {
  try {
    const p = jwtDecode<JwtPayload>(token);
    return { id: p.sub, email: p.email, role: p.role, tenantId: p.tenantId };
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAuth: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          accessToken,
          refreshToken,
          user: decodeUser(accessToken),
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ accessToken: null, refreshToken: null, user: null });
      },
    }),
    {
      name: 'convly-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    },
  ),
);
