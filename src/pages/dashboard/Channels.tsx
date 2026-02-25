import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram, Radio, Trash2, Activity, ExternalLink, Phone,
  Send, MessageCircle, Bot, ArrowRight, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { channelsApi } from '../../api/channels.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { statusBadge } from '../../components/ui/Badge';
import { useI18n } from '../../store/i18n.store';

export default function Channels() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Telegram form state ---
  const [showTelegram, setShowTelegram] = useState(false);
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgBotName, setTgBotName] = useState('');

  // --- Messenger page picker state ---
  const [messengerPages, setMessengerPages] = useState<any[] | null>(null);
  const [messengerPagesKey, setMessengerPagesKey] = useState<string | null>(null);

  // --- WhatsApp Embedded Signup state ---
  const wabaRef = useRef<{ wabaId: string; phoneNumberId: string } | null>(null);
  const waStateRef = useRef<string | null>(null);

  // --- Queries ---
  const { data: channels, isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
  });

  // --- Handle Messenger OAuth callback (redirect with pages key) ---
  useEffect(() => {
    const pagesKey = searchParams.get('messenger_pages');
    if (pagesKey) {
      setMessengerPagesKey(pagesKey);
      channelsApi.getMessengerPages(pagesKey).then((pages) => {
        setMessengerPages(pages);
      }).catch(() => {
        toast.error('Session expired. Please try again.');
      });
      // Clean the URL
      searchParams.delete('messenger_pages');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // --- Handle channel connected callback (Instagram, TikTok) ---
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success(`${connected} connected!`);
      searchParams.delete('connected');
      searchParams.delete('channelId');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // --- WhatsApp Embedded Signup message listener ---
  const handleWAMessage = useCallback((event: MessageEvent) => {
    if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data.type === 'WA_EMBEDDED_SIGNUP') {
        if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA') {
          wabaRef.current = {
            wabaId: data.data.waba_id,
            phoneNumberId: data.data.phone_number_id,
          };
        }
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleWAMessage);
    return () => window.removeEventListener('message', handleWAMessage);
  }, [handleWAMessage]);

  // --- OAuth mutations ---
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

  // --- WhatsApp Embedded Signup ---
  const waMut = useMutation({
    mutationFn: channelsApi.connectWhatsApp,
    onSuccess: (config: { appId: string; configId: string; state: string }) => {
      waStateRef.current = config.state;
      wabaRef.current = null;

      // Initialize FB SDK if not done yet
      if (!window.FB) {
        window.fbAsyncInit = () => {
          window.FB!.init({ appId: config.appId, cookie: true, xfbml: true, version: 'v21.0' });
          launchWALogin(config);
        };
      } else {
        launchWALogin(config);
      }
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const waCallbackMut = useMutation({
    mutationFn: channelsApi.whatsappCallback,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success('WhatsApp connected!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to connect WhatsApp'),
  });

  const launchWALogin = (config: { appId: string; configId: string; state: string }) => {
    window.FB!.login(
      (response) => {
        if (response.status === 'connected' && response.authResponse?.code) {
          const code = response.authResponse.code;
          // Wait briefly for the WA_EMBEDDED_SIGNUP message to arrive
          setTimeout(() => {
            if (wabaRef.current) {
              waCallbackMut.mutate({
                code,
                wabaId: wabaRef.current.wabaId,
                phoneNumberId: wabaRef.current.phoneNumberId,
                state: config.state,
              });
            } else {
              toast.error('Could not get WhatsApp account info. Please try again.');
            }
          }, 500);
        }
      },
      {
        config_id: config.configId,
        response_type: 'code',
        override_default_response_type: true,
      },
    );
  };

  // --- Messenger OAuth ---
  const msMut = useMutation({
    mutationFn: channelsApi.connectMessenger,
    onSuccess: (data: { url: string }) => {
      window.open(data.url, '_blank', 'width=600,height=700');
      toast.success('Messenger OAuth window opened.');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  // --- Messenger page selection ---
  const msSelectMut = useMutation({
    mutationFn: channelsApi.messengerSelectPage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Messenger connected!');
      setMessengerPages(null);
      setMessengerPagesKey(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to connect page'),
  });

  // --- Telegram (token-based + auto webhook) ---
  const tgMut = useMutation({
    mutationFn: channelsApi.connectTelegram,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success('Telegram connected!');
      setShowTelegram(false);
      setTgBotToken('');
      setTgBotName('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to connect Telegram'),
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

  const modeMut = useMutation({
    mutationFn: ({ id, aiMode }: { id: string; aiMode: string }) => channelsApi.updateMode(id, aiMode),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); },
    onError: () => toast.error('Failed to update mode'),
  });

  // --- Channel icon helper ---
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
        {/* Instagram — OAuth */}
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

        {/* TikTok — OAuth */}
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

        {/* WhatsApp — Embedded Signup (one-click) */}
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
              <p className="text-xs text-muted">{t('whatsappDesc') ?? 'Connect via Meta Embedded Signup'}</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {[
              t('waFeature1') ?? 'One-click Meta signup',
              t('waFeature2') ?? 'WhatsApp Cloud API',
              t('waFeature3') ?? 'Auto webhook registration',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => waMut.mutate()}
            loading={waMut.isPending || waCallbackMut.isPending}
            className="w-full justify-center bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 shadow-emerald-500/20"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            {t('connectWhatsapp')}
          </Button>
        </motion.div>

        {/* Telegram — Token with BotFather guide */}
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
              <p className="text-xs text-muted">{t('telegramDesc') ?? 'Connect your Telegram bot'}</p>
            </div>
          </div>

          {!showTelegram ? (
            <>
              <ul className="space-y-1.5 mb-5">
                {[
                  t('tgFeature1') ?? 'Telegram Bot API',
                  t('tgFeature2') ?? 'Instant message delivery',
                  t('tgFeature3') ?? 'Auto webhook setup',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setShowTelegram(true)}
                className="w-full justify-center bg-gradient-to-r from-blue-400 to-indigo-600 hover:opacity-90 shadow-blue-500/20"
                icon={<Bot className="w-4 h-4" />}
              >
                {t('connectTelegram')}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Step-by-step guide */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div className="text-sm text-muted">
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline font-medium"
                    >
                      {t('telegramStep1') ?? 'Open @BotFather on Telegram'}
                    </a>
                    <ArrowRight className="w-3 h-3 inline ml-1" />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <p className="text-sm text-muted">{t('telegramStep2') ?? 'Send /newbot and follow the instructions'}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <p className="text-sm text-muted">{t('telegramStep3') ?? 'Paste the bot token below'}</p>
                </div>
              </div>

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
                  placeholder={t('botTokenPlaceholder') ?? 'Bot Token *'}
                  value={tgBotToken}
                  onChange={(e) => setTgBotToken(e.target.value)}
                  required
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder={t('botNamePlaceholder') ?? 'Bot Name (optional)'}
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
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>

        {/* Messenger — OAuth (one-click) */}
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
              <p className="text-xs text-muted">{t('messengerDesc') ?? 'Connect your Facebook Page'}</p>
            </div>
          </div>
          <ul className="space-y-1.5 mb-5">
            {[
              t('msFeature1') ?? 'One-click Facebook login',
              t('msFeature2') ?? 'Page messaging',
              t('msFeature3') ?? 'Auto webhook subscription',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted">
                <div className="w-1 h-1 rounded-full bg-purple-400" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => msMut.mutate()}
            loading={msMut.isPending}
            className="w-full justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-purple-500/20"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            {t('connectMessenger')}
          </Button>
        </motion.div>
      </div>

      {/* Messenger Page Picker Modal */}
      <AnimatePresence>
        {messengerPages && messengerPages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl border border-b-border shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-b-border">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{t('selectPage') ?? 'Select a Page'}</h3>
                  <p className="text-xs text-muted mt-0.5">{t('selectPageDesc') ?? 'Choose which Facebook Page to connect'}</p>
                </div>
                <button
                  onClick={() => { setMessengerPages(null); setMessengerPagesKey(null); }}
                  className="p-1.5 text-dim hover:text-foreground transition-colors rounded-lg hover:bg-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Page list */}
              <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
                {messengerPages.map((page: any) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      if (messengerPagesKey) {
                        msSelectMut.mutate({ pagesKey: messengerPagesKey, pageId: page.id });
                      }
                    }}
                    disabled={msSelectMut.isPending}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-b-border hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-left"
                  >
                    {page.picture ? (
                      <img src={page.picture} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">{page.name}</div>
                      <div className="text-xs text-dim">ID: {page.id}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                className="glass-card rounded-2xl p-4 border border-b-border"
              >
                <div className="flex items-center gap-4">
                  {channelIcon(ch.type)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{ch.externalName ?? ch.externalId}</div>
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
                </div>

                {/* AI Mode selector */}
                <div className="mt-3 flex items-center gap-2 pt-3 border-t border-b-border">
                  <span className="text-[10px] font-medium text-muted uppercase tracking-wider">{t('channelModeLabel')}:</span>
                  <div className="flex gap-1">
                    {([
                      { id: 'ai', label: t('channelModeAi'), title: t('channelModeAiDesc'), icon: '🤖' },
                      { id: 'automation', label: t('channelModeAutomation'), title: t('channelModeAutomationDesc'), icon: '⚡' },
                      { id: 'both', label: t('channelModeBoth'), title: t('channelModeBothDesc'), icon: '🔀' },
                    ] as const).map((m) => (
                      <button
                        key={m.id}
                        title={m.title}
                        onClick={() => modeMut.mutate({ id: ch.id, aiMode: m.id })}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          (ch.aiMode ?? 'ai') === m.id
                            ? 'bg-violet-500/15 text-violet-500 border border-violet-500/30'
                            : 'bg-surface border border-b-border text-muted hover:text-foreground'
                        }`}
                      >
                        <span>{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
