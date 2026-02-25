function sendError(res, status, code, message) {
  res.status(status).json({
    ok: false,
    error: {
      code,
      message
    }
  });
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isValidScore(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 10;
}

module.exports = {
  sendError,
  toNumber,
  isValidScore
};
