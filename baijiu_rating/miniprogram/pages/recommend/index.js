const { request } = require('../../utils/request');

const SCENE_LABELS = {
  gift: '\u9001\u793c',
  party: '\u805a\u4f1a',
  self: '\u81ea\u996e',
  newbie: '\u5165\u95e8'
};

const PRICE_LABELS = {
  b1: '\u003c=100\u5143',
  b2: '100-200\u5143',
  b3: '200-400\u5143',
  b4: '400-800\u5143',
  b5: '800\u5143\u4ee5\u4e0a'
};

const CROWD_LABELS = {
  newbie: '\u65b0\u624b',
  occasional: '\u5076\u5c14\u559d',
  often: '\u7ecf\u5e38\u559d',
  enthusiast: '\u53d1\u70e7\u53cb'
};

const PREF_LABELS = {
  smooth: '\u60f3\u66f4\u987a\u53e3',
  soft: '\u60f3\u66f4\u67d4\u548c',
  aroma: '\u559c\u6b22\u66f4\u9999',
  durable: '\u60f3\u66f4\u8010\u559d',
  value: '\u770b\u91cd\u6027\u4ef7\u6bd4'
};

Page({
  data: {
    i18n: {
      title: '\u63a8\u8350\u7ed3\u679c Top5',
      scene: '\u573a\u666f',
      budget: '\u9884\u7b97',
      crowd: '\u4eba\u7fa4',
      prefs: '\u504f\u597d',
      any: '\u4e0d\u9650',
      balanced: '\u5747\u8861\u63a8\u8350',
      share: '\u5206\u4eab\u8fd9\u4efd\u63a8\u8350',
      loading: '\u6b63\u5728\u8ba1\u7b97\u63a8\u8350...',
      empty: '\u5f53\u524d\u6761\u4ef6\u6682\u65e0\u63a8\u8350',
      shareTitle: '\u8fd9\u7ec4\u767d\u9152\u63a8\u8350\u5f88\u5b9e\u7528\uff0c\u70b9\u5f00\u53ef\u590d\u73b0'
    },
    scene: '',
    sceneLabel: '',
    price_bucket: '',
    priceLabel: '',
    crowd: '',
    crowdLabel: '',
    prefs: [],
    prefsText: '',
    list: [],
    loading: false
  },

  onLoad(options) {
    const prefs = String(options.prefs || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    const scene = options.scene || '';
    const priceBucket = options.price_bucket || '';
    const crowd = options.crowd || '';

    this.setData({
      scene,
      sceneLabel: SCENE_LABELS[scene] || this.data.i18n.any,
      price_bucket: priceBucket,
      priceLabel: PRICE_LABELS[priceBucket] || this.data.i18n.any,
      crowd,
      crowdLabel: CROWD_LABELS[crowd] || this.data.i18n.any,
      prefs,
      prefsText: prefs.length ? prefs.map((key) => PREF_LABELS[key] || '\u5176\u4ed6\u504f\u597d').join(' / ') : this.data.i18n.balanced
    });

    this.fetchRecommendations();
  },

  fetchRecommendations() {
    this.setData({ loading: true });
    const prefsString = this.data.prefs.join(',');

    request({
      url: `/liquors/recommend?scene=${encodeURIComponent(this.data.scene)}&price_bucket=${encodeURIComponent(this.data.price_bucket)}&crowd=${encodeURIComponent(this.data.crowd)}&prefs=${encodeURIComponent(prefsString)}`
    })
      .then((list) => {
        this.setData({ list: Array.isArray(list) ? list : [] });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  onShareAppMessage() {
    const prefsString = this.data.prefs.join(',');
    const query = `scene=${encodeURIComponent(this.data.scene)}&price_bucket=${encodeURIComponent(this.data.price_bucket)}&crowd=${encodeURIComponent(this.data.crowd)}&prefs=${encodeURIComponent(prefsString)}`;
    return {
      title: this.data.i18n.shareTitle,
      path: `/pages/recommend/index?${query}`
    };
  },

  toDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});

