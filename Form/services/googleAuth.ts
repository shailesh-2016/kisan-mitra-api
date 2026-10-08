import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { authAPI } from './api';

WebBrowser.maybeCompleteAuthSession();

// Safe dynamic getter for native Google Sign-in to prevent evaluation crashes in Expo Go
const getNativeGoogleSignin = () => {
  try {
    const { TurboModuleRegistry } = require('react-native');
    const nativeModule = TurboModuleRegistry?.getEnforcing ? TurboModuleRegistry.getEnforcing('RNGoogleSignin') : null;
    if (nativeModule && nativeModule.isMock) {
      return null;
    }
    const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
    return { GoogleSignin, statusCodes };
  } catch (e: any) {
    return null;
  }
};

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1061684512561-nallhmtdd6k30695iv8k7qb1553cn83n.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '1061684512561-hq9ajg78cb1lncg17e2su1m980ta2ufn.apps.googleusercontent.com';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '1061684512561-nallhmtdd6k30695iv8k7qb1553cn83n.apps.googleusercontent.com';

// Initialize native GoogleSignin if available
const nativeSDK = getNativeGoogleSignin();
if (nativeSDK?.GoogleSignin) {
  try {
    nativeSDK.GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  } catch (e) {
    console.warn('[Google SDK] Failed to configure native GoogleSignin:', e);
  }
}

export function useGoogleLogin(onSuccess: (user: any) => void, onError: (err: Error) => void) {
  const [loading, setLoading] = useState(false);

  // Fallback / Expo Go Google Auth Session
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });

  // Handle Expo AuthSession response (used when running in Expo Go or Web)
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      const accessToken = authentication?.accessToken;
      const idToken = authentication?.idToken;

      if (accessToken || idToken) {
        setLoading(true);
        (async () => {
          try {
            let email = '';
            let name = '';
            let photo = '';
            let googleId = '';

            // Fetch user info using Google access token
            if (accessToken) {
              const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const googleProfile = await userInfoRes.json();
              email = googleProfile.email || '';
              name = googleProfile.name || `${googleProfile.given_name || ''} ${googleProfile.family_name || ''}`.trim();
              photo = googleProfile.picture || '';
              googleId = googleProfile.id || '';
            }

            // Try Firebase authentication if idToken is available
            if (idToken) {
              try {
                const credential = GoogleAuthProvider.credential(idToken);
                const userCredential = await signInWithCredential(auth, credential);
                const fbUser = userCredential.user;
                if (fbUser.email) email = fbUser.email;
                if (fbUser.displayName) name = fbUser.displayName;
                if (fbUser.photoURL) photo = fbUser.photoURL;
                if (fbUser.uid) googleId = fbUser.uid;
              } catch (fbErr: any) {
                console.warn('[Firebase Auth] Continuing with direct Google profile:', fbErr?.message);
              }
            }

            if (!email) {
              throw new Error('Could not retrieve email from Google');
            }

            const res = await authAPI.googleLogin(email, name, photo, googleId);
            if (res.success && res.user) {
              onSuccess(res.user);
            } else {
              throw new Error(res.message || 'Google authentication failed');
            }
          } catch (err: any) {
            onError(err);
          } finally {
            setLoading(false);
          }
        })();
      }
    } else if (response?.type === 'error') {
      onError(new Error(response.error?.message || 'Google Sign-In failed'));
    }
  }, [response]);

  return {
    login: async () => {
      setLoading(true);
      try {
        const native = getNativeGoogleSignin();
        if (native?.GoogleSignin) {
          // ── Native standalone / build path ──────────────────────────────
          await native.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          const userInfo = await native.GoogleSignin.signIn();

          const idToken = userInfo?.data?.idToken || (userInfo as any).idToken;
          const userObj = userInfo?.data?.user || (userInfo as any).user;

          let email = userObj?.email || '';
          let name = userObj?.name || `${userObj?.givenName || ''} ${userObj?.familyName || ''}`.trim() || 'Google User';
          let photo = userObj?.photo || '';
          let googleId = userObj?.id || '';

          // Attempt Firebase Auth sign-in if idToken is provided
          if (idToken) {
            try {
              const credential = GoogleAuthProvider.credential(idToken);
              const userCredential = await signInWithCredential(auth, credential);
              const fbUser = userCredential.user;
              if (fbUser.email) email = fbUser.email;
              if (fbUser.displayName) name = fbUser.displayName;
              if (fbUser.photoURL) photo = fbUser.photoURL;
              if (fbUser.uid) googleId = fbUser.uid;
            } catch (fbErr: any) {
              console.warn('[Firebase Auth] Firebase sign-in bypassed, using Google credentials:', fbErr?.message);
            }
          }

          if (!email) {
            throw new Error('Google Sign-In did not return an email address');
          }

          const res = await authAPI.googleLogin(email, name, photo, googleId);
          if (res.success && res.user) {
            onSuccess(res.user);
          } else {
            throw new Error(res.message || 'Backend authentication failed');
          }
        } else {
          // ── Expo Go / Web Browser fallback path ─────────────────────────
          await promptAsync();
        }
      } catch (error: any) {
        const native = getNativeGoogleSignin();
        if (native?.statusCodes && error.code === native.statusCodes.SIGN_IN_CANCELLED) {
          onError(new Error('User cancelled Google login'));
        } else if (native?.statusCodes && error.code === native.statusCodes.IN_PROGRESS) {
          console.warn('Google sign-in already in progress');
        } else if (native?.statusCodes && error.code === native.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          // Fallback to web browser auth session
          try {
            await promptAsync();
          } catch (fallbackErr: any) {
            onError(fallbackErr);
          }
        } else {
          // Try fallback to Expo auth session if native throws module errors
          try {
            await promptAsync();
          } catch (fallbackErr: any) {
            onError(error);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    loading,
    isReady: true,
  };
}
