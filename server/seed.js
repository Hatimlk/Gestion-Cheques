// Creates the initial admin user. Run once: node seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  const password = process.argv[2] || 'Admin123!';
  const hash = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, 'Administrateur', 'Actif')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    ['Hatim Lk', 'hatim@gadimat.ma', hash]
  );

  console.log(`Admin created: hatim@gadimat.ma / ${password}`);
  console.log('Change this password after first login.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
