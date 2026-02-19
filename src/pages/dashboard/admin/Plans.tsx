import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Infinity } from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import Spinner from '../../../components/ui/Spinner';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'border-white/10',
  STARTER: 'border-blue-500/30 bg-blue-500/5',
  BUSINESS: 'border-violet-500/30 bg-violet-500/5',
  PRO: 'border-emerald-500/30 bg-emerald-500/5',
  AGENCY: 'border-orange-500/30 bg-orange-500/5',
};
const PLAN_LABEL_COLORS: Record<string, string> = {
  FREE: 'text-white/40',
  STARTER: 'text-blue-400',
  BUSINESS: 'text-violet-400',
  PRO: 'text-emerald-400',
  AGENCY: 'text-orange-400',
};

function fmt(n: number) {
  if (n === -1) return '∞';
  return n.toLocaleString();
}

export default function Plans() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: adminApi.listPlans,
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Plans</h1>
        <p className="text-white/40 text-sm mt-1">{plans?.length ?? 0} active plans</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
        {plans?.map((plan: any, i: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card rounded-2xl p-5 border ${PLAN_COLORS[plan.type] ?? 'border-white/10'}`}
          >
            <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${PLAN_LABEL_COLORS[plan.type]}`}>
              {plan.type}
            </div>
            <div className="flex items-baseline gap-1 mb-0.5">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              {plan.priceUsd > 0 && (
                <span className={`text-sm font-bold ${PLAN_LABEL_COLORS[plan.type]}`}>${plan.priceUsd}/mo</span>
              )}
              {plan.priceUsd === 0 && (
                <span className="text-sm font-bold text-white/30">Free</span>
              )}
            </div>
            <p className="text-xs text-white/30 mb-4">{plan.description}</p>

            <div className="space-y-2.5">
              {[
                { label: 'Messages/mo', value: fmt(plan.maxMessagesPerMonth) },
                { label: 'AI calls/mo', value: fmt(plan.maxAiCallsPerMonth) },
                { label: 'Bookings/mo', value: fmt(plan.maxBookingsPerMonth) },
                { label: 'Channels', value: fmt(plan.maxChannels) },
                { label: 'Team members', value: fmt(plan.maxTeamMembers) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-white/40">{item.label}</span>
                  <span className={`font-medium ${item.value === '∞' ? PLAN_LABEL_COLORS[plan.type] : 'text-white'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs text-white/30 mb-2">Features</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(plan.features ?? {}).map(([key, val]) =>
                  val ? (
                    <span key={key} className="flex items-center gap-1 text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
