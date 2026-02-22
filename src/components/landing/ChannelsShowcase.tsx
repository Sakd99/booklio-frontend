import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

const CHANNEL_ICONS: Record<string, { svg: string; gradient: string; bg: string; border: string }> = {
  instagram: {
    svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    gradient: 'from-pink-500 to-purple-600',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
  },
  whatsapp: {
    svg: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
  telegram: {
    svg: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
  messenger: {
    svg: 'M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
};

type ChannelKey = 'instagram' | 'whatsapp' | 'telegram' | 'messenger';
const TABS: ChannelKey[] = ['instagram', 'whatsapp', 'telegram', 'messenger'];

export default function ChannelsShowcase() {
  const { t } = useI18n();

  const chatPreviews: Record<ChannelKey, { user: string; ai: string }[]> = {
    instagram: [
      { user: t('showcaseIgUser1'), ai: t('showcaseIgAi1') },
      { user: t('showcaseIgUser2'), ai: t('showcaseIgAi2') },
    ],
    whatsapp: [
      { user: t('showcaseWaUser1'), ai: t('showcaseWaAi1') },
      { user: t('showcaseWaUser2'), ai: t('showcaseWaAi2') },
    ],
    telegram: [
      { user: t('showcaseTgUser1'), ai: t('showcaseTgAi1') },
      { user: t('showcaseTgUser2'), ai: t('showcaseTgAi2') },
    ],
    messenger: [
      { user: t('showcaseMsUser1'), ai: t('showcaseMsAi1') },
      { user: t('showcaseMsUser2'), ai: t('showcaseMsAi2') },
    ],
  };
  const [active, setActive] = useState<ChannelKey>('instagram');
  const icon = CHANNEL_ICONS[active];

  const featureKeys: Record<ChannelKey, [string, string, string]> = {
    instagram: [t('channelIgFeature1'), t('channelIgFeature2'), t('channelIgFeature3')],
    whatsapp: [t('channelWaFeature1'), t('channelWaFeature2'), t('channelWaFeature3')],
    telegram: [t('channelTgFeature1'), t('channelTgFeature2'), t('channelTgFeature3')],
    messenger: [t('channelMsFeature1'), t('channelMsFeature2'), t('channelMsFeature3')],
  };

  const nameKeys: Record<ChannelKey, string> = {
    instagram: t('channelIgName'),
    whatsapp: t('channelWaName'),
    telegram: t('channelTgName'),
    messenger: t('channelMsName'),
  };

  const descKeys: Record<ChannelKey, string> = {
    instagram: t('channelIgDesc'),
    whatsapp: t('channelWaDesc'),
    telegram: t('channelTgDesc'),
    messenger: t('channelMsDesc'),
  };

  return (
    <section id="channels" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-5">
            <Sparkles className="w-3.5 h-3.5" /> {t('channelShowcaseTitle')}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t('channelShowcaseSubtitle')}
          </h2>
        </FadeIn>

        {/* Tabs */}
        <FadeIn className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-surface border border-b-border gap-1">
            {TABS.map((tab) => {
              const ch = CHANNEL_ICONS[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                    active === tab
                      ? 'bg-base text-foreground shadow-lg'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${ch.gradient} flex items-center justify-center`}>
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current">
                      <path d={ch.svg} />
                    </svg>
                  </div>
                  <span className="hidden sm:inline">{nameKeys[tab]}</span>
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center"
          >
            {/* Left — Features */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${icon.gradient} flex items-center justify-center`}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                    <path d={CHANNEL_ICONS[active].svg} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{nameKeys[active]}</h3>
              </div>
              <p className="text-muted mb-8 leading-relaxed">{descKeys[active]}</p>
              <ul className="space-y-4">
                {featureKeys[active].map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Right — Phone mockup */}
            <div className="flex justify-center">
              <div className={`w-[280px] rounded-[2rem] border-2 ${icon.border} bg-surface shadow-2xl overflow-hidden`}>
                <div className="h-6 bg-surface flex items-center justify-center">
                  <div className="w-16 h-3 bg-base rounded-full" />
                </div>
                <div className="px-3 py-2.5 border-b border-b-border flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${icon.gradient} flex items-center justify-center`}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
                      <path d={CHANNEL_ICONS[active].svg} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">{nameKeys[active]}</div>
                    <div className="text-[9px] text-emerald-500 flex items-center gap-0.5">
                      <Zap className="w-2 h-2" /> {t('chatConvlyAiActive')}
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2.5 min-h-[220px] bg-base">
                  {chatPreviews[active].map((msg, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="max-w-[78%] px-3 py-2 rounded-2xl rounded-br-md bg-gradient-to-r from-blue-500 to-violet-600 text-white text-[11px] leading-relaxed">
                          {msg.user}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className={`max-w-[78%] px-3 py-2 rounded-2xl rounded-bl-md ${icon.bg} border ${icon.border} text-foreground text-[11px] leading-relaxed`}>
                          {msg.ai}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-4 flex items-center justify-center">
                  <div className="w-20 h-1 bg-muted/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
