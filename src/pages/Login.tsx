import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useI18n } from '../store/i18n.store';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setAuth(data.accessToken, data.refreshToken);
      toast.success(t('welcomeBack') + '!');
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 transition-colors duration-200">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-10" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-500 rounded-full blur-[120px] opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl gradient-text">Convly</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-b-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">{t('loginWelcome')}</h1>
          <p className="text-muted text-sm mb-8">{t('loginSubtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-muted mb-2">{t('email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-base !py-3"
                placeholder="you@business.com"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">{t('password')}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-base !py-3 !pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-muted transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo credentials */}
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-muted">
              <div className="font-semibold text-fg-secondary mb-1">{t('loginDemoCredentials')}</div>
              <div>Tenant: <span className="text-blue-500">demo@booklio.dev</span> / <span className="text-blue-500">Demo@12345</span></div>
              <div>Admin: <span className="text-violet-500">super@booklio.dev</span> / <span className="text-violet-500">SuperAdmin@123</span></div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t('loginSignIn')}
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-dim mt-6">
            {t('loginNoAccount')}{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400 transition-colors">
              {t('loginCreateFree')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
