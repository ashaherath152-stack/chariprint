// config/db.js
// Creates a reusable MySQL connection pool using mysql2/promise.
// All models import `pool` from here to run queries.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chari_fashion',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Quick sanity check on startup — logs a clear message if the DB is unreachable
// rather than failing silently on the first request.
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('✗ MySQL connection failed:', err.message);
    console.error('  Check your .env DB_HOST / DB_USER / DB_PASSWORD / DB_NAME values,');
    console.error('  and make sure you ran: mysql -u root -p < sql/schema.sql');
  }
})();

module.exports = pool;

