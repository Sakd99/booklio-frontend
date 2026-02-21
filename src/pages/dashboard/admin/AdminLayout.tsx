import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Building2, CreditCard, FileText, LogOut, Sparkles, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../../store/auth.store';
import { useThemeStore } from '../../../store/theme.store';
import { useI18n } from '../../../store/i18n.store';
import { LOCALE_META, type Locale } from '../../../i18n/translations';
import { authApi } from '../../../api/auth.api';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, logout, refreshToken } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const NAV = [
    { to: '/admin', icon: <BarChart3 className="w-4 h-4" />, label: t('adminMetrics'), end: true },
    { to: '/admin/tenants', icon: <Building2 className="w-4 h-4" />, label: t('adminTenants') },
    { to: '/admin/plans', icon: <CreditCard className="w-4 h-4" />, label: t('adminPlans') },
    { to: '/admin/blog', icon: <FileText className="w-4 h-4" />, label: t('blogTitle') },
  ];

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try { if (refreshToken) await authApi.logout(refreshToken); } catch {}
    logout();
    navigate('/login');
    toast.success(t('signedOut'));
  };

  return (
    <div className="flex h-screen bg-base overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 h-full flex flex-col bg-sidebar border-r border-b-border flex-shrink-0 transition-colors duration-200">
        <div className="px-6 py-5 border-b border-b-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base gradient-text">Booklio</span>
              <div className="text-[10px] text-violet-500 font-medium -mt-0.5">SUPER ADMIN</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-500 border border-violet-500/20'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Theme + Language controls */}
        <div className="px-3 py-2 border-t border-b-border space-y-1">
          {/* Language selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface transition-all"
            >
              <Globe className="w-4 h-4" />
              <span className="flex-1 text-left">{LOCALE_META[locale].flag} {LOCALE_META[locale].label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full left-0 right-0 mb-1 rounded-xl glass-card border border-b-border shadow-xl overflow-hidden z-50"
                >
                  {(Object.keys(LOCALE_META) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                        locale === loc
                          ? 'bg-violet-500/10 text-violet-500 font-medium'
                          : 'text-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      <span>{LOCALE_META[loc].flag}</span>
                      <span>{LOCALE_META[loc].label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? t('lightMode') : t('darkMode')}
          </button>
        </div>

        <div className="px-3 py-4 border-t border-b-border">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-fg-secondary font-medium truncate">{user?.email}</div>
              <div className="text-[10px] text-violet-500">Super Admin</div>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-dim hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
