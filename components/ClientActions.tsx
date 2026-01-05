'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientActions({
  clientId,
  portalToken,
}: {
  clientId: string;
  portalToken: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sendReminder = async () => {
    if (!confirm('Send a manual reminder to all client contacts?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/reminders/send`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send reminder');

      alert('Reminder sent successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  const rotatePortalLink = async () => {
    if (!confirm('Are you sure you want to rotate the portal link? The old link will stop working.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/portal/rotate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to rotate portal link');

      alert('Portal link rotated successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error rotating portal link:', error);
      alert('Failed to rotate portal link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={sendReminder}
        disabled={loading}
        className="btn-primary"
      >
        Send Reminder
      </button>
      <button
        onClick={rotatePortalLink}
        disabled={loading}
        className="btn-secondary"
      >
        Rotate Link
      </button>
    </>
  );
}
