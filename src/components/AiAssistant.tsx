import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Trash2, Bot, User, Loader2, ChevronDown } from 'lucide-react';
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

export default function AiAssistant({ open, onClose }: AiAssistantProps) {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';

  const [mode, setMode] = useState<Mode>('auto');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('aiAssistantWelcome'), timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const MODES: { id: Mode; label: string; desc: string }[] = [
    { id: 'auto', label: t('aiAssistantModeAuto'), desc: t('aiAssistantModeAutoDesc') },
    { id: 'ask', label: t('aiAssistantModeAsk'), desc: t('aiAssistantModeAskDesc') },
    { id: 'plan', label: t('aiAssistantModePlan'), desc: t('aiAssistantModePlanDesc') },
  ];

  const currentMode = MODES.find((m) => m.id === mode)!;

  const sendMessage = async () => {
    const text = input.trim();
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
      setMessages((prev) => [...prev, { role: 'assistant', content: t('aiAssistantError'), timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: t('aiAssistantWelcome'), timestamp: new Date() }]);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRtl ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 ${isRtl ? 'left-0' : 'right-0'} h-full w-full sm:w-[420px] z-50 flex flex-col bg-base border-${isRtl ? 'r' : 'l'} border-b-border shadow-2xl`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-b-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">{t('aiAssistantTitle')}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  title={t('aiAssistantClear')}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="px-4 py-2 border-b border-b-border relative">
              <button
                onClick={() => setModeOpen((p) => !p)}
                className="flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors"
              >
                <span className="font-medium text-foreground">{currentMode.label}</span>
                <span className="text-dim">— {currentMode.desc}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${modeOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {modeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full left-4 right-4 z-10 mt-1 rounded-xl bg-surface border border-b-border shadow-lg overflow-hidden"
                  >
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setMode(m.id); setModeOpen(false); }}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-base transition-colors ${mode === m.id ? 'bg-violet-500/5' : ''}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${mode === m.id ? 'bg-violet-500' : 'bg-muted/30'}`} />
                        <div>
                          <div className={`text-sm font-medium ${mode === m.id ? 'text-violet-500' : 'text-foreground'}`}>{m.label}</div>
                          <div className="text-xs text-muted">{m.desc}</div>
                        </div>
                        {mode === m.id && (
                          <span className="ml-auto text-[10px] font-bold text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded">✓</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-br from-violet-500 to-blue-500'
                      : 'bg-surface border border-b-border'
                  }`}>
                    {msg.role === 'assistant'
                      ? <Bot className="w-3.5 h-3.5 text-white" />
                      : <User className="w-3.5 h-3.5 text-muted" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'assistant'
                        ? 'bg-surface border border-b-border text-foreground rounded-tl-sm'
                        : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-dim px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-violet-500 to-blue-500">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-surface border border-b-border px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500 flex-shrink-0" />
                    <span className="text-xs text-muted">{t('aiAssistantWorking')}</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-b-border">
              <div className="flex items-center gap-2 rounded-xl bg-surface border border-b-border focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={t('aiAssistantPlaceholder')}
                  disabled={loading}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none disabled:opacity-50"
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="m-1.5 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
