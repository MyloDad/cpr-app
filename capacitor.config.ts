import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.cprtimer',
  appName: 'CPR Timer',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#1e2126',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP'
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  // iOS specific config
  ios: {
    backgroundColor: '#1e2126',
    contentInset: 'never',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
  // Android specific config
  android: {
    backgroundColor: '#1e2126',
    allowMixedContent: true,
  },
  // Add this to your capacitor.config.json
  cordova: {
    preferences: {
      // Add UIBackgroundModes for audio playback
      UIBackgroundModes: 'audio',
      // Prevent screen from going to sleep
      UIIdleTimerDisabled: 'true',
      // Disable app translation
      CFBundleAllowMixedLocalizations: 'true'
    }
  }
};

export default config;