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
            getConstants: () => ({
              BUTTON_SIZE_STANDARD: 0,
              BUTTON_SIZE_WIDE: 1,
              BUTTON_SIZE_ICON: 2,
              BUTTON_COLOR_LIGHT: 0,
              BUTTON_COLOR_DARK: 1,
              SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
              IN_PROGRESS: 'IN_PROGRESS',
              PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE'
            }),
            configure: () => {},
            signIn: () => Promise.reject(new Error('Google Sign-in mock')),
            signOut: () => Promise.resolve(),
            hasPlayServices: () => Promise.resolve(false),
          };
        }
        throw err;
      }
    };
  } catch (e) {
    // Fail silently
  }
}
