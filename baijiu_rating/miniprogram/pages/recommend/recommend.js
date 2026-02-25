Page({
  data: {
    i18n: {
      title: '\u9875\u9762\u5df2\u5347\u7ea7',
      subtitle: '\u6b63\u5728\u8df3\u8f6c\u5230\u65b0\u7684\u63a8\u8350\u9875...'
    }
  },

  onLoad(options) {
    const scene = options && options.scene ? options.scene : '';
    const priceBucket = options && options.price_bucket ? options.price_bucket : '';
    const crowd = options && options.crowd ? options.crowd : '';
    const prefs = options && options.prefs ? options.prefs : '';
    const query = `scene=${encodeURIComponent(scene)}&price_bucket=${encodeURIComponent(priceBucket)}&crowd=${encodeURIComponent(crowd)}&prefs=${encodeURIComponent(prefs)}`;

    wx.redirectTo({
      url: `/pages/recommend/index?${query}`
    });
  }
});
