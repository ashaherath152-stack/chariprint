// sql/seed.js
// Run this once after setting up the database to create (or reset) the admin user
// with a properly generated bcrypt hash. Usage: npm run seed
//
// This avoids relying on a hardcoded hash in schema.sql, which is safer since
// you choose your own password right here interactively.

require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(question, resolve);
      return;
    }
    // Simple hidden input for password
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode(true);
    let input = '';
    const onData = (char) => {
      char = char.toString();
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(input);
      } else if (char === '\u0003') {
        process.exit();
      } else if (char === '\u007f') {
        input = input.slice(0, -1);
      } else {
        input += char;
      }
    };
    stdin.on('data', onData);
  });
}

(async () => {
  console.log('=== Chari Fashion — Admin Account Setup ===\n');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: 'railway',
});

  try {
    const username = (await ask('Admin username [admin]: ')) || 'admin';
    let password = await ask('Admin password (min 8 characters): ', true);

    while (!password || password.length < 8) {
      console.log('Password must be at least 8 characters.');
      password = await ask('Admin password (min 8 characters): ', true);
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO admins (username, password_hash) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = ?`,
      [username, hash, hash]
    );

    console.log(`\n✓ Admin account ready. Username: "${username}"`);
    console.log('  You can now log in at /admin/login with that username and password.');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
    rl.close();
    process.exit(0);
  }
})();
