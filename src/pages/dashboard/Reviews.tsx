import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Eye, EyeOff, MessageSquare, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { reviewsApi } from '../../api/reviews.api';
import Spinner from '../../components/ui/Spinner';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-dim'}`} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const qc = useQueryClient();

  const { data: stats } = useQuery({ queryKey: ['review-stats'], queryFn: reviewsApi.stats });
  const { data, isLoading } = useQuery({ queryKey: ['reviews'], queryFn: () => reviewsApi.list() });

  const toggleMut = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      reviewsApi.togglePublic(id, isPublic),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Visibility updated');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customer Reviews</h1>
        <p className="text-sm text-muted mt-1">Reviews collected automatically after completed appointments.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted mt-1">Total Reviews</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.avgRating}</div>
            <div className="flex justify-center mt-1"><StarRating rating={Math.round(stats.avgRating)} /></div>
          </motion.div>
          {stats.distribution.slice(3).reverse().map((d, i) => (
            <motion.div key={d.star} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{d.count}</div>
              <div className="flex justify-center mt-1">
                {Array(d.star).fill(0).map((_, j) => <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.total > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Rating Distribution
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const d = stats.distribution.find((x) => x.star === star);
              const pct = stats.total > 0 ? Math.round(((d?.count ?? 0) / stats.total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-xs text-muted">{star}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted w-8 text-right">{d?.count ?? 0}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Spinner /></div>
      ) : !data?.items.length ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-dim mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No reviews yet</h3>
          <p className="text-sm text-muted">Enable review requests in Reminders settings to start collecting reviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((review, i) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-card border rounded-2xl p-5 transition-opacity ${!review.isPublic ? 'opacity-60 border-border' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{review.customerName}</div>
                      <div className="text-[11px] text-dim">{dayjs(review.createdAt).format('MMM D, YYYY')}</div>
                    </div>
                    <StarRating rating={review.rating} />
                    {review.channel && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted capitalize">{review.channel.replace('_', ' ')}</span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted pl-11">{review.comment}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleMut.mutate({ id: review.id, isPublic: !review.isPublic })}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${review.isPublic ? 'text-blue-500 hover:bg-blue-500/10' : 'text-dim hover:bg-surface'}`}
                  title={review.isPublic ? 'Make private' : 'Make public'}
                >
                  {review.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
