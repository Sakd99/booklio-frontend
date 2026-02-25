import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard, CheckCircle2, Users, MessageSquare,
  Radio, Brain, Calendar, ArrowUpRight, Shield, Zap,
  ExternalLink, AlertCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantApi } from '../../api/tenant.api';
import { billingApi } from '../../api/billing.api';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';
import dayjs from 'dayjs';

const CONTACT_TIERS = [
  { contacts: 1500,  price: 14 },
  { contacts: 5000,  price: 35 },
  { contacts: 10000, price: 49 },
  { contacts: 25000, price: 89 },
  { contacts: 50000, price: 149 },
  { contacts: 100000, price: 249 },
];

export default function Billing() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: tenantApi.getProfile,
  });

  const { data: usage } = useQuery({
    queryKey: ['tenant-usage'],
    queryFn: tenantApi.getUsage,
  });

  const { data: plans } = useQuery({
    queryKey: ['plans-public'],
    queryFn: tenantApi.getProfile, // plans come embedded in profile
  });

  if (isLoading) return <Spinner />;

  const subscription = profile?.subscriptions?.[0];
  const plan = subscription?.plan;
  const isFree = !plan || plan?.type === 'FREE';
  const u = usage?.usage;

  const currentTier = CONTACT_TIERS.find((t) => t.contacts >= (plan?.maxContacts ?? 0)) ?? CONTACT_TIERS[0];

  // Checkout handler: planId comes from admin-configured plan
  const handleCheckout = async (planId: string) => {
    if (!planId) {
      toast.error(t('billingNoPriceId'));
      return;
    }
    setLoadingCheckout(planId);
    try {
      const { url } = await billingApi.createCheckout(planId);
      if (url) window.location.href = url;
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t('billingCheckoutError');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoadingCheckout(null);
    }
  };

  const handlePortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await billingApi.createPortal();
      if (url) window.location.href = url;
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t('billingPortalError');
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {t('billingTitle')}
        </h1>
        <p className="text-muted text-sm mt-1">{t('billingSubtitle')}</p>
      </div>

      {/* Success banner */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">{t('billingUpgradeSuccess')}</p>
        </motion.div>
      )}

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
                  {subscription?.stripeStatus === 'past_due'
                    ? t('billingPastDue')
                    : subscription?.status === 'active'
                    ? t('billingActive')
                    : subscription?.status ?? 'Free'}
                </span>
                {subscription?.cancelAtPeriodEnd && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    {t('billingCancelsAtEnd')}
                  </span>
                )}
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

        {/* Plan limits */}
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

        {/* Period + actions */}
        {subscription && (
          <div className="mt-5 pt-5 border-t border-b-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-muted">
              {t('billingPeriod')}: {dayjs(subscription.currentPeriodStart).format('MMM D, YYYY')} — {dayjs(subscription.currentPeriodEnd).format('MMM D, YYYY')}
            </div>
            <div className="flex items-center gap-3">
              {isFree ? (
                <span className="text-xs text-muted">{t('billingUpgradeBelow')}</span>
              ) : (
                <button
                  onClick={handlePortal}
                  disabled={loadingPortal}
                  className="inline-flex items-center gap-2 bg-surface border border-b-border text-foreground text-sm font-medium px-4 py-2 rounded-xl hover:border-violet-500/40 transition-colors disabled:opacity-50"
                >
                  {loadingPortal
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ExternalLink className="w-4 h-4" />
                  }
                  {t('billingManage')}
                </button>
              )}
            </div>
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
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-black text-foreground">
                      ${tier.price}
                      <span className="text-sm text-muted font-normal">/{t('pricingMo')}</span>
                    </div>
                    <div className="text-sm text-muted mt-0.5">
                      {tier.contacts.toLocaleString()} {t('pricingContacts')}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  {[t('pricingProFeature1'), t('pricingProFeature2'), t('pricingProFeature3')].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-muted">
                      <CheckCircle2 className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                {/* The planId here would come from the PRO plan in DB - handled via profile data */}
                {profile?.subscriptions?.[0]?.plan?.id && (
                  <button
                    onClick={() => handleCheckout(profile.subscriptions[0].plan.id + '_pro_' + tier.contacts)}
                    disabled={!!loadingCheckout}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-medium py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loadingCheckout ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {t('billingUpgrade')}
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Simple CTA if no planId configured */}
          <div className="mt-6 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t('billingUpgradeCta')}</p>
              <p className="text-xs text-muted mt-0.5">{t('billingUpgradeCtaDesc')}</p>
            </div>
            {profile?.subscriptions?.[0]?.plan?.id && (
              <button
                onClick={() => handleCheckout(profile.subscriptions[0].plan.id)}
                disabled={!!loadingCheckout}
                className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {t('billingUpgrade')}
              </button>
            )}
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
