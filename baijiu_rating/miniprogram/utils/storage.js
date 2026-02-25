const KEY_USER_ID = 'baijiu_user_id';
const KEY_TASTE_PROFILE = 'baijiu_taste_profile';
const KEY_FAVORITES = 'baijiu_local_favorites';
const KEY_HISTORY = 'baijiu_browse_history';
const KEY_BADGES = 'baijiu_badges';
const KEY_RECENT_REVIEWED = 'baijiu_recent_reviewed';

function getUserId() {
  let userId = wx.getStorageSync(KEY_USER_ID);
  if (!userId) {
    userId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    wx.setStorageSync(KEY_USER_ID, userId);
  }
  return userId;
}

function getTasteProfile() {
  const profile = wx.getStorageSync(KEY_TASTE_PROFILE);
  if (profile && typeof profile === 'object') {
    return profile;
  }

  const defaultProfile = {
    pref_smooth: false,
    pref_soft: false,
    pref_aroma: false
  };

  wx.setStorageSync(KEY_TASTE_PROFILE, defaultProfile);
  return defaultProfile;
}

function setTasteProfile(next) {
  const profile = Object.assign(
    {
      pref_smooth: false,
      pref_soft: false,
      pref_aroma: false
    },
    next || {}
  );
  wx.setStorageSync(KEY_TASTE_PROFILE, profile);
  return profile;
}

function getLocalFavorites() {
  const list = wx.getStorageSync(KEY_FAVORITES);
  return Array.isArray(list) ? list : [];
}

function setLocalFavorites(list) {
  const normalized = Array.isArray(list) ? list : [];
  wx.setStorageSync(KEY_FAVORITES, normalized);
  return normalized;
}

function pushBrowseHistory(item) {
  if (!item || !item.id) {
    return getBrowseHistory();
  }

  const list = getBrowseHistory().filter((x) => x.id !== item.id);
  list.unshift(Object.assign({ viewed_at: new Date().toISOString() }, item));
  const trimmed = list.slice(0, 50);
  wx.setStorageSync(KEY_HISTORY, trimmed);
  return trimmed;
}

function getBrowseHistory() {
  const list = wx.getStorageSync(KEY_HISTORY);
  return Array.isArray(list) ? list : [];
}

function getBadgeState() {
  const badges = wx.getStorageSync(KEY_BADGES);
  return badges && typeof badges === 'object' ? badges : {};
}

function setBadgeState(state) {
  const next = Object.assign({}, state || {});
  wx.setStorageSync(KEY_BADGES, next);
  return next;
}

function getRecentReviewed() {
  const list = wx.getStorageSync(KEY_RECENT_REVIEWED);
  return Array.isArray(list) ? list : [];
}

function pushRecentReviewed(liquor) {
  if (!liquor || !liquor.id) {
    return getRecentReviewed();
  }

  const list = getRecentReviewed().filter((item) => item.id !== liquor.id);
  list.unshift({
    id: liquor.id,
    name: liquor.name,
    brand: liquor.brand,
    price_min: liquor.price_min,
    price_max: liquor.price_max,
    reviewed_at: new Date().toISOString()
  });

  const trimmed = list.slice(0, 20);
  wx.setStorageSync(KEY_RECENT_REVIEWED, trimmed);
  return trimmed;
}

module.exports = {
  getUserId,
  getTasteProfile,
  setTasteProfile,
  getLocalFavorites,
  setLocalFavorites,
  pushBrowseHistory,
  getBrowseHistory,
  getBadgeState,
  setBadgeState,
  getRecentReviewed,
  pushRecentReviewed
};