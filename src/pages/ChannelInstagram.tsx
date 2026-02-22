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

const IG_SVG = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z';

export default function ChannelInstagram() {
  const { t } = useI18n();

  const features = [
    { icon: <Bot className="w-5 h-5" />, title: t('igPageFeature1Title'), desc: t('igPageFeature1Desc') },
    { icon: <MessageSquare className="w-5 h-5" />, title: t('igPageFeature2Title'), desc: t('igPageFeature2Desc') },
    { icon: <Shield className="w-5 h-5" />, title: t('igPageFeature3Title'), desc: t('igPageFeature3Desc') },
    { icon: <Clock className="w-5 h-5" />, title: t('igPageFeature4Title'), desc: t('igPageFeature4Desc') },
    { icon: <BarChart3 className="w-5 h-5" />, title: t('igPageFeature5Title'), desc: t('igPageFeature5Desc') },
    { icon: <Users className="w-5 h-5" />, title: t('igPageFeature6Title'), desc: t('igPageFeature6Desc') },
  ];

  const useCases = [
    t('igPageUseCase1'), t('igPageUseCase2'), t('igPageUseCase3'),
    t('igPageUseCase4'), t('igPageUseCase5'), t('igPageUseCase6'),
  ];

  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500 rounded-full blur-[120px] opacity-15" />
          <div className="absolute -top-20 -right-40 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-10" />
        </div>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d={IG_SVG} /></svg>
              Instagram
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              {t('igPageHeroTitle')}{' '}
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Instagram
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted max-w-xl mb-8"
            >
              {t('igPageHeroDesc')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/25"
              >
                {t('igPageCta')}
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
                <CheckCircle2 className="w-4 h-4 text-pink-500" /> {t('igPageBadge1')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-pink-500" /> {t('igPageBadge2')}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-pink-500" /> {t('igPageBadge3')}
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
            <div className="w-[300px] rounded-[2.5rem] border-2 border-pink-500/30 bg-surface shadow-2xl overflow-hidden">
              <div className="h-6 bg-surface flex items-center justify-center">
                <div className="w-16 h-3 bg-base rounded-full" />
              </div>
              <div className="px-4 py-3 border-b border-b-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current"><path d={IG_SVG} /></svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Convly AI</div>
                  <div className="text-[10px] text-pink-400 flex items-center gap-1">
                    <Zap className="w-2 h-2" /> Active
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2.5 min-h-[240px] bg-base">
                {[
                  { from: 'user', text: 'Hey, can I book a facial?' },
                  { from: 'ai', text: 'Of course! We have openings tomorrow at 2 PM and 4 PM. Which one works?' },
                  { from: 'user', text: '2 PM!' },
                  { from: 'ai', text: 'Booked! See you tomorrow at 2 PM for your facial treatment. ✨' },
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
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
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
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('igPageFeaturesTitle')}</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">{t('igPageFeaturesDesc')}</p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-6 border border-b-border h-full">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
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
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t('igPageUseCasesTitle')}</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="flex items-center gap-3 glass-card rounded-xl p-4 border border-pink-500/20">
                  <CheckCircle2 className="w-5 h-5 text-pink-500 flex-shrink-0" />
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
