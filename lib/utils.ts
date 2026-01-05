import { customAlphabet } from 'nanoid';

// Generate secure portal tokens
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32);

export function generatePortalToken(): string {
  return nanoid();
}

// Calculate progress metrics
export function calculateProgress(tasks: Array<{ status: string; is_blocking?: boolean }>) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const blocked = tasks.filter(t => t.is_blocking && t.status !== 'done').length;
  const needsHelp = tasks.filter(t => t.status === 'needs_help').length;

  return {
    total,
    completed,
    blocked,
    needsHelp,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

// Format date helpers
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Classname utility
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
