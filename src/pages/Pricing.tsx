import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import PricingSection from '../components/landing/PricingSection';
import FaqAccordion from '../components/landing/FaqAccordion';
import CtaBanner from '../components/landing/CtaBanner';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <div className="pt-20" />
      <PricingSection />
      <FaqAccordion />
      <CtaBanner />
      <PublicFooter />
    </div>
  );
}
