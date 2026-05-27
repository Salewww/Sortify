/**
 * Version detection for Sortify
 * v1.0 runs on port 3000
 * v2.0 runs on port 3007
 */

export function getAppVersion(): 'v1' | 'v2' {
  // Server-side: env var is baked in at build time by next.config.js
  const appVersion = process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION
  if (appVersion === 'v2') return 'v2'

  // Client-side fallback: check port (covers legacy :3007 and new :8005)
  if (typeof window !== 'undefined') {
    const port = window.location.port
    if (port === '3007' || port === '8005') return 'v2'
  }

  // Server-side port fallback
  const port = process.env.PORT
  if (port === '3007' || port === '8005') return 'v2'

  return 'v1'
}

export function isV2() {
  return getAppVersion() === 'v2'
}

export function isV1() {
  return getAppVersion() === 'v1'
}
