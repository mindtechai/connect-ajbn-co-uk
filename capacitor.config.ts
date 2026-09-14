import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.ajbn.connect',
  appName: 'AJBN Connect & Impact',
  webDir: 'dist',
  server: {
    url: 'https://connect.ajbn.co.uk',
    cleartext: true
  },
  allowNavigation: ['connect.ajbn.co.uk', '*.connect.ajbn.co.uk', '*.lovable.app']
};

export default config;
