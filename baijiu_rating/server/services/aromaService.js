const synonymMap = {
  '酱香': '酱香',
  '茅香': '酱香',
  jiangxiang: '酱香',
  '浓香': '浓香',
  '泸香': '浓香',
  nongxiang: '浓香',
  '清香': '清香',
  '汾香': '清香',
  qingxiang: '清香',
  '米香': '米香',
  mixiang: '米香',
  '兼香': '兼香',
  jianxiang: '兼香'
};

function normalize(aromaRaw) {
  if (aromaRaw === null || aromaRaw === undefined) {
    return null;
  }

  const normalized = String(aromaRaw).trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return synonymMap[normalized] || '待确认';
}

module.exports = {
  normalize
};
