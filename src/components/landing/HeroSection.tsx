import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, CheckCircle2, Zap } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';

export default function HeroSection() {
  const { t } = useI18n();

  const chatMessages = [
    { from: 'user', text: t('heroChatUser1') },
    { from: 'ai', text: t('heroChatAi1') },
    { from: 'user', text: t('heroChatUser2') },
    { from: 'ai', text: t('heroChatAi2') },
  ];

  return (
    <section className="relative min-h-screen flex items-center px-6 pt-20 pb-16">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -top-20 -right-40 w-96 h-96 bg-violet-500 rounded-full blur-[120px] opacity-20"
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-80 bg-blue-600 rounded-full blur-[150px] opacity-10"
        />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
        {/* Left — Text content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            {t('landingBadge')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-4"
          >
            {t('landingHeadline1')}{' '}
            <span className="gradient-text">{t('landingHeadline2')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-base sm:text-lg text-blue-400/80 font-medium mb-4"
          >
            {t('landingHeroChannelLine')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted max-w-xl mb-8"
          >
            {t('landingSubtext')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/25 text-base"
            >
              {t('landingStartAutomating')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how"
              className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-medium text-base px-4 py-4"
            >
              {t('landingSeeHow')}
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-dim text-sm"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('landingNoCreditCard')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('landing2MinSetup')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('landingCancelAnytime')}
            </span>
          </motion.div>
        </div>

        {/* Right — Animated Chat Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden lg:block"
        >
          {/* Phone frame */}
          <div className="relative mx-auto w-[320px] rounded-[2.5rem] border-2 border-b-border bg-surface shadow-2xl shadow-blue-500/10 overflow-hidden">
            {/* Notch */}
            <div className="h-7 bg-surface flex items-center justify-center">
              <div className="w-20 h-4 bg-base rounded-full" />
            </div>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-b-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Convly AI</div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t('chatStatusOnline')}
                </div>
              </div>
            </div>
            {/* Chat messages */}
            <div className="p-4 space-y-3 min-h-[300px] bg-base">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.6, duration: 0.4 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-br-md'
                      : 'bg-surface border border-b-border text-foreground rounded-bl-md'
                  }`}>
                    {msg.from === 'ai' && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-400 mb-1">
                        <Zap className="w-2.5 h-2.5" /> AI
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Input bar */}
            <div className="px-4 py-3 border-t border-b-border flex items-center gap-2">
              <div className="flex-1 bg-base rounded-full px-4 py-2 text-[11px] text-dim border border-b-border">
                {t('chatTypeMessage')}
              </div>
            </div>
            {/* Home indicator */}
            <div className="h-5 flex items-center justify-center">
              <div className="w-24 h-1 bg-muted/30 rounded-full" />
            </div>
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-8 top-20 glass-card rounded-xl px-3 py-2 border border-emerald-500/20 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-foreground font-medium">{t('heroBadgeBookingConfirmed')}</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -right-4 bottom-28 glass-card rounded-xl px-3 py-2 border border-blue-500/20 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-foreground font-medium">{t('heroBadgeAiReplied')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
