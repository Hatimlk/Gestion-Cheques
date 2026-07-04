require('dotenv').config();
const db = require('./db');

async function migrate() {
  try {
    await db.query('ALTER TABLE partners ADD COLUMN convention VARCHAR(100);');
    console.log('Migration successful: added convention to partners');
  } catch (err) {
    if (err.code === '42701') { // duplicate_column
      console.log('Column convention already exists, skipping.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    process.exit();
  }
}

migrate();
