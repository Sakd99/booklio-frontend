import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Zap, MessageSquare, Shield,
  BarChart3, Users, Clock, Bot,
} from 'lucide-react';
import { useI18n } from '../store/i18n.store';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import FadeIn from '../components/landing/FadeIn';
import FaqAccordion from '../components/landing/FaqAccordion';
import CtaBanner from '../components/landing/CtaBanner';

const WA_SVG = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export default function ChannelWhatsApp() {
  const { t } = useI18n();

  const features = [
    { icon: <Bot className="w-5 h-5" />, title: t('waPageFeature1Title'), desc: t('waPageFeature1Desc') },
    { icon: <MessageSquare className="w-5 h-5" />, title: t('waPageFeature2Title'), desc: t('waPageFeature2Desc') },
    { icon: <Shield className="w-5 h-5" />, title: t('waPageFeature3Title'), desc: t('waPageFeature3Desc') },
    { icon: <Clock className="w-5 h-5" />, title: t('waPageFeature4Title'), desc: t('waPageFeature4Desc') },
    { icon: <BarChart3 className="w-5 h-5" />, title: t('waPageFeature5Title'), desc: t('waPageFeature5Desc') },
    { icon: <Users className="w-5 h-5" />, title: t('waPageFeature6Title'), desc: t('waPageFeature6Desc') },
  ];

  const useCases = [
    t('waPageUseCase1'), t('waPageUseCase2'), t('waPageUseCase3'),
    t('waPageUseCase4'), t('waPageUseCase5'), t('waPageUseCase6'),
  ];

  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-green-500 rounded-full blur-[120px] opacity-15" />
          <div className="absolute -top-20 -right-40 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10" />
        </div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d={WA_SVG} /></svg>
              WhatsApp
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              {t('waPageHeroTitle')}{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                WhatsApp
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted max-w-xl mb-8"
            >
              {t('waPageHeroDesc')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-green-500/25"
              >
                {t('waPageCta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-dim text-sm"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {t('waPageBadge1')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {t('waPageBadge2')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {t('waPageBadge3')}
              </span>
            </motion.div>
          </div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden lg:flex justify-center"
          >
            <div className="w-[300px] rounded-[2.5rem] border-2 border-green-500/30 bg-surface shadow-2xl overflow-hidden">
              <div className="h-6 bg-surface flex items-center justify-center">
                <div className="w-16 h-3 bg-base rounded-full" />
              </div>
              <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current"><path d={WA_SVG} /></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Convly AI</div>
                  <div className="text-[10px] text-white/70 flex items-center gap-1">
                    <Zap className="w-2 h-2" /> {t('chatStatusOnline')}
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2.5 min-h-[240px] bg-base">
                {[
                  { from: 'user', text: t('waPageChatUser1') },
                  { from: 'ai', text: t('waPageChatAi1') },
                  { from: 'user', text: t('waPageChatUser2') },
                  { from: 'ai', text: t('waPageChatAi2') },
                ].map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.5 }}
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[78%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-green-500/20 border border-green-500/30 text-foreground rounded-br-md'
                        : 'bg-surface border border-b-border text-foreground rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="h-4 flex items-center justify-center">
                <div className="w-20 h-1 bg-muted/20 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('waPageFeaturesTitle')}</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">{t('waPageFeaturesDesc')}</p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-6 border border-b-border h-full">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('waPageUseCasesTitle')}</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="flex items-center gap-3 glass-card rounded-xl p-4 border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground text-sm">{uc}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FaqAccordion />
      <CtaBanner />
      <PublicFooter />
    </div>
  );
}
