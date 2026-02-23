import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowRight, CheckCircle2, Pause, Play,
  Scissors, Stethoscope, UtensilsCrossed, Building2, Heart, Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../store/i18n.store';

type Category = 'beauty' | 'dental' | 'restaurant' | 'realestate' | 'spa' | 'medical';

const CATEGORY_KEYS: Category[] = ['beauty', 'dental', 'restaurant', 'realestate', 'spa', 'medical'];
const AUTO_INTERVAL = 3500; // ms between auto-switches

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  beauty: <Scissors className="w-4 h-4" />,
  dental: <Stethoscope className="w-4 h-4" />,
  restaurant: <UtensilsCrossed className="w-4 h-4" />,
  realestate: <Building2 className="w-4 h-4" />,
  spa: <Heart className="w-4 h-4" />,
  medical: <Activity className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<Category, { bg: string; border: string; text: string; gradient: string; progress: string }> = {
  beauty: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500', gradient: 'from-pink-500 to-rose-500', progress: 'bg-pink-500' },
  dental: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-500', gradient: 'from-cyan-500 to-blue-500', progress: 'bg-cyan-500' },
  restaurant: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', gradient: 'from-amber-500 to-orange-500', progress: 'bg-amber-500' },
  realestate: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', gradient: 'from-emerald-500 to-teal-500', progress: 'bg-emerald-500' },
  spa: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-500', gradient: 'from-violet-500 to-purple-500', progress: 'bg-violet-500' },
  medical: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', gradient: 'from-blue-500 to-indigo-500', progress: 'bg-blue-500' },
};

function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const prevText = useRef('');

  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

export default function UseCasesShowcase() {
  const { t } = useI18n();
  const [active, setActive] = useState<Category>('beauty');
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const startAuto = useCallback(() => {
    clearTimers();
    setProgress(0);

    const TICK = 50;
    const steps = AUTO_INTERVAL / TICK;
    let step = 0;

    progressRef.current = setInterval(() => {
      step++;
      setProgress(Math.min((step / steps) * 100, 100));
    }, TICK);

    intervalRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setActive((prev) => {
        const idx = CATEGORY_KEYS.indexOf(prev);
        return CATEGORY_KEYS[(idx + 1) % CATEGORY_KEYS.length];
      });
      step = 0;
      setProgress(0);
    }, AUTO_INTERVAL);
  }, [clearTimers]);

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      clearTimers();
      setProgress(0);
    } else {
      startAuto();
    }
    return clearTimers;
  }, [paused, startAuto, clearTimers]);

  const handleCategoryClick = (key: Category) => {
    setActive(key);
    setPaused(true);
  };

  const handleTogglePause = () => {
    setPaused((p) => !p);
  };

  const categories: { key: Category; label: string }[] = [
    { key: 'beauty', label: t('ucCatBeauty') },
    { key: 'dental', label: t('ucCatDental') },
    { key: 'restaurant', label: t('ucCatRestaurant') },
    { key: 'realestate', label: t('ucCatRealEstate') },
    { key: 'spa', label: t('ucCatSpa') },
    { key: 'medical', label: t('ucCatMedical') },
  ];

  const prompts: Record<Category, string> = {
    beauty: t('ucPromptBeauty'),
    dental: t('ucPromptDental'),
    restaurant: t('ucPromptRestaurant'),
    realestate: t('ucPromptRealEstate'),
    spa: t('ucPromptSpa'),
    medical: t('ucPromptMedical'),
  };

  const businessNames: Record<Category, string> = {
    beauty: t('ucBizBeauty'),
    dental: t('ucBizDental'),
    restaurant: t('ucBizRestaurant'),
    realestate: t('ucBizRealEstate'),
    spa: t('ucBizSpa'),
    medical: t('ucBizMedical'),
  };

  const stats: Record<Category, { pct: string; label: string }[]> = {
    beauty: [
      { pct: '85%', label: t('ucStatBeauty1') },
      { pct: '40%', label: t('ucStatBeauty2') },
      { pct: '3x', label: t('ucStatBeauty3') },
    ],
    dental: [
      { pct: '32%', label: t('ucStatDental1') },
      { pct: '27%', label: t('ucStatDental2') },
      { pct: '24%', label: t('ucStatDental3') },
    ],
    restaurant: [
      { pct: '45%', label: t('ucStatRestaurant1') },
      { pct: '60%', label: t('ucStatRestaurant2') },
      { pct: '2x', label: t('ucStatRestaurant3') },
    ],
    realestate: [
      { pct: '50%', label: t('ucStatRealEstate1') },
      { pct: '35%', label: t('ucStatRealEstate2') },
      { pct: '3x', label: t('ucStatRealEstate3') },
    ],
    spa: [
      { pct: '38%', label: t('ucStatSpa1') },
      { pct: '55%', label: t('ucStatSpa2') },
      { pct: '2.5x', label: t('ucStatSpa3') },
    ],
    medical: [
      { pct: '42%', label: t('ucStatMedical1') },
      { pct: '30%', label: t('ucStatMedical2') },
      { pct: '65%', label: t('ucStatMedical3') },
    ],
  };

  const colors = CATEGORY_COLORS[active];
  const { displayed, done } = useTypewriter(prompts[active], 20);

  return (
    <section className="relative min-h-screen flex items-center px-6 pt-24 pb-20">
      <div className="max-w-7xl mx-auto w-full relative">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> {t('ucSectionTag')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.08] tracking-tight mb-5">
            {t('ucSectionTitle')}{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="gradient-text inline-block"
              >
                {businessNames[active]}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">{t('ucSectionSubtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Prompt + Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6"
          >
            {/* AI Prompt Box */}
            <div className="rounded-2xl border border-b-border bg-surface/80 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/5">
              <div className="px-5 py-3.5 border-b border-b-border flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-muted">{t('ucPromptLabel')}</span>
              </div>
              <div className="p-6 min-h-[140px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-foreground text-base leading-relaxed"
                  >
                    {displayed}
                    {!done && (
                      <span className="inline-block w-0.5 h-5 bg-blue-500 ml-0.5 animate-pulse align-middle" />
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="px-5 py-3.5 border-t border-b-border flex items-center justify-between">
                <span className="text-xs text-dim">{t('ucPromptHint')}</span>
                <button className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:opacity-90 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => {
                const catColors = CATEGORY_COLORS[cat.key];
                const isActive = active === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border overflow-hidden ${
                      isActive
                        ? `${catColors.bg} ${catColors.text} ${catColors.border} shadow-lg`
                        : 'bg-surface/60 text-muted border-b-border hover:text-foreground hover:border-blue-500/20'
                    }`}
                  >
                    {/* Auto-progress bar at bottom of active pill */}
                    {isActive && !paused && (
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 ${catColors.progress} transition-none`}
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    {CATEGORY_ICONS[cat.key]}
                    {cat.label}
                  </button>
                );
              })}

              {/* Pause / Play toggle */}
              <button
                onClick={handleTogglePause}
                title={paused ? 'Resume auto-play' : 'Pause auto-play'}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-b-border bg-surface/60 text-muted hover:text-foreground hover:border-blue-500/20 transition-all duration-200"
              >
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 text-base"
              >
                {t('ucCtaBtn')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Stats cards */}
                {stats[active].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl p-5 border border-b-border bg-surface/80 backdrop-blur-sm shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                        {stat.pct}
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Features */}
                <div className="rounded-xl p-5 border border-b-border bg-surface/80 backdrop-blur-sm space-y-3">
                  {[t('ucFeature1'), t('ucFeature2'), t('ucFeature3')].map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
