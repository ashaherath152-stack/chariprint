// server.js
// Application entry point — wires up Express, sessions, view engine, and routes.

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const publicRoutes = require('./routes/public');
const adminAuthRoutes = require('./routes/admin-auth');
const adminRoutes = require('./routes/admin');

const app = express();

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Body parsing ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Sessions (used for admin login state) ----------
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // requires HTTPS in production
    maxAge: 1000 * 60 * 60 * 4, // 4 hour admin session
  },
}));

// ---------- Flash messages (success/error banners after redirects) ----------
app.use(flash());

// ---------- Routes ----------
app.use('/admin', adminAuthRoutes); // /admin/login, /admin/logout
app.use('/admin', adminRoutes);     // /admin/dashboard, /admin/products, etc.
app.use('/', publicRoutes);         // Home, About, Services, Gallery, Custom Printing, Contact

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).render('public/404', {
    title: 'Page Not Found',
    metaDescription: 'The page you are looking for could not be found.',
    activePage: '',
  });
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong on our end. Please try again shortly.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chari Fashion running at http://localhost:${PORT}`);
});
