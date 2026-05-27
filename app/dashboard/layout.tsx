import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // v2.0: Check if user needs to complete onboarding
  const appVersion = getAppVersion();
  if (appVersion === 'v2' && profile && !profile.onboarding_completed) {
    redirect('/onboarding/account-type');
  }

  const isV2 = appVersion === 'v2';
  const isFirm = profile?.account_type === 'firm';
  const isSolo = profile?.account_type === 'solo';

  const nav = isV2 ? sl.nav : {
    dashboard: 'Clients',
    templates: 'Templates',
    settings: 'Settings',
    logout: 'Sign Out',
    clients: 'Clients',
    documents: 'Documents',
    help: 'Help',
  };

  const handleSignOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                Sortify
              </Link>
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Firm navigation */}
                {isV2 && isFirm && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.clients}
                    </Link>
                    <Link
                      href="/dashboard/documents"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.documents}
                    </Link>
                    <Link
                      href="/dashboard/packs"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.templates}
                    </Link>
                    <Link
                      href="/dashboard/help"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.help}
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.settings}
                    </Link>
                  </>
                )}

                {/* Solo navigation */}
                {isV2 && isSolo && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.dashboard}
                    </Link>
                    <Link
                      href="/dashboard/documents"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.documents}
                    </Link>
                    <Link
                      href="/dashboard/tasks"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.tasks}
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.settings}
                    </Link>
                  </>
                )}

                {/* v1.0 navigation */}
                {!isV2 && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.dashboard}
                    </Link>
                    <Link
                      href="/dashboard/packs"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.templates}
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {nav.settings}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{profile?.name || user.email}</span>
              <form action={handleSignOut}>
                <button type="submit" className="btn-secondary text-sm">
                  {nav.logout}
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
