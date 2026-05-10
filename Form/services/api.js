import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Local development: use your PC's local IP (e.g. http://192.168.x.x:5000)
// Production: 'https://kisan-plus-api-8ski.onrender.com'
const BASE_URL = 'https://kisan-mitra-api-8ski.onrender.com';

const TOKEN_KEY = '@kisan_token';
const USER_KEY  = '@kisan_user';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const saveToken = async (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken  = async ()        => AsyncStorage.getItem(TOKEN_KEY);
export const removeToken = async ()      => AsyncStorage.removeItem(TOKEN_KEY);

export const saveUser = async (user) => AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
export const getUser  = async ()     => {
  const u = await AsyncStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
};
export const removeUser = async () => AsyncStorage.removeItem(USER_KEY);

// ── Core fetch wrapper ────────────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    console.error('[API] Network error:', networkErr?.message);
    throw new Error('Network error - check your connection or server IP');
  }

  const data = await response.json();

  if (!response.ok) {
    console.error(`[API] ${endpoint} failed ${response.status}:`, data.message);
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  // Register new user
  register: (name, mobile, village, language = 'gu') =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, mobile, village, language }),
    }),

  // Send OTP to existing user
  sendOtp: (mobile) =>
    request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    }),

  // Verify OTP and get token
  verifyOtp: async (mobile, otp) => {
    const data = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
    if (data.token) {
      await saveToken(data.token);
      await saveUser(data.user);
    }
    return data;
  },

  // Logout
  logout: async () => {
    await removeToken();
    await removeUser();
  },
};

// ── USER ──────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => request('/api/user/profile'),

  updateProfile: (data) =>
    request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Step 1: Request OTP to be sent to registered mobile for account deletion
  requestDeleteOtp: () =>
    request('/api/user/request-delete-otp', { method: 'POST' }),

  // Step 2: Permanently delete account — requires OTP from step 1
  deleteAccount: (otp) =>
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
  getById: (id) => request(`/api/machine/${id}`),

  // Add new machine
  add: (machineName, machineType, emoji) =>
    request('/api/machine/add', {
      method: 'POST',
      body: JSON.stringify({ machineName, machineType, emoji }),
    }),

  // Add entry to machine
  addEntry: (machineId, farmerName, address, pricePerHour, totalHours, totalAmount) =>
    request('/api/machine/add-entry', {
      method: 'POST',
      body: JSON.stringify({ machineId, farmerName, address, pricePerHour, totalHours, totalAmount }),
    }),

  // Soft delete machine (move to trash)
  delete: (id) =>
    request(`/api/machine/${id}`, { method: 'DELETE' }),

  // Soft delete entry
  deleteEntry: (machineId, entryId) =>
    request(`/api/machine/${machineId}/entry/${entryId}`, { method: 'DELETE' }),

  // Get trashed machines
  getTrash: () => request('/api/machine/trash'),

  // Restore machine from trash
  restore: (id) =>
    request(`/api/machine/${id}/restore`, { method: 'POST' }),

  // Permanently delete machine
  permanentDelete: (id) =>
    request(`/api/machine/${id}/permanent`, { method: 'DELETE' }),
};

// ── PROFIT ────────────────────────────────────────────────────────────────────
export const profitAPI = {
  // Calculate and save profit
  calculate: (data) =>
    request('/api/profit/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get active profit history
  getHistory: () => request('/api/profit/history'),

  // Soft delete a record (move to trash)
  delete: (id) =>
    request(`/api/profit/${id}`, { method: 'DELETE' }),

  // Get trashed records
  getTrash: () => request('/api/profit/trash'),

  // Restore from trash
  restore: (id) =>
    request(`/api/profit/${id}/restore`, { method: 'POST' }),

  // Permanently delete
  permanentDelete: (id) =>
    request(`/api/profit/${id}/permanent`, { method: 'DELETE' }),
};

// ── SOCIAL — POSTS ────────────────────────────────────────────────────────────
export const postAPI = {
  // Create a new post
  create: (data) =>
    request('/api/post/create', { method: 'POST', body: JSON.stringify(data) }),

  // Get posts by user ('me' for own posts)
  getUserPosts: (userId = 'me') =>
    request(`/api/post/user/${userId}`),

  // Get feed (following + own)
  getFeed: () => request('/api/post/feed'),

  // Toggle like on a post
  toggleLike: (postId) =>
    request(`/api/post/${postId}/like`, { method: 'POST' }),

  // Add comment
  addComment: (postId, text) =>
    request(`/api/post/${postId}/comment`, { method: 'POST', body: JSON.stringify({ text }) }),

  // Delete post
  delete: (postId) =>
    request(`/api/post/${postId}`, { method: 'DELETE' }),
};

// ── SOCIAL — FOLLOW ───────────────────────────────────────────────────────────
export const socialAPI = {
  // Follow a user
  follow: (userId) =>
    request(`/api/social/follow/${userId}`, { method: 'POST' }),

  // Unfollow a user
  unfollow: (userId) =>
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
  searchUsers: (q) =>
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
