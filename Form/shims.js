import { TurboModuleRegistry, Platform } from 'react-native';

// Mock RNGoogleSignin for Expo Go or standard client without native modules built in
if (Platform.OS !== 'web') {
  try {
    const originalGetEnforcing = TurboModuleRegistry.getEnforcing;
    TurboModuleRegistry.getEnforcing = function (name) {
      try {
        return originalGetEnforcing(name);
      } catch (err) {
        if (name === 'RNGoogleSignin') {
          return {
            isMock: true,
            configure: () => {},
            signIn: () => Promise.reject(new Error('Google Sign-in mock')),
            signOut: () => Promise.resolve(),
          };
        }
        throw err;
      }
    };
  } catch (e) {
    // Fail silently
  }
}
