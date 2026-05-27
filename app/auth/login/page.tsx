'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { getAppVersion } from '@/lib/version';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  const handleAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            email: data.user.email!,
            name: email.split('@')[0],
          });

          showToast(
            isV2 ? 'Račun ustvarjen! Preverite e-pošto za potrditev.' : 'Account created! Please check your email to verify.',
            'success'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sortify</h1>
            <p className="text-gray-600">
              {mode === 'login'
                ? (isV2 ? 'Prijavite se v svoj račun' : 'Sign in to your account')
                : (isV2 ? 'Ustvarite svoj račun' : 'Create your account')
              }
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {isV2 ? 'E-pošta' : 'Email'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleAuth();
                  }
                }}
                required
                className="input"
                placeholder={isV2 ? 'vas@primer.si' : 'you@example.com'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {isV2 ? 'Geslo' : 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleAuth();
                  }
                }}
                required
                minLength={6}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading
                ? (isV2 ? 'Nalaganje...' : 'Loading...')
                : mode === 'login'
                  ? (isV2 ? 'Prijava' : 'Sign In')
                  : (isV2 ? 'Registracija' : 'Sign Up')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {mode === 'login'
                ? (isV2 ? 'Nimate računa? Registrirajte se' : "Don't have an account? Sign up")
                : (isV2 ? 'Že imate račun? Prijavite se' : 'Already have an account? Sign in')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
