// models/Settings.js
// Key-value site settings (business name, phone numbers, social links, about text)
// editable from the admin dashboard without touching code.

const pool = require('../config/db');

const Settings = {
  // Returns all settings as a simple { key: value } object for easy use in views
  async getAll() {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  },

  async get(key) {
    const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    return rows[0] ? rows[0].setting_value : null;
  },

  async set(key, value) {
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, value, value]
    );
  },

  // Bulk update — accepts an object of { key: value } pairs, used by the admin settings form
  async setMany(obj) {
    const entries = Object.entries(obj);
    for (const [key, value] of entries) {
      await this.set(key, value);
    }
  },
};

module.exports = Settings;
