// models/Inquiry.js
// Custom printing inquiry submissions from the public "Custom Printing" page.

const pool = require('../config/db');

const Inquiry = {
  async create({ name, phone, email, garment_type, quantity, details, reference_image_path }) {
    const [result] = await pool.query(
      `INSERT INTO inquiries (name, phone, email, garment_type, quantity, details, reference_image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email, garment_type, quantity, details, reference_image_path]
    );
    return result.insertId;
  },

  async getAll() {
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM inquiries WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM inquiries WHERE id = ?', [id]);
  },

  async countNew() {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'");
    return rows[0].count;
  },
};

module.exports = Inquiry;
