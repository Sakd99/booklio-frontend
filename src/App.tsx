import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
import { useThemeStore } from './store/theme.store';
import { useI18n } from './store/i18n.store';
import { LOCALE_META } from './i18n/translations';
import { onboardingApi } from './api/onboarding.api';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import HelpCenter from './pages/HelpCenter';
import ChannelWhatsApp from './pages/ChannelWhatsApp';
import ChannelInstagram from './pages/ChannelInstagram';
import ChannelMessenger from './pages/ChannelMessenger';
import ChannelTikTok from './pages/ChannelTikTok';

import Onboarding from './pages/Onboarding';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import AdminLayout from './pages/dashboard/admin/AdminLayout';

const Services = lazy(() => import('./pages/dashboard/Services'));
const Bookings = lazy(() => import('./pages/dashboard/Bookings'));
const Channels = lazy(() => import('./pages/dashboard/Channels'));
const Team = lazy(() => import('./pages/dashboard/Team'));
const Conversations = lazy(() => import('./pages/dashboard/Conversations'));
const AiSettings = lazy(() => import('./pages/dashboard/AiSettings'));
const Billing = lazy(() => import('./pages/dashboard/Billing'));
const Automations = lazy(() => import('./pages/dashboard/Automations'));
const FlowBuilder = lazy(() => import('./pages/dashboard/FlowBuilder'));

const Metrics = lazy(() => import('./pages/dashboard/admin/Metrics'));
const Tenants = lazy(() => import('./pages/dashboard/admin/Tenants'));
const Plans = lazy(() => import('./pages/dashboard/admin/Plans'));
const AdminBlog = lazy(() => import('./pages/dashboard/admin/Blog'));
const TenantDetail = lazy(() => import('./pages/dashboard/admin/TenantDetail'));
const AdminSettings = lazy(() => import('./pages/dashboard/admin/Settings'));
const AdminNotifications = lazy(() => import('./pages/dashboard/admin/Notifications'));

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, logout } = useAuthStore();
  if (!accessToken || isTokenExpired(accessToken)) {
    if (accessToken) logout();
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, user, logout } = useAuthStore();
  if (!accessToken || isTokenExpired(accessToken)) {
    if (accessToken) logout();
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'done' | 'pending'>('loading');

  useEffect(() => {
    onboardingApi
      .getStatus()
      .then((s) => setStatus(s.completed ? 'done' : 'pending'))
      .catch(() => setStatus('done'));
  }, []);

  if (status === 'loading') return null;
  if (status === 'pending') return <Navigate to="/onboarding" replace />;
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
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/whatsapp" element={<ChannelWhatsApp />} />
        <Route path="/instagram" element={<ChannelInstagram />} />
        <Route path="/messenger" element={<ChannelMessenger />} />
        <Route path="/tiktok" element={<ChannelTikTok />} />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Tenant Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <DashboardLayout />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="services" element={<Suspense fallback={<div />}><Services /></Suspense>} />
          <Route path="bookings" element={<Suspense fallback={<div />}><Bookings /></Suspense>} />
          <Route path="channels" element={<Suspense fallback={<div />}><Channels /></Suspense>} />
          <Route path="conversations" element={<Suspense fallback={<div />}><Conversations /></Suspense>} />
          <Route path="ai" element={<Suspense fallback={<div />}><AiSettings /></Suspense>} />
          <Route path="team" element={<Suspense fallback={<div />}><Team /></Suspense>} />
          <Route path="automations" element={<Suspense fallback={<div />}><Automations /></Suspense>} />
          <Route path="automations/:id" element={<Suspense fallback={<div />}><FlowBuilder /></Suspense>} />
          <Route path="billing" element={<Suspense fallback={<div />}><Billing /></Suspense>} />
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
          <Route index element={<Suspense fallback={<div />}><Metrics /></Suspense>} />
          <Route path="tenants" element={<Suspense fallback={<div />}><Tenants /></Suspense>} />
          <Route path="tenants/:id" element={<Suspense fallback={<div />}><TenantDetail /></Suspense>} />
          <Route path="plans" element={<Suspense fallback={<div />}><Plans /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<div />}><AdminBlog /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<div />}><AdminSettings /></Suspense>} />
          <Route path="notifications" element={<Suspense fallback={<div />}><AdminNotifications /></Suspense>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
