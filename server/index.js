require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const requireAuth = require('./middleware/auth');

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/bank-accounts', requireAuth, require('./routes/bank-accounts'));
app.use('/api/checkbooks',    requireAuth, require('./routes/checkbooks'));
app.use('/api/checks',        requireAuth, require('./routes/checks'));
app.use('/api/partners',      requireAuth, require('./routes/partners'));
app.use('/api/users',         requireAuth, require('./routes/users'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Gadimat API running on port ${PORT}`));
