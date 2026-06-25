// routes/admin.js
// Protected admin dashboard: product CRUD, gallery management,
// inquiry inbox, and site settings — all without touching code.

const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const Gallery = require('../models/Gallery');
const Settings = require('../models/Settings');
const Inquiry = require('../models/Inquiry');
const Admin = require('../models/Admin');
const { requireAuth } = require('../middleware/auth');
const { uploadProduct, uploadGallery, optimizeImage } = require('../middleware/upload');

// Every admin route below requires login
router.use(requireAuth);

// Flash messages + current admin username available in every admin view
router.use((req, res, next) => {
  res.locals.flashSuccess = req.flash('success');
  res.locals.flashError = req.flash('error');
  res.locals.adminUsername = req.session.adminUsername;
  next();
});

// ---------- DASHBOARD HOME ----------
router.get('/dashboard', async (req, res) => {
  try {
    const products = await Product.getAll();
    const galleryImages = await Gallery.getAll();
    const newInquiries = await Inquiry.countNew();
    res.render('admin/dashboard', {
      title: 'Dashboard',
      stats: {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.is_active).length,
        totalGalleryImages: galleryImages.length,
        newInquiries,
      },
    });
  } catch (err) {
    console.error(err);
    res.render('admin/dashboard', {
      title: 'Dashboard',
      stats: { totalProducts: 0, activeProducts: 0, totalGalleryImages: 0, newInquiries: 0 },
    });
  }
});

// ---------- PRODUCTS: LIST ----------
router.get('/products', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.render('admin/products', { title: 'Manage Products', products });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load products.');
    res.render('admin/products', { title: 'Manage Products', products: [] });
  }
});

// ---------- PRODUCTS: NEW (form) ----------
router.get('/products/new', (req, res) => {
  res.render('admin/product-form', { title: 'Add Product', product: null });
});

// ---------- PRODUCTS: CREATE ----------
router.post('/products/new', uploadProduct.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, sort_order } = req.body;

    if (!name || !price) {
      req.flash('error', 'Name and price are required.');
      return res.redirect('/admin/products/new');
    }

    let imagePath = null;
    if (req.file) {
      await optimizeImage(req.file.path);
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    await Product.create({
      name,
      description: description || '',
      price: parseFloat(price),
      category: category || 'General',
      image_path: imagePath,
      is_active: req.body.is_active ? 1 : 0,
      sort_order: sort_order ? parseInt(sort_order, 10) : 0,
    });

    req.flash('success', `"${name}" was added successfully.`);
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not create product. ' + (err.message || ''));
    res.redirect('/admin/products/new');
  }
});

// ---------- PRODUCTS: EDIT (form) ----------
router.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      req.flash('error', 'Product not found.');
      return res.redirect('/admin/products');
    }
    res.render('admin/product-form', { title: 'Edit Product', product });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load product.');
    res.redirect('/admin/products');
  }
});

// ---------- PRODUCTS: UPDATE ----------
router.post('/products/:id/edit', uploadProduct.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, sort_order } = req.body;

    if (!name || !price) {
      req.flash('error', 'Name and price are required.');
      return res.redirect(`/admin/products/${id}/edit`);
    }

    await Product.update(id, {
      name,
      description: description || '',
      price: parseFloat(price),
      category: category || 'General',
      is_active: req.body.is_active ? 1 : 0,
      sort_order: sort_order ? parseInt(sort_order, 10) : 0,
    });

    // Only touch the image if a new file was actually uploaded —
    // this is what lets the admin edit price/description without re-uploading a photo.
    if (req.file) {
      await optimizeImage(req.file.path);
      await Product.updateImage(id, `/uploads/products/${req.file.filename}`);
    }

    req.flash('success', `"${name}" was updated successfully.`);
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update product. ' + (err.message || ''));
    res.redirect('/admin/products');
  }
});

// ---------- PRODUCTS: DELETE ----------
router.post('/products/:id/delete', async (req, res) => {
  try {
    await Product.delete(req.params.id);
    req.flash('success', 'Product deleted.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete product.');
  }
  res.redirect('/admin/products');
});

// ---------- PRODUCTS: TOGGLE ACTIVE/HIDDEN ----------
router.post('/products/:id/toggle', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (product) {
      await Product.toggleActive(req.params.id, product.is_active ? 0 : 1);
    }
  } catch (err) {
    console.error(err);
  }
  res.redirect('/admin/products');
});

// ---------- GALLERY: LIST ----------
router.get('/gallery', async (req, res) => {
  try {
    const galleryImages = await Gallery.getAll();
    res.render('admin/gallery', { title: 'Manage Gallery', galleryImages });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load gallery.');
    res.render('admin/gallery', { title: 'Manage Gallery', galleryImages: [] });
  }
});

// ---------- GALLERY: UPLOAD NEW IMAGE ----------
router.post('/gallery/new', uploadGallery.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please choose an image to upload.');
      return res.redirect('/admin/gallery');
    }

    await optimizeImage(req.file.path);

    await Gallery.create({
      title: req.body.title || '',
      image_path: `/uploads/gallery/${req.file.filename}`,
      sort_order: req.body.sort_order ? parseInt(req.body.sort_order, 10) : 0,
    });

    req.flash('success', 'Image added to gallery.');
    res.redirect('/admin/gallery');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not upload image. ' + (err.message || ''));
    res.redirect('/admin/gallery');
  }
});

// ---------- GALLERY: DELETE ----------
router.post('/gallery/:id/delete', async (req, res) => {
  try {
    await Gallery.delete(req.params.id);
    req.flash('success', 'Image removed from gallery.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not delete image.');
  }
  res.redirect('/admin/gallery');
});

// ---------- INQUIRIES: LIST ----------
router.get('/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.getAll();
    res.render('admin/inquiries', { title: 'Custom Printing Inquiries', inquiries });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load inquiries.');
    res.render('admin/inquiries', { title: 'Custom Printing Inquiries', inquiries: [] });
  }
});

// ---------- INQUIRIES: UPDATE STATUS ----------
router.post('/inquiries/:id/status', async (req, res) => {
  try {
    await Inquiry.updateStatus(req.params.id, req.body.status);
  } catch (err) {
    console.error(err);
  }
  res.redirect('/admin/inquiries');
});

// ---------- INQUIRIES: DELETE ----------
router.post('/inquiries/:id/delete', async (req, res) => {
  try {
    await Inquiry.delete(req.params.id);
    req.flash('success', 'Inquiry deleted.');
  } catch (err) {
    console.error(err);
  }
  res.redirect('/admin/inquiries');
});

// ---------- SETTINGS: VIEW + UPDATE ----------
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.getAll();
    res.render('admin/settings', { title: 'Site Settings', settings });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not load settings.');
    res.render('admin/settings', { title: 'Site Settings', settings: {} });
  }
});

router.post('/settings', async (req, res) => {
  try {
    await Settings.setMany(req.body);
    req.flash('success', 'Settings updated successfully.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not update settings.');
  }
  res.redirect('/admin/settings');
});

// ---------- CHANGE PASSWORD ----------
router.get('/change-password', (req, res) => {
  res.render('admin/change-password', { title: 'Change Password' });
});

router.post('/change-password', async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const admin = await Admin.findByUsername(req.session.adminUsername);

    const valid = await Admin.verifyPassword(current_password, admin.password_hash);
    if (!valid) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/admin/change-password');
    }

    if (new_password.length < 8) {
      req.flash('error', 'New password must be at least 8 characters.');
      return res.redirect('/admin/change-password');
    }

    if (new_password !== confirm_password) {
      req.flash('error', 'New password and confirmation do not match.');
      return res.redirect('/admin/change-password');
    }

    await Admin.updatePassword(admin.id, new_password);
    req.flash('success', 'Password changed successfully.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not change password.');
    res.redirect('/admin/change-password');
  }
});

module.exports = router;
