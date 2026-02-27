import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { notificationsApi } from '../../api/notifications.api';
import { useI18n } from '../../store/i18n.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TYPE_COLORS: Record<string, string> = {
  BROADCAST: 'bg-violet-500',
  BOOKING_NEW: 'bg-emerald-500',
  BOOKING_STATUS: 'bg-blue-500',
  CONVERSATION_NEW: 'bg-orange-500',
  SYSTEM: 'bg-gray-500',
};

export default function NotificationBell() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30000,
  });

  const { data: listData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(1, 10),
    enabled: open,
  });

  const markReadMut = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notification-count'] });
    },
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unread = countData?.count ?? 0;
  const items = listData?.items ?? [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-all"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 ltr:-right-0.5 rtl:-left-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute ltr:right-0 rtl:left-0 top-full mt-2 w-80 glass-card rounded-2xl border border-b-border shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-b-border">
              <h3 className="text-sm font-semibold text-foreground">{t('notifications')}</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={() => markAllMut.mutate()}
                    className="text-xs text-violet-500 hover:text-violet-400 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  {t('noNotifications')}
                </div>
              ) : (
                items.map((n: any) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-b-border last:border-0 hover:bg-surface transition-colors cursor-pointer ${
                      !n.isRead ? 'bg-violet-500/5' : ''
                    }`}
                    onClick={() => {
                      if (!n.isRead) markReadMut.mutate(n.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_COLORS[n.type] ?? 'bg-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{n.title}</div>
                        <div className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</div>
                        <div className="text-[10px] text-dim mt-1">{dayjs(n.createdAt).fromNow()}</div>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
