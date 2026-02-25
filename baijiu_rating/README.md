# 白酒评分小程序 MVP

面向年轻人（18+）的白酒推荐与评分系统：
- 前端：微信小程序（原生 MINA）
- 后端：Node.js + Express（CommonJS）
- 数据库：SQLite（better-sqlite3）

## 1. 目录结构

```text
baijiu_rating/
├─ miniprogram/
│  ├─ app.js
│  ├─ app.json
│  ├─ app.wxss
│  ├─ sitemap.json
│  ├─ pages/
│  │  ├─ home/
│  │  ├─ recommend/
│  │  ├─ detail/
│  │  ├─ rate/
│  │  ├─ me/
│  │  └─ search/
│  └─ utils/
│     ├─ request.js
│     └─ storage.js
├─ server/
│  ├─ index.js
│  ├─ package.json
│  ├─ routes/
│  │  ├─ helpers.js
│  │  ├─ liquors.js
│  │  ├─ ratings.js
│  │  ├─ me.js
│  │  └─ reports.js
│  ├─ services/
│  │  ├─ scoreService.js
│  │  ├─ reasonService.js
│  │  ├─ aromaService.js
│  │  └─ antiSpamService.js
│  ├─ db/
│  │  ├─ sqlite.js
│  │  ├─ schema.sql
│  │  └─ seed.sql
│  ├─ scripts/
│  │  └─ initDb.js
│  └─ tests/
│     └─ scoreService.test.js
├─ db/
│  └─ README.md
├─ .env.example
├─ API.md
└─ README.md
```

## 2. 环境要求

- Node.js 18+
- 全部 JavaScript + CommonJS（`require/module.exports`）

## 3. 快速启动

### 3.1 后端启动

```bash
cd server
npm install
```

在项目根目录复制环境变量文件：

```bash
cp .env.example .env
```

初始化数据库（建表 + 种子数据）：

```bash
npm run init-db
```

启动服务（端口默认 3000，前缀 `/api`）：

```bash
npm run dev
```

可选测试：

```bash
npm test
```

### 3.2 小程序启动（微信开发者工具）

1. 导入目录：`miniprogram`
2. 在微信开发者工具中打开：`详情 -> 本地设置`
3. 勾选：**不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**
4. 确认 `miniprogram/utils/request.js` 的 `baseUrl` 为：
   - `http://127.0.0.1:3000/api`

后端已经开启 CORS（`origin: *`），支持本地联调。

## 4. 核心功能

- `/pages/home`：三步选酒器 + 首次轻引导 + 本周热门 Top10
- `/pages/recommend`：Top5 推荐 + reasons（1~3条）+ 分享复现
- `/pages/detail`：详情 + 分场景贝叶斯得分 + 维度均值 + 评论 + 收藏 + 复制话术 + 分享
- `/pages/rate`：评分提交（含送礼场景必填项）
- `/pages/me`：我的评分、收藏、浏览历史、口味档案、徽章
- `/pages/search`：按酒名/品牌搜索并直达评分

## 5. 数据与算法说明

### 5.1 价格档位映射

在 `server/services/scoreService.js` 中通过 `getPriceBucket` 实现：

- `b1`: `price_mid <= 100`
- `b2`: `100 < price_mid <= 200`
- `b3`: `200 < price_mid <= 400`
- `b4`: `400 < price_mid <= 800`
- `b5`: `price_mid > 800`

### 5.2 评分权重

`scoreService.calculateRaterWeight`：

- base `1.0`
- 有口味档案 +0.1
- 评语长度 >=15 +0.1
- 有图片 +0.2
- 10分钟内评分 >=10 次强制 `0.5`
- clamp 到 `[0.5, 1.5]`

### 5.3 贝叶斯 + 匹配 + 最终分

文件：`server/services/scoreService.js`

- `R = sum(w_i * overall_i) / sum(w_i)`
- `v = COUNT(DISTINCT user_id)`
- `C = 全站该 scene 的加权均值`
- `Score_scene = (v/(v+m))*R + (m/(v+m))*C`，`m=30`
- `Match` 按 `smooth/soft/aroma/value/durable` 权重计算
- `prefs 为空 -> Final=Score_scene`
- `prefs 非空 -> Final=0.75*Score_scene + 0.25*Match`

### 5.4 理由与话术

文件：`server/services/reasonService.js`

- 每条推荐保证 `1~3` 条 `reasons`
- 至少包含：一条场景相关 + 一条维度相关
- 生成可复制 `copywriting`

## 6. 数据规模

- Liquor：52 条
- Rating：260 条
- 覆盖 4 场景 + 多价格档
- 包含 aroma_raw 样本，支持 `aroma_raw_top` 统计

## 7. 接口文档

见 [API.md](./API.md)

## 8. 失败返回格式

所有失败统一：

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "..."
  }
}
```

成功返回对象或数组（不包 `ok:true`）。
