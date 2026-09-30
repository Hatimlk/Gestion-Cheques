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
app.use('/api/utility-tracking', requireAuth, require('./routes/utility-tracking'));
app.use('/api/users', requireAuth, requireRole('Administrateur'), require('./routes/users'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

const db = require('./db');

async function initializeUtilityTracking() {
  await db.query(`CREATE TABLE IF NOT EXISTS utility_tracking (
    id SERIAL PRIMARY KEY, period DATE NOT NULL,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('GLOBAL','G1','G2','G3','G5')),
    electricity_amount NUMERIC(15,2), electricity_consumption NUMERIC(15,2),
    water_amount_1 NUMERIC(15,2), water_consumption_1 NUMERIC(15,2),
    water_amount_2 NUMERIC(15,2), water_consumption_2 NUMERIC(15,2),
    iam_fixed NUMERIC(15,2), iam_mobile NUMERIC(15,2), notes TEXT,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT NOW(), UNIQUE(period, unit)
  )`);
  await db.query(`INSERT INTO utility_tracking
    (period, unit, electricity_amount, water_amount_1, iam_fixed, iam_mobile, notes)
    VALUES
    ('2024-01-01','GLOBAL',19688.11,436.29,0,0,'Historique importé du classeur Excel'),
    ('2024-02-01','GLOBAL',23155.07,239.61,0,0,'Historique importé du classeur Excel'),
    ('2024-03-01','GLOBAL',25345.61,133.14,0,0,'Historique importé du classeur Excel'),
    ('2024-04-01','GLOBAL',22190.51,111.67,0,0,'Historique importé du classeur Excel'),
    ('2024-05-01','GLOBAL',18258.08,51.37,0,0,'Historique importé du classeur Excel'),
    ('2024-06-01','GLOBAL',10114.37,129.23,0,0,'Historique importé du classeur Excel'),
    ('2024-07-01','GLOBAL',7647.90,90.41,0,0,'Historique importé du classeur Excel'),
    ('2024-08-01','GLOBAL',16964.15,384.34,0,0,'Historique importé du classeur Excel'),
    ('2024-09-01','GLOBAL',19064.24,229.80,0,0,'Historique importé du classeur Excel'),
    ('2024-10-01','GLOBAL',17962.05,655.65,0,0,'Historique importé du classeur Excel'),
    ('2024-11-01','GLOBAL',23951.64,443.28,0,0,'Historique importé du classeur Excel'),
    ('2024-12-01','GLOBAL',14805.80,162.35,0,0,'Historique importé du classeur Excel'),
    ('2025-01-01','GLOBAL',22688.91,0,1740,12125.86,'Historique importé du classeur Excel'),
    ('2025-02-01','GLOBAL',20734.01,91.31,1530,12857.95,'Historique importé du classeur Excel'),
    ('2025-03-01','GLOBAL',11010,230.17,1530,11607.52,'Historique importé du classeur Excel'),
    ('2025-04-01','GLOBAL',21177.40,56.38,7223.91,11638.87,'Historique importé du classeur Excel'),
    ('2025-05-01','GLOBAL',16242.30,2507.93,7849.70,12652.14,'Historique importé du classeur Excel'),
    ('2025-06-01','GLOBAL',15897.23,129.23,7896.05,11545.73,'Historique importé du classeur Excel'),
    ('2025-07-01','GLOBAL',20191.60,129.83,7900,13422,'Historique importé du classeur Excel'),
    ('2025-08-01','GLOBAL',25716.23,51.24,7929.73,12422.11,'Historique importé du classeur Excel'),
    ('2025-09-01','GLOBAL',16978.77,74.63,8577.70,11849.15,'Historique importé du classeur Excel'),
    ('2025-10-01','GLOBAL',26015.31,61.05,8262.60,11753.96,'Historique importé du classeur Excel'),
    ('2025-11-01','GLOBAL',25882.70,80.67,8124.22,11879.95,'Historique importé du classeur Excel'),
    ('2025-12-01','GLOBAL',22670.27,70.86,8148.27,11916.23,'Historique importé du classeur Excel'),
    ('2026-01-01','GLOBAL',26846.65,1699.40,8309.74,7003.56,'Historique importé du classeur Excel'),
    ('2026-02-01','GLOBAL',21028.83,1755.64,9061.78,9261.65,'Historique importé du classeur Excel'),
    ('2026-03-01','GLOBAL',19585.46,1954.09,8522.18,9580.51,'Historique importé du classeur Excel'),
    ('2026-04-01','GLOBAL',19253.89,1442.14,8405.24,7023.82,'Historique importé du classeur Excel'),
    ('2026-05-01','GLOBAL',17354.99,1920.61,8405.71,7839.07,'Historique importé du classeur Excel'),
    ('2026-06-01','GLOBAL',17752.36,2319.05,8508.01,7849.92,'Historique importé du classeur Excel'),
    ('2026-07-01','GLOBAL',17973.83,2091.93,8318.37,7810.33,'Historique importé du classeur Excel'),
    ('2026-08-01','GLOBAL',18251.49,NULL,8272.15,NULL,'Historique importé du classeur Excel')
    ON CONFLICT (period, unit) DO NOTHING`);
}

async function startServer() {
  await initializeUtilityTracking();
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

if (require.main === module) startServer();

module.exports = { app, initializeUtilityTracking };
