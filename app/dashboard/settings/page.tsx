'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAppVersion } from '@/lib/version';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUser(user);
    setEmail(user.email || '');

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setProfile(profile);
      setName(profile.name || '');
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      const successMsg = isV2 ? 'Profil uspešno posodobljen!' : 'Profile updated successfully!';
      setMessage(successMsg);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      const errorMsg = isV2
        ? 'Napaka: ' + (error?.message || 'Posodobitev profila ni uspela')
        : 'Error: ' + (error?.message || 'Failed to update profile');
      setMessage(errorMsg);
    }

    setSaving(false);
  };

  if (loading) {
    const loadingText = isV2 ? 'Nalaganje...' : 'Loading...';
    return <div>{loadingText}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {isV2 ? 'Nastavitve' : 'Settings'}
      </h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isV2 ? 'Nastavitve profila' : 'Profile Settings'}
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {isV2 ? 'Polno ime' : 'Full Name'}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder={isV2 ? 'Vnesite svoje ime' : 'Enter your name'}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {isV2 ? 'E-poštni naslov' : 'Email Address'}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="input bg-gray-50 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                {isV2 ? 'E-poštnega naslova ni mogoče spremeniti' : 'Email address cannot be changed'}
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('Error') || message.includes('Napaka')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving
                ? (isV2 ? 'Shranjevanje...' : 'Saving...')
                : (isV2 ? 'Shrani spremembe' : 'Save Changes')
              }
            </button>
          </form>
        </div>

        {/* Account Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isV2 ? 'Informacije o računu' : 'Account Information'}
          </h2>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700">
                {isV2 ? 'ID uporabnika' : 'User ID'}
              </div>
              <div className="text-sm text-gray-600 font-mono mt-1">{user?.id}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700">
                {isV2 ? 'Račun ustvarjen' : 'Account Created'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(isV2 ? 'sl-SI' : 'en-US') : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isV2 ? 'Nastavitve aplikacije' : 'Application Settings'}
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {isV2 ? 'Privzete nastavitve opominov' : 'Default Reminder Settings'}
              </h3>
              <p className="text-sm text-gray-600">
                {isV2
                  ? 'Nove stranke bodo samodejno prejele opominjalna e-sporočila na dan 0, 2, 5 in 9 po začetku uvajanja. To lahko prilagodite za vsako stranko posebej.'
                  : 'New clients will automatically receive reminder emails on days 0, 2, 5, and 9 after onboarding starts. You can customize this for each client individually.'
                }
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {isV2 ? 'E-poštna obvestila' : 'Email Notifications'}
              </h3>
              <p className="text-sm text-gray-600">
                {isV2
                  ? 'Prejeli boste e-poštna obvestila, ko stranke označijo naloge kot "Potrebuje pomoč" ali ko so redni pregledi v pripravi.'
                  : 'You\'ll receive email notifications when clients mark tasks as "Need Help" or when recurring checks are due.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isV2 ? 'Naročnina' : 'Subscription'}
            </h2>
            {upgraded && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {isV2 ? 'Naročnina aktivirana!' : 'Subscription activated!'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4 bg-gray-50 mb-4">
            <div>
              <div className="text-sm font-medium text-gray-900 capitalize">
                {profile?.subscription_plan || 'free'} plan
              </div>
              <div className="text-xs text-gray-500 mt-0.5 capitalize">
                {profile?.subscription_status === 'active' ? (isV2 ? 'Aktivna' : 'Active')
                  : profile?.subscription_status === 'trialing' ? (isV2 ? '14-dnevni preizkus' : '14-day trial')
                  : profile?.subscription_status === 'past_due' ? (isV2 ? 'Zamuda pri plačilu' : 'Payment past due')
                  : (!profile?.subscription_plan || profile?.subscription_plan === 'free')
                    ? (isV2 ? 'Brezplačni načrt' : 'Free plan')
                    : (isV2 ? 'Neaktivna' : 'Inactive')}
              </div>
            </div>
            {(!profile?.subscription_plan || profile?.subscription_plan === 'free') && (
              <button
                onClick={async () => {
                  setCheckoutLoading('solo');
                  const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'solo', billing: 'monthly' }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else setCheckoutLoading(null);
                }}
                disabled={checkoutLoading === 'solo'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-70"
              >
                {checkoutLoading === 'solo' ? 'Redirecting…' : (isV2 ? 'Nadgradi' : 'Upgrade')}
              </button>
            )}
            {profile?.subscription_plan && profile.subscription_plan !== 'free' && (
              <button
                onClick={async () => {
                  setPortalLoading(true);
                  const res = await fetch('/api/stripe/portal', { method: 'POST' });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else {
                    setPortalLoading(false);
                    setMessage(isV2
                      ? 'Napaka: ' + (data.error || 'Portala ni mogoče odpreti')
                      : 'Error: ' + (data.error || 'Could not open billing portal'));
                  }
                }}
                disabled={portalLoading}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-70"
              >
                {portalLoading ? 'Redirecting…' : (isV2 ? 'Upravljaj plačila' : 'Manage billing')}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400">
            {isV2
              ? 'Upravljajte naročnino in plačila na Stripe portalu.'
              : 'Manage your subscription and billing via the Stripe portal.'}
          </p>
        </div>

        {/* Account Type Switcher (Testing Only) */}
        {isV2 && (
          <div className="card border-blue-200 bg-blue-50">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Preklapljanje tipa računa (samo za testiranje)
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-blue-700">
                To omogoča hitro preklapljanje med računi Firm in Solo za testiranje navigacije in funkcionalnosti.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.from('users').update({ account_type: 'firm' }).eq('id', user.id);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Preklopi na Firm
                </button>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.from('users').update({ account_type: 'solo' }).eq('id', user.id);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Preklopi na Solo
                </button>
              </div>

              <p className="text-xs text-blue-600">
                Trenutni tip: {profile?.account_type || 'ni nastavljen'}
              </p>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-900 mb-4">
            {isV2 ? 'Nevarna cona' : 'Danger Zone'}
          </h2>

          <div>
            <h3 className="text-sm font-medium text-red-900 mb-2">
              {isV2 ? 'Izbriši račun' : 'Delete Account'}
            </h3>
            <p className="text-sm text-red-700 mb-4">
              {isV2
                ? 'Ko izbrišete svoj račun, ni povratka. Vsi vaši podatki, vključno s strankami, nalogami in dnevniki revizij, bodo trajno izbrisani.'
                : 'Once you delete your account, there is no going back. All your data, including clients, tasks, and audit logs will be permanently deleted.'
              }
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              onClick={() => alert(isV2 ? 'Brisanje računa še ni implementirano. Kontaktirajte podporo.' : 'Account deletion is not yet implemented. Please contact support.')}
            >
              {isV2 ? 'Izbriši račun' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
