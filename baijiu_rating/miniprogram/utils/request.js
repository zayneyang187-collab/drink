const DEFAULT_BASE_URL = 'http://127.0.0.1:3000/api';
let baseUrl = DEFAULT_BASE_URL;

function setBaseUrl(url) {
  if (url && typeof url === 'string') {
    baseUrl = url.replace(/\/$/, '');
  }
}

function getBaseUrl() {
  return baseUrl;
}

function request(options) {
  const opts = options || {};
  const method = (opts.method || 'GET').toUpperCase();
  const url = buildUrl(opts.url || '');

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data: opts.data || {},
      timeout: Number(opts.timeout || 10000),
      header: Object.assign(
        {
          'Content-Type': 'application/json'
        },
        opts.header || {}
      ),
      success(res) {
        const statusCode = Number(res.statusCode);
        const payload = res.data;

        if (statusCode >= 200 && statusCode < 300) {
          if (payload && payload.ok === false) {
            const message = payload.error && payload.error.message ? payload.error.message : '\u8bf7\u6c42\u5931\u8d25';
            toast(message);
            reject(payload.error || new Error(message));
            return;
          }

          resolve(payload);
          return;
        }

        const message = payload && payload.error && payload.error.message ? payload.error.message : '\u7f51\u7edc\u8bf7\u6c42\u5931\u8d25';
        toast(message);
        reject(payload && payload.error ? payload.error : new Error(message));
      },
      fail(error) {
        toast('\u65e0\u6cd5\u8fde\u63a5\u670d\u52a1\u5668\uff0c\u8bf7\u68c0\u67e5 baseUrl');
        reject(error);
      }
    });
  });
}

function buildUrl(url) {
  if (!url) {
    return baseUrl;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  return `${baseUrl}/${url}`;
}

function toast(title) {
  wx.showToast({
    title,
    icon: 'none',
    duration: 1800
  });
}

module.exports = {
  request,
  setBaseUrl,
  getBaseUrl
};
