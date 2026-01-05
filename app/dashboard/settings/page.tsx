'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: ' + (error?.message || 'Failed to update profile'));
    }

    setSaving(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="input bg-gray-50 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email address cannot be changed
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.includes('Error')
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>

          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-700">User ID</div>
              <div className="text-sm text-gray-600 font-mono mt-1">{user?.id}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700">Account Created</div>
              <div className="text-sm text-gray-600 mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Settings</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Default Reminder Settings</h3>
              <p className="text-sm text-gray-600">
                New clients will automatically receive reminder emails on days 0, 2, 5, and 9
                after onboarding starts. You can customize this for each client individually.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Email Notifications</h3>
              <p className="text-sm text-gray-600">
                You'll receive email notifications when clients mark tasks as "Need Help"
                or when recurring checks are due.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>

          <div>
            <h3 className="text-sm font-medium text-red-900 mb-2">Delete Account</h3>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. All your data, including
              clients, tasks, and audit logs will be permanently deleted.
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              onClick={() => alert('Account deletion is not yet implemented. Please contact support.')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
