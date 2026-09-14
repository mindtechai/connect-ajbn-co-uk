import type { CapacitorConfig } from '@capacitor/cli';

const LIVE_URL = 'https://connect.ajbn.co.uk';

// In CI / production packaging we ship the built web assets in `dist`
// (which redirect to the live site), so no dev server URL is used.
const isCI = !!process.env['CI'] || !!process.env['GITHUB_ACTIONS'];
const isProduction = process.env['NODE_ENV'] === 'production';
const useLiveServerUrl = !isCI && !isProduction;

const config: CapacitorConfig = {
  appId: 'uk.co.ajbn.connect',
  appName: 'AJBN Connect',
  webDir: 'dist',
  server: useLiveServerUrl
    ? {
        // Outside CI the app is a wrapper around the live AJBN Connect site,
        // so all existing PWA / web logic keeps working inside the shell.
        url: LIVE_URL,
        androidScheme: 'https',
        iosScheme: 'https',
        cleartext: false,
      }
    : {
        androidScheme: 'https',
        iosScheme: 'https',
        cleartext: false,
      },
  ios: {
    contentInset: 'always',
  },
};

export default config;
