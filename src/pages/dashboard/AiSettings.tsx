import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, MessageSquare, Globe, ToggleLeft, ToggleRight,
  Plus, Trash2, Save, HelpCircle, Target, Zap, ShoppingCart,
  UserPlus, ChevronDown, ChevronUp
} from 'lucide-react';
import { aiSettingsApi } from '../../api/ai-settings.api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const TONES = [
  { value: 'friendly', label: 'Friendly', desc: 'Warm, conversational, uses emojis', icon: '😊' },
  { value: 'professional', label: 'Professional', desc: 'Formal, concise, business-like', icon: '💼' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed, informal, fun', icon: '✌️' },
];

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'Türkçe' },
];

const GOALS = [
  { id: 'maximize_bookings', label: 'Maximize bookings', icon: <Zap className="w-4 h-4" /> },
  { id: 'upsell_services', label: 'Upsell services', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'collect_contacts', label: 'Collect contacts', icon: <UserPlus className="w-4 h-4" /> },
  { id: 'answer_faqs', label: 'Answer FAQs', icon: <HelpCircle className="w-4 h-4" /> },
];

export default function AiSettings() {
  const queryClient = useQueryClient();
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => aiSettingsApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: aiSettingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save'),
  });

  const addFaqMutation = useMutation({
    mutationFn: ({ q, a }: { q: string; a: string }) => aiSettingsApi.addFaq(q, a),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      setNewFaqQ('');
      setNewFaqA('');
      toast.success('FAQ added');
    },
  });

  const removeFaqMutation = useMutation({
    mutationFn: (index: number) => aiSettingsApi.removeFaq(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      toast.success('FAQ removed');
    },
  });

  const [form, setForm] = useState<any>(null);

  // Initialize form when settings load
  if (settings && !form) {
    setForm({
      businessDesc: settings.businessDesc ?? '',
      aiTone: settings.aiTone ?? 'friendly',
      language: settings.language ?? 'en',
      autoReply: settings.autoReply ?? true,
      greetingMsg: settings.greetingMsg ?? '',
      fallbackMsg: settings.fallbackMsg ?? '',
      customPrompt: settings.customPrompt ?? '',
      engagementGoals: settings.engagementGoals ?? [],
    });
  }

  if (isLoading || !form) {
    return <div className="flex items-center justify-center py-32"><Spinner /></div>;
  }

  const faqEntries = (settings?.faqEntries ?? []) as { question: string; answer: string }[];

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const toggleGoal = (goalId: string) => {
    const goals = [...(form.engagementGoals ?? [])];
    const idx = goals.indexOf(goalId);
    if (idx >= 0) goals.splice(idx, 1);
    else goals.push(goalId);
    setForm({ ...form, engagementGoals: goals });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-400" />
            AI Settings
          </h1>
          <p className="text-sm text-white/40 mt-1">Configure how AI responds to your customers via DM</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Auto-Reply Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              form.autoReply ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              <Zap className={`w-5 h-5 ${form.autoReply ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Auto-Reply</h3>
              <p className="text-xs text-white/40">
                {form.autoReply ? 'AI is actively responding to DMs 24/7' : 'AI auto-reply is disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setForm({ ...form, autoReply: !form.autoReply })}
            className="transition-colors"
          >
            {form.autoReply ? (
              <ToggleRight className="w-10 h-10 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-white/20" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Business Context */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Business Context</h3>
        </div>
        <p className="text-xs text-white/30 mb-3">Describe your business so AI knows how to represent you</p>
        <textarea
          value={form.businessDesc}
          onChange={(e) => setForm({ ...form, businessDesc: e.target.value })}
          placeholder="We are a premium barbershop in downtown Riyadh. We specialize in haircuts, beard trimming, and grooming packages..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-blue-500/30 focus:outline-none resize-none transition-colors"
        />
      </motion.div>

      {/* Tone + Language */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Tone & Language</h3>
        </div>

        <p className="text-xs text-white/30 mb-3">Choose how AI speaks to your customers</p>

        {/* Tone */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setForm({ ...form, aiTone: tone.value })}
              className={`p-3 rounded-xl border text-left transition-all ${
                form.aiTone === tone.value
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-white/3 border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="text-lg mb-1">{tone.icon}</div>
              <div className="text-xs font-medium text-white">{tone.label}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{tone.desc}</div>
            </button>
          ))}
        </div>

        {/* Language */}
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-white/30" />
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-blue-500/30 focus:outline-none appearance-none cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-[#111827]">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Messages */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Custom Messages</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Greeting Message</label>
            <input
              type="text"
              value={form.greetingMsg}
              onChange={(e) => setForm({ ...form, greetingMsg: e.target.value })}
              placeholder="Welcome! How can I help you today? 👋"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-blue-500/30 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Fallback Message</label>
            <input
              type="text"
              value={form.fallbackMsg}
              onChange={(e) => setForm({ ...form, fallbackMsg: e.target.value })}
              placeholder="I'm not sure about that. Let me connect you with our team."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-blue-500/30 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* FAQ Manager */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-semibold text-white">FAQ Knowledge Base</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
              {faqEntries.length} entries
            </span>
          </div>
        </div>

        <p className="text-xs text-white/30 mb-4">
          Add common questions and answers. AI will use these to respond instantly without an LLM call.
        </p>

        {/* Existing FAQs */}
        {faqEntries.length > 0 && (
          <div className="space-y-2 mb-4">
            {faqEntries.map((faq, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white mb-1">Q: {faq.question}</p>
                    <p className="text-xs text-white/40">A: {faq.answer}</p>
                  </div>
                  <button
                    onClick={() => removeFaqMutation.mutate(i)}
                    className="p-1.5 text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add FAQ */}
        <div className="space-y-2">
          <input
            type="text"
            value={newFaqQ}
            onChange={(e) => setNewFaqQ(e.target.value)}
            placeholder="Question: e.g. What are your working hours?"
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-orange-500/30 focus:outline-none transition-colors"
          />
          <input
            type="text"
            value={newFaqA}
            onChange={(e) => setNewFaqA(e.target.value)}
            placeholder="Answer: e.g. We are open Monday to Saturday, 9 AM to 7 PM."
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-orange-500/30 focus:outline-none transition-colors"
          />
          <button
            onClick={() => {
              if (newFaqQ.trim() && newFaqA.trim()) {
                addFaqMutation.mutate({ q: newFaqQ.trim(), a: newFaqA.trim() });
              }
            }}
            disabled={!newFaqQ.trim() || !newFaqA.trim() || addFaqMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20 hover:bg-orange-500/15 transition-colors disabled:opacity-30"
          >
            <Plus className="w-3.5 h-3.5" />
            Add FAQ
          </button>
        </div>
      </motion.div>

      {/* Engagement Goals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Engagement Goals</h3>
        </div>
        <p className="text-xs text-white/30 mb-4">Tell AI what to optimize for in conversations</p>

        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal) => {
            const active = form.engagementGoals?.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  active
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-white/3 border-white/5 text-white/40 hover:bg-white/5'
                }`}
              >
                {goal.icon}
                <span className="text-xs font-medium">{goal.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Advanced: Custom Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-5 border border-white/5"
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Advanced: Custom System Prompt</h3>
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-white/30" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/30" />
          )}
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4"
          >
            <p className="text-xs text-white/30 mb-3">
              Override the default AI system prompt. Leave empty to use the default. This replaces the built-in instructions.
            </p>
            <textarea
              value={form.customPrompt}
              onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
              placeholder="You are a helpful assistant for our barbershop. Always be polite and try to guide customers to book an appointment..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white text-sm border border-white/5 focus:border-yellow-500/30 focus:outline-none resize-none font-mono transition-colors"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
