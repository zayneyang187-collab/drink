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
      choose: '\u9009\u8fd9\u4e2a',
      recentTitle: '\u6700\u8fd1\u70b9\u8bc4',
      readyTitle: '\u51c6\u5907\u70b9\u8bc4',
      selectedEmpty: '\u8fd8\u6ca1\u9009\u62e9\u9152\u54c1',
      scene: '\u573a\u666f',
      start: '\u5f00\u59cb\u70b9\u8bc4',
      pickFirst: '\u8bf7\u5148\u9009\u62e9\u4e00\u6b3e\u9152'
    },
    keyword: '',
    searching: false,
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
    this.setData({ keyword: e.detail.value });
  },

  onSearchConfirm() {
    this.searchLiquors();
  },

  searchLiquors() {
    const q = String(this.data.keyword || '').trim();
    if (!q) {
      this.setData({ searchList: [] });
      return;
    }

    this.setData({ searching: true });
    request({
      url: `/liquors/search?q=${encodeURIComponent(q)}`
    })
      .then((list) => {
        this.setData({ searchList: Array.isArray(list) ? list : [] });
      })
      .finally(() => {
        this.setData({ searching: false });
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
