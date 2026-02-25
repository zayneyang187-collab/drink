Page({
  data: {
    i18n: {
      title: '\u9875\u9762\u5df2\u5347\u7ea7',
      subtitle: '\u6b63\u5728\u8df3\u8f6c\u5230\u65b0\u7684\u9009\u9152\u9875...'
    }
  },

  onLoad() {
    wx.switchTab({
      url: '/pages/home/index'
    });
  }
});
