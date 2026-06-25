// models/Gallery.js
// Handles the general showcase gallery (separate from product photos).

const pool = require('../config/db');

const Gallery = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create({ title, image_path, sort_order = 0 }) {
    const [result] = await pool.query(
      'INSERT INTO gallery_images (title, image_path, sort_order) VALUES (?, ?, ?)',
      [title, image_path, sort_order]
    );
    return result.insertId;
  },

  async updateTitle(id, title, sort_order) {
    await pool.query(
      'UPDATE gallery_images SET title = ?, sort_order = ? WHERE id = ?',
      [title, sort_order, id]
    );
  },

  async delete(id) {
    await pool.query('DELETE FROM gallery_images WHERE id = ?', [id]);
  },
};

module.exports = Gallery;
