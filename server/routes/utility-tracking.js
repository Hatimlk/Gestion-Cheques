const router = require('express').Router();
const db = require('../db');

const editableByLeila = (req, res, next) => {
  const name = String(req.user?.name || '').trim().toLowerCase();
  const email = String(req.user?.email || '').trim().toLowerCase();
  if (req.user?.role !== 'Administrateur' && name !== 'leila' && !email.startsWith('leila@')) {
    return res.status(403).json({ error: 'La saisie est réservée à Leila et aux administrateurs.' });
  }
  next();
};

const numberOrNull = value => value === '' || value === null || value === undefined ? null : Number(value);

function normalize(body) {
  const period = String(body.period || '');
  const unit = String(body.unit || '').trim().toUpperCase();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(period) || !['GLOBAL', 'G1', 'G2', 'G3', 'G5'].includes(unit)) {
    return null;
  }
  const fields = ['electricityAmount', 'electricityConsumption', 'waterAmount1', 'waterConsumption1',
    'waterAmount2', 'waterConsumption2', 'iamFixed', 'iamMobile'];
  const data = { period: `${period.slice(0, 7)}-01`, unit, notes: String(body.notes || '').trim().slice(0, 1000) || null };
  for (const field of fields) {
    data[field] = numberOrNull(body[field]);
    if (data[field] !== null && (!Number.isFinite(data[field]) || data[field] < 0)) return null;
  }
  return data;
}

router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, period::text, unit,
        electricity_amount::float AS "electricityAmount",
        electricity_consumption::float AS "electricityConsumption",
        water_amount_1::float AS "waterAmount1", water_consumption_1::float AS "waterConsumption1",
        water_amount_2::float AS "waterAmount2", water_consumption_2::float AS "waterConsumption2",
        iam_fixed::float AS "iamFixed", iam_mobile::float AS "iamMobile", notes,
        updated_at AS "updatedAt"
      FROM utility_tracking ORDER BY period DESC, CASE unit WHEN 'GLOBAL' THEN 0 ELSE 1 END, unit
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du chargement du suivi.' });
  }
});

router.post('/', editableByLeila, async (req, res) => {
  const data = normalize(req.body);
  if (!data) return res.status(400).json({ error: 'Données de consommation invalides.' });
  try {
    const { rows } = await db.query(`
      INSERT INTO utility_tracking (period, unit, electricity_amount, electricity_consumption,
        water_amount_1, water_consumption_1, water_amount_2, water_consumption_2,
        iam_fixed, iam_mobile, notes, updated_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (period, unit) DO UPDATE SET
        electricity_amount=EXCLUDED.electricity_amount, electricity_consumption=EXCLUDED.electricity_consumption,
        water_amount_1=EXCLUDED.water_amount_1, water_consumption_1=EXCLUDED.water_consumption_1,
        water_amount_2=EXCLUDED.water_amount_2, water_consumption_2=EXCLUDED.water_consumption_2,
        iam_fixed=EXCLUDED.iam_fixed, iam_mobile=EXCLUDED.iam_mobile, notes=EXCLUDED.notes,
        updated_by=EXCLUDED.updated_by, updated_at=NOW()
      RETURNING id, period::text, unit, electricity_amount::float AS "electricityAmount",
        electricity_consumption::float AS "electricityConsumption", water_amount_1::float AS "waterAmount1",
        water_consumption_1::float AS "waterConsumption1", water_amount_2::float AS "waterAmount2",
        water_consumption_2::float AS "waterConsumption2", iam_fixed::float AS "iamFixed",
        iam_mobile::float AS "iamMobile", notes, updated_at AS "updatedAt"`,
      [data.period, data.unit, data.electricityAmount, data.electricityConsumption,
        data.waterAmount1, data.waterConsumption1, data.waterAmount2, data.waterConsumption2,
        data.iamFixed, data.iamMobile, data.notes, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’enregistrement.' });
  }
});

router.delete('/:id', editableByLeila, async (req, res) => {
  try {
    await db.query('DELETE FROM utility_tracking WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;

