const { request } = require('../../utils/request');

Page({
  data: {
    i18n: {
      placeholder: '\u8f93\u5165\u9152\u540d\u6216\u54c1\u724c',
      search: '\u641c\u7d22',
      searching: '\u6b63\u5728\u641c\u7d22...',
      empty: '\u6682\u65e0\u641c\u7d22\u7ed3\u679c',
      detail: '\u8be6\u60c5',
      rate: '\u53bb\u8bc4\u5206'
    },
    keyword: '',
    list: [],
    loading: false
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onConfirm() {
    this.search();
  },

  search() {
    const keyword = String(this.data.keyword || '').trim();
    if (!keyword) {
      this.setData({ list: [] });
      return;
    }

    this.setData({ loading: true });
    request({
      url: `/liquors/search?q=${encodeURIComponent(keyword)}`
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

  toRate(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) {
      return;
    }
    wx.navigateTo({ url: `/pages/rate/index?liquor_id=${id}` });
  }
});
