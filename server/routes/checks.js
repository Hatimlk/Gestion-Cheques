const router = require('express').Router();
const db = require('../db');

// GET /api/checks  — overdue status computed on read
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        id,
        bank_account_id AS "bankAccountId",
        checkbook_id AS "checkbookId",
        type,
        number,
        partner_id AS "partnerId",
        partner_name AS "partnerName",
        emission_date::text AS "emissionDate",
        due_date::text AS "dueDate",
        amount::float,
        CASE
          WHEN status = 'En Circulation' AND due_date < CURRENT_DATE THEN 'En Retard'
          ELSE status
        END AS status,
        note,
        facture
      FROM checks
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/checks
router.post('/', async (req, res) => {
  try {
    const { bankAccountId, checkbookId, type, number, partnerId, partnerName, emissionDate, dueDate, amount, note, facture } = req.body;
    if (!bankAccountId || !type || !number || !partnerName || !emissionDate || !dueDate || amount == null) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const due = new Date(dueDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const status = due < today ? 'En Retard' : 'En Circulation';
    const id = `ch_${Date.now()}`;

    await db.query(
      `INSERT INTO checks (id, bank_account_id, checkbook_id, type, number, partner_id, partner_name, emission_date, due_date, amount, status, note, facture)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [id, bankAccountId, checkbookId || null, type, number, partnerId || null, partnerName, emissionDate, dueDate, amount, status, note || null, facture || null]
    );

    if (checkbookId) {
      await db.query('UPDATE checkbooks SET remaining = GREATEST(0, remaining - 1) WHERE id = $1', [checkbookId]);
    }

    res.status(201).json({ id, bankAccountId, checkbookId: checkbookId || undefined, type, number, partnerId: partnerId || '', partnerName, emissionDate, dueDate, amount, status, note, facture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/checks/:id
router.put('/:id', async (req, res) => {
  try {
    const { bankAccountId, type, number, partnerId, partnerName, emissionDate, dueDate, amount, status, note, facture } = req.body;

    const { rows } = await db.query('SELECT status, due_date FROM checks WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Chèque introuvable.' });

    const currentStatus = rows[0].status;
    let newStatus = status ?? currentStatus;
    if (dueDate && (newStatus === 'En Circulation' || newStatus === 'En Retard')) {
      const due = new Date(dueDate);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      newStatus = due < today ? 'En Retard' : 'En Circulation';
    }

    await db.query(
      `UPDATE checks SET
        bank_account_id = COALESCE($1, bank_account_id),
        type = COALESCE($2, type),
        number = COALESCE($3, number),
        partner_id = $4,
        partner_name = COALESCE($5, partner_name),
        emission_date = COALESCE($6, emission_date),
        due_date = COALESCE($7, due_date),
        amount = COALESCE($8, amount),
        status = $9,
        note = $10,
        facture = $11
       WHERE id = $12`,
      [bankAccountId, type, number, partnerId || null, partnerName, emissionDate, dueDate, amount, newStatus, note || null, facture || null, req.params.id]
    );

    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/checks/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status requis.' });
    await db.query('UPDATE checks SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/checks/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM checks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
