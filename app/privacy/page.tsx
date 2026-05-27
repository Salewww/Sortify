import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Sortify',
  description: 'How Sortify collects, uses, and protects your data.',
};

const LAST_UPDATED = 'May 27, 2026';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-gray max-w-none text-[15px] leading-relaxed space-y-8">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p className="text-gray-600">
              Sortify (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is a client onboarding and document collection platform built for bookkeepers, accountants, and professional services firms. Our registered contact email is <a href="mailto:hello@sortify.app" className="text-indigo-600 hover:underline">hello@sortify.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What data we collect</h2>
            <p className="text-gray-600 mb-3">We collect only what is necessary to provide the service:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Account data:</strong> your name, email address, and password hash when you register.</li>
              <li><strong>Client data:</strong> names, email addresses, and task progress for clients you add to Sortify.</li>
              <li><strong>Uploaded documents:</strong> files your clients submit through portal links are stored in your account.</li>
              <li><strong>Usage data:</strong> pages visited, actions taken, and timestamps — used to improve the product.</li>
              <li><strong>Payment data:</strong> billing is handled entirely by Stripe. We never store your card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To provide, operate, and improve the Sortify platform.</li>
              <li>To send transactional emails (reminders, notifications) that you configure.</li>
              <li>To process payments via Stripe.</li>
              <li>To respond to support requests.</li>
              <li>We do <strong>not</strong> sell your data to third parties. We do not use your data for advertising.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. AI features</h2>
            <p className="text-gray-600">
              Sortify uses Google Gemini to generate task checklists, draft reminder messages, and triage help requests. When you use these features, relevant content (e.g. client descriptions, task context) is sent to Google&apos;s API. Google&apos;s use of this data is governed by their{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Privacy Policy</a>.
              We do not use AI outputs to train models on your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data storage and security</h2>
            <p className="text-gray-600">
              Your data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure in the EU region. Documents are stored in Supabase Storage. All data is encrypted in transit (TLS 1.2+) and at rest. We use row-level security policies to ensure users can only access their own data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data retention</h2>
            <p className="text-gray-600">
              We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law (e.g. billing records for tax purposes, retained for 7 years).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Your rights (GDPR)</h2>
            <p className="text-gray-600 mb-3">If you are in the EU or EEA, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Rectify</strong> inaccurate data.</li>
              <li><strong>Erase</strong> your data (&quot;right to be forgotten&quot;).</li>
              <li><strong>Restrict</strong> or <strong>object</strong> to processing.</li>
              <li><strong>Data portability</strong> — receive your data in a structured format.</li>
            </ul>
            <p className="text-gray-600 mt-3">
              To exercise any of these rights, email <a href="mailto:hello@sortify.app" className="text-indigo-600 hover:underline">hello@sortify.app</a>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-gray-600">
              We use only essential cookies necessary for authentication (session tokens via Supabase). We do not use tracking or advertising cookies. No cookie consent banner is required.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Third-party services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-semibold text-gray-700 py-2 pr-6">Service</th>
                    <th className="text-left font-semibold text-gray-700 py-2 pr-6">Purpose</th>
                    <th className="text-left font-semibold text-gray-700 py-2">Privacy policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Supabase', purpose: 'Database, auth, storage', url: 'https://supabase.com/privacy' },
                    { name: 'Stripe', purpose: 'Payment processing', url: 'https://stripe.com/privacy' },
                    { name: 'Google Gemini', purpose: 'AI features', url: 'https://policies.google.com/privacy' },
                    { name: 'Resend', purpose: 'Transactional email', url: 'https://resend.com/privacy' },
                    { name: 'Vercel', purpose: 'Hosting & CDN', url: 'https://vercel.com/legal/privacy-policy' },
                  ].map(s => (
                    <tr key={s.name}>
                      <td className="py-2.5 pr-6 font-medium text-gray-800">{s.name}</td>
                      <td className="py-2.5 pr-6">{s.purpose}</td>
                      <td className="py-2.5"><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View →</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to this policy</h2>
            <p className="text-gray-600">
              We may update this policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top. Continued use of Sortify after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p className="text-gray-600">
              Questions or concerns? Email us at <a href="mailto:hello@sortify.app" className="text-indigo-600 hover:underline">hello@sortify.app</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Sortify. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-700 transition-colors font-medium text-gray-600">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
