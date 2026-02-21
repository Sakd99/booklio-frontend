import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Calendar, User, Menu, X,
  Sun, Moon, Globe, BookOpen, FileX,
} from 'lucide-react';
import { blogApi } from '../api/blog.api';
import Spinner from '../components/ui/Spinner';
import { useI18n } from '../store/i18n.store';
import { useThemeStore } from '../store/theme.store';
import { LOCALE_META, type Locale } from '../i18n/translations';

// ── Navbar (shared pattern with Blog page) ──────────────────────────
function BlogNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

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

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-surface"
            >
              <Globe className="w-4 h-4" />
              {LOCALE_META[locale].label}
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-1 glass-card border border-b-border rounded-xl py-1 min-w-[140px] shadow-xl z-50"
                >
                  {(Object.keys(LOCALE_META) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full text-start px-4 py-2 text-sm transition-colors ${
                        locale === loc ? 'text-blue-500 bg-blue-500/5' : 'text-muted hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      {LOCALE_META[loc].flag} {LOCALE_META[loc].label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-surface"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Back to blog */}
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blogBackToBlog')}
          </Link>

          <Link
            to="/login"
            className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            {t('login')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-muted hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-base/95 backdrop-blur-xl border-b border-b-border px-6 pb-6"
          >
            <div className="flex flex-col gap-4 pt-4">
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t('blogBackToBlog')}
              </Link>
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-muted hover:text-foreground transition-colors">
                {t('blogBackToHome')}
              </Link>
              <button
                onClick={() => { toggleTheme(); setMobileOpen(false); }}
                className="text-start text-muted hover:text-foreground transition-colors"
              >
                {theme === 'dark' ? t('lightMode') : t('darkMode')}
              </button>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(LOCALE_META) as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocale(loc); setMobileOpen(false); }}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      locale === loc
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                        : 'border-b-border text-muted hover:text-foreground'
                    }`}
                  >
                    {LOCALE_META[loc].flag} {LOCALE_META[loc].label}
                  </button>
                ))}
              </div>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-5 py-2.5 rounded-xl text-center font-medium"
              >
                {t('login')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ── Main BlogPost Page ──────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['blog', 'post', slug],
    queryFn: () => blogApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const authorName = post?.author?.name ?? (post?.author?.firstName ? `${post.author.firstName} ${post.author.lastName}`.trim() : null) ?? post?.authorName ?? 'Booklio Team';
  const parsedTags = post?.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];
  const publishedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-base transition-colors duration-200">
      <BlogNavbar />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-10" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-500 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-20">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        )}

        {/* 404 state */}
        {!isLoading && (isError || !post) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <FileX className="w-20 h-20 mx-auto text-muted/30 mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {t('blogNotFound')}
            </h1>
            <p className="text-muted mb-8 max-w-md mx-auto">
              {t('blogNotFoundDesc')}
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('blogBackToBlog')}
            </Link>
          </motion.div>
        )}

        {/* Post content */}
        {!isLoading && post && (
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back link */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('blogBackToBlog')}
            </Link>

            {/* Cover image */}
            {post.coverImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8"
              >
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Tags */}
            {parsedTags && parsedTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2 mb-5"
              >
                {parsedTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6"
            >
              {post.title}
            </motion.h1>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 text-sm text-muted mb-10 pb-8 border-b border-b-border"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {authorName}
              </span>
              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {publishedDate}
                </span>
              )}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="prose-custom"
            >
              <div className="text-foreground/90 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </motion.div>

            {/* Bottom back link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 pt-8 border-t border-b-border"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('blogBackToBlog')}
              </Link>
            </motion.div>
          </motion.article>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-b-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">Booklio</span>
          </div>
          <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Booklio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
