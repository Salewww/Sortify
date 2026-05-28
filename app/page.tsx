'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAppVersion } from '@/lib/version';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconLink() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13H7a4 4 0 010-8h3" /><path d="M10 7h3a4 4 0 010 8h-3" /><line x1="7" y1="10" x2="13" y2="10" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" /><path d="M6.5 10.5l2.5 2.5 4-4.5" />
    </svg>
  );
}
function IconBot() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="14" height="10" rx="2" /><path d="M10 7V4" /><circle cx="10" cy="3" r="1" /><circle cx="7" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" /><path d="M7 15.5h6" />
    </svg>
  );
}
function IconFolder() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 012-2h3.586a1 1 0 01.707.293L10.414 6.4A1 1 0 0011.121 6.7H15a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l7 3v5c0 4-3 6.5-7 8-4-1.5-7-4-7-8V5l7-3z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10a7 7 0 017-7 7 7 0 015.2 2.3" /><path d="M17 10a7 7 0 01-7 7 7 7 0 01-5.2-2.3" />
      <path d="M14.5 5.5V2.5h3" /><path d="M5.5 14.5v3h-3" />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-indigo-500/10 rounded-3xl blur-2xl pointer-events-none" />
      {/* Window frame */}
      <div className="relative bg-white/[0.06] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08] bg-white/[0.04]">
          <span className="w-3 h-3 rounded-full bg-red-400/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <span className="w-3 h-3 rounded-full bg-green-400/70" />
          <span className="ml-3 text-white/30 text-xs font-mono">sortify.app/dashboard</span>
        </div>
        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 w-28 bg-white/20 rounded mb-1.5" />
              <div className="h-3 w-16 bg-white/10 rounded" />
            </div>
            <div className="h-8 w-24 bg-indigo-500/60 rounded-lg flex items-center justify-center">
              <span className="text-white/90 text-xs font-medium">+ New client</span>
            </div>
          </div>
          {/* Client rows */}
          {[
            { name: 'Acme Corp', status: 'Complete', pct: 100, color: 'bg-emerald-400' },
            { name: 'Bright LLC', status: 'In progress', pct: 60, color: 'bg-indigo-400' },
            { name: 'Delta & Sons', status: 'Waiting', pct: 25, color: 'bg-amber-400' },
            { name: 'Euler Bookkeeping', status: 'Not started', pct: 0, color: 'bg-white/20' },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 bg-white/[0.05] rounded-xl px-4 py-3 border border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center shrink-0">
                <span className="text-indigo-300 text-xs font-bold">{c.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 text-sm font-medium truncate">{c.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full transition-all`} style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-white/30 text-xs shrink-0">{c.pct}%</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                c.status === 'Complete' ? 'bg-emerald-500/20 text-emerald-300' :
                c.status === 'In progress' ? 'bg-indigo-500/20 text-indigo-300' :
                c.status === 'Waiting' ? 'bg-amber-500/20 text-amber-300' :
                'bg-white/10 text-white/40'
              }`}>{c.status}</span>
            </div>
          ))}
          {/* AI reminder strip */}
          <div className="mt-2 flex items-center gap-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl px-4 py-3">
            <div className="w-7 h-7 rounded-md bg-indigo-500/40 flex items-center justify-center shrink-0">
              <span className="text-indigo-300 text-sm">✦</span>
            </div>
            <div>
              <div className="text-white/70 text-xs">AI wrote a reminder for <span className="text-indigo-300 font-medium">Delta & Sons</span></div>
              <div className="text-white/40 text-xs mt-0.5">"Hi Sarah, just checking in on the Q4 bank statements…"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pricing toggle ───────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Solo',
    planKey: 'solo',
    monthly: 19,
    annual: 14,       // $170/yr ÷ 12 ≈ $14.17
    annualTotal: 170,
    description: 'For independent bookkeepers',
    features: ['Unlimited clients', '1 user', 'AI reminder drafts', 'Audit log', 'Document collection', 'Email support'],
    cta: 'Get started',
    popular: false,
    ghost: false,
  },
  {
    name: 'Team',
    planKey: 'team',
    monthly: 49,
    annual: 39,       // $470/yr ÷ 12 ≈ $39.17
    annualTotal: 470,
    description: 'For small firms',
    features: ['Unlimited clients', 'Up to 5 users', 'All Solo features', 'Recurring health checks', 'Priority support', 'Team permissions'],
    cta: 'Get started',
    popular: true,
    ghost: false,
  },
  {
    name: 'Firm',
    planKey: 'firm',
    monthly: 99,
    annual: 81,       // $970/yr ÷ 12 ≈ $80.83
    annualTotal: 970,
    description: 'For growing practices',
    features: ['Unlimited clients', 'Unlimited users', 'White-label portal', 'API access', 'Dedicated onboarding', 'SLA support'],
    cta: 'Contact us',
    popular: false,
    ghost: false,
  },
];

// ─── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';
  const [annual, setAnnual] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    setCheckoutLoading(planKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, billing: annual ? 'annual' : 'monthly' }),
      });
      if (res.status === 401) {
        // Not logged in — send to signup first, then we'll redirect back
        router.push(`/auth/login?mode=signup&plan=${planKey}&billing=${annual ? 'annual' : 'monthly'}`);
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setCheckoutLoading(null);
    }
  };

  useEffect(() => {
    if (isV2) {
      const checkAuth = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('onboarding_completed, account_type')
            .eq('id', user.id)
            .single();
          if (!userData?.onboarding_completed || !userData?.account_type) {
            router.push('/onboarding/account-type');
          } else {
            router.push('/dashboard');
          }
        }
      };
      checkAuth();
    }
  }, [isV2, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)' }}>

      {/* ── NAV ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-gray-900">Sortify</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <Link href="/demo" className="hover:text-gray-900 transition-colors">Demo</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link
              href="/auth/login?mode=signup"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] transition-all px-4 py-2 rounded-lg shadow-sm"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative bg-gray-950 text-white overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              From $14/mo · 14-day free trial · Cancel anytime
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Client access<br />
              <span className="text-indigo-400">onboarding,</span><br />
              done right.
            </h1>

            {/* Sub */}
            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto mb-10">
              Stop chasing clients for QuickBooks access. Send one link, track everything, audit anything — all from one clean dashboard.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/login?mode=signup"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/40 text-[15px]"
              >
                Start 14-day free trial
                <IconArrowRight />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white active:scale-[0.97] transition-all font-medium px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-[15px]"
              >
                See live demo →
              </Link>
            </div>
          </div>

          {/* Dashboard mockup */}
          <DashboardMockup />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Built for how bookkeepers actually work
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No bloat. No learning curve. Six features that eliminate the most painful parts of client onboarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <IconLink />,
                title: 'Smart Portal Links',
                desc: 'One unique link per client. No logins, no passwords, no confusion. Share via email, WhatsApp, anywhere.',
                color: 'text-indigo-600 bg-indigo-50',
              },
              {
                icon: <IconCheck />,
                title: 'Progress Tracking',
                desc: "See at a glance exactly what's complete, what's pending, and what's blocking you — for every client.",
                color: 'text-emerald-600 bg-emerald-50',
              },
              {
                icon: <IconBot />,
                title: 'AI Reminders',
                desc: "Gemini AI writes personalised follow-up messages so you don't have to. Review, edit, and send in one click.",
                color: 'text-violet-600 bg-violet-50',
              },
              {
                icon: <IconFolder />,
                title: 'Document Collection',
                desc: 'Invoices, bank statements, tax forms — all collected in one place, automatically organised by client.',
                color: 'text-amber-600 bg-amber-50',
              },
              {
                icon: <IconShield />,
                title: 'Audit Trail',
                desc: 'An immutable, timestamped log of every client action. Invaluable for compliance and client disputes.',
                color: 'text-red-600 bg-red-50',
              },
              {
                icon: <IconRefresh />,
                title: 'Recurring Checks',
                desc: 'Set monthly or quarterly access health checks. Sortify automatically re-opens and tracks them for you.',
                color: 'text-sky-600 bg-sky-50',
              },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-md transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 md:py-32 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Up and running in minutes
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Most bookkeepers onboard their first client in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" />

            {[
              { step: '01', title: 'Create a workspace', desc: 'Add a client and configure what access you need from them. Takes about 2 minutes.' },
              { step: '02', title: 'Send the portal link', desc: 'Copy one link and send it however you like. Your client clicks — no account needed.' },
              { step: '03', title: 'Track from dashboard', desc: 'Watch progress update in real time. See exactly what\'s been granted or uploaded.' },
              { step: '04', title: 'AI handles follow-ups', desc: 'Sortify AI drafts reminders for stalled clients. You approve and move on.' },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-5 mx-auto">
                  <span className="text-indigo-300 font-bold text-sm font-mono">{s.step}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPETITOR COMPARISON ── */}
      <section className="py-24 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">Why Sortify</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Purpose-built. Not bolted on.
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Generic client portals cost 3–5× more and weren't designed for bookkeeping workflows.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">Tool</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-700">Starting price</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-700">Bookkeeping-specific</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-700">AI reminders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { name: 'Content Snare', price: '$35/mo', specific: false, ai: false },
                  { name: 'Client Hub', price: '$49/user/mo', specific: true, ai: false },
                  { name: 'Liscio', price: '$49/user/mo', specific: false, ai: false },
                  { name: 'Jetpack Workflow', price: '$40/user/mo', specific: false, ai: false },
                ].map((row) => (
                  <tr key={row.name} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600 font-medium">{row.name}</td>
                    <td className="px-5 py-3.5 text-center text-gray-500">{row.price}</td>
                    <td className="px-5 py-3.5 text-center">{row.specific ? '✓' : <span className="text-gray-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-center"><span className="text-gray-300">—</span></td>
                  </tr>
                ))}
                <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                  <td className="px-5 py-3.5 font-bold text-indigo-900 flex items-center gap-2">
                    Sortify <span className="text-[10px] bg-indigo-600 text-white rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide">You are here</span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-bold text-indigo-700">From $14/mo</td>
                  <td className="px-5 py-3.5 text-center text-indigo-600 font-bold">✓</td>
                  <td className="px-5 py-3.5 text-center text-indigo-600 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-16 md:py-20 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-indigo-200 text-4xl mb-6">"</div>
          <blockquote className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-8">
            I used to spend an hour a week chasing clients for QuickBooks access. With Sortify, that's down to five minutes — and I actually have an audit trail now.
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-400/40 flex items-center justify-center text-white font-bold">
              JM
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-sm">Jessica M.</div>
              <div className="text-indigo-200 text-xs">Solo bookkeeper, Austin TX</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 md:py-32 bg-gray-50/60">
        <div className="max-w-5xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Simple. No surprises.
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
              Every plan includes a <strong className="text-gray-800">14-day free trial</strong>.
              Cancel before day 15 — you won't be charged.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${!annual ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${annual ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Annual
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${annual ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600'}`}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Cards — 3 equal columns, popular card elevated */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? 'bg-indigo-600 p-8 shadow-2xl shadow-indigo-300/40 scale-[1.04] z-10'
                    : 'bg-white p-7 border border-gray-200 hover:border-indigo-200 hover:shadow-lg shadow-sm'
                }`}
              >
                {/* Most popular badge — inline, top of card */}
                {plan.popular && (
                  <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mb-4">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Most popular
                  </div>
                )}

                {/* Plan name + description */}
                <div className="mb-5">
                  <h3 className={`font-bold text-xl mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-7">
                  <div className="flex items-end gap-1">
                    <span className={`text-5xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      ${annual ? plan.annual : plan.monthly}
                    </span>
                    <span className={`text-sm font-normal mb-1.5 ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>
                      /mo
                    </span>
                  </div>
                  <div className={`text-xs mt-1.5 ${plan.popular ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {annual
                      ? `Billed $${(plan as any).annualTotal ?? plan.annual * 12}/year`
                      : 'Billed monthly'}
                  </div>
                </div>

                {/* Divider */}
                <div className={`h-px w-full mb-6 ${plan.popular ? 'bg-white/10' : 'bg-gray-100'}`} />

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.popular ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <svg className={`w-4 h-4 shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-indigo-500'}`} viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" opacity="0.3"/>
                        <path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.name === 'Firm' ? (
                  <a
                    href="mailto:hello@sortify.app"
                    className="w-full text-center py-3 rounded-xl text-sm font-semibold active:scale-[0.97] transition-all duration-150 bg-indigo-600 text-white hover:bg-indigo-700 block"
                    style={{ transition: 'background 150ms cubic-bezier(0.23,1,0.32,1), transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <>
                    <button
                      onClick={() => handleCheckout(plan.planKey!)}
                      disabled={checkoutLoading === plan.planKey}
                      className={`w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-wait ${
                        plan.popular
                          ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                      style={{ transition: 'background 150ms cubic-bezier(0.23,1,0.32,1), transform 150ms cubic-bezier(0.23,1,0.32,1)' }}
                    >
                      {checkoutLoading === plan.planKey ? 'Redirecting…' : plan.cta}
                    </button>
                    <p className={`text-center text-xs mt-2.5 ${plan.popular ? 'text-indigo-300' : 'text-gray-400'}`}>
                      14-day free trial · Cancel anytime
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-gray-400 mt-10">
            All plans include SSL encryption, GDPR-ready data handling, and 99.9% uptime SLA.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 md:py-32 bg-gray-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Ready to stop chasing clients?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join bookkeepers worldwide who've reclaimed their time. Start your 14-day free trial — from $14/mo after that.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/login?mode=signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-900/40 text-[15px]"
            >
              Start free trial
              <IconArrowRight />
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-white active:scale-[0.97] transition-all font-medium px-6 py-3.5 text-[15px]"
            >
              Already have an account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-[14px] font-semibold text-white">Sortify</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#pricing" className="hover:text-gray-300 transition-colors">Pricing</a>
            <Link href="/auth/login" className="hover:text-gray-300 transition-colors">Login</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Sortify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
