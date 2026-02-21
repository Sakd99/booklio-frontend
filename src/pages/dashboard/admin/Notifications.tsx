import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Send, Bell, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../../api/admin.api';
import Button from '../../../components/ui/Button';
import { useI18n } from '../../../store/i18n.store';

export default function AdminNotifications() {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sentCount, setSentCount] = useState<number | null>(null);

  const broadcastMut = useMutation({
    mutationFn: () => adminApi.broadcastNotification(title, body),
    onSuccess: (data) => {
      setSentCount(data.sent);
      setTitle('');
      setBody('');
      toast.success(`${t('notificationSent')} (${data.sent} ${t('adminTenants').toLowerCase()})`);
    },
    onError: () => toast.error('Failed to send notification'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('adminNotifications')}</h1>
        <p className="text-muted text-sm mt-1">{t('adminNotificationsDesc')}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Broadcast form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-b-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('broadcastTitle')}</h2>
              <p className="text-xs text-muted">{t('broadcastDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1.5">{t('notificationTitle')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder={t('notificationTitlePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">{t('notificationBody')}</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="w-full rounded-xl bg-surface border border-b-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                placeholder={t('notificationBodyPlaceholder')}
              />
            </div>

            <Button
              onClick={() => broadcastMut.mutate()}
              loading={broadcastMut.isPending}
              disabled={!title.trim() || !body.trim()}
              icon={<Send className="w-4 h-4" />}
              className="w-full"
            >
              {t('sendBroadcast')}
            </Button>
          </div>
        </motion.div>

        {/* Info / Last sent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-b-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('broadcastInfo')}</h2>
              <p className="text-xs text-muted">{t('broadcastInfoDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface border border-b-border">
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('broadcastFeature1')}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('broadcastFeature2')}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {t('broadcastFeature3')}
              </div>
            </div>

            {sentCount !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
              >
                <div className="text-sm text-emerald-500 font-medium">
                  {t('lastBroadcast')}: {sentCount} {t('adminTenants').toLowerCase()}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
