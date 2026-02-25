import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, MessageSquare, Radio, TrendingUp, ArrowRight,
  Scissors, Brain, Workflow, Zap, Bell, Clock, Users,
} from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import { bookingsApi } from '../../api/bookings.api';
import { notificationsApi } from '../../api/notifications.api';
import { automationsApi } from '../../api/automations.api';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { statusBadge } from '../../components/ui/Badge';
import { useI18n } from '../../store/i18n.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_DOTS: Record<string, string> = {
  BROADCAST: 'bg-violet-500',
  BOOKING_NEW: 'bg-emerald-500',
  BOOKING_STATUS: 'bg-blue-500',
  CONVERSATION_NEW: 'bg-orange-500',
  SYSTEM: 'bg-gray-500',
};

export default function Overview() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: tenantApi.getProfile,
  });

  const { data: usage } = useQuery({
    queryKey: ['tenant-usage'],
    queryFn: tenantApi.getUsage,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings-recent'],
    queryFn: () => bookingsApi.list({ limit: 5, page: 1 }),
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications-overview'],
    queryFn: () => notificationsApi.list(1, 5),
  });

  const { data: automationsData } = useQuery({
    queryKey: ['automations-overview'],
    queryFn: automationsApi.list,
  });

  if (profileLoading) return <Spinner />;

  const plan = profile?.subscriptions?.[0]?.plan;
  const u = usage?.usage;
  const notifs = notifData?.items ?? [];
  const activeAutomations = (automationsData ?? []).filter((a: any) => a.isActive).length;
  const totalAutomations = (automationsData ?? []).length;

  const quickActions = [
    { icon: <Scissors className="w-5 h-5" />, label: t('navServices'), to: '/dashboard/services', color: 'from-blue-500 to-blue-600' },
    { icon: <Calendar className="w-5 h-5" />, label: t('navBookings'), to: '/dashboard/bookings', color: 'from-violet-500 to-violet-600' },
    { icon: <Brain className="w-5 h-5" />, label: t('navAiSettings'), to: '/dashboard/ai', color: 'from-emerald-500 to-emerald-600' },
    { icon: <Workflow className="w-5 h-5" />, label: t('navAutomations'), to: '/dashboard/automations', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('welcomeBack')} 👋
          </h1>
          <p className="text-muted text-sm mt-1">
            {profile?.name} · <span className="text-blue-500 font-medium">{plan?.name ?? 'Free'} {t('plan')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-b-border text-xs text-muted">
            <Clock className="w-3.5 h-3.5" />
            {dayjs().format('ddd, MMM D')}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label={t('contactsTotal')}
          value={u?.contacts ? `${u.contacts.used} / ${u.contacts.max === -1 ? '∞' : u.contacts.max}` : '—'}
          icon={<Users className="w-5 h-5" />}
          color="violet"
          delay={0}
        />
        <StatCard
          label={t('messagesThisMonth')}
          value={u?.messages ? `${u.messages.used} / ${u.messages.max === -1 ? '∞' : u.messages.max}` : '—'}
          icon={<MessageSquare className="w-5 h-5" />}
          color="blue"
          delay={0.05}
        />
        <StatCard
          label={t('bookingsThisMonth')}
          value={u?.bookings ? `${u.bookings.used} / ${u.bookings.max === -1 ? '∞' : u.bookings.max}` : '—'}
          icon={<Calendar className="w-5 h-5" />}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          label={t('aiCallsThisMonth')}
          value={u?.aiCalls ? `${u.aiCalls.used} / ${u.aiCalls.max === -1 ? '∞' : u.aiCalls.max}` : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
          delay={0.15}
        />
        <StatCard
          label={t('channels')}
          value={u?.channels ? `${u.channels.used} / ${u.channels.max === -1 ? '∞' : u.channels.max}` : '—'}
          icon={<Radio className="w-5 h-5" />}
          color="rose"
          delay={0.2}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.to}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => navigate(action.to)}
            className="group flex items-center gap-3 p-4 rounded-2xl border border-b-border bg-[var(--color-card)] hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 text-left"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground truncate">{action.label}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Two Column: Usage + Automations */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Usage bars */}
        {u && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6 border border-b-border"
          >
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-5">
              {t('monthlyUsage')}
            </h2>
            <div className="space-y-5">
              {[
                { label: t('contacts'), used: u.contacts?.used ?? 0, max: u.contacts?.max ?? 0, color: 'violet' },
                { label: t('messages'), used: u.messages?.used ?? 0, max: u.messages?.max ?? 0, color: 'blue' },
                { label: t('aiCalls'), used: u.aiCalls?.used ?? 0, max: u.aiCalls?.max ?? 0, color: 'emerald' },
                { label: t('bookings'), used: u.bookings?.used ?? 0, max: u.bookings?.max ?? 0, color: 'amber' },
              ].map((item) => {
                const pct = item.max === -1 ? 20 : Math.min(100, (item.used / item.max) * 100);
                const colors: Record<string, string> = {
                  blue: 'from-blue-500 to-blue-400',
                  violet: 'from-violet-500 to-violet-400',
                  emerald: 'from-emerald-500 to-emerald-400',
                  amber: 'from-amber-500 to-amber-400',
                };
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="text-muted text-xs">
                        {item.used} / {item.max === -1 ? '∞' : item.max}
                      </span>
                    </div>
                    <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        className={`h-full bg-gradient-to-r ${colors[item.color]} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Automations Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 border border-b-border"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {t('navAutomations')}
            </h2>
            <button
              onClick={() => navigate('/dashboard/automations')}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 p-4 rounded-xl bg-surface border border-b-border text-center">
              <div className="text-2xl font-bold text-foreground">{totalAutomations}</div>
              <div className="text-xs text-muted mt-0.5">{t('total')}</div>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
              <div className="text-2xl font-bold text-emerald-500">{activeAutomations}</div>
              <div className="text-xs text-muted mt-0.5">{t('active')}</div>
            </div>
          </div>

          {totalAutomations === 0 ? (
            <div className="text-center py-4">
              <Zap className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">{t('noAutomations')}</p>
              <button
                onClick={() => navigate('/dashboard/automations')}
                className="text-xs text-blue-500 mt-2 hover:underline"
              >
                {t('createAutomation')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {(automationsData ?? []).slice(0, 3).map((auto: any) => (
                <button
                  key={auto.id}
                  onClick={() => navigate(`/dashboard/automations/${auto.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${auto.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{auto.name}</div>
                    <div className="text-[11px] text-muted">{auto.runCount} {t('runs')}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Two Column: Bookings + Notifications */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 glass-card rounded-2xl border border-b-border"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-b-border">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              {t('recentBookings')}
            </h2>
            <button
              onClick={() => navigate('/dashboard/bookings')}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              {bookings?.total ?? 0} {t('total').toLowerCase()} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {bookingsLoading ? (
            <Spinner size="sm" />
          ) : bookings?.appointments?.length === 0 ? (
            <div className="px-6 py-12 text-center text-dim text-sm">
              {t('noBookingsYet')}
            </div>
          ) : (
            <div className="divide-y divide-b-border">
              {bookings?.appointments?.map((bk: any) => (
                <div key={bk.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">{bk.customerName}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {bk.service?.name} · {dayjs(bk.startsAt).format('MMM D, h:mm A')}
                    </div>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">{statusBadge(bk.status)}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl border border-b-border"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-b-border">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {t('notifications')}
            </h2>
            {(notifData?.unreadCount ?? 0) > 0 && (
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                {notifData.unreadCount}
              </span>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="px-5 py-8 text-center text-dim text-sm">
              {t('noNotifications')}
            </div>
          ) : (
            <div className="divide-y divide-b-border">
              {notifs.map((n: any) => (
                <div
                  key={n.id}
                  className={`px-5 py-3.5 hover:bg-surface/50 transition-colors ${!n.isRead ? 'bg-violet-500/5' : ''}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_DOTS[n.type] ?? 'bg-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{n.title}</div>
                      <div className="text-[11px] text-muted mt-0.5 line-clamp-2">{n.body}</div>
                      <div className="text-[10px] text-dim mt-1">{dayjs(n.createdAt).fromNow()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
