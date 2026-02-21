import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, ChevronLeft, ChevronRight,
  Calendar, User, Menu, X, Sun, Moon, Globe,
  BookOpen,
} from 'lucide-react';
import { blogApi } from '../api/blog.api';
import Spinner from '../components/ui/Spinner';
import { useI18n } from '../store/i18n.store';
import { useThemeStore } from '../store/theme.store';
import { LOCALE_META, type Locale } from '../i18n/translations';

// ── Navbar (matches landing page pattern) ────────────────────────────
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

          {/* Back to home */}
          <Link
            to="/"
            className="text-sm text-muted hover:text-foreground transition-colors px-3 py-2"
          >
            {t('blogBackToHome')}
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

// ── Blog Post Card ──────────────────────────────────────────────────
interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  author?: { name: string };
  authorName?: string;
  tags?: string[];
}

function BlogCard({ post, index }: { post: BlogPostData; index: number }) {
  const { t } = useI18n();

  const authorName = post.author?.name ?? post.authorName ?? 'Booklio Team';
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link to={`/blog/${post.slug}`} className="block group h-full">
        <motion.div
          whileHover={{ y: -6 }}
          className="glass-card rounded-2xl overflow-hidden border border-b-border transition-all duration-300 h-full flex flex-col"
        >
          {/* Cover image or gradient placeholder */}
          <div className="relative w-full h-48 overflow-hidden">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-500/40" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-b-border">
              <div className="flex items-center gap-3 text-xs text-muted">
                {publishedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {publishedDate}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {authorName}
                </span>
              </div>
              <span className="text-xs font-medium text-blue-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                {t('readMore')}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Main Blog Page ──────────────────────────────────────────────────
export default function Blog() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['blog', 'published', page],
    queryFn: () => blogApi.listPublished(page),
  });

  const posts: BlogPostData[] = data?.data ?? data?.posts ?? [];
  const total: number = data?.total ?? 0;
  const limit = 9;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-base transition-colors duration-200">
      <BlogNavbar />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-10" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-500 rounded-full blur-[120px] opacity-10" />
      </div>

      {/* Header */}
      <section className="relative pt-28 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-medium mb-6"
          >
            <BookOpen className="w-4 h-4" />
            {t('blogTitle')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-foreground mb-4"
          >
            {t('blogTitle')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted text-lg max-w-2xl mx-auto"
          >
            {t('blogSubtitle')}
          </motion.p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="relative px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <Spinner size="lg" />
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="w-16 h-16 mx-auto text-muted/30 mb-4" />
              <p className="text-muted text-lg">{t('noPosts')}</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <BlogCard key={post.id ?? post.slug} post={post} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center gap-3 mt-12"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-b-border text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          p === page
                            ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-b-border'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl border border-b-border text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

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
