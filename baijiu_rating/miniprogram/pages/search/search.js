Page({
  data: {
    i18n: {
      title: '\u65e7\u7248\u5165\u53e3\u5df2\u8fc1\u79fb',
      subtitle: '\u6b63\u5728\u8df3\u8f6c\u5230\u65b0\u7684\u641c\u7d22\u9875...'
    }
  },

  onLoad() {
    wx.redirectTo({
      url: '/pages/search/index'
    });
  }
});
