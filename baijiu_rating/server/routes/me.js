const express = require('express');
const { db } = require('../db/sqlite');
const { sendError } = require('./helpers');

const router = express.Router();

router.get('/ratings', (req, res) => {
  const userId = String(req.query.user_id || '').trim();
  if (!userId) {
    return sendError(res, 400, 'INVALID_PARAMS', 'user_id is required');
  }

  const list = db
    .prepare(
      `SELECT
          r.id,
          r.liquor_id,
          r.scene,
          r.score_overall,
          r.review_text,
          r.created_at,
          l.name,
          l.brand,
          l.price_min,
          l.price_max
       FROM Rating r
       JOIN Liquor l ON l.id = r.liquor_id
       WHERE r.user_id = ?
       ORDER BY datetime(r.created_at) DESC`
    )
    .all(userId)
    .map((row) => ({
      id: row.id,
      liquor_id: row.liquor_id,
      scene: row.scene,
      score_overall: Number(row.score_overall),
      review_text: row.review_text,
      created_at: row.created_at,
      liquor_name: row.name,
      brand: row.brand,
      price_min: Number(row.price_min),
      price_max: Number(row.price_max)
    }));

  return res.json(list);
});

router.get('/favorites', (req, res) => {
  const userId = String(req.query.user_id || '').trim();
  if (!userId) {
    return sendError(res, 400, 'INVALID_PARAMS', 'user_id is required');
  }

  const list = db
    .prepare(
      `SELECT
          f.user_id,
          f.liquor_id,
          f.created_at,
          l.name,
          l.brand,
          l.price_min,
          l.price_max
       FROM Favorites f
       JOIN Liquor l ON l.id = f.liquor_id
       WHERE f.user_id = ?
       ORDER BY datetime(f.created_at) DESC`
    )
    .all(userId)
    .map((row) => ({
      user_id: row.user_id,
      liquor_id: row.liquor_id,
      created_at: row.created_at,
      name: row.name,
      brand: row.brand,
      price_min: Number(row.price_min),
      price_max: Number(row.price_max)
    }));

  return res.json(list);
});

router.post('/favorites', (req, res) => {
  const userId = String(req.body.user_id || '').trim();
  const liquorId = String(req.body.liquor_id || '').trim();
  const action = String(req.body.action || '').trim();

  if (!userId || !liquorId || !action) {
    return sendError(res, 400, 'INVALID_PARAMS', 'user_id, liquor_id, action are required');
  }

  if (action !== 'add' && action !== 'remove') {
    return sendError(res, 400, 'INVALID_PARAMS', 'action must be add or remove');
  }

  if (action === 'add') {
    db.prepare(
      `INSERT OR IGNORE INTO Favorites(user_id, liquor_id, created_at)
       VALUES (?, ?, ?)`
    ).run(userId, liquorId, new Date().toISOString());
  }

  if (action === 'remove') {
    db.prepare(
      `DELETE FROM Favorites
       WHERE user_id = ? AND liquor_id = ?`
    ).run(userId, liquorId);
  }

  return res.json({
    user_id: userId,
    liquor_id: liquorId,
    action
  });
});

module.exports = router;
