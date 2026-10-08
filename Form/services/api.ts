import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Production Live Server (used when app is built into APK / Production release)
export const LIVE_API_URL = process.env.EXPO_PUBLIC_PROD_API_URL || 'https://kisan-mitra-api-8ski.onrender.com';

const getDevApiUrl = () => {
  // 1. Web browser always uses localhost:5001
  if (Platform.OS === 'web') {
    return 'http://localhost:5001';
  }

  // 2. Android emulator uses 10.0.2.2:5001
  // On physical Android device via Expo Go, auto-detect host PC IP
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) return `http://${ip}:5001`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001';
  }

  return process.env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:5001';
};

// Automatic Mode Switch:
// In local Expo testing (__DEV__ === true)  -> Uses Local Dev Backend
// In Production APK Build (__DEV__ === false) -> Uses Live Render Production Server
export const BASE_URL = __DEV__ ? getDevApiUrl() : LIVE_API_URL;

console.log(`[API Config] Mode: ${__DEV__ ? 'DEVELOPMENT (Local)' : 'PRODUCTION (Build)'} | Base URL: ${BASE_URL}`);

const TOKEN_KEY = 'kisan_token';
const USER_KEY  = 'kisan_user';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveToken = async (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const getToken  = async () => SecureStore.getItemAsync(TOKEN_KEY);
export const removeToken = async () => SecureStore.deleteItemAsync(TOKEN_KEY);

export const saveUser = async (user: any) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser  = async () => {
  const u = await AsyncStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
};
export const removeUser = async () => AsyncStorage.removeItem(USER_KEY);

// ── 401 Handling ─────────────────────────────────────────────────────────────
type UnauthorizedCallback = () => void;
let unauthorizedCallbacks: UnauthorizedCallback[] = [];

export const onUnauthorized = (cb: UnauthorizedCallback) => {
  unauthorizedCallbacks.push(cb);
  return () => {
    unauthorizedCallbacks = unauthorizedCallbacks.filter(x => x !== cb);
  };
};

const triggerUnauthorized = () => {
  unauthorizedCallbacks.forEach(cb => cb());
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

const fetchWithTimeout = async (url: string, options: RequestOptions = {}): Promise<Response> => {
  const { timeoutMs = 8000, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const request = async <T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response: Response | null = null;
  let primaryError: any = null;

  // 1. Send request to BASE_URL
  try {
    response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      timeoutMs: options.timeoutMs || (__DEV__ ? 5000 : 15000),
    });
  } catch (err: any) {
    primaryError = err;
    console.warn(`[API] Connection to ${BASE_URL}${endpoint} failed:`, err?.message || err);
  }

  if (!response) {
    throw new Error(
      primaryError?.name === 'AbortError'
        ? 'Request timed out. Please check your connection.'
        : `Network error - unable to connect to ${BASE_URL}. Ensure backend is running.`
    );
  }

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    triggerUnauthorized();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`[API] ${endpoint} failed ${response.status}:`, data.message);
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (name: string, email: string, password: string, village: string, language = 'gu') =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, village, language }),
    }),

  login: async (email: string, password: string) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const data = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  },

  resendOtp: (email: string) =>
    request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),

  googleLogin: async (email: string, name: string, profileImage: string, googleId: string) => {
    const data = await request('/api/auth/google-login', {
      method: 'POST',
      body: JSON.stringify({ email, name, profileImage, googleId }),
    });
    if (data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  },

  facebookLogin: async (email: string, name: string, profileImage: string, facebookId: string) => {
    const data = await request('/api/auth/facebook-login', {
      method: 'POST',
      body: JSON.stringify({ email, name, profileImage, facebookId }),
    });
    if (data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  },

  logout: async () => {
    await removeToken();
    await removeUser();
  },
};

// ── USER ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => request('/api/user/profile'),

  updateProfile: (data: any) =>
    request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Step 1: Request OTP to be sent to registered mobile for account deletion
  requestDeleteOtp: () =>
    request('/api/user/request-delete-otp', { method: 'POST' }),

  // Step 2: Permanently delete account — requires OTP from step 1
  deleteAccount: (otp: string) =>
    request('/api/user/delete', {
      method: 'DELETE',
      body: JSON.stringify({ otp }),
    }),
};

// ── MACHINE ───────────────────────────────────────────────────────────────────
export const machineAPI = {
  // Get all active machines
  getAll: () => request('/api/machine'),

  // Get single machine with entries
  getById: (id: string) => request(`/api/machine/${id}`),

  // Add new machine
  add: (machineName: string, machineType: string, emoji: string) =>
    request('/api/machine/add', {
      method: 'POST',
      body: JSON.stringify({ machineName, machineType, emoji }),
    }),

  // Add entry to machine
  addEntry: (machineId: string, farmerName: string, address: string, pricePerHour: number, totalHours: number, totalAmount: number) =>
    request('/api/machine/add-entry', {
      method: 'POST',
      body: JSON.stringify({ machineId, farmerName, address, pricePerHour, totalHours, totalAmount }),
    }),

  // Soft delete machine (move to trash)
  delete: (id: string) =>
    request(`/api/machine/${id}`, { method: 'DELETE' }),

  // Soft delete entry
  deleteEntry: (machineId: string, entryId: string) =>
    request(`/api/machine/${machineId}/entry/${entryId}`, { method: 'DELETE' }),

  // Get trashed machines
  getTrash: () => request('/api/machine/trash'),

  // Restore machine from trash
  restore: (id: string) =>
    request(`/api/machine/${id}/restore`, { method: 'POST' }),

  // Permanently delete machine
  permanentDelete: (id: string) =>
    request(`/api/machine/${id}/permanent`, { method: 'DELETE' }),
};

// ── PROFIT ────────────────────────────────────────────────────────────────────
export const profitAPI = {
  // Calculate and save profit
  calculate: (data: any) =>
    request('/api/profit/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get active profit history
  getHistory: () => request('/api/profit/history'),

  // Soft delete a record (move to trash)
  delete: (id: string) =>
    request(`/api/profit/${id}`, { method: 'DELETE' }),

  // Get trashed records
  getTrash: () => request('/api/profit/trash'),

  // Restore from trash
  restore: (id: string) =>
    request(`/api/profit/${id}/restore`, { method: 'POST' }),

  // Permanently delete
  permanentDelete: (id: string) =>
    request(`/api/profit/${id}/permanent`, { method: 'DELETE' }),
};

// ── SOCIAL — POSTS ────────────────────────────────────────────────────────────
export const postAPI = {
  // Create a new post
  create: (data: any) =>
    request('/api/post/create', { method: 'POST', body: JSON.stringify(data) }),

  // Get posts by user ('me' for own posts)
  getUserPosts: (userId = 'me') =>
    request(`/api/post/user/${userId}`),

  // Get feed (following + own)
  getFeed: () => request('/api/post/feed'),

  // Toggle like on a post
  toggleLike: (postId: string) =>
    request(`/api/post/${postId}/like`, { method: 'POST' }),

  // Add comment
  addComment: (postId: string, text: string) =>
    request(`/api/post/${postId}/comment`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Delete post
  delete: (postId: string) =>
    request(`/api/post/${postId}`, { method: 'DELETE' }),
};

// ── SOCIAL — FOLLOW ───────────────────────────────────────────────────────────
export const socialAPI = {
  // Follow a user
  follow: (userId: string) =>
    request(`/api/social/follow/${userId}`, { method: 'POST' }),

  // Unfollow a user
  unfollow: (userId: string) =>
    request(`/api/social/unfollow/${userId}`, { method: 'POST' }),

  // Get all users (for farmers community screen)
  getAllUsers: () =>
    request('/api/social/users'),

  // Get followers list ('me' for own)
  getFollowers: (userId = 'me') =>
    request(`/api/social/followers/${userId}`),

  // Get following list ('me' for own)
  getFollowing: (userId = 'me') =>
    request(`/api/social/following/${userId}`),

  // Search farmers by name
  searchUsers: (q: string) =>
    request(`/api/social/search?q=${encodeURIComponent(q)}`),
};

// ── MANDI ─────────────────────────────────────────────────────────────────────
export const mandiAPI = {
  // Get all mandi prices (optional filters)
  getPrices: ({ state = 'Gujarat', district = '', commodity = '', limit = 100 } = {}) => {
    const params = new URLSearchParams({ state, limit: String(limit) });
    if (district)  params.append('district',  district);
    if (commodity) params.append('commodity', commodity);
    return request(`/api/mandi?${params.toString()}`);
  },

  // Get list of districts
  getDistricts: (state = 'Gujarat') =>
    request(`/api/mandi/districts?state=${encodeURIComponent(state)}`),
};
