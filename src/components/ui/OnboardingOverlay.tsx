import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';

export interface OnboardingStep {
  targetId: string;
  titleKey: string;
  descKey: string;
  tab?: string;
}

interface Props {
  steps: OnboardingStep[];
  storageKey: string;
  active: boolean;
  onFinish: () => void;
  onTabChange?: (tab: string) => void;
}

const TOOLTIP_H = 240;
const PAD = 14;

export default function OnboardingOverlay({ steps, storageKey, active, onFinish, onTabChange }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);

  const current = steps[step];
  const isLastStep = step === steps.length - 1;

  // Scroll target into view, then measure after scroll settles
  const scrollAndMeasure = useCallback(() => {
    if (!current) return;
    setReady(false);

    // Switch tab if step requires a different one
    if (current.tab && onTabChange) {
      onTabChange(current.tab);
    }

    // Small delay to let tab content render before finding element
    const findEl = () => document.getElementById(current.targetId);
    let el = findEl();
    if (!el && current.tab) {
      // Element might not be in DOM yet — wait for tab render
      const retryTimer = setTimeout(() => {
        el = findEl();
        if (!el) {
          setRect(null);
          setReady(true);
          return;
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const measureTimer = setTimeout(() => {
          const r = el!.getBoundingClientRect();
          setRect(r);
          setReady(true);
        }, 400);
        return () => clearTimeout(measureTimer);
      }, 150);
      return () => clearTimeout(retryTimer);
    }

    if (!el) {
      setRect(null);
      setReady(true);
      return;
    }

    // Find the scrollable parent (the main content area)
    const scrollParent = el.closest('main') || el.closest('[class*="overflow-y"]') || window;

    // Scroll element into center of viewport
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for scroll to settle, then measure
    const timer = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect(r);
      setReady(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [current, onTabChange]);

  useEffect(() => {
    if (!active) return;
    const cleanup = scrollAndMeasure();
    return cleanup;
  }, [active, step, scrollAndMeasure]);

  // Re-measure on resize
  useEffect(() => {
    if (!active || !ready) return;
    const handleResize = () => {
      const el = current ? document.getElementById(current.targetId) : null;
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [active, ready, current]);

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    localStorage.setItem(storageKey, 'done');
    setStep(0);
    onFinish();
  };

  if (!active || !current) return null;

  // Calculate tooltip position - prefer below, fallback above, then center
  let tooltipStyle: React.CSSProperties;
  const centered = !rect || !ready;

  if (centered) {
    tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: center on target, clamped to viewport
    let left = rect.left + rect.width / 2 - 180;
    left = Math.max(16, Math.min(left, vw - 376));

    // Vertical: prefer below target, fallback above
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;
    if (spaceBelow >= TOOLTIP_H + PAD) {
      top = rect.bottom + PAD;
    } else if (spaceAbove >= TOOLTIP_H + PAD) {
      top = rect.top - TOOLTIP_H - PAD;
    } else {
      // Not enough space either way — position at bottom of viewport
      top = Math.max(PAD, vh - TOOLTIP_H - PAD);
    }

    tooltipStyle = { top, left };
  }

  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100]"
          style={{ pointerEvents: 'none' }}
        >
          {/* Backdrop - click to dismiss */}
          <div
            className="absolute inset-0"
            style={{ pointerEvents: 'auto' }}
            onClick={handleFinish}
          >
            {/* Dark overlay with cutout using clip-path or SVG */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <mask id={`onboarding-mask-${step}`}>
                  <rect width="100%" height="100%" fill="white" />
                  {rect && (
                    <rect
                      x={rect.left - 6}
                      y={rect.top - 6}
                      width={rect.width + 12}
                      height={rect.height + 12}
                      rx={12}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.55)"
                mask={`url(#onboarding-mask-${step})`}
              />
            </svg>
          </div>

          {/* Highlight ring around target */}
          {rect && (
            <div
              className="absolute rounded-xl pointer-events-none"
              style={{
                left: rect.left - 6,
                top: rect.top - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                border: '2px solid rgba(59, 130, 246, 0.6)',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.15), 0 0 20px rgba(59, 130, 246, 0.2)',
              }}
            />
          )}

          {/* Tooltip card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="absolute z-[101] w-[360px] max-w-[calc(100vw-32px)]"
            style={{ ...tooltipStyle, pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card rounded-2xl shadow-2xl border border-blue-500/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-500">
                    {t('onboardingStep')} {step + 1} {t('onboardingOf')} {steps.length}
                  </span>
                </div>
                <button
                  onClick={handleFinish}
                  className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                <h3 className="text-sm font-bold text-foreground mb-1.5">
                  {t(current.titleKey as any)}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {t(current.descKey as any)}
                </p>
              </div>

              {/* Progress bar */}
              <div className="px-5">
                <div className="h-1 rounded-full bg-surface overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 flex items-center justify-between">
                <button
                  onClick={handleFinish}
                  className="text-xs text-dim hover:text-muted transition-colors"
                >
                  {t('onboardingSkip')}
                </button>
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-surface transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      {t('onboardingPrev')}
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 transition-opacity"
                  >
                    {isLastStep ? t('onboardingFinish') : t('onboardingNext')}
                    {!isLastStep && <ChevronRight className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
