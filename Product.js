// models/Product.js
// All database queries related to products live here.
// Routes call these functions instead of writing raw SQL inline.

const pool = require('../config/db');

const Product = {
  // Get all active products, optionally filtered by category, newest sort_order first
  async getAllActive(category = null) {
    let sql = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  // Get every product regardless of active status — used in the admin dashboard
  async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY sort_order ASC, created_at DESC'
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Distinct categories currently in use, for filter dropdowns
  async getCategories() {
    const [rows] = await pool.query(
      'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC'
    );
    return rows.map(r => r.category);
  },

  async create({ name, description, price, category, image_path, is_active = 1, sort_order = 0 }) {
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, category, image_path, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, image_path, is_active, sort_order]
    );
    return result.insertId;
  },

  async update(id, { name, description, price, category, is_active, sort_order }) {
    await pool.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, category = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [name, description, price, category, is_active, sort_order, id]
    );
  },

  // Separate method so image only gets overwritten when a new file is actually uploaded
  async updateImage(id, image_path) {
    await pool.query('UPDATE products SET image_path = ? WHERE id = ?', [image_path, id]);
  },

  async delete(id) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  },

  async toggleActive(id, is_active) {
    await pool.query('UPDATE products SET is_active = ? WHERE id = ?', [is_active, id]);
  },
};

module.exports = Product;
