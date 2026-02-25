# API 文档（/api）

Base URL: `http://127.0.0.1:3000/api`

## 1) 推荐列表

### GET `/liquors/recommend?scene=&price_bucket=&crowd=&prefs=`

- `scene`: `gift|party|self|newbie`（必填）
- `price_bucket`: `b1|b2|b3|b4|b5`（必填）
- `crowd`: `newbie|occasional|often|enthusiast`（可选）
- `prefs`: 逗号分隔，最多2个：`smooth,soft,aroma,durable,value`

Response 示例：

```json
[
  {
    "id": "liq-001",
    "name": "江岸 · 青年款1",
    "brand": "江岸酒厂",
    "price_min": 74,
    "price_max": 106,
    "final_score": 7.8,
    "bayes_score_scene": 7.5,
    "reasons": [
      "该场景评价人数较多：更稳妥",
      "更顺口：入口舒服",
      "在本预算档位评分靠前"
    ]
  }
]
```

## 2) 场景榜单

### GET `/liquors/rank?scene=&price_bucket=`

- `scene` 必填
- `price_bucket` 可选

返回 Top10，结构同 recommend。

## 3) 搜索

### GET `/liquors/search?q=`

Response:

```json
[
  {
    "id": "liq-001",
    "name": "江岸 · 青年款1",
    "brand": "江岸酒厂",
    "price_min": 74,
    "price_max": 106
  }
]
```

## 4) 酒品详情

### GET `/liquors/:id?user_id=`

Response:

```json
{
  "liquor": {
    "id": "liq-001",
    "name": "江岸 · 青年款1",
    "brand": "江岸酒厂",
    "price_min": 74,
    "price_max": 106,
    "images": ["https://..."],
    "aroma_std": "浓香",
    "aroma_raw_top": ["浓香", "jiangxiang", "花果香"]
  },
  "scene_scores": {
    "gift": { "v": 12, "R": 7.8, "C": 7.4, "bayes_score_scene": 7.5, "std": 1.3 },
    "party": { "v": 8, "R": 7.2, "C": 7.1, "bayes_score_scene": 7.1, "std": 1.5 }
  },
  "dimension_avgs_by_scene": {
    "gift": { "overall": 7.8, "smooth": 8.0, "softness": 7.6, "aroma_like": 7.7, "value": 7.5, "gift_face": 8.1 }
  },
  "latest_reviews": [
    { "user_id": "user-001", "scene": "gift", "score_overall": 8, "review_text": "...", "created_at": "2026-02-20T10:00:00Z" }
  ],
  "copywriting": {
    "gift": "江岸 · 青年款1该场景评价人数较多：更稳妥，更顺口：入口舒服。",
    "party": "...",
    "self": "...",
    "newbie": "..."
  },
  "stats": {
    "total_ratings": 24
  },
  "is_favorite": true
}
```

## 5) 提交评分

### POST `/ratings`

Body 示例：

```json
{
  "liquor_id": "liq-001",
  "user_id": "u_xxx",
  "scene": "gift",
  "score_overall": 8,
  "score_smooth": 8,
  "score_softness": 7,
  "score_aroma_like": 8,
  "score_value": 7,
  "score_gift_face": 9,
  "review_text": "入口顺，香气舒服，送礼反馈不错。",
  "aroma_raw": "jiangxiang",
  "images": ["tmp/a.jpg"],
  "user_profile": {
    "pref_smooth": true,
    "pref_soft": false,
    "pref_aroma": false
  }
}
```

Response：

```json
{
  "id": "uuid",
  "liquor_id": "liq-001",
  "user_id": "u_xxx",
  "rater_weight": 1.4,
  "filtered_words": [],
  "aroma_std_updated": false,
  "created_at": "2026-02-24T12:00:00.000Z"
}
```

## 6) 我的评分

### GET `/me/ratings?user_id=`

返回当前用户评分列表。

## 7) 我的收藏

### GET `/me/favorites?user_id=`

返回收藏列表。

### POST `/me/favorites`

Body:

```json
{
  "user_id": "u_xxx",
  "liquor_id": "liq-001",
  "action": "add"
}
```

`action`: `add|remove`

## 8) 举报

### POST `/reports`

Body:

```json
{
  "user_id": "u_xxx",
  "target_type": "rating",
  "target_id": "rat-0010",
  "reason": "疑似营销"
}
```

## 9) 失败返回

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "..."
  }
}
```
