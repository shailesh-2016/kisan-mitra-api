import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';
import { authAPI } from './api';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin(onSuccess: (user: any) => void, onError: (err: Error) => void) {
  const [loading, setLoading] = useState(false);

  // Configure Expo Auth Session for Google to get an ID Token for Firebase
  // Following strict instructions: ONLY use Web Client ID, NO Android client ID.
  const redirectUri = makeRedirectUri({
    scheme: 'kisanplus',
    useProxy: true, // Specifically required for Expo Go legacy proxy redirect
  } as any);

  console.log('--- GOOGLE AUTH DEBUG ---');
  console.log('Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '817116410879-7rfit9e02c3nk97pk3gbud0t0bp4io4b.apps.googleusercontent.com');
  console.log('Exact Redirect URI:', redirectUri);
  console.log('-------------------------');

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '817116410879-7rfit9e02c3nk97pk3gbud0t0bp4io4b.apps.googleusercontent.com',
    redirectUri: redirectUri,
  });

  useEffect(() => {
    async function handleResponse() {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        if (!id_token) {
           onError(new Error('No ID token returned from Google'));
           return;
        }

        setLoading(true);
        try {
          // 1. Authenticate with Firebase using the Google ID Token
          const credential = GoogleAuthProvider.credential(id_token);
          const userCredential = await signInWithCredential(auth, credential);
          const fbUser = userCredential.user;

          // 2. Send the Firebase User details to our backend to generate JWT
          const res = await authAPI.googleLogin(
            fbUser.email,
            fbUser.displayName,
            fbUser.photoURL || '',
            fbUser.uid
          );

          if (res.success && res.user) {
            onSuccess(res.user);
          } else {
            throw new Error(res.message || 'Backend authentication failed');
          }
        } catch (error: any) {
          onError(error);
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'cancel') {
        onError(new Error('User cancelled the login flow'));
      } else if (response?.type === 'error') {
        onError(new Error(response.error?.message || 'OAuth error occurred'));
      }
    }

    if (response) {
      handleResponse();
    }
  }, [response]);

  return {
    login: async () => {
      try {
        await promptAsync();
      } catch (err: any) {
        onError(err);
      }
    },
    loading,
    isReady: !!request,
  };
}
