import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, MessageSquare, Calendar, Star, Users,
  ArrowUpRight, ArrowDownRight, Zap, Clock,
} from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import Spinner from '../../components/ui/Spinner';

const DAYS_OPTIONS = [7, 14, 30, 90];
const CHANNEL_COLORS: Record<string, string> = {
  INSTAGRAM: '#e1306c',
  WHATSAPP: '#25d366',
  TIKTOK: '#010101',
  TELEGRAM: '#2ca5e0',
  MESSENGER: '#0084ff',
};

function StatCard({ icon, label, value, sub, trend }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; trend?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
      {sub && <div className="text-[11px] text-dim mt-0.5">{sub}</div>}
    </motion.div>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics-overview', days],
    queryFn: () => analyticsApi.overview(days),
  });

  const { data: trend = [] } = useQuery({
    queryKey: ['analytics-trend', days],
    queryFn: () => analyticsApi.conversionTrend(days),
  });

  const { data: peakHours = [] } = useQuery({
    queryKey: ['analytics-peaks', days],
    queryFn: () => analyticsApi.peakHours(days),
  });

  const { data: topServices = [] } = useQuery({
    queryKey: ['analytics-services', days],
    queryFn: () => analyticsApi.topServices(days),
  });

  const { data: channelBreakdown = [] } = useQuery({
    queryKey: ['analytics-channels', days],
    queryFn: () => analyticsApi.channelBreakdown(days),
  });

  if (loadingOverview) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-sm text-muted mt-1">Conversion rates, peak hours, and performance insights.</p>
        </div>
        <div className="flex gap-1 bg-surface rounded-xl p-1">
          {DAYS_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${days === d ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Total Conversations" value={overview.totalConversations} />
          <StatCard icon={<Calendar className="w-4 h-4" />} label="Total Bookings" value={overview.totalBookings} />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Conversion Rate" value={`${overview.conversionRate}%`}
            sub="DMs → Bookings" />
          <StatCard icon={<Star className="w-4 h-4" />} label="Avg Rating" value={overview.avgRating || '—'}
            sub={`${overview.totalReviews} reviews`} />
          <StatCard icon={<Zap className="w-4 h-4" />} label="Completed" value={overview.completedBookings}
            sub="appointments" />
          <StatCard icon={<Users className="w-4 h-4" />} label="No-show Rate" value={`${overview.noShowRate}%`}
            sub="cancelled/total" />
        </div>
      )}

      {/* Conversion Trend */}
      {trend.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Conversion Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis dataKey="date" stroke="var(--color-muted)" fontSize={11} tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-muted)" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="conversations" stroke="#3b82f6" strokeWidth={2} dot={false} name="Conversations" />
              <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Peak Hours */}
        {peakHours.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Peak Hours
            </h3>
            <p className="text-xs text-muted mb-4">When customers message you most</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={peakHours.filter((_: unknown, i: number) => i % 2 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={10} />
                <YAxis stroke="var(--color-muted)" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Messages" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Channel Breakdown */}
        {channelBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-1">Channel Breakdown</h3>
            <p className="text-xs text-muted mb-4">Conversations by source</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={channelBreakdown} dataKey="count" nameKey="channel" cx="50%" cy="50%" outerRadius={70}
                  label={(props: any) => `${props.channel} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={11}>
                  {channelBreakdown.map((entry: any) => (
                    <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] ?? '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Top Services */}
      {topServices.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Services</h3>
          <div className="space-y-3">
            {topServices.map((svc: any, i: number) => {
              const completionRate = svc.count > 0 ? Math.round((svc.completed / svc.count) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-dim w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{svc.name}</span>
                      <span className="text-xs text-muted ml-2 flex-shrink-0">{svc.count} bookings</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                        style={{ width: `${completionRate}%` }} />
                    </div>
                    <div className="text-[10px] text-dim mt-0.5">{completionRate}% completion rate</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!overview?.totalConversations && !loadingOverview && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <TrendingUp className="w-10 h-10 text-dim mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No data yet</h3>
          <p className="text-sm text-muted">Analytics will appear once you start receiving conversations and bookings.</p>
        </div>
      )}
    </div>
  );
}
