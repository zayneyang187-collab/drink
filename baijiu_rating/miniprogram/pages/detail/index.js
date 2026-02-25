const { request } = require('../../utils/request');
const storage = require('../../utils/storage');

const SCENE_LABELS = {
  gift: '\u9001\u793c',
  party: '\u805a\u4f1a',
  self: '\u81ea\u996e',
  newbie: '\u5165\u95e8'
};
const UNKNOWN_SCENE_LABEL = '\u672a\u77e5\u573a\u666f';

const DIMENSION_LABELS = {
  overall: '\u7efc\u5408\u53e3\u611f',
  smooth: '\u987a\u53e3\u5ea6',
  softness: '\u67d4\u548c\u5ea6',
  aroma_like: '\u9999\u6c14\u559c\u597d',
  value: '\u6027\u4ef7\u6bd4',
  gift_face: '\u4f53\u9762\u5ea6'
};

Page({
  data: {
    i18n: {
      favorite: '\u6536\u85cf',
      unfavorite: '\u53d6\u6d88\u6536\u85cf',
      aroma: '\u9999\u578b',
      unknownAroma: '\u5f85\u786e\u8ba4',
      rawAroma: '\u7528\u6237\u9999\u578b\u8bcd',
      totalRatings: '\u603b\u8bc4\u5206\u6570',
      goRate: '\u53bb\u8bc4\u5206',
      copyText: '\u590d\u5236\u63a8\u8350\u8bdd\u672f',
      share: '\u5206\u4eab\u6b64\u9152',
      sceneScores: '\u5206\u573a\u666f\u5f97\u5206',
      noSceneScore: '\u6682\u65e0\u573a\u666f\u8bc4\u5206\u6570\u636e',
      dimensionAvg: '\u7ef4\u5ea6\u5747\u5206',
      latestReviews: '\u6700\u65b0\u8bc4\u8bba',
      noComment: '\u6682\u65e0\u8bc4\u8bba',
      noShortReview: '\uff08\u672a\u586b\u5199\u77ed\u8bc4\uff09',
      favorited: '\u5df2\u6536\u85cf',
      unfavorited: '\u5df2\u53d6\u6d88\u6536\u85cf'
    },
    id: '',
    userId: '',
    liquor: null,
    scene_scores: {},
    dimension_avgs_by_scene: {},
    latest_reviews: [],
    copywriting: {},
    stats: {},
    is_favorite: false,
    visibleSceneScores: [],
    dimensionCards: []
  },

  onLoad(options) {
    this.setData({
      id: options.id || '',
      userId: storage.getUserId()
    });
  },

  onShow() {
    if (!this.data.id) {
      return;
    }
    this.fetchDetail();
  },

  fetchDetail() {
    return request({
      url: `/liquors/${encodeURIComponent(this.data.id)}?user_id=${encodeURIComponent(this.data.userId)}`
    }).then((data) => {
      const sceneScores = data.scene_scores || {};
      const dimensionMap = data.dimension_avgs_by_scene || {};

      const visibleSceneScores = Object.keys(sceneScores)
        .map((scene) => {
          const item = sceneScores[scene] || {};
          return {
            scene,
            scene_label: SCENE_LABELS[scene] || UNKNOWN_SCENE_LABEL,
            v: Number(item.v || 0),
            bayes_score_scene: formatScore(item.bayes_score_scene),
            std: formatScore(item.std)
          };
        })
        .filter((item) => item.v > 0);

      const dimensionCards = Object.keys(dimensionMap).map((scene) => ({
        scene,
        scene_label: SCENE_LABELS[scene] || UNKNOWN_SCENE_LABEL,
        rows: buildDimensionRows(dimensionMap[scene], scene)
      }));

      const reviews = Array.isArray(data.latest_reviews)
        ? data.latest_reviews.map((item) => ({
            user_id: item.user_id,
            scene: item.scene,
            scene_label: SCENE_LABELS[item.scene] || UNKNOWN_SCENE_LABEL,
            score_overall: formatScore(item.score_overall),
            review_text: item.review_text,
            created_at: item.created_at,
            created_at_text: formatTime(item.created_at)
          }))
        : [];

      const liquor = data.liquor || {};
      liquor.aroma_raw_top_text = normalizeAromaRawTop(liquor.aroma_raw_top);

      storage.pushBrowseHistory({
        id: liquor.id,
        name: liquor.name,
        brand: liquor.brand,
        price_min: liquor.price_min,
        price_max: liquor.price_max
      });

      this.setData({
        liquor,
        scene_scores: sceneScores,
        dimension_avgs_by_scene: dimensionMap,
        latest_reviews: reviews,
        copywriting: data.copywriting || {},
        stats: data.stats || {},
        is_favorite: Boolean(data.is_favorite),
        visibleSceneScores,
        dimensionCards
      });
    });
  },

  goRate() {
    wx.navigateTo({ url: `/pages/rate/index?liquor_id=${this.data.id}` });
  },

  copyRecommendation() {
    const firstScene = this.data.visibleSceneScores.length ? this.data.visibleSceneScores[0].scene : 'self';
    const liquorName = (this.data.liquor && this.data.liquor.name) || '\u8fd9\u6b3e\u9152';
    const fallback = `${liquorName}\u503c\u5f97\u4e00\u8bd5\uff0c\u53e3\u5473\u4e0d\u9519\u3002`;
    const text = this.data.copywriting[firstScene] || fallback;
    wx.setClipboardData({ data: text });
  },

  toggleFavorite() {
    const action = this.data.is_favorite ? 'remove' : 'add';
    request({
      url: '/me/favorites',
      method: 'POST',
      data: {
        user_id: this.data.userId,
        liquor_id: this.data.id,
        action
      }
    }).then(() => {
      this.setData({ is_favorite: !this.data.is_favorite });
      wx.showToast({
        title: action === 'add' ? this.data.i18n.favorited : this.data.i18n.unfavorited,
        icon: 'none'
      });
    });
  },

  onShareAppMessage() {
    const liquor = this.data.liquor || {};
    return {
      title: `${liquor.name || '\u767d\u9152'}\u8bc4\u5206\u8be6\u60c5`,
      path: `/pages/detail/index?id=${this.data.id}`
    };
  }
});

function buildDimensionRows(dimensions, scene) {
  const data = dimensions || {};
  const keys = ['overall', 'smooth', 'softness', 'aroma_like', 'value'];
  if (scene === 'gift') {
    keys.push('gift_face');
  }

  return keys.map((key) => ({
    key,
    label: DIMENSION_LABELS[key] || key,
    value: formatScore(data[key])
  }));
}

function normalizeAromaRawTop(rawTop) {
  let list = rawTop;
  if (typeof list === 'string') {
    try {
      const parsed = JSON.parse(list);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } catch (err) {
      list = [];
    }
  }

  return Array.isArray(list) ? list.filter(Boolean).slice(0, 3).join(' / ') : '';
}

function formatScore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '5.0';
  }
  return num.toFixed(1);
}

function formatTime(value) {
  if (!value) {
    return '';
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
