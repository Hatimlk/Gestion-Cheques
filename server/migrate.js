const db = require('./db');

async function migrate() {
  try {
    console.log('Running database migrations...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS instances (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        facture VARCHAR(100) NOT NULL,
        partner_id VARCHAR(50),
        partner_name VARCHAR(200) NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        payment_delay VARCHAR(100) NOT NULL,
        convention VARCHAR(100) NOT NULL,
        mdp VARCHAR(50) NOT NULL,
        payment_date DATE,
        observation TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database migration failed:', err);
    process.exit(1);
  }
}

migrate();
