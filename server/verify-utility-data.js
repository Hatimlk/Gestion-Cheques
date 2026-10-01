require('dotenv').config();
const db = require('./db');

async function verify() {
  const table = await db.query("SELECT to_regclass('public.utility_tracking') AS table_name");
  if (!table.rows[0].table_name) throw new Error('La table utility_tracking est absente.');
  const summary = await db.query(`SELECT COUNT(1)::int AS total,
    MIN(period)::text AS first_period, MAX(period)::text AS last_period
    FROM utility_tracking`);
  const counts = await db.query(`SELECT unit, COUNT(1)::int AS count
    FROM utility_tracking GROUP BY unit ORDER BY unit`);
  console.log(JSON.stringify({ table: table.rows[0].table_name, ...summary.rows[0], byUnit: counts.rows }));
  await db.end();
}

verify().catch(async error => {
  console.error(error.message);
  await db.end().catch(() => {});
  process.exit(1);
});

