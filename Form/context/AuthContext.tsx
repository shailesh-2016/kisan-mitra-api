import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import { getToken, getUser, removeToken, removeUser, saveUser, userAPI } from '../services/api';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

// Safe dynamic getter for native Google Sign-in to prevent evaluation crashes in Expo Go
const getGoogleSignin = () => {
  try {
    const { TurboModuleRegistry } = require('react-native');
    const nativeModule = TurboModuleRegistry.getEnforcing('RNGoogleSignin');
    if (nativeModule && nativeModule.isMock) {
      return null;
    }
    return require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch (e: any) {
    console.warn('[Google SDK] Native GoogleSignin module not available in this binary:', e.message);
    return null;
  }
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  village: string;
  district: string;
  state: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  language: string;
  farmSize: string;
  cropsGrown: string;
  experience: string;
  followersCount: number;
  followingCount: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: UserProfile | null) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  loading: true,
  refreshProfile: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setLoading(false); return; }

        // Try to get fresh profile from server
        try {
          const data = await userAPI.getProfile();
          if (data?.user) {
            const u = data.user;
            const profile: UserProfile = {
              id:             u._id || u.id,
              name:           u.name         || '',
              email:          u.email        || '',
              village:        u.village      || '',
              district:       u.district     || '',
              state:          u.state        || '',
              bio:            u.bio          || '',
              profileImage:   u.profileImage || '',
              coverImage:     u.coverImage   || '',
              language:       u.language     || 'gu',
              farmSize:       u.farmSize     || '',
              cropsGrown:     u.cropsGrown   || '',
              experience:     u.experience   || '',
              followersCount: Array.isArray(u.followers) ? u.followers.length : (u.followersCount || 0),
              followingCount: Array.isArray(u.following) ? u.following.length : (u.followingCount || 0),
            };
            setUser(profile);
            await saveUser(profile);
          }
        } catch {
          // Server unreachable — fall back to cached user
          const cached = await getUser();
          if (cached) setUser(cached as UserProfile);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Refresh profile from server
  const refreshProfile = useCallback(async () => {
    try {
      const data = await userAPI.getProfile();
      if (data?.user) {
        const u = data.user;
        const profile: UserProfile = {
          id:             u._id || u.id,
          name:           u.name         || '',
          email:          u.email        || '',
          village:        u.village      || '',
          district:       u.district     || '',
          state:          u.state        || '',
          bio:            u.bio          || '',
          profileImage:   u.profileImage || '',
          coverImage:     u.coverImage   || '',
          language:       u.language     || 'gu',
          farmSize:       u.farmSize     || '',
          cropsGrown:     u.cropsGrown   || '',
          experience:     u.experience   || '',
          followersCount: Array.isArray(u.followers) ? u.followers.length : (u.followersCount || 0),
          followingCount: Array.isArray(u.following) ? u.following.length : (u.followingCount || 0),
        };
        setUser(profile);
        await saveUser(profile);
      }
    } catch (err) {
      console.warn('[AuthContext] refreshProfile failed:', err);
    }
  }, []);

  // Logout: clear storage + state + firebase
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout failed', e);
    }
    try {
      const GoogleSignin = getGoogleSignin();
      if (GoogleSignin) {
        await GoogleSignin.signOut();
      }
    } catch (e) {
      console.warn('Google Signin signout failed', e);
    }
    await removeToken();
    await removeUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!user,
      user,
      loading,
      refreshProfile,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
