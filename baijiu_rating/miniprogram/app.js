const storage = require('./utils/storage');

App({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:3000/api'
  },
  onLaunch() {
    storage.getUserId();
    storage.getTasteProfile();
  }
});
