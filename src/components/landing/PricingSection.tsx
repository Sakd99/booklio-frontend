import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, Sparkles } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

const CONTACT_TIERS = [
  { contacts: 1500, price: 14 },
  { contacts: 5000, price: 35 },
  { contacts: 10000, price: 49 },
  { contacts: 25000, price: 89 },
  { contacts: 50000, price: 149 },
  { contacts: 100000, price: 249 },
];

function formatContacts(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return n.toString();
}

export default function PricingSection() {
  const { t } = useI18n();
  const [tierIdx, setTierIdx] = useState(0);
  const tier = CONTACT_TIERS[tierIdx];

  const freeFeatures = [
    t('pricingFreeFeature1'),
    t('pricingFreeFeature2'),
    t('pricingFreeFeature3'),
    t('pricingFreeFeature4'),
    t('pricingFreeFeature5'),
    t('pricingFreeFeature6'),
  ];

  const proFeatures = [
    t('pricingProFeature1'),
    t('pricingProFeature2'),
    t('pricingProFeature3'),
    t('pricingProFeature4'),
    t('pricingProFeature5'),
    t('pricingProFeature6'),
  ];

  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5">
            <Star className="w-3.5 h-3.5" /> {t('landingPricingTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('landingPricingTitle')}{' '}
            <span className="gradient-text">{t('landingPricingHighlight')}</span>
          </h2>
          <p className="text-muted text-lg">{t('landingPricingSubtitle')}</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
          {/* Free Plan */}
          <FadeIn>
            <motion.div
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl border border-b-border p-8 lg:p-10 flex flex-col h-full"
            >
              <div className="mb-6">
                <div className="text-base font-bold uppercase tracking-widest mb-2 text-dim">
                  {t('pricingFree')}
                </div>
                <p className="text-base text-muted leading-relaxed">{t('pricingFreeDesc')}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl lg:text-6xl font-black text-foreground">{t('landingFree')}</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base text-muted">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-dim" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="block w-full text-center py-4 rounded-xl font-semibold text-base transition-all bg-surface text-foreground hover:bg-surface-hover border border-b-border"
              >
                {t('landingStartFreeBtn')}
              </Link>
            </motion.div>
          </FadeIn>

          {/* Pro Plan */}
          <FadeIn delay={0.1}>
            <motion.div
              whileHover={{ y: -6 }}
              className="relative bg-gradient-to-b from-violet-500/15 to-violet-500/5 rounded-2xl border border-violet-500/40 shadow-2xl shadow-violet-500/10 p-8 lg:p-10 flex flex-col h-full"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold px-6 py-2 rounded-full whitespace-nowrap shadow-lg shadow-violet-500/25 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> {t('pricingMostPopular')}
              </div>

              <div className="mb-6">
                <div className="text-base font-bold uppercase tracking-widest mb-2 text-violet-400">
                  {t('pricingPro')}
                </div>
                <p className="text-base text-muted leading-relaxed">{t('pricingProDesc')}</p>
              </div>

              <div className="mb-6">
                <span className="text-5xl lg:text-6xl font-black text-foreground">${tier.price}</span>
                <span className="text-muted text-lg">/{t('pricingMo')}</span>
              </div>

              {/* Contacts slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted">{t('pricingContacts')}</span>
                  <span className="font-bold text-foreground">{tier.contacts.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={CONTACT_TIERS.length - 1}
                  step={1}
                  value={tierIdx}
                  onChange={(e) => setTierIdx(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-violet-500/20 accent-violet-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30 [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-violet-500/30 [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-dim mt-1.5 px-0.5">
                  <span>{formatContacts(CONTACT_TIERS[0].contacts)}</span>
                  <span>{formatContacts(CONTACT_TIERS[CONTACT_TIERS.length - 1].contacts)}+</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base text-muted">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-violet-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="block w-full text-center py-4 rounded-xl font-semibold text-base transition-all bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20"
              >
                {t('landingGetStartedBtn')}
              </Link>
            </motion.div>
          </FadeIn>
        </div>

        {/* Enterprise CTA */}
        <FadeIn className="text-center mt-12">
          <p className="text-muted mb-3">{t('pricingEnterprise')}</p>
          <a href="mailto:sales@convly.ai" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            {t('pricingContactSales')}
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
