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
app.use('/api/users', requireAuth, requireRole('Administrateur'), require('./routes/users'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gadimat API running on port ${PORT}`));
