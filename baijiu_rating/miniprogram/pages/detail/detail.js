Page({
  data: {
    i18n: {
      title: '\u9875\u9762\u5df2\u5347\u7ea7',
      subtitle: '\u6b63\u5728\u8df3\u8f6c\u5230\u65b0\u7684\u8be6\u60c5\u9875...'
    }
  },

  onLoad(options) {
    const id = options && options.id ? options.id : '';
    wx.redirectTo({
      url: `/pages/detail/index?id=${encodeURIComponent(id)}`
    });
  }
});
