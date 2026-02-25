const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db/sqlite');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

automaticBootstrap();

const liquorsRoutes = require('./routes/liquors');
const ratingsRoutes = require('./routes/ratings');
const meRoutes = require('./routes/me');
const reportsRoutes = require('./routes/reports');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api/liquors', liquorsRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/me', meRoutes);
app.use('/api/reports', reportsRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API route not found'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err && err.message ? err.message : 'Internal server error'
    }
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[server] listening on http://127.0.0.1:${PORT}`);
});

function automaticBootstrap() {
  try {
    initSchema();
  } catch (error) {
    console.error('[bootstrap] failed to init schema', error);
    process.exit(1);
  }
}
