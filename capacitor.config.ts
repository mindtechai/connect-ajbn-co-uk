import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.ajbn.connect',
  appName: 'AJBN Connect & Impact',
  webDir: 'dist',
  // Only use Lovable preview URL outside CI - in GitHub Actions use local dist
  server: process.env.CI ? undefined : {
    url: 'https://id-preview--xxx.lovable.app',
    cleartext: true
  }
};

export default config;
