const { request } = require('../../utils/request');
const storage = require('../../utils/storage');

const SCENE_OPTIONS = [
  { label: '\u9001\u793c', value: 'gift' },
  { label: '\u805a\u4f1a', value: 'party' },
  { label: '\u81ea\u996e', value: 'self' },
  { label: '\u5165\u95e8', value: 'newbie' }
];

Page({
  data: {
    i18n: {
      title: '\u70b9\u8bc4\u5165\u53e3',
      searchPlaceholder: '\u8f93\u5165\u9152\u540d\u6216\u54c1\u724c',
      search: '\u641c\u7d22',
      searching: '\u6b63\u5728\u641c\u7d22...',
      noResult: '\u6ca1\u627e\u5230\u8fd9\u6b3e\u9152',
      createHint: '\u53ef\u4ee5\u76f4\u63a5\u65b0\u5efa\u9152\u6b3e\uff0c\u7136\u540e\u53bb\u6253\u5206',
      brandPlaceholder: '\u54c1\u724c\uff08\u53ef\u9009\uff09',
      priceMinPlaceholder: '\u6700\u4f4e\u4ef7\uff08\u53ef\u9009\uff09',
      priceMaxPlaceholder: '\u6700\u9ad8\u4ef7\uff08\u53ef\u9009\uff09',
      createAndReview: '\u65b0\u5efa\u5e76\u53bb\u70b9\u8bc4',
      createSuccess: '\u5df2\u65b0\u5efa\uff0c\u5f00\u59cb\u70b9\u8bc4',
      needKeyword: '\u8bf7\u5148\u8f93\u5165\u9152\u540d',
      choose: '\u9009\u8fd9\u4e2a',
      recentTitle: '\u6700\u8fd1\u70b9\u8bc4',
      readyTitle: '\u51c6\u5907\u70b9\u8bc4',
      selectedEmpty: '\u8fd8\u6ca1\u9009\u62e9\u9152\u54c1',
      scene: '\u573a\u666f',
      start: '\u5f00\u59cb\u70b9\u8bc4',
      pickFirst: '\u8bf7\u5148\u9009\u62e9\u4e00\u6b3e\u9152'
    },
    keyword: '',
    createBrand: '',
    createPriceMin: '',
    createPriceMax: '',
    creating: false,
    searching: false,
    hasSearched: false,
    searchList: [],
    recentList: [],
    selectedLiquor: null,
    sceneOptions: SCENE_OPTIONS,
    scene: 'party'
  },

  onShow() {
    this.loadRecent();
  },

  loadRecent() {
    this.setData({ recentList: storage.getRecentReviewed() });
  },

  onKeywordInput(e) {
    const keyword = e.detail.value;
    this.setData({
      keyword,
      hasSearched: false,
      searchList: []
    });
  },

  onSearchConfirm() {
    this.searchLiquors();
  },

  searchLiquors() {
    const q = String(this.data.keyword || '').trim();
    if (!q) {
      this.setData({
        searchList: [],
        hasSearched: false
      });
      return;
    }

    this.setData({ searching: true });
    request({
      url: `/liquors/search?q=${encodeURIComponent(q)}`
    })
      .then((list) => {
        this.setData({
          searchList: Array.isArray(list) ? list : [],
          hasSearched: true
        });
      })
      .finally(() => {
        this.setData({ searching: false });
      });
  },

  onBrandInput(e) {
    this.setData({ createBrand: e.detail.value });
  },

  onPriceMinInput(e) {
    this.setData({ createPriceMin: e.detail.value });
  },

  onPriceMaxInput(e) {
    this.setData({ createPriceMax: e.detail.value });
  },

  createAndSelectLiquor() {
    if (this.data.creating) {
      return;
    }

    const name = String(this.data.keyword || '').trim();
    if (!name) {
      wx.showToast({ title: this.data.i18n.needKeyword, icon: 'none' });
      return;
    }

    const payload = {
      name,
      brand: String(this.data.createBrand || '').trim() || '自建酒款',
      price_min: normalizePrice(this.data.createPriceMin),
      price_max: normalizePrice(this.data.createPriceMax)
    };

    this.setData({ creating: true });
    request({
      url: '/liquors',
      method: 'POST',
      data: payload
    })
      .then((liquor) => {
        if (!liquor || !liquor.id) {
          return;
        }

        this.setData({
          selectedLiquor: liquor,
          searchList: [liquor],
          keyword: liquor.name
        });

        wx.showToast({ title: this.data.i18n.createSuccess, icon: 'none' });
        this.goRateWithLiquor(liquor);
      })
      .finally(() => {
        this.setData({ creating: false });
      });
  },

  selectFromSearch(e) {
    const liquor = e.currentTarget.dataset.item;
    if (!liquor || !liquor.id) {
      return;
    }

    this.setData({ selectedLiquor: liquor });
  },

  selectFromRecent(e) {
    const liquor = e.currentTarget.dataset.item;
    if (!liquor || !liquor.id) {
      return;
    }

    this.setData({ selectedLiquor: liquor });
  },

  selectScene(e) {
    this.setData({ scene: e.currentTarget.dataset.value });
  },

  startReview() {
    const liquor = this.data.selectedLiquor;
    if (!liquor || !liquor.id) {
      wx.showToast({ title: this.data.i18n.pickFirst, icon: 'none' });
      return;
    }

    this.goRateWithLiquor(liquor);
  },

  goRateWithLiquor(liquor) {
    storage.pushRecentReviewed(liquor);
    wx.navigateTo({
      url: `/pages/rate/index?liquor_id=${encodeURIComponent(liquor.id)}&scene=${encodeURIComponent(this.data.scene)}`
    });
  },

  toDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});

function normalizePrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.round(n);
}
