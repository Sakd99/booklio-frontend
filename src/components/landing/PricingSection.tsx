import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Star } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

const PLANS = [
  {
    key: 'free',
    price: { monthly: 0, annual: 0 },
    accent: 'text-dim',
    border: 'border-b-border',
    bg: '',
    features: ['500 contacts', '1,000 messages/mo', '1 channel', '100 AI calls/mo', '10 bookings/mo', '1 team member'],
    popular: false,
  },
  {
    key: 'starter',
    price: { monthly: 9, annual: 7 },
    accent: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    features: ['1,500 contacts', '5,000 messages/mo', '2 channels', 'Unlimited bookings', '500 AI calls/mo', '2 team members', 'Automations'],
    popular: false,
  },
  {
    key: 'business',
    price: { monthly: 29, annual: 23 },
    accent: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    features: ['20,000 contacts', 'Unlimited messages', 'Unlimited channels', 'Unlimited bookings', '2,500 AI calls/mo', '5 team members', 'Analytics', 'Priority support'],
    popular: true,
  },
];

export default function PricingSection() {
  const { t } = useI18n();
  const [annual, setAnnual] = useState(false);

  const planNames: Record<string, string> = {
    free: t('pricingFree'),
    starter: t('pricingStarter'),
    business: t('pricingBusiness'),
  };

  const planDescs: Record<string, string> = {
    free: t('pricingFreeDesc'),
    starter: t('pricingStarterDesc'),
    business: t('pricingBusinessDesc'),
  };

  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5">
            <Star className="w-3.5 h-3.5" /> {t('landingPricingTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('landingPricingTitle')}{' '}
            <span className="gradient-text">{t('landingPricingHighlight')}</span>
          </h2>
          <p className="text-muted text-lg">{t('landingPricingSubtitle')}</p>
        </FadeIn>

        {/* Toggle */}
        <FadeIn className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-surface border border-b-border">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-base text-foreground shadow-md' : 'text-muted'
              }`}
            >
              {t('pricingMonthly')}
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? 'bg-base text-foreground shadow-md' : 'text-muted'
              }`}
            >
              {t('pricingAnnual')} <span className="text-emerald-500 text-xs ml-1">{t('pricingSave20')}</span>
            </button>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <FadeIn key={plan.key} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className={`relative rounded-2xl border transition-all duration-300 flex flex-col ${
                    plan.popular
                      ? 'bg-gradient-to-b from-violet-500/15 to-violet-500/5 border-violet-500/40 shadow-2xl shadow-violet-500/10 p-8 lg:p-10 lg:scale-105'
                      : `glass-card ${plan.border} ${plan.bg} p-8 lg:p-10`
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold px-6 py-2 rounded-full whitespace-nowrap shadow-lg shadow-violet-500/25">
                      {t('landingBestValue')}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`text-base font-bold uppercase tracking-widest mb-2 ${plan.accent}`}>
                      {planNames[plan.key]}
                    </div>
                    <p className="text-base text-muted leading-relaxed">{planDescs[plan.key]}</p>
                  </div>

                  <div className="mb-8">
                    {price === 0 ? (
                      <span className="text-5xl lg:text-6xl font-black text-foreground">{t('landingFree')}</span>
                    ) : (
                      <>
                        <span className="text-5xl lg:text-6xl font-black text-foreground">${price}</span>
                        <span className="text-muted text-lg">/{t('pricingMo')}</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base text-muted">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-violet-400' : plan.accent}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`block w-full text-center py-4 rounded-xl font-semibold text-base transition-all mt-auto ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                        : 'bg-surface text-foreground hover:bg-surface-hover border border-b-border'
                    }`}
                  >
                    {price === 0 ? t('landingStartFreeBtn') : t('landingGetStartedBtn')}
                  </Link>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <FadeIn className="text-center mt-12">
          <p className="text-muted mb-3">{t('pricingEnterprise')}</p>
          <a href="mailto:sales@booklio.dev" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {t('pricingContactSales')}
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
