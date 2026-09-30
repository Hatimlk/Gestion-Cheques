require('dotenv').config();
const path = require('path');
const XLSX = require(path.join(__dirname, '..', 'node_modules', 'xlsx'));
const db = require('./db');

const MONTHS = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
};

function text(value) {
  return String(value ?? '').trim();
}

function normalizeWord(value) {
  return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function numeric(value) {
  if (value === null || value === undefined || text(value) === '' || text(value) === '-') return null;
  const parsed = typeof value === 'number' ? value : Number(text(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

async function ensureTable() {
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
}

async function upsert(client, row) {
  await client.query(`INSERT INTO utility_tracking
    (period, unit, electricity_amount, electricity_consumption, water_amount_1,
      water_consumption_1, water_amount_2, water_consumption_2, iam_fixed, iam_mobile, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (period, unit) DO UPDATE SET
      electricity_amount=EXCLUDED.electricity_amount,
      electricity_consumption=EXCLUDED.electricity_consumption,
      water_amount_1=EXCLUDED.water_amount_1,
      water_consumption_1=EXCLUDED.water_consumption_1,
      water_amount_2=EXCLUDED.water_amount_2,
      water_consumption_2=EXCLUDED.water_consumption_2,
      iam_fixed=EXCLUDED.iam_fixed, iam_mobile=EXCLUDED.iam_mobile,
      notes=EXCLUDED.notes, updated_at=NOW()`,
    [row.period, row.unit, row.electricityAmount, row.electricityConsumption,
      row.waterAmount1, row.waterConsumption1, row.waterAmount2, row.waterConsumption2,
      row.iamFixed, row.iamMobile, 'Import complet du classeur Excel du 11-09-2026']
  );
}

async function run() {
  const file = process.argv[2];
  if (!file) throw new Error('Chemin du fichier Excel requis.');
  const workbook = XLSX.readFile(file, { cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // Keep blank rows so array indexes continue to match the worksheet row numbers.
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null, blankrows: true });
  await ensureTable();

  let year = null;
  let month = null;
  const detailRows = [];
  const globalRows = [];

  for (let index = 0; index < rows.length; index += 1) {
    const cells = rows[index];
    const parsedYear = Number(cells[0]);
    if (Number.isInteger(parsedYear) && parsedYear >= 2000) year = parsedYear;
    const monthNumber = MONTHS[normalizeWord(cells[1])];
    if (monthNumber) month = monthNumber;
    const unit = text(cells[2]).toUpperCase();
    if (!year || !month || !['G1', 'G2', 'G3', 'G5'].includes(unit)) continue;
    const period = `${year}-${String(month).padStart(2, '0')}-01`;
    const detail = {
      period, unit,
      electricityAmount: numeric(cells[3]), electricityConsumption: numeric(cells[4]),
      waterAmount1: numeric(cells[6]), waterConsumption1: numeric(cells[7]),
      waterAmount2: numeric(cells[8]), waterConsumption2: numeric(cells[9]),
      iamFixed: null, iamMobile: null,
    };
    if (Object.values(detail).slice(2).some(value => value !== null)) detailRows.push(detail);

    const electricityTotal = numeric(cells[5]);
    const waterTotal = numeric(cells[10]);
    const iamFixed = numeric(cells[11]);
    const iamMobile = numeric(cells[12]);
    if ([electricityTotal, waterTotal, iamFixed, iamMobile].some(value => value !== null)) {
      globalRows.push({ period, unit: 'GLOBAL', electricityAmount: electricityTotal,
        electricityConsumption: null, waterAmount1: waterTotal, waterConsumption1: null,
        waterAmount2: null, waterConsumption2: null, iamFixed, iamMobile });
    }
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Replace only rows originating from the workbook; preserve manual user entries.
    await client.query(`DELETE FROM utility_tracking
      WHERE notes LIKE 'Historique import%' OR notes LIKE 'Import complet du classeur Excel%'`);
    for (const row of [...globalRows, ...detailRows]) await upsert(client, row);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const result = await db.query(`SELECT unit, COUNT(*)::int AS count FROM utility_tracking GROUP BY unit ORDER BY unit`);
  console.log(JSON.stringify({ imported: globalRows.length + detailRows.length, database: result.rows }));
  await db.end();
}

run().catch(async error => {
  console.error(error.message);
  await db.end().catch(() => {});
  process.exit(1);
});
