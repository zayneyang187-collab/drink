const { request } = require('../../utils/request');

const SCENE_OPTIONS = [
  { label: '\u9001\u793c', value: 'gift' },
  { label: '\u805a\u4f1a', value: 'party' },
  { label: '\u81ea\u996e', value: 'self' },
  { label: '\u5165\u95e8', value: 'newbie' }
];

Page({
  data: {
    i18n: {
      title: '\u672c\u5468\u699c\u5355',
      search: '\u641c\u7d22',
      loading: '\u52a0\u8f7d\u4e2d...',
      empty: '\u6682\u65e0\u699c\u5355\u6570\u636e'
    },
    sceneOptions: SCENE_OPTIONS,
    scene: 'party',
    list: [],
    loading: false
  },

  onLoad() {
    this.fetchRank();
  },

  onPullDownRefresh() {
    this.fetchRank().finally(() => wx.stopPullDownRefresh());
  },

  switchScene(e) {
    this.setData({ scene: e.currentTarget.dataset.value }, () => {
      this.fetchRank();
    });
  },

  fetchRank() {
    this.setData({ loading: true });
    return request({
      url: `/liquors/rank?scene=${encodeURIComponent(this.data.scene)}`
    })
      .then((list) => {
        this.setData({ list: Array.isArray(list) ? list : [] });
      })
      .finally(() => {
        this.setData({ loading: false });
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
  }
});
