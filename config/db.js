const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: 'railway',
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
