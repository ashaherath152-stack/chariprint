// middleware/auth.js
// Protects admin routes using express-session.
// On successful login (see routes/admin.js), req.session.adminId is set.

function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.flash('error', 'Please log in to access the dashboard.');
  return res.redirect('/admin/login');
}

// Redirects already-logged-in admins away from the login page
function redirectIfAuthed(req, res, next) {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

module.exports = { requireAuth, redirectIfAuthed };
