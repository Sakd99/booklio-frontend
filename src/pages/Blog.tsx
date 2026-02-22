import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight,
  Calendar, User, BookOpen,
} from 'lucide-react';
import { blogApi } from '../api/blog.api';
import Spinner from '../components/ui/Spinner';
import { useI18n } from '../store/i18n.store';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

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

          <div className="p-5 flex flex-col flex-1">
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

            <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-blue-500 transition-colors line-clamp-2">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>
            )}

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

  const rawPosts = data?.items ?? data?.data ?? data?.posts ?? [];
  const posts: BlogPostData[] = rawPosts.map((p: any) => ({
    ...p,
    author: p.author?.name ? p.author : p.author?.firstName ? { name: `${p.author.firstName} ${p.author.lastName}`.trim() } : undefined,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
  }));
  const total: number = data?.total ?? 0;
  const limit = 9;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-base transition-colors duration-200">
      <PublicNavbar />

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

      <PublicFooter />
    </div>
  );
}
