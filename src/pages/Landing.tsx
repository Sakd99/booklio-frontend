import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import {
  Zap, Bot, Calendar, Shield, BarChart3, Globe,
  Instagram, MessageSquare, CheckCircle2, ArrowRight,
  ChevronDown, Star, Menu, X, Sparkles, Clock,
  Users, TrendingUp
} from 'lucide-react';

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

// ─── Features ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'AI-Powered Responses',
    desc: 'Qwen AI handles customer Q&A 24/7 — answers questions, detects booking intent, and guides users through your flow.',
    color: 'blue',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Smart Scheduling',
    desc: 'Customers book slots directly inside DMs. Real-time availability, buffer times, and conflict prevention built-in.',
    color: 'violet',
  },
  {
    icon: <Instagram className="w-6 h-6" />,
    title: 'Instagram & TikTok',
    desc: 'One-click OAuth connection. No developer needed. Works with all business accounts.',
    color: 'rose',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Webhooks',
    desc: 'Sub-200ms webhook processing. Messages reach your customers before they stop looking at their screen.',
    color: 'amber',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Enterprise Security',
    desc: 'AES-256-GCM token encryption, JWT rotation, HMAC webhook verification, and per-tenant data isolation.',
    color: 'emerald',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Usage Analytics',
    desc: 'Track messages, bookings, and AI calls per month. Plan-aware limits with real-time Redis counters.',
    color: 'cyan',
  },
];

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
    accent: 'text-white/50',
    border: 'border-white/5',
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

// ─── Steps ─────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    icon: <Instagram className="w-7 h-7" />,
    title: 'Connect your account',
    desc: 'One-click OAuth for Instagram or TikTok. No API keys, no developer needed. Done in 30 seconds.',
    color: 'blue',
  },
  {
    num: '02',
    icon: <Calendar className="w-7 h-7" />,
    title: 'Set up your services',
    desc: 'Add your services, prices, and availability slots. The AI learns what you offer.',
    color: 'violet',
  },
  {
    num: '03',
    icon: <MessageSquare className="w-7 h-7" />,
    title: 'AI handles the rest',
    desc: 'Customers DM you. AI answers questions, detects booking intent, and confirms appointments — automatically.',
    color: 'emerald',
  },
];

// ─── Navbar ────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-base/80 backdrop-blur-xl border-b border-white/5 shadow-xl' : ''
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
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-white/70 hover:text-white"
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
            className="md:hidden bg-base/95 backdrop-blur-xl border-b border-white/5 px-6 pb-6"
          >
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <Link to="/login" className="text-white/70 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-5 py-2.5 rounded-xl text-center font-medium"
              >
                Get started free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] overflow-x-hidden">
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
          AI-Powered DM Booking Automation
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6"
        >
          Turn every DM into{' '}
          <span className="gradient-text">a booking</span>
          <br />automatically
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10"
        >
          Booklio connects your Instagram and TikTok DMs to an AI that answers questions,
          detects booking intent, and schedules appointments — all without lifting a finger.
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
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-medium text-base"
          >
            See how it works
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 flex items-center gap-6 text-white/30 text-sm"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2-min setup
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime
          </span>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 w-full max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-4 border border-white/5 shadow-2xl">
            <div className="bg-[#0d1424] rounded-2xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded-lg px-3 py-1 text-xs text-white/30">
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
                      <div className="text-xl font-bold text-white">{s.val}</div>
                      <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 glass-card rounded-xl p-4 h-28">
                    <div className="text-xs text-white/40 mb-2">Recent bookings</div>
                    <div className="space-y-2">
                      {['Ahmed M. — Haircut 10:00', 'Sara K. — Beard Trim 11:00', 'Omar H. — Full Service 14:00'].map((b) => (
                        <div key={b} className="flex items-center gap-2 text-xs text-white/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-4 h-28">
                    <div className="text-xs text-white/40 mb-2">AI activity</div>
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
      <section className="py-20 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { to: 10000, suffix: '+', label: 'Businesses', icon: <Users className="w-5 h-5" /> },
            { to: 2000000, suffix: '+', label: 'Messages sent', icon: <MessageSquare className="w-5 h-5" /> },
            { to: 99, suffix: '.9%', label: 'Uptime SLA', icon: <TrendingUp className="w-5 h-5" /> },
            { to: 200, suffix: 'ms', label: 'Avg response', icon: <Clock className="w-5 h-5" /> },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.1} className="flex flex-col items-center gap-2">
              <div className="text-white/30 mb-1">{s.icon}</div>
              <div className="text-4xl font-black gradient-text">
                <AnimatedCounter to={s.to} suffix={s.suffix} />
              </div>
              <div className="text-sm text-white/40">{s.label}</div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-5">
              <Zap className="w-3.5 h-3.5" /> Features
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Everything you need to{' '}
              <span className="gradient-text">automate bookings</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Built for salons, studios, clinics, coaches — anyone who takes appointments via social DMs.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const c = FEATURE_COLORS[f.color];
              return (
                <FadeIn key={f.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6, borderColor: 'rgba(59,130,246,0.3)' }}
                    className="glass-card rounded-2xl p-6 border border-white/5 transition-all duration-300 h-full"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${c} border mb-4`}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
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
              <Globe className="w-3.5 h-3.5" /> How it works
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Live in{' '}
              <span className="gradient-text">3 simple steps</span>
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
                  <div className="text-xs font-bold text-white/20 mb-2 tracking-widest">{s.num}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
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
              <Star className="w-3.5 h-3.5" /> Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Simple, transparent{' '}
              <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-white/40 text-lg">Start free, scale as you grow. No hidden fees.</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-violet-500/15 to-violet-500/5 border-violet-500/40 shadow-xl shadow-violet-500/10'
                      : `glass-card ${plan.border} ${plan.bg}`
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      Best Value
                    </div>
                  )}
                  <div className="mb-4">
                    <div className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${plan.accent}`}>
                      {plan.name}
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{plan.desc}</p>
                  </div>
                  <div className="mb-5">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-black text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-white">${plan.price}</span>
                        <span className="text-white/40 text-xs">/mo</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-white/55">
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-violet-400' : plan.accent}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={`block w-full text-center py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/20'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {plan.price === 0 ? 'Start free' : 'Get started'}
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
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
              <h2 className="text-4xl font-black text-white mb-4">
                Ready to <span className="gradient-text">automate</span>?
              </h2>
              <p className="text-white/40 text-lg mb-8">
                Join thousands of businesses turning DMs into confirmed bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-lg gradient-text">Booklio</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed">
                AI-powered DM booking automation for Instagram & TikTok businesses.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Documentation', 'Status', 'Community', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
            <p className="text-sm text-white/20">© 2026 Booklio. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-white/20">
              <span>Built with</span>
              <span className="text-red-400">♥</span>
              <span>for DM-driven businesses</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
