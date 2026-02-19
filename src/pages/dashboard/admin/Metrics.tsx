import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Radio, Calendar, MessageSquare, TrendingUp, Zap } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import StatCard from '../../../components/ui/StatCard';
import Spinner from '../../../components/ui/Spinner';

export default function Metrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getMetrics,
    refetchInterval: 30_000,
  });

  if (isLoading) return <Spinner />;

  const stats = [
    { label: 'Total Tenants', value: data?.tenantCount ?? 0, icon: <Building2 className="w-5 h-5" />, color: 'blue' as const },
    { label: 'Connected Channels', value: data?.channelCount ?? 0, icon: <Radio className="w-5 h-5" />, color: 'violet' as const },
    { label: 'Total Appointments', value: data?.appointmentCount ?? 0, icon: <Calendar className="w-5 h-5" />, color: 'emerald' as const },
    { label: 'Total Messages', value: data?.messageCount ?? 0, icon: <MessageSquare className="w-5 h-5" />, color: 'rose' as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Metrics</h1>
        <p className="text-white/40 text-sm mt-1">Real-time platform overview · auto-refreshes every 30s</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.05} />
        ))}
      </div>

      {/* System status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 border border-white/5"
      >
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5">
          System Status
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'API Server', status: 'Operational', icon: <Zap className="w-4 h-4" /> },
            { name: 'Database', status: data?.dbStatus ?? 'up', icon: <TrendingUp className="w-4 h-4" /> },
            { name: 'Redis / Queue', status: data?.redisStatus ?? 'up', icon: <Radio className="w-4 h-4" /> },
          ].map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/5"
            >
              <div className="text-emerald-400">{s.icon}</div>
              <div className="flex-1">
                <div className="text-sm text-white/70">{s.name}</div>
                <div className="text-xs text-white/30 capitalize">{s.status}</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
