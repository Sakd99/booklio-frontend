import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Scissors, Calendar, Radio,
  Users, LogOut, Sparkles, Menu, X,
  MessageSquare, Brain, Sun, Moon, Globe, ChevronDown, Workflow, CreditCard,
  Bell, Webhook, Star, TrendingUp, FlaskConical
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useThemeStore } from '../../store/theme.store';
import { useI18n } from '../../store/i18n.store';
import { LOCALE_META, type Locale } from '../../i18n/translations';
import { authApi } from '../../api/auth.api';
import { teamApi } from '../../api/team.api';
import toast from 'react-hot-toast';
import NotificationBell from '../../components/ui/NotificationBell';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { user, logout, refreshToken } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();

  // Fetch permissions for TENANT_MEMBER users
  useEffect(() => {
    if (!user) return;
    if (user.role === 'TENANT_OWNER' || user.role === 'SUPER_ADMIN') {
      setPermissions(null); // owners/admins see everything
      return;
    }
    teamApi.getPermissions(user.id).then((perms: any[]) => {
      const map: Record<string, boolean> = {};
      perms.forEach((p: any) => { map[p.resource] = p.canView; });
      setPermissions(map);
    }).catch(() => setPermissions(null));
  }, [user]);

  const ALL_NAV = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t('navOverview'), end: true, resource: null },
    { to: '/dashboard/conversations', icon: <MessageSquare className="w-5 h-5" />, label: t('navConversations'), resource: 'conversations' },
    { to: '/dashboard/ai', icon: <Brain className="w-5 h-5" />, label: t('navAiSettings'), resource: 'ai_settings' },
    { to: '/dashboard/services', icon: <Scissors className="w-5 h-5" />, label: t('navServices'), resource: 'services' },
    { to: '/dashboard/bookings', icon: <Calendar className="w-5 h-5" />, label: t('navBookings'), resource: 'bookings' },
    { to: '/dashboard/channels', icon: <Radio className="w-5 h-5" />, label: t('navChannels'), resource: 'channels' },
    { to: '/dashboard/team', icon: <Users className="w-5 h-5" />, label: t('navTeam'), resource: 'team' },
    { to: '/dashboard/automations', icon: <Workflow className="w-5 h-5" />, label: t('navAutomations'), resource: null },
    { to: '/dashboard/analytics', icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', resource: null },
    { to: '/dashboard/reviews', icon: <Star className="w-5 h-5" />, label: 'Reviews', resource: null },
    { to: '/dashboard/reminders', icon: <Bell className="w-5 h-5" />, label: 'Reminders', resource: null },
    { to: '/dashboard/webhooks', icon: <Webhook className="w-5 h-5" />, label: 'Webhooks', resource: null },
    { to: '/dashboard/ai-playground', icon: <FlaskConical className="w-5 h-5" />, label: 'AI Playground', resource: null },
    { to: '/dashboard/billing', icon: <CreditCard className="w-5 h-5" />, label: t('navBilling'), resource: null },
  ];

  // Filter nav based on permissions (null = show all, {} = show only allowed)
  const NAV = permissions
    ? ALL_NAV.filter((item) => !item.resource || permissions[item.resource])
    : ALL_NAV;

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {}
    logout();
    navigate('/login');
    toast.success(t('signedOut'));
  };

  const Sidebar = () => (
    <aside className="w-64 h-full flex flex-col bg-sidebar border-r border-b-border transition-colors duration-200">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-b-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">Convly</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
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
      <div className="px-3 py-3 border-t border-b-border space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-surface transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? t('lightMode') : t('darkMode')}
        </button>

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
                        ? 'bg-blue-500/10 text-blue-500 font-medium'
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
      </div>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-b-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-fg-secondary font-medium truncate">{user?.email}</div>
            <div className="text-[10px] text-dim capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-dim hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
            title={t('signOut')}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-base overflow-hidden transition-colors duration-200">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: locale === 'ar' ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: locale === 'ar' ? 280 : -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className={`md:hidden fixed ${locale === 'ar' ? 'right-0' : 'left-0'} top-0 bottom-0 z-50 w-64`}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-6 border-b border-b-border bg-base/80 backdrop-blur-sm flex-shrink-0 transition-colors duration-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-muted hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <div className="flex items-center gap-2 text-xs text-dim">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('allSystemsOp')}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
