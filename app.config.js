require('dotenv').config();

export default {
  expo: {
  owner: 'hatmanstack',
  name: 'Pixel Prompt',
  slug: 'pixel-prompt',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  assetBundlePatterns: [
    '**/*'
  ],
  
  splash: {
    backgroundColor: '#FFFFFF',
  },
 
  web: {
    favicon: './assets/icon.png'
  },
  extra: {
    HF_TOKEN_VAR: process.env.HF_TOKEN_VARIABLE,
    eas: {
      projectId: 'c6b10366-df30-4f21-b5a5-1d8266947529'
    }
  },
  runtimeVersion: {
    policy: 'sdkVersion'
  },
  updates: {
    url: 'https://u.expo.dev/c6b10366-df30-4f21-b5a5-1d8266947529'
  },
  android: {
    package: 'gemenielabs.pixel_prompt',
    versionCode: 1
  },
  ios: {}
}
};