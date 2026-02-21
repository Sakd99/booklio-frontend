import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Instagram, Radio, Trash2, Activity, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { channelsApi } from '../../api/channels.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { statusBadge } from '../../components/ui/Badge';
import { useI18n } from '../../store/i18n.store';

export default function Channels() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
  });

  const igMut = useMutation({
    mutationFn: channelsApi.connectInstagram,
    onSuccess: (data) => {
      window.open(data.url, '_blank', 'width=600,height=700');
      toast.success('Instagram OAuth window opened.');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const ttMut = useMutation({
    mutationFn: channelsApi.connectTikTok,
    onSuccess: (data) => {
      window.open(data.url, '_blank', 'width=600,height=700');
      toast.success('TikTok OAuth window opened.');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const healthMut = useMutation({
    mutationFn: channelsApi.healthCheck,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); toast.success('Health check complete'); },
  });

  const disconnectMut = useMutation({
    mutationFn: channelsApi.disconnect,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); toast.success('Channel disconnected'); },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('channelsTitle')}</h1>
        <p className="text-muted text-sm mt-1">{t('channelsDesc')}</p>
      </div>

      {/* Connect cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Instagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border border-b-border hover:border-pink-500/20 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Instagram</h3>
              <p className="text-xs text-muted">Connect your Instagram Business account</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {['Receive & reply to DMs', 'Detect booking intent via AI', 'One-click OAuth — 30 seconds'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-pink-400" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => igMut.mutate()}
            loading={igMut.isPending}
            className="w-full justify-center bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 shadow-pink-500/20"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            {t('connectInstagram')}
          </Button>
        </motion.div>

        {/* TikTok */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6 border border-b-border hover:border-cyan-500/20 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.77 1.52V7.44a4.85 4.85 0 01-1.01-.75z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">TikTok</h3>
              <p className="text-xs text-muted">Connect your TikTok Business account</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {['Receive & reply to DMs', 'PKCE OAuth — secure flow', 'Auto token refresh'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-cyan-400" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => ttMut.mutate()}
            loading={ttMut.isPending}
            className="w-full justify-center bg-gradient-to-r from-cyan-400 to-blue-600 hover:opacity-90 shadow-cyan-500/20"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            {t('connectTiktok')}
          </Button>
        </motion.div>
      </div>

      {/* Connected channels list */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
          {t('connected')} {t('channels')}
        </h2>

        {isLoading ? (
          <Spinner />
        ) : !channels?.length ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-b-border">
            <Radio className="w-10 h-10 text-dim mx-auto mb-3" />
            <p className="text-muted text-sm">{t('noChannels')}</p>
            <p className="text-dim text-xs mt-1">{t('connectFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {channels?.map((ch: any, i: number) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4 border border-b-border flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  ch.type === 'INSTAGRAM' ? 'bg-pink-500/10 text-pink-500' : 'bg-cyan-500/10 text-cyan-500'
                }`}>
                  {ch.type === 'INSTAGRAM' ? <Instagram className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm">{ch.username ?? ch.externalId}</div>
                  <div className="text-xs text-muted mt-0.5">{ch.type}</div>
                </div>
                {statusBadge(ch.status)}
                <div className="flex gap-1">
                  <button
                    onClick={() => healthMut.mutate(ch.id)}
                    className="p-1.5 text-dim hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Health check"
                  >
                    <Activity className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm('Disconnect this channel?')) disconnectMut.mutate(ch.id); }}
                    className="p-1.5 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
