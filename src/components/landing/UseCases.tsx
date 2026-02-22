import { motion } from 'framer-motion';
import { Scissors, Stethoscope, GraduationCap, ShoppingBag } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

export default function UseCases() {
  const { t } = useI18n();

  const cases = [
    {
      icon: <Scissors className="w-6 h-6" />,
      title: t('useCaseSalonsTitle'),
      desc: t('useCaseSalonsDesc'),
      benefits: [t('useCaseSalonsBenefit1'), t('useCaseSalonsBenefit2')],
      gradient: 'from-pink-500 to-rose-600',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: t('useCaseClinicsTitle'),
      desc: t('useCaseClinicsDesc'),
      benefits: [t('useCaseClinicsBenefit1'), t('useCaseClinicsBenefit2')],
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: t('useCaseCoachesTitle'),
      desc: t('useCaseCoachesDesc'),
      benefits: [t('useCaseCoachesBenefit1'), t('useCaseCoachesBenefit2')],
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: t('useCaseEcomTitle'),
      desc: t('useCaseEcomDesc'),
      benefits: [t('useCaseEcomBenefit1'), t('useCaseEcomBenefit2')],
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ];

  return (
    <section id="use-cases" className="py-28 px-6 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-5">
            <ShoppingBag className="w-3.5 h-3.5" /> {t('useCasesTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('useCasesTitle')}{' '}
            <span className="gradient-text">{t('useCasesHighlight')}</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">{t('useCasesSubtitle')}</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className={`glass-card rounded-2xl p-6 border ${c.border} transition-all duration-300 h-full`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-4`}>
                  <div className="text-white">{c.icon}</div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{c.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-4">{c.desc}</p>
                <ul className="space-y-2">
                  {c.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${c.gradient}`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
