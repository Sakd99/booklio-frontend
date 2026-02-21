import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    businessName: '',
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setAuth(data.accessToken, data.refreshToken);
      toast.success('Account created! Welcome to Booklio');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4 py-12 transition-colors duration-200">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500 rounded-full blur-[130px] opacity-10" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-blue-500 rounded-full blur-[130px] opacity-10" />
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
            <span className="font-bold text-2xl gradient-text">Booklio</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-b-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
          <p className="text-muted text-sm mb-8">Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted mb-2">First name</label>
                <input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className="input-base !py-3" placeholder="Ali" />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Last name</label>
                <input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className="input-base !py-3" placeholder="Hassan" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Business name</label>
              <input required value={form.businessName} onChange={(e) => set('businessName', e.target.value)} className="input-base !py-3" placeholder="Ali's Barbershop" />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Email</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="input-base !py-3" placeholder="ali@barbershop.com" />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  className="input-base !py-3 !pr-12"
                  placeholder="Min. 8 characters"
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

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create free account
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-dim mt-5">
            By registering you agree to our{' '}
            <a href="#" className="text-muted hover:text-fg-secondary">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-muted hover:text-fg-secondary">Privacy Policy</a>
          </p>
          <p className="text-center text-sm text-dim mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
