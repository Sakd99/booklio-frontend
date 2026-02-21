import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Zap, Bot, Calendar, Shield, BarChart3, Globe,
  MessageSquare, CheckCircle2, ArrowRight,
  ChevronDown, ChevronLeft, ChevronRight, Star, Menu, X, Sparkles, Clock,
  Users, TrendingUp, Sun, Moon
} from 'lucide-react';
import { useI18n } from '../store/i18n.store';
import { useThemeStore } from '../store/theme.store';
import { LOCALE_META, type Locale } from '../i18n/translations';

// ─── Animated Counter ────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Section Wrapper ────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Colors ─────────────────────────────────────────────────
const FEATURE_COLORS: Record<string, string> = {
  blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400',
  violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
  rose: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-400',
  amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
  emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
  cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
};

// ─── Pricing ────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Free',
    price: 0,
    desc: 'Try the platform at no cost',
    accent: 'text-dim',
    border: 'border-b-border',
    bg: '',
    features: ['1 channel', '500 messages/mo', '100 AI calls/mo', '10 bookings/mo', '1 team member'],
    popular: false,
  },
  {
    name: 'Starter',
    price: 9,
    desc: 'Perfect for small businesses',
    accent: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    features: ['1 channel', '2,000 messages/mo', '500 AI calls/mo', '50 bookings/mo', '2 team members', 'Bookings'],
    popular: false,
  },
  {
    name: 'Business',
    price: 29,
    desc: 'Best value for growing businesses',
    accent: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    features: ['2 channels', '10,000 messages/mo', '2,500 AI calls/mo', '500 bookings/mo', '5 team members', 'Analytics'],
    popular: true,
  },
  {
    name: 'Pro',
    price: 49,
    desc: 'For businesses scaling fast',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    features: ['3 channels', '30,000 messages/mo', '10,000 AI calls/mo', '2,000 bookings/mo', '10 team members', 'Priority support', 'Custom workflows'],
    popular: false,
  },
  {
    name: 'Agency',
    price: 99,
    desc: 'For agencies managing clients',
    accent: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    features: ['5 channels', '100,000 messages/mo', '30,000 AI calls/mo', '10,000 bookings/mo', '25 team members', 'White-label', 'Dedicated support'],
    popular: false,
  },
];

// ─── Navbar ────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { label: t('landingFeaturesTag'), href: '#features' },
    { label: t('landingHowTag'), href: '#how' },
    { label: t('landingPricingTag'), href: '#pricing' },
    { label: t('landingBlog'), href: '/blog', isRoute: true },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-base/80 backdrop-blur-xl border-b border-b-border shadow-xl' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">Booklio</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) =>
            l.isRoute ? (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTAs + Theme + Lang */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Language dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs">{LOCALE_META[locale].flag}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full right-0 mt-1 rounded-xl glass-card border border-b-border shadow-xl overflow-hidden z-50 min-w-[160px]"
                >
                  {(Object.keys(LOCALE_META) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                        locale === loc
                          ? 'bg-blue-500/10 text-blue-500 font-medium'
                          : 'text-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      <span>{LOCALE_META[loc].flag}</span>
                      <span>{LOCALE_META[loc].label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/login" className="text-sm text-muted hover:text-foreground transition-colors px-4 py-2">
            {t('landingSignIn')}
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t('landingGetStarted')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-muted hover:text-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-base/95 backdrop-blur-xl border-b border-b-border px-6 pb-6"
          >
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((l) =>
                l.isRoute ? (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="text-muted hover:text-foreground transition-colors"
                  >
                    {l.label}
                  </a>
                )
              )}

              {/* Mobile theme + lang controls */}
              <div className="flex items-center gap-3 pt-2 border-t border-b-border">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface rounded-lg transition-all"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? t('lightMode') : t('darkMode')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LOCALE_META) as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocale(loc); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      locale === loc
                        ? 'bg-blue-500/10 text-blue-500 font-medium'
                        : 'text-muted hover:text-foreground hover:bg-surface'
                    }`}
                  >
                    <span>{LOCALE_META[loc].flag}</span>
                    <span>{LOCALE_META[loc].label}</span>
                  </button>
                ))}
              </div>

              <Link to="/login" className="text-muted hover:text-foreground transition-colors">
                {t('landingSignIn')}
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-5 py-2.5 rounded-xl text-center font-medium"
              >
                {t('landingGetStarted')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Pricing Carousel (3 visible) ───────────────────────────────────
function PricingCarousel({ plans, t }: { plans: typeof PLANS; t: (k: any) => string }) {
  const perPage = 3;
  const totalPages = Math.ceil(plans.length / perPage);
  const [page, setPage] = useState(0); // page 0 = first 3 (Free, Starter, Business)

  const prevPage = () => setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const nextPage = () => setPage((p) => (p === totalPages - 1 ? 0 : p + 1));

  const visible = plans.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        {/* Left arrow */}
        <button
          onClick={prevPage}
          className="flex-shrink-0 w-12 h-12 rounded-full border border-b-border bg-surface hover:bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-all hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Cards */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {visible.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border transition-all duration-300 h-full flex flex-col ${
                    plan.popular
                      ? 'bg-gradient-to-b from-violet-500/15 to-violet-500/5 border-violet-500/40 shadow-xl shadow-violet-500/10 p-6 scale-[1.03]'
                      : `glass-card ${plan.border} ${plan.bg} p-6`
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-violet-500/25">
                      {t('landingBestValue')}
                    </div>
                  )}

                  <div className="mb-4">
                    <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${plan.accent}`}>
                      {plan.name}
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-black text-foreground">{t('landingFree')}</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-foreground">${plan.price}</span>
                        <span className="text-muted text-sm">/mo</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-violet-400' : plan.accent}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/register"
                    className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all mt-auto ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                        : 'bg-surface text-foreground hover:bg-surface-hover border border-b-border'
                    }`}
                  >
                    {plan.price === 0 ? t('landingStartFreeBtn') : t('landingGetStartedBtn')}
                  </Link>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right arrow */}
        <button
          onClick={nextPage}
          className="flex-shrink-0 w-12 h-12 rounded-full border border-b-border bg-surface hover:bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-all hover:scale-105"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`transition-all duration-300 rounded-full ${
              i === page
                ? 'w-8 h-2.5 bg-gradient-to-r from-blue-500 to-violet-500'
                : 'w-2.5 h-2.5 bg-surface-hover hover:bg-muted/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function Landing() {
  const { t } = useI18n();

  const FEATURES = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: t('featureAi'),
      desc: t('featureAiDesc'),
      color: 'blue',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t('featureScheduling'),
      desc: t('featureSchedulingDesc'),
      color: 'violet',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: t('featureChannels'),
      desc: t('featureChannelsDesc'),
      color: 'rose',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('featureWebhooks'),
      desc: t('featureWebhooksDesc'),
      color: 'amber',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('featureSecurity'),
      desc: t('featureSecurityDesc'),
      color: 'emerald',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: t('featureAnalytics'),
      desc: t('featureAnalyticsDesc'),
      color: 'cyan',
    },
  ];

  const STEPS = [
    {
      num: '01',
      icon: <Globe className="w-7 h-7" />,
      title: t('stepConnect'),
      desc: t('stepConnectDesc'),
      color: 'blue',
    },
    {
      num: '02',
      icon: <Calendar className="w-7 h-7" />,
      title: t('stepServices'),
      desc: t('stepServicesDesc'),
      color: 'violet',
    },
    {
      num: '03',
      icon: <MessageSquare className="w-7 h-7" />,
      title: t('stepAi'),
      desc: t('stepAiDesc'),
      color: 'emerald',
    },
  ];

  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <Navbar />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
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

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          {t('landingBadge')}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6"
        >
          {t('landingHeadline1')}{' '}
          <span className="gradient-text">{t('landingHeadline2')}</span>
          <br />{t('landingHeadline1') === 'Turn every DM into' ? 'automatically' : ''}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10"
        >
          {t('landingSubtext')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            to="/register"
            className="group flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/25 text-base"
          >
            {t('landingStartFree')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how"
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors font-medium text-base"
          >
            {t('landingSeeHow')}
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex items-center gap-6 text-dim text-sm"
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

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 w-full max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-4 border border-b-border shadow-2xl">
            <div className="bg-surface rounded-2xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-b-border">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-surface rounded-lg px-3 py-1 text-xs text-dim">
                  app.booklio.dev/dashboard
                </div>
              </div>
              {/* Dashboard mockup content */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Bookings', val: '248', color: 'blue' },
                    { label: 'Messages', val: '1.2k', color: 'violet' },
                    { label: 'Channels', val: '3', color: 'emerald' },
                    { label: 'Revenue', val: '$4.8k', color: 'rose' },
                  ].map((s) => (
                    <div key={s.label} className="glass-card rounded-xl p-4">
                      <div className="text-xl font-bold text-foreground">{s.val}</div>
                      <div className="text-xs text-muted mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 glass-card rounded-xl p-4 h-28">
                    <div className="text-xs text-muted mb-2">Recent bookings</div>
                    <div className="space-y-2">
                      {['Ahmed M. — Haircut 10:00', 'Sara K. — Beard Trim 11:00', 'Omar H. — Full Service 14:00'].map((b) => (
                        <div key={b} className="flex items-center gap-2 text-xs text-muted">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4 h-28">
                    <div className="text-xs text-muted mb-2">AI activity</div>
                    <div className="space-y-1.5">
                      {['Intent: booking', 'Slot confirmed', 'Reply sent'].map((a) => (
                        <div key={a} className="text-xs text-emerald-400/70 flex items-center gap-1.5">
                          <Zap className="w-3 h-3" /> {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section className="py-20 border-y border-b-border">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { to: 10000, suffix: '+', label: t('landingStatBusinesses'), icon: <Users className="w-5 h-5" /> },
            { to: 2000000, suffix: '+', label: t('landingStatMessages'), icon: <MessageSquare className="w-5 h-5" /> },
            { to: 99, suffix: '.9%', label: t('landingStatUptime'), icon: <TrendingUp className="w-5 h-5" /> },
            { to: 200, suffix: 'ms', label: t('landingStatResponse'), icon: <Clock className="w-5 h-5" /> },
          ].map((s, i) => (
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

      {/* ── FEATURES ─────────────────────────────── */}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
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

      {/* ── HOW IT WORKS ─────────────────────────── */}
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
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-violet-500/30" />
            <div className="hidden md:block absolute top-16 left-2/3 right-0 h-px bg-gradient-to-r from-violet-500/30 to-violet-500/0" />

            {STEPS.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.15}>
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                      i === 0 ? 'bg-blue-500/10 text-blue-400' :
                      i === 1 ? 'bg-violet-500/10 text-violet-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    } border ${
                      i === 0 ? 'border-blue-500/20' :
                      i === 1 ? 'border-violet-500/20' :
                      'border-emerald-500/20'
                    }`}
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

      {/* ── PRICING ──────────────────────────────── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-5">
              <Star className="w-3.5 h-3.5" /> {t('landingPricingTag')}
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t('landingPricingTitle')}{' '}
              <span className="gradient-text">{t('landingPricingHighlight')}</span>
            </h2>
            <p className="text-muted text-lg">{t('landingPricingSubtitle')}</p>
          </FadeIn>

          <FadeIn>
            <PricingCarousel plans={PLANS} t={t} />
          </FadeIn>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section className="py-24 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-3xl p-12 border border-blue-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 pointer-events-none" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500 rounded-full blur-[80px] opacity-20"
              />
              <h2 className="text-4xl font-black text-foreground mb-4 relative z-10">
                {t('landingCtaTitle')} <span className="gradient-text">{t('landingCtaHighlight')}</span>?
              </h2>
              <p className="text-muted text-lg mb-8 relative z-10">
                {t('landingCtaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link
                  to="/register"
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  {t('landingStartFree')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-surface border border-b-border text-foreground font-semibold px-8 py-4 rounded-xl hover:bg-surface-hover transition-all"
                >
                  {t('landingSignIn')}
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-b-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-lg gradient-text">Booklio</span>
              </div>
              <p className="text-dim text-sm leading-relaxed">
                {t('footerDesc')}
              </p>
            </div>
            {[
              { title: t('footerProduct'), links: [
                { label: t('landingFeaturesTag'), href: '#features', isRoute: false },
                { label: t('landingPricingTag'), href: '#pricing', isRoute: false },
                { label: t('landingHowTag'), href: '#how', isRoute: false },
              ]},
              { title: t('footerCompany'), links: [
                { label: t('landingBlog'), href: '/blog', isRoute: true },
              ]},
              { title: t('footerSupport'), links: [
                { label: t('landingSignIn'), href: '/login', isRoute: true },
                { label: t('landingGetStarted'), href: '/register', isRoute: true },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.isRoute ? (
                        <Link to={l.href} className="text-sm text-dim hover:text-muted transition-colors">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="text-sm text-dim hover:text-muted transition-colors">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-b-border gap-4">
            <p className="text-sm text-dim">&copy; 2026 Booklio. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-dim">
              <span>Built with</span>
              <span className="text-red-400">&hearts;</span>
              <span>{t('footerBuiltWith')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
