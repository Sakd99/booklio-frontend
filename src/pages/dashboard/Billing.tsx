import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CreditCard, CheckCircle2, Users, MessageSquare,
  Radio, Brain, Calendar, ArrowUpRight, Shield, Zap,
} from 'lucide-react';
import { tenantApi } from '../../api/tenant.api';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';
import dayjs from 'dayjs';

const CONTACT_TIERS = [
  { contacts: 1500, price: 14 },
  { contacts: 5000, price: 35 },
  { contacts: 10000, price: 49 },
  { contacts: 25000, price: 89 },
  { contacts: 50000, price: 149 },
  { contacts: 100000, price: 249 },
];

export default function Billing() {
  const { t } = useI18n();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: tenantApi.getProfile,
  });

  const { data: usage } = useQuery({
    queryKey: ['tenant-usage'],
    queryFn: tenantApi.getUsage,
  });

  if (isLoading) return <Spinner />;

  const subscription = profile?.subscriptions?.[0];
  const plan = subscription?.plan;
  const isFree = plan?.type === 'FREE';
  const u = usage?.usage;

  const currentTier = CONTACT_TIERS.find((tier) => tier.contacts >= (plan?.maxContacts ?? 0)) ?? CONTACT_TIERS[0];

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {t('billingTitle')}
        </h1>
        <p className="text-muted text-sm mt-1">{t('billingSubtitle')}</p>
      </div>

      {/* Current Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-6 sm:p-8 ${
          isFree
            ? 'glass-card border-b-border'
            : 'bg-gradient-to-br from-violet-500/10 to-blue-500/5 border-violet-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isFree ? 'bg-surface border border-b-border' : 'bg-gradient-to-br from-violet-500 to-blue-500'
            }`}>
              {isFree
                ? <CreditCard className="w-5 h-5 text-muted" />
                : <Zap className="w-5 h-5 text-white" />
              }
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{plan?.name ?? 'Free'}</h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isFree ? 'bg-surface text-muted' : 'bg-violet-500/20 text-violet-500'
                }`}>
                  {subscription?.status === 'active' ? t('billingActive') : subscription?.status}
                </span>
              </div>
              <p className="text-sm text-muted">{plan?.description ?? ''}</p>
            </div>
          </div>

          <div className="text-right">
            {isFree ? (
              <div className="text-3xl font-black text-foreground">{t('landingFree')}</div>
            ) : (
              <div>
                <span className="text-3xl font-black text-foreground">${currentTier.price}</span>
                <span className="text-muted text-lg">/{t('pricingMo')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: <Users className="w-4 h-4" />, label: t('contacts'), value: plan?.maxContacts === -1 ? '∞' : (plan?.maxContacts ?? 500).toLocaleString() },
            { icon: <MessageSquare className="w-4 h-4" />, label: t('messages'), value: plan?.maxMessagesPerMonth === -1 ? '∞' : (plan?.maxMessagesPerMonth ?? 1000).toLocaleString() },
            { icon: <Radio className="w-4 h-4" />, label: t('channels'), value: plan?.maxChannels === -1 ? '∞' : (plan?.maxChannels ?? 1) },
            { icon: <Brain className="w-4 h-4" />, label: t('aiCalls'), value: plan?.maxAiCallsPerMonth === -1 ? '∞' : (plan?.maxAiCallsPerMonth ?? 100).toLocaleString() },
            { icon: <Calendar className="w-4 h-4" />, label: t('bookings'), value: plan?.maxBookingsPerMonth === -1 ? '∞' : (plan?.maxBookingsPerMonth ?? 10) },
            { icon: <Users className="w-4 h-4" />, label: t('teamMembers'), value: plan?.maxTeamMembers ?? 1 },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-base/50 border border-b-border text-center">
              <div className="flex items-center justify-center gap-1.5 text-muted mb-1">
                {item.icon}
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </div>
              <div className="text-lg font-bold text-foreground">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Period info */}
        {subscription && (
          <div className="mt-5 pt-5 border-t border-b-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-muted">
              {t('billingPeriod')}: {dayjs(subscription.currentPeriodStart).format('MMM D, YYYY')} — {dayjs(subscription.currentPeriodEnd).format('MMM D, YYYY')}
            </div>
            {isFree && (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                {t('billingUpgrade')}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </motion.div>

      {/* Usage This Month */}
      {u && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-b-border"
        >
          <h2 className="text-lg font-bold text-foreground mb-5">{t('billingUsageTitle')}</h2>
          <div className="space-y-5">
            {[
              { label: t('contacts'), used: u.contacts?.used ?? 0, max: u.contacts?.max ?? 0, color: 'violet' },
              { label: t('messages'), used: u.messages?.used ?? 0, max: u.messages?.max ?? 0, color: 'blue' },
              { label: t('aiCalls'), used: u.aiCalls?.used ?? 0, max: u.aiCalls?.max ?? 0, color: 'emerald' },
              { label: t('bookings'), used: u.bookings?.used ?? 0, max: u.bookings?.max ?? 0, color: 'amber' },
            ].map((item) => {
              const pct = item.max === -1 ? Math.min(100, (item.used / 1000) * 100) : Math.min(100, (item.used / item.max) * 100);
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
                      {item.used.toLocaleString()} / {item.max === -1 ? '∞' : item.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${colors[item.color]} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Pro Plan Tiers (show for free users) */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 sm:p-8 border border-b-border"
        >
          <h2 className="text-lg font-bold text-foreground mb-2">{t('billingProPlans')}</h2>
          <p className="text-sm text-muted mb-6">{t('billingProPlansDesc')}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTACT_TIERS.map((tier) => (
              <div
                key={tier.contacts}
                className="p-4 rounded-xl border border-b-border hover:border-violet-500/30 transition-colors bg-surface/50"
              >
                <div className="text-2xl font-black text-foreground">${tier.price}<span className="text-sm text-muted font-normal">/{t('pricingMo')}</span></div>
                <div className="text-sm text-muted mt-1">{tier.contacts.toLocaleString()} {t('pricingContacts')}</div>
                <div className="mt-3 space-y-1.5">
                  {[t('pricingProFeature1'), t('pricingProFeature2'), t('pricingProFeature3')].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted">
                      <CheckCircle2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-b-border"
      >
        <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <p className="text-sm text-muted">{t('billingSecurityNote')}</p>
      </motion.div>
    </div>
  );
}
