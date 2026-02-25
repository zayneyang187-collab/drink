DELETE FROM Favorites;
DELETE FROM Reports;
DELETE FROM Rating;
DELETE FROM Liquor;

WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 52
)
INSERT INTO Liquor(
  id,
  name,
  brand,
  price_min,
  price_max,
  images,
  aroma_std,
  aroma_raw_top
)
SELECT
  'liq-' || printf('%03d', n) AS id,
  (
    CASE ((n - 1) % 10)
      WHEN 0 THEN '江岸'
      WHEN 1 THEN '云岭'
      WHEN 2 THEN '沱牌'
      WHEN 3 THEN '青岚'
      WHEN 4 THEN '谷火'
      WHEN 5 THEN '海棠'
      WHEN 6 THEN '凌川'
      WHEN 7 THEN '远山'
      WHEN 8 THEN '松月'
      ELSE '澄明'
    END
  ) || ' · 青年款' || n AS name,
  CASE ((n - 1) % 10)
    WHEN 0 THEN '江岸酒厂'
    WHEN 1 THEN '云岭酿造'
    WHEN 2 THEN '沱牌古窖'
    WHEN 3 THEN '青岚酒业'
    WHEN 4 THEN '谷火蒸馏'
    WHEN 5 THEN '海棠酿坊'
    WHEN 6 THEN '凌川酒坊'
    WHEN 7 THEN '远山酒业'
    WHEN 8 THEN '松月酒厂'
    ELSE '澄明酒造'
  END AS brand,
  CASE ((n - 1) % 5)
    WHEN 0 THEN 68 + ((n % 4) * 6)
    WHEN 1 THEN 118 + ((n % 5) * 10)
    WHEN 2 THEN 220 + ((n % 6) * 18)
    WHEN 3 THEN 430 + ((n % 5) * 35)
    ELSE 880 + ((n % 6) * 50)
  END AS price_min,
  CASE ((n - 1) % 5)
    WHEN 0 THEN 98 + ((n % 4) * 8)
    WHEN 1 THEN 188 + ((n % 5) * 12)
    WHEN 2 THEN 360 + ((n % 6) * 20)
    WHEN 3 THEN 760 + ((n % 5) * 40)
    ELSE 1280 + ((n % 6) * 80)
  END AS price_max,
  '["https://example.com/liquor/' || n || '-1.jpg", "https://example.com/liquor/' || n || '-2.jpg"]' AS images,
  CASE ((n - 1) % 7)
    WHEN 0 THEN '浓香'
    WHEN 1 THEN '酱香'
    WHEN 2 THEN '清香'
    WHEN 3 THEN '米香'
    WHEN 4 THEN '兼香'
    WHEN 5 THEN '其他'
    ELSE '待确认'
  END AS aroma_std,
  '[]' AS aroma_raw_top
FROM seq;

WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 260
)
INSERT INTO Rating(
  id,
  liquor_id,
  user_id,
  scene,
  score_overall,
  score_smooth,
  score_softness,
  score_aroma_like,
  score_value,
  score_gift_face,
  review_text,
  aroma_raw,
  images,
  rater_weight,
  created_at
)
SELECT
  'rat-' || printf('%04d', n) AS id,
  'liq-' || printf('%03d', ((n - 1) % 52) + 1) AS liquor_id,
  'user-' || printf('%03d', ((n - 1) % 85) + 1) AS user_id,
  CASE (n % 4)
    WHEN 1 THEN 'gift'
    WHEN 2 THEN 'party'
    WHEN 3 THEN 'self'
    ELSE 'newbie'
  END AS scene,
  6 + (n % 5) AS score_overall,
  5 + ((n + 1) % 6) AS score_smooth,
  5 + ((n + 2) % 6) AS score_softness,
  CASE WHEN n % 7 = 0 THEN NULL ELSE 5 + ((n + 3) % 6) END AS score_aroma_like,
  5 + ((n + 4) % 6) AS score_value,
  CASE WHEN (n % 4) = 1 THEN 6 + (n % 5) ELSE NULL END AS score_gift_face,
  CASE
    WHEN n % 3 = 0 THEN '入口顺、尾段干净，聚会反馈不错，性价比在线，回购意愿高。'
    WHEN n % 5 = 0 THEN '口感均衡，适合新手。'
    ELSE NULL
  END AS review_text,
  CASE (n % 6)
    WHEN 0 THEN 'jiangxiang'
    WHEN 1 THEN '浓香'
    WHEN 2 THEN 'qingxiang'
    WHEN 3 THEN NULL
    WHEN 4 THEN '米香'
    ELSE '花果香'
  END AS aroma_raw,
  CASE WHEN n % 8 = 0 THEN '["tmp/rating-' || n || '.jpg"]' ELSE NULL END AS images,
  CASE
    WHEN n % 15 = 0 THEN 0.5
    WHEN n % 8 = 0 AND n % 3 = 0 THEN 1.3
    WHEN n % 8 = 0 THEN 1.2
    WHEN n % 3 = 0 THEN 1.1
    ELSE 1.0
  END AS rater_weight,
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-' || n || ' hours') AS created_at
FROM seq;

WITH RECURSIVE seq(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 30
)
INSERT INTO Favorites(user_id, liquor_id, created_at)
SELECT
  'user-' || printf('%03d', ((n - 1) % 20) + 1),
  'liq-' || printf('%03d', ((n * 2) % 52) + 1),
  strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-' || n || ' days')
FROM seq;

INSERT INTO Reports(id, user_id, target_type, target_id, reason, created_at)
VALUES
  ('rep-001', 'user-001', 'rating', 'rat-0003', '疑似营销刷分', strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-2 days')),
  ('rep-002', 'user-006', 'liquor', 'liq-010', '酒品信息疑似有误', strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-1 days'));
