require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  const adminPass = 'Admin123!';
  const userPass = 'User123!';

  const adminHash = await bcrypt.hash(adminPass, 10);
  const userHash = await bcrypt.hash(userPass, 10);

  await db.query('DELETE FROM users');

  await db.query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, 'Administrateur', 'Actif')`,
    ['Admin', 'admin@gadimat.com', adminHash]
  );

  await db.query(
    `INSERT INTO users (name, email, password_hash, role, status)
     VALUES ($1, $2, $3, 'Utilisateur', 'Actif')`,
    ['Leila', 'leila@gadimat.com', userHash]
  );

  console.log('Seed completed: admin@gadimat.com / Leila created');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
