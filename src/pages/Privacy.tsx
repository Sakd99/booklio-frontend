import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
        <p className="text-muted mb-10">Last updated: February 8, 2026</p>
        <div className="prose prose-invert max-w-none space-y-8 text-muted leading-relaxed">
          <p>This Privacy Policy describes how <strong className="text-foreground">Whatsapio, Inc.</strong> ("Company," "we," "our," or "us") collects, uses, and shares information about you when you use our platform, Convly. By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

          <section><h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2><p>We collect information you provide when creating an account, connecting social media channels, and using our services. This includes:</p><ul className="list-disc pl-6 space-y-2 mt-3"><li>Account information (name, email, business name, password hash)</li><li>Social media access tokens (encrypted with AES-256-GCM)</li><li>Customer conversation data between your business and your customers</li><li>Booking, appointment, and service information</li><li>Usage analytics and performance metrics</li><li>Billing information (processed securely by Stripe — we do not store card data)</li><li>AI training data you voluntarily provide (FAQs, instructions, knowledge documents)</li></ul></section>

          <section><h2 className="text-xl font-bold text-foreground">2. How We Use Your Data</h2><p>We use your data to:</p><ul className="list-disc pl-6 space-y-2 mt-3"><li>Provide, maintain, and improve the Convly service</li><li>Process and manage bookings and appointments</li><li>Power AI-driven conversation responses</li><li>Send transactional notifications and service updates</li><li>Monitor usage for plan compliance and fraud prevention</li><li>Process payments and manage subscriptions</li><li>Respond to support requests</li></ul></section>

          <section><h2 className="text-xl font-bold text-foreground">3. Data Security</h2><p>We implement enterprise-grade security measures including:</p><ul className="list-disc pl-6 space-y-2 mt-3"><li>AES-256-GCM encryption for all sensitive data (tokens, credentials)</li><li>JWT token rotation and short-lived access tokens</li><li>HMAC webhook signature verification</li><li>Per-tenant data isolation — your data is never mixed with other tenants</li><li>TLS/HTTPS for all data in transit</li><li>Regular security reviews and dependency updates</li></ul></section>

          <section><h2 className="text-xl font-bold text-foreground">4. Data Sharing</h2><p>We do not sell your data. We only share data with:</p><ul className="list-disc pl-6 space-y-2 mt-3"><li>Social media platform APIs (as required for message delivery and automation)</li><li>AI service providers (for processing conversation responses — data is not used for training)</li><li>Stripe (for payment processing — subject to Stripe's Privacy Policy)</li><li>Infrastructure providers (cloud hosting, databases) under strict data processing agreements</li></ul></section>

          <section><h2 className="text-xl font-bold text-foreground">5. Data Retention</h2><p>We retain your data as long as your account is active. Conversation data and messages are retained for up to 12 months. You may request deletion of your data at any time by contacting our support team. Upon account deletion, we will delete or anonymize your data within 30 days.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">6. Cookies</h2><p>We use essential cookies and local storage for authentication and session management. We do not use tracking cookies, third-party advertising cookies, or analytics cookies that identify you personally.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">7. Third-Party Integrations</h2><p>When you connect social media channels (WhatsApp, Instagram, Messenger, TikTok), those platforms have their own privacy policies that govern how your data is used by them. We encourage you to review those policies. Our access to your social media accounts is limited to what is necessary to provide the Service.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">8. Your Rights</h2><p>You have the right to:</p><ul className="list-disc pl-6 space-y-2 mt-3"><li>Access a copy of your personal data</li><li>Correct inaccurate or incomplete data</li><li>Request deletion of your personal data</li><li>Export your data in a portable format</li><li>Withdraw consent for non-essential data processing</li><li>Lodge a complaint with a data protection authority</li></ul></section>

          <section><h2 className="text-xl font-bold text-foreground">9. Children's Privacy</h2><p>The Service is not directed to children under the age of 16. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">10. International Transfers</h2><p>Your data may be processed in the United States and other countries where our infrastructure providers operate. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable privacy laws.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">11. Changes to This Policy</h2><p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service and update the "Last updated" date above. Your continued use of the Service after changes constitutes acceptance.</p></section>

          <section><h2 className="text-xl font-bold text-foreground">12. Contact Information</h2><p>For privacy-related inquiries or to exercise your rights:<br /><strong className="text-foreground">Whatsapio, Inc.</strong><br />Email: <a href="mailto:privacy@whatsapio.com" className="text-blue-400 hover:underline">privacy@whatsapio.com</a><br />Support: <a href="mailto:support@whatsapio.com" className="text-blue-400 hover:underline">support@whatsapio.com</a></p></section>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
