import { motion } from 'framer-motion';
import { Bot, Calendar, Globe, Zap, Shield, BarChart3, Workflow, Users } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

const FEATURE_COLORS: Record<string, string> = {
  blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
  violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
  rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-400',
  amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
  emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
  pink: 'from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-400',
  sky: 'from-sky-500/10 to-sky-500/5 border-sky-500/20 text-sky-400',
};

export default function FeaturesGrid() {
  const { t } = useI18n();

  const features = [
    { icon: <Bot className="w-6 h-6" />, title: t('featureAi'), desc: t('featureAiDesc'), color: 'blue', large: true },
    { icon: <Calendar className="w-6 h-6" />, title: t('featureScheduling'), desc: t('featureSchedulingDesc'), color: 'violet', large: true },
    { icon: <Globe className="w-6 h-6" />, title: t('featureChannels'), desc: t('featureChannelsDesc'), color: 'rose' },
    { icon: <Zap className="w-6 h-6" />, title: t('featureWebhooks'), desc: t('featureWebhooksDesc'), color: 'amber' },
    { icon: <Shield className="w-6 h-6" />, title: t('featureSecurity'), desc: t('featureSecurityDesc'), color: 'emerald' },
    { icon: <BarChart3 className="w-6 h-6" />, title: t('featureAnalytics'), desc: t('featureAnalyticsDesc'), color: 'cyan' },
    { icon: <Workflow className="w-6 h-6" />, title: t('featureAutomations'), desc: t('featureAutomationsDesc'), color: 'pink' },
    { icon: <Users className="w-6 h-6" />, title: t('featureTeam'), desc: t('featureTeamDesc'), color: 'sky' },
  ];

  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-5">
            <Zap className="w-3.5 h-3.5" /> {t('landingFeaturesTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('landingFeaturesTitle')}{' '}
            <span className="gradient-text">{t('landingFeaturesHighlight')}</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            {t('landingFeaturesSubtitle')}
          </p>
        </FadeIn>

        {/* First 2 large cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {features.filter((f) => f.large).map((f, i) => {
            const c = FEATURE_COLORS[f.color];
            return (
              <FadeIn key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, borderColor: 'rgba(59,130,246,0.3)' }}
                  className="glass-card rounded-2xl p-8 border border-b-border transition-all duration-300 h-full"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${c} border mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                  <p className="text-muted leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>

        {/* Remaining 6 cards in 3x2 grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.filter((f) => !f.large).map((f, i) => {
            const c = FEATURE_COLORS[f.color];
            return (
              <FadeIn key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, borderColor: 'rgba(59,130,246,0.3)' }}
                  className="glass-card rounded-2xl p-6 border border-b-border transition-all duration-300 h-full"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${c} border mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
