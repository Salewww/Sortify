/**
 * Version detection for Sortify
 * v1.0 runs on port 3000
 * v2.0 runs on port 3007
 */

export function getAppVersion(): 'v1' | 'v2' {
  // Check multiple sources for version detection
  if (typeof window !== 'undefined') {
    // Client-side: check port from window.location
    const port = window.location.port
    return port === '3007' ? 'v2' : 'v1'
  }

  // Server-side: check env variables
  const appVersion = process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION
  if (appVersion === 'v2') return 'v2'

  const port = process.env.PORT
  return port === '3007' ? 'v2' : 'v1'
}

export function isV2() {
  return getAppVersion() === 'v2'
}

export function isV1() {
  return getAppVersion() === 'v1'
}
