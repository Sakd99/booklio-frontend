import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

const WA_SVG = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
const IG_SVG = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z';
const MS_SVG = 'M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z';
const TT_SVG = 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46v-7.15a8.16 8.16 0 005.58 2.19V11.2a4.85 4.85 0 01-2.41-.65v4.12A6.34 6.34 0 0019.59 6.69z';

const CHANNELS = [
  { name: 'WhatsApp', href: '/whatsapp', svg: WA_SVG, gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', border: 'border-green-500/20', hover: 'hover:border-green-500/40' },
  { name: 'Instagram', href: '/instagram', svg: IG_SVG, gradient: 'from-pink-500 to-purple-600', bg: 'bg-pink-500/10', border: 'border-pink-500/20', hover: 'hover:border-pink-500/40' },
  { name: 'Messenger', href: '/messenger', svg: MS_SVG, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'hover:border-blue-500/40' },
  { name: 'TikTok', href: '/tiktok', svg: TT_SVG, gradient: 'from-[#fe2c55] to-[#25f4ee]', bg: 'bg-[#fe2c55]/10', border: 'border-[#fe2c55]/20', hover: 'hover:border-[#fe2c55]/40' },
];

export default function ChannelPagesSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-5">
            <Sparkles className="w-3.5 h-3.5" /> {t('channelPagesSectionTag')}
          </div>
          <h2 className="text-3xl md:text-4xl font-black">
            {t('channelPagesSectionTitle')}
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CHANNELS.map((ch, i) => (
            <FadeIn key={ch.name} delay={i * 0.08}>
              <Link
                to={ch.href}
                className={`group glass-card rounded-2xl p-6 border ${ch.border} ${ch.hover} transition-all duration-300 flex flex-col items-center text-center gap-4 hover:shadow-lg`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ch.gradient} flex items-center justify-center shadow-lg`}>
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
                    <path d={ch.svg} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground">{ch.name}</h3>
                <span className="inline-flex items-center gap-1 text-sm text-blue-400 group-hover:gap-2 transition-all">
                  {t('channelPagesLearnMore')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
