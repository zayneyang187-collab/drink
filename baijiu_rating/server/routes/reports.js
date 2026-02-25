const express = require('express');
const crypto = require('crypto');
const { db } = require('../db/sqlite');
const { sendError } = require('./helpers');

const router = express.Router();

router.post('/', (req, res) => {
  const userId = String(req.body.user_id || '').trim();
  const targetType = String(req.body.target_type || '').trim();
  const targetId = String(req.body.target_id || '').trim();
  const reason = String(req.body.reason || '').trim();

  if (!userId || !targetType || !targetId || !reason) {
    return sendError(res, 400, 'INVALID_PARAMS', 'user_id, target_type, target_id, reason are required');
  }

  if (targetType !== 'rating' && targetType !== 'liquor') {
    return sendError(res, 400, 'INVALID_PARAMS', 'target_type must be rating or liquor');
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO Reports(id, user_id, target_type, target_id, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, userId, targetType, targetId, reason, createdAt);

  return res.json({
    id,
    created_at: createdAt
  });
});

module.exports = router;
