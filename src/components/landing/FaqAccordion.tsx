import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

export default function FaqAccordion() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: t('faqLanding1Q'), a: t('faqLanding1A') },
    { q: t('faqLanding2Q'), a: t('faqLanding2A') },
    { q: t('faqLanding3Q'), a: t('faqLanding3A') },
    { q: t('faqLanding4Q'), a: t('faqLanding4A') },
    { q: t('faqLanding5Q'), a: t('faqLanding5A') },
    { q: t('faqLanding6Q'), a: t('faqLanding6A') },
    { q: t('faqLanding7Q'), a: t('faqLanding7A') },
    { q: t('faqLanding8Q'), a: t('faqLanding8A') },
  ];

  return (
    <section className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-5">
            <HelpCircle className="w-3.5 h-3.5" /> {t('faqLandingTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('faqLandingTitle')}{' '}
            <span className="gradient-text">{t('faqLandingHighlight')}</span>
          </h2>
        </FadeIn>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="glass-card rounded-xl border border-b-border overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-foreground font-medium pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-muted" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 text-muted text-sm leading-relaxed border-t border-b-border pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
