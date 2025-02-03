import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'News Research Tracker',
  description: 'Chrome extension to track participant behavior on Google News',
  version: '0.1.9',
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  options_page: 'options.html',
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['*://news.google.com/*', '*://duo.up.railway.app/*', '*://localhost/*'],
      js: ['src/content/index.js', 'src/content/chatbox.js', 'src/content/login.js'],
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self';",
    sandbox:
      "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'unsafe-inline' 'unsafe-eval'; child-src 'self';",
  },
  permissions: ['storage', 'activeTab'],
})
