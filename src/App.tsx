import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
import { useThemeStore } from './store/theme.store';
import { useI18n } from './store/i18n.store';
import { LOCALE_META } from './i18n/translations';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Services from './pages/dashboard/Services';
import Bookings from './pages/dashboard/Bookings';
import Channels from './pages/dashboard/Channels';
import Team from './pages/dashboard/Team';
import Conversations from './pages/dashboard/Conversations';
import AiSettings from './pages/dashboard/AiSettings';

import AdminLayout from './pages/dashboard/admin/AdminLayout';
import Metrics from './pages/dashboard/admin/Metrics';
import Tenants from './pages/dashboard/admin/Tenants';
import Plans from './pages/dashboard/admin/Plans';
import AdminBlog from './pages/dashboard/admin/Blog';
import TenantDetail from './pages/dashboard/admin/TenantDetail';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const locale = useI18n((s) => s.locale);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const { dir } = LOCALE_META[locale];
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-foreground)',
            border: '1px solid var(--color-border)',
          },
          success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Tenant Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="services" element={<Services />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="channels" element={<Channels />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="ai" element={<AiSettings />} />
          <Route path="team" element={<Team />} />
        </Route>

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Metrics />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="tenants/:id" element={<TenantDetail />} />
          <Route path="plans" element={<Plans />} />
          <Route path="blog" element={<AdminBlog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
