import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, RotateCcw, Info, Cpu, User } from 'lucide-react';
import { api } from '../../api/client';
import Spinner from '../../components/ui/Spinner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  reply: string;
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  systemPrompt: string;
  model: string;
}

export default function AiPlayground() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [lastMeta, setLastMeta] = useState<ChatResponse | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMut = useMutation({
    mutationFn: (msgs: Message[]) =>
      api.post<ChatResponse>('/ai-playground/chat', { messages: msgs }).then((r) => r.data),
    onSuccess: (data, msgs) => {
      setMessages([...msgs, { role: 'assistant', content: data.reply }]);
      setLastMeta(data);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMut.isPending]);

  const send = () => {
    if (!input.trim() || chatMut.isPending) return;
    const newMsgs: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newMsgs);
    setInput('');
    chatMut.mutate(newMsgs);
  };

  const reset = () => {
    setMessages([]);
    setLastMeta(null);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Playground</h1>
          <p className="text-sm text-muted mt-1">Test your AI assistant before enabling it for customers.</p>
        </div>
        <div className="flex items-center gap-2">
          {lastMeta && (
            <button
              onClick={() => setShowPrompt((s) => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground bg-surface hover:bg-card border border-border rounded-lg transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              {showPrompt ? 'Hide' : 'View'} System Prompt
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted hover:text-foreground bg-surface hover:bg-card border border-border rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* System Prompt Viewer */}
      <AnimatePresence>
        {showPrompt && lastMeta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface border border-border rounded-xl p-4 overflow-hidden flex-shrink-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-medium text-muted">System Prompt · Model: {lastMeta.model}</span>
            </div>
            <pre className="text-xs text-muted whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
              {lastMeta.systemPrompt}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Start a conversation</h3>
              <p className="text-sm text-muted max-w-xs">
                Test how your AI assistant responds to customer messages. It uses your current AI settings and FAQs.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
                {[
                  'What services do you offer?',
                  'How much does it cost?',
                  'Can I book an appointment?',
                  'What are your working hours?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); }}
                    className="text-xs text-left px-3 py-2 rounded-xl bg-surface hover:bg-border border border-border text-muted hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-blue-500'
                      : 'bg-gradient-to-br from-violet-500 to-blue-600'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5 text-white" />
                      : <Bot className="w-3.5 h-3.5 text-white" />
                    }
                  </div>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-sm'
                      : 'bg-surface text-foreground rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {chatMut.isPending && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-muted"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Token usage */}
        {lastMeta?.usage?.total_tokens && (
          <div className="px-4 py-1.5 border-t border-border bg-surface/50">
            <span className="text-[10px] text-dim">
              Tokens used: {lastMeta.usage.total_tokens} (prompt: {lastMeta.usage.prompt_tokens}, completion: {lastMeta.usage.completion_tokens})
            </span>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message to test your AI..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-dim focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              disabled={chatMut.isPending}
            />
            <button
              onClick={send}
              disabled={!input.trim() || chatMut.isPending}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {chatMut.isPending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-dim mt-1.5 px-1">
            This is a test environment. Responses use your current AI Settings & FAQs.
          </p>
        </div>
      </div>
    </div>
  );
}
