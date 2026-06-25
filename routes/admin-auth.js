// routes/admin-auth.js
// Login / logout for the admin dashboard.

const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { redirectIfAuthed } = require('../middleware/auth');

router.get('/login', redirectIfAuthed, (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login',
    error: req.flash('error'),
  });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      req.flash('error', 'Username and password are required.');
      return res.redirect('/admin/login');
    }

    const admin = await Admin.findByUsername(username.trim());
    if (!admin) {
      // Same error for unknown username vs wrong password — avoids leaking
      // which usernames exist to anyone probing the login form.
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/admin/login');
    }

    const valid = await Admin.verifyPassword(password, admin.password_hash);
    if (!valid) {
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/admin/login');
    }

    req.session.adminId = admin.id;
    req.session.adminUsername = admin.username;
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/admin/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
