import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram, Radio, Trash2, Activity, ExternalLink, Phone,
  Send, MessageCircle, Bot, ArrowRight, X, RefreshCw,
  Zap, BrainCircuit, Layers, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { channelsApi } from '../../api/channels.api';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useI18n } from '../../store/i18n.store';

export default function Channels() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Delete confirmation modal ---
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  // --- Listen for OAuth popup postMessage ---
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'oauth_callback') {
        qc.invalidateQueries({ queryKey: ['channels'] });
        const ch = event.data.channel;
        if (event.data.pagesKey) {
          // Messenger: fetch pages
          setMessengerPagesKey(event.data.pagesKey);
          channelsApi.getMessengerPages(event.data.pagesKey).then((pages) => {
            setMessengerPages(pages);
          }).catch(() => toast.error('Session expired. Please try again.'));
        } else {
          toast.success(`${ch.charAt(0).toUpperCase() + ch.slice(1)} connected!`);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [qc]);

  // --- Handle Messenger OAuth callback (redirect fallback) ---
  useEffect(() => {
    const pagesKey = searchParams.get('messenger_pages');
    if (pagesKey) {
      setMessengerPagesKey(pagesKey);
      channelsApi.getMessengerPages(pagesKey).then((pages) => {
        setMessengerPages(pages);
      }).catch(() => toast.error('Session expired. Please try again.'));
      searchParams.delete('messenger_pages');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // --- Handle channel connected callback (redirect fallback) ---
  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected!`);
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
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  const ttMut = useMutation({
    mutationFn: channelsApi.connectTikTok,
    onSuccess: (data) => {
      window.open(data.url, '_blank', 'width=600,height=700');
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

  // --- WhatsApp Embedded Signup ---
  const waMut = useMutation({
    mutationFn: channelsApi.connectWhatsApp,
    onSuccess: (config: { appId: string; configId: string; state: string }) => {
      waStateRef.current = config.state;
      wabaRef.current = null;
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
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed'),
  });

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

  // --- Telegram ---
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['channels'] });
      toast.success(t('channelDeleted') ?? 'Channel deleted');
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error('Failed to delete channel');
      setDeleteTarget(null);
    },
  });

  const modeMut = useMutation({
    mutationFn: ({ id, aiMode }: { id: string; aiMode: string }) => channelsApi.updateMode(id, aiMode),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['channels'] }); },
    onError: () => toast.error('Failed to update mode'),
  });

  // --- Channel icon/color config ---
  const channelConfig: Record<string, { icon: React.ReactNode; gradient: string; color: string; bg: string; border: string }> = {
    INSTAGRAM: {
      icon: <Instagram className="w-5 h-5" />,
      gradient: 'from-pink-500 to-rose-600',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
      border: 'hover:border-pink-500/30',
    },
    TIKTOK: {
      icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.77 1.52V7.44a4.85 4.85 0 01-1.01-.75z" /></svg>,
      gradient: 'from-cyan-400 to-blue-600',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      border: 'hover:border-cyan-500/30',
    },
    WHATSAPP: {
      icon: <Phone className="w-5 h-5" />,
      gradient: 'from-emerald-500 to-green-600',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-500/30',
    },
    TELEGRAM: {
      icon: <Send className="w-5 h-5" />,
      gradient: 'from-blue-400 to-indigo-600',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'hover:border-blue-500/30',
    },
    MESSENGER: {
      icon: <MessageCircle className="w-5 h-5" />,
      gradient: 'from-blue-500 to-purple-600',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      border: 'hover:border-purple-500/30',
    },
  };

  const getConfig = (type: string) => channelConfig[type] ?? {
    icon: <Radio className="w-5 h-5" />, gradient: 'from-gray-400 to-gray-600',
    color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'hover:border-gray-500/30',
  };

  const modeOptions = [
    { id: 'ai', label: t('channelModeAi'), desc: t('channelModeAiDesc'), icon: <BrainCircuit className="w-3.5 h-3.5" /> },
    { id: 'automation', label: t('channelModeAutomation'), desc: t('channelModeAutomationDesc'), icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'both', label: t('channelModeBoth'), desc: t('channelModeBothDesc'), icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const inputClass =
    'w-full rounded-lg border border-b-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-1 focus:ring-primary/50';

  const connectedChannels = channels?.filter((ch: any) => ch.status !== 'DISCONNECTED') ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('channelsTitle')}</h1>
        <p className="text-muted text-sm mt-1">{t('channelsDesc')}</p>
      </div>

      {/* Connected channels */}
      {connectedChannels.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
            {t('connected')} {t('channels')}
          </h2>
          <div className="space-y-3">
            {connectedChannels.map((ch: any, i: number) => {
              const cfg = getConfig(ch.type);
              const currentMode = ch.aiMode ?? 'ai';
              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass-card rounded-2xl border border-b-border ${cfg.border} transition-colors`}
                >
                  {/* Channel info row */}
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">
                        {ch.externalName ?? ch.externalId}
                      </div>
                      <div className="text-xs text-dim mt-0.5">{ch.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        ch.status === 'CONNECTED'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : ch.status === 'EXPIRED'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                        {ch.status === 'CONNECTED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
                        {ch.status}
                      </span>
                      <button
                        onClick={() => healthMut.mutate(ch.id)}
                        disabled={healthMut.isPending}
                        className="p-2 text-dim hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                        title="Health check"
                      >
                        {healthMut.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: ch.id, name: ch.externalName ?? ch.type })}
                        className="p-2 text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t('delete') ?? 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div className="flex items-center gap-3 px-4 pb-4 pt-0">
                    <span className="text-[11px] font-medium text-dim uppercase tracking-wider shrink-0">
                      {t('channelModeLabel')}
                    </span>
                    <div className="flex gap-1.5">
                      {modeOptions.map((m) => (
                        <button
                          key={m.id}
                          title={m.desc}
                          onClick={() => modeMut.mutate({ id: ch.id, aiMode: m.id })}
                          disabled={modeMut.isPending}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            currentMode === m.id
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-surface/50 border border-b-border text-muted hover:text-foreground hover:bg-surface'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connect cards */}
      <div>
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          {t('addChannel') ?? 'Add Channel'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Instagram */}
          <ConnectCard
            icon={<Instagram className="w-6 h-6 text-white" />}
            gradient="from-pink-500 to-rose-600"
            shadow="shadow-pink-500/20"
            name="Instagram"
            desc={t('igDesc') ?? 'Connect your Instagram Business account'}
            features={[
              t('igFeature1') ?? 'Receive & reply to DMs',
              t('igFeature2') ?? 'Detect booking intent via AI',
              t('igFeature3') ?? 'One-click OAuth',
            ]}
            dotColor="bg-pink-400"
            onClick={() => igMut.mutate()}
            loading={igMut.isPending}
            buttonLabel={t('connectInstagram')}
          />

          {/* TikTok */}
          <ConnectCard
            icon={<svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.37a8.16 8.16 0 004.77 1.52V7.44a4.85 4.85 0 01-1.01-.75z"/></svg>}
            gradient="from-cyan-400 to-blue-600"
            shadow="shadow-cyan-500/20"
            name="TikTok"
            desc={t('ttDesc') ?? 'Connect your TikTok Business account'}
            features={[
              t('ttFeature1') ?? 'Receive & reply to DMs',
              t('ttFeature2') ?? 'PKCE OAuth — secure flow',
              t('ttFeature3') ?? 'Auto token refresh',
            ]}
            dotColor="bg-cyan-400"
            onClick={() => ttMut.mutate()}
            loading={ttMut.isPending}
            buttonLabel={t('connectTiktok')}
          />

          {/* WhatsApp */}
          <ConnectCard
            icon={<Phone className="w-6 h-6 text-white" />}
            gradient="from-emerald-500 to-green-600"
            shadow="shadow-emerald-500/20"
            name="WhatsApp"
            desc={t('whatsappDesc') ?? 'Connect via Meta Embedded Signup'}
            features={[
              t('waFeature1') ?? 'One-click Meta signup',
              t('waFeature2') ?? 'WhatsApp Cloud API',
              t('waFeature3') ?? 'Auto webhook registration',
            ]}
            dotColor="bg-emerald-400"
            onClick={() => waMut.mutate()}
            loading={waMut.isPending || waCallbackMut.isPending}
            buttonLabel={t('connectWhatsapp')}
          />

          {/* Telegram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="glass-card rounded-2xl p-5 border border-b-border hover:border-blue-500/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Telegram</h3>
                <p className="text-[11px] text-muted">{t('telegramDesc') ?? 'Connect your Telegram bot'}</p>
              </div>
            </div>

            {!showTelegram ? (
              <>
                <ul className="space-y-1.5 mb-4">
                  {[t('tgFeature1') ?? 'Telegram Bot API', t('tgFeature2') ?? 'Instant message delivery', t('tgFeature3') ?? 'Auto webhook setup'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted">
                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => setShowTelegram(true)}
                  className="w-full justify-center bg-gradient-to-r from-blue-400 to-indigo-600 hover:opacity-90 shadow-blue-500/20"
                  size="sm"
                  icon={<Bot className="w-4 h-4" />}
                >
                  {t('connectTelegram')}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {[
                    { step: '1', content: <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">{t('telegramStep1') ?? 'Open @BotFather'}</a> },
                    { step: '2', content: t('telegramStep2') ?? 'Send /newbot and follow instructions' },
                    { step: '3', content: t('telegramStep3') ?? 'Paste the bot token below' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{s.step}</div>
                      <span className="text-xs text-muted">{s.content}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (tgBotToken.trim()) tgMut.mutate({ botToken: tgBotToken.trim(), ...(tgBotName.trim() ? { botName: tgBotName.trim() } : {}) }); }} className="space-y-2">
                  <input type="text" placeholder={t('botTokenPlaceholder') ?? 'Bot Token *'} value={tgBotToken} onChange={(e) => setTgBotToken(e.target.value)} required className={inputClass} />
                  <input type="text" placeholder={t('botNamePlaceholder') ?? 'Bot Name (optional)'} value={tgBotName} onChange={(e) => setTgBotName(e.target.value)} className={inputClass} />
                  <div className="flex gap-2">
                    <Button type="submit" loading={tgMut.isPending} className="flex-1 justify-center bg-gradient-to-r from-blue-400 to-indigo-600 hover:opacity-90" size="sm">{t('connectTelegram')}</Button>
                    <button type="button" onClick={() => setShowTelegram(false)} className="px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors">{t('cancel')}</button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>

          {/* Messenger */}
          <ConnectCard
            icon={<MessageCircle className="w-6 h-6 text-white" />}
            gradient="from-blue-500 to-purple-600"
            shadow="shadow-purple-500/20"
            name="Messenger"
            desc={t('messengerDesc') ?? 'Connect your Facebook Page'}
            features={[
              t('msFeature1') ?? 'One-click Facebook login',
              t('msFeature2') ?? 'Page messaging',
              t('msFeature3') ?? 'Auto webhook subscription',
            ]}
            dotColor="bg-purple-400"
            onClick={() => msMut.mutate()}
            loading={msMut.isPending}
            buttonLabel={t('connectMessenger')}
            delay={0.16}
          />
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && connectedChannels.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center border border-b-border">
          <Radio className="w-10 h-10 text-dim mx-auto mb-3" />
          <p className="text-muted text-sm">{t('noChannels')}</p>
          <p className="text-dim text-xs mt-1">{t('connectFirst')}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-10"><Spinner /></div>
      )}

      {/* Messenger Page Picker Modal */}
      <AnimatePresence>
        {messengerPages && messengerPages.length > 0 && (
          <Modal onClose={() => { setMessengerPages(null); setMessengerPagesKey(null); }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-b-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{t('selectPage') ?? 'Select a Page'}</h3>
                <p className="text-xs text-muted mt-0.5">{t('selectPageDesc') ?? 'Choose which Facebook Page to connect'}</p>
              </div>
              <button onClick={() => { setMessengerPages(null); setMessengerPagesKey(null); }} className="p-1.5 text-dim hover:text-foreground transition-colors rounded-lg hover:bg-surface">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              {messengerPages.map((page: any) => (
                <button
                  key={page.id}
                  onClick={() => { if (messengerPagesKey) msSelectMut.mutate({ pagesKey: messengerPagesKey, pageId: page.id }); }}
                  disabled={msSelectMut.isPending}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-b-border hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-left"
                >
                  {page.picture ? (
                    <img src={page.picture} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-purple-500" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{page.name}</div>
                    <div className="text-xs text-dim">ID: {page.id}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-500" />
                </button>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('deleteChannel') ?? 'Delete Channel'}
              </h3>
              <p className="text-sm text-muted mb-6">
                {t('deleteChannelConfirm') ?? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground bg-surface border border-b-border rounded-xl transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => disconnectMut.mutate(deleteTarget.id)}
                  disabled={disconnectMut.isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {disconnectMut.isPending ? t('deleting') ?? 'Deleting...' : t('delete') ?? 'Delete'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Reusable Connect Card ---
function ConnectCard({ icon, gradient, shadow, name, desc, features, dotColor, onClick, loading, buttonLabel, delay = 0 }: {
  icon: React.ReactNode; gradient: string; shadow: string; name: string; desc: string;
  features: string[]; dotColor: string; onClick: () => void; loading: boolean;
  buttonLabel: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-2xl p-5 border border-b-border hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{name}</h3>
          <p className="text-[11px] text-muted">{desc}</p>
        </div>
      </div>
      <ul className="space-y-1.5 mb-4">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-muted">
            <div className={`w-1 h-1 rounded-full ${dotColor}`} />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onClick}
        loading={loading}
        className={`w-full justify-center bg-gradient-to-r ${gradient} hover:opacity-90 ${shadow}`}
        size="sm"
        icon={<ExternalLink className="w-3.5 h-3.5" />}
      >
        {buttonLabel}
      </Button>
    </motion.div>
  );
}

// --- Reusable Modal ---
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card rounded-2xl border border-b-border shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
