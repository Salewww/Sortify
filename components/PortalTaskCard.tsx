'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { renderMarkdown } from '@/lib/renderMarkdown';

export default function PortalTaskCard({
  taskInstance,
  checklistId,
  token,
  bookkeeperEmail,
}: {
  taskInstance: any;
  checklistId: string;
  token: string;
  bookkeeperEmail?: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState('');

  const task = taskInstance.task;

  const markAsDone = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/portal/${token}/tasks/${taskInstance.id}/done`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to mark task as done');

      router.refresh();
    } catch (error) {
      console.error('Error marking task as done:', error);
      alert('Failed to mark task as done');
    } finally {
      setLoading(false);
    }
  };

  const markAsNeedsHelp = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/portal/${token}/tasks/${taskInstance.id}/help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to mark task as needs help');

      alert('We\'ve been notified that you need help with this task. We\'ll reach out soon!');
      router.refresh();
    } catch (error) {
      console.error('Error marking task as needs help:', error);
      alert('Failed to request help');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!email) {
      alert('Please enter your email address first');
      e.target.value = '';
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, or PDF file');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);

      const response = await fetch(`/api/portal/${token}/tasks/${taskInstance.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      alert('File uploaded successfully!');
      router.refresh();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`card ${taskInstance.status === 'done' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1">
          {taskInstance.status === 'done' ? (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : taskInstance.status === 'needs_help' ? (
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {task.title}
                {task.is_blocking && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Required
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{task.why_text}</p>
            </div>
            {taskInstance.status !== 'done' && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {expanded ? 'Hide' : 'Show'} Steps
              </button>
            )}
          </div>

          {/* Status Messages */}
          {taskInstance.status === 'done' && (
            <div className="text-sm text-green-700 font-medium">
              ✓ Completed {taskInstance.completed_at && `on ${new Date(taskInstance.completed_at).toLocaleDateString()}`}
            </div>
          )}
          {taskInstance.status === 'needs_help' && (
            <div className="text-sm text-yellow-700 font-medium">
              We've been notified that you need help. We'll reach out soon!
            </div>
          )}

          {/* Expanded Instructions */}
          {expanded && taskInstance.status !== 'done' && (
            <div className="mt-4 space-y-4">
              {/* Instructions — SRT-003: render markdown, SRT-005: replace placeholder email */}
              <div className="prose prose-sm">
                <div
                  className="text-sm text-gray-700 space-y-1"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(
                      (task.instructions_md || '').replace(
                        /accounting@yourfirm\.com/g,
                        bookkeeperEmail || 'your bookkeeper'
                      )
                    ),
                  }}
                />
                {task.help_url && (
                  <a
                    href={task.help_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                  >
                    Need more help? View official guide →
                  </a>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor={`email-${taskInstance.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
                </label>
                <input
                  id={`email-${taskInstance.id}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input max-w-sm"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Proof (Optional)
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Screenshot or PDF showing you completed this step (PNG, JPG, PDF, max 10MB)
                </p>
                {uploading && <p className="text-sm text-primary-600 mt-2">Uploading...</p>}
                {taskInstance.proof_file_url && (
                  <a
                    href={taskInstance.proof_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                  >
                    View uploaded file →
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={markAsDone}
                  disabled={loading || !email}
                  className="btn-primary"
                >
                  {loading ? 'Saving...' : 'Mark as Done'}
                </button>
                <button
                  onClick={markAsNeedsHelp}
                  disabled={loading || !email}
                  className="btn-secondary"
                >
                  I Need Help
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
