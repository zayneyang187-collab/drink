const { request } = require('../../utils/request');
const storage = require('../../utils/storage');

const SCENE_LABELS = {
  gift: '\u9001\u793c',
  party: '\u805a\u4f1a',
  self: '\u81ea\u996e',
  newbie: '\u5165\u95e8'
};
const UNKNOWN_SCENE_LABEL = '\u672a\u77e5\u573a\u666f';

Page({
  data: {
    i18n: {
      title: '\u6211\u7684\u4e3b\u9875',
      userId: '\u7528\u6237ID',
      tasteTitle: '\u53e3\u5473\u6863\u6848',
      prefSmooth: '\u504f\u597d\u987a\u53e3',
      prefSoft: '\u504f\u597d\u67d4\u548c',
      prefAroma: '\u504f\u597d\u9999\u6c14',
      badgeTitle: '\u5fbd\u7ae0',
      earned: '\u5df2\u89e3\u9501',
      notEarned: '\u672a\u89e3\u9501',
      myRatings: '\u6211\u7684\u8bc4\u5206',
      noRatings: '\u6682\u65e0\u8bc4\u5206\u8bb0\u5f55',
      scoreUnit: '\u5206',
      rerate: '\u518d\u8bc4',
      favorites: '\u6536\u85cf\u5217\u8868',
      noFavorites: '\u6682\u65e0\u6536\u85cf',
      cancelFav: '\u53d6\u6d88',
      history: '\u6d4f\u89c8\u5386\u53f2',
      noHistory: '\u6682\u65e0\u6d4f\u89c8\u8bb0\u5f55'
    },
    userId: '',
    ratings: [],
    favorites: [],
    history: [],
    tasteProfile: {
      pref_smooth: false,
      pref_soft: false,
      pref_aroma: false
    },
    badges: []
  },

  onLoad() {
    this.setData({
      userId: storage.getUserId(),
      tasteProfile: storage.getTasteProfile()
    });
  },

  onShow() {
    this.loadAll();
  },

  loadAll() {
    const userId = storage.getUserId();
    const history = storage.getBrowseHistory();

    Promise.all([
      request({ url: `/me/ratings?user_id=${encodeURIComponent(userId)}` }).catch(() => []),
      request({ url: `/me/favorites?user_id=${encodeURIComponent(userId)}` }).catch(() => [])
    ]).then(([ratings, favorites]) => {
      const ratingList = Array.isArray(ratings)
        ? ratings.map((item) => ({
            id: item.id,
            liquor_id: item.liquor_id,
            liquor_name: item.liquor_name,
            score_overall: Number(item.score_overall || 0),
            scene: item.scene,
            scene_label: SCENE_LABELS[item.scene] || UNKNOWN_SCENE_LABEL,
            created_at: item.created_at,
            created_at_text: formatTime(item.created_at)
          }))
        : [];

      const favoriteList = Array.isArray(favorites) ? favorites : [];
      const historyList = Array.isArray(history)
        ? history.map((item) => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            viewed_at: item.viewed_at,
            viewed_at_text: formatTime(item.viewed_at)
          }))
        : [];

      const badgeState = buildBadges(ratingList.length);
      storage.setBadgeState({
        earned: badgeState.filter((x) => x.earned).map((x) => x.key)
      });

      this.setData({
        userId,
        ratings: ratingList,
        favorites: favoriteList,
        history: historyList,
        badges: badgeState,
        tasteProfile: storage.getTasteProfile()
      });
    });
  },

  onProfileSwitch(e) {
    const key = e.currentTarget.dataset.key;
    const value = Boolean(e.detail.value);

    const next = Object.assign({}, this.data.tasteProfile, {
      [key]: value
    });

    storage.setTasteProfile(next);
    this.setData({ tasteProfile: next });
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
  },

  removeFavorite(e) {
    const liquorId = e.currentTarget.dataset.id;
    if (!liquorId) {
      return;
    }

    request({
      url: '/me/favorites',
      method: 'POST',
      data: {
        user_id: this.data.userId,
        liquor_id: liquorId,
        action: 'remove'
      }
    }).then(() => this.loadAll());
  }
});

function buildBadges(ratingCount) {
  const count = Number(ratingCount || 0);
  return [
    {
      key: 'badge_3',
      title: '\u65b0\u624b\u54c1\u9274\u5b98',
      condition: '\u8bc4\u5206\u8fbe\u5230 3 \u6761',
      earned: count >= 3
    },
    {
      key: 'badge_10',
      title: '\u7a33\u5b9a\u8bc4\u59d4',
      condition: '\u8bc4\u5206\u8fbe\u5230 10 \u6761',
      earned: count >= 10
    },
    {
      key: 'badge_30',
      title: '\u98ce\u5473\u4fa6\u63a2',
      condition: '\u8bc4\u5206\u8fbe\u5230 30 \u6761',
      earned: count >= 30
    }
  ];
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
