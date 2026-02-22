import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

export default function Terms() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted leading-relaxed">
          <p className="text-lg">Last updated: February 2026</p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using Booklio ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">2. Description of Service</h2>
          <p>Booklio provides AI-powered appointment booking automation through social media direct messages, including Instagram, WhatsApp, Telegram, and Facebook Messenger.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">3. User Accounts</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Send spam or unsolicited messages</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit malicious code or interfere with the Service</li>
            <li>Impersonate any person or entity</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">5. Subscription & Billing</h2>
          <p>Paid plans are billed monthly or annually. You may cancel your subscription at any time. Refunds are handled on a case-by-case basis. Usage limits are enforced per your selected plan.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">6. Data & Privacy</h2>
          <p>Your use of the Service is also governed by our Privacy Policy. We use industry-standard encryption (AES-256-GCM) and data isolation practices to protect your information.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">7. Limitation of Liability</h2>
          <p>Booklio is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">8. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">9. Contact</h2>
          <p>For questions about these Terms, please contact us at <a href="mailto:legal@booklio.dev" className="text-blue-400 hover:underline">legal@booklio.dev</a>.</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
