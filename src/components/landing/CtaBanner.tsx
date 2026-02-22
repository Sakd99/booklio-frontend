import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../store/i18n.store';
import FadeIn from './FadeIn';

export default function CtaBanner() {
  const { t } = useI18n();

  return (
    <section className="py-24 px-6">
      <FadeIn>
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full blur-[80px] opacity-10"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
              className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full blur-[80px] opacity-10"
            />

            <div className="relative z-10 text-center py-16 px-8">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                {t('ctaBannerTitle')}
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                {t('ctaBannerSubtitle')}
              </p>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-all shadow-lg text-base"
              >
                {t('ctaBannerBtn')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
