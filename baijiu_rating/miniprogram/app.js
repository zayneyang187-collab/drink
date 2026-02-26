const storage = require('./utils/storage');

App({
  onLaunch() {
    wx.cloud.init({
      env: 'prod-7gpq613l2903a674',
      traceUser: true
    });
  }
});

