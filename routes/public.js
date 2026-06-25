// routes/public.js
// All customer-facing pages: Home, About, Services, Product Gallery,
// Custom Printing (inquiry form), Contact Us.

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const Product = require('../models/Product');
const Gallery = require('../models/Gallery');
const Settings = require('../models/Settings');
const Inquiry = require('../models/Inquiry');
const { uploadGallery: uploadInquiryRef, optimizeImage } = require('../middleware/upload');

// Settings are needed on every public page (header/footer/contact info),
// so we load them once here and attach to res.locals.
router.use(async (req, res, next) => {
  try {
    res.locals.settings = await Settings.getAll();
  } catch (err) {
    res.locals.settings = {};
  }
  next();
});

// ---------- HOME ----------
router.get('/', async (req, res) => {
  try {
    const allProducts = await Product.getAllActive();
    const featured = allProducts.slice(0, 4);
    res.render('public/home', {
      title: `${res.locals.settings.business_name || 'Chari Fashion'} — Custom DTF T-Shirt Printing`,
      metaDescription: 'Custom DTF t-shirt printing in Sri Lanka. Send your design, choose your shirt, we print and deliver.',
      activePage: 'home',
      featured,
    });
  } catch (err) {
    console.error(err);
    res.render('public/home', {
      title: 'Chari Fashion',
      metaDescription: 'Custom DTF t-shirt printing.',
      activePage: 'home',
      featured: [],
    });
  }
});

// ---------- ABOUT ----------
router.get('/about', (req, res) => {
  res.render('public/about', {
    title: `About Us — ${res.locals.settings.business_name || 'Chari Fashion'}`,
    metaDescription: 'Learn about Chari Fashion, our DTF printing process, and what makes our prints last.',
    activePage: 'about',
  });
});

// ---------- SERVICES ----------
router.get('/services', (req, res) => {
  res.render('public/services', {
    title: `Services — ${res.locals.settings.business_name || 'Chari Fashion'}`,
    metaDescription: 'DTF printing services for individuals, teams, events, and businesses.',
    activePage: 'services',
  });
});

// ---------- PRODUCT GALLERY ----------
router.get('/gallery', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const products = await Product.getAllActive(category);
    const categories = await Product.getCategories();
    const galleryImages = await Gallery.getAll();
    res.render('public/gallery', {
      title: `Product Gallery — ${res.locals.settings.business_name || 'Chari Fashion'}`,
      metaDescription: 'Browse our t-shirt designs, finished prints, and pricing.',
      activePage: 'gallery',
      products,
      categories,
      activeCategory: category,
      galleryImages,
    });
  } catch (err) {
    console.error(err);
    res.render('public/gallery', {
      title: 'Product Gallery',
      metaDescription: 'Browse our t-shirt designs.',
      activePage: 'gallery',
      products: [],
      categories: [],
      activeCategory: 'all',
      galleryImages: [],
    });
  }
});

// ---------- CUSTOM PRINTING (inquiry form) ----------
router.get('/custom-printing', (req, res) => {
  res.render('public/custom-printing', {
    title: `Custom Printing — ${res.locals.settings.business_name || 'Chari Fashion'}`,
    metaDescription: 'Submit your custom DTF printing request — send your design and get a quote.',
    activePage: 'custom-printing',
    success: req.query.success === '1',
  });
});

router.post('/custom-printing', uploadInquiryRef.single('reference_image'), async (req, res) => {
  try {
    const { name, phone, email, garment_type, quantity, details } = req.body;

    if (!name || !phone) {
      return res.render('public/custom-printing', {
        title: 'Custom Printing',
        metaDescription: 'Submit your custom DTF printing request.',
        activePage: 'custom-printing',
        success: false,
        error: 'Name and phone number are required.',
      });
    }

    let imagePath = null;
    if (req.file) {
      await optimizeImage(req.file.path);
      imagePath = `/uploads/gallery/${req.file.filename}`;
    }

    await Inquiry.create({
      name,
      phone,
      email: email || null,
      garment_type: garment_type || null,
      quantity: quantity ? parseInt(quantity, 10) : null,
      details: details || null,
      reference_image_path: imagePath,
    });

    res.redirect('/custom-printing?success=1');
  } catch (err) {
    console.error(err);
    res.render('public/custom-printing', {
      title: 'Custom Printing',
      metaDescription: 'Submit your custom DTF printing request.',
      activePage: 'custom-printing',
      success: false,
      error: 'Something went wrong submitting your request. Please try again or contact us directly on WhatsApp.',
    });
  }
});

// ---------- CONTACT US ----------
router.get('/contact', (req, res) => {
  res.render('public/contact', {
    title: `Contact Us — ${res.locals.settings.business_name || 'Chari Fashion'}`,
    metaDescription: 'Get in touch with Chari Fashion via phone, WhatsApp, or social media.',
    activePage: 'contact',
  });
});

// ---------- SITEMAP (SEO) ----------
router.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const pages = ['', '/about', '/services', '/gallery', '/custom-printing', '/contact'];
  const urls = pages.map(p => `
  <url>
    <loc>${base}${p}</loc>
    <changefreq>weekly</changefreq>
  </url>`).join('');

  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`);
});

module.exports = router;
