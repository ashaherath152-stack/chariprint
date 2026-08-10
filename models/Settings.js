const pool = require('../config/db');

const Settings = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings'
    );

    const settings = {};

    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return settings;
  },

  async get(key) {
    const [rows] = await pool.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      [key]
    );

    return rows[0] ? rows[0].setting_value : null;
  },

  async set(key, value) {
    await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, value, value]
    );
  },

  async setMany(obj) {
    const entries = Object.entries(obj);

    for (const [key, value] of entries) {
      await this.set(key, value);
    }
  }
};

module.exports = Settings;