const bcrypt = require('bcrypt');
const db = require('../config/db');

// Render login page
const getLogin = (req, res) => {
  res.render('pages/login', {
    message: req.flash('error')[0] || null,
  });
};
const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Admin login
    if (email === adminEmail) {
      if (password === adminPassword) {
        req.session.user = {
          id: 'admin',
          email: adminEmail,
          name: 'Admin',
          role: 'admin',
        };
        req.session.isLoggedIn = true;
        req.flash('success', 'Welcome Admin!');
        return res.redirect('/admin/landing_admin');
      } else {
        req.flash('error', 'Invalid admin credentials.');
        return res.redirect('/login');
      }
    }

    // Student login
    const student = await db.oneOrNone(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (!student || !(await bcrypt.compare(password, student.password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/login');
    }

    req.session.user = {
      id: student.id,
      email: student.email,
      name: `${student.first_name} ${student.last_name}`,
      role: student.role
    };
    req.session.isLoggedIn = true;
    req.flash('success', 'Login successful');
    res.redirect('/user/home');

  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Something went wrong during login');
    res.redirect('/login');
  }
};

// Render register page
const getRegister = (req, res) => {
  res.render('pages/register', { formData: req.body || {} });
};

// Handle registration POST
const postRegister = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, role } = req.body;

  try {
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.render('pages/register', {
        formData: { firstName, lastName, email },
        errors: ['Passwords do not match']
      });
    }

    const existingUser = await db.oneOrNone(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser) {
      req.flash('error', 'Email already registered');
      return res.render('pages/register', {
        formData: { firstName, lastName, email },
        errors: ['Email already in use']
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.none(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [firstName, lastName, email, hashedPassword, role || 'student']
    );

    req.flash('success', 'Registration successful. Please log in.');
    res.redirect('/login');

  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error', 'Registration failed. Please try again.');
    res.render('pages/register', {
      formData: { firstName, lastName, email },
      errors: ['Registration failed']
    });
  }
};

const getResetPassword = (req, res) => {
  res.render('pages/reset-password');
};

const postResetPassword = (req, res) => {
  req.flash('info', 'Password reset feature coming soon.');
  res.redirect('/login');
};

const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  getResetPassword,
  postResetPassword,
  logout
};
