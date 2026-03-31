import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arnai.app',
  appName: 'ARN AI',
  webDir: 'dist',
  server: {
    url: 'https://arn-ai-v3.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      fadeInDuration: 500,
      fadeOutDuration: 500,
    }
  }
};

export default config;