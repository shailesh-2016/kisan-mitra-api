/**
 * toastService.ts — Pre-defined premium toast messages for the app.
 * Import and call from any screen or handler.
 *
 * Examples:
 *   toastService.loginSuccess();
 *   toastService.loginRequired();
 *   toastService.profileUpdated();
 *   toastService.error('Something went wrong');
 */
import { Toast } from '../components/Toast';

export const toastService = {
  // ── AUTH ────────────────────────────────────────────────────────────────────
  loginSuccess: () =>
    Toast.show({ type: 'success', text1: 'Login Successful', text2: 'Welcome back to Kisan Plus!' }),

  loginRequired: (feature?: string) =>
    Toast.show({
      type: 'warning',
      text1: 'Login Required',
      text2: feature
        ? `Please login first to access ${feature}`
        : 'Please login first to access this feature',
      visibilityTime: 3500,
    }),

  sessionExpired: () =>
    Toast.show({
      type: 'warning',
      text1: 'Session Expired',
      text2: 'Please login again to continue',
      visibilityTime: 4000,
    }),

  logoutSuccess: () =>
    Toast.show({ type: 'info', text1: 'Logged Out', text2: 'You have been signed out successfully' }),

  // ── PROFILE ─────────────────────────────────────────────────────────────────
  profileUpdated: () =>
    Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your profile has been saved successfully' }),

  // ── REMINDERS ────────────────────────────────────────────────────────────────
  reminderAdded: (name?: string) =>
    Toast.show({
      type: 'success',
      text1: 'Reminder Added',
      text2: name ? `"${name}" has been scheduled` : 'Reminder scheduled successfully',
    }),

  reminderDeleted: () =>
    Toast.show({ type: 'info', text1: 'Reminder Deleted' }),

  // ── SOCIAL / POSTS ──────────────────────────────────────────────────────────
  postUploaded: () =>
    Toast.show({ type: 'success', text1: 'Post Uploaded', text2: 'Your post is live for the community' }),

  followed: (name?: string) =>
    Toast.show({
      type: 'success',
      text1: name ? `Following ${name}` : 'Following',
      text2: 'You are now connected!',
    }),

  unfollowed: (name?: string) =>
    Toast.show({
      type: 'info',
      text1: name ? `Unfollowed ${name}` : 'Unfollowed',
    }),

  // ── MACHINES ────────────────────────────────────────────────────────────────
  machineAdded: (name?: string) =>
    Toast.show({
      type: 'success',
      text1: 'Machine Added',
      text2: name ? `${name} has been registered` : 'Machine registered successfully',
    }),

  machineDeleted: (name?: string) =>
    Toast.show({
      type: 'success',
      text1: 'Machine Deleted',
      text2: name ? `${name} has been removed` : undefined,
    }),

  entryAdded: () =>
    Toast.show({ type: 'success', text1: 'Entry Added', text2: 'Rental entry recorded successfully' }),

  // ── ERRORS ──────────────────────────────────────────────────────────────────
  invalidCredentials: () =>
    Toast.show({
      type: 'error',
      text1: 'Invalid Credentials',
      text2: 'Email or password is incorrect',
      visibilityTime: 4000,
    }),

  networkError: () =>
    Toast.show({
      type: 'error',
      text1: 'Internet Unavailable',
      text2: 'Please check your connection and try again',
      visibilityTime: 4000,
    }),

  loadFailed: () =>
    Toast.show({
      type: 'error',
      text1: 'Failed to Load Data',
      text2: 'Please pull down to refresh',
      visibilityTime: 4000,
    }),

  // ── GENERIC ─────────────────────────────────────────────────────────────────
  success: (message: string, detail?: string) =>
    Toast.show({ type: 'success', text1: message, text2: detail }),

  error: (message: string, detail?: string) =>
    Toast.show({ type: 'error', text1: message, text2: detail, visibilityTime: 4000 }),

  warning: (message: string, detail?: string) =>
    Toast.show({ type: 'warning', text1: message, text2: detail, visibilityTime: 3500 }),

  info: (message: string, detail?: string) =>
    Toast.show({ type: 'info', text1: message, text2: detail }),
};
