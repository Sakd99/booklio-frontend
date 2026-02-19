import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'blue' | 'violet' | 'emerald' | 'rose';
  trend?: string;
  delay?: number;
}

const colors = {
  blue: {
    icon: 'bg-blue-500/10 text-blue-400',
    border: 'hover:border-blue-500/30',
    glow: 'hover:shadow-blue-500/10',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-400',
    border: 'hover:border-violet-500/30',
    glow: 'hover:shadow-violet-500/10',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-400',
    border: 'hover:border-emerald-500/30',
    glow: 'hover:shadow-emerald-500/10',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-400',
    border: 'hover:border-rose-500/30',
    glow: 'hover:shadow-rose-500/10',
  },
};

export default function StatCard({ label, value, icon, color = 'blue', trend, delay = 0 }: Props) {
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass-card rounded-2xl p-6 border border-white/5 ${c.border} hover:shadow-lg ${c.glow} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.icon}`}>{icon}</div>
        {trend && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/40">{label}</div>
    </motion.div>
  );
}
