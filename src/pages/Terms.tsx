import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

export default function Terms() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black mb-3">Terms of Service</h1>
        <p className="text-muted mb-10">Last updated: February 8, 2026</p>
        <div className="prose prose-invert max-w-none space-y-8 text-muted leading-relaxed">
          <p>These Terms of Service ("Terms") govern your access to and use of the services provided by <strong className="text-foreground">Whatsapio, Inc.</strong>, a company incorporated in Delaware, United States. By creating an account or using our platform, Convly, you agree to be bound by these Terms.</p>

          <section><h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2><p>By accessing or using Convly ("Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are using the Service on behalf of a business, you represent that you have authority to bind that entity.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">2. Description of Services</h2><p>Whatsapio, Inc. provides software tools for messaging automation and customer communication management. <strong className="text-foreground">We provide software tools only, not messaging services directly.</strong> Our capabilities include automating customer workflows, managing multi-channel communications (WhatsApp, Instagram, Messenger, TikTok), AI-powered booking and support, and performance analytics.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">3. User Responsibilities</h2><ul className="list-disc pl-6 space-y-2 mt-3"><li>Provide accurate and complete registration information</li><li>Maintain the security of your account credentials</li><li>Comply with all applicable laws and regulations</li><li>Obtain proper consent before messaging your customers</li><li>Follow all policies of third-party messaging platforms</li></ul></section>

          <section><h2 className="text-xl font-bold text-foreground">4. Prohibited Activities</h2><p>You agree not to use the Service to send spam, scrape data, violate applicable laws, impersonate any person, distribute malicious code, attempt unauthorized access, or engage in any fraudulent or deceptive purpose.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">5. Compliance with Messaging Platform Policies</h2><p>Users must comply with all applicable messaging platform policies including Meta's Messaging Policies and TikTok's Platform Guidelines. Users bear sole responsibility for ensuring compliance. Whatsapio, Inc. maintains no official affiliation with any third-party messaging platform.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">6. Account Termination</h2><p>We reserve the right to suspend or terminate your account immediately for violation of these Terms, prohibited activities, illegal use, third-party platform policy breaches, or non-payment of subscription fees.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">7. Intellectual Property</h2><p>All content, features, and functionality of our services are owned by <strong className="text-foreground">Whatsapio, Inc.</strong> and are protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written consent.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">8. Disclaimer of Warranties</h2><p>The Service is provided "as is" and "as available" without warranties of any kind. We do not warrant that the Service will be uninterrupted, error-free, completely secure, or meet your specific requirements.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">9. Limitation of Liability</h2><p>Whatsapio, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising from your use of or inability to use the Service.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">10. Indemnification</h2><p>You agree to indemnify and hold harmless Whatsapio, Inc. and its officers, directors, employees, and agents from any claims, liabilities, damages, and expenses arising out of your use of the Service or violation of these Terms.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">11. Payment Terms</h2><p>Paid subscriptions are billed monthly or annually in advance. Pricing changes will be communicated with at least 30 days' notice. By subscribing, you authorize us to charge your payment method on a recurring basis until you cancel.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">12. Refund Policy</h2><p>Customers are eligible for a full refund within <strong className="text-foreground">14 days</strong> of the initial purchase if the services have not been substantially used. After 14 days, all payments are non-refundable.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">13. Data Processing</h2><p>Your personal data is handled in accordance with our Privacy Policy. We implement industry-standard security measures including AES-256-GCM encryption and per-tenant data isolation.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">14. Modifications to Terms</h2><p>We may modify these Terms at any time. We will notify you of significant changes by updating the "Last updated" date above and, where appropriate, via email. Continued use of the Service constitutes acceptance.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">15. Governing Law</h2><p>These Terms shall be governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">16. Dispute Resolution</h2><p>Disputes shall first be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">17. Severability</h2><p>If any provision of these Terms is found to be unenforceable, it shall be modified to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">18. Contact Information</h2><p><strong className="text-foreground">Whatsapio, Inc.</strong><br />Email: <a href="mailto:legal@whatsapio.com" className="text-blue-400 hover:underline">legal@whatsapio.com</a><br />Support: <a href="mailto:support@whatsapio.com" className="text-blue-400 hover:underline">support@whatsapio.com</a></p></section>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
