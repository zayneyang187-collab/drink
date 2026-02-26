const express = require('express');
const scoreService = require('../services/scoreService');
const { db } = require('../db/sqlite');
const { sendError } = require('./helpers');

const router = express.Router();

router.get('/recommend', (req, res) => {
  const scene = req.query.scene;
  const priceBucket = req.query.price_bucket;
  const crowd = req.query.crowd || 'newbie';
  const prefs = req.query.prefs || '';

  if (!scene || !priceBucket) {
    return sendError(res, 400, 'INVALID_PARAMS', 'scene and price_bucket are required');
  }

  const list = scoreService.getRecommendations({
    scene,
    price_bucket: priceBucket,
    crowd,
    prefs,
    limit: 5
  });

  return res.json(list);
});

router.get('/rank', (req, res) => {
  const scene = req.query.scene;
  const priceBucket = req.query.price_bucket || null;

  if (!scene) {
    return sendError(res, 400, 'INVALID_PARAMS', 'scene is required');
  }

  const list = scoreService.getRankings({
    scene,
    price_bucket: priceBucket
  });

  return res.json(list);
});

router.get('/search', (req, res) => {
  const q = req.query.q || '';
  const list = scoreService.searchLiquors(q);
  return res.json(list);
});

router.post('/', (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const brand = String(body.brand || '').trim() || '自建酒款';

  if (!name) {
    return sendError(res, 400, 'INVALID_PARAMS', 'name is required');
  }

  let priceMin = normalizePrice(body.price_min, 0);
  let priceMax = normalizePrice(body.price_max, priceMin);
  if (priceMax < priceMin) {
    priceMax = priceMin;
  }

  const images = Array.isArray(body.images)
    ? body.images.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 5)
    : [];

  const aromaStd = String(body.aroma_std || '').trim() || '待确认';

  const existed = db
    .prepare(
      `SELECT id, name, brand, price_min, price_max, images, aroma_std, aroma_raw_top
       FROM Liquor
       WHERE name = ? AND brand = ?
       LIMIT 1`
    )
    .get(name, brand);

  if (existed) {
    return res.json(formatLiquor(existed));
  }

  const id = createLiquorId();

  db.prepare(
    `INSERT INTO Liquor(id, name, brand, price_min, price_max, images, aroma_std, aroma_raw_top)
     VALUES(?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, brand, priceMin, priceMax, JSON.stringify(images), aromaStd, '[]');

  const created = db
    .prepare(
      `SELECT id, name, brand, price_min, price_max, images, aroma_std, aroma_raw_top
       FROM Liquor
       WHERE id = ?`
    )
    .get(id);

  return res.status(201).json(formatLiquor(created));
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const userId = req.query.user_id || null;

  const detail = scoreService.getLiquorDetail(id, userId);
  if (!detail) {
    return sendError(res, 404, 'NOT_FOUND', 'liquor not found');
  }

  return res.json(detail);
});

module.exports = router;

function normalizePrice(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return Number(fallback) || 0;
  }
  return Math.round(n);
}

function createLiquorId() {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `u_${time}${random}`;
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

function formatLiquor(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price_min: Number(row.price_min),
    price_max: Number(row.price_max),
    images: parseJsonArray(row.images),
    aroma_std: row.aroma_std || '待确认',
    aroma_raw_top: parseJsonArray(row.aroma_raw_top)
  };
}
