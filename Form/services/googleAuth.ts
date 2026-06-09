import { useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { authAPI } from './api';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1061684512561-nallhmtdd6k30695iv8k7qb1553cn83n.apps.googleusercontent.com',
  offlineAccess: false,
});

export function useGoogleLogin(onSuccess: (user: any) => void, onError: (err: Error) => void) {
  const [loading, setLoading] = useState(false);

  return {
    login: async () => {
      setLoading(true);
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const userInfo = await GoogleSignin.signIn();
        
        // Handle newer version of GoogleSignin vs older version payload
        const idToken = userInfo?.data?.idToken || (userInfo as any).idToken;

        if (!idToken) {
           throw new Error('No ID token returned from Google');
        }

        // 1. Authenticate with Firebase using the Google ID Token
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const fbUser = userCredential.user;

        // 2. Send the Firebase User details to our backend to generate JWT
        const res = await authAPI.googleLogin(
          fbUser.email || '',
          fbUser.displayName || '',
          fbUser.photoURL || '',
          fbUser.uid
        );

        if (res.success && res.user) {
          onSuccess(res.user);
        } else {
          throw new Error(res.message || 'Backend authentication failed');
        }
      } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          onError(new Error('User cancelled the login flow'));
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.warn('Google sign in already in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          onError(new Error('Play services not available or outdated'));
        } else {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    loading,
    isReady: true,
  };
}
