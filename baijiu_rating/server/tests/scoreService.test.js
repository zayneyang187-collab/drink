const assert = require('assert');
const scoreService = require('../services/scoreService');
const reasonService = require('../services/reasonService');

function run() {
  const b1 = scoreService.getPriceBucket(60, 90);
  const b3 = scoreService.getPriceBucket(220, 380);
  const b5 = scoreService.getPriceBucket(900, 1300);

  assert.strictEqual(b1, 'b1');
  assert.strictEqual(b3, 'b3');
  assert.strictEqual(b5, 'b5');

  const weightA = scoreService.calculateRaterWeight({
    userProfile: { pref_smooth: true },
    reviewText: '入口顺滑，香气舒服，尾段干净，整体不错。',
    images: ['a.jpg'],
    recentCount: 0
  });
  assert.strictEqual(weightA, 1.4);

  const weightB = scoreService.calculateRaterWeight({
    userProfile: {},
    reviewText: '',
    images: [],
    recentCount: 20
  });
  assert.strictEqual(weightB, 0.5);

  const bayes = scoreService.calculateBayesScore({
    v: 10,
    R: 8,
    C: 6,
    m: 30
  });
  assert.strictEqual(Number(bayes.toFixed(2)), 6.5);

  const reasons = reasonService.buildReasons({
    scene: 'party',
    v: 12,
    std: 1.2,
    prefs: ['smooth'],
    dimensionAvgs: {
      overall: 7.8,
      smooth: 8.2,
      softness: 7.1,
      aroma_like: 7.6,
      value: 7.4,
      gift_face: 7.0
    },
    includePriceReason: true
  });

  assert.ok(Array.isArray(reasons));
  assert.ok(reasons.length >= 2);
  assert.ok(reasons.length <= 3);

  console.log('[test] all passed');
}

run();
