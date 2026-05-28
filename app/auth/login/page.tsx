'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { getAppVersion } from '@/lib/version';

const PLAN_LABELS: Record<string, string> = {
  solo: 'Solo — $14/mo billed annually',
  team: 'Team — $39/mo billed annually',
  firm: 'Firm — $81/mo billed annually',
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false);
  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';

  // Checkout params passed from pricing buttons
  const planParam = searchParams.get('plan');
  const billingParam = searchParams.get('billing') || 'annual';
  const hasPlan = Boolean(planParam && PLAN_LABELS[planParam]);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') setMode('signup');
  }, [searchParams]);

  // After auth, trigger Stripe checkout if a plan was selected
  const redirectAfterAuth = async () => {
    if (hasPlan) {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planParam, billing: billingParam }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } catch {
        // fall through to dashboard
      }
    }
    router.push('/dashboard');
    router.refresh();
  };

  const handleAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: email.split('@')[0] } } });
        if (error) throw error;

        if (data.user) {
          // Insert user row (ignore conflict — may already exist)
          await supabase.from('users').upsert({ id: data.user.id, email: data.user.email!, name: email.split('@')[0] }, { onConflict: 'id' });

          // Fire welcome email (non-blocking)
          fetch('/api/emails/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.user.email, name: email.split('@')[0] }),
          }).catch(() => {});

          if (data.session) {
            // Email confirmation disabled — user is immediately logged in
            await redirectAfterAuth();
          } else {
            showToast(
              isV2 ? 'Preverite e-pošto za potrditev računa.' : 'Check your email to confirm your account, then sign in.',
              'success'
            );
            setMode('login');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await redirectAfterAuth();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="font-semibold text-gray-900 text-[15px]">Sortify</span>
        </Link>
        <span className="text-sm text-gray-500">
          {mode === 'login'
            ? (isV2 ? 'Nimate računa?' : "Don't have an account?")
            : (isV2 ? 'Že imate račun?' : 'Already have an account?')}
          {' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            {mode === 'login' ? (isV2 ? 'Registracija' : 'Sign up') : (isV2 ? 'Prijava' : 'Sign in')}
          </button>
        </span>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">

          {/* Trial badge — shown when coming from pricing with a plan */}
          {hasPlan && mode === 'signup' && (
            <div className="mb-6 flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-indigo-900">14-day free trial included</div>
                <div className="text-xs text-indigo-600 mt-0.5">{PLAN_LABELS[planParam!]} · No charge today</div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              {mode === 'signup'
                ? (hasPlan
                    ? (isV2 ? 'Ustvarite brezplačen račun' : 'Create your free account')
                    : (isV2 ? 'Začnite z Sortify' : 'Get started with Sortify'))
                : (isV2 ? 'Dobrodošli nazaj' : 'Welcome back')}
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'signup'
                ? (isV2 ? 'Vnesite podatke za ustvaritev računa.' : 'Enter your details to create your account.')
                : (isV2 ? 'Prijavite se v svoj Sortify račun.' : 'Sign in to your Sortify account.')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                {isV2 ? 'E-poštni naslov' : 'Email address'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                placeholder={isV2 ? 'vas@primer.si' : 'you@company.com'}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {isV2 ? 'Geslo' : 'Password'}
                </label>
                {mode === 'login' && (
                  <a href="/auth/reset-password" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
                    {isV2 ? 'Pozabljeno geslo?' : 'Forgot password?'}
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-wait shadow-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {isV2 ? 'Nalaganje...' : 'Loading…'}
                </span>
              ) : mode === 'signup'
                  ? (hasPlan
                      ? (isV2 ? 'Ustvari račun in začni preizkus' : 'Create account & start trial')
                      : (isV2 ? 'Ustvari račun' : 'Create account'))
                  : (isV2 ? 'Prijava' : 'Sign in')}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              {isV2
                ? 'Z ustvarjanjem računa se strinjate z našimi '
                : 'By creating an account you agree to our '}
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors">
                {isV2 ? 'Pogoji uporabe' : 'Terms of Service'}
              </Link>
              {' & '}
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors">
                {isV2 ? 'Politiko zasebnosti' : 'Privacy Policy'}
              </Link>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
