'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';
import { getAppVersion } from '@/lib/version';
import { sl } from '@/lib/i18n/sl';

export default function ClientActions({
  clientId,
  portalToken,
}: {
  clientId: string;
  portalToken: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);

  const appVersion = getAppVersion();
  const isV2 = appVersion === 'v2';
  const t = isV2 ? sl.clientDetail : null;

  const sendReminder = async () => {
    setShowReminderConfirm(false);
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/reminders/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send reminder');
      }

      const successMsg = isV2 ? t!.reminderSent : 'Reminder sent successfully!';
      showToast(successMsg, 'success');
      router.refresh();
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      const errorMsg = isV2 ? (error.message || t!.reminderFailed) : (error.message || 'Failed to send reminder');
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const rotatePortalLink = async () => {
    setShowRotateConfirm(false);
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/portal/rotate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to rotate portal link');

      const successMsg = isV2 ? t!.linkRotated : 'Portal link rotated successfully!';
      showToast(successMsg, 'success');
      router.refresh();
    } catch (error) {
      console.error('Error rotating portal link:', error);
      const errorMsg = isV2 ? t!.rotateFailed : 'Failed to rotate portal link';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowReminderConfirm(true)}
        disabled={loading}
        className="btn-primary"
      >
        {isV2 ? t!.sendReminder : 'Send Reminder'}
      </button>
      <button
        onClick={() => setShowRotateConfirm(true)}
        disabled={loading}
        className="btn-secondary"
      >
        {isV2 ? t!.rotateLink : 'Rotate Link'}
      </button>

      {/* Reminder Confirmation Modal */}
      {showReminderConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isV2 ? t!.sendReminderConfirm : 'Send Reminder?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isV2 ? t!.sendReminderQuestion : 'Send a manual reminder to all client contacts?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowReminderConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isV2 ? t!.cancel : 'Cancel'}
              </button>
              <button
                onClick={sendReminder}
                className="btn-primary"
              >
                {isV2 ? t!.sendReminder : 'Send Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate Link Confirmation Modal */}
      {showRotateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isV2 ? t!.rotateLinkConfirm : 'Rotate Portal Link?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isV2 ? t!.rotateLinkQuestion : 'Are you sure you want to rotate the portal link? The old link will stop working immediately.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRotateConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isV2 ? t!.cancel : 'Cancel'}
              </button>
              <button
                onClick={rotatePortalLink}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {isV2 ? t!.rotateLink : 'Rotate Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
