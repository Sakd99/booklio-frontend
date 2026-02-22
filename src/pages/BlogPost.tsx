import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, User, BookOpen, FileX,
} from 'lucide-react';
import { blogApi } from '../api/blog.api';
import Spinner from '../components/ui/Spinner';
import { useI18n } from '../store/i18n.store';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

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
      <PublicNavbar />

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-10" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-violet-500 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-20">
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Spinner size="lg" />
          </div>
        )}

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

        {!isLoading && post && (
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('blogBackToBlog')}
            </Link>

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

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground leading-tight mb-6"
            >
              {post.title}
            </motion.h1>

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

      <PublicFooter />
    </div>
  );
}
