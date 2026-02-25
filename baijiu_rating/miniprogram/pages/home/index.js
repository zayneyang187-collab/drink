const { request } = require('../../utils/request');

const SCENE_OPTIONS = [
  { label: '\u9001\u793c', value: 'gift' },
  { label: '\u805a\u4f1a', value: 'party' },
  { label: '\u81ea\u996e', value: 'self' },
  { label: '\u5165\u95e8', value: 'newbie' }
];

const PRICE_OPTIONS = [
  { label: '\u003c=100', value: 'b1' },
  { label: '100-200', value: 'b2' },
  { label: '200-400', value: 'b3' },
  { label: '400-800', value: 'b4' },
  { label: '800+', value: 'b5' }
];

const CROWD_OPTIONS = [
  { label: '\u65b0\u624b', value: 'newbie' },
  { label: '\u5076\u5c14\u559d', value: 'occasional' },
  { label: '\u7ecf\u5e38\u559d', value: 'often' },
  { label: '\u53d1\u70e7\u53cb', value: 'enthusiast' }
];

const PREF_OPTIONS = [
  { label: '\u66f4\u987a\u53e3', value: 'smooth' },
  { label: '\u66f4\u67d4\u548c', value: 'soft' },
  { label: '\u9999\u4e00\u70b9', value: 'aroma' },
  { label: '\u66f4\u8010\u559d', value: 'durable' },
  { label: '\u6027\u4ef7\u6bd4', value: 'value' }
];

Page({
  data: {
    sceneOptions: SCENE_OPTIONS,
    priceOptions: PRICE_OPTIONS,
    crowdOptions: CROWD_OPTIONS,
    prefOptions: PREF_OPTIONS,
    i18n: {
      navTitle: '\u559d\u70b9\u5565\u5462',
      navSearch: '\u641c\u7d22',
      quickTitle: '\u5feb\u901f\u63a8\u8350',
      scene: '\u573a\u666f',
      budget: '\u9884\u7b97',
      moreOptions: '\u66f4\u591a\u9009\u9879',
      collapse: '\u6536\u8d77',
      expand: '\u5c55\u5f00',
      crowd: '\u4eba\u7fa4',
      prefs: '\u504f\u597d\uff08\u6700\u591a2\u4e2a\uff09',
      recommend: '\u63a8\u8350\u4e00\u4e0b',
      quickRecommend: '\u53ea\u6309\u573a\u666f+\u9884\u7b97',
      reviewCardTitle: '\u70b9\u8bc4\u4e00\u74f6\u9152',
      reviewCardSub: '\u628a\u4f60\u559d\u8fc7\u7684\u6253\u4e2a\u5206\uff0c\u5e2e\u66f4\u591a\u4eba\u4e0d\u8e29\u96f7',
      goReview: '\u53bb\u70b9\u8bc4',
      hotTitle: '\u672c\u5468\u70ed\u95e8',
      viewAll: '\u67e5\u770b\u5168\u90e8',
      loading: '\u52a0\u8f7d\u4e2d...',
      empty: '\u6682\u65e0\u6570\u636e'
    },
    scene: '',
    price_bucket: '',
    crowd: '',
    prefs: [],
    showMore: false,
    hotScene: 'party',
    hotList: [],
    loadingHot: false
  },

  onShow() {
    this.fetchHotPreview();
  },

  selectScene(e) {
    this.setData({ scene: e.currentTarget.dataset.value });
  },

  selectPrice(e) {
    this.setData({ price_bucket: e.currentTarget.dataset.value });
  },

  selectCrowd(e) {
    this.setData({ crowd: e.currentTarget.dataset.value });
  },

  togglePref(e) {
    const value = e.currentTarget.dataset.value;
    const current = this.data.prefs.slice();
    const idx = current.indexOf(value);

    if (idx >= 0) {
      current.splice(idx, 1);
      this.setData({ prefs: current });
      return;
    }

    if (current.length >= 2) {
      wx.showToast({ title: '\u504f\u597d\u6700\u591a\u9009\u62e92\u4e2a', icon: 'none' });
      return;
    }

    current.push(value);
    this.setData({ prefs: current });
  },

  toggleMore() {
    this.setData({ showMore: !this.data.showMore });
  },

  goRecommend() {
    if (!this.data.scene || !this.data.price_bucket) {
      wx.showToast({ title: '\u8bf7\u5148\u9009\u62e9\u573a\u666f\u548c\u9884\u7b97', icon: 'none' });
      return;
    }

    this.navigateToRecommend({
      scene: this.data.scene,
      price_bucket: this.data.price_bucket,
      crowd: this.data.crowd,
      prefs: this.data.prefs
    });
  },

  goQuickRecommend() {
    if (!this.data.scene || !this.data.price_bucket) {
      wx.showToast({ title: '\u8bf7\u5148\u9009\u62e9\u573a\u666f\u548c\u9884\u7b97', icon: 'none' });
      return;
    }

    this.navigateToRecommend({
      scene: this.data.scene,
      price_bucket: this.data.price_bucket,
      crowd: '',
      prefs: []
    });
  },

  navigateToRecommend(params) {
    const prefs = Array.isArray(params.prefs) ? params.prefs.join(',') : '';
    const query = `scene=${encodeURIComponent(params.scene)}&price_bucket=${encodeURIComponent(params.price_bucket)}&crowd=${encodeURIComponent(params.crowd || '')}&prefs=${encodeURIComponent(prefs)}`;

    wx.navigateTo({
      url: `/pages/recommend/index?${query}`
    });
  },

  switchHotScene(e) {
    this.setData({ hotScene: e.currentTarget.dataset.value }, () => {
      this.fetchHotPreview();
    });
  },

  fetchHotPreview() {
    this.setData({ loadingHot: true });

    request({
      url: `/liquors/rank?scene=${encodeURIComponent(this.data.hotScene)}`
    })
      .then((list) => {
        const hotList = Array.isArray(list) ? list.slice(0, 3) : [];
        this.setData({ hotList });
      })
      .finally(() => {
        this.setData({ loadingHot: false });
      });
  },

  toDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  toRankTab() {
    wx.switchTab({ url: '/pages/rank/index' });
  },

  toReviewTab() {
    wx.switchTab({ url: '/pages/review/index' });
  }
});
