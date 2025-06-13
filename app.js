require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== Route Imports ==========
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// ========== Middleware ==========
const authMiddleware = require('./middleware/authMiddleware');

// ========== View Engine Setup ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== Middleware Setup ==========
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'feedback-system-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true only if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

app.use(flash());

// Share flash and user session data with all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error = req.flash('error')[0] || null;
  res.locals.success = req.flash('success')[0] || null;
  next();
});

// ========== Route Handlers ==========

// Landing page

app.get('/', (req, res) => {
  res.render('pages/landing');
});


// Auth routes (login, register, etc.)
app.use('/', authRoutes);

// Admin routes
app.use('/admin', authMiddleware.isAdmin, adminRoutes);

// User routes
app.use('/user', authMiddleware.requireAuth, userRoutes);

// ========== Error Handling ==========

// 404 Page
app.use((req, res) => {
  res.status(404).render('pages/landing');
});

// 500 Error Page
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/login', { message: 'Internal Server Error' });
});
app.use((req, res, next) => {
  console.log('🧠 Session:', req.session.user);
  next();
});
// ========== Start Server ==========
app.listen(PORT, () => {
  console.log(`✅ Feedback System running at http://localhost:${PORT}`);
});
