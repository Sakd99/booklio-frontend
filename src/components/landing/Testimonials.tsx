import { Star } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

export default function Testimonials() {
  const { t } = useI18n();

  const testimonials = [
    {
      quote: t('testimonial1Quote'),
      name: t('testimonial1Name'),
      role: t('testimonial1Role'),
      stat: '+42%',
      statLabel: t('testimonial1Stat'),
      gradient: 'from-blue-500 to-violet-600',
    },
    {
      quote: t('testimonial2Quote'),
      name: t('testimonial2Name'),
      role: t('testimonial2Role'),
      stat: '3x',
      statLabel: t('testimonial2Stat'),
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      quote: t('testimonial3Quote'),
      name: t('testimonial3Name'),
      role: t('testimonial3Role'),
      stat: '85%',
      statLabel: t('testimonial3Stat'),
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <section className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-5">
            <Star className="w-3.5 h-3.5" /> {t('testimonialsTag')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('testimonialsTitle')}{' '}
            <span className="gradient-text">{t('testimonialsHighlight')}</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <div className="glass-card rounded-2xl p-6 border border-b-border h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-foreground leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
                {/* Stat */}
                <div className="pt-4 border-t border-b-border flex items-center gap-2">
                  <span className={`text-2xl font-black bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}>
                    {t.stat}
                  </span>
                  <span className="text-sm text-muted">{t.statLabel}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
