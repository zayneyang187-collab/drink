const DIMENSION_REASON_CONFIG = [
  {
    key: 'smooth',
    pref: 'smooth',
    text: '更顺口：入口舒服'
  },
  {
    key: 'softness',
    pref: 'soft',
    text: '更柔和：不容易刺激'
  },
  {
    key: 'aroma_like',
    pref: 'aroma',
    text: '香气更讨喜：闻着舒服'
  },
  {
    key: 'value',
    pref: 'value',
    text: '性价比高：同价位更值'
  },
  {
    key: 'overall',
    pref: 'durable',
    text: '整体表现稳：更耐喝'
  }
];

function buildReasons(options) {
  const scene = options.scene;
  const v = Number(options.v || 0);
  const std = Number(options.std || 0);
  const prefs = Array.isArray(options.prefs) ? options.prefs : [];
  const dimensionAvgs = options.dimensionAvgs || {};
  const includePriceReason = Boolean(options.includePriceReason);

  const reasons = [];
  const sceneReason = buildSceneReason(v, std);
  reasons.push(sceneReason);

  const dimensionReason = pickDimensionReason(scene, dimensionAvgs, prefs);
  if (dimensionReason) {
    reasons.push(dimensionReason);
  }

  if (includePriceReason) {
    reasons.push('在本预算档位评分靠前');
  }

  const deduped = [];
  reasons.forEach((reason) => {
    if (reason && !deduped.includes(reason)) {
      deduped.push(reason);
    }
  });

  if (!deduped.length) {
    return ['该场景已有真实评分：持续完善中'];
  }

  if (deduped.length === 1) {
    deduped.push('更顺口：入口舒服');
  }

  return deduped.slice(0, 3);
}

function buildSceneReason(v, std) {
  if (v >= 20 && std <= 1.5) {
    return '多人接受度高：评价更稳定';
  }
  if (v >= 10) {
    return '该场景评价人数较多：更稳妥';
  }
  return '该场景已有真实评分：持续完善中';
}

function pickDimensionReason(scene, dimensionAvgs, prefs) {
  const prefSet = new Set(prefs);

  for (let i = 0; i < DIMENSION_REASON_CONFIG.length; i += 1) {
    const item = DIMENSION_REASON_CONFIG[i];
    if (!prefSet.has(item.pref)) {
      continue;
    }
    const score = Number(dimensionAvgs[item.key] || 0);
    if (score >= 7.5) {
      return item.text;
    }
  }

  if (scene === 'gift' && Number(dimensionAvgs.gift_face || 0) >= 7.5) {
    return '更体面：适合送礼';
  }

  const candidates = [];
  DIMENSION_REASON_CONFIG.forEach((item) => {
    candidates.push({
      text: item.text,
      score: Number(dimensionAvgs[item.key] || 0)
    });
  });

  if (scene === 'gift') {
    candidates.push({
      text: '更体面：适合送礼',
      score: Number(dimensionAvgs.gift_face || 0)
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  const best = candidates.find((item) => item.score >= 8) || candidates.find((item) => item.score >= 7.5) || candidates[0];
  return best ? best.text : '更顺口：入口舒服';
}

function buildCopywriting(reasons, liquorName) {
  const safeReasons = Array.isArray(reasons) ? reasons.filter(Boolean) : [];
  const head = liquorName ? `${liquorName}` : '这款酒';

  if (!safeReasons.length) {
    return `${head}整体评价稳定，值得试试。`;
  }

  if (safeReasons.length === 1) {
    return `${head}${safeReasons[0]}。`;
  }

  if (safeReasons.length === 2) {
    return `${head}${safeReasons[0]}，${safeReasons[1]}。`;
  }

  return `${head}${safeReasons[0]}，${safeReasons[1]}。另外，${safeReasons[2]}。`;
}

module.exports = {
  buildReasons,
  buildCopywriting
};
