import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.ajbn.connect',
  appName: 'AJBN Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  }
};

export default config;
