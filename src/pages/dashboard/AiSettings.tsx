import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, MessageSquare, Globe, ToggleLeft, ToggleRight,
  Plus, Trash2, Save, HelpCircle, Target, Zap, ShoppingCart,
  UserPlus, ChevronDown, ChevronUp, Pencil, Check, X, RotateCcw,
} from 'lucide-react';
import { aiSettingsApi } from '../../api/ai-settings.api';
import Spinner from '../../components/ui/Spinner';
import OnboardingOverlay, { type OnboardingStep } from '../../components/ui/OnboardingOverlay';
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

const ONBOARDING_KEY = 'convly-ai-onboarding';

const ONBOARDING_STEPS: OnboardingStep[] = [
  { targetId: 'ai-section-autoreply', titleKey: 'onboardingAutoReply', descKey: 'onboardingAutoReplyDesc' },
  { targetId: 'ai-section-context', titleKey: 'onboardingContext', descKey: 'onboardingContextDesc' },
  { targetId: 'ai-section-tone', titleKey: 'onboardingTone', descKey: 'onboardingToneDesc' },
  { targetId: 'ai-section-messages', titleKey: 'onboardingMessages', descKey: 'onboardingMessagesDesc' },
  { targetId: 'ai-section-faq', titleKey: 'onboardingFaq', descKey: 'onboardingFaqDesc' },
  { targetId: 'ai-section-goals', titleKey: 'onboardingGoals', descKey: 'onboardingGoalsDesc' },
];

export default function AiSettings() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [editFaqQ, setEditFaqQ] = useState('');
  const [editFaqA, setEditFaqA] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) !== 'done'
  );

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

  const updateFaqMutation = useMutation({
    mutationFn: ({ index, q, a }: { index: number; q: string; a: string }) => aiSettingsApi.updateFaq(index, q, a),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); setEditingFaq(null); toast.success(t('faqUpdated')); },
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

  const startEditFaq = (index: number) => {
    setEditingFaq(index);
    setEditFaqQ(faqEntries[index].question);
    setEditFaqA(faqEntries[index].answer);
  };

  const saveEditFaq = () => {
    if (editingFaq === null || !editFaqQ.trim() || !editFaqA.trim()) return;
    updateFaqMutation.mutate({ index: editingFaq, q: editFaqQ.trim(), a: editFaqA.trim() });
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  // Section card wrapper for consistent styling
  const Section = ({ id, children, delay = 0 }: { id: string; children: React.ReactNode; delay?: number }) => (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass-card rounded-2xl border border-b-border overflow-hidden"
    >
      {children}
    </motion.div>
  );

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              {t('aiSettingsTitle')}
            </h1>
            <p className="text-sm text-muted mt-1.5">{t('aiSettingsDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestartTutorial}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-muted border border-b-border hover:text-foreground hover:bg-surface transition-all"
              title={t('restartTutorial')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('restartTutorial')}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? t('saving') : t('saveSettings')}
            </button>
          </div>
        </div>

        {/* Auto-Reply Toggle */}
        <Section id="ai-section-autoreply">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${form.autoReply ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <Zap className={`w-5 h-5 ${form.autoReply ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{t('autoReply')}</h3>
                <p className="text-xs text-muted mt-0.5">{form.autoReply ? t('autoReplyOn') : t('autoReplyOff')}</p>
              </div>
            </div>
            <button onClick={() => setForm({ ...form, autoReply: !form.autoReply })} className="transition-colors">
              {form.autoReply ? <ToggleRight className="w-10 h-10 text-emerald-500" /> : <ToggleLeft className="w-10 h-10 text-dim" />}
            </button>
          </div>
        </Section>

        {/* Business Context */}
        <Section id="ai-section-context" delay={0.05}>
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('businessContext')}</h3>
            </div>
            <p className="text-xs text-muted mb-3 ms-9">{t('businessContextDesc')}</p>
            <textarea
              value={form.businessDesc}
              onChange={(e) => setForm({ ...form, businessDesc: e.target.value })}
              placeholder={t('businessContextPlaceholder')}
              rows={3}
              className="input-base resize-none"
            />
          </div>
        </Section>

        {/* Tone + Language */}
        <Section id="ai-section-tone" delay={0.1}>
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('toneAndLang')}</h3>
            </div>
            <p className="text-xs text-muted mb-4 ms-9">{t('toneDesc')}</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {TONES.map((tone) => {
                const isActive = form.aiTone === tone.value;
                return (
                  <button
                    key={tone.value}
                    onClick={() => setForm({ ...form, aiTone: tone.value })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-violet-500/10 border-violet-500/30 shadow-sm'
                        : 'bg-surface border-b-border hover:bg-surface-hover hover:border-muted/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{tone.icon}</div>
                    <div className={`text-xs font-semibold ${isActive ? 'text-violet-500' : 'text-foreground'}`}>
                      {TONE_MAP[tone.value].label}
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">{TONE_MAP[tone.value].desc}</div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                <Globe className="w-3.5 h-3.5 text-dim" />
              </div>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="input-base flex-1 cursor-pointer"
              >
                {LANGUAGES.map((lang) => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Custom Messages */}
        <Section id="ai-section-messages" delay={0.15}>
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('customMessages')}</h3>
            </div>
            <p className="text-xs text-muted mb-4 ms-9">{t('greetingMessage')} &amp; {t('fallbackMessage')}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted mb-1.5 block">{t('greetingMessage')}</label>
                <input
                  type="text"
                  value={form.greetingMsg}
                  onChange={(e) => setForm({ ...form, greetingMsg: e.target.value })}
                  className="input-base"
                  placeholder="Welcome! How can I help you today? 👋"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted mb-1.5 block">{t('fallbackMessage')}</label>
                <input
                  type="text"
                  value={form.fallbackMsg}
                  onChange={(e) => setForm({ ...form, fallbackMsg: e.target.value })}
                  className="input-base"
                  placeholder="I'm not sure about that. Let me connect you with our team."
                />
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ Manager */}
        <Section id="ai-section-faq" delay={0.2}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{t('faqKnowledgeBase')}</h3>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 font-semibold">
                {faqEntries.length} {t('faqEntries')}
              </span>
            </div>
            <p className="text-xs text-muted mb-4 ms-9">{t('faqDesc')}</p>

            {/* Existing FAQ entries */}
            {faqEntries.length > 0 && (
              <div className="space-y-2 mb-4">
                {faqEntries.map((faq, i) => (
                  <div key={i} className="rounded-xl bg-surface border border-b-border overflow-hidden transition-all">
                    {editingFaq === i ? (
                      /* Edit mode */
                      <div className="p-3 space-y-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 block">
                            {t('question')}
                          </label>
                          <input
                            type="text"
                            value={editFaqQ}
                            onChange={(e) => setEditFaqQ(e.target.value)}
                            className="input-base !text-xs"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 block">
                            {t('answer')}
                          </label>
                          <textarea
                            value={editFaqA}
                            onChange={(e) => setEditFaqA(e.target.value)}
                            className="input-base !text-xs resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingFaq(null)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-surface-hover border border-b-border transition-all"
                          >
                            <X className="w-3 h-3" />
                            {t('cancelEdit')}
                          </button>
                          <button
                            onClick={saveEditFaq}
                            disabled={!editFaqQ.trim() || !editFaqA.trim() || updateFaqMutation.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-40"
                          >
                            <Check className="w-3 h-3" />
                            {t('saveFaq')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div className="p-3 group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 mb-1">
                              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex-shrink-0">Q:</span>
                              <p className="text-xs font-medium text-foreground">{faq.question}</p>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex-shrink-0">A:</span>
                              <p className="text-xs text-muted">{faq.answer}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => startEditFaq(i)}
                              className="p-1.5 rounded-lg text-dim hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title={t('editFaq')}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t('confirmDeleteFaq'))) removeFaqMutation.mutate(i);
                              }}
                              className="p-1.5 rounded-lg text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title={t('deleteFaq')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add new FAQ */}
            <div className="rounded-xl border border-dashed border-b-border p-3 space-y-2">
              <input
                type="text"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                placeholder={`${t('question')}...`}
                className="input-base !text-xs"
              />
              <input
                type="text"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                placeholder={`${t('answer')}...`}
                className="input-base !text-xs"
              />
              <button
                onClick={() => { if (newFaqQ.trim() && newFaqA.trim()) addFaqMutation.mutate({ q: newFaqQ.trim(), a: newFaqA.trim() }); }}
                disabled={!newFaqQ.trim() || !newFaqA.trim() || addFaqMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-medium border border-orange-500/20 hover:bg-orange-500/15 transition-colors disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" /> {t('addFaq')}
              </button>
            </div>
          </div>
        </Section>

        {/* Engagement Goals */}
        <Section id="ai-section-goals" delay={0.25}>
          <div className="p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('engagementGoals')}</h3>
            </div>
            <p className="text-xs text-muted mb-4 ms-9">{t('engagementGoalsDesc')}</p>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => {
                const active = form.engagementGoals?.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      active
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-sm'
                        : 'bg-surface border-b-border text-muted hover:bg-surface-hover hover:border-muted/20'
                    }`}
                  >
                    {goal.icon}
                    <span className="text-xs font-medium">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Advanced Prompt */}
        <Section id="ai-section-advanced" delay={0.3}>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center justify-between w-full p-5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{t('advancedPrompt')}</h3>
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-dim" /> : <ChevronDown className="w-4 h-4 text-dim" />}
          </button>
          {showAdvanced && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 pb-5">
              <p className="text-xs text-muted mb-3 ms-9">{t('advancedPromptDesc')}</p>
              <textarea
                value={form.customPrompt}
                onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
                placeholder="You are a helpful assistant for our barbershop..."
                rows={5}
                className="input-base resize-none font-mono text-xs"
              />
            </motion.div>
          )}
        </Section>

        <div className="h-6" />
      </div>

      {/* Onboarding overlay */}
      <OnboardingOverlay
        steps={ONBOARDING_STEPS}
        storageKey={ONBOARDING_KEY}
        active={showOnboarding}
        onFinish={() => setShowOnboarding(false)}
      />
    </>
  );
}
