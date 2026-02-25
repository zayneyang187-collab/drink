const { db } = require('../db/sqlite');
const reasonService = require('./reasonService');

const SCENES = ['gift', 'party', 'self', 'newbie'];
const PREF_KEYS = ['smooth', 'soft', 'aroma', 'durable', 'value'];
const BAYES_M = 30;

function parsePrefs(input) {
  let raw = [];
  if (Array.isArray(input)) {
    raw = input;
  } else if (typeof input === 'string') {
    raw = input.split(',');
  }

  const clean = [];
  raw.forEach((item) => {
    const key = String(item || '').trim();
    if (!key) {
      return;
    }
    if (!PREF_KEYS.includes(key)) {
      return;
    }
    if (!clean.includes(key)) {
      clean.push(key);
    }
  });

  return clean.slice(0, 2);
}

function round1(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Number((Math.round(n * 10) / 10).toFixed(1));
}

function getPriceBucket(priceMin, priceMax) {
  const mid = Math.round((Number(priceMin || 0) + Number(priceMax || 0)) / 2);
  if (mid <= 100) {
    return 'b1';
  }
  if (mid <= 200) {
    return 'b2';
  }
  if (mid <= 400) {
    return 'b3';
  }
  if (mid <= 800) {
    return 'b4';
  }
  return 'b5';
}

function calculateRaterWeight(options) {
  const userProfile = options.userProfile || {};
  const reviewText = options.reviewText || '';
  const images = Array.isArray(options.images) ? options.images : [];
  const recentCount = Number(options.recentCount || 0);

  let weight = 1.0;

  if (userProfile.pref_smooth || userProfile.pref_soft || userProfile.pref_aroma) {
    weight += 0.1;
  }

  if (String(reviewText).trim().length >= 15) {
    weight += 0.1;
  }

  if (images.length > 0) {
    weight += 0.2;
  }

  if (recentCount >= 10) {
    weight = 0.5;
  }

  weight = Math.min(1.5, Math.max(0.5, weight));
  return Number(weight.toFixed(2));
}

function getRecentRatingCount(userId) {
  const row = db
    .prepare(
      `SELECT COUNT(1) AS count
       FROM Rating
       WHERE user_id = ?
         AND datetime(created_at) >= datetime('now', '-10 minutes')`
    )
    .get(userId);
  return row ? Number(row.count || 0) : 0;
}

function getSceneGlobalC(scene) {
  const row = db
    .prepare(
      `SELECT
          SUM(rater_weight * score_overall) AS weighted_sum,
          SUM(rater_weight) AS weight_sum
       FROM Rating
       WHERE scene = ?`
    )
    .get(scene);

  if (!row || !row.weight_sum) {
    return 5.0;
  }

  return Number(row.weighted_sum) / Number(row.weight_sum);
}

function getSceneRAndV(liquorId, scene) {
  const row = db
    .prepare(
      `SELECT
          SUM(rater_weight * score_overall) AS weighted_sum,
          SUM(rater_weight) AS weight_sum,
          COUNT(DISTINCT user_id) AS v
       FROM Rating
       WHERE liquor_id = ? AND scene = ?`
    )
    .get(liquorId, scene);

  if (!row || !row.weight_sum) {
    return {
      R: 5.0,
      v: 0
    };
  }

  return {
    R: Number(row.weighted_sum) / Number(row.weight_sum),
    v: Number(row.v || 0)
  };
}

function getStd(liquorId, scene) {
  const rows = db
    .prepare(
      `SELECT score_overall
       FROM Rating
       WHERE liquor_id = ? AND scene = ?`
    )
    .all(liquorId, scene);

  if (!rows.length) {
    return 0;
  }

  const mean = rows.reduce((sum, item) => sum + Number(item.score_overall || 0), 0) / rows.length;
  const variance =
    rows.reduce((sum, item) => {
      const diff = Number(item.score_overall || 0) - mean;
      return sum + diff * diff;
    }, 0) / rows.length;

  return Math.sqrt(variance);
}

function getDimensionAverages(liquorId, scene) {
  const row = db
    .prepare(
      `SELECT
          COALESCE(SUM(rater_weight * score_overall) / NULLIF(SUM(rater_weight), 0), 5.0) AS overall,
          COALESCE(SUM(rater_weight * score_smooth) / NULLIF(SUM(rater_weight), 0), 5.0) AS smooth,
          COALESCE(SUM(rater_weight * score_softness) / NULLIF(SUM(rater_weight), 0), 5.0) AS softness,
          COALESCE(
            SUM(CASE WHEN score_aroma_like IS NOT NULL THEN rater_weight * score_aroma_like END)
            / NULLIF(SUM(CASE WHEN score_aroma_like IS NOT NULL THEN rater_weight END), 0),
            5.0
          ) AS aroma_like,
          COALESCE(SUM(rater_weight * score_value) / NULLIF(SUM(rater_weight), 0), 5.0) AS value,
          COALESCE(
            SUM(CASE WHEN score_gift_face IS NOT NULL THEN rater_weight * score_gift_face END)
            / NULLIF(SUM(CASE WHEN score_gift_face IS NOT NULL THEN rater_weight END), 0),
            5.0
          ) AS gift_face
       FROM Rating
       WHERE liquor_id = ? AND scene = ?`
    )
    .get(liquorId, scene);

  if (!row) {
    return {
      overall: 5.0,
      smooth: 5.0,
      softness: 5.0,
      aroma_like: 5.0,
      value: 5.0,
      gift_face: 5.0
    };
  }

  return {
    overall: round1(row.overall),
    smooth: round1(row.smooth),
    softness: round1(row.softness),
    aroma_like: round1(row.aroma_like),
    value: round1(row.value),
    gift_face: round1(row.gift_face)
  };
}

function calculateBayesScore(params) {
  const v = Number(params.v || 0);
  const R = Number(params.R || 5.0);
  const C = Number(params.C || 5.0);
  const m = Number(params.m || BAYES_M);

  return (v / (v + m)) * R + (m / (v + m)) * C;
}

function calculateMatch(dimensionAvgs, prefsInput) {
  const prefs = parsePrefs(prefsInput);
  const prefSet = new Set(prefs);

  const base = 1;
  const ws = base + (prefSet.has('smooth') ? 1 : 0);
  const wsoft = base + (prefSet.has('soft') ? 1 : 0);
  const waroma = base + (prefSet.has('aroma') ? 1 : 0);
  const wvalue = base + (prefSet.has('value') ? 1 : 0);
  const woverall = prefSet.has('durable') ? 2 : 0;

  const denominator = ws + wsoft + waroma + wvalue + woverall;
  if (denominator === 0) {
    return 5.0;
  }

  const numerator =
    ws * Number(dimensionAvgs.smooth || 5.0) +
    wsoft * Number(dimensionAvgs.softness || 5.0) +
    waroma * Number(dimensionAvgs.aroma_like || 5.0) +
    wvalue * Number(dimensionAvgs.value || 5.0) +
    woverall * Number(dimensionAvgs.overall || 5.0);

  return numerator / denominator;
}

function calculateFinalScore(scoreScene, match, prefsInput) {
  const prefs = parsePrefs(prefsInput);
  if (!prefs.length) {
    return scoreScene;
  }
  return 0.75 * scoreScene + 0.25 * match;
}

function getSceneStats(liquorId, scene) {
  const rv = getSceneRAndV(liquorId, scene);
  const C = getSceneGlobalC(scene);
  const scoreScene = calculateBayesScore({
    v: rv.v,
    R: rv.R,
    C,
    m: BAYES_M
  });
  const std = getStd(liquorId, scene);

  return {
    v: rv.v,
    R: rv.R,
    C,
    bayes_score_scene: scoreScene,
    std
  };
}

function buildPriceBucketWhereSql() {
  return `
    CASE
      WHEN ROUND((price_min + price_max) / 2.0) <= 100 THEN 'b1'
      WHEN ROUND((price_min + price_max) / 2.0) <= 200 THEN 'b2'
      WHEN ROUND((price_min + price_max) / 2.0) <= 400 THEN 'b3'
      WHEN ROUND((price_min + price_max) / 2.0) <= 800 THEN 'b4'
      ELSE 'b5'
    END
  `;
}

function getCandidateLiquors(priceBucket) {
  const bucketSql = buildPriceBucketWhereSql();

  if (priceBucket) {
    return db
      .prepare(
        `SELECT id, name, brand, price_min, price_max, images, aroma_std, aroma_raw_top,
                ${bucketSql} AS price_bucket
         FROM Liquor
         WHERE ${bucketSql} = ?`
      )
      .all(priceBucket);
  }

  return db
    .prepare(
      `SELECT id, name, brand, price_min, price_max, images, aroma_std, aroma_raw_top,
              ${bucketSql} AS price_bucket
       FROM Liquor`
    )
    .all();
}

function buildCard(liquor, scene, prefs, includePriceReason) {
  const stats = getSceneStats(liquor.id, scene);
  const dimensionAvgs = getDimensionAverages(liquor.id, scene);
  const match = calculateMatch(dimensionAvgs, prefs);
  const final = calculateFinalScore(stats.bayes_score_scene, match, prefs);
  const reasons = reasonService.buildReasons({
    scene,
    v: stats.v,
    std: stats.std,
    dimensionAvgs,
    prefs: parsePrefs(prefs),
    includePriceReason
  });

  return {
    id: liquor.id,
    name: liquor.name,
    brand: liquor.brand,
    price_min: Number(liquor.price_min),
    price_max: Number(liquor.price_max),
    final_score: round1(final),
    bayes_score_scene: round1(stats.bayes_score_scene),
    reasons,
    _sort: {
      final,
      bayes: stats.bayes_score_scene,
      voters: stats.v
    }
  };
}

function sortCards(cards) {
  cards.sort((a, b) => {
    if (b._sort.final !== a._sort.final) {
      return b._sort.final - a._sort.final;
    }
    if (b._sort.bayes !== a._sort.bayes) {
      return b._sort.bayes - a._sort.bayes;
    }
    return b._sort.voters - a._sort.voters;
  });

  return cards.map((card) => {
    const cloned = Object.assign({}, card);
    delete cloned._sort;
    return cloned;
  });
}

function getRecommendations(params) {
  const scene = SCENES.includes(params.scene) ? params.scene : 'self';
  const priceBucket = params.price_bucket || params.priceBucket || null;
  const prefs = parsePrefs(params.prefs);
  const limit = Number(params.limit || 5);

  const liquors = getCandidateLiquors(priceBucket);
  const cards = liquors.map((liquor) => buildCard(liquor, scene, prefs, true));
  const sorted = sortCards(cards);

  return sorted.slice(0, limit);
}

function getRankings(params) {
  const scene = SCENES.includes(params.scene) ? params.scene : 'self';
  const priceBucket = params.price_bucket || params.priceBucket || null;

  const liquors = getCandidateLiquors(priceBucket);
  const cards = liquors.map((liquor) => buildCard(liquor, scene, [], Boolean(priceBucket)));
  const sorted = sortCards(cards);

  return sorted.slice(0, 10);
}

function searchLiquors(query) {
  const q = String(query || '').trim();
  if (!q) {
    return [];
  }

  const like = `%${q}%`;
  return db
    .prepare(
      `SELECT id, name, brand, price_min, price_max
       FROM Liquor
       WHERE name LIKE ? OR brand LIKE ?
       ORDER BY price_min ASC
       LIMIT 50`
    )
    .all(like, like)
    .map((item) => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price_min: Number(item.price_min),
      price_max: Number(item.price_max)
    }));
}

function parseJsonArray(text) {
  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function getAromaRawTop(liquorId) {
  return db
    .prepare(
      `SELECT aroma_raw, COUNT(1) AS cnt
       FROM Rating
       WHERE liquor_id = ?
         AND aroma_raw IS NOT NULL
         AND TRIM(aroma_raw) <> ''
       GROUP BY aroma_raw
       ORDER BY cnt DESC
       LIMIT 3`
    )
    .all(liquorId)
    .map((row) => row.aroma_raw);
}

function getLatestReviews(liquorId) {
  return db
    .prepare(
      `SELECT user_id, scene, score_overall, review_text, created_at
       FROM Rating
       WHERE liquor_id = ?
         AND review_text IS NOT NULL
         AND TRIM(review_text) <> ''
       ORDER BY datetime(created_at) DESC
       LIMIT 20`
    )
    .all(liquorId)
    .map((row) => ({
      user_id: row.user_id,
      scene: row.scene,
      score_overall: Number(row.score_overall),
      review_text: row.review_text,
      created_at: row.created_at
    }));
}

function getLiquorDetail(liquorId, userId) {
  const liquor = db
    .prepare(
      `SELECT id, name, brand, price_min, price_max, images, aroma_std, aroma_raw_top
       FROM Liquor
       WHERE id = ?`
    )
    .get(liquorId);

  if (!liquor) {
    return null;
  }

  const sceneScores = {};
  const dimensionAvgsByScene = {};
  const copywriting = {};

  SCENES.forEach((scene) => {
    const stats = getSceneStats(liquorId, scene);
    const dimensionAvgs = getDimensionAverages(liquorId, scene);

    sceneScores[scene] = {
      v: Number(stats.v),
      R: round1(stats.R),
      C: round1(stats.C),
      bayes_score_scene: round1(stats.bayes_score_scene),
      std: round1(stats.std)
    };

    dimensionAvgsByScene[scene] = {
      overall: round1(dimensionAvgs.overall),
      smooth: round1(dimensionAvgs.smooth),
      softness: round1(dimensionAvgs.softness),
      aroma_like: round1(dimensionAvgs.aroma_like),
      value: round1(dimensionAvgs.value),
      gift_face: round1(dimensionAvgs.gift_face)
    };

    const reasons = reasonService.buildReasons({
      scene,
      v: stats.v,
      std: stats.std,
      dimensionAvgs,
      prefs: [],
      includePriceReason: false
    });

    copywriting[scene] = reasonService.buildCopywriting(reasons, liquor.name);
  });

  const totalRatings = db
    .prepare(
      `SELECT COUNT(1) AS count
       FROM Rating
       WHERE liquor_id = ?`
    )
    .get(liquorId);

  const aromaRawTop = getAromaRawTop(liquorId);
  const fallbackAromaRawTop = parseJsonArray(liquor.aroma_raw_top);

  const result = {
    liquor: {
      id: liquor.id,
      name: liquor.name,
      brand: liquor.brand,
      price_min: Number(liquor.price_min),
      price_max: Number(liquor.price_max),
      images: parseJsonArray(liquor.images),
      aroma_std: liquor.aroma_std || '待确认',
      aroma_raw_top: aromaRawTop.length ? aromaRawTop : fallbackAromaRawTop
    },
    scene_scores: sceneScores,
    dimension_avgs_by_scene: dimensionAvgsByScene,
    latest_reviews: getLatestReviews(liquorId),
    copywriting,
    stats: {
      total_ratings: Number(totalRatings ? totalRatings.count : 0)
    }
  };

  if (userId) {
    const favorite = db
      .prepare(
        `SELECT 1 AS hit
         FROM Favorites
         WHERE user_id = ? AND liquor_id = ?`
      )
      .get(userId, liquorId);
    result.is_favorite = Boolean(favorite && favorite.hit);
  }

  return result;
}

module.exports = {
  SCENES,
  parsePrefs,
  round1,
  getPriceBucket,
  calculateRaterWeight,
  getRecentRatingCount,
  calculateBayesScore,
  calculateMatch,
  calculateFinalScore,
  getSceneStats,
  getDimensionAverages,
  getRecommendations,
  getRankings,
  searchLiquors,
  getLiquorDetail
};
