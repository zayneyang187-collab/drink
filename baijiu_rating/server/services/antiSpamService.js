const SENSITIVE_WORDS = ['诈骗', '假酒', '傻x', '傻逼', '毒酒'];

function sanitizeText(text) {
  if (text === null || text === undefined) {
    return {
      cleanText: null,
      hitWords: []
    };
  }

  let cleanText = String(text);
  const hitWords = [];

  SENSITIVE_WORDS.forEach((word) => {
    const regex = new RegExp(escapeRegExp(word), 'gi');
    if (regex.test(cleanText)) {
      hitWords.push(word);
      cleanText = cleanText.replace(regex, '**');
    }
  });

  return {
    cleanText,
    hitWords
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  sanitizeText
};
