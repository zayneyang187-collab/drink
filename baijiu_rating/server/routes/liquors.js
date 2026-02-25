const express = require('express');
const scoreService = require('../services/scoreService');
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
