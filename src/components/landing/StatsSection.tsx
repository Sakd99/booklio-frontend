import { Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';
import AnimatedCounter from './AnimatedCounter';

export default function StatsSection() {
  const { t } = useI18n();

  const stats = [
    { to: 10000, suffix: '+', label: t('landingStatBusinesses'), icon: <Users className="w-5 h-5" /> },
    { to: 2000000, suffix: '+', label: t('landingStatMessages'), icon: <MessageSquare className="w-5 h-5" /> },
    { to: 99, suffix: '.9%', label: t('landingStatUptime'), icon: <TrendingUp className="w-5 h-5" /> },
    { to: 200, suffix: 'ms', label: t('landingStatResponse'), icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <section className="py-20 border-y border-b-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-blue-500/5 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.1} className="flex flex-col items-center gap-2">
            <div className="text-dim mb-1">{s.icon}</div>
            <div className="text-4xl font-black gradient-text">
              <AnimatedCounter to={s.to} suffix={s.suffix} />
            </div>
            <div className="text-sm text-muted">{s.label}</div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
