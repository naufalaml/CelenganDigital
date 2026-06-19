import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.celengandigital.app',
  appName: 'CelenganDigital',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#6366f1'
    }
  }
};

export default config;
