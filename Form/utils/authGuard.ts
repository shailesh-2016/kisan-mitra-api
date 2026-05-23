/**
 * authGuard.ts — Lightweight navigation protection helper.
 *
 * Usage:
 *   const ok = requireAuth(isLoggedIn);
 *   if (!ok) return;          // blocked — toast already shown
 *   router.push('/some-screen');
 *
 * OR one-liner:
 *   if (!requireAuth(isLoggedIn)) return;
 */
import { Toast } from '../components/Toast';

// Optional feature name for a more specific message in the future
export function requireAuth(isLoggedIn: boolean, featureName?: string): boolean {
  if (isLoggedIn) return true;

  Toast.show({
    type: 'warning',
    text1: 'Login Required',
    text2: featureName
      ? `Please login first to access ${featureName}`
      : 'Please login first to access this feature',
    visibilityTime: 3500,
  });

  return false;
}
