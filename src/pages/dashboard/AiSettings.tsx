import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, MessageSquare, Globe, ToggleLeft, ToggleRight,
  Plus, Trash2, Save, HelpCircle, Target, Zap, ShoppingCart,
  UserPlus, Pencil, Check, X, RotateCcw, Smile, Briefcase, Coffee,
  Upload, FileText, Settings, BookOpen, ChevronDown,
  Stethoscope, UtensilsCrossed, Building2, Dumbbell,
  GraduationCap, Car, Scale, Briefcase as BriefcaseAlt, ShoppingBag, Plane,
  PartyPopper, PawPrint, Home, MoreHorizontal,
} from 'lucide-react';
import { aiSettingsApi } from '../../api/ai-settings.api';
import Spinner from '../../components/ui/Spinner';
import OnboardingOverlay, { type OnboardingStep } from '../../components/ui/OnboardingOverlay';
import toast from 'react-hot-toast';
import { useI18n } from '../../store/i18n.store';

/* ─── Constants ──────────────────────────────────────────────── */

type Tab = 'personality' | 'knowledge' | 'messages' | 'advanced';

const TABS: { key: Tab; icon: typeof Sparkles; labelKey: string }[] = [
  { key: 'personality', icon: Sparkles, labelKey: 'tabPersonality' },
  { key: 'knowledge', icon: BookOpen, labelKey: 'tabKnowledge' },
  { key: 'messages', icon: MessageSquare, labelKey: 'tabMessages' },
  { key: 'advanced', icon: Settings, labelKey: 'tabAdvanced' },
];

const TONES = [
  { value: 'friendly', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10', activeBorder: 'border-emerald-500/30', activeBg: 'bg-emerald-500/5' },
  { value: 'professional', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10', activeBorder: 'border-blue-500/30', activeBg: 'bg-blue-500/5' },
  { value: 'casual', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-500/10', activeBorder: 'border-orange-500/30', activeBg: 'bg-orange-500/5' },
] as const;

const LANGUAGES = [
  { value: 'auto', labelKey: 'langAuto' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'tr', label: 'Türkçe' },
];

const INDUSTRIES = [
  { key: 'healthcare', icon: Stethoscope },
  { key: 'beauty', icon: Sparkles },
  { key: 'restaurants', icon: UtensilsCrossed },
  { key: 'real_estate', icon: Building2 },
  { key: 'fitness', icon: Dumbbell },
  { key: 'education', icon: GraduationCap },
  { key: 'automotive', icon: Car },
  { key: 'legal', icon: Scale },
  { key: 'consulting', icon: BriefcaseAlt },
  { key: 'ecommerce', icon: ShoppingBag },
  { key: 'travel', icon: Plane },
  { key: 'events', icon: PartyPopper },
  { key: 'pets', icon: PawPrint },
  { key: 'home', icon: Home },
  { key: 'other', icon: MoreHorizontal },
];

const INDUSTRY_PROMPTS: Record<string, string> = {
  healthcare: 'أنت مساعد ذكي لعيادة طبية. ساعد المرضى في حجز المواعيد، والاستفسار عن الخدمات الطبية المتاحة، وأوقات عمل العيادة، والتخصصات الطبية. كن مهنياً ولطيفاً واحرص على خصوصية المرضى.',
  beauty: 'أنت مساعد ذكي لصالون تجميل وعناية شخصية. ساعد العملاء في حجز مواعيد الخدمات مثل قص الشعر، العناية بالبشرة، المكياج، والعناية بالأظافر. اقترح الخدمات المناسبة واعرض الأسعار والعروض المتاحة.',
  restaurants: 'أنت مساعد ذكي لمطعم. ساعد العملاء في الاطلاع على قائمة الطعام، حجز الطاولات، طلب التوصيل، والاستفسار عن المكونات والحساسية الغذائية. كن ودوداً واقترح الأطباق المميزة.',
  real_estate: 'أنت مساعد ذكي لمكتب عقارات. ساعد العملاء في البحث عن العقارات المتاحة للبيع أو الإيجار، وحجز مواعيد المعاينة، والاستفسار عن الأسعار والمواقع والمساحات.',
  fitness: 'أنت مساعد ذكي لمركز لياقة بدنية. ساعد الأعضاء في حجز جلسات التدريب، الاستفسار عن البرامج الرياضية والاشتراكات، ومواعيد الحصص الجماعية. شجّع على نمط حياة صحي.',
  education: 'أنت مساعد ذكي لمركز تعليمي. ساعد الطلاب وأولياء الأمور في الاستفسار عن الدورات المتاحة، حجز الحصص، ومعرفة الأسعار والجداول الزمنية. كن مشجعاً وداعماً.',
  automotive: 'أنت مساعد ذكي لورشة سيارات أو خدمات نقل. ساعد العملاء في حجز مواعيد الصيانة، الاستفسار عن الخدمات المتاحة والأسعار، ومتابعة حالة سياراتهم.',
  legal: 'أنت مساعد ذكي لمكتب محاماة. ساعد العملاء في حجز استشارات قانونية، والاستفسار عن الخدمات القانونية المتاحة مثل القضايا التجارية والأحوال الشخصية والعقود. كن مهنياً ودقيقاً.',
  consulting: 'أنت مساعد ذكي لشركة خدمات مهنية واستشارات. ساعد العملاء في حجز مواعيد الاستشارات، والاستفسار عن الخدمات المقدمة والتخصصات المتاحة والأسعار.',
  ecommerce: 'أنت مساعد ذكي لمتجر إلكتروني. ساعد العملاء في تصفح المنتجات، الاستفسار عن الأسعار والتوفر، متابعة الطلبات، وسياسة الإرجاع والاستبدال. كن ودوداً واقترح منتجات مناسبة.',
  travel: 'أنت مساعد ذكي لوكالة سفر وسياحة. ساعد العملاء في حجز الرحلات، الاستفسار عن الوجهات السياحية، باقات السفر، والتأشيرات والفنادق. قدم توصيات مخصصة.',
  events: 'أنت مساعد ذكي لشركة تنظيم فعاليات. ساعد العملاء في حجز خدمات التنظيم، الاستفسار عن الباقات المتاحة للحفلات والمؤتمرات والمناسبات، والتنسيق مع فريق العمل.',
  pets: 'أنت مساعد ذكي لخدمات الحيوانات الأليفة. ساعد أصحاب الحيوانات في حجز مواعيد العناية والتدريب والخدمات البيطرية، والاستفسار عن المنتجات والخدمات المتاحة.',
  home: 'أنت مساعد ذكي لخدمات منزلية ومحلية. ساعد العملاء في حجز خدمات التنظيف، الصيانة، الإصلاحات، والخدمات المنزلية الأخرى. وضّح الأسعار والمواعيد المتاحة.',
  other: 'أنت مساعد ذكي لنشاط تجاري. ساعد العملاء في الإجابة على استفساراتهم، حجز المواعيد، ومعرفة الخدمات المتاحة والأسعار. كن ودوداً ومتعاوناً.',
};

const INDUSTRY_GREETINGS: Record<string, string> = {
  healthcare: 'أهلاً بك! 👋 كيف يمكنني مساعدتك؟ يمكنني حجز موعد أو الإجابة على استفساراتك الطبية.',
  beauty: 'أهلاً وسهلاً! 💇‍♀️ هل تودين حجز موعد أو الاستفسار عن خدماتنا؟',
  restaurants: 'أهلاً بك! 🍽️ هل تود الاطلاع على القائمة أو حجز طاولة؟',
  real_estate: 'مرحباً! 🏠 كيف يمكنني مساعدتك؟ يمكنني عرض العقارات المتاحة أو حجز موعد معاينة.',
  fitness: 'أهلاً! 💪 هل تود الاستفسار عن برامجنا الرياضية أو حجز جلسة تدريب؟',
  education: 'مرحباً! 📚 كيف يمكنني مساعدتك؟ يمكنني الإجابة عن الدورات المتاحة أو حجز حصة.',
  automotive: 'أهلاً بك! 🚗 هل تحتاج حجز موعد صيانة أو الاستفسار عن خدماتنا؟',
  legal: 'مرحباً! ⚖️ كيف يمكنني مساعدتك؟ يمكنني حجز استشارة قانونية أو الإجابة على استفساراتك.',
  consulting: 'أهلاً بك! 💼 هل تود حجز استشارة أو معرفة المزيد عن خدماتنا؟',
  ecommerce: 'أهلاً وسهلاً! 🛍️ كيف يمكنني مساعدتك؟ يمكنني مساعدتك في البحث عن المنتجات أو متابعة طلبك.',
  travel: 'مرحباً! ✈️ هل تبحث عن رحلة أو تحتاج مساعدة في حجز سفرك؟',
  events: 'أهلاً بك! 🎉 هل تود الاستفسار عن خدمات تنظيم الفعاليات أو حجز خدمة؟',
  pets: 'أهلاً! 🐾 كيف يمكنني مساعدتك؟ يمكنني حجز موعد لحيوانك الأليف أو الإجابة على استفساراتك.',
  home: 'مرحباً! 🏡 هل تحتاج خدمة منزلية؟ يمكنني مساعدتك في الحجز والاستفسار عن خدماتنا.',
  other: 'أهلاً بك! 👋 كيف يمكنني مساعدتك اليوم؟',
};

const INDUSTRY_FALLBACKS: Record<string, string> = {
  healthcare: 'عذراً، لم أتمكن من الإجابة على هذا السؤال. دعني أحولك لفريقنا الطبي للمساعدة.',
  beauty: 'عذراً، لا أملك معلومات كافية عن هذا. دعني أوصلك بفريقنا لمساعدتك.',
  restaurants: 'عذراً، لا أستطيع الإجابة على هذا. دعني أوصلك بفريق المطعم.',
  real_estate: 'عذراً، أحتاج مساعدة فريقنا للإجابة على هذا. سأحولك الآن.',
  fitness: 'عذراً، لا أملك هذه المعلومة حالياً. دعني أوصلك بفريقنا المختص.',
  education: 'عذراً، لا أستطيع الإجابة على هذا السؤال. دعني أحولك لفريقنا التعليمي.',
  automotive: 'عذراً، أحتاج فريقنا الفني للإجابة على هذا. سأحولك الآن.',
  legal: 'عذراً، هذا السؤال يحتاج استشارة متخصصة. دعني أحولك لأحد المحامين.',
  consulting: 'عذراً، لا أملك تفاصيل كافية. دعني أوصلك بأحد مستشارينا.',
  ecommerce: 'عذراً، لا أستطيع المساعدة في هذا. دعني أوصلك بفريق خدمة العملاء.',
  travel: 'عذراً، أحتاج فريقنا للمساعدة في هذا. سأحولك لأحد مستشاري السفر.',
  events: 'عذراً، هذا يحتاج تنسيق مع فريقنا. دعني أحولك للمختصين.',
  pets: 'عذراً، لا أملك هذه المعلومة. دعني أوصلك بفريقنا المختص.',
  home: 'عذراً، لا أستطيع الإجابة على هذا. دعني أوصلك بفريق الخدمات.',
  other: 'عذراً، لم أتمكن من فهم طلبك. دعني أوصلك بفريقنا لمساعدتك.',
};

const ONBOARDING_KEY = 'convly-ai-onboarding';

const ONBOARDING_STEPS: (OnboardingStep & { tab?: Tab })[] = [
  { targetId: 'ai-section-autoreply', titleKey: 'onboardingAutoReply', descKey: 'onboardingAutoReplyDesc' },
  { targetId: 'ai-section-context', tab: 'personality', titleKey: 'onboardingContext', descKey: 'onboardingContextDesc' },
  { targetId: 'ai-section-tone', tab: 'personality', titleKey: 'onboardingTone', descKey: 'onboardingToneDesc' },
  { targetId: 'ai-section-messages', tab: 'messages', titleKey: 'onboardingMessages', descKey: 'onboardingMessagesDesc' },
  { targetId: 'ai-section-faq', tab: 'knowledge', titleKey: 'onboardingFaq', descKey: 'onboardingFaqDesc' },
  { targetId: 'ai-section-goals', tab: 'personality', titleKey: 'onboardingGoals', descKey: 'onboardingGoalsDesc' },
];

/* ─── Reusable sub-components (module-level) ───────────────── */

const Section = ({ id, children, delay = 0, className }: { id: string; children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className={className ?? "glass-card rounded-2xl border border-b-border overflow-hidden"}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, color, label, desc }: { icon: typeof Sparkles; color: string; label: string; desc?: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2.5 mb-1">
      <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    </div>
    {desc && <p className="text-xs text-muted ltr:ml-9 rtl:mr-9">{desc}</p>}
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */

export default function AiSettings() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('personality');

  // FAQ state
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [editFaqQ, setEditFaqQ] = useState('');
  const [editFaqA, setEditFaqA] = useState('');

  // Document upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Industry dropdown
  const [industryOpen, setIndustryOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!industryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setIndustryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [industryOpen]);

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) !== 'done',
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

  /* ─── Queries & Mutations ──── */

  const { data: settings, isLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => aiSettingsApi.get(),
  });

  const updateMutation = useMutation({
    mutationFn: aiSettingsApi.update,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); toast.success(t('settingsSaved')); },
    onError: () => toast.error(t('error')),
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

  const uploadDocMutation = useMutation({
    mutationFn: (files: File[]) => aiSettingsApi.uploadDocuments(files),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); toast.success(t('documentUploaded')); },
    onError: () => toast.error(t('error')),
  });

  const removeDocMutation = useMutation({
    mutationFn: (index: number) => aiSettingsApi.removeDocument(index),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ai-settings'] }); toast.success(t('documentRemoved')); },
  });

  /* ─── Form State ──── */

  const [form, setForm] = useState<any>(null);

  // All hooks MUST be called before any early return
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'text/plain',
    );
    if (files.length > 0) uploadDocMutation.mutate(files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
        industry: settings.industry ?? '',
        websiteUrl: settings.websiteUrl ?? '',
      });
    }
  }, [settings, form]);

  if (isLoading || !form) {
    return <div className="flex items-center justify-center py-32"><Spinner /></div>;
  }

  const faqEntries = (settings?.faqEntries ?? []) as { question: string; answer: string }[];
  const knowledgeDocs = (settings?.knowledgeDocs ?? []) as { fileName: string; content: string; uploadedAt: string }[];

  /* ─── Handlers ──── */

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'text/plain',
    );
    if (files.length > 0) uploadDocMutation.mutate(files);
    e.target.value = '';
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  /* ─── Tab: Personality ──── */
  const renderPersonalityTab = () => (
    <div className="space-y-5">
      {/* Industry */}
      <Section id="ai-section-industry" className="glass-card rounded-2xl border border-b-border overflow-visible">
        <div className="p-5">
          <SectionHeader icon={Building2} color="bg-violet-500/10 text-violet-500" label={t('industryLabel')} desc={t('industryDesc')} />
          <div className="relative" ref={industryRef}>
            <button
              onClick={() => setIndustryOpen(!industryOpen)}
              className="input-base w-full flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {form.industry && (() => {
                  const ind = INDUSTRIES.find((i) => i.key === form.industry);
                  if (!ind) return null;
                  const Icon = ind.icon;
                  return <Icon className="w-4 h-4 text-muted" />;
                })()}
                <span className={form.industry ? 'text-foreground' : 'text-dim'}>
                  {form.industry ? t(`obIndustry${form.industry.charAt(0).toUpperCase()}${form.industry.slice(1).replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase())}` as any) : t('select')}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-dim transition-transform ${industryOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {industryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 mt-1.5 w-full max-h-60 overflow-y-auto bg-card border border-b-border rounded-xl shadow-xl"
                >
                  {INDUSTRIES.map((ind) => {
                    const Icon = ind.icon;
                    const isActive = form.industry === ind.key;
                    return (
                      <button
                        key={ind.key}
                        onClick={() => {
                          const prompt = INDUSTRY_PROMPTS[ind.key] ?? '';
                          const greeting = INDUSTRY_GREETINGS[ind.key] ?? '';
                          const fallback = INDUSTRY_FALLBACKS[ind.key] ?? '';
                          setForm((prev: any) => ({
                            ...prev,
                            industry: ind.key,
                            businessDesc: (!prev.businessDesc || INDUSTRY_PROMPTS[prev.industry]) ? prompt : prev.businessDesc,
                            greetingMsg: (!prev.greetingMsg || INDUSTRY_GREETINGS[prev.industry]) ? greeting : prev.greetingMsg,
                            fallbackMsg: (!prev.fallbackMsg || INDUSTRY_FALLBACKS[prev.industry]) ? fallback : prev.fallbackMsg,
                          }));
                          setIndustryOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ltr:text-left rtl:text-right ${
                          isActive ? 'bg-violet-500/10 text-violet-500' : 'text-foreground hover:bg-surface'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {t(`obIndustry${ind.key.charAt(0).toUpperCase()}${ind.key.slice(1).replace(/_(\w)/g, (_: string, c: string) => c.toUpperCase())}` as any)}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Section>

      {/* Business Context */}
      <Section id="ai-section-context" delay={0.05}>
        <div className="p-5">
          <SectionHeader icon={Sparkles} color="bg-blue-500/10 text-blue-500" label={t('businessContext')} desc={t('businessContextDesc')} />
          <textarea
            value={form.businessDesc}
            onChange={(e) => setForm({ ...form, businessDesc: e.target.value })}
            placeholder={t('businessContextPlaceholder')}
            rows={4}
            maxLength={2000}
            className="input-base resize-none"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[10px] text-dim">{form.businessDesc.length} / 2000</span>
          </div>
        </div>
      </Section>

      {/* Tone + Language */}
      <Section id="ai-section-tone" delay={0.1}>
        <div className="p-5">
          <SectionHeader icon={MessageSquare} color="bg-violet-500/10 text-violet-500" label={t('toneAndLang')} desc={t('toneDesc')} />

          <div className="grid grid-cols-3 gap-3 mb-5">
            {TONES.map((tone) => {
              const isActive = form.aiTone === tone.value;
              const Icon = tone.icon;
              return (
                <button
                  key={tone.value}
                  onClick={() => setForm({ ...form, aiTone: tone.value })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    isActive
                      ? `${tone.activeBg} ${tone.activeBorder} shadow-sm`
                      : 'bg-surface border-b-border hover:border-muted/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${tone.bg} flex items-center justify-center mx-auto mb-2.5`}>
                    <Icon className={`w-5 h-5 ${tone.color}`} />
                  </div>
                  <div className={`text-xs font-semibold ${isActive ? tone.color : 'text-foreground'}`}>
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
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {'label' in lang ? lang.label : t(lang.labelKey as any)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      {/* Engagement Goals */}
      <Section id="ai-section-goals" delay={0.15}>
        <div className="p-5">
          <SectionHeader icon={Target} color="bg-blue-500/10 text-blue-500" label={t('engagementGoals')} desc={t('engagementGoalsDesc')} />
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
                      : 'bg-surface border-b-border text-muted hover:border-muted/20'
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
    </div>
  );

  /* ─── Tab: Knowledge Base ──── */
  const renderKnowledgeTab = () => (
    <div className="space-y-5">
      {/* Website */}
      <Section id="ai-section-website">
        <div className="p-5">
          <SectionHeader icon={Globe} color="bg-emerald-500/10 text-emerald-500" label={t('websiteLabel')} desc={t('websiteDesc')} />
          <div className="flex items-center rounded-xl border border-b-border bg-input-bg overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
            <div className="px-4 py-3 bg-surface ltr:border-r rtl:border-l border-b-border">
              <Globe className="w-4 h-4 text-muted" />
            </div>
            <input
              type="text"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-dim"
            />
          </div>
        </div>
      </Section>

      {/* Knowledge Documents */}
      <Section id="ai-section-documents" delay={0.05}>
        <div className="p-5">
          <SectionHeader icon={FileText} color="bg-blue-500/10 text-blue-500" label={t('documentsLabel')} desc={t('documentsDesc')} />

          {/* Document list */}
          {knowledgeDocs.length > 0 && (
            <div className="space-y-2 mb-4">
              {knowledgeDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-b-border bg-surface">
                  <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{doc.fileName}</p>
                    <p className="text-[10px] text-dim">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => removeDocMutation.mutate(i)}
                    className="p-1.5 rounded-lg text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          {knowledgeDocs.length < 5 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-b-border rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/30 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">{t('uploadDocument')}</p>
              <p className="text-[10px] text-dim mt-1">PDF, TXT — {t('max')} 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {knowledgeDocs.length === 0 && (
            <p className="text-xs text-muted text-center py-2">{t('noDocuments')}</p>
          )}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="ai-section-faq" delay={0.1}>
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
          <p className="text-xs text-muted mb-4 ltr:ml-9 rtl:mr-9">{t('faqDesc')}</p>

          {/* Existing FAQ entries */}
          {faqEntries.length > 0 && (
            <div className="space-y-2 mb-4">
              {faqEntries.map((faq, i) => (
                <div key={i} className="rounded-xl bg-surface border border-b-border overflow-hidden transition-all">
                  {editingFaq === i ? (
                    <div className="p-3 space-y-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 block">{t('question')}</label>
                        <input type="text" value={editFaqQ} onChange={(e) => setEditFaqQ(e.target.value)} className="input-base !text-xs" autoFocus />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1 block">{t('answer')}</label>
                        <textarea value={editFaqA} onChange={(e) => setEditFaqA(e.target.value)} className="input-base !text-xs resize-none" rows={2} />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button onClick={() => setEditingFaq(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-surface border border-b-border transition-all">
                          <X className="w-3 h-3" /> {t('cancelEdit')}
                        </button>
                        <button onClick={saveEditFaq} disabled={!editFaqQ.trim() || !editFaqA.trim() || updateFaqMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-40">
                          <Check className="w-3 h-3" /> {t('saveFaq')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex-shrink-0">{t('question').charAt(0)}:</span>
                            <p className="text-xs font-medium text-foreground">{faq.question}</p>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex-shrink-0">{t('answer').charAt(0)}:</span>
                            <p className="text-xs text-muted">{faq.answer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => startEditFaq(i)} className="p-1.5 rounded-lg text-dim hover:text-blue-500 hover:bg-blue-500/10 transition-colors" title={t('editFaq')}>
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => { if (confirm(t('confirmDeleteFaq'))) removeFaqMutation.mutate(i); }} className="p-1.5 rounded-lg text-dim hover:text-red-500 hover:bg-red-500/10 transition-colors" title={t('deleteFaq')}>
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

          {/* Add FAQ */}
          <div className="rounded-xl border border-dashed border-b-border p-3 space-y-2">
            <input type="text" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder={`${t('question')}...`} className="input-base !text-xs" />
            <input type="text" value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder={`${t('answer')}...`} className="input-base !text-xs" />
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
    </div>
  );

  /* ─── Tab: Messages ──── */
  const renderMessagesTab = () => (
    <div className="space-y-5">
      <Section id="ai-section-messages">
        <div className="p-5">
          <SectionHeader icon={MessageSquare} color="bg-emerald-500/10 text-emerald-500" label={t('customMessages')} desc={t('customMessagesDesc')} />
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">{t('greetingMessage')}</label>
              <input
                type="text"
                value={form.greetingMsg}
                onChange={(e) => setForm({ ...form, greetingMsg: e.target.value })}
                className="input-base"
                placeholder={t('greetingPlaceholder')}
                maxLength={500}
              />
              <div className="flex justify-end mt-1"><span className="text-[10px] text-dim">{form.greetingMsg.length} / 500</span></div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">{t('fallbackMessage')}</label>
              <input
                type="text"
                value={form.fallbackMsg}
                onChange={(e) => setForm({ ...form, fallbackMsg: e.target.value })}
                className="input-base"
                placeholder={t('fallbackPlaceholder')}
                maxLength={500}
              />
              <div className="flex justify-end mt-1"><span className="text-[10px] text-dim">{form.fallbackMsg.length} / 500</span></div>
            </div>
          </div>
        </div>
      </Section>

      {/* Preview */}
      <Section id="ai-section-preview" delay={0.05}>
        <div className="p-5">
          <SectionHeader icon={MessageSquare} color="bg-violet-500/10 text-violet-500" label={t('messagePreview')} />
          <div className="rounded-xl bg-surface border border-b-border p-4 space-y-3">
            {form.greetingMsg && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-base rounded-xl rounded-tl-sm px-3 py-2 text-xs text-foreground max-w-[80%]">
                  {form.greetingMsg}
                </div>
              </div>
            )}
            {form.fallbackMsg && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-base rounded-xl rounded-tl-sm px-3 py-2 text-xs text-muted italic max-w-[80%]">
                  {form.fallbackMsg}
                </div>
              </div>
            )}
            {!form.greetingMsg && !form.fallbackMsg && (
              <p className="text-xs text-dim text-center py-4">{t('noMessagesPreview')}</p>
            )}
          </div>
        </div>
      </Section>
    </div>
  );

  /* ─── Tab: Advanced ──── */
  const renderAdvancedTab = () => (
    <div className="space-y-5">
      <Section id="ai-section-advanced">
        <div className="p-5">
          <SectionHeader icon={Zap} color="bg-yellow-500/10 text-yellow-500" label={t('advancedPrompt')} desc={t('advancedPromptDesc')} />
          <textarea
            value={form.customPrompt}
            onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
            placeholder={t('advancedPromptPlaceholder')}
            rows={8}
            maxLength={2000}
            className="input-base resize-none font-mono text-xs"
          />
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setForm({ ...form, customPrompt: '' })}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> {t('resetPrompt')}
            </button>
            <span className="text-[10px] text-dim">{form.customPrompt.length} / 2000</span>
          </div>
        </div>
      </Section>
    </div>
  );

  /* ─── Render ──── */

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

        {/* Auto-Reply Toggle — always visible */}
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

        {/* Tab Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-b-border pb-px -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                    : 'border-transparent text-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(tab.labelKey as any)}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'personality' && renderPersonalityTab()}
            {activeTab === 'knowledge' && renderKnowledgeTab()}
            {activeTab === 'messages' && renderMessagesTab()}
            {activeTab === 'advanced' && renderAdvancedTab()}
          </motion.div>
        </AnimatePresence>

        <div className="h-6" />
      </div>

      {/* Onboarding overlay */}
      <OnboardingOverlay
        steps={ONBOARDING_STEPS}
        storageKey={ONBOARDING_KEY}
        active={showOnboarding}
        onFinish={() => setShowOnboarding(false)}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
      />
    </>
  );
}
