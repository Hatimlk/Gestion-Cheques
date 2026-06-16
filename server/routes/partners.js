const router = require('express').Router();
const db = require('../db');

// GET /api/partners
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, type, name, contact, phone, balance::float FROM partners ORDER BY created_at'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/partners
router.post('/', async (req, res) => {
  try {
    const { type, name, contact, phone, balance } = req.body;
    if (!type || !name) return res.status(400).json({ error: 'Champs requis manquants.' });
    const { rows } = await db.query(
      'INSERT INTO partners (type, name, contact, phone, balance) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [type, name, contact || '', phone || '', balance || 0]
    );
    res.status(201).json({ id: rows[0].id, type, name, contact: contact || '', phone: phone || '', balance: balance || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/partners/:id
router.put('/:id', async (req, res) => {
  try {
    const { type, name, contact, phone, balance } = req.body;
    await db.query(
      'UPDATE partners SET type=$1, name=$2, contact=$3, phone=$4, balance=$5 WHERE id=$6',
      [type, name, contact, phone, balance, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/partners/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM partners WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
