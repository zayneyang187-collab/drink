const express = require('express');
const crypto = require('crypto');
const { db } = require('../db/sqlite');
const scoreService = require('../services/scoreService');
const aromaService = require('../services/aromaService');
const antiSpamService = require('../services/antiSpamService');
const { sendError, isValidScore } = require('./helpers');

const router = express.Router();

router.post('/', (req, res) => {
  const body = req.body || {};
  const liquorId = String(body.liquor_id || '').trim();
  const userId = String(body.user_id || '').trim();
  const scene = String(body.scene || '').trim();

  if (!liquorId || !userId || !scene) {
    return sendError(res, 400, 'INVALID_PARAMS', 'liquor_id, user_id, scene are required');
  }

  if (!scoreService.SCENES.includes(scene)) {
    return sendError(res, 400, 'INVALID_PARAMS', 'scene must be one of gift/party/self/newbie');
  }

  const requiredScoreFields = ['score_overall', 'score_smooth', 'score_softness', 'score_value'];
  for (let i = 0; i < requiredScoreFields.length; i += 1) {
    const key = requiredScoreFields[i];
    if (!isValidScore(body[key])) {
      return sendError(res, 400, 'INVALID_PARAMS', `${key} must be integer 1..10`);
    }
  }

  if (scene === 'gift' && !isValidScore(body.score_gift_face)) {
    return sendError(res, 400, 'INVALID_PARAMS', 'score_gift_face is required for gift scene (1..10)');
  }

  if (body.score_aroma_like !== null && body.score_aroma_like !== undefined && body.score_aroma_like !== '' && !isValidScore(body.score_aroma_like)) {
    return sendError(res, 400, 'INVALID_PARAMS', 'score_aroma_like must be integer 1..10 when provided');
  }

  const liquor = db
    .prepare(
      `SELECT id, aroma_std
       FROM Liquor
       WHERE id = ?`
    )
    .get(liquorId);

  if (!liquor) {
    return sendError(res, 404, 'NOT_FOUND', 'liquor not found');
  }

  const images = Array.isArray(body.images) ? body.images : [];
  const sanitized = antiSpamService.sanitizeText(body.review_text);
  const recentCount = scoreService.getRecentRatingCount(userId);

  const raterWeight = scoreService.calculateRaterWeight({
    userProfile: body.user_profile || {},
    reviewText: sanitized.cleanText || '',
    images,
    recentCount
  });

  const aromaRaw = body.aroma_raw ? String(body.aroma_raw) : null;
  const aromaNormalized = aromaService.normalize(aromaRaw);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO Rating(
      id,
      liquor_id,
      user_id,
      scene,
      score_overall,
      score_smooth,
      score_softness,
      score_aroma_like,
      score_value,
      score_gift_face,
      review_text,
      aroma_raw,
      images,
      rater_weight,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    liquorId,
    userId,
    scene,
    Number(body.score_overall),
    Number(body.score_smooth),
    Number(body.score_softness),
    body.score_aroma_like === null || body.score_aroma_like === undefined || body.score_aroma_like === '' ? null : Number(body.score_aroma_like),
    Number(body.score_value),
    scene === 'gift' ? Number(body.score_gift_face) : null,
    sanitized.cleanText ? String(sanitized.cleanText) : null,
    aromaRaw,
    images.length ? JSON.stringify(images) : null,
    raterWeight,
    createdAt
  );

  let aromaStdUpdated = false;
  if (aromaNormalized && aromaNormalized !== '待确认' && (!liquor.aroma_std || liquor.aroma_std === '待确认')) {
    db.prepare(
      `UPDATE Liquor
       SET aroma_std = ?
       WHERE id = ?`
    ).run(aromaNormalized, liquorId);
    aromaStdUpdated = true;
  }

  return res.json({
    id,
    liquor_id: liquorId,
    user_id: userId,
    rater_weight: raterWeight,
    filtered_words: sanitized.hitWords,
    aroma_std_updated: aromaStdUpdated,
    created_at: createdAt
  });
});

module.exports = router;
