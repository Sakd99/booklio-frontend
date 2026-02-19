import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Services from './pages/dashboard/Services';
import Bookings from './pages/dashboard/Bookings';
import Channels from './pages/dashboard/Channels';
import Team from './pages/dashboard/Team';

import AdminLayout from './pages/dashboard/admin/AdminLayout';
import Metrics from './pages/dashboard/admin/Metrics';
import Tenants from './pages/dashboard/admin/Tenants';
import Plans from './pages/dashboard/admin/Plans';

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
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
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
          <Route path="plans" element={<Plans />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
