import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Radio, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import { bookingsApi } from '../../api/bookings.api';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import { statusBadge } from '../../components/ui/Badge';

export default function Overview() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: tenantApi.getProfile,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['tenant-usage'],
    queryFn: tenantApi.getUsage,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings-recent'],
    queryFn: () => bookingsApi.list({ limit: 5, page: 1 }),
  });

  if (profileLoading) return <Spinner />;

  const plan = profile?.subscriptions?.[0]?.plan;
  const u = usage?.usage;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {profile?.name} · <span className="text-blue-400">{plan?.name ?? 'Free'} plan</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Messages this month"
          value={u ? `${u.messages.used} / ${u.messages.max === -1 ? '∞' : u.messages.max}` : '—'}
          icon={<MessageSquare className="w-5 h-5" />}
          color="blue"
          delay={0}
        />
        <StatCard
          label="Bookings this month"
          value={u ? `${u.bookings.used} / ${u.bookings.max === -1 ? '∞' : u.bookings.max}` : '—'}
          icon={<Calendar className="w-5 h-5" />}
          color="violet"
          delay={0.05}
        />
        <StatCard
          label="AI calls this month"
          value={u ? `${u.aiCalls.used} / ${u.aiCalls.max === -1 ? '∞' : u.aiCalls.max}` : '—'}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          label="Channels"
          value={u ? `${u.channels.used} / ${u.channels.max === -1 ? '∞' : u.channels.max}` : '—'}
          icon={<Radio className="w-5 h-5" />}
          color="rose"
          delay={0.15}
        />
      </div>

      {/* Usage bars */}
      {u && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-5">
            Monthly Usage
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Messages', used: u.messages.used, max: u.messages.max, color: 'blue' },
              { label: 'AI Calls', used: u.aiCalls.used, max: u.aiCalls.max, color: 'violet' },
              { label: 'Bookings', used: u.bookings.used, max: u.bookings.max, color: 'emerald' },
            ].map((item) => {
              const pct = item.max === -1 ? 20 : Math.min(100, (item.used / item.max) * 100);
              const colors: Record<string, string> = {
                blue: 'from-blue-500 to-blue-400',
                violet: 'from-violet-500 to-violet-400',
                emerald: 'from-emerald-500 to-emerald-400',
              };
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60">{item.label}</span>
                    <span className="text-white/40">
                      {item.used} / {item.max === -1 ? '∞' : item.max}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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

      {/* Recent bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl border border-white/5"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Recent Bookings
          </h2>
          <span className="text-xs text-white/30">{bookings?.total ?? 0} total</span>
        </div>

        {bookingsLoading ? (
          <Spinner size="sm" />
        ) : bookings?.appointments?.length === 0 ? (
          <div className="px-6 py-12 text-center text-white/20 text-sm">
            No bookings yet. Create your first service to get started.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {bookings?.appointments?.map((bk: any) => (
              <div key={bk.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{bk.customerName}</div>
                  <div className="text-xs text-white/30 mt-0.5">
                    {bk.service?.name} · {new Date(bk.startsAt).toLocaleDateString()} {new Date(bk.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex-shrink-0">{statusBadge(bk.status)}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
