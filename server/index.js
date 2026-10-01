require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const requireAuth = require('./middleware/auth');
const requireRole = require('./middleware/rbac');

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/bank-accounts', requireAuth, require('./routes/bank-accounts'));
app.use('/api/checkbooks', requireAuth, require('./routes/checkbooks'));
app.use('/api/checks', requireAuth, require('./routes/checks'));
app.use('/api/partners', requireAuth, require('./routes/partners'));
app.use('/api/instances', requireAuth, require('./routes/instances'));
app.use('/api/consumptions', requireAuth, require('./routes/consumptions'));
app.use('/api/users', requireAuth, requireRole('Administrateur'), require('./routes/users'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

const db = require('./db');

async function startServer() {
  await db.query(`CREATE TABLE IF NOT EXISTS consumption_branches (
    id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT NOW())`);
  await db.query(`CREATE TABLE IF NOT EXISTS consumption_records (
    id SERIAL PRIMARY KEY, branch_id INTEGER REFERENCES consumption_branches(id) ON DELETE RESTRICT,
    year SMALLINT NOT NULL CHECK(year BETWEEN 2000 AND 2100), month SMALLINT NOT NULL CHECK(month BETWEEN 1 AND 12),
    electricity_amount NUMERIC(15,2), electricity_kwh NUMERIC(15,2), water_amount NUMERIC(15,2), water_m3 NUMERIC(15,2),
    telecom_internet_fixed_amount NUMERIC(15,2), telecom_mobile_amount NUMERIC(15,2), notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
  await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS consumption_records_period_uidx
    ON consumption_records (COALESCE(branch_id,0),year,month)`);
  await db.query(`INSERT INTO consumption_branches(code,name) VALUES ('G1','G1'),('G2','G2'),('G3','G3'),('G5','G5')
    ON CONFLICT(code) DO NOTHING`);
  try {
    await db.query('ALTER TABLE partners ADD COLUMN convention VARCHAR(100);');
    console.log('Auto-migration: added convention to partners');
  } catch (err) {
    // 42701 is the PostgreSQL code for duplicate_column
    if (err.code !== '42701') {
      console.error('Auto-migration error (non-fatal):', err.message);
    }
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Gadimat API running on port ${PORT}`));
}

startServer();
