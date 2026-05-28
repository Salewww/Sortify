import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Sortify',
  description: 'Terms and conditions for using the Sortify platform.',
};

const LAST_UPDATED = 'May 27, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-75 transition-opacity">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Sortify</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to home</Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none text-[15px] leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of terms</h2>
            <p className="text-gray-600">
              By accessing or using Sortify (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are using Sortify on behalf of an organization, you represent that you have authority to bind that organization to these Terms. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. The service</h2>
            <p className="text-gray-600">
              Sortify is a SaaS platform that helps bookkeepers, accountants, and professional service firms collect client information, manage onboarding checklists, and track document submissions. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>You must be at least 18 years old and legally capable of entering contracts.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must notify us immediately at <a href="mailto:hello@sortify.app" className="text-indigo-600 hover:underline">hello@sortify.app</a> if you suspect unauthorized access.</li>
              <li>One person or entity may not maintain more than one free account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Subscriptions and billing</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Free trial:</strong> Paid plans include a 14-day free trial. No charge is made until the trial ends.</li>
              <li><strong>Billing cycle:</strong> Subscriptions are billed monthly or annually in advance, depending on the plan selected.</li>
              <li><strong>Cancellation:</strong> You may cancel at any time. Your access continues until the end of the current billing period. No partial refunds are issued for unused time.</li>
              <li><strong>Price changes:</strong> We will provide at least 30 days&apos; notice before changing subscription prices. Continued use after the notice period constitutes acceptance.</li>
              <li><strong>Payment processing:</strong> Payments are handled by Stripe. By subscribing, you also agree to <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Stripe&apos;s Terms of Service</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Acceptable use</h2>
            <p className="text-gray-600 mb-3">You agree not to use Sortify to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Upload, transmit, or store illegal, harmful, or fraudulent content.</li>
              <li>Violate any applicable laws or regulations, including data protection laws.</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or data.</li>
              <li>Reverse engineer, decompile, or attempt to extract the source code.</li>
              <li>Use automated means to scrape or extract data from the platform.</li>
              <li>Resell or sublicense access to the Service without written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your data</h2>
            <p className="text-gray-600">
              You retain ownership of all data you upload to Sortify. By using the Service, you grant us a limited, non-exclusive license to store and process your data solely for the purpose of providing the Service. We will never sell your data or use it for purposes unrelated to operating Sortify. See our{' '}
              <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link> for full details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. AI-generated content</h2>
            <p className="text-gray-600">
              Sortify uses AI to generate task lists, reminder drafts, and triage responses. AI-generated content is provided as-is and may not always be accurate. You are solely responsible for reviewing, editing, and approving any AI-generated content before using it with your clients. Sortify makes no warranties regarding the accuracy or appropriateness of AI outputs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Intellectual property</h2>
            <p className="text-gray-600">
              All software, design, trademarks, and content provided by Sortify (excluding your data) are our intellectual property or that of our licensors. You may not copy, reproduce, or create derivative works without our written permission. These Terms do not grant you any rights to our intellectual property beyond what is needed to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Availability and uptime</h2>
            <p className="text-gray-600">
              We aim for 99.9% uptime but do not guarantee uninterrupted availability. Scheduled maintenance will be communicated in advance where possible. We are not liable for any loss or damages resulting from downtime, data loss, or service interruption.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Disclaimer of warranties</h2>
            <p className="text-gray-600">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be error-free or that defects will be corrected.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Limitation of liability</h2>
            <p className="text-gray-600">
              To the maximum extent permitted by law, Sortify&apos;s total liability to you for any claims arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim. We are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Termination</h2>
            <p className="text-gray-600">
              Either party may terminate the agreement at any time. We may suspend or terminate your access immediately if you breach these Terms or engage in conduct that is harmful to us, other users, or third parties. Upon termination, your right to access the Service ceases. We will retain your data for 30 days after termination before deletion, during which you may request an export.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Governing law</h2>
            <p className="text-gray-600">
              These Terms are governed by and construed in accordance with the laws of the European Union and the Republic of Slovenia, without regard to conflict of law principles. Any disputes shall be resolved in the competent courts of Ljubljana, Slovenia, unless otherwise required by applicable consumer protection law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Changes to terms</h2>
            <p className="text-gray-600">
              We may update these Terms from time to time. We will notify you of material changes via email or an in-app notice at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Contact</h2>
            <p className="text-gray-600">
              Questions about these Terms? Email <a href="mailto:hello@sortify.app" className="text-indigo-600 hover:underline">hello@sortify.app</a>.
            </p>
          </section>

          {/* Back to home — bottom (SRT-008) */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to home</Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Sortify. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors font-medium text-gray-600">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
