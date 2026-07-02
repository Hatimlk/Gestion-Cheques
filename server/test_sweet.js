const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://openpg:openpgpwd@localhost:5432/gadimat_db' });
pool.query('SELECT COUNT(*) FROM instances WHERE partner_name = $1', ['SWEET MICRO SYSTEM'])
  .then(res => { console.log('Sweet Micro instances:', res.rows[0].count); pool.end(); })
  .catch(console.error);
