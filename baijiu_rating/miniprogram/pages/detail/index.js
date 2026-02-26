const { request } = require('../../utils/request');
const storage = require('../../utils/storage');

const DEFAULT_SCENE = 'party';
const SCENE_TABS = [
  { value: 'gift', label: '\u9001\u793c' },
  { value: 'party', label: '\u805a\u4f1a' },
  { value: 'self', label: '\u81ea\u996e' },
  { value: 'newbie', label: '\u5165\u95e8' }
];

const SCENE_LABEL_MAP = SCENE_TABS.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

const DIMENSION_META = [
  { key: 'smooth', label: '\u987a\u53e3\u5ea6', icon: '\u25cf' },
  { key: 'softness', label: '\u67d4\u548c\u5ea6', icon: '\u25cf' },
  { key: 'aroma_like', label: '\u9999\u6c14\u559c\u597d', icon: '\u25cf' },
  { key: 'value', label: '\u6027\u4ef7\u6bd4', icon: '\u25cf' },
  { key: 'gift_face', label: '\u4f53\u9762\u5ea6', icon: '\u25cf', giftOnly: true }
];

const AROMA_DISPLAY_MAP = {
  '\u9171\u9999': '\u9171\u9999',
  maoxiang: '\u9171\u9999',
  jiangxiang: '\u9171\u9999',
  '\u6d53\u9999': '\u6d53\u9999',
  luxiang: '\u6d53\u9999',
  nongxiang: '\u6d53\u9999',
  '\u6e05\u9999': '\u6e05\u9999',
  fenxiang: '\u6e05\u9999',
  qingxiang: '\u6e05\u9999',
  '\u7c73\u9999': '\u7c73\u9999',
  mixiang: '\u7c73\u9999',
  '\u517c\u9999': '\u517c\u9999',
  jianxiang: '\u517c\u9999',
  '\u5176\u4ed6': '\u5176\u4ed6',
  '\u5f85\u786e\u8ba4': '\u5f85\u786e\u8ba4'
};

Page({
  data: {
    i18n: {
      detailTitle: '\u9152\u54c1\u8be6\u60c5',
      favIconOn: '\u2665',
      favIconOff: '\u2661',
      shareIcon: '\u2197',
      favoriteAdded: '\u5df2\u6536\u85cf',
      favoriteRemoved: '\u5df2\u53d6\u6d88\u6536\u85cf',
      noImage: '\u65e0\u56fe\u7247',
      scoreCardTitle: '\u573a\u666f\u8bc4\u5206',
      scoreUnit: '\u5206',
      ratedCount: '\u5df2\u6709\u8bc4\u5206',
      peopleUnit: '\u4eba',
      sampleLow: '\u6837\u672c\u8f83\u5c11',
      sampleGrowing: '\u6301\u7eed\u66f4\u65b0\u4e2d',
      stableHint: '\u8bc4\u4ef7\u7a33\u5b9a',
      reasonTitle: '\u63a8\u8350\u7406\u7531',
      actionTitle: '\u73b0\u5728\u52a8\u624b',
      goRate: '\u53bb\u8bc4\u5206',
      copyText: '\u590d\u5236\u63a8\u8350\u8bdd\u672f',
      shareLiquor: '\u5206\u4eab\u6b64\u9152',
      copySuccess: '\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f',
      portraitTitle: '\u53e3\u611f\u753b\u50cf',
      noData: '\u6682\u65e0\u6570\u636e',
      audienceTitle: '\u9002\u5408\u8c01',
      reviewsTitle: '\u5927\u5bb6\u600e\u4e48\u8bf4',
      noReviewText: '\uff08\u65e0\u6587\u5b57\u8bc4\u4ef7\uff09',
      viewAll: '\u67e5\u770b\u5168\u90e8',
      viewAllTodo: '\u5f00\u53d1\u4e2d\uff0c\u656c\u8bf7\u671f\u5f85',
      ctaScore: '\u5f53\u524d\u573a\u666f\u5f97\u5206',
      aromaPending: '\u5f85\u786e\u8ba4\u9999\u578b',
      unknownScene: '\u672a\u77e5\u573a\u666f',
      reasonStable: '\u8bc4\u4ef7\u7a33\u5b9a\uff1a\u591a\u4eba\u8bc4\u5206\u66f4\u4e00\u81f4',
      reasonMany: '\u4eba\u6570\u8f83\u591a\uff1a\u8be5\u573a\u666f\u66f4\u7a33\u59a5',
      reasonGrowing: '\u5df2\u6709\u771f\u5b9e\u8bc4\u5206\uff1a\u6301\u7eed\u5b8c\u5584\u4e2d',
      reasonNeedMore: '\u5f53\u524d\u6837\u672c\u8f83\u5c11\uff1a\u6b22\u8fce\u8865\u5145\u8bc4\u5206',
      reasonSmooth: '\u66f4\u987a\u53e3\uff1a\u5165\u53e3\u66f4\u8212\u670d',
      reasonSoft: '\u66f4\u67d4\u548c\uff1a\u4e0d\u5bb9\u6613\u523a\u6fc0',
      reasonValue: '\u6027\u4ef7\u6bd4\u9ad8\uff1a\u540c\u4ef7\u4f4d\u66f4\u503c',
      reasonGift: '\u66f4\u4f53\u9762\uff1a\u9002\u5408\u9001\u793c',
      reasonBalanced: '\u53e3\u611f\u8868\u73b0\u66f4\u5747\u8861',
      reasonBudget: '\u672c\u4ef7\u4f4d\u66f4\u7a33\u59a5',
      tagMostAccept: '\u591a\u6570\u4eba\u80fd\u63a5\u53d7',
      tagStable: '\u8bc4\u4ef7\u7a33\u5b9a',
      tagManySamples: '\u8bc4\u4ef7\u6837\u672c\u8f83\u591a',
      tagRealRatings: '\u6709\u771f\u5b9e\u8bc4\u5206',
      tagNeedMore: '\u7b49\u5f85\u66f4\u591a\u8bc4\u4ef7',
      tagSmooth: '\u66f4\u987a\u53e3',
      tagSoft: '\u8f83\u67d4\u548c',
      tagAroma: '\u9999\u6c14\u8ba8\u559c',
      tagValue: '\u6027\u4ef7\u6bd4\u9ad8',
      tagGift: '\u9001\u793c\u66f4\u4f53\u9762',
      tagNewbie: '\u5165\u95e8\u53cb\u597d',
      tagSafePrice: '\u672c\u4ef7\u4f4d\u66f4\u7a33\u59a5',
      tagYoung: '\u5e74\u8f7b\u4eba\u53cb\u597d',
      reviewFootnote: '\u4ec5\u5c55\u793a\u6700\u65b0 3 \u6761\u77ed\u8bc4'
    },
    id: '',
    userId: '',
    queryScene: '',
    loading: true,
    liquor: null,
    heroImage: '',
    heroTags: [],
    sceneTabs: SCENE_TABS,
    sceneScoreMap: {},
    dimensionMap: {},
    reasonsByScene: {},
    copywriting: {},
    reviews: [],
    isFavorite: false,
    selectedScene: DEFAULT_SCENE,
    selectedSceneLabel: SCENE_LABEL_MAP[DEFAULT_SCENE],
    selectedStat: {
      v: 0,
      std: null,
      score: null
    },
    selectedScore: '--',
    emotionalText: '',
    stabilityText: '',
    reasons: [],
    metricRows: [],
    audienceTags: []
  },

  onLoad(options) {
    const scene = options && options.scene ? String(options.scene) : '';
    wx.setNavigationBarTitle({
      title: '\u9152\u54c1\u8be6\u60c5'
    });
    this.setData({
      id: options && options.id ? String(options.id) : '',
      queryScene: scene,
      userId: storage.getUserId()
    });
  },

  onShow() {
    if (!this.data.id) {
      return;
    }
    this.fetchDetail();
  },

  onPullDownRefresh() {
    this.fetchDetail().finally(() => wx.stopPullDownRefresh());
  },

  fetchDetail() {
    this.setData({ loading: true });
    return request({
      url: `/liquors/${encodeURIComponent(this.data.id)}?user_id=${encodeURIComponent(this.data.userId)}`
    })
      .then((data) => {
        const liquor = normalizeLiquor(data.liquor || {});
        const sceneScoreMap = normalizeSceneScores(data.scene_scores || {});
        const dimensionMap = normalizeDimensionMap(data.dimension_avgs_by_scene || {});
        const reasonsByScene = normalizeReasonsByScene(data.reasons_by_scene || {});
        const reviews = normalizeReviews(data.latest_reviews || [], this.data.i18n);
        const copywriting = normalizeCopywriting(data.copywriting || {});
        const selectedScene = resolveSelectedScene(this.data.queryScene, sceneScoreMap);

        const heroTags = buildHeroTags(liquor, this.data.i18n);
        const heroImage = Array.isArray(liquor.images) && liquor.images.length ? liquor.images[0] : '';

        if (liquor.id) {
          storage.pushBrowseHistory({
            id: liquor.id,
            name: liquor.name,
            brand: liquor.brand,
            price_min: liquor.price_min,
            price_max: liquor.price_max
          });
        }

        this.setData(
          {
            loading: false,
            liquor,
            heroTags,
            heroImage,
            sceneScoreMap,
            dimensionMap,
            reasonsByScene,
            copywriting,
            reviews,
            isFavorite: Boolean(data.is_favorite),
            selectedScene,
            selectedSceneLabel: getSceneLabel(selectedScene, this.data.i18n)
          },
          () => {
            this.updateSceneView(selectedScene);
          }
        );
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  switchScene(e) {
    const scene = e.currentTarget.dataset.scene;
    if (!scene || scene === this.data.selectedScene) {
      return;
    }
    this.updateSceneView(scene);
  },

  updateSceneView(scene) {
    const stat = this.data.sceneScoreMap[scene] || createEmptySceneStat();
    const dims = this.data.dimensionMap[scene] || createEmptyDimension();
    const backendReasons = this.data.reasonsByScene[scene] || [];
    const reasons = backendReasons.length ? backendReasons.slice(0, 3) : buildReasons(scene, stat, dims, this.data.i18n);
    const metricRows = buildMetricRows(scene, dims);
    const audienceTags = buildAudienceTags(scene, stat, dims, this.data.i18n);

    this.setData({
      selectedScene: scene,
      selectedSceneLabel: getSceneLabel(scene, this.data.i18n),
      selectedStat: stat,
      selectedScore: formatDisplay(stat.score),
      emotionalText: getEmotionalText(stat.score),
      stabilityText: buildStabilityText(stat),
      reasons,
      metricRows,
      audienceTags
    });
  },

  goRate() {
    wx.navigateTo({
      url: `/pages/rate/index?liquor_id=${encodeURIComponent(this.data.id)}&scene=${encodeURIComponent(this.data.selectedScene)}`
    });
  },

  copyRecommendation() {
    const selectedScene = this.data.selectedScene;
    const directCopy = this.data.copywriting[selectedScene];
    let text = typeof directCopy === 'string' ? directCopy.trim() : '';

    if (!text) {
      const liquorName = (this.data.liquor && this.data.liquor.name) || this.data.i18n.detailTitle;
      const sceneLabel = this.data.selectedSceneLabel || getSceneLabel(selectedScene, this.data.i18n);
      const reasonText = (this.data.reasons || []).slice(0, 2).join('\uff0c');
      text = `${liquorName}\u5728${sceneLabel}\u573a\u666f${reasonText ? `\uff0c${reasonText}` : '\u8868\u73b0\u4e0d\u9519'}\u3002`;
    }

    wx.setClipboardData({ data: text });
    wx.showToast({ title: this.data.i18n.copySuccess, icon: 'none' });
  },

  toggleFavorite() {
    if (!this.data.id) {
      return;
    }

    const action = this.data.isFavorite ? 'remove' : 'add';
    request({
      url: '/me/favorites',
      method: 'POST',
      data: {
        user_id: this.data.userId,
        liquor_id: this.data.id,
        action
      }
    }).then(() => {
      this.setData({ isFavorite: !this.data.isFavorite });
      wx.showToast({
        title: action === 'add' ? this.data.i18n.favoriteAdded : this.data.i18n.favoriteRemoved,
        icon: 'none'
      });
    });
  },

  onViewAllReviews() {
    wx.showToast({ title: this.data.i18n.viewAllTodo, icon: 'none' });
  },

  onShareAppMessage() {
    const liquorName = (this.data.liquor && this.data.liquor.name) || '\u767d\u9152';
    const score = this.data.selectedScore || '--';
    return {
      title: `${liquorName}\uff08${score}\u5206\uff09`,
      path: `/pages/detail/index?id=${encodeURIComponent(this.data.id)}`
    };
  }
});

function normalizeLiquor(raw) {
  const images = parseArrayLike(raw.images);
  const aromaRawTop = parseArrayLike(raw.aroma_raw_top);

  return {
    id: raw.id || '',
    name: raw.name || '',
    brand: raw.brand || '--',
    price_min: toNumber(raw.price_min),
    price_max: toNumber(raw.price_max),
    priceRange: formatPriceRange(raw.price_min, raw.price_max),
    images,
    aroma_std: raw.aroma_std || '',
    aroma_raw_top: aromaRawTop
  };
}

function normalizeSceneScores(raw) {
  const map = {};

  SCENE_TABS.forEach((scene) => {
    const item = raw && raw[scene.value] ? raw[scene.value] : {};
    map[scene.value] = {
      scene: scene.value,
      v: Math.max(0, parseInt(item.v, 10) || 0),
      std: toNumber(item.std),
      score: toNumber(item.bayes_score_scene),
      R: toNumber(item.R),
      C: toNumber(item.C)
    };
  });

  return map;
}

function normalizeDimensionMap(raw) {
  const map = {};

  SCENE_TABS.forEach((scene) => {
    const item = raw && raw[scene.value] ? raw[scene.value] : {};
    map[scene.value] = {
      overall: toNumber(item.overall),
      smooth: toNumber(item.smooth),
      softness: toNumber(item.softness),
      aroma_like: toNumber(item.aroma_like),
      value: toNumber(item.value),
      gift_face: toNumber(item.gift_face)
    };
  });

  return map;
}

function normalizeReasonsByScene(raw) {
  const map = {};
  SCENE_TABS.forEach((scene) => {
    const list = raw && raw[scene.value] ? raw[scene.value] : [];
    map[scene.value] = Array.isArray(list)
      ? list
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .slice(0, 3)
      : [];
  });
  return map;
}

function normalizeCopywriting(raw) {
  const map = {};
  SCENE_TABS.forEach((scene) => {
    const text = raw && raw[scene.value] ? String(raw[scene.value]).trim() : '';
    map[scene.value] = text;
  });
  return map;
}

function normalizeReviews(rawList, i18n) {
  const list = Array.isArray(rawList) ? rawList.slice() : [];
  list.sort((a, b) => {
    const ta = new Date(a && a.created_at ? a.created_at : 0).getTime();
    const tb = new Date(b && b.created_at ? b.created_at : 0).getTime();
    return tb - ta;
  });

  return list.slice(0, 3).map((item) => ({
    scene: item.scene || '',
    sceneLabel: getSceneLabel(item.scene, i18n),
    scoreText: formatDisplay(item.score_overall),
    reviewText: String(item.review_text || '').trim() || i18n.noReviewText,
    timeText: formatTime(item.created_at)
  }));
}

function resolveSelectedScene(queryScene, sceneScoreMap) {
  if (SCENE_LABEL_MAP[queryScene]) {
    return queryScene;
  }

  let picked = '';
  let maxScore = -Infinity;

  SCENE_TABS.forEach((scene) => {
    const stat = sceneScoreMap[scene.value];
    if (!stat || stat.score === null) {
      return;
    }
    if (stat.score > maxScore) {
      maxScore = stat.score;
      picked = scene.value;
    }
  });

  return picked || DEFAULT_SCENE;
}

function buildHeroTags(liquor, i18n) {
  const tags = [];

  if (liquor.aroma_std) {
    const normalizedStd = normalizeAromaDisplayTag(liquor.aroma_std);
    if (normalizedStd) {
      tags.push(normalizedStd);
    }
  }

  if (Array.isArray(liquor.aroma_raw_top)) {
    liquor.aroma_raw_top.slice(0, 3).forEach((item) => {
      const text = normalizeAromaDisplayTag(item);
      if (text) {
        tags.push(text);
      }
    });
  }

  if (!tags.length) {
    tags.push(i18n.aromaPending);
  }

  return dedupe(tags).slice(0, 4);
}

function buildStabilityText(stat) {
  const v = Math.max(0, parseInt(stat && stat.v, 10) || 0);
  const std = toNumber(stat && stat.std);

  if (v >= 20 && std !== null && std <= 1.5) {
    return `${v} \u4eba\u8bc4\u5206 \u00b7 \u8bc4\u4ef7\u7a33\u5b9a`;
  }
  if (v >= 10) {
    return `${v} \u4eba\u8bc4\u5206 \u00b7 \u6837\u672c\u8f83\u591a`;
  }
  if (v > 0) {
    return `${v} \u4eba\u8bc4\u5206 \u00b7 \u6301\u7eed\u5b8c\u5584\u4e2d`;
  }
  return '\u6682\u65e0\u8bc4\u5206\u6570\u636e';
}

function getEmotionalText(score) {
  const roundedScore = normalizeScoreForEmotion(score);

  if (roundedScore === null) {
    return '\u6682\u65e0\u8db3\u591f\u8bc4\u5206\uff0c\u6b22\u8fce\u8865\u5145\u7b2c\u4e00\u6761\u8bc4\u4ef7';
  }
  if (roundedScore >= 8.8) {
    return '\ud83d\udd25 \u653e\u5fc3\u4e0a\u684c\uff0c\u57fa\u672c\u4e0d\u7ffb\u8f66';
  }
  if (roundedScore >= 8.2) {
    return '\ud83d\udc4d \u7a33\u59a5\u9009\u62e9\uff0c\u9002\u5408\u5927\u591a\u6570\u4eba';
  }
  if (roundedScore >= 7.5) {
    return '\ud83d\ude42 \u53e3\u7891\u4e0d\u9519\uff0c\u770b\u4e2a\u4eba\u504f\u597d';
  }
  if (roundedScore >= 6.8) {
    return '\ud83e\udd14 \u504f\u5c0f\u4f17\uff0c\u5efa\u8bae\u5148\u770b\u77ed\u8bc4';
  }
  return '\u26a0\ufe0f \u8bc4\u4ef7\u4e00\u822c\uff0c\u614e\u91cd\u9009\u62e9';
}

function normalizeScoreForEmotion(score) {
  if (score === null || score === undefined || score === '--') {
    return null;
  }

  const num = Number(score);
  if (!Number.isFinite(num)) {
    return null;
  }

  return Number(num.toFixed(1));
}

function buildReasons(scene, stat, dims, i18n) {
  const reasons = [];

  if (stat.v >= 20 && stat.std !== null && stat.std <= 1.5) {
    reasons.push(i18n.reasonStable);
  } else if (stat.v >= 10) {
    reasons.push(i18n.reasonMany);
  } else if (stat.v > 0) {
    reasons.push(i18n.reasonGrowing);
  } else {
    reasons.push(i18n.reasonNeedMore);
  }

  const dimCandidates = [
    { key: 'smooth', score: dims.smooth, text: i18n.reasonSmooth },
    { key: 'softness', score: dims.softness, text: i18n.reasonSoft },
    { key: 'value', score: dims.value, text: i18n.reasonValue }
  ];

  if (scene === 'gift') {
    dimCandidates.push({ key: 'gift_face', score: dims.gift_face, text: i18n.reasonGift });
  }

  dimCandidates
    .filter((item) => item.score !== null && item.score >= 7.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .forEach((item) => {
      reasons.push(item.text);
    });

  if (reasons.length < 2) {
    const fallbackDim = dimCandidates
      .filter((item) => item.score !== null)
      .sort((a, b) => b.score - a.score)[0];

    if (fallbackDim && fallbackDim.score >= 6.5) {
      reasons.push(i18n.reasonBalanced);
    }
  }

  if (reasons.length < 3) {
    reasons.push(i18n.reasonBudget);
  }

  return dedupe(reasons).slice(0, 3);
}

function buildMetricRows(scene, dims) {
  return DIMENSION_META.filter((meta) => !(meta.giftOnly && scene !== 'gift')).map((meta) => {
    const value = dims[meta.key];
    const hasData = value !== null;
    const percent = hasData ? Math.max(0, Math.min(100, Math.round((value / 10) * 100))) : 0;

    return {
      key: meta.key,
      icon: meta.icon,
      label: meta.label,
      valueText: formatDisplay(value),
      percent,
      noData: !hasData
    };
  });
}

function buildAudienceTags(scene, stat, dims, i18n) {
  const tags = [];

  if (stat.v >= 20 && stat.std !== null && stat.std <= 1.5) {
    tags.push(i18n.tagMostAccept, i18n.tagStable);
  } else if (stat.v >= 10) {
    tags.push(i18n.tagManySamples);
  } else if (stat.v > 0) {
    tags.push(i18n.tagRealRatings);
  } else {
    tags.push(i18n.tagNeedMore);
  }

  if (dims.smooth !== null && dims.smooth >= 7.5) {
    tags.push(i18n.tagSmooth);
  }
  if (dims.softness !== null && dims.softness >= 7.5) {
    tags.push(i18n.tagSoft);
  }
  if (dims.aroma_like !== null && dims.aroma_like >= 7.5) {
    tags.push(i18n.tagAroma);
  }
  if (dims.value !== null && dims.value >= 7.5) {
    tags.push(i18n.tagValue);
  }
  if (scene === 'gift' && dims.gift_face !== null && dims.gift_face >= 7.5) {
    tags.push(i18n.tagGift);
  }
  if (scene === 'newbie') {
    tags.push(i18n.tagNewbie);
  }

  if (tags.length < 3) {
    tags.push(i18n.tagSafePrice);
  }
  if (tags.length < 3) {
    tags.push(i18n.tagYoung);
  }

  return dedupe(tags).slice(0, 6);
}

function getSceneLabel(scene, i18n) {
  return SCENE_LABEL_MAP[scene] || i18n.unknownScene;
}

function createEmptySceneStat() {
  return {
    v: 0,
    std: null,
    score: null,
    R: null,
    C: null
  };
}

function createEmptyDimension() {
  return {
    overall: null,
    smooth: null,
    softness: null,
    aroma_like: null,
    value: null,
    gift_face: null
  };
}

function parseArrayLike(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) {
      return [];
    }
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (err) {
      return [];
    }
  }

  return [];
}

function formatPriceRange(min, max) {
  const minNum = toNumber(min);
  const maxNum = toNumber(max);

  if (minNum === null && maxNum === null) {
    return '--';
  }

  if (minNum !== null && maxNum !== null) {
    return `${Math.round(minNum)}-${Math.round(maxNum)}`;
  }

  return `${Math.round(minNum !== null ? minNum : maxNum)}`;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function formatDisplay(value) {
  const num = toNumber(value);
  return num === null ? '--' : num.toFixed(1);
}

function formatTime(value) {
  if (!value) {
    return '--';
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

function dedupe(list) {
  return Array.from(new Set(Array.isArray(list) ? list : []));
}

function normalizeAromaDisplayTag(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  const lower = text.toLowerCase();
  if (AROMA_DISPLAY_MAP[lower]) {
    return AROMA_DISPLAY_MAP[lower];
  }

  if (AROMA_DISPLAY_MAP[text]) {
    return AROMA_DISPLAY_MAP[text];
  }

  if (/^[a-z0-9_-]+$/i.test(text)) {
    return '';
  }

  return text;
}
