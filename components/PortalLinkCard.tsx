'use client';

import { useToast } from './Toast';

interface PortalLinkCardProps {
  portalUrl: string;
}

export default function PortalLinkCard({ portalUrl }: PortalLinkCardProps) {
  const { showToast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    showToast('Link copied to clipboard!', 'success');
  };

  return (
    <div className="card mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Client Portal Link</h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={portalUrl}
          readOnly
          className="input flex-1 font-mono text-sm"
        />
        <button
          onClick={handleCopyLink}
          className="btn-secondary"
        >
          Copy Link
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Share this link with your client contacts to give them access to the checklist.
      </p>
    </div>
  );
}
