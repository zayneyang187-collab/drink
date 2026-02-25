const { request } = require('../../utils/request');
const storage = require('../../utils/storage');

const SCENES = [
  { label: '\u9001\u793c', value: 'gift' },
  { label: '\u805a\u4f1a', value: 'party' },
  { label: '\u81ea\u996e', value: 'self' },
  { label: '\u5165\u95e8', value: 'newbie' }
];

Page({
  data: {
    i18n: {
      titlePrefix: '\u8bc4\u5206\uff1a',
      thisLiquor: '\u8fd9\u6b3e\u9152',
      sceneRequired: '\u573a\u666f\uff08\u5fc5\u586b\uff09',
      overall: '\u7efc\u5408\u8bc4\u5206',
      smooth: '\u987a\u53e3\u5ea6',
      softness: '\u67d4\u548c\u5ea6',
      value: '\u6027\u4ef7\u6bd4',
      giftFace: '\u4f53\u9762\u5ea6\uff08\u9001\u793c\u5fc5\u586b\uff09',
      aromaLikeOptional: '\u9999\u6c14\u559c\u597d\uff08\u9009\u586b\uff09',
      reviewOptional: '\u77ed\u8bc4\uff08\u9009\u586b\uff09',
      reviewPlaceholder: '\u4f8b\uff1a\u5165\u53e3\u987a\u3001\u56de\u5473\u5e72\u51c0\uff0c\u805a\u4f1a\u559d\u8d77\u6765\u6ca1\u8d1f\u62c5',
      aromaRawOptional: '\u81ea\u5b9a\u4e49\u9999\u578b\uff08\u9009\u586b\uff09',
      aromaRawPlaceholder: '\u4f8b\uff1a\u9171\u9999 / \u6d53\u9999 / \u6e05\u9999',
      imagesOptional: '\u56fe\u7247\uff08\u9009\u586b\uff09',
      pickImages: '\u9009\u62e9\u56fe\u7247',
      remove: '\u5220\u9664',
      submit: '\u63d0\u4ea4\u8bc4\u5206',
      missingLiquor: '\u7f3a\u5c11\u9152\u54c1ID',
      missingGiftFace: '\u9001\u793c\u573a\u666f\u8bf7\u586b\u5199\u4f53\u9762\u5ea6',
      success: '\u8bc4\u5206\u6210\u529f'
    },
    liquor_id: '',
    liquor_name: '',
    sceneOptions: SCENES,
    sceneIndex: 1,
    scene: 'party',
    sceneLabel: '\u805a\u4f1a',
    score_overall: 8,
    score_smooth: 8,
    score_softness: 8,
    score_value: 8,
    score_gift_face: 8,
    enableAromaLike: false,
    score_aroma_like: 8,
    review_text: '',
    aroma_raw: '',
    images: [],
    submitting: false
  },

  onLoad(options) {
    const liquorId = options.liquor_id || '';
    const scene = options.scene || '';

    this.setData({ liquor_id: liquorId });

    if (scene) {
      const idx = SCENES.findIndex((item) => item.value === scene);
      if (idx >= 0) {
        this.setData({
          sceneIndex: idx,
          scene: SCENES[idx].value,
          sceneLabel: SCENES[idx].label
        });
      }
    }

    if (liquorId) {
      request({ url: `/liquors/${encodeURIComponent(liquorId)}` }).then((data) => {
        const liquor = data.liquor || {};
        this.setData({ liquor_name: liquor.name || '' });
      });
    }
  },

  onSceneChange(e) {
    const index = Number(e.detail.value);
    const picked = this.data.sceneOptions[index];
    this.setData({
      sceneIndex: index,
      scene: picked.value,
      sceneLabel: picked.label
    });
  },

  onSliderChange(e) {
    const key = e.currentTarget.dataset.key;
    const value = Number(e.detail.value || 1);
    this.setData({ [key]: value });
  },

  onSwitchAromaLike(e) {
    this.setData({ enableAromaLike: Boolean(e.detail.value) });
  },

  onReviewInput(e) {
    this.setData({ review_text: e.detail.value });
  },

  onAromaRawInput(e) {
    this.setData({ aroma_raw: e.detail.value });
  },

  chooseImages() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ images: res.tempFilePaths || [] });
      }
    });
  },

  removeImage(e) {
    const index = Number(e.currentTarget.dataset.index);
    const next = this.data.images.slice();
    next.splice(index, 1);
    this.setData({ images: next });
  },

  submit() {
    if (this.data.submitting) {
      return;
    }

    if (!this.data.liquor_id) {
      wx.showToast({ title: this.data.i18n.missingLiquor, icon: 'none' });
      return;
    }

    if (this.data.scene === 'gift' && !this.data.score_gift_face) {
      wx.showToast({ title: this.data.i18n.missingGiftFace, icon: 'none' });
      return;
    }

    const payload = {
      liquor_id: this.data.liquor_id,
      user_id: storage.getUserId(),
      scene: this.data.scene,
      score_overall: Number(this.data.score_overall),
      score_smooth: Number(this.data.score_smooth),
      score_softness: Number(this.data.score_softness),
      score_value: Number(this.data.score_value),
      score_gift_face: this.data.scene === 'gift' ? Number(this.data.score_gift_face) : null,
      score_aroma_like: this.data.enableAromaLike ? Number(this.data.score_aroma_like) : null,
      review_text: this.data.review_text ? this.data.review_text : null,
      aroma_raw: this.data.aroma_raw ? this.data.aroma_raw : null,
      images: this.data.images,
      user_profile: storage.getTasteProfile()
    };

    this.setData({ submitting: true });
    request({
      url: '/ratings',
      method: 'POST',
      data: payload
    })
      .then(() => {
        storage.pushRecentReviewed({
          id: this.data.liquor_id,
          name: this.data.liquor_name,
          brand: '',
          price_min: '',
          price_max: ''
        });

        wx.showToast({ title: this.data.i18n.success, icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/detail/index?id=${this.data.liquor_id}`
          });
        }, 300);
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  }
});
