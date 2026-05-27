'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAppVersion } from '@/lib/version';

export default function Home() {
  const router = useRouter();
  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';

  useEffect(() => {
    // For v2.0, check if user is logged in and redirect to onboarding if needed
    if (isV2) {
      const checkAuth = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check if onboarding completed
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Sortify
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {isV2
            ? 'Hitro nastavite dostop do strank. Sledite. Opominjajte. Revidirajte.'
            : 'Get client access set up fast. Track it. Remind it. Audit it.'
          }
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="btn-primary text-lg"
          >
            {isV2 ? 'Prijava' : 'Sign In'}
          </Link>
          <Link
            href="/auth/login?mode=signup"
            className="btn-secondary text-lg"
          >
            {isV2 ? 'Začni' : 'Get Started'}
          </Link>
        </div>
      </div>
    </div>
  );
}
