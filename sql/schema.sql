-- ================================================
-- Chari Fashion — Database Schema
-- Run this once to create the database structure.
-- Usage: mysql -u root -p < sql/schema.sql
-- ================================================

CREATE DATABASE IF NOT EXISTS chari_fashion
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE chari_fashion;

-- ----------------------------
-- Admin users (dashboard login)
-- ----------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Products (T-shirt designs / catalog items)
-- ----------------------------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(80) DEFAULT 'General',
  image_path VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------
-- Gallery images (general showcase, not tied to a product)
-- ----------------------------
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  image_path VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Custom printing inquiries (from the Custom Printing page form)
-- ----------------------------
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(150),
  garment_type VARCHAR(80),
  quantity INT,
  details TEXT,
  reference_image_path VARCHAR(255),
  status ENUM('new','contacted','closed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------
-- Site settings (business name, contact numbers, social links — editable without code)
-- ----------------------------
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value TEXT
);

INSERT INTO settings (setting_key, setting_value) VALUES
  ('business_name', 'Chari Fashion'),
  ('tagline', 'Custom DTF T-Shirt Printing'),
  ('phone_1', '0769390735'),
  ('phone_2', '0767424749'),
  ('whatsapp_1', '94769390735'),
  ('whatsapp_2', '94767424749'),
  ('email', 'info@charifashion.com'),
  ('address', 'Sri Lanka'),
  ('instagram_url', 'https://www.instagram.com/chari_fashion_?igsh=M2wzemxhazl3OHJ3'),
  ('facebook_url', 'https://www.facebook.com/share/1H8dv4KD4v/'),
  ('tiktok_url', 'https://www.tiktok.com/@chari.fashion7?_r=1&_t=ZS-97C28sbvf2g'),
  ('about_text', 'Chari Fashion is a Sri Lankan DTF printing studio. We turn your designs into wearable, durable prints on t-shirts and apparel, for individuals, teams, and businesses.')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ----------------------------
-- Admin user creation
-- Do NOT insert a hardcoded password hash here. Instead, after running this
-- schema, create your admin account by running:
--
--     npm run seed
--
-- That script will prompt you for a username and password and store a
-- properly generated bcrypt hash. This keeps your real password out of
-- this file entirely.
-- ----------------------------
