const router = require('express').Router();
const db = require('../db');
const { validate, partnerSchema, partnerUpdateSchema } = require('../validation');

router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, type, name, contact, phone, balance::float, convention FROM partners ORDER BY created_at'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.post('/', validate(partnerSchema), async (req, res) => {
  try {
    const { type, name, contact, phone, balance, convention } = req.body;
    const { rows } = await db.query(
      'INSERT INTO partners (type, name, contact, phone, balance, convention) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [type, name, contact || '', phone || '', balance || 0, convention || null]
    );
    res.status(201).json({ id: rows[0].id, type, name, contact: contact || '', phone: phone || '', balance: balance || 0, convention: convention || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

router.put('/:id', validate(partnerUpdateSchema), async (req, res) => {
  try {
    const { type, name, contact, phone, balance, convention } = req.body;
    await db.query(
      'UPDATE partners SET type=COALESCE($1,type), name=COALESCE($2,name), contact=COALESCE($3,contact), phone=COALESCE($4,phone), balance=COALESCE($5,balance), convention=COALESCE($6,convention) WHERE id=$7',
      [type, name, contact, phone, balance, convention, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

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
