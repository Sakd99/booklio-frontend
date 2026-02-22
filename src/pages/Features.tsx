import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import ChannelsShowcase from '../components/landing/ChannelsShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import CtaBanner from '../components/landing/CtaBanner';

export default function Features() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <div className="pt-20" />
      <FeaturesGrid />
      <ChannelsShowcase />
      <HowItWorks />
      <CtaBanner />
      <PublicFooter />
    </div>
  );
}
