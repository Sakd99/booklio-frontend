import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-base text-foreground overflow-x-hidden transition-colors duration-200">
      <PublicNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-muted leading-relaxed">
          <p className="text-lg">Last updated: February 2026</p>

          <h2 className="text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, connecting social media channels, and using our services. This includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (name, email, password)</li>
            <li>Social media account tokens (encrypted with AES-256-GCM)</li>
            <li>Conversation data between your business and customers</li>
            <li>Booking and service information</li>
            <li>Usage analytics and metrics</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve the Booklio service</li>
            <li>Process and manage bookings</li>
            <li>Power AI-driven conversation responses</li>
            <li>Send transactional notifications</li>
            <li>Monitor usage for plan compliance</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">3. Data Security</h2>
          <p>We implement enterprise-grade security measures including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AES-256-GCM encryption for all sensitive data</li>
            <li>JWT token rotation for session management</li>
            <li>HMAC webhook signature verification</li>
            <li>Per-tenant data isolation</li>
            <li>Regular security audits</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">4. Data Sharing</h2>
          <p>We do not sell your data. We only share data with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Social media platform APIs (as required for message delivery)</li>
            <li>AI service providers (for conversation processing)</li>
            <li>Payment processors (for billing)</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">5. Data Retention</h2>
          <p>We retain your data as long as your account is active. You may request deletion of your data at any time by contacting our support team.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of non-essential communications</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the Service.</p>

          <h2 className="text-xl font-bold text-foreground mt-8">9. Contact</h2>
          <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@booklio.dev" className="text-blue-400 hover:underline">privacy@booklio.dev</a>.</p>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
