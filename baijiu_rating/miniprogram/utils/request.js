const CLOUD_ENV_ID = 'prod-7gpq613l2903a674'; // 必须与 app.js 的 wx.cloud.init.env 一致
const CLOUD_SERVICE = 'baijiu-api';
const API_PREFIX = '/api';

function normalizePath(url) {
  if (!url) return API_PREFIX;
  if (/^https?:\/\//.test(url)) return url;
  const p = url.startsWith('/') ? url : `/${url}`;
  return p.startsWith('/api') ? p : `${API_PREFIX}${p}`;
}

function request(options) {
  const opts = options || {};
  const method = (opts.method || 'GET').toUpperCase();
  const path = normalizePath(opts.url || '');

  return new Promise((resolve, reject) => {
    wx.cloud.callContainer({
      config: { env: CLOUD_ENV_ID },
      path,
      method,
      header: Object.assign(
        {
          'content-type': 'application/json',
          'X-WX-SERVICE': CLOUD_SERVICE
        },
        opts.header || {}
      ),
      data: opts.data || {},
      timeout: Number(opts.timeout || 10000),
      success(res) {
        const payload = res.data;
        const statusCode = Number(res.statusCode || 200);

        if (statusCode < 200 || statusCode >= 300) {
          const message = payload?.error?.message || '请求失败';
          wx.showToast({ title: message, icon: 'none' });
          reject(payload?.error || new Error(message));
          return;
        }

        if (payload && payload.ok === false) {
          const message = payload.error?.message || '请求失败';
          wx.showToast({ title: message, icon: 'none' });
          reject(payload.error || new Error(message));
          return;
        }

        resolve(payload);
      },
      fail(err) {
        wx.showToast({ title: '云托管调用失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

module.exports = {
  request
};
