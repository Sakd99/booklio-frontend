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

const TT_SVG = 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46v-7.15a8.16 8.16 0 005.58 2.19V11.2a4.85 4.85 0 01-2.41-.65v4.12A6.34 6.34 0 0019.59 6.69z';

export default function ChannelTikTok() {
  const { t } = useI18n();

  const features = [
    { icon: <Bot className="w-5 h-5" />, title: t('ttPageFeature1Title'), desc: t('ttPageFeature1Desc') },
    { icon: <MessageSquare className="w-5 h-5" />, title: t('ttPageFeature2Title'), desc: t('ttPageFeature2Desc') },
    { icon: <Shield className="w-5 h-5" />, title: t('ttPageFeature3Title'), desc: t('ttPageFeature3Desc') },
    { icon: <Clock className="w-5 h-5" />, title: t('ttPageFeature4Title'), desc: t('ttPageFeature4Desc') },
    { icon: <BarChart3 className="w-5 h-5" />, title: t('ttPageFeature5Title'), desc: t('ttPageFeature5Desc') },
    { icon: <Users className="w-5 h-5" />, title: t('ttPageFeature6Title'), desc: t('ttPageFeature6Desc') },
  ];

  const useCases = [
    t('ttPageUseCase1'), t('ttPageUseCase2'), t('ttPageUseCase3'),
    t('ttPageUseCase4'), t('ttPageUseCase5'), t('ttPageUseCase6'),
  ];

  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#fe2c55] rounded-full blur-[120px] opacity-15" />
          <div className="absolute -top-20 -right-40 w-96 h-96 bg-[#25f4ee] rounded-full blur-[120px] opacity-10" />
        </div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fe2c55]/10 border border-[#fe2c55]/20 text-[#fe2c55] text-sm font-medium mb-6"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d={TT_SVG} /></svg>
              TikTok
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              {t('ttPageHeroTitle')}{' '}
              <span className="bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] bg-clip-text text-transparent">
                TikTok
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted max-w-xl mb-8"
            >
              {t('ttPageHeroDesc')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-[#fe2c55]/25"
              >
                {t('ttPageCta')}
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
                <CheckCircle2 className="w-4 h-4 text-[#fe2c55]" /> {t('ttPageBadge1')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#fe2c55]" /> {t('ttPageBadge2')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#fe2c55]" /> {t('ttPageBadge3')}
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
            <div className="w-[300px] rounded-[2.5rem] border-2 border-[#fe2c55]/30 bg-surface shadow-2xl overflow-hidden">
              <div className="h-6 bg-surface flex items-center justify-center">
                <div className="w-16 h-3 bg-base rounded-full" />
              </div>
              <div className="px-4 py-3 border-b border-b-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#fe2c55] to-[#25f4ee] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current"><path d={TT_SVG} /></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Convly AI</div>
                  <div className="text-[10px] text-[#fe2c55] flex items-center gap-1">
                    <Zap className="w-2 h-2" /> {t('chatStatusActive')}
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2.5 min-h-[240px] bg-base">
                {[
                  { from: 'user', text: t('ttPageChatUser1') },
                  { from: 'ai', text: t('ttPageChatAi1') },
                  { from: 'user', text: t('ttPageChatUser2') },
                  { from: 'ai', text: t('ttPageChatAi2') },
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
                        ? 'bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] text-white rounded-br-md'
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

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('ttPageFeaturesTitle')}</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">{t('ttPageFeaturesDesc')}</p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-6 border border-b-border h-full">
                  <div className="w-10 h-10 rounded-xl bg-[#fe2c55]/10 text-[#fe2c55] flex items-center justify-center mb-4">
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
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-[#fe2c55]/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('ttPageUseCasesTitle')}</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="flex items-center gap-3 glass-card rounded-xl p-4 border border-[#fe2c55]/20">
                  <CheckCircle2 className="w-5 h-5 text-[#fe2c55] flex-shrink-0" />
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
