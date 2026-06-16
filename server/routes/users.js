const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// GET /api/users
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, status FROM users ORDER BY created_at'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [name, email.toLowerCase(), hash, role, status || 'Actif']
    );
    res.status(201).json({ id: rows[0].id, name, email: email.toLowerCase(), role, status: status || 'Actif' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, status, password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET name=$1, email=$2, role=$3, status=$4, password_hash=$5 WHERE id=$6',
        [name, email.toLowerCase(), role, status, hash, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE users SET name=$1, email=$2, role=$3, status=$4 WHERE id=$5',
        [name, email.toLowerCase(), role, status, req.params.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/users/:id/toggle-status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    await db.query(
      `UPDATE users SET status = CASE WHEN status = 'Actif' THEN 'Inactif' ELSE 'Actif' END WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
