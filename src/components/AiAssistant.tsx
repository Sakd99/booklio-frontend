import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, User, Loader2, Sparkles, Zap, MessageCircle, ClipboardList } from 'lucide-react';
import { useI18n } from '../store/i18n.store';
import { aiAssistantApi } from '../api/aiAssistant.api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type Mode = 'auto' | 'ask' | 'plan';

interface AiAssistantProps {
  open: boolean;
  onClose: () => void;
}

const MODE_CONFIG: Record<Mode, { icon: React.ReactNode; active: string; dot: string }> = {
  auto: {
    icon: <Zap className="w-3.5 h-3.5" />,
    active: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
    dot: 'bg-blue-500',
  },
  ask: {
    icon: <MessageCircle className="w-3.5 h-3.5" />,
    active: 'bg-violet-500/10 text-violet-500 border-violet-500/25',
    dot: 'bg-violet-500',
  },
  plan: {
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    active: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    dot: 'bg-amber-500',
  },
};

export default function AiAssistant({ open, onClose }: AiAssistantProps) {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';

  const [mode, setMode] = useState<Mode>('ask');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('aiAssistantWelcome'), timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const MODES: { id: Mode; label: string; desc: string }[] = [
    { id: 'auto', label: t('aiAssistantModeAuto'), desc: t('aiAssistantModeAutoDesc') },
    { id: 'ask', label: t('aiAssistantModeAsk'), desc: t('aiAssistantModeAskDesc') },
    { id: 'plan', label: t('aiAssistantModePlan'), desc: t('aiAssistantModePlanDesc') },
  ];

  const QUICK_PROMPTS = [
    {
      label: locale === 'ar' ? '📊 إحصائيات عملي' : '📊 Business stats',
      msg: locale === 'ar' ? 'ما هي إحصائيات عملي هذا الشهر؟' : 'Show me my business stats this month',
    },
    {
      label: locale === 'ar' ? '⚡ الأوتوميشنات' : '⚡ Automations',
      msg: locale === 'ar' ? 'اعرض لي الأوتوميشنات الحالية' : 'List all my automations',
    },
    {
      label: locale === 'ar' ? '📅 المواعيد' : '📅 Appointments',
      msg: locale === 'ar' ? 'اعرض آخر المواعيد' : 'Show recent appointments',
    },
    {
      label: locale === 'ar' ? '🤖 إعدادات الذكاء' : '🤖 AI settings',
      msg: locale === 'ar' ? 'ما هي إعدادات الذكاء الاصطناعي الحالية؟' : 'What are my current AI bot settings?',
    },
  ];

  const isOnlyWelcome = messages.length === 1 && messages[0].role === 'assistant';

  const sendMessage = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await aiAssistantApi.chat({ message: text, mode, history, locale });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('aiAssistantError'), timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: t('aiAssistantWelcome'), timestamp: new Date() }]);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  const currentModeConfig = MODE_CONFIG[mode];
  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`fixed top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-full sm:w-[440px] z-50 flex flex-col bg-base shadow-2xl`}
            style={{ borderLeft: isRtl ? 'none' : '1px solid var(--color-border)', borderRight: isRtl ? '1px solid var(--color-border)' : 'none' }}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-b-border bg-surface/60 backdrop-blur-sm flex-shrink-0">
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-base" />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none">Convly AI</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentModeConfig.dot}`} />
                  <span className="text-[11px] text-muted truncate">{currentMode.desc}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={clearChat}
                  title={t('aiAssistantClear')}
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-violet-500 to-blue-600'
                        : 'bg-surface border border-b-border'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Sparkles className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-muted" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'assistant'
                          ? 'bg-surface text-foreground rounded-tl-sm'
                          : 'bg-gradient-to-br from-violet-500 to-blue-600 text-white rounded-tr-sm shadow-md shadow-violet-500/20'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-dim px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}

              {/* Quick prompts — visible only on welcome state */}
              {isOnlyWelcome && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.msg)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-surface border border-b-border text-xs text-muted hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-150"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing / loading indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-600">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-surface px-4 py-3.5 flex items-center gap-3">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-muted">{t('aiAssistantWorking')}</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Bottom: Mode pills + Input ──────────────────────────── */}
            <div className="flex-shrink-0 border-t border-b-border bg-base">
              {/* Mode selector */}
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-2">
                <span className="text-[11px] text-dim mr-1">{t('aiAssistantModeLabel') ?? 'Mode'}</span>
                {MODES.map((m) => {
                  const cfg = MODE_CONFIG[m.id];
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      title={m.desc}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                        isActive
                          ? cfg.active
                          : 'text-muted border-transparent hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      {cfg.icon}
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Input row */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 rounded-xl bg-surface border border-b-border focus-within:border-violet-500/40 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={t('aiAssistantPlaceholder')}
                    disabled={loading}
                    className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none disabled:opacity-50"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="m-1.5 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 text-white disabled:opacity-30 hover:opacity-90 transition-all flex-shrink-0 shadow-sm shadow-violet-500/20 disabled:shadow-none"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
