import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Instagram, Radio, Trash2, Activity, ExternalLink, Phone, Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { channelsApi } from '../../api/channels.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { statusBadge } from '../../components/ui/Badge';
import { useI18n } from '../../store/i18n.store';

export default function Channels() {
  const { t } = useI18n();
  const qc = useQueryClient();

  // --- Token-based form toggles ---
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);

  // --- WhatsApp form state ---
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [waBusinessName, setWaBusinessName] = useState('');

  // --- Telegram form state ---
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgBotName, setTgBotName] = useState('');

  // --- Messenger form state ---
  const [msPageId, setMsPageId] = useState('');
  const [msPageAccessToken, setMsPageAccessToken] = useState('');
  const [msPageName, setMsPageName] = useState('');

  // --- Queries ---
  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
  });

  // --- OAuth mutations (existing) ---
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

  // --- Token-based mutations (new) ---
  const waMut = useMutation({
    mutationFn: channelsApi.connectWhatsApp,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success('WhatsApp connected successfully!');
      setShowWhatsApp(false);
      setWaPhoneNumberId('');
      setWaAccessToken('');
      setWaBusinessName('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to connect WhatsApp'),
  });

  const tgMut = useMutation({
    mutationFn: channelsApi.connectTelegram,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Telegram connected successfully!');
      setShowTelegram(false);
      setTgBotToken('');
      setTgBotName('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to connect Telegram'),
  });

  const msMut = useMutation({
    mutationFn: channelsApi.connectMessenger,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Messenger connected successfully!');
      setShowMessenger(false);
      setMsPageId('');
      setMsPageAccessToken('');
      setMsPageName('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to connect Messenger'),
  });

  // --- Utility mutations ---
  const healthMut = useMutation({
    mutationFn: channelsApi.healthCheck,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); toast.success('Health check complete'); },
  });

  const disconnectMut = useMutation({
    mutationFn: channelsApi.disconnect,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); toast.success('Channel disconnected'); },
  });

  // --- Channel icon helper for connected list ---
  const channelIcon = (type: string) => {
    switch (type) {
      case 'INSTAGRAM':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-500/10 text-pink-500">
            <Instagram className="w-5 h-5" />
          </div>
        );
      case 'TIKTOK':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-500">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.77 1.52V7.44a4.85 4.85 0 01-1.01-.75z" />
            </svg>
          </div>
        );
      case 'WHATSAPP':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500">
            <Phone className="w-5 h-5" />
          </div>
        );
      case 'TELEGRAM':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500">
            <Send className="w-5 h-5" />
          </div>
        );
      case 'MESSENGER':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500">
            <MessageCircle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-500/10 text-gray-500">
            <Radio className="w-5 h-5" />
          </div>
        );
    }
  };

  // --- Shared input class ---
  const inputClass =
    'w-full rounded-lg border border-b-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-1 focus:ring-primary/50';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('channelsTitle')}</h1>
        <p className="text-muted text-sm mt-1">{t('channelsDesc')}</p>
      </div>

      {/* Connect cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        {/* WhatsApp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 border border-b-border hover:border-emerald-500/20 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp</h3>
              <p className="text-xs text-muted">Connect via WhatsApp Cloud API</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {['WhatsApp Cloud API', 'Send & receive messages', 'Business verified'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                {f}
              </li>
            ))}
          </ul>

          {!showWhatsApp ? (
            <Button
              onClick={() => setShowWhatsApp(true)}
              className="w-full justify-center bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 shadow-emerald-500/20"
              icon={<Phone className="w-4 h-4" />}
            >
              {t('connectWhatsapp')}
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!waPhoneNumberId.trim() || !waAccessToken.trim()) return;
                waMut.mutate({
                  phoneNumberId: waPhoneNumberId.trim(),
                  accessToken: waAccessToken.trim(),
                  ...(waBusinessName.trim() ? { businessName: waBusinessName.trim() } : {}),
                });
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Phone Number ID *"
                value={waPhoneNumberId}
                onChange={(e) => setWaPhoneNumberId(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Access Token *"
                value={waAccessToken}
                onChange={(e) => setWaAccessToken(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Business Name (optional)"
                value={waBusinessName}
                onChange={(e) => setWaBusinessName(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={waMut.isPending}
                  className="flex-1 justify-center bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90"
                >
                  {t('connectWhatsapp')}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowWhatsApp(false)}
                  className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Telegram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6 border border-b-border hover:border-blue-500/20 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Telegram</h3>
              <p className="text-xs text-muted">Connect your Telegram bot</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {['Telegram Bot API', 'Instant message delivery', 'No phone number needed'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                {f}
              </li>
            ))}
          </ul>

          {!showTelegram ? (
            <Button
              onClick={() => setShowTelegram(true)}
              className="w-full justify-center bg-gradient-to-r from-blue-400 to-indigo-600 hover:opacity-90 shadow-blue-500/20"
              icon={<Send className="w-4 h-4" />}
            >
              {t('connectTelegram')}
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tgBotToken.trim()) return;
                tgMut.mutate({
                  botToken: tgBotToken.trim(),
                  ...(tgBotName.trim() ? { botName: tgBotName.trim() } : {}),
                });
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Bot Token *"
                value={tgBotToken}
                onChange={(e) => setTgBotToken(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Bot Name (optional)"
                value={tgBotName}
                onChange={(e) => setTgBotName(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={tgMut.isPending}
                  className="flex-1 justify-center bg-gradient-to-r from-blue-400 to-indigo-600 hover:opacity-90"
                >
                  {t('connectTelegram')}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowTelegram(false)}
                  className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Messenger */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 border border-b-border hover:border-purple-500/20 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Messenger</h3>
              <p className="text-xs text-muted">Connect your Facebook Page</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {['Facebook Messenger', 'Page messaging', 'Meta Business Suite'].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-purple-400" />
                {f}
              </li>
            ))}
          </ul>

          {!showMessenger ? (
            <Button
              onClick={() => setShowMessenger(true)}
              className="w-full justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-purple-500/20"
              icon={<MessageCircle className="w-4 h-4" />}
            >
              {t('connectMessenger')}
            </Button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!msPageId.trim() || !msPageAccessToken.trim()) return;
                msMut.mutate({
                  pageId: msPageId.trim(),
                  pageAccessToken: msPageAccessToken.trim(),
                  ...(msPageName.trim() ? { pageName: msPageName.trim() } : {}),
                });
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Page ID *"
                value={msPageId}
                onChange={(e) => setMsPageId(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Page Access Token *"
                value={msPageAccessToken}
                onChange={(e) => setMsPageAccessToken(e.target.value)}
                required
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Page Name (optional)"
                value={msPageName}
                onChange={(e) => setMsPageName(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={msMut.isPending}
                  className="flex-1 justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                  {t('connectMessenger')}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowMessenger(false)}
                  className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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
                {channelIcon(ch.type)}
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
