import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import { useThemeStore } from '../../store/theme.store';
import { LOCALE_META, type Locale } from '../../i18n/translations';

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (productRef.current && !productRef.current.contains(e.target as Node)) setProductOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const productLinks = [
    { label: t('landingFeaturesTag'), href: '/features', isRoute: true },
    { label: t('navChannelsLink'), href: '#channels' },
    { label: t('landingPricingTag'), href: '/pricing', isRoute: true },
  ];

  const channelLinks = [
    { label: 'WhatsApp', href: '/whatsapp' },
    { label: 'Instagram', href: '/instagram' },
    { label: 'Messenger', href: '/messenger' },
    { label: 'TikTok', href: '/tiktok' },
  ];

  const navLinks = [
    { label: t('navUseCases'), href: '#use-cases' },
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
          <span className="font-bold text-xl gradient-text">Convly</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Product dropdown */}
          <div className="relative" ref={productRef}>
            <button
              onClick={() => setProductOpen(!productOpen)}
              className="flex items-center gap-1 px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg"
            >
              {t('navProduct')}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {productOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 mt-1 rounded-xl glass-card border border-b-border shadow-xl overflow-hidden z-50 min-w-[180px]"
                >
                  {productLinks.map((l) =>
                    l.isRoute ? (
                      <Link
                        key={l.label}
                        to={l.href}
                        onClick={() => setProductOpen(false)}
                        className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        key={l.label}
                        href={l.href}
                        onClick={() => setProductOpen(false)}
                        className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
                      >
                        {l.label}
                      </a>
                    )
                  )}
                  <div className="border-t border-b-border my-1" />
                  <span className="block px-4 py-1.5 text-[10px] font-semibold text-dim uppercase tracking-wider">{t('navChannelsLink')}</span>
                  {channelLinks.map((l) => (
                    <Link
                      key={l.label}
                      to={l.href}
                      onClick={() => setProductOpen(false)}
                      className="block px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-surface transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.map((l) =>
            l.isRoute ? (
              <Link
                key={l.label}
                to={l.href}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTAs + Theme + Lang */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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
              <span className="text-xs font-semibold text-dim uppercase tracking-wider">{t('navProduct')}</span>
              {productLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-foreground transition-colors pl-2"
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t border-b-border" />
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
