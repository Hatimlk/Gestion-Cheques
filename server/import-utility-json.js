require('dotenv').config();
const fs = require('fs');
const db = require('./db');

const MONTHS = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};
const clean = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const value = input => input === null || input === undefined || input === '' || input === '-' ? null : Number(input);

async function upsert(client, row) {
  await client.query(`INSERT INTO utility_tracking
    (period, unit, electricity_amount, electricity_consumption, water_amount_1,
      water_consumption_1, water_amount_2, water_consumption_2, iam_fixed, iam_mobile, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (period, unit) DO UPDATE SET
      electricity_amount=EXCLUDED.electricity_amount, electricity_consumption=EXCLUDED.electricity_consumption,
      water_amount_1=EXCLUDED.water_amount_1, water_consumption_1=EXCLUDED.water_consumption_1,
      water_amount_2=EXCLUDED.water_amount_2, water_consumption_2=EXCLUDED.water_consumption_2,
      iam_fixed=EXCLUDED.iam_fixed, iam_mobile=EXCLUDED.iam_mobile,
      notes=EXCLUDED.notes, updated_at=NOW()`,
    [row.period, row.unit, row.electricityAmount, row.electricityConsumption,
      row.waterAmount1, row.waterConsumption1, row.waterAmount2, row.waterConsumption2,
      row.iamFixed, row.iamMobile, 'Import fidèle du fichier JSON du 11-09-2026']
  );
}

async function run() {
  const file = process.argv[2];
  if (!file) throw new Error('Chemin du fichier JSON requis.');
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = [];
  for (const year of source.annees || []) {
    for (const month of year.mois || []) {
      const monthNumber = MONTHS[clean(month.mois)];
      if (!monthNumber) throw new Error(`Mois non reconnu : ${month.mois}`);
      const period = `${year.annee}-${String(monthNumber).padStart(2, '0')}-01`;
      rows.push({ period, unit: 'GLOBAL', electricityAmount: value(month.electricite_total_mensuel),
        electricityConsumption: null, waterAmount1: value(month.eau_total_mensuel), waterConsumption1: null,
        waterAmount2: null, waterConsumption2: null, iamFixed: value(month.maroc_telecom?.inter_fix),
        iamMobile: value(month.maroc_telecom?.mobile) });
      for (const item of month.unites || []) {
        rows.push({ period, unit: item.unite, electricityAmount: value(item.electricite?.montant),
          electricityConsumption: value(item.electricite?.conso_kwh), waterAmount1: value(item.eau?.montant),
          waterConsumption1: value(item.eau?.conso_m3), waterAmount2: value(item.eau?.montant_2),
          waterConsumption2: value(item.eau?.conso_m3_2), iamFixed: null, iamMobile: null });
      }
    }
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM utility_tracking WHERE notes LIKE 'Historique import%'
      OR notes LIKE 'Import complet du classeur Excel%' OR notes LIKE 'Import fidèle du fichier JSON%'`);
    for (const row of rows) await upsert(client, row);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }

  const result = await db.query('SELECT unit, COUNT(*)::int AS count FROM utility_tracking GROUP BY unit ORDER BY unit');
  console.log(JSON.stringify({ imported: rows.length, database: result.rows }));
  await db.end();
}

run().catch(async error => { console.error(error.message); await db.end().catch(() => {}); process.exit(1); });

