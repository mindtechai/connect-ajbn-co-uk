import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.ajbn.connect',
  appName: 'AJBN Connect',
  webDir: 'dist',
  server: {
    // The app is a wrapper around the live AJBN Connect site, so all
    // existing PWA / web logic keeps working inside the native shell.
    url: 'https://connect.ajbn.co.uk',
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
