import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import HeroSection from '../components/landing/HeroSection';
import SocialProofBar from '../components/landing/SocialProofBar';
import ChannelsShowcase from '../components/landing/ChannelsShowcase';
import StatsSection from '../components/landing/StatsSection';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import HowItWorks from '../components/landing/HowItWorks';
import UseCases from '../components/landing/UseCases';
import UseCasesShowcase from '../components/landing/UseCasesShowcase';
import Testimonials from '../components/landing/Testimonials';
import PricingSection from '../components/landing/PricingSection';
import FaqAccordion from '../components/landing/FaqAccordion';
import CtaBanner from '../components/landing/CtaBanner';
import ChannelPagesSection from '../components/landing/ChannelPagesSection';

export default function Landing() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <HeroSection />
      <UseCasesShowcase />
      <SocialProofBar />
      <ChannelsShowcase />
      <StatsSection />
      <FeaturesGrid />
      <HowItWorks />
      <UseCases />
      <Testimonials />
      <PricingSection />
      <FaqAccordion />
      <CtaBanner />
      <ChannelPagesSection />
      <PublicFooter />
    </div>
  );
}
