# db 目录说明

该目录用于放置 SQLite 数据库文件（默认 `baijiu.sqlite`）。

- 默认路径：`./db/baijiu.sqlite`
- 可通过根目录 `.env` 中 `DB_PATH` 覆盖
- 首次执行 `npm run init-db` 会自动创建该文件
