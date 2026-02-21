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
import { useI18n } from '../../store/i18n.store';

const TONES = [
  { value: 'friendly', icon: '😊' },
  { value: 'professional', icon: '💼' },
  { value: 'casual', icon: '✌️' },
] as const;

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'Türkçe' },
];

export default function AiSettings() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const GOALS = [
    { id: 'maximize_bookings', label: t('goalBookings'), icon: <Zap className="w-4 h-4" /> },
    { id: 'upsell_services', label: t('goalUpsell'), icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'collect_contacts', label: t('goalContacts'), icon: <UserPlus className="w-4 h-4" /> },
    { id: 'answer_faqs', label: t('goalFaqs'), icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const TONE_MAP: Record<string, { label: string; desc: string }> = {
    friendly: { label: t('toneFriendly'), desc: t('toneFriendlyDesc') },
    professional: { label: t('toneProfessional'), desc: t('toneProfessionalDesc') },
    casual: { label: t('toneCasual'), desc: t('toneCasualDesc') },
  };

  const { data: settings, isLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => aiSettingsApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: aiSettingsApi.update,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); toast.success(t('settingsSaved')); },
    onError: () => toast.error('Failed to save'),
  });

  const addFaqMutation = useMutation({
    mutationFn: ({ q, a }: { q: string; a: string }) => aiSettingsApi.addFaq(q, a),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); setNewFaqQ(''); setNewFaqA(''); toast.success(t('faqAdded')); },
  });

  const removeFaqMutation = useMutation({
    mutationFn: (index: number) => aiSettingsApi.removeFaq(index),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); toast.success(t('faqRemoved')); },
  });

  const [form, setForm] = useState<any>(null);

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

  const handleSave = () => updateMutation.mutate(form);

  const toggleGoal = (goalId: string) => {
    const goals = [...(form.engagementGoals ?? [])];
    const idx = goals.indexOf(goalId);
    if (idx >= 0) goals.splice(idx, 1); else goals.push(goalId);
    setForm({ ...form, engagementGoals: goals });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-500" />
            {t('aiSettingsTitle')}
          </h1>
          <p className="text-sm text-muted mt-1">{t('aiSettingsDesc')}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? t('saving') : t('saveSettings')}
        </button>
      </div>

      {/* Auto-Reply Toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.autoReply ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <Zap className={`w-5 h-5 ${form.autoReply ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t('autoReply')}</h3>
              <p className="text-xs text-muted">{form.autoReply ? t('autoReplyOn') : t('autoReplyOff')}</p>
            </div>
          </div>
          <button onClick={() => setForm({ ...form, autoReply: !form.autoReply })} className="transition-colors">
            {form.autoReply ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-dim" />}
          </button>
        </div>
      </motion.div>

      {/* Business Context */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">{t('businessContext')}</h3>
        </div>
        <p className="text-xs text-muted mb-3">{t('businessContextDesc')}</p>
        <textarea
          value={form.businessDesc}
          onChange={(e) => setForm({ ...form, businessDesc: e.target.value })}
          placeholder={t('businessContextPlaceholder')}
          rows={3}
          className="input-base resize-none"
        />
      </motion.div>

      {/* Tone + Language */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-foreground">{t('toneAndLang')}</h3>
        </div>
        <p className="text-xs text-muted mb-3">{t('toneDesc')}</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {TONES.map((tone) => (
            <button
              key={tone.value}
              onClick={() => setForm({ ...form, aiTone: tone.value })}
              className={`p-3 rounded-xl border text-left transition-all ${
                form.aiTone === tone.value
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-surface border-b-border hover:bg-surface-hover'
              }`}
            >
              <div className="text-lg mb-1">{tone.icon}</div>
              <div className="text-xs font-medium text-foreground">{TONE_MAP[tone.value].label}</div>
              <div className="text-[10px] text-muted mt-0.5">{TONE_MAP[tone.value].desc}</div>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-dim" />
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="input-base !flex-1 cursor-pointer"
          >
            {LANGUAGES.map((lang) => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Custom Messages */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">{t('customMessages')}</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">{t('greetingMessage')}</label>
            <input type="text" value={form.greetingMsg} onChange={(e) => setForm({ ...form, greetingMsg: e.target.value })} className="input-base" placeholder="Welcome! How can I help you today? 👋" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">{t('fallbackMessage')}</label>
            <input type="text" value={form.fallbackMsg} onChange={(e) => setForm({ ...form, fallbackMsg: e.target.value })} className="input-base" placeholder="I'm not sure about that. Let me connect you with our team." />
          </div>
        </div>
      </motion.div>

      {/* FAQ Manager */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">{t('faqKnowledgeBase')}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">{faqEntries.length} {t('faqEntries')}</span>
          </div>
        </div>
        <p className="text-xs text-muted mb-4">{t('faqDesc')}</p>
        {faqEntries.length > 0 && (
          <div className="space-y-2 mb-4">
            {faqEntries.map((faq, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface border border-b-border group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground mb-1">Q: {faq.question}</p>
                    <p className="text-xs text-muted">A: {faq.answer}</p>
                  </div>
                  <button onClick={() => removeFaqMutation.mutate(i)} className="p-1.5 text-dim hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <input type="text" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder={`${t('question')}...`} className="input-base" />
          <input type="text" value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder={`${t('answer')}...`} className="input-base" />
          <button
            onClick={() => { if (newFaqQ.trim() && newFaqA.trim()) addFaqMutation.mutate({ q: newFaqQ.trim(), a: newFaqA.trim() }); }}
            disabled={!newFaqQ.trim() || !newFaqA.trim() || addFaqMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-medium border border-orange-500/20 hover:bg-orange-500/15 transition-colors disabled:opacity-30"
          >
            <Plus className="w-3.5 h-3.5" /> {t('addFaq')}
          </button>
        </div>
      </motion.div>

      {/* Engagement Goals */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">{t('engagementGoals')}</h3>
        </div>
        <p className="text-xs text-muted mb-4">{t('engagementGoalsDesc')}</p>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal) => {
            const active = form.engagementGoals?.includes(goal.id);
            return (
              <button key={goal.id} onClick={() => toggleGoal(goal.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${active ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-surface border-b-border text-muted hover:bg-surface-hover'}`}>
                {goal.icon}
                <span className="text-xs font-medium">{goal.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Advanced Prompt */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-5 border border-b-border">
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-foreground">{t('advancedPrompt')}</h3>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-dim" /> : <ChevronDown className="w-4 h-4 text-dim" />}
        </button>
        {showAdvanced && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
            <p className="text-xs text-muted mb-3">{t('advancedPromptDesc')}</p>
            <textarea
              value={form.customPrompt}
              onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
              placeholder="You are a helpful assistant for our barbershop..."
              rows={5}
              className="input-base resize-none font-mono"
            />
          </motion.div>
        )}
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
