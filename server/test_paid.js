const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://openpg:openpgpwd@localhost:5432/gadimat_db' });
pool.query('SELECT * FROM checks WHERE status = $1', ['Payé'])
  .then(res => { console.log('Paid checks:', res.rows.length); pool.end(); })
  .catch(console.error);
