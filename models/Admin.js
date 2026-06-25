// models/Admin.js
// Admin user lookups + password change support.

const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = {
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  },

  async updatePassword(id, newPlainPassword) {
    const hash = await bcrypt.hash(newPlainPassword, 10);
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, id]);
  },

  async createAdmin(username, plainPassword) {
    const hash = await bcrypt.hash(plainPassword, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );
    return result.insertId;
  },
};

module.exports = Admin;
