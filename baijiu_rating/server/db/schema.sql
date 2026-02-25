PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Liquor (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  images TEXT NOT NULL,
  aroma_std TEXT,
  aroma_raw_top TEXT
);

CREATE TABLE IF NOT EXISTS Rating (
  id TEXT PRIMARY KEY,
  liquor_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  scene TEXT NOT NULL,
  score_overall INTEGER NOT NULL,
  score_smooth INTEGER NOT NULL,
  score_softness INTEGER NOT NULL,
  score_aroma_like INTEGER NULL,
  score_value INTEGER NOT NULL,
  score_gift_face INTEGER NULL,
  review_text TEXT NULL,
  aroma_raw TEXT NULL,
  images TEXT NULL,
  rater_weight REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (liquor_id) REFERENCES Liquor(id)
);

CREATE TABLE IF NOT EXISTS Favorites (
  user_id TEXT NOT NULL,
  liquor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(user_id, liquor_id),
  FOREIGN KEY (liquor_id) REFERENCES Liquor(id)
);

CREATE TABLE IF NOT EXISTS Reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rating_liquor_scene ON Rating(liquor_id, scene);
CREATE INDEX IF NOT EXISTS idx_rating_scene ON Rating(scene);
CREATE INDEX IF NOT EXISTS idx_rating_user_time ON Rating(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON Favorites(user_id);
