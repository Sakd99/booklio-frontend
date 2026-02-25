import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Sparkles, UtensilsCrossed, Building2, Dumbbell,
  GraduationCap, Car, Scale, Briefcase, ShoppingBag, Plane,
  PartyPopper, PawPrint, Home, MoreHorizontal, Globe,
  Upload, FileText, X, CheckCircle2, ArrowRight, ChevronRight,
} from 'lucide-react';
import { useI18n } from '../store/i18n.store';
import { onboardingApi } from '../api/onboarding.api';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

const INDUSTRIES = [
  { key: 'healthcare', icon: Stethoscope, titleKey: 'obIndustryHealthcare', descKey: 'obIndustryHealthcareDesc' },
  { key: 'beauty', icon: Sparkles, titleKey: 'obIndustryBeauty', descKey: 'obIndustryBeautyDesc' },
  { key: 'restaurants', icon: UtensilsCrossed, titleKey: 'obIndustryRestaurants', descKey: 'obIndustryRestaurantsDesc' },
  { key: 'real_estate', icon: Building2, titleKey: 'obIndustryRealEstate', descKey: 'obIndustryRealEstateDesc' },
  { key: 'fitness', icon: Dumbbell, titleKey: 'obIndustryFitness', descKey: 'obIndustryFitnessDesc' },
  { key: 'education', icon: GraduationCap, titleKey: 'obIndustryEducation', descKey: 'obIndustryEducationDesc' },
  { key: 'automotive', icon: Car, titleKey: 'obIndustryAutomotive', descKey: 'obIndustryAutomotiveDesc' },
  { key: 'legal', icon: Scale, titleKey: 'obIndustryLegal', descKey: 'obIndustryLegalDesc' },
  { key: 'consulting', icon: Briefcase, titleKey: 'obIndustryConsulting', descKey: 'obIndustryConsultingDesc' },
  { key: 'ecommerce', icon: ShoppingBag, titleKey: 'obIndustryEcommerce', descKey: 'obIndustryEcommerceDesc' },
  { key: 'travel', icon: Plane, titleKey: 'obIndustryTravel', descKey: 'obIndustryTravelDesc' },
  { key: 'events', icon: PartyPopper, titleKey: 'obIndustryEvents', descKey: 'obIndustryEventsDesc' },
  { key: 'pets', icon: PawPrint, titleKey: 'obIndustryPets', descKey: 'obIndustryPetsDesc' },
  { key: 'home_services', icon: Home, titleKey: 'obIndustryHome', descKey: 'obIndustryHomeDesc' },
  { key: 'other', icon: MoreHorizontal, titleKey: 'obIndustryOther', descKey: 'obIndustryOtherDesc' },
] as const;

const STEPS = [
  { num: 1 as Step, titleKey: 'obIndustryTitle' },
  { num: 2 as Step, titleKey: 'obWebsiteTitle' },
  { num: 3 as Step, titleKey: 'obDocsTitle' },
  { num: 4 as Step, titleKey: 'obInstructionsTitle' },
];

export default function Onboarding() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [industry, setIndustry] = useState<string | null>(null);
  // Step 2
  const [website, setWebsite] = useState('');
  // Step 3
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Step 4
  const [instructions, setInstructions] = useState('');
  const [tone, setTone] = useState<string>('friendly');
  const [lang, setLang] = useState<string>('auto');

  const saveStep = async () => {
    setSaving(true);
    try {
      if (step === 1 && industry) {
        await onboardingApi.setIndustry(industry);
      } else if (step === 2 && website.trim()) {
        const url = website.startsWith('http') ? website : `https://${website}`;
        await onboardingApi.setWebsite(url);
      } else if (step === 3 && files.length > 0) {
        setUploading(true);
        await onboardingApi.uploadDocuments(files);
        setUploading(false);
      } else if (step === 4) {
        await onboardingApi.setInstructions({
          customPrompt: instructions.trim() || undefined,
          aiTone: tone,
          language: lang,
        });
      }
    } catch {
      toast.error(step === 3 ? t('obUploadFailed') : t('obSaveFailed'));
      setSaving(false);
      setUploading(false);
      return false;
    }
    setSaving(false);
    return true;
  };

  const handleContinue = async () => {
    const ok = await saveStep();
    if (!ok) return;
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      await finish();
    }
  };

  const handleSkip = () => {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      finish();
    }
  };

  const finish = async () => {
    try {
      await onboardingApi.complete();
    } catch { /* ignore */ }
    navigate('/dashboard', { replace: true });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'text/plain',
    );
    setFiles((prev) => [...prev, ...dropped].slice(0, 5));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).filter(
      (f) => f.type === 'application/pdf' || f.type === 'text/plain',
    );
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-base text-foreground flex">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-[320px] bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
        <div className="mb-10">
          <h2 className="text-lg font-bold">{t('obTitle')}</h2>
          <p className="text-sm text-slate-400 mt-1">{t('obSubtitle')}</p>
        </div>

        <div className="space-y-1 flex-1">
          {STEPS.map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : isDone
                      ? 'text-slate-400'
                      : 'text-slate-500'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-sm font-medium">{t(s.titleKey as any)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-8 border-t border-slate-700">
          <p className="text-xs text-slate-500">{t('obNext')}</p>
          <p className="text-sm font-semibold text-white mt-1">{t('obStartUsing')}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden px-6 pt-6 pb-4 border-b border-b-border">
          <div className="flex items-center gap-2 text-sm text-muted">
            {STEPS.map((s) => (
              <div key={s.num} className="flex items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    step > s.num
                      ? 'bg-emerald-500 text-white'
                      : step === s.num
                        ? 'bg-blue-500 text-white'
                        : 'bg-surface text-muted border border-b-border'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-3 h-3" /> : s.num}
                </div>
                {s.num < 4 && <ChevronRight className="w-3 h-3 text-dim" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 py-8 md:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto"
            >
              {step === 1 && (
                <StepIndustry
                  t={t}
                  selected={industry}
                  onSelect={setIndustry}
                />
              )}
              {step === 2 && (
                <StepWebsite t={t} value={website} onChange={setWebsite} />
              )}
              {step === 3 && (
                <StepDocuments
                  t={t}
                  files={files}
                  uploading={uploading}
                  onDrop={handleDrop}
                  onFileSelect={handleFileSelect}
                  onRemove={removeFile}
                  fileInputRef={fileInputRef}
                />
              )}
              {step === 4 && (
                <StepInstructions
                  t={t}
                  instructions={instructions}
                  onInstructionsChange={setInstructions}
                  tone={tone}
                  onToneChange={setTone}
                  lang={lang}
                  onLangChange={setLang}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-12 lg:px-20 py-5 border-t border-b-border flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors"
          >
            {t('obSkip')}
          </button>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground border border-b-border hover:border-blue-500/20 transition-all"
              >
                {t('obBack')}
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={saving || uploading}
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm disabled:opacity-50"
            >
              {saving || uploading
                ? t('loading')
                : step === 4
                  ? t('obFinish')
                  : t('obContinue')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Industry ──────────────────────────── */
function StepIndustry({
  t,
  selected,
  onSelect,
}: {
  t: (k: any) => string;
  selected: string | null;
  onSelect: (k: string) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t('obIndustryTitle')}</h2>
      <p className="text-muted text-sm mb-8">{t('obIndustrySubtitle')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INDUSTRIES.map((ind) => {
          const Icon = ind.icon;
          const isSelected = selected === ind.key;
          return (
            <button
              key={ind.key}
              onClick={() => onSelect(ind.key)}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20'
                  : 'border-b-border bg-surface hover:border-blue-500/30'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-500/15 text-blue-500'
                    : 'bg-surface text-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{t(ind.titleKey as any)}</div>
                <div className="text-xs text-muted mt-0.5 leading-relaxed">{t(ind.descKey as any)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ─── Step 2: Website ──────────────────────────── */
function StepWebsite({
  t,
  value,
  onChange,
}: {
  t: (k: any) => string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t('obWebsiteTitle')}</h2>
      <p className="text-muted text-sm mb-8">{t('obWebsiteSubtitle')}</p>

      <div className="mb-8">
        <div className="flex items-center rounded-xl border border-b-border bg-input-bg overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
          <div className="px-4 py-3 bg-surface border-r border-b-border">
            <Globe className="w-4 h-4 text-muted" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('obWebsitePlaceholder')}
            className="flex-1 px-4 py-3 bg-transparent text-foreground text-sm outline-none placeholder:text-dim"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">{t('obWebsiteAiLearns')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            t('obWebsiteLearn1'), t('obWebsiteLearn2'), t('obWebsiteLearn3'),
            t('obWebsiteLearn4'), t('obWebsiteLearn5'), t('obWebsiteLearn6'),
            t('obWebsiteLearn7'),
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Step 3: Documents ──────────────────────────── */
function StepDocuments({
  t,
  files,
  uploading,
  onDrop,
  onFileSelect,
  onRemove,
  fileInputRef,
}: {
  t: (k: any) => string;
  files: File[];
  uploading: boolean;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t('obDocsTitle')}</h2>
      <p className="text-muted text-sm mb-6">{t('obDocsSubtitle')}</p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('obDocsGreatFiles')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[t('obDocsFile1'), t('obDocsFile2'), t('obDocsFile3'), t('obDocsFile4')].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-b-border rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/30 transition-colors"
      >
        <Upload className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">{t('obDocsDragDrop')}</p>
        <p className="text-xs text-muted mt-1">{t('obDocsAccepted')}</p>
        <p className="text-xs text-dim mt-0.5">{t('obDocsMaxSize')}</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={onFileSelect}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-b-border bg-surface"
            >
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{file.name}</p>
                <p className="text-xs text-dim">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => onRemove(i)} className="text-muted hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="mt-4 text-center text-sm text-blue-500">{t('obDocsUploading')}</div>
      )}
    </>
  );
}

/* ─── Step 4: Instructions ──────────────────────── */
function StepInstructions({
  t,
  instructions,
  onInstructionsChange,
  tone,
  onToneChange,
  lang,
  onLangChange,
}: {
  t: (k: any) => string;
  instructions: string;
  onInstructionsChange: (v: string) => void;
  tone: string;
  onToneChange: (v: string) => void;
  lang: string;
  onLangChange: (v: string) => void;
}) {
  const tones = [
    { key: 'friendly', label: t('toneFriendly') },
    { key: 'professional', label: t('toneProfessional') },
    { key: 'casual', label: t('toneCasual') },
  ];

  const languages = [
    { key: 'auto', label: 'الكشف التلقائي' },
    { key: 'ar', label: 'العربية' },
    { key: 'en', label: 'الإنجليزية' },
    { key: 'es', label: 'الإسبانية' },
    { key: 'fr', label: 'الفرنسية' },
    { key: 'tr', label: 'التركية' },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t('obInstructionsTitle')}</h2>
      <p className="text-muted text-sm mb-6">{t('obInstructionsSubtitle')}</p>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">{t('obInstructionsGreatFiles')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[t('obInstructionsItem1'), t('obInstructionsItem2'), t('obInstructionsItem3'), t('obInstructionsItem4')].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <textarea
        value={instructions}
        onChange={(e) => onInstructionsChange(e.target.value)}
        maxLength={2000}
        rows={5}
        placeholder={t('obInstructionsPlaceholder')}
        className="w-full rounded-xl border border-b-border bg-input-bg px-4 py-3 text-sm text-foreground outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none transition-all placeholder:text-dim"
      />

      {/* Tone */}
      <div className="mt-6">
        <label className="text-sm font-semibold text-foreground mb-3 block">{t('obToneLabel')}</label>
        <div className="flex gap-2">
          {tones.map((t_item) => (
            <button
              key={t_item.key}
              onClick={() => onToneChange(t_item.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                tone === t_item.key
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-b-border text-muted hover:border-blue-500/20'
              }`}
            >
              {t_item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="mt-5">
        <label className="text-sm font-semibold text-foreground mb-3 block">{t('obLangLabel')}</label>
        <select
          value={lang}
          onChange={(e) => onLangChange(e.target.value)}
          className="w-full sm:w-64 rounded-xl border border-b-border bg-input-bg px-4 py-2.5 text-sm text-foreground outline-none focus:border-blue-500/50 transition-all"
        >
          {languages.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}
