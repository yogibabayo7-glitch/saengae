import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // ⚠ 토스 콘솔에 등록한 앱 이름(영문)과 똑같아야 올라가요
  appName: 'saengae-benefit',
  brand: { primaryColor: '#0D6B63' },
  permissions: [],
  webBundleDir: 'dist',
  webView: {
    mediaPlaybackRequiresUserAction: true,
    allowsInlineMediaPlayback: false,
    bounces: true,
    allowsBackForwardNavigationGestures: true,
    pullToRefreshEnabled: false,
    overScrollMode: 'always',
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
    withTitle: true,
    transparentBackground: false,
  },
});
