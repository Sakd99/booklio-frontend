import { motion } from 'framer-motion';
import { Globe, Calendar, MessageSquare } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      num: '01',
      icon: <Globe className="w-7 h-7" />,
      title: t('stepConnect'),
      desc: t('stepConnectDesc'),
      color: 'blue',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      num: '02',
      icon: <Calendar className="w-7 h-7" />,
      title: t('stepServices'),
      desc: t('stepServicesDesc'),
      color: 'violet',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    {
      num: '03',
      icon: <MessageSquare className="w-7 h-7" />,
      title: t('stepAi'),
      desc: t('stepAiDesc'),
      color: 'emerald',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  ];

  return (
    <section id="how" className="py-28 px-6 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-5">
            <Globe className="w-3.5 h-3.5" /> {t('landingHowTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('landingHowTitle')}{' '}
            <span className="gradient-text">{t('landingHowHighlight')}</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[53%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-violet-500/30" />
          </div>
          <div className="hidden md:block absolute top-16 left-[53%] right-[20%] h-px">
            <div className="w-full h-full bg-gradient-to-r from-violet-500/30 via-emerald-500/30 to-emerald-500/0" />
          </div>

          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.15}>
              <div className="flex flex-col items-center text-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${s.iconBg} border`}
                >
                  {s.icon}
                </motion.div>
                <div className="text-xs font-bold text-dim mb-2 tracking-widest">{s.num}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
